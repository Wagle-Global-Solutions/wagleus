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
        const newStop = document.createElement('div');
        newStop.className = 'color-stop';
        newStop.innerHTML = `
            <input type="color" class="form-control form-control-color" value="${stop.color}">
            <input type="number" class="form-control" min="0" max="100" value="${stop.position}" placeholder="Position %">
            <button class="btn btn-danger btn-sm remove-stop"><i class="bi bi-trash"></i></button>
        `;

        newStop.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                updateGradient();
                updateURL();
            });
        });

        newStop.querySelector('.remove-stop').addEventListener('click', () => {
            newStop.remove();
            updateGradient();
            updateURL();
        });

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
    // Clear existing color stops
    const colorStopsContainer = document.getElementById('colorStops');
    colorStopsContainer.innerHTML = '';

    // Calculate positions evenly for the number of colors
    const positions = preset.colors.map((color, index) => {
        return Math.round((index / (preset.colors.length - 1)) * 100);
    });

    // Create color stops for each color in the preset
    preset.colors.forEach((color, index) => {
        const newStop = document.createElement('div');
        newStop.className = 'color-stop';
        newStop.innerHTML = `
            <input type="color" class="form-control form-control-color" value="${color}">
            <input type="number" class="form-control" min="0" max="100" value="${positions[index]}" placeholder="Position %">
            <button class="btn btn-danger btn-sm remove-stop"><i class="bi bi-trash"></i></button>
        `;

        newStop.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                updateGradient();
                updateURL();
            });
        });

        newStop.querySelector('.remove-stop').addEventListener('click', () => {
            if (colorStopsContainer.children.length > 2) {
                newStop.remove();
                updateGradient();
                updateURL();
            }
        });

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
    document.querySelectorAll('.color-stop input').forEach(input => {
        input.addEventListener('input', () => {
            updateGradient();
            updateURL(); // Add this line
        });
    });
}

function createGradientString(colors, angle) {
    switch(currentGradientType) {
        case 'linear':
            return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
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
        const color = stop.querySelector('input[type="color"]').value;
        const position = stop.querySelector('input[type="number"]').value;
        return `${color} ${position}%`;
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
    newStop.innerHTML = `
        <input type="color" class="form-control form-control-color" value="#ffffff">
        <input type="number" class="form-control" min="0" max="100" value="50" placeholder="Position %">
        <button class="btn btn-danger btn-sm remove-stop"><i class="bi bi-trash"></i></button>
    `;

    newStop.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            updateGradient();
            updateURL(); // Add this line
        });
    });

    newStop.querySelector('.remove-stop').addEventListener('click', () => {
        newStop.remove();
        updateGradient();
        updateURL();
    });

    colorStopsContainer.appendChild(newStop);
    updateGradient();
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
            color: stop.querySelector('input[type="color"]').value,
            position: stop.querySelector('input[type="number"]').value
        }))
    };

    const params = new URLSearchParams(window.location.search);
    params.set('gradient', JSON.stringify(gradientData));
    
    // Update URL without reloading the page
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newURL }, '', newURL);
}
