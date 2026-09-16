const roomDetails = {
  "room-wide": {
    title: "Room 1 · Twin residence",
    frames: ["assets/base6-room-wide.jpeg", "assets/base6-room-twin.jpeg", "assets/base6-room-wide.jpeg"],
    note: "Twin beds with two dedicated study zones and generous daylight.",
    items: [
      { type: "bed", label: "Bed-29-1", x: 8, y: 2 },
      { type: "bed", label: "Bed-29-2", x: 14, y: 6, rotation: Math.PI / 2 },
      { type: "bed", label: "Bed-29-3", x: 8, y: 10, color: "#ffd400" },
      { type: "desk", label: "Study", x: 2.5, y: 3 },
      { type: "window", label: "Window", x: 8, y: .35 },
      { type: "bathroom", label: "Bath", x: 14.5, y: 10.5 },
    ],
  },
  "room-twin": {
    title: "Room 2 · Balcony twin",
    frames: ["assets/base6-room-twin.jpeg", "assets/base6-room-wide.jpeg"],
    note: "A quieter twin setup with wardrobe storage and balcony access.",
    items: [
      { type: "bed", label: "Bed-2A", x: 3.5, y: 3 },
      { type: "bed", label: "Bed-2B", x: 3.5, y: 8 },
      { type: "desk", label: "Study", x: 10, y: 2 },
      { type: "cupboard", label: "Storage", x: 14, y: 2 },
      { type: "window", label: "Balcony", x: 8, y: .35 },
      { type: "bathroom", label: "Bath", x: 14, y: 10.5 },
    ],
  },
  "room-study": {
    title: "Room 3 · Study-focused room",
    frames: ["assets/base6-room-wide.jpeg", "assets/base6-room-twin.jpeg"],
    note: "An arrangement that keeps the shared study surface at the centre.",
    items: [
      { type: "bed", label: "Bed-3A", x: 3.5, y: 2.2 },
      { type: "bed", label: "Bed-3B", x: 12.5, y: 2.2 },
      { type: "table", label: "Project table", x: 8, y: 7 },
      { type: "desk", label: "Study", x: 8, y: 10 },
      { type: "window", label: "Window", x: 8, y: .35 },
      { type: "plant", label: "Plant", x: 1.2, y: 10.5 },
    ],
  },
};

const roomModal = document.getElementById("roomModal");
const modalImage = document.getElementById("modalImage");
const modalThumbs = document.getElementById("modalThumbs");
const modalFrameLabel = document.getElementById("modalFrameLabel");
const modalLayoutCanvas = document.getElementById("modalLayoutCanvas");
const modalLayoutNote = document.getElementById("modalLayoutNote");
let selectedRoom = null;
let modalFrame = 0;
let modalDragStart = null;

function drawModalLayout(detail) {
  const ctx = modalLayoutCanvas.getContext("2d");
  const room = { width: 16, height: 12 };
  const padding = 45;
  const scale = Math.min((modalLayoutCanvas.width - padding * 2) / room.width, (modalLayoutCanvas.height - padding * 2) / room.height);
  const x0 = padding;
  const y0 = padding;
  const width = room.width * scale;
  const height = room.height * scale;
  const dimensions = {
    bed: [4.8, 1.8], desk: [3.8, 1.6], table: [2.5, 2.5], plant: [1.2, 1.2],
    window: [2.4, .7], cupboard: [1.5, 1.5], bathroom: [1.4, 1.4],
  };
  const colors = { bed: "#aeb4bc", desk: "#c98373", table: "#d18d5b", plant: "#6fa985", window: "#c7edff", cupboard: "#c47d45", bathroom: "#4c8df6" };
  ctx.clearRect(0, 0, modalLayoutCanvas.width, modalLayoutCanvas.height);
  ctx.fillStyle = "#d9f4ff";
  ctx.fillRect(0, 0, modalLayoutCanvas.width, modalLayoutCanvas.height);
  ctx.strokeStyle = "#08b8f4";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(x0, y0, width, height, 18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "bold 21px system-ui";
  ctx.fillText(detail.title.split(" · ")[0], x0 + width / 2, y0 + height / 2);
  detail.items.forEach((item) => {
    const [itemWidth, itemHeight] = dimensions[item.type] || [2, 2];
    const x = x0 + item.x * scale;
    const y = y0 + item.y * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(item.rotation || 0);
    ctx.fillStyle = item.color || colors[item.type] || "#999";
    ctx.beginPath();
    ctx.roundRect(-itemWidth * scale / 2, -itemHeight * scale / 2, itemWidth * scale, itemHeight * scale, 7);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px system-ui";
    ctx.fillText(item.label, 0, 3);
    ctx.restore();
  });
  modalLayoutNote.textContent = detail.note;
}

function showModalFrame(index) {
  modalFrame = (index + selectedRoom.frames.length) % selectedRoom.frames.length;
  modalImage.src = selectedRoom.frames[modalFrame];
  modalFrameLabel.textContent = `View ${modalFrame + 1} of ${selectedRoom.frames.length}`;
  [...modalThumbs.children].forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === modalFrame));
}

function openRoomModal(roomId) {
  selectedRoom = { ...roomDetails[roomId] };
  const savedConfigs = JSON.parse(localStorage.getItem("base6RoomLayouts") || "{}");
  const saved = savedConfigs[roomId];
  if (saved) {
    selectedRoom.frames = saved.frames && saved.frames.length ? saved.frames : selectedRoom.frames;
    selectedRoom.items = saved.items || selectedRoom.items;
  }
  modalFrame = 0;
  document.getElementById("modalRoomTitle").textContent = selectedRoom.title;
  modalThumbs.replaceChildren(...selectedRoom.frames.map((frame, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<img src="${frame}" alt="Room view ${index + 1}">`;
    button.addEventListener("click", () => showModalFrame(index));
    return button;
  }));
  drawModalLayout(selectedRoom);
  showModalFrame(0);
  roomModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeRoomModal() {
  roomModal.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelectorAll(".room-photo").forEach((photo) => {
  photo.addEventListener("click", () => openRoomModal(photo.dataset.room));
  photo.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") openRoomModal(photo.dataset.room);
  });
});
document.getElementById("modalPrev").addEventListener("click", () => showModalFrame(modalFrame - 1));
document.getElementById("modalNext").addEventListener("click", () => showModalFrame(modalFrame + 1));
document.getElementById("closeRoomModal").addEventListener("click", closeRoomModal);
roomModal.addEventListener("click", (event) => { if (event.target === roomModal) closeRoomModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && roomModal.classList.contains("open")) closeRoomModal(); });
document.getElementById("modalViewer").addEventListener("pointerdown", (event) => {
  modalDragStart = event.clientX;
});
document.getElementById("modalViewer").addEventListener("pointerup", (event) => {
  if (modalDragStart === null || !selectedRoom) return;
  const distance = event.clientX - modalDragStart;
  if (Math.abs(distance) > 25) showModalFrame(modalFrame + (distance < 0 ? 1 : -1));
  modalDragStart = null;
});
