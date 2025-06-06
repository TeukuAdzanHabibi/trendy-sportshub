// frontend/result.js

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener('DOMContentLoaded', () => {
  const idJenis = getQueryParam('idJenis');
  const resultsContainer = document.getElementById('resultsContainer');

  if (!idJenis) {
    resultsContainer.innerText = '❌ Jenis olahraga tidak ditemukan.';
    return;
  }

  fetch(`/api/lapangan?idJenis=${idJenis}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((geojson) => {
      const { features } = geojson;
      if (!features.length) {
        resultsContainer.innerText = '🚫 Tidak ada venue ditemukan.';
        return;
      }

      // Init peta Leaflet, lempar centroid awal ke marker pertama
      const [lon, lat] = features[0].geometry.coordinates;
      const map = L.map('map').setView([lat, lon], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const markers = [];

      features.forEach((feature) => {
        const { coordinates } = feature.geometry;
        const p = feature.properties;
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
          <h4>${p.Nama_Lapangan}</h4>
          <p>${p.Lokasi}</p>
          <p class="jenis">Jenis: ${p.Nama_Olahraga}</p>
        `;
        resultsContainer.appendChild(card);

        const marker = L.marker([coordinates[1], coordinates[0]]).bindPopup(
          `<strong>${p.Nama_Lapangan}</strong><br>${p.Lokasi}<br><em>${p.Nama_Olahraga}</em>`
        );
        marker.addTo(map);
        markers.push(marker);
      });

      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    })
    .catch((err) => {
      console.error('❌ Gagal memuat data lapangan:', err);
      resultsContainer.innerText = '⚠️ Terjadi kesalahan saat memuat data.';
    });
});
