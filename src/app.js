import { THEMES, renderMermaidSVG } from "beautiful-mermaid";

const sourceInput = document.getElementById("source-input");
const fileInput = document.getElementById("file-input");
const fileName = document.getElementById("file-name");
const themeSelect = document.getElementById("theme-select");
const renderButton = document.getElementById("render-button");
const downloadButton = document.getElementById("download-button");
const preview = document.getElementById("preview");
const errorBox = document.getElementById("error-box");
const statusBadge = document.getElementById("status-badge");

const DEFAULT_THEME = "tokyo-night";

let currentSvg = "";
let currentFileName = "";

function setStatus(text, state) {
  statusBadge.textContent = text;
  statusBadge.classList.remove("ready", "error");

  if (state) {
    statusBadge.classList.add(state);
  }
}

function showError(message) {
  errorBox.hidden = false;
  errorBox.textContent = message;
  setStatus("渲染失败", "error");
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = "";
}

function prettifyThemeName(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function populateThemes() {
  const themeNames = Object.keys(THEMES);

  for (const name of themeNames) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = prettifyThemeName(name);
    themeSelect.appendChild(option);
  }

  themeSelect.value = themeNames.includes(DEFAULT_THEME) ? DEFAULT_THEME : themeNames[0];
}

function getSelectedTheme() {
  return THEMES[themeSelect.value];
}

/**
 * Normalize Mermaid source text.
 *
 * When users paste a single-line definition where nodes are separated by
 * semicolons (e.g. "A --> B; B --> C"), splitting on semicolons makes it
 * valid Mermaid syntax, because the renderer expects each statement on its
 * own line.
 */
function normalizeSource(source) {
  const lines = source.split("\n").map((line) => line.trimEnd());
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  if (nonEmptyLines.length === 1 && nonEmptyLines[0].includes(";")) {
    return nonEmptyLines[0]
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .join("\n");
  }

  return source;
}

function renderDiagram() {
  const source = normalizeSource(sourceInput.value.trim());

  if (!source) {
    currentSvg = "";
    preview.innerHTML = '<div class="empty-state"><p>请输入 Mermaid 再渲染。</p></div>';
    downloadButton.disabled = true;
    clearError();
    setStatus("等待渲染", "");
    return;
  }

  clearError();
  setStatus("渲染中...", "");
  renderButton.disabled = true;
  downloadButton.disabled = true;

  try {
    currentSvg = renderMermaidSVG(source, getSelectedTheme());
    preview.innerHTML = currentSvg;
    setStatus("SVG 已生成", "ready");
    downloadButton.disabled = false;
  } catch (error) {
    currentSvg = "";
    preview.innerHTML = '<div class="empty-state"><p>当前 Mermaid 无法生成 SVG。</p></div>';
    showError(error instanceof Error ? error.message : "渲染失败，请检查 Mermaid 语法。");
  } finally {
    renderButton.disabled = false;
  }
}

function downloadSvg() {
  if (!currentSvg) {
    return;
  }

  const blob = new Blob([currentSvg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const base = currentFileName || "diagram";
  link.href = url;
  link.download = `${base}-${themeSelect.value}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  requestAnimationFrame(() => URL.revokeObjectURL(url));
}

async function handleFileUpload() {
  const files = fileInput.files;
  const file = files && files[0];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();

    const nameWithoutExt = file.name.replace(/\.[^.]+$/, "");
    currentFileName = nameWithoutExt;
    sourceInput.value = text;
    fileName.textContent = file.name;
    clearError();
    setStatus("文件已载入", "");
    renderDiagram();
  } catch (error) {
    fileName.textContent = "文件读取失败";
    showError(error instanceof Error ? error.message : "无法读取所选文件。");
  } finally {
    fileInput.value = "";
  }
}

populateThemes();

renderButton.addEventListener("click", renderDiagram);
downloadButton.addEventListener("click", downloadSvg);
fileInput.addEventListener("change", () => {
  void handleFileUpload();
});
themeSelect.addEventListener("change", () => {
  renderDiagram();
});

sourceInput.addEventListener("input", () => {
  currentFileName = "";
  fileName.textContent = "未选择文件，当前使用手动输入";
});

sourceInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    renderDiagram();
  }
});

renderDiagram();
