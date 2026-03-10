// 1. Data Dummy (Tetap sama seperti sebelumnya)
let menuData = [
    { id: 1, name: "Seasoning Pokpok Chicken", price: 33884, category: "Appetizer", stock: 15, parstock: 10, image: "pokpok.jpg" },
    { id: 2, name: "Roti Pisang Bakar", price: 42975, category: "Dessert", stock: 5, parstock: 10, image: "roti.jpg" },
    { id: 3, name: "Singkong Goreng", price: 45455, category: "Appetizer", stock: 20, parstock: 10, image: "singkong.jpg" },
    { id: 4, name: "Sup Buntut", price: 125620, category: "Main Course", stock: 8, parstock: 5, image: "sup.jpg" }
];

const menuGrid = document.querySelector('.menu-grid');
const searchInput = document.querySelector('.search-input');
const categorySelect = document.querySelector('.category-select');

// 2. Fungsi Render Kartu Menu (Tetap menyertakan logika Parstock)
function renderMenu(data) {
    menuGrid.innerHTML = ""; 
    data.forEach(item => {
        const isLowStock = item.stock < item.parstock;
        const stockStyle = isLowStock ? "color: #ff4d4d; font-weight: bold;" : "color: #666;";

        const card = `
            <div class="menu-card" id="menu-${item.id}">
                <div class="card-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="card-body">
                    <h3 class="menu-title">${item.name}</h3>
                    <p class="menu-price">Rp ${item.price.toLocaleString('id-ID')}</p>
                    <p style="font-size: 0.85rem; margin-bottom: 12px; ${stockStyle}">
                        Stok: ${item.stock} ${isLowStock ? '(Low Stock!)' : ''}
                    </p>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="editItem(${item.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteItem(${item.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
        menuGrid.innerHTML += card;
    });
}

// 3. Fungsi Hapus Data (Delete)
function deleteItem(id) {
    // Memberikan konfirmasi sebelum menghapus sesuai prinsip UI yang baik
    if (confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
        // Memfilter data untuk membuang ID yang dipilih
        menuData = menuData.filter(item => item.id !== id);
        // Render ulang tampilan agar perubahan langsung terlihat
        renderMenu(menuData);
    }
}

// 4. Fungsi Edit Data (Placeholder)
function editItem(id) {
    const item = menuData.find(i => i.id === id);
    alert("Fitur Edit untuk: " + item.name + " (ID: " + id + ") akan segera hadir!");
    // Di sini nantinya kita akan memunculkan Modal/Pop-up form edit
}

// 5. Logika Pencarian & Filter (Tetap aktif)
searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filteredData = menuData.filter(item => item.name.toLowerCase().includes(keyword));
    renderMenu(filteredData);
});

categorySelect.addEventListener('change', (e) => {
    const selected = e.target.value;
    const filteredData = (selected === "Category" || selected === "") 
        ? menuData 
        : menuData.filter(item => item.category === selected);
    renderMenu(filteredData);
});

// Inisialisasi awal
renderMenu(menuData);