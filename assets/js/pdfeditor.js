pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
window.jspdf = window.jspdf || {};

let currentPage = 1;
let pdfDoc = null;
let pageTexts = {};
let scale = 1.5;
let isRemoveMode = false;
let signatureImage = null;

// Initialize text overlay click handler
document.addEventListener('DOMContentLoaded', function() {
    const textOverlay = document.getElementById('textOverlay');
    textOverlay.style.pointerEvents = 'all'; // Enable clicking by default
    textOverlay.addEventListener('click', handleOverlayClick);
});

// Event listeners
document.getElementById('pdfFile').addEventListener('change', loadPdf);
document.getElementById('removeText').addEventListener('click', toggleRemoveMode);
document.getElementById('exportPdf').addEventListener('click', exportPdf);
document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
document.getElementById('nextPage').addEventListener('click', () => changePage(1));
document.getElementById('signatureFile').addEventListener('change', handleSignatureUpload);
document.getElementById('addSignature').addEventListener('click', addSignature);

async function loadPdf(event) {
    const file = event.target.files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
    document.getElementById('totalPages').textContent = pdfDoc.numPages;
    currentPage = 1;
    pageTexts = {};
    renderPage(currentPage);
}

async function renderPage(pageNumber) {
    const page = await pdfDoc.getPage(pageNumber);
    const canvas = document.getElementById('pdfViewer');
    const context = canvas.getContext('2d');
    
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;

    document.getElementById('currentPage').textContent = pageNumber;
    
    // Clear previous text overlays
    const textOverlay = document.getElementById('textOverlay');
    textOverlay.innerHTML = '';
    
    // Restore saved texts and signatures for this page
    if (pageTexts[pageNumber]) {
        pageTexts[pageNumber].forEach(item => {
            if (item.type === 'signature') {
                const container = document.createElement('div');
                container.className = 'signature-input';
                container.style.position = 'absolute';
                container.style.left = `${item.x}px`;
                container.style.top = `${item.y}px`;
                
                const img = document.createElement('img');
                img.src = item.signature;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.onclick = () => container.remove();
                
                container.appendChild(img);
                container.appendChild(deleteBtn);
                document.getElementById('textOverlay').appendChild(container);
                makeDraggable(container);
            } else {
                addTextToOverlay(item.x, item.y, item.text);
            }
        });
    }
}

async function renderPage(pageNumber) {
    const page = await pdfDoc.getPage(pageNumber);
    const canvas = document.getElementById('pdfViewer');
    const context = canvas.getContext('2d');
    
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;

    document.getElementById('currentPage').textContent = pageNumber;
    
    // Clear previous text overlays
    const textOverlay = document.getElementById('textOverlay');
    textOverlay.innerHTML = '';
    
    // Restore saved texts and signatures for this page
    if (pageTexts[pageNumber]) {
        pageTexts[pageNumber].forEach(item => {
            if (item.type === 'signature') {
                const container = document.createElement('div');
                container.className = 'signature-input';
                container.style.position = 'absolute';
                container.style.left = `${item.x}px`;
                container.style.top = `${item.y}px`;
                
                const img = document.createElement('img');
                img.src = item.signature;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.onclick = () => container.remove();
                
                container.appendChild(img);
                container.appendChild(deleteBtn);
                document.getElementById('textOverlay').appendChild(container);
                makeDraggable(container);
            } else {
                addTextToOverlay(item.x, item.y, item.text);
            }
        });
    }
}

function toggleRemoveMode() {
    isRemoveMode = !isRemoveMode;
    const removeBtn = document.getElementById('removeText');
    const textContainers = document.querySelectorAll('.text-container');
    const signatureInputs = document.querySelectorAll('.signature-input');
    
    if (isRemoveMode) {
        removeBtn.style.background = '#ff4444';
        removeBtn.textContent = 'Remove Items: On';
        textContainers.forEach(container => {
            container.classList.add('remove-mode');
            container.addEventListener('click', removeItem);
            // Remove the input class since we're styling the container now
            container.querySelector('.text-input').classList.remove('remove-mode');
        });
        signatureInputs.forEach(sig => {
            sig.classList.add('remove-mode');
            sig.addEventListener('click', removeItem);
        });
    } else {
        removeBtn.style.background = '';
        removeBtn.textContent = 'Remove Items: Off';
        textContainers.forEach(container => {
            container.classList.remove('remove-mode');
            container.removeEventListener('click', removeItem);
            container.querySelector('.text-input').classList.remove('remove-mode');
        });
        signatureInputs.forEach(sig => {
            sig.classList.remove('remove-mode');
            sig.removeEventListener('click', removeItem);
        });
    }
}

function handleOverlayClick(e) {
    if (e.target === textOverlay && !isRemoveMode) {
        addTextToOverlay(e.offsetX, e.offsetY, '');
    }
}

function removeItem(e) {
    if (isRemoveMode) {
        const elementToRemove = e.target.closest('.text-container, .signature-input');
        if (elementToRemove) {
            elementToRemove.remove();
            saveCurrentPageTexts();
        }
    }
}

function addTextToOverlay(x, y, text = '') {
    if (isRemoveMode) return;
    
    const container = document.createElement('div');
    container.className = 'text-container';
    container.style.position = 'absolute';
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;
    
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    
    const input = document.createElement('textarea');
    input.className = 'text-input';
    input.value = text;
    input.rows = 1;
    input.style.fontSize = `${document.getElementById('fontSize').value}px`;
    input.style.fontFamily = document.getElementById('fontFamily').value;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = () => container.remove();
    
    container.appendChild(dragHandle);
    container.appendChild(input);
    container.appendChild(deleteBtn);
    document.getElementById('textOverlay').appendChild(container);
    
    // Make the container draggable
    makeDraggable(container);
    
    if (!text) {
        input.focus();
    }
    
    // Auto-resize functionality
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        this.style.width = Math.max(150, this.scrollWidth) + 'px';
    });
    
    // Save text position and content
    input.onchange = () => saveCurrentPageTexts();
    
    // Add remove mode handling for new text inputs
    if (isRemoveMode) {
        input.classList.add('remove-mode');
        container.addEventListener('click', removeItem);
    }
}

// Modify saveCurrentPageTexts function to handle the new container structure
function saveCurrentPageTexts() {
    const texts = [];
    document.querySelectorAll('.text-container').forEach(container => {
        texts.push({
            x: parseInt(container.style.left),
            y: parseInt(container.style.top),
            text: container.querySelector('.text-input').value,
            type: 'text'
        });
    });
    
    document.querySelectorAll('.signature-input').forEach(container => {
        texts.push({
            x: parseInt(container.style.left),
            y: parseInt(container.style.top),
            signature: container.querySelector('img').src,
            type: 'signature'
        });
    });
    
    pageTexts[currentPage] = texts;
}

function handleSignatureUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                processSignature(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function processSignature(img) {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert to black and white and remove background
    const threshold = 150; // Adjust this value to control sensitivity
    for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // Apply threshold
        if (brightness > threshold) {
            // Make pixel transparent if it's bright (background)
            data[i + 3] = 0;
        } else {
            // Make dark pixels black
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
        }
    }
    
    // Put processed image data back
    ctx.putImageData(imageData, 0, 0);
    
    // Trim empty space
    const trimmed = trimCanvas(canvas);
    
    // Save processed signature
    signatureImage = trimmed.toDataURL('image/png');
}

function trimCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const l = pixels.data.length;
    const bound = {
        top: null,
        left: null,
        right: null,
        bottom: null
    };
    
    // Get bounds
    for (let i = 0; i < l; i += 4) {
        if (pixels.data[i + 3] !== 0) {
            const x = (i / 4) % canvas.width;
            const y = ~~((i / 4) / canvas.width);

            if (bound.top === null) bound.top = y;
            if (bound.left === null) bound.left = x;
            else if (x < bound.left) bound.left = x;
            
            if (bound.right === null) bound.right = x;
            else if (bound.right < x) bound.right = x;
            
            if (bound.bottom === null) bound.bottom = y;
            else if (bound.bottom < y) bound.bottom = y;
        }
    }
    
    // Create trimmed canvas
    const trimmedCanvas = document.createElement('canvas');
    const trimmedCtx = trimmedCanvas.getContext('2d');
    
    const trimmedWidth = bound.right - bound.left + 1;
    const trimmedHeight = bound.bottom - bound.top + 1;
    
    trimmedCanvas.width = trimmedWidth;
    trimmedCanvas.height = trimmedHeight;
    
    trimmedCtx.drawImage(
        canvas,
        bound.left, bound.top, trimmedWidth, trimmedHeight,
        0, 0, trimmedWidth, trimmedHeight
    );
    
    return trimmedCanvas;
}

// Modify the saveCurrentPageTexts function to include signatures
function saveCurrentPageTexts() {
    const texts = [];
    document.querySelectorAll('.text-container').forEach(container => {
        texts.push({
            x: parseInt(container.style.left),
            y: parseInt(container.style.top),
            text: container.querySelector('.text-input').value,
            type: 'text'
        });
    });
    
    document.querySelectorAll('.signature-input').forEach(container => {
        texts.push({
            x: parseInt(container.style.left),
            y: parseInt(container.style.top),
            signature: container.querySelector('img').src,
            type: 'signature'
        });
    });
    
    pageTexts[currentPage] = texts;
}

async function exportPdf() {
    // Save current page state
    const currentPageNumber = currentPage;
    saveCurrentPageTexts();
    
    // Create PDF with first page dimensions
    const container = document.querySelector('.pdf-container');
    const firstPage = await processPdfPage(1);
    
    const pdf = new jspdf.jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [firstPage.width, firstPage.height]
    });
    
    // Add first page
    pdf.addImage(firstPage.imgData, 'PNG', 0, 0, firstPage.width, firstPage.height);
    
    // Process remaining pages
    for (let i = 2; i <= pdfDoc.numPages; i++) {
        const pageData = await processPdfPage(i);
        pdf.addPage([pageData.width, pageData.height]);
        pdf.addImage(pageData.imgData, 'PNG', 0, 0, pageData.width, pageData.height);
    }
    
    // Restore original page
    currentPage = currentPageNumber;
    renderPage(currentPage);
    
    pdf.save('edited-document.pdf');
}

async function processPdfPage(pageNum) {
    await renderPage(pageNum);
    
    const container = document.querySelector('.pdf-container');
    
    // Temporarily adjust text inputs and hide UI elements for export
    const textInputs = document.querySelectorAll('.text-input');
    const dragHandles = document.querySelectorAll('.drag-handle');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const originalStyles = [];
    
    // Hide drag handles and delete buttons during export
    dragHandles.forEach(handle => handle.style.display = 'none');
    deleteButtons.forEach(btn => btn.style.display = 'none');
    
    textInputs.forEach(input => {
        originalStyles.push({
            border: input.style.border,
            outline: input.style.outline,
            height: input.style.height,
            width: input.style.width
        });
        
        input.style.height = 'auto';
        input.style.width = 'auto';
        input.style.border = 'none';
        input.style.outline = 'none';
        input.style.minWidth = '0';
        input.style.minHeight = '0';
    });
    
    try {
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: null,
            onclone: function(clonedDoc) {
                clonedDoc.querySelectorAll('.text-input').forEach(input => {
                    input.style.height = input.scrollHeight + 'px';
                    input.style.width = input.scrollWidth + 'px';
                });
            }
        });

        return {
            imgData: canvas.toDataURL('image/png', 1.0),
            width: canvas.width,
            height: canvas.height
        };
    } finally {
        // Restore original styles and UI elements
        textInputs.forEach((input, index) => {
            Object.assign(input.style, originalStyles[index]);
        });
        
        // Show drag handles and delete buttons again
        dragHandles.forEach(handle => handle.style.display = 'block');
        deleteButtons.forEach(btn => btn.style.display = '');
    }
}

function changePage(offset) {
    const newPage = currentPage + offset;
    if (newPage >= 1 && newPage <= pdfDoc.numPages) {
        // Save current page texts before changing
        saveCurrentPageTexts();
        currentPage = newPage;
        renderPage(currentPage);
    }
}

function addSignature() {
    if (!signatureImage) {
        alert('Please upload a signature image first');
        return;
    }

    const container = document.createElement('div');
    container.className = 'signature-input';
    container.style.position = 'absolute';
    container.style.left = '50px';
    container.style.top = '50px';

    const img = document.createElement('img');
    img.src = signatureImage;
    img.style.pointerEvents = 'none'; // Prevent img from blocking click events
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        container.remove();
        saveCurrentPageTexts();
    };

    container.appendChild(img);
    container.appendChild(deleteBtn);
    document.getElementById('textOverlay').appendChild(container);

    // Make signature draggable
    makeDraggable(container);

    // Save the signature position
    if (!pageTexts[currentPage]) {
        pageTexts[currentPage] = [];
    }
    pageTexts[currentPage].push({
        x: parseInt(container.style.left),
        y: parseInt(container.style.top),
        signature: signatureImage,
        type: 'signature'
    });
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const dragHandle = element.querySelector('.drag-handle');

    function dragMouseDown(e) {
        e.preventDefault();
        // Get the clicked element
        const target = e.target;
        
        // Allow dragging if:
        // 1. Clicking the drag handle (for text containers)
        // 2. Clicking the signature image or container
        // 3. Not clicking the delete button
        if (!target.classList.contains('delete-btn') && 
            (target.classList.contains('drag-handle') || 
             element.classList.contains('signature-input') ||
             target.matches('.signature-input img'))) {
            
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        saveCurrentPageTexts();
    }

    // For text containers, only drag with handle
    if (dragHandle) {
        dragHandle.onmousedown = dragMouseDown;
    }
    
    // For signatures, make the whole container draggable
    if (element.classList.contains('signature-input')) {
        element.onmousedown = dragMouseDown;
    }
}
