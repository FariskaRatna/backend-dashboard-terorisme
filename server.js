const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MOCK_CITIES = [
  { id: 1, name: "Jakarta", prov: "DKI Jakarta", lat: -6.2088, lng: 106.8456, total: 36, ideologies: { "ISIS": 15, "JI": 10, "FPI": 6, "NII": 5 } },
  { id: 2, name: "Morowali", prov: "Sulawesi Tengah", lat: -1.8893, lng: 121.9362, total: 2, ideologies: { "JI": 1, "MIT": 1 } },
  { id: 3, name: "Surabaya", prov: "Jawa Timur", lat: -7.2504, lng: 112.7688, total: 12, ideologies: { "JAD": 6, "ISIS": 4, "AQ": 2 } },
  { id: 4, name: "Makassar", prov: "Sulawesi Selatan", lat: -5.1476, lng: 119.4327, total: 8, ideologies: { "JAD": 4, "MIT": 2, "KHI": 2 } },
  { id: 5, name: "Poso", prov: "Sulawesi Tengah", lat: -1.3945, lng: 120.7335, total: 18, ideologies: { "MIT": 12, "JI": 4, "MMI": 2 } },
  { id: 6, name: "Medan", prov: "Sumatera Utara", lat: 3.5952, lng: 98.6722, total: 7, ideologies: { "JAD": 4, "MPI": 2, "ISIS": 1 } },
  { id: 7, name: "Bima", prov: "Nusa Tenggara Barat", lat: -8.4627, lng: 118.7286, total: 5, ideologies: { "JAD": 3, "NII": 2 } },
];

app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running perfectly!' });
});

app.get('/api/clusters', (req, res) => {
    res.json(MOCK_CITIES);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});