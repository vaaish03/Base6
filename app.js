const $ = (id) => document.getElementById(id);

const frameInput = $("frameInput");
const viewer = $("viewer");
const viewImage = $("viewImage");
const frameSlider = $("frameSlider");
const frameCount = $("frameCount");
const roomTarget = $("roomTarget");
const roomTargetImage = $("roomTargetImage");
const pgImageInput = $("pgImageInput");
const pgImagePreview = $("pgImagePreview");
const ROOM_CONFIGS_KEY = "base6RoomLayouts";
const roomOptions = {
  "room-wide": { image: "assets/base6-room-wide.jpeg" },
  "room-twin": { image: "assets/base6-room-twin.jpeg" },
  "room-study": { image: "assets/base6-room-wide.jpeg" },
};
let frames = [];
let frameIndex = 0;
let dragStartX = null;
let frameObjectUrls = [];
let pgFiles = [];

function renderPgPreview() {
  pgImagePreview.replaceChildren(...pgFiles.map((file) => {
    const image = document.createElement("img");
    image.src = URL.createObjectURL(file);
    image.alt = file.name;
    image.onload = () => URL.revokeObjectURL(image.src);
    return image;
  }));
}

function renderFrame(index) {
  if (!frames.length) {
    viewer.classList.add("empty");
    viewImage.removeAttribute("src");
    frameCount.textContent = "0 frames";
    frameSlider.max = 0;
    frameSlider.value = 0;
    return;
  }
  frameIndex = (index + frames.length) % frames.length;
  viewImage.src = frames[frameIndex];
  frameSlider.max = frames.length - 1;
  frameSlider.value = frameIndex;
  frameCount.textContent = `${frames.length} frame${frames.length === 1 ? "" : "s"}`;
  viewer.classList.remove("empty");
}

function loadFrames(fileList) {
  frameObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  frameObjectUrls = [];
  const entries = [...fileList];
  if (entries.length && typeof entries[0] === "string") {
    frames = entries;
  } else {
    frames = entries
      .filter((file) => file.type.startsWith("image/"))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map((file) => {
        const url = URL.createObjectURL(file);
        frameObjectUrls.push(url);
        return url;
      });
  }
  renderFrame(0);
}

frameInput.addEventListener("change", () => loadFrames(frameInput.files));
pgImageInput.addEventListener("change", () => {
  pgFiles = [...pgImageInput.files].filter((file) => file.type.startsWith("image/"));
  renderPgPreview();
});
$("clearPgImages").addEventListener("click", () => {
  pgFiles = [];
  pgImageInput.value = "";
  renderPgPreview();
});
function savedRoomConfigs() {
  return JSON.parse(localStorage.getItem(ROOM_CONFIGS_KEY) || "{}");
}

function selectRoom(roomId) {
  const option = roomOptions[roomId] || roomOptions["room-wide"];
  roomTarget.value = roomId;
  roomTargetImage.src = option.image;
  frameInput.value = "";
  const saved = savedRoomConfigs()[roomId];
  if (saved) {
    room = { small: { width: 12, height: 10 }, medium: { width: 16, height: 12 }, large: { width: 20, height: 16 } }[saved.roomSize] || { width: 16, height: 12 };
    $("roomSize").value = saved.roomSize || "medium";
    $("roomStyle").value = saved.roomStyle || "modern";
    items = saved.items || [];
    selected = null;
    loadFrames(saved.frames && saved.frames.length ? saved.frames : [option.image]);
    drawLayout();
    return;
  }
  loadFrames([option.image]);
  randomLayout();
}

roomTarget.addEventListener("change", () => selectRoom(roomTarget.value));
$("prevFrame").addEventListener("click", () => renderFrame(frameIndex - 1));
$("nextFrame").addEventListener("click", () => renderFrame(frameIndex + 1));
frameSlider.addEventListener("input", (event) => renderFrame(Number(event.target.value)));
viewer.addEventListener("pointerdown", (event) => {
  dragStartX = event.clientX;
  viewer.setPointerCapture(event.pointerId);
});
viewer.addEventListener("pointermove", (event) => {
  if (dragStartX === null || !frames.length) return;
  const distance = event.clientX - dragStartX;
  if (Math.abs(distance) >= 12) {
    renderFrame(frameIndex + (distance < 0 ? 1 : -1));
    dragStartX = event.clientX;
  }
});
viewer.addEventListener("pointerup", () => { dragStartX = null; });
viewer.addEventListener("pointercancel", () => { dragStartX = null; });

const canvas = $("layoutCanvas");
const ctx = canvas.getContext("2d");
const furniture = [
  { type: "sofa", label: "Sofa", w: 4.5, h: 1.6, color: "#7c6bdb" },
  { type: "bed", label: "Bed", w: 4.8, h: 1.8, color: "#aeb4bc" },
  { type: "table", label: "Table", w: 2.5, h: 2.5, color: "#d18d5b" },
  { type: "desk", label: "Desk", w: 3.8, h: 1.6, color: "#c98373" },
  { type: "plant", label: "Plant", w: 1.2, h: 1.2, color: "#6fa985" },
  { type: "window", label: "Window", w: 2.4, h: .7, color: "#c7edff" },
  { type: "cupboard", label: "Cupboard", w: 1.5, h: 1.5, color: "#c47d45" },
  { type: "bathroom", label: "Bathroom", w: 1.4, h: 1.4, color: "#4c8df6" },
];
let room = { width: 16, height: 12 };
let items = [];
let selected = null;
let dragging = false;
let dragOffset = { x: 0, y: 0 };

function roomBounds() {
  const padding = 65;
  const scale = Math.min((canvas.width - padding * 2) / room.width, (canvas.height - padding * 2) / room.height);
  return { x: padding, y: padding, width: room.width * scale, height: room.height * scale, scale };
}

function drawLayout() {
  const b = roomBounds();
  const style = $("roomStyle").value;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = style === "warm" ? "#fff8ef" : style === "minimal" ? "#fbfdff" : "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#d9f4ff";
  ctx.strokeStyle = "#08b8f4";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.width, b.height, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 25px system-ui";
  ctx.fillText("Room 1", b.x + b.width / 2, b.y + b.height / 2 - 18);
  ctx.font = "bold 22px system-ui";
  ctx.fillText("2W 1D 2T 3B", b.x + b.width / 2, b.y + b.height / 2 + 28);
  ctx.textAlign = "start";

  items.forEach((item) => {
    const meta = furniture.find((entry) => entry.type === item.type);
    const x = b.x + item.x * b.scale;
    const y = b.y + item.y * b.scale;
    const w = meta.w * b.scale / 2;
    const h = meta.h * b.scale / 2;
    const angle = item.rotation || 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    if (item.type === "window") {
      drawWindow(-w, -h, w * 2, h * 2, item === selected);
      ctx.restore();
      return;
    }
    if (item.type === "cupboard" || item.type === "bathroom") {
      drawRoomIcon(-w, -h, w * 2, h * 2, item.type === "cupboard" ? "▥" : "♿", item.color, item === selected);
      ctx.restore();
      return;
    }
    ctx.fillStyle = item.color || meta.color;
    ctx.strokeStyle = item === selected ? "#312e81" : "rgba(31,41,55,.3)";
    ctx.lineWidth = item === selected ? 3 : 1;
    ctx.beginPath();
    ctx.roundRect(-w, -h, w * 2, h * 2, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 12px system-ui";
    ctx.fillText(item.label || meta.label, 0, 4);
    ctx.textAlign = "start";
    ctx.restore();
  });
}

function drawWindow(x, y, width, height, selected) {
  ctx.fillStyle = "#c7edff";
  ctx.strokeStyle = "#b3c1cf";
  ctx.lineWidth = selected ? 3 : 2;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width / 2, y + height);
  ctx.moveTo(x, y + height / 2);
  ctx.lineTo(x + width, y + height / 2);
  ctx.stroke();
}

function drawRoomIcon(x, y, width, height, icon, color, selected) {
  ctx.fillStyle = `${color}33`;
  ctx.strokeStyle = color;
  ctx.lineWidth = selected ? 3 : 1;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = color;
  ctx.globalAlpha = .9;
  ctx.font = "bold 20px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(icon, 0, 7);
  ctx.textAlign = "start";
  ctx.globalAlpha = 1;
}

function randomLayout() {
  items = [
    { type: "bed", label: "Bed-29-1", x: room.width / 2, y: 1.7 },
    { type: "bed", label: "Bed-29-2", x: room.width - 1.6, y: room.height / 2, rotation: Math.PI / 2 },
    { type: "bed", label: "Bed-29-3", x: room.width / 2, y: room.height - 1.1, color: "#ffd400" },
    { type: "window", x: room.width / 2, y: .35 },
    { type: "window", x: room.width / 2, y: room.height - .35 },
    { type: "cupboard", x: 1.2, y: 1.2 },
    { type: "bathroom", x: room.width - 1.2, y: room.height - 1.2 },
  ];
  selected = null;
  drawLayout();
}

function addFurniture(type) {
  const meta = furniture.find((entry) => entry.type === type);
  items.push({ type, label: type === "bed" ? `Bed-${items.length + 1}` : meta.label, x: room.width / 2, y: room.height / 2 });
  selected = items[items.length - 1];
  drawLayout();
}

function removeSelected() {
  if (!selected) return;
  items = items.filter((item) => item !== selected);
  selected = null;
  drawLayout();
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height,
  };
}

function hitTest(x, y) {
  const b = roomBounds();
  return [...items].reverse().find((item) => {
    const meta = furniture.find((entry) => entry.type === item.type);
    const angle = item.rotation || 0;
    const dx = x - (b.x + item.x * b.scale);
    const dy = y - (b.y + item.y * b.scale);
    const localX = dx * Math.cos(angle) + dy * Math.sin(angle);
    const localY = -dx * Math.sin(angle) + dy * Math.cos(angle);
    return Math.abs(localX) < meta.w * b.scale / 2 &&
      Math.abs(localY) < meta.h * b.scale / 2;
  });
}

canvas.addEventListener("pointerdown", (event) => {
  const point = canvasPoint(event);
  selected = hitTest(point.x, point.y);
  if (selected) {
    const b = roomBounds();
    dragOffset = { x: point.x - b.x - selected.x * b.scale, y: point.y - b.y - selected.y * b.scale };
    dragging = true;
    canvas.setPointerCapture(event.pointerId);
  }
  drawLayout();
});
canvas.addEventListener("pointermove", (event) => {
  if (!selected || !dragging) return;
  const point = canvasPoint(event);
  const b = roomBounds();
  selected.x = Math.max(.4, Math.min(room.width - .4, (point.x - b.x - dragOffset.x) / b.scale));
  selected.y = Math.max(.4, Math.min(room.height - .4, (point.y - b.y - dragOffset.y) / b.scale));
  drawLayout();
});
canvas.addEventListener("pointerup", () => { dragging = false; drawLayout(); });
canvas.addEventListener("pointercancel", () => { dragging = false; drawLayout(); });

furniture.forEach((item) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = `+ ${item.label}`;
  button.addEventListener("click", () => addFurniture(item.type));
  $("furnitureList").appendChild(button);
});
$("removeFurniture").addEventListener("click", removeSelected);
window.addEventListener("keydown", (event) => {
  if ((event.key === "Delete" || event.key === "Backspace") && selected) {
    event.preventDefault();
    removeSelected();
  }
});
$("roomSize").addEventListener("change", (event) => {
  room = { small: { width: 12, height: 10 }, medium: { width: 16, height: 12 }, large: { width: 20, height: 16 } }[event.target.value];
  randomLayout();
});
$("roomStyle").addEventListener("change", drawLayout);
$("generateLayout").addEventListener("click", randomLayout);
$("clearAll").addEventListener("click", () => {
  loadFrames([roomOptions[roomTarget.value].image]);
  frameInput.value = "";
  randomLayout();
});
$("downloadLayout").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "base6-room-layout.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

randomLayout();
selectRoom(roomTarget.value);

window.base6Tool = {
  getState: () => ({
    roomId: roomTarget.value,
    roomSize: $("roomSize").value,
    roomStyle: $("roomStyle").value,
    items,
    frames,
    uploadedFiles: [...frameInput.files],
    pgFiles,
  }),
  storageKey: ROOM_CONFIGS_KEY,
};
