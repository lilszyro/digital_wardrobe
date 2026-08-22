const categories = ["earrings", "necklaces", "bracelets", "rings", "bags"];
const outfitState = Object.fromEntries(categories.map((category) => [category, -1]));
const accessories = Object.fromEntries(categories.map((category) => [category, []]));

function openWardrobe() { return new Promise((resolve, reject) => { const request = indexedDB.open("digital-wardrobe", 1); request.onupgradeneeded = () => request.result.createObjectStore("clothes", { keyPath: "id", autoIncrement: true }); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }

function updateSlot(slot) {
  const category = slot.dataset.category; const items = accessories[category]; const image = slot.querySelector("img"); const placeholder = slot.querySelector(".placeholder"); const label = slot.querySelector("span"); const selected = items.length && outfitState[category] >= 0;
  image.hidden = !selected; placeholder.hidden = selected; slot.querySelectorAll(".outfit-arrow").forEach((button) => { button.disabled = !items.length; });
  if (selected) { const item = items[outfitState[category]]; if (image.src.startsWith("blob:")) URL.revokeObjectURL(image.src); image.src = URL.createObjectURL(item.image); image.alt = item.name; label.textContent = item.name; } else { label.textContent = category; }
}

async function loadAccessories() { const db = await openWardrobe(); const request = db.transaction("clothes", "readonly").objectStore("clothes").getAll(); request.onsuccess = () => { request.result.forEach((item) => { if (accessories[item.category]) accessories[item.category].push(item); }); document.querySelectorAll(".outfit-slot").forEach(updateSlot); }; }

document.querySelectorAll(".outfit-slot").forEach((slot) => { slot.addEventListener("click", (event) => { const arrow = event.target.closest(".outfit-arrow"); if (!arrow) return; const category = slot.dataset.category; const direction = arrow.classList.contains("next") ? 1 : -1; if (outfitState[category] < 0) outfitState[category] = direction > 0 ? 0 : accessories[category].length - 1; else outfitState[category] = (outfitState[category] + direction + accessories[category].length) % accessories[category].length; updateSlot(slot); }); });
document.getElementById("reset-outfit").addEventListener("click", () => { categories.forEach((category) => { outfitState[category] = -1; }); document.querySelectorAll(".outfit-slot").forEach(updateSlot); });
loadAccessories();
