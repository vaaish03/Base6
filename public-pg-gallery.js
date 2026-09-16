const pgGallery = document.getElementById("pgGallery");
const pgImages = JSON.parse(localStorage.getItem("base6PgImages") || "[]");

if (pgGallery && pgImages.length) {
  pgGallery.replaceChildren(...pgImages.map((src, index) => {
    const image = document.createElement("img");
    image.src = src;
    image.alt = `BASE6 PG residence photo ${index + 1}`;
    return image;
  }));
}
