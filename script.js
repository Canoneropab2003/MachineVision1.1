document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent immediate navigation
    const href = this.getAttribute('href');
    
      // Apply fade-out effect
    document.body.classList.add('fade-out');

      // After the animation completes, navigate to the new page
    setTimeout(() => {
        window.location.href = href;
      }, 500); // 500ms matches the CSS animation time
    });
});

let originalImage = new Image();

document.getElementById("upload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            originalImage.src = e.target.result;
            document.getElementById("original-img").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});


document.getElementById("apply-filter").addEventListener("click", function () {
    applyFilter();
});

document.getElementById("apply-grayscale").addEventListener("click", function () {
    applyFilter(true);
});

document.getElementById("apply-binary").addEventListener("click", function () {
    const canvas = document.getElementById("filtered-canvas");
    const ctx = canvas.getContext("2d");

    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        let binaryColor = avg > 128 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = binaryColor;
    }

    ctx.putImageData(imageData, 0, 0);
});

document.getElementById("reset-controls").addEventListener("click", function () {
    // Reset sliders to default values
    document.getElementById("redRange").value = 100;
    document.getElementById("greenRange").value = 100;
    document.getElementById("blueRange").value = 100;
    document.getElementById("opacity").value = 1;
    document.getElementById("brightness").value = 100;
    document.getElementById("contrast").value = 100;
    document.getElementById("saturation").value = 100;
    document.getElementById("blur").value = 0;
    document.getElementById("thresholdSlider").value = 128;
    document.getElementById("thresholdValue").textContent = "128";

    // Uncheck checkboxes
    document.getElementById("applyFilter").checked = false;
    document.getElementById("Filter").checked = false;
    document.getElementById("apply-threshold").checked = false;

    // Reapply default filter (optional)
    applyFilter();
});


document.getElementById("apply-adaptive-binarization").addEventListener("click", function () {
    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    const canvas = document.getElementById("filtered-canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    let src = cv.imread("filtered-canvas");
    let gray = new cv.Mat();
    let dst = new cv.Mat();
    
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.adaptiveThreshold(gray, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 15, 5);
    
    cv.imshow("filtered-canvas", dst);
    
    src.delete();
    gray.delete();
    dst.delete();
});


const toggleRgbButton = document.getElementById('toggle-rgb');
const rgbControls = document.querySelector('.controls');

const toggleEnhanceButton = document.getElementById('toggle-enhance');
const enhanceControls = document.querySelector('.controlsenhance');

const toggleThreshold = document.getElementById('toggle-threshold');
const ThresholdControls = document.querySelector('.controlsThreshold');

const resetButton = document.getElementById('reset-controls'); // Reset Button
const resetContainer = document.querySelector('.controlrest'); // Parent div

// Hide the controls and reset button by default
rgbControls.style.display = 'none';
enhanceControls.style.display = 'none';
ThresholdControls.style.display = 'none';
resetContainer.style.display = 'none'; // Hide reset button initially

// Function to check if any control is visible and toggle the reset button
function updateResetButtonVisibility() {
    if (
        rgbControls.style.display === 'block' ||
        enhanceControls.style.display === 'block' ||
        ThresholdControls.style.display === 'block'
    ) {
        resetContainer.style.display = 'flex'; // Show reset button
    } else {
        resetContainer.style.display = 'none'; // Hide reset button
    }
}

toggleRgbButton.addEventListener('click', () => {
    const isVisible = rgbControls.style.display === 'block';
    rgbControls.style.display = isVisible ? 'none' : 'block';
    toggleRgbButton.textContent = isVisible ? '🎨 Show RGB Controls' : '🎨 Hide RGB Controls';
    updateResetButtonVisibility();
});

toggleEnhanceButton.addEventListener('click', () => {
    const isVisible = enhanceControls.style.display === 'block';
    enhanceControls.style.display = isVisible ? 'none' : 'block';
    toggleEnhanceButton.textContent = isVisible ? '🛠️ Show Enhancer Controls' : '🛠️ Hide Enhancer Controls';
    updateResetButtonVisibility();
});

toggleThreshold.addEventListener('click', () => {
    const isVisible = ThresholdControls.style.display === 'block';
    ThresholdControls.style.display = isVisible ? 'none' : 'block';
    toggleThreshold.textContent = isVisible ? '🌓 Show Threshold Control' : '🌓 Hide Threshold Control';
    updateResetButtonVisibility();
});




// Enhancer Functionality
function applyEnhancements() {
    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    const opacity = parseFloat(document.getElementById("opacity").value);
    const brightness = parseInt(document.getElementById("brightness").value) / 100;
    const contrast = parseInt(document.getElementById("contrast").value) / 100;
    const saturation = parseInt(document.getElementById("saturation").value) / 100;
    const blur = parseInt(document.getElementById("blur").value);

    const canvas = document.getElementById("filtered-canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Set CSS filters for the canvas context
    ctx.filter = `opacity(${opacity}) brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
}

// Event Listeners for Enhancement Controls
["opacity", "brightness", "contrast", "saturation", "blur"].forEach((id) => {
    document.getElementById(id).addEventListener("input", function () {
        if (document.getElementById("Filter").checked) {
            applyEnhancements();
        }
    });
});

document.getElementById("Filter").addEventListener("change", function () {
    if (this.checked) {
        applyEnhancements();
    } else {
        applyFilter(); // Reapply the selected filter without enhancements
    }
});


document.getElementById("save").addEventListener("click", function () {
    const canvas = document.getElementById("filtered-canvas");
    const link = document.createElement("a");
    link.download = "filtered-image.png";
    link.href = canvas.toDataURL();
    link.click();
});

document.getElementById("applyFilter").addEventListener("change", function () {
    if (this.checked) {
        applyRGBFilter();
    } else {
        applyFilter(); // Reapply selected filter without RGB adjustments
    } 
});

["redRange", "greenRange", "blueRange"].forEach((id) => {
    document.getElementById(id).addEventListener("input", function () {
        if (document.getElementById("applyFilter").checked) {
            applyRGBFilter();
        }
    });
});

function applyFilter(grayscale = false) {
    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    const canvas = document.getElementById("filtered-canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const mode = document.getElementById("filter-mode").value;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i + 1], b = data[i + 2];

        if (grayscale) {
            let avg = (r + g + b) / 3;
            r = g = b = avg;
        } else {
            switch (mode) {
                case "warm": r *= 1.2; g *= 0.9; b *= 0.8; break;
                case "ocean": r *= 0.8; g *= 0.9; b *= 1.2; break;
                case "sepia": r *= 1.2; g *= 1.0; b *= 0.8; break;
                case "mystic": r *= 1.1; g *= 0.9; b *= 1.3; break;
                case "cyberpunk": r *= 1.3; g *= 0.8; b *= 1.4; break;
                case "sunset": r *= 1.2; g *= 0.8; break;
                case "lush": g *= 1.3; break;
                case "silver": r *= 1.3; g *= 0.8; b *= 0.7; break;
                case "cool": b *= 1.3; break;
                case "neon": r *= 1.3; g *= 1.1; b *= 1.5; break;
            }
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }

    ctx.putImageData(imageData, 0, 0);
}

function applyRGBFilter() {
    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    const redMultiplier = document.getElementById("redRange").value / 100;
    const greenMultiplier = document.getElementById("greenRange").value / 100;
    const blueMultiplier = document.getElementById("blueRange").value / 100;

    const canvas = document.getElementById("filtered-canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] *= redMultiplier;     // Red
        data[i + 1] *= greenMultiplier; // Green
        data[i + 2] *= blueMultiplier;  // Blue
    }

    ctx.putImageData(imageData, 0, 0);
}


// Update threshold value display
const thresholdSlider = document.getElementById("thresholdSlider");
const thresholdValueDisplay = document.getElementById("thresholdValue");
const applyThresholdCheckbox = document.getElementById("apply-threshold");

thresholdSlider.addEventListener("input", function () {
    thresholdValueDisplay.textContent = this.value;
    if (applyThresholdCheckbox.checked) {
        applyBinaryThreshold(parseInt(this.value));
    }
});

applyThresholdCheckbox.addEventListener("change", function () {
    if (this.checked) {
        applyBinaryThreshold(parseInt(thresholdSlider.value));
    } else {
        applyFilter(); // Reapply default filter if threshold is unchecked
    }
});

// Function to apply binary threshold
function applyBinaryThreshold(threshold = 128) {
    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    const canvas = document.getElementById("filtered-canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const color = avg >= threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = color;
    }

    ctx.putImageData(imageData, 0, 0);
}

// Reset button functionality for threshold control
const resetThresholdButton = document.getElementById("reset-threshold");
resetThresholdButton.addEventListener("click", function () {
    const thresholdSlider = document.getElementById("thresholdSlider");
    const thresholdValue = document.getElementById("thresholdValue");
    const applyThresholdCheckbox = document.getElementById("apply-threshold");

    // Reset slider value and displayed value to default (128)
    thresholdSlider.value = 128;
    thresholdValue.textContent = 128;

    // Reapply the threshold if the checkbox is checked
    if (applyThresholdCheckbox.checked) {
        applyBinaryThreshold(128);
    }
});

