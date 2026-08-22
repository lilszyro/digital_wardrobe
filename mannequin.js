const outfitState = { tops: -1, bottoms: -1, shoes: -1 };
const wardrobe = { tops: [], bottoms: [], shoes: [] };

function openWardrobe() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("digital-wardrobe", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("clothes", { keyPath: "id", autoIncrement: true });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function updateSlot(slot) {
  const category = slot.dataset.category;
  const items = wardrobe[category];
  const image = slot.querySelector("img");
  const placeholder = slot.querySelector(".placeholder");
  const label = slot.querySelector(".item-display span");
  const hasSelection = items.length > 0 && outfitState[category] >= 0;
  image.hidden = !hasSelection;
  placeholder.hidden = hasSelection;
  slot.querySelectorAll(".outfit-arrow").forEach((button) => { button.disabled = items.length === 0; });
  if (hasSelection) {
    const selected = items[outfitState[category]];
    if (image.src.startsWith("blob:")) URL.revokeObjectURL(image.src);
    image.src = URL.createObjectURL(selected.image);
    image.alt = selected.name;
    label.textContent = selected.name;
  } else {
    label.textContent = category === "bottoms" ? "trousers" : category;
  }
}

async function loadClothes() {
  const db = await openWardrobe();
  const request = db.transaction("clothes", "readonly").objectStore("clothes").getAll();
  request.onsuccess = () => {
    request.result.forEach((item) => {
      const category = item.category || "tops";
      if (wardrobe[category]) wardrobe[category].push(item);
    });
    document.querySelectorAll(".outfit-slot").forEach(updateSlot);
  };
}

document.querySelectorAll(".outfit-slot").forEach((slot) => {
  slot.addEventListener("click", (event) => {
    const arrow = event.target.closest(".outfit-arrow");
    if (!arrow) return;
    const category = slot.dataset.category;
    const direction = arrow.classList.contains("next") ? 1 : -1;
    if (outfitState[category] < 0) {
      outfitState[category] = direction > 0 ? 0 : wardrobe[category].length - 1;
    } else {
      outfitState[category] = (outfitState[category] + direction + wardrobe[category].length) % wardrobe[category].length;
    }
    updateSlot(slot);
  });
});

document.getElementById("reset-outfit").addEventListener("click", () => {
  Object.keys(outfitState).forEach((category) => { outfitState[category] = -1; });
  document.querySelectorAll(".outfit-slot").forEach(updateSlot);
});

loadClothes();
