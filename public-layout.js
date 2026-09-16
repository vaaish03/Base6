const savedLayout = JSON.parse(localStorage.getItem("base6RoomLayout") || "null");
const publicCanvas = document.getElementById("publicLayoutCanvas");

if (savedLayout && publicCanvas) {
  const publicCtx = publicCanvas.getContext("2d");
  const roomSizes = {
    small: { width: 12, height: 10 },
    medium: { width: 16, height: 12 },
    large: { width: 20, height: 16 },
  };
  const room = roomSizes[savedLayout.roomSize] || roomSizes.medium;
  const padding = 45;
  const scale = Math.min((publicCanvas.width - padding * 2) / room.width, (publicCanvas.height - padding * 2) / room.height);
  const x0 = padding;
  const y0 = padding;
  const width = room.width * scale;
  const height = room.height * scale;
  const colors = { bed: "#aeb4bc", sofa: "#7c6bdb", table: "#d18d5b", desk: "#c98373", plant: "#6fa985", window: "#c7edff", cupboard: "#c47d45", bathroom: "#4c8df6" };

  publicCtx.fillStyle = "#d9f4ff";
  publicCtx.fillRect(0, 0, publicCanvas.width, publicCanvas.height);
  publicCtx.fillStyle = "#d9f4ff";
  publicCtx.strokeStyle = "#08b8f4";
  publicCtx.lineWidth = 6;
  publicCtx.beginPath();
  publicCtx.roundRect(x0, y0, width, height, 18);
  publicCtx.fill();
  publicCtx.stroke();
  publicCtx.fillStyle = "#fff";
  publicCtx.textAlign = "center";
  publicCtx.font = "bold 22px system-ui";
  publicCtx.fillText("Room 1", x0 + width / 2, y0 + height / 2 - 10);
  publicCtx.font = "bold 16px system-ui";
  publicCtx.fillText("BASE6 residence layout", x0 + width / 2, y0 + height / 2 + 20);

  savedLayout.items.forEach((item) => {
    const metaWidth = { bed: 4.8, sofa: 4.5, table: 2.5, desk: 3.8, plant: 1.2, window: 2.4, cupboard: 1.5, bathroom: 1.4 }[item.type] || 2;
    const metaHeight = { bed: 1.8, sofa: 1.6, table: 2.5, desk: 1.6, plant: 1.2, window: .7, cupboard: 1.5, bathroom: 1.4 }[item.type] || 2;
    const x = x0 + item.x * scale;
    const y = y0 + item.y * scale;
    publicCtx.save();
    publicCtx.translate(x, y);
    publicCtx.rotate(item.rotation || 0);
    publicCtx.fillStyle = item.color || colors[item.type] || "#999";
    publicCtx.beginPath();
    publicCtx.roundRect(-metaWidth * scale / 2, -metaHeight * scale / 2, metaWidth * scale, metaHeight * scale, 7);
    publicCtx.fill();
    publicCtx.fillStyle = "#fff";
    publicCtx.font = "bold 10px system-ui";
    publicCtx.fillText(item.label || item.type, 0, 3);
    publicCtx.restore();
  });

  document.getElementById("publicLayoutStatus").textContent = `Updated ${new Date(savedLayout.savedAt).toLocaleString()}`;
}
