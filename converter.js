const fileInput = document.getElementById("file-input");
const formatSelect = document.getElementById("format");
const convertBtn = document.getElementById("convert-btn");
const downloadLink = document.getElementById("download-link");
const fileInfo = document.getElementById("file-info");
const dropZone = document.getElementById("drop-zone");
const formatWarning = document.getElementById("format-warning");
const qualityInput = document.getElementById("quality");
const qualityVal = document.getElementById("quality-val");

let loadedImage = null;
let loadedFile = null;

// Qualitätseinstellung anzeigen
// Initial quality display
qualityInput.addEventListener("input", () => {
  qualityVal.textContent = qualityInput.value;
});

// Einlesen der Datei und Anzeigen der Informationen
// Read the file and display its information
function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Only image files are supported.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      loadedFile = file;
      fileInfo.innerText = `File: ${file.name}\nType: ${file.type}\nDimensions: ${img.width}x${img.height}`;
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

// Event listener für Datei-Input und Drag & Drop
// Event listeners for file input and drag & drop
fileInput.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});

// Event listener für dragover
// Event listener for dragover
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.backgroundColor = "#e0f7fa";
});

// Event listener für dragleave
// Event listener for dragleave
dropZone.addEventListener("dragleave", () => {
  dropZone.style.backgroundColor = "#f8f8f8";
});

// Event listener für drop
// Event listener for drop
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.backgroundColor = "#f8f8f8";
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

// Auswahl des Formats und ggf. Warnung anzeigen
// Format selection and show warning if necessary
formatSelect.addEventListener("change", () => {
  const selected = formatSelect.value;
  let message = "";

  switch (selected) {
    case "avif":
      message = "⚠ AVIF is experimental and may not work in all browsers.";
      break;
    case "bmp":
      message = "⚠ BMP is uncompressed and not suitable for web use.";
      break;
    default:
      message = "";
  }

  if (message) {
    formatWarning.classList.remove("hidden");
    formatWarning.textContent = message;
  } else {
    formatWarning.classList.add("hidden");
    formatWarning.textContent = "";
  }
});

// Bild konvertieren und Download-Link erstellen
// Convert image and create download link
convertBtn.addEventListener("click", () => {
  if (!loadedImage || !loadedFile) {
    alert("Please upload an image first.");
    return;
  }

  const format = formatSelect.value;
  const quality = parseFloat(qualityInput.value);
  const qualityFormats = ["jpeg", "webp", "avif"];

  const canvas = document.createElement("canvas");
  canvas.width = loadedImage.width;
  canvas.height = loadedImage.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(loadedImage, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) {
      alert(`Sorry, your browser doesn't support export to ${format.toUpperCase()}. Try PNG or JPG.`);
      return;
    }

    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = `SFConverter.${format}`;
    downloadLink.textContent = "Download converted image";
    downloadLink.style.display = "block";
  }, `image/${format}`, qualityFormats.includes(format) ? quality : undefined);
});
