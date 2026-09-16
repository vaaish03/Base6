const pgGallery = document.getElementById("pgGallery");
const pgImages = JSON.parse(localStorage.getItem("base6PgImages") || "[]");
const removedRooms = JSON.parse(localStorage.getItem("base6RemovedRooms") || "[]");

removedRooms.forEach((roomId) => {
  document.querySelectorAll(`.room-photo[data-room="${roomId}"]`).forEach((image) => {
    const stack = image.parentElement?.classList.contains("stack") ? image.parentElement : null;
    image.remove();
    if (stack && !stack.children.length) stack.remove();
  });
});

if (pgGallery && pgImages.length) {
  pgGallery.replaceChildren(...pgImages.map((src, index) => {
    const image = document.createElement("img");
    image.src = src;
    image.alt = `BASE6 PG residence photo ${index + 1}`;
    return image;
  }));
}
