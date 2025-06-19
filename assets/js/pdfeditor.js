pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
window.jspdf = window.jspdf || {};

let currentPage = 1;
let pdfDoc = null;
let pageTexts = {};
let scale = 1.5;
let isRemoveMode = false;

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
    
    // Restore saved texts for this page
    if (pageTexts[pageNumber]) {
        pageTexts[pageNumber].forEach(textData => {
            addTextToOverlay(textData.x, textData.y, textData.text);
        });
    }
}

function toggleRemoveMode() {
    isRemoveMode = !isRemoveMode;
    const removeBtn = document.getElementById('removeText');
    const textInputs = document.querySelectorAll('.text-input');
    
    if (isRemoveMode) {
        removeBtn.style.background = '#ff4444';
        removeBtn.textContent = 'Remove Text: On';
        textInputs.forEach(input => {
            input.classList.add('remove-mode');
            input.addEventListener('click', removeText);
        });
    } else {
        removeBtn.style.background = '';
        removeBtn.textContent = 'Remove Text: Off';
        textInputs.forEach(input => {
            input.classList.remove('remove-mode');
            input.removeEventListener('click', removeText);
        });
    }
}

function handleOverlayClick(e) {
    if (e.target === textOverlay && !isRemoveMode) {
        addTextToOverlay(e.offsetX, e.offsetY, '');
    }
}

function removeText(e) {
    if (isRemoveMode) {
        e.target.parentElement.remove();
        // Update stored texts for the current page
        saveCurrentPageTexts();
    }
}

function addTextToOverlay(x, y, text = '') {
    if (isRemoveMode) return;
    
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;
    
    const input = document.createElement('textarea');
    input.className = 'text-input';
    input.value = text;
    input.rows = 1;
    input.style.fontSize = `${document.getElementById('fontSize').value}px`;
    input.style.fontFamily = document.getElementById('fontFamily').value;
    
    // Auto-resize functionality
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        this.style.width = Math.max(150, this.scrollWidth) + 'px';
    });
    
    // Update font size when changed
    document.getElementById('fontSize').addEventListener('change', function() {
        const size = this.value;
        document.querySelectorAll('.text-input').forEach(input => {
            input.style.fontSize = `${size}px`;
        });
    });

    // Update font family when changed
    document.getElementById('fontFamily').addEventListener('change', function() {
        const font = this.value;
        document.querySelectorAll('.text-input').forEach(input => {
            input.style.fontFamily = font;
        });
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = () => container.remove();
    
    container.appendChild(input);
    container.appendChild(deleteBtn);
    document.getElementById('textOverlay').appendChild(container);
    
    if (!text) {
        input.focus();
    }
    
    // Save text position and content
    input.onchange = () => {
        if (!pageTexts[currentPage]) {
            pageTexts[currentPage] = [];
        }
        pageTexts[currentPage].push({
            x: parseInt(container.style.left),
            y: parseInt(container.style.top),
            text: input.value
        });
    };
    
    // Add remove mode handling for new text inputs
    if (isRemoveMode) {
        input.classList.add('remove-mode');
        input.addEventListener('click', removeText);
    }
}

async function exportPdf() {
    const container = document.querySelector('.pdf-container');
    
    // Temporarily adjust text inputs for export
    const textInputs = document.querySelectorAll('.text-input');
    const originalStyles = [];
    
    textInputs.forEach(input => {
        originalStyles.push({
            border: input.style.border,
            outline: input.style.outline,
            height: input.style.height,
            width: input.style.width
        });
        
        // Adjust size to fit content
        input.style.height = 'auto';
        input.style.width = 'auto';
        input.style.border = 'none';
        input.style.outline = 'none';
        input.style.minWidth = '0';
        input.style.minHeight = '0';
    });
    
    // Hide delete buttons during export
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => btn.style.display = 'none');
    
    try {
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: null,
            onclone: function(clonedDoc) {
                // Ensure text is properly sized in the clone
                clonedDoc.querySelectorAll('.text-input').forEach(input => {
                    input.style.height = input.scrollHeight + 'px';
                    input.style.width = input.scrollWidth + 'px';
                });
            }
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('edited-document.pdf');
    } finally {
        // Restore original styles
        textInputs.forEach((input, index) => {
            Object.assign(input.style, originalStyles[index]);
        });
        
        // Restore delete buttons
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

function saveCurrentPageTexts() {
    const texts = [];
    document.querySelectorAll('.text-input').forEach(input => {
        const container = input.parentElement;
        texts.push({
            x: parseInt(container.style.left),
            y: parseInt(container.style.top),
            text: input.value
        });
    });
    pageTexts[currentPage] = texts;
}
