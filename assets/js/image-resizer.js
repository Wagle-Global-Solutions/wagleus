document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const processButton = document.getElementById('processButton');
    const downloadButton = document.getElementById('downloadButton');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');

    const resizeMode = document.getElementById('resizeMode');
    const maxSizeGroup = document.getElementById('maxSizeGroup');
    const percentageGroup = document.getElementById('percentageGroup');
    const customDimensionsGroup = document.getElementById('customDimensionsGroup');

    resizeMode.addEventListener('change', () => {
        maxSizeGroup.style.display = resizeMode.value === 'maxSize' ? 'block' : 'none';
        percentageGroup.style.display = resizeMode.value === 'percentage' ? 'block' : 'none';
        customDimensionsGroup.style.display = resizeMode.value === 'custom' ? 'block' : 'none';
    });

    const processingMode = document.getElementById('processingMode');
    const resizeSettings = document.getElementById('resizeSettings');
    const compressionSettings = document.getElementById('compressionSettings');

    processingMode.addEventListener('change', () => {
        resizeSettings.style.display = processingMode.value !== 'compress' ? 'block' : 'none';
        compressionSettings.style.display = processingMode.value !== 'resize' ? 'block' : 'none';
    });

    let files = [];
    let processedImageData = new Map(); // Store processed images in a Map

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
        // If quality is below 50%, show a warning about potential quality loss
        if (parseInt(e.target.value) < 50) {
            qualityValue.classList.add('text-warning');
            qualityValue.title = "Warning: Low quality may result in visible image degradation";
        } else {
            qualityValue.classList.remove('text-warning');
            qualityValue.title = "";
        }
    });

    function handleFiles(newFiles) {
        const imageFiles = Array.from(newFiles).filter(file => file.type.startsWith('image/'));
        files.push(...imageFiles);
        updatePreviews();
        processButton.disabled = files.length === 0;
    }

    function updatePreviews() {
        previewContainer.innerHTML = '';
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = createPreviewElement(e.target.result, file, index);
                previewContainer.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    }

    function calculateAspectRatio(width, height) {
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(width, height);
        return `${width/divisor}:${height/divisor}`;
    }

    function createPreviewElement(src, file, index) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            <div class="preview-image-container">
                <img src="${src}" alt="Preview" data-original="${src}">
            </div>
            <div class="preview-info">
                <div class="file-name">${file.name}</div>
                <div class="file-details">
                    <span>Original: ${formatFileSize(file.size)}</span>
                    <span class="dimensions">Loading dimensions...</span>
                    <span class="ratio">Loading ratio...</span>
                </div>
            </div>
            <button class="remove-file" data-index="${index}">&times;</button>
        `;

        // Load and display original dimensions and ratio
        const img = new Image();
        img.onload = () => {
            const ratio = calculateAspectRatio(img.width, img.height);
            div.querySelector('.dimensions').textContent = `${img.width} × ${img.height}px`;
            div.querySelector('.ratio').textContent = `Aspect Ratio: ${ratio}`;
        };
        img.src = src;

        div.querySelector('.remove-file').addEventListener('click', () => {
            files.splice(index, 1);
            updatePreviews();
            processButton.disabled = files.length === 0;
        });

        return div;
    }

    async function updatePreviewWithProcessed(previewItem, processedSrc, originalSize, processedSize, newDimensions, newFileName) {
        const img = previewItem.querySelector('img');
        const info = previewItem.querySelector('.preview-info');
        
        // Calculate original and new ratios
        const originalImg = new Image();
        originalImg.onload = () => {
            const originalRatio = calculateAspectRatio(originalImg.width, originalImg.height);
            const newRatio = calculateAspectRatio(newDimensions.width, newDimensions.height);
            
            // Update file information
            info.innerHTML = `
                <div class="file-name">${newFileName}</div>
                <div class="file-details">
                    <span>Original: ${formatFileSize(originalSize)} (${originalImg.width} × ${originalImg.height}px)</span>
                    <span>Original Ratio: ${originalRatio}</span>
                    <span>Processed: ${formatFileSize(processedSize)} (${newDimensions.width} × ${newDimensions.height}px)</span>
                    <span>New Ratio: ${newRatio}</span>
                </div>
            `;
        };
        originalImg.src = img.dataset.original;

        // Update image
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = processedSrc;
            img.style.opacity = '1';
        }, 200);
    }

    processButton.addEventListener('click', async () => {
        const format = document.getElementById('outputFormat').value;
        const quality = parseInt(qualitySlider.value) / 100;

        progressBar.style.display = 'block';
        progressFill.style.width = '0%';
        processButton.disabled = true;
        downloadButton.style.display = 'none';
        processedImageData.clear(); // Clear previous processed images
        
        try {
            // Process images in smaller batches
            const batchSize = 3;
            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, Math.min(i + batchSize, files.length));
                const batchPromises = batch.map(async (file, batchIndex) => {
                    const processed = await processImage(file);
                    const index = i + batchIndex;
                    
                    // Store processed image data
                    processedImageData.set(index, {
                        data: processed.dataUrl,
                        name: file.name.split('.')[0],
                        size: Math.round((processed.dataUrl.length * 3) / 4)
                    });

                    // Update preview with correct extension
                    const previewItem = previewContainer.children[index];
                    let extension;
                    if (format === 'same') {
                        extension = file.name.split('.').pop();
                    } else {
                        extension = format === 'jpeg' ? 'jpg' : format;
                    }
                    const newFileName = `${file.name.split('.')[0]}.${extension}`;
                    
                    await updatePreviewWithProcessed(
                        previewItem,
                        processed.dataUrl,
                        file.size,
                        processedImageData.get(index).size,
                        processed.dimensions,
                        newFileName
                    );
                });

                await Promise.all(batchPromises);
                progressFill.style.width = `${((i + batch.length) / files.length) * 100}%`;
            }

            downloadButton.style.display = 'inline-block';
            downloadButton.onclick = handleDownload;

        } catch (error) {
            console.error('Processing error:', error);
            alert('An error occurred while processing images. Please try again.');
        } finally {
            progressBar.style.display = 'none';
            processButton.disabled = false;
        }
    });

    const handleDownload = async () => {
        try {
            const format = document.getElementById('outputFormat').value;
            progressBar.style.display = 'block';
            progressFill.style.width = '0%';
            downloadButton.disabled = true;

            const zip = new JSZip();
            const totalImages = files.length;
            const usedNames = new Set(); // Track used filenames

            console.log('Starting download process...', totalImages, 'files to process');

            // Process and add images to zip one by one
            for (let i = 0; i < totalImages; i++) {
                try {
                    const processed = await processImage(files[i]);
                    
                    // Modified extension handling
                    let extension;
                    if (format === 'same') {
                        // Keep the original file extension
                        extension = files[i].name.split('.').pop();
                    } else {
                        extension = format === 'jpeg' ? 'jpg' : format;
                    }

                    let baseName = files[i].name.split('.')[0];
                    let fileName = `${baseName}.${extension}`;
                    let counter = 1;

                    // If filename already exists, add a number
                    while (usedNames.has(fileName)) {
                        fileName = `${baseName}_${counter}.${extension}`;
                        counter++;
                    }
                    usedNames.add(fileName);

                    // Add to zip with unique name
                    const base64Data = processed.dataUrl.split(',')[1];
                    zip.file(fileName, base64Data, { base64: true });

                    // Update progress
                    progressFill.style.width = `${((i + 1) / totalImages * 70)}%`;
                } catch (err) {
                    console.error(`Error processing image ${files[i].name}:`, err);
                }
            }

            // Generate zip with progress tracking
            const content = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            }, metadata => {
                // Last 30% of progress bar for zip generation
                progressFill.style.width = `${70 + (metadata.percent * 0.3)}%`;
            });

            // Download the zip file
            const blob = new Blob([content], { type: 'application/zip' });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `processed_images_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
                progressBar.style.display = 'none';
                downloadButton.disabled = false;
                progressFill.style.width = '0%';
            }, 1500);

        } catch (error) {
            console.error('Download error:', error);
            alert('Error creating download. Please try again.');
            progressBar.style.display = 'none';
            downloadButton.disabled = false;
        }
    };

    async function processImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        let newWidth = img.width;
                        let newHeight = img.height;

                        // Only apply resize if in resize or both mode
                        if (processingMode.value !== 'compress') {
                            switch(resizeMode.value) {
                                case 'maxSize':
                                    const maxSize = parseInt(document.getElementById('maxSize').value) || 1920;
                                    const ratio = img.width / img.height;
                                    
                                    if (Math.max(img.width, img.height) > maxSize) {
                                        if (img.width > img.height) {
                                            newWidth = maxSize;
                                            newHeight = maxSize / ratio;
                                        } else {
                                            newHeight = maxSize;
                                            newWidth = maxSize * ratio;
                                        }
                                    }
                                    break;
                                case 'percentage':
                                    const scale = parseInt(document.getElementById('scalePercentage').value) || 50;
                                    newWidth = (img.width * scale) / 100;
                                    newHeight = (img.height * scale) / 100;
                                    break;
                                case 'custom':
                                    newWidth = parseInt(document.getElementById('width').value) || img.width;
                                    newHeight = parseInt(document.getElementById('height').value) || img.height;
                                    break;
                            }
                        }

                        canvas.width = Math.round(newWidth);
                        canvas.height = Math.round(newHeight);
                        
                        const ctx = canvas.getContext('2d', { alpha: false });
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        // Handle format and quality
                        const format = document.getElementById('outputFormat').value;
                        const mimeType = format === 'same' ? 
                            file.type : // Keep original MIME type
                            `image/${format === 'jpeg' ? 'jpeg' : format}`; // Handle other formats
                        const quality = processingMode.value === 'resize' ? 1 : 
                                      parseInt(document.getElementById('quality').value) / 100;
                        
                        resolve({
                            dataUrl: canvas.toDataURL(mimeType, quality),
                            dimensions: {
                                width: Math.round(newWidth),
                                height: Math.round(newHeight)
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Initialize tooltips after DOM loads
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
