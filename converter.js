const dropZone = document.getElementById("drop-zone");
const formatSelect = document.getElementById("format");
const downloadLink = document.getElementById("download-link");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.backgroundColor = "#d0f0ff";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.backgroundColor = "#f8f8f8";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.backgroundColor = "#f8f8f8";

  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith("image/")) {
    alert("Only image files are supported.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = `converted.${formatSelect.value}`;
        downloadLink.textContent = "Download converted image";
        downloadLink.style.display = "block";
      }, `image/${formatSelect.value}`);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});
