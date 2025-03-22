let currentGradientType = 'linear';

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
}

function createGradientString(colors, angle) {
    switch(currentGradientType) {
        case 'linear':
            return `linear-gradient(${angle}deg, ${colors.map(color => {
                if (color.includes('#') && color.length === 9) {
                    const [r, g, b, a] = hexToRGBA(color);
                    return `rgba(${r}, ${g}, ${b}, ${a/100})`;
                }
                return color;
            }).join(', ')})`;
        case 'radial':
            return `radial-gradient(circle at center, ${colors.join(', ')})`;
        case 'conic':
            return `conic-gradient(from ${angle}deg, ${colors.join(', ')})`;
        default:
            return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
    }
}

function updateGradient() {
    const colorStops = Array.from(document.querySelectorAll('.color-stop')).map(stop => {
        const hexInput = stop.querySelector('.hex-input');
        const positionInput = stop.querySelector('.position-input');
        // Ensure we use the full 8-digit hex if available
        const hexValue = hexInput.value.length === 9 ? hexInput.value : hexInput.value + 'ff';
        return `${hexValue} ${positionInput.value}%`;
    });

    const angle = document.getElementById('angleControl').value;
    const gradientString = createGradientString(colorStops, angle);
    
    document.getElementById('gradientPreview').style.background = gradientString;
    document.getElementById('cssCode').textContent = `background: ${gradientString};`;
}

function addColorStop() {
    const colorStopsContainer = document.getElementById('colorStops');
    const newStop = document.createElement('div');
    newStop.className = 'color-stop';
    const randomColor = generateRandomColor();
    const [r, g, b] = hexToRGBA(randomColor);
    
    newStop.innerHTML = `
        <div class="color-input-group">
            <input type="color" class="form-control form-control-color color-input" value="${randomColor}">
            <div class="color-values">
                <input type="text" class="form-control hex-input" value="${randomColor}ff" pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$" placeholder="Hex">
                <div class="rgba-group">
                    <input type="number" class="form-control rgba-input" min="0" max="255" value="${r}">
                    <input type="number" class="form-control rgba-input" min="0" max="255" value="${g}">
                    <input type="number" class="form-control rgba-input" min="0" max="255" value="${b}">
                    <input type="number" class="form-control rgba-input" min="0" max="100" value="100">
                </div>
                <input type="number" class="form-control position-input" min="0" max="100" value="50" placeholder="Position %">
            </div>
        </div>
        <button class="btn btn-danger btn-sm remove-stop"><i class="bi bi-trash"></i></button>
    `;

    setupColorInputListeners(newStop);
    colorStopsContainer.appendChild(newStop);
    updateGradient();
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

    // Position input change
    stopElement.querySelector('.position-input').addEventListener('input', updateAllInputs);

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
    // Simply copy the current URL since it's already updated
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Share URL copied to clipboard!');
    });
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
