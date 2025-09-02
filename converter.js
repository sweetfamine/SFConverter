const fileInput = document.getElementById("file-input");
const formatSelect = document.getElementById("format");
const convertBtn = document.getElementById("convert-btn");
const downloadLink = document.getElementById("download-link");
const dropZone = document.getElementById("drop-zone");
const formatWarning = document.getElementById("format-warning");
const qualityInput = document.getElementById("quality");
const qualityVal = document.getElementById("quality-val");
const resultsList = document.getElementById("results");
const filesList = document.getElementById("files");

let selectedFiles = [];
const nameOverrides = new Map();

// Quality slider logik
// Initial quality display
qualityInput.addEventListener("input", () => {
  qualityVal.textContent = qualityInput.value;
});

// Erzeuge stabilen Schlüssel pro Datei (zum Entfernen)
// Create a stable key for each File (used for remove)
function fileKey(file) {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

// Render die ausgewählten Dateien als Karten mit Entfernen-Button
// Render selected files as cards with a remove (X) button
function renderSelectedFiles() {
  filesList.innerHTML = "";
  const keys = selectedFiles.map(fileKey);

  selectedFiles.forEach((file, idx) => {
    const li = document.createElement("li");
    li.className = "file-item";

    // Lade Infomationen
    // Load Infomations
    const left = document.createElement("div");
    const title = document.createElement("div");
    title.className = "name";
    title.textContent = file.name.replace(/\.[^.]+$/, "");
    title.setAttribute("contenteditable", "true");
    title.setAttribute("spellcheck", "false");

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${prettyBytes(file.size)} · ${file.type}`;
    left.appendChild(title);
    left.appendChild(meta);

    // Eingabefeld für den Dateinamen (vor dem Konvertieren!)
    // Input field for custom base filename (before converting!)
    const k = keys[idx];
    const existing = nameOverrides.get(k);
    if (existing) title.textContent = existing;

    // Änderung merken
    title.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        title.blur();
      } else if (e.key === "Escape") {
        const base = nameOverrides.get(k) ?? file.name.replace(/\.[^.]+$/, "");
        title.textContent = base;
        title.blur();
      }
    });
    title.addEventListener("blur", () => {
      const raw = (title.textContent || "").trim();
      const cleaned = raw
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 120);
      if (cleaned) {
        if (cleaned === file.name.replace(/\.[^.]+$/, "")) {
          nameOverrides.delete(k);
        } else {
          nameOverrides.set(k, cleaned);
        }
        title.textContent = cleaned;
      } else {
        const base = file.name.replace(/\.[^.]+$/, "");
        title.textContent = base;
        nameOverrides.delete(k);
      }
    });

    // Remove button (X)
    const remove = document.createElement("button");
    remove.className = "remove-btn";
    remove.setAttribute("aria-label", `Remove ${file.name}`);
    remove.textContent = "X";
    remove.addEventListener("click", () => {
      const key = keys[idx];
      selectedFiles = selectedFiles.filter(f => fileKey(f) !== key);
      nameOverrides.delete(key);
      renderSelectedFiles();
      resultsList.innerHTML = "";
      downloadLink.style.display = "none";
    });

    li.appendChild(left);
    li.appendChild(remove);
    filesList.appendChild(li);

    // Dimensionen asynchron nachladen und Metazeile aktualisieren
    // Load dimensions asynchronously and update meta line
    loadImageFromFile(file).then(img => {
      meta.textContent = `${prettyBytes(file.size)} · ${file.type} · ${img.width}×${img.height}`;
    }).catch(() => {/* ignore */});
  });
}

// Funktion die Bytes in KB, MB, GB umwandelt
// Function to convert bytes to KB, MB, GB
function prettyBytes(n) {
  if (n < 1024) return `${n} B`;
  const u = ["KB", "MB", "GB"];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
  return `${n.toFixed(1)} ${u[i]}`;
}

// Lade Bild aus Datei
// Load image from file
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Invalid image data"));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Prüfe ob das Format unterstützt wird
// Check if the format is supported
async function canEncode(mime) {
  return await new Promise((resolve) => {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    c.toBlob((b) => resolve(!!b), mime);
  });
}

// Konvertiere Datei
// Convert file
async function convertFile(file, format, quality) {
  const img = await loadImageFromFile(file);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const type = `image/${format}`;
  const qualityFormats = ["jpeg", "webp", "avif"];
  const q = qualityFormats.includes(format) ? quality : undefined;

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, q);
  });

  if (!blob) {
    throw new Error(
      `Sorry, your browser couldn't export ${format.toUpperCase()} for "${file.name}". Try PNG or JPEG.`
    );
  }

  return { blob, width: canvas.width, height: canvas.height };
}

// Handhabt Datei Auswahl
// Handle file selection
function handleFiles(fileList) {
  const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
  if (files.length === 0) {
    alert("Only image files are supported.");
    return;
  }

  selectedFiles = files;
  resultsList.innerHTML = "";
  downloadLink.style.display = "none";
  renderSelectedFiles();
}

// Event Listeners für UI Elemente
// Event listeners for UI elements
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.backgroundColor = "#e0f7fa";
});
dropZone.addEventListener("dragleave", () => {
  dropZone.style.backgroundColor = "#f8f8f8";
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.backgroundColor = "#f8f8f8";
  handleFiles(e.dataTransfer.files);
});

// Auswahl des Ausgabeformatsund ggf. Warnungen
// Handle output format selection and warnings
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

// Konvertierungs-Button
// Convert button
convertBtn.addEventListener("click", async () => {
  if (selectedFiles.length === 0) {
    alert("Please choose one or more images first.");
    return;
  }

  const format = formatSelect.value;
  const quality = parseFloat(qualityInput.value);

  // Check ob das Format unterstützt wird
  // capability check
  const ok = await canEncode(`image/${format}`);
  if (!ok) {
    alert(`Your browser cannot encode ${format.toUpperCase()}. Try PNG or JPEG.`);
    return;
  }

  resultsList.innerHTML = "";

  for (const file of selectedFiles) {
  const li = document.createElement("li");
  li.innerHTML = `
    <div class="name">${file.name}</div>
    <div class="meta">Converting to <strong>${format.toUpperCase()}</strong>…</div>
  `;
  resultsList.appendChild(li);

  try {
    const { blob, width, height } = await convertFile(file, format, quality);
    const url = URL.createObjectURL(blob);

    // Pro Datei Download Link
    const base = file.name.replace(/\.[^.]+$/, "");

    // Eingabefeld für den Dateinamen
    const key = fileKey(file);
    const entered = (nameOverrides.get(key) || "").trim();
    const finalBase = entered ? entered : `${base}_SFConverter`;

    //new Name
    li.querySelector(".name").textContent = `${finalBase}.${format}`;

    // Download-Link
    const a = document.createElement("a");
    a.href = url;
    a.download = `${finalBase}.${format}`;
    a.textContent = "⬇ Download";

    const meta = li.querySelector(".meta");
    meta.textContent = "";
    li.appendChild(a);

  } catch (err) {
    const meta = li.querySelector(".meta");
    meta.innerHTML = `<span class="err">❌ ${err.message}</span>`;
  }
}
});
