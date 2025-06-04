const fileInput = document.getElementById("file-input");
const formatSelect = document.getElementById("format");
const convertBtn = document.getElementById("convert-btn");
const downloadLink = document.getElementById("download-link");
const fileInfo = document.getElementById("file-info");

let loadedImage = null;
let loadedFile = null;

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
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
});

convertBtn.addEventListener("click", () => {
  if (!loadedImage || !loadedFile) {
    alert("Please upload an image first.");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = loadedImage.width;
  canvas.height = loadedImage.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(loadedImage, 0, 0);

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = `converted.${formatSelect.value}`;
    downloadLink.textContent = "Download converted image";
    downloadLink.style.display = "block";
  }, `image/${formatSelect.value}`);
});
