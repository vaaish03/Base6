const ADMIN_SESSION_KEY = "base6AdminSession";
const LAYOUT_STORAGE_KEY = "base6RoomLayout";
const ADMIN_ROOM_CONFIGS_KEY = "base6RoomLayouts";
const ADMIN_PG_IMAGES_KEY = "base6PgImages";

if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== "signed-in") {
  window.location.replace("admin.html");
}

document.getElementById("logout").addEventListener("click", () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.replace("admin.html");
});

function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

document.getElementById("saveLayout").addEventListener("click", async () => {
  const state = window.base6Tool.getState();
  const configs = JSON.parse(localStorage.getItem(ADMIN_ROOM_CONFIGS_KEY) || "{}");
  const uploadedFrames = state.uploadedFiles.length
    ? await Promise.all(state.uploadedFiles.map(fileAsDataUrl))
    : state.frames;
  const existingPgImages = JSON.parse(localStorage.getItem(ADMIN_PG_IMAGES_KEY) || "[]");
  const newPgImages = state.pgFiles.length
    ? await Promise.all(state.pgFiles.map(fileAsDataUrl))
    : [];
  configs[state.roomId] = {
    roomSize: state.roomSize,
    roomStyle: state.roomStyle,
    items: state.items,
    frames: uploadedFrames,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(ADMIN_ROOM_CONFIGS_KEY, JSON.stringify(configs));
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(configs[state.roomId]));
  localStorage.setItem(ADMIN_PG_IMAGES_KEY, JSON.stringify([...existingPgImages, ...newPgImages]));
  document.getElementById("saveStatus").textContent = "Saved for the selected room image. The public site now uses it.";
});
