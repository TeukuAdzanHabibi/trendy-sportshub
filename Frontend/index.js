// Frontend/index.js

document.addEventListener('DOMContentLoaded', () => {
  const jenisSelect = document.getElementById('jenisSelect');
  const searchBtn = document.getElementById('searchBtn');

  // Inisialisasi peta
  const map = L.map('map').setView([-7.054, 110.442], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Ambil jenis olahraga dari backend API
  fetch('/api/options/jenis')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (!data.length) {
        throw new Error('Data jenis olahraga kosong.');
      }

      // Isi dropdown dengan opsi dari API
      data.forEach((item) => {
        const opt = document.createElement('option');
        opt.value = item.ID_Jenis;                // harus cocok dengan JSON
        opt.textContent = item.Nama_Olahraga;
        jenisSelect.appendChild(opt);
      });
    })
    .catch((err) => {
      console.error('Gagal memuat jenis olahraga:', err);
      const opt = document.createElement('option');
      opt.textContent = '❌ Gagal Memuat Data';
      opt.disabled = true;
      opt.selected = true;
      jenisSelect.appendChild(opt);
    });

  // Ketika tombol "Cari Venue" diklik
  searchBtn.addEventListener('click', () => {
    const selectedId = jenisSelect.value;

    if (!selectedId) {
      alert('Silakan pilih jenis cabang olahraga terlebih dahulu.');
      return;
    }

    // Redirect ke halaman result.html dengan parameter jenis
    window.location.href = `result.html?idJenis=${selectedId}`;
  });
});
