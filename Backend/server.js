// Backend/server.js

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Path absolut ke folder JSON dan Frontend
const jsonPath = path.join(__dirname, '../JSONOY');
const frontendPath = path.join(__dirname, '../Frontend');

// Middleware: serve file statis dari folder Frontend
app.use(express.static(frontendPath));

// Helper: baca file JSON secara sinkron dan aman
function loadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Gagal baca file ${filePath}:`, err.message);
    return null;
  }
}

// === API ROUTES ===

// 1. Ambil daftar jenis olahraga
app.get('/api/options/jenis', (req, res) => {
  const jenisFile = path.join(jsonPath, 'jenis_olahraga.json');
  const data = loadJson(jenisFile);
  if (!data) return res.status(500).json({ error: 'Gagal membaca jenis olahraga' });
  res.json(data);
});

// 2. Ambil daftar lapangan berdasarkan ID_Jenis
app.get('/api/venues', (req, res) => {
  const idJenis = parseInt(req.query.idjenis);
  if (!idJenis) return res.status(400).json({ error: 'Parameter idjenis wajib' });

  const lapanganFile = path.join(jsonPath, 'data.json');
  const data = loadJson(lapanganFile);
  if (!data) return res.status(500).json({ error: 'Gagal membaca data lapangan' });

  const hasil = data
    .filter((item) => item.ID_Jenis === idJenis)
    .map((item) => ({
      nama_lapangan: item.Nama_Lapangan,
      lokasi: item.Lokasi,
      koordinat_x: item.Koordinat_X,
      koordinat_y: item.Koordinat_Y
    }));

  res.json(hasil);
});

// 3. Kembalikan GeoJSON FeatureCollection untuk Leaflet (result.js)
app.get('/api/lapangan', (req, res) => {
  const idJenis = parseInt(req.query.idJenis);
  if (!idJenis) return res.status(400).json({ error: 'Parameter idJenis wajib' });

  const dataFile = path.join(jsonPath, 'data.json');
  const jenisFile = path.join(jsonPath, 'jenis_olahraga.json');
  const lapangan = loadJson(dataFile);
  const jenis = loadJson(jenisFile);

  if (!lapangan || !jenis) return res.status(500).json({ error: 'Gagal baca data JSON' });

  const jenisMap = {};
  jenis.forEach(j => jenisMap[j.ID_Jenis] = j.Nama_Olahraga);

  const features = lapangan
    .filter(item => item.ID_Jenis === idJenis)
    .map(item => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [item.Koordinat_Y, item.Koordinat_X] // [lng, lat]
      },
      properties: {
        ID_Lapangan: item.ID_Lapangan,
        Nama_Lapangan: item.Nama_Lapangan,
        Lokasi: item.Lokasi,
        Kualitas_Lapangan: item.Kualitas_Lapangan,
        Status_Ketersediaan: item.Status_Ketersediaan,
        ID_Jenis: item.ID_Jenis,
        Nama_Olahraga: jenisMap[item.ID_Jenis] || 'Tidak Diketahui'
      }
    }));

  res.json({ type: 'FeatureCollection', features });
});

// Fallback ke index.html jika rute tidak cocok
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
