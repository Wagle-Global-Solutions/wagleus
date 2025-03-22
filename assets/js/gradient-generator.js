let currentGradientType = 'linear';
let extendedSupport = false;

const presetGradients = [
    { colors: ['#ff6b6b', '#4ecdc4'], angle: 45 },
    { colors: ['#a8e6cf', '#dcedc1', '#ffd3b6'], angle: 90 },
    { colors: ['#2193b0', '#6dd5ed'], angle: 135 },
    { colors: ['#ee9ca7', '#ffdde1'], angle: 180 },
    { colors: ['#833ab4', '#fd1d1d', '#fcb045'], angle: 225 },
    { colors: ['#56ccf2', '#2f80ed'], angle: 270 }
];

function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getDefaultGradientData() {
    return {
        type: 'linear',
        angle: 90,
        stops: [
            { color: generateRandomColor(), position: 0 },
            { color: generateRandomColor(), position: 100 }
        ]
    };
}

// Add utility functions at the top level
function hexToRGBA(hex) {
    let r = 0, g = 0, b = 0, a = 1;
    if (hex.length === 9) {
        // 8-digit hex with alpha
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
        a = Math.round((parseInt(hex.slice(7, 9), 16) / 255) * 100);
    } else {
        // 6-digit hex
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
        a = 100;
    }
    return [r, g, b, a];
}

function rgbaToHex(r, g, b, a) {
    const alpha = Math.round((a / 100) * 255);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}${alpha.toString(16).padStart(2, '0')}`;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadFromURL(); // Add this line before other initializations
    initializePresets();
    initializeEventListeners();
    updateGradient();
});

// Add these new functions
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const gradientParam = params.get('gradient');
    
    let gradientData = getDefaultGradientData();

    if (gradientParam) {
        try {
            const parsedData = JSON.parse(gradientParam);
            // Merge parsed data with defaults to handle missing properties
            gradientData = {
                type: parsedData.type || gradientData.type,
                angle: parsedData.angle || gradientData.angle,
                stops: parsedData.stops || gradientData.stops
            };
            
            // Validate stops data
            gradientData.stops = gradientData.stops.map(stop => ({
                color: stop.color || generateRandomColor(),
                position: parseInt(stop.position) || 0
            }));
            
        } catch (e) {
            console.warn('Invalid gradient data in URL, using random gradient');
        }
    }

    applyGradientData(gradientData);
}

function applyGradientData(data) {
    // Ensure valid gradient type
    currentGradientType = ['linear', 'radial', 'conic'].includes(data.type) ? data.type : 'linear';
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === currentGradientType);
    });

    // Set angle with validation
    const angleControl = document.getElementById('angleControl');
    const angleValue = document.getElementById('angleValue');
    const validAngle = Math.min(Math.max(parseInt(data.angle) || 90, 0), 360);
    angleControl.value = validAngle;
    angleValue.textContent = validAngle;

    // Clear and recreate color stops
    const colorStopsContainer = document.getElementById('colorStops');
    colorStopsContainer.innerHTML = '';

    // Ensure at least 2 stops
    const stops = data.stops.length >= 2 ? data.stops : [
        { color: generateRandomColor(), position: 0 },
        { color: generateRandomColor(), position: 100 }
    ];

    stops.forEach(stop => {
        const { color, position } = stop;
        const [r, g, b, a] = hexToRGBA(color);
        
        const newStop = document.createElement('div');
        newStop.className = 'color-stop';
        newStop.innerHTML = `
            <div class="color-input-group">
                <input type="color" class="form-control form-control-color color-input" value="${color.slice(0, 7)}">
                <div class="color-values">
                    <input type="text" class="form-control hex-input" value="${color}" pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$" placeholder="Hex">
                    <div class="rgba-group">
                        <input type="number" class="form-control rgba-input" min="0" max="255" value="${r}">
                        <input type="number" class="form-control rgba-input" min="0" max="255" value="${g}">
                        <input type="number" class="form-control rgba-input" min="0" max="255" value="${b}">
                        <input type="number" class="form-control rgba-input" min="0" max="100" value="${a}">
                    </div>
                    <input type="number" class="form-control position-input" min="0" max="100" value="${position}" placeholder="Position %">
                </div>
            </div>
            <button class="btn btn-danger btn-sm remove-stop"><i class="bi bi-trash"></i></button>
        `;

        setupColorInputListeners(newStop);
        colorStopsContainer.appendChild(newStop);
    });

    // Update gradient and URL
    updateGradient();
    updateURL();
}

function initializePresets() {
    const presetsContainer = document.getElementById('presetGradients');
    presetsContainer.innerHTML = ''; // Clear existing presets
    presetGradients.forEach((preset, index) => {
        const presetEl = document.createElement('div');
        presetEl.className = 'preset-gradient';
        // Update gradient string based on current type
        presetEl.style.background = createGradientString(
            preset.colors.map(color => `${color}`), 
            preset.angle
        );
        presetEl.onclick = () => applyPreset(preset);
        presetsContainer.appendChild(presetEl);
    });
}

function applyPreset(preset) {
    const colorStopsContainer = document.getElementById('colorStops');
    colorStopsContainer.innerHTML = '';

    const positions = preset.colors.map((color, index) => {
        return Math.round((index / (preset.colors.length - 1)) * 100);
    });

    preset.colors.forEach((color, index) => {
        const [r, g, b] = hexToRGBA(color);
        
        const newStop = document.createElement('div');
        newStop.className = 'color-stop';
        newStop.innerHTML = `
            <div class="color-input-group">
                <input type="color" class="form-control form-control-color color-input" value="${color}">
                <div class="color-values">
                    <input type="text" class="form-control hex-input" value="${color}ff" pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$" placeholder="Hex">
                    <div class="rgba-group">
                        <input type="number" class="form-control rgba-input" min="0" max="255" value="${r}">
                        <input type="number" class="form-control rgba-input" min="0" max="255" value="${g}">
                        <input type="number" class="form-control rgba-input" min="0" max="255" value="${b}">
                        <input type="number" class="form-control rgba-input" min="0" max="100" value="100">
                    </div>
                    <input type="number" class="form-control position-input" min="0" max="100" value="${positions[index]}" placeholder="Position %">
                </div>
            </div>
            <button class="btn btn-danger btn-sm remove-stop"><i class="bi bi-trash"></i></button>
        `;

        setupColorInputListeners(newStop);
        colorStopsContainer.appendChild(newStop);
    });

    // Set the angle
    const angleControl = document.getElementById('angleControl');
    const angleValue = document.getElementById('angleValue');
    angleControl.value = preset.angle;
    angleValue.textContent = preset.angle;

    updateGradient();
    updateURL();
}

function initializeEventListeners() {
    // Load saved data if exists
    const savedData = localStorage.getItem('gradientData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            applyGradientData(data);
        } catch (e) {
            console.warn('Could not load saved gradient data');
        }
    }

    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            currentGradientType = button.dataset.tab;
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            initializePresets(); // Add this line to refresh presets
            updateGradient();
            updateURL(); // Add this line
        });
    });

    // Angle control
    document.getElementById('angleControl').addEventListener('input', (e) => {
        document.getElementById('angleValue').textContent = e.target.value;
        updateGradient();
        updateURL(); // Add this line
    });

    // Add color stop
    document.getElementById('addColorStop').addEventListener('click', addColorStop);

    // Initial color stop events with URL updates
    document.querySelectorAll('.color-stop').forEach(stop => {
        setupColorInputListeners(stop);
    });

    // Add support toggle handler
    document.getElementById('toggleSupport').addEventListener('click', (e) => {
        extendedSupport = !extendedSupport;
        e.target.classList.toggle('active');
        updateGradient();
    });
}

function createGradientString(colors, angle) {
    // Get the first color for fallback (remove any position info)
    const firstColor = colors[0].split(' ')[0];
    let gradient = '';
    
    const gradientColors = colors.map(color => {
        if (color.includes('#') && color.length === 9) {
            const [r, g, b, a] = hexToRGBA(color);
            const position = color.split(' ')[1] || '';
            return `rgba(${r}, ${g}, ${b}, ${a/100}) ${position}`;
        }
        return color;
    }).join(', ');

    switch(currentGradientType) {
        case 'linear':
            gradient = `linear-gradient(${angle}deg, ${gradientColors})`;
            break;
        case 'radial':
            gradient = `radial-gradient(circle at center, ${gradientColors})`;
            break;
        case 'conic':
            gradient = `conic-gradient(from ${angle}deg, ${gradientColors})`;
            break;
        default:
            gradient = `linear-gradient(${angle}deg, ${gradientColors})`;
    }

    // Return CSS with or without extended support
    if (extendedSupport) {
        return generateExtendedSupport(gradient, firstColor, angle, colors);
    }
    
    // Always include fallback color
    return `/* Fallback for older browsers */\nbackground-color: ${firstColor};\nbackground: ${gradient};`;
}

function generateExtendedSupport(gradient, fallback, angle, colors) {
    let css = `/* Fallback color */\nbackground-color: ${fallback};\n\n`;
    
    if (currentGradientType === 'linear') {
        // Old webkit
        const startColor = colors[0].split(' ')[0];
        const endColor = colors[colors.length - 1].split(' ')[0];
        
        css += `/* Old browsers */\n`;
        css += `background: ${fallback};\n`;
        
        css += `/* FF3.6+ */\n`;
        css += `background: -moz-${gradient};\n`;
        
        css += `/* Chrome,Safari4+ */\n`;
        css += `background: -webkit-gradient(linear, left top, right top, color-stop(0%, ${startColor}), color-stop(100%, ${endColor}));\n`;
        
        css += `/* Chrome10+,Safari5.1+ */\n`;
        css += `background: -webkit-${gradient};\n`;
        
        css += `/* Opera 11.10+ */\n`;
        css += `background: -o-${gradient};\n`;
        
        css += `/* IE10+ */\n`;
        css += `background: -ms-${gradient};\n`;
        
        css += `/* W3C Standard */\n`;
        css += `background: ${gradient};\n`;
        
        css += `/* IE6-9 */\n`;
        css += `filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='${startColor}', endColorstr='${endColor}', GradientType=1);`;
    } else if (currentGradientType === 'radial') {
        css += `/* Modern Browsers */\n`;
        css += `background: ${gradient};\n`;
        
        css += `/* Webkit */\n`;
        css += `background: -webkit-${gradient};\n`;
        
        css += `/* Firefox */\n`;
        css += `background: -moz-${gradient};\n`;
        
        css += `/* Opera */\n`;
        css += `background: -o-${gradient};`;
    } else {
        // Conic gradients (with radial fallback)
        css += `/* Modern Browsers */\n`;
        css += `background: ${gradient};\n\n`;
        
        css += `/* Fallback for browsers that don't support conic gradients */\n`;
        css += `@supports not (background: conic-gradient(#fff, #000)) {\n`;
        css += `  background: radial-gradient(circle at center, ${colors.join(', ')});\n`;
        css += `}`;
    }
    
    return css;
}

function updateGradient() {
    // Get all color stops and sort them by position
    const colorStops = Array.from(document.querySelectorAll('.color-stop'))
        .map(stop => ({
            element: stop,
            hex: stop.querySelector('.hex-input').value,
            position: parseInt(stop.querySelector('.position-input').value)
        }))
        .sort((a, b) => a.position - b.position);

    // Update DOM order to match sorted order
    const container = document.getElementById('colorStops');
    colorStops.forEach(stop => container.appendChild(stop.element));

    // Create gradient string with sorted stops
    const gradientStops = colorStops.map(stop => 
        `${stop.hex.length === 9 ? stop.hex : stop.hex + 'ff'} ${stop.position}%`
    );

    const angle = document.getElementById('angleControl').value;
    
    // Create the basic gradient string for preview
    let previewGradient;
    switch(currentGradientType) {
        case 'linear':
            previewGradient = `linear-gradient(${angle}deg, ${gradientStops.join(', ')})`;
            break;
        case 'radial':
            previewGradient = `radial-gradient(circle at center, ${gradientStops.join(', ')})`;
            break;
        case 'conic':
            previewGradient = `conic-gradient(from ${angle}deg, ${gradientStops.join(', ')})`;
            break;
    }

    // Apply gradient to preview
    const preview = document.getElementById('gradientPreview');
    preview.style.background = previewGradient;

    // Generate and show full CSS code including fallbacks
    const gradientString = createGradientString(gradientStops, angle);
    document.getElementById('cssCode').textContent = gradientString;
}

// Update addColorStop to enforce position constraints
function addColorStop() {
    const colorStopsContainer = document.getElementById('colorStops');
    const existingStops = Array.from(document.querySelectorAll('.color-stop'))
        .map(stop => ({
            color: stop.querySelector('.hex-input').value,
            position: parseInt(stop.querySelector('.position-input').value)
        }))
        .sort((a, b) => a.position - b.position);

    // Find largest gap between stops
    let maxGap = 0;
    let targetPosition = 50;
    
    for (let i = 0; i < existingStops.length - 1; i++) {
        const gap = existingStops[i + 1].position - existingStops[i].position;
        if (gap > maxGap) {
            maxGap = gap;
            // Ensure position is between 0 and 100
            targetPosition = Math.min(100, Math.max(0, 
                Math.round(existingStops[i].position + gap / 2)
            ));
        }
    }

    // Add new stop with interpolated color at target position
    const newColor = interpolateGradientColor(existingStops, targetPosition);
    const [r, g, b, a] = hexToRGBA(newColor);
    
    const newStop = document.createElement('div');
    newStop.className = 'color-stop';
    newStop.innerHTML = `
        <div class="color-input-group">
            <input type="color" class="form-control form-control-color color-input" value="${newColor.slice(0, 7)}">
            <div class="color-values">
                <input type="text" class="form-control hex-input" value="${newColor}" pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$" placeholder="Hex">
                <div class="rgba-group">
                    <input type="number" class="form-control rgba-input" min="0" max="255" value="${r}">
                    <input type="number" class="form-control rgba-input" min="0" max="255" value="${g}">
                    <input type="number" class="form-control rgba-input" min="0" max="255" value="${b}">
                    <input type="number" class="form-control rgba-input" min="0" max="100" value="${a}">
                </div>
                <input type="number" class="form-control position-input" min="0" max="100" value="${targetPosition}" placeholder="Position %">
            </div>
        </div>
        <button class="btn btn-danger btn-sm remove-stop"><i class="bi bi-trash"></i></button>
    `;

    setupColorInputListeners(newStop);
    colorStopsContainer.appendChild(newStop);
    updateGradient();
    updateURL();
}

function interpolateGradientColor(stops, position) {
    if (stops.length < 2) return generateRandomColor();
    
    // Find the two stops we're between
    let leftStop = stops[0];
    let rightStop = stops[stops.length - 1];

    for (let i = 0; i < stops.length - 1; i++) {
        if (stops[i].position <= position && stops[i + 1].position > position) {
            leftStop = stops[i];
            rightStop = stops[i + 1];
            break;
        }
    }

    // Calculate how far between the two stops we are (0 to 1)
    const t = (position - leftStop.position) / (rightStop.position - leftStop.position);
    
    // Get RGBA values for both stops
    const leftColor = hexToRGBA(leftStop.color);
    const rightColor = hexToRGBA(rightStop.color);

    // Interpolate each channel
    const r = Math.round(leftColor[0] + (rightColor[0] - leftColor[0]) * t);
    const g = Math.round(leftColor[1] + (rightColor[1] - leftColor[1]) * t);
    const b = Math.round(leftColor[2] + (rightColor[2] - leftColor[2]) * t);
    const a = Math.round(leftColor[3] + (rightColor[3] - leftColor[3]) * t);

    return rgbaToHex(r, g, b, a);
}

function setupColorInputListeners(stopElement) {
    const colorInput = stopElement.querySelector('input[type="color"]');
    const hexInput = stopElement.querySelector('.hex-input');
    const rgbaInputs = stopElement.querySelectorAll('.rgba-input');
    
    // Update RGBA inputs from hex
    function updateRGBAFromHex(hex) {
        const [r, g, b, a] = hexToRGBA(hex);
        rgbaInputs[0].value = r;
        rgbaInputs[1].value = g;
        rgbaInputs[2].value = b;
        rgbaInputs[3].value = a;
    }

    // Update hex from RGBA inputs
    function updateHexFromRGBA() {
        const r = parseInt(rgbaInputs[0].value);
        const g = parseInt(rgbaInputs[1].value);
        const b = parseInt(rgbaInputs[2].value);
        const a = parseInt(rgbaInputs[3].value);
        const hex = rgbaToHex(r, g, b, a);
        hexInput.value = hex;
        colorInput.value = hex.slice(0, 7); // Color input only supports 6-digit hex
        return hex;
    }

    // Update all inputs when any value changes
    function updateAllInputs() {
        updateGradient();
        updateURL();
    }

    // Color picker change
    colorInput.addEventListener('input', () => {
        const hex = colorInput.value;
        hexInput.value = hex + 'ff'; // Add full opacity
        updateRGBAFromHex(hex + 'ff');
        updateAllInputs();
    });

    // Hex input change
    hexInput.addEventListener('input', () => {
        let value = hexInput.value.trim();
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        
        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(value)) {
            updateRGBAFromHex(value);
            colorInput.value = value.slice(0, 7);
            updateAllInputs();
        }
    });

    // RGBA inputs change
    rgbaInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.checkValidity()) {
                const hex = updateHexFromRGBA();
                updateAllInputs();
            }
        });
    });

    // Position input change with constraints
    const positionInput = stopElement.querySelector('.position-input');
    positionInput.addEventListener('input', () => {
        // Ensure position is between 0 and 100
        let value = parseInt(positionInput.value);
        value = Math.min(100, Math.max(0, value));
        positionInput.value = value;
        
        updateGradient();
        updateURL();
    });

    stopElement.querySelector('.remove-stop').addEventListener('click', () => {
        if (document.querySelectorAll('.color-stop').length > 2) {
            stopElement.remove();
            updateGradient();
            updateURL();
        }
    });
}

function copyCode() {
    const code = document.getElementById('cssCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy CSS', 2000);
    });
}

function downloadCSS() {
    const code = document.getElementById('cssCode').textContent;
    const blob = new Blob([code], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadImage() {
    html2canvas(document.getElementById('gradientPreview')).then(canvas => {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gradient.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

function shareGradient() {
    const modal = document.getElementById('shareModal');
    const currentGradientString = document.getElementById('gradientPreview').style.background;
    
    // Update modal preview
    document.getElementById('modalGradientPreview').style.background = currentGradientString;
    document.getElementById('modalGradientValues').textContent = 'CSS Gradient';
    
    // Generate share link with relative path
    const path = '/pages/tools/gradient-generator.html';
    const params = new URLSearchParams(window.location.search);
    const shareUrl = window.location.protocol + '//' + window.location.host + path + '?' + params.toString();
    
    document.getElementById('shareLink').value = shareUrl;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeShareModal() {
    const modal = document.getElementById('shareModal');
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
}

// Close modal when clicking outside
document.getElementById('shareModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeShareModal();
    }
});

// Close on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('shareModal').classList.contains('show')) {
        closeShareModal();
    }
});

function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');

    // Visual feedback
    const button = event.currentTarget;
    const icon = button.querySelector('i');
    icon.classList.remove('bi-clipboard');
    icon.classList.add('bi-clipboard-check');

    setTimeout(() => {
        icon.classList.remove('bi-clipboard-check');
        icon.classList.add('bi-clipboard');
    }, 1500);
}

function shareToFacebook() {
    const url = encodeURIComponent(document.getElementById('shareLink').value);
    const text = encodeURIComponent('Check out this gradient I created!');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
}

function shareToTwitter() {
    const url = encodeURIComponent(document.getElementById('shareLink').value);
    const text = encodeURIComponent('Check out this gradient I created!');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareToWhatsApp() {
    const url = document.getElementById('shareLink').value;
    const text = encodeURIComponent(`Check out this gradient I created!\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareByEmail() {
    const subject = encodeURIComponent('Check out this gradient!');
    const body = encodeURIComponent(`I created this gradient using the CSS Gradient Generator:\n\n${document.getElementById('shareLink').value}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function updateURL() {
    const gradientData = {
        type: currentGradientType,
        angle: document.getElementById('angleControl').value,
        stops: Array.from(document.querySelectorAll('.color-stop')).map(stop => ({
            color: stop.querySelector('.hex-input').value,
            position: stop.querySelector('.position-input').value
        }))
    };

    // Save to localStorage
    localStorage.setItem('gradientData', JSON.stringify(gradientData));

    const params = new URLSearchParams(window.location.search);
    params.set('gradient', JSON.stringify(gradientData));
    
    // Update URL without reloading the page
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newURL }, '', newURL);
}

// Handle browser back/forward
window.addEventListener('popstate', () => {
    loadFromURL();
});
