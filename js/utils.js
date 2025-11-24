// Utility Functions

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Load and resize image
function loadImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => callback(img);
        img.onerror = () => {
            alert("Failed to load image. Please try another file.");
            callback(null);
        };
        img.src = e.target.result;
    };
    reader.onerror = () => {
        alert("Failed to read file. Please try again.");
        callback(null);
    };
    reader.readAsDataURL(file);
}

// Draw image portion to canvas
function drawImagePortion(canvas, image, sx, sy, sw, sh) {
    const ctx = canvas.getContext('2d');
    canvas.width = sw;
    canvas.height = sh;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
}

// Get touch or mouse position (supports touchstart/move/end)
function getPointerPosition(event) {
    // Touch events
    if (event.touches && event.touches.length > 0) {
        const t = event.touches[0];
        return { x: t.clientX, y: t.clientY };
    }

    // touchend / touchcancel use changedTouches
    if (event.changedTouches && event.changedTouches.length > 0) {
        const t = event.changedTouches[0];
        return { x: t.clientX, y: t.clientY };
    }

    // Mouse / pointer events
    return {
        x: event.clientX,
        y: event.clientY
    };
}

// Check if point is inside element
function isInsideElement(x, y, element) {
    const rect = element.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// Calculate distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
