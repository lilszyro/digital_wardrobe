const upload = document.getElementById("accessory-upload");
const category = document.getElementById("accessory-category");
const grid = document.getElementById("accessories-grid");
const emptyState = document.getElementById("empty-state");
const itemCount = document.getElementById("item-count");
const accessoryTypes = ["earrings", "necklaces", "bracelets", "rings", "bags"];

const database = new Promise((resolve, reject) => {
  const request = indexedDB.open("digital-wardrobe", 1);
  request.onupgradeneeded = () => request.result.createObjectStore("clothes", { keyPath: "id", autoIncrement: true });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

async function getStore(mode) { const db = await database; return db.transaction("clothes", mode).objectStore("clothes"); }
async function getAccessories() {
  const store = await getStore("readonly");
  return new Promise((resolve) => { const request = store.getAll(); request.onsuccess = () => resolve(request.result.filter((item) => accessoryTypes.includes(item.category))); });
}

async function renderAccessories() {
  const items = await getAccessories();
  grid.replaceChildren(); emptyState.hidden = items.length > 0;
  itemCount.textContent = `${items.length} ${items.length === 1 ? "piece" : "pieces"}`;
  items.reverse().forEach((item) => {
    const card = document.createElement("figure"); card.className = "clothing-card";
    const image = document.createElement("img"); image.src = URL.createObjectURL(item.image); image.alt = item.name;
    const caption = document.createElement("figcaption"); caption.textContent = `${item.name} · ${item.category}`;
    const remove = document.createElement("button"); remove.className = "delete-item"; remove.type = "button"; remove.setAttribute("aria-label", `Remove ${item.name}`); remove.textContent = "×";
    remove.addEventListener("click", async () => { const store = await getStore("readwrite"); store.delete(item.id).onsuccess = renderAccessories; });
    card.append(image, caption, remove); grid.append(card);
  });
}

upload.addEventListener("change", async () => {
  const files = [...upload.files].filter((file) => file.type.startsWith("image/")); const store = await getStore("readwrite");
  files.forEach((file) => store.add({ name: file.name.replace(/\.[^.]+$/, ""), category: category.value, image: file }));
  store.transaction.oncomplete = () => { upload.value = ""; renderAccessories(); };
});
renderAccessories();
