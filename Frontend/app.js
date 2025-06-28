let map;
let addPointActive = false;
let vectorSource = new ol.source.Vector(); // Markerlar için bir kaynak oluşturuyoruz

// OpenLayers ile haritayı oluştur
function initMap() {
    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM(),
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([35.243322, 38.963745]), // Türkiye'nin koordinatları
            zoom: 6.5
        })
    });

    // Marker katmanını ekleyelim
    const markerLayer = new ol.layer.Vector({
        source: vectorSource
    });
    map.addLayer(markerLayer);

    // Haritada tıklama işlemi
    map.on('click', function (event) {
        if (addPointActive) {
            const coordinates = ol.proj.toLonLat(event.coordinate);
            const pointx = parseFloat(coordinates[0]);  // Longitude
            const pointy = parseFloat(coordinates[1]);  // Latitude

            openNamePanel(pointx, pointy);
            addPointActive = false; // Bir kez tıklayınca etkileşim sonlanır
        } else {
            // Marker üzerine tıklama kontrolü
            map.forEachFeatureAtPixel(event.pixel, function (feature) {
                const geometry = feature.getGeometry();
                const coordinates = ol.proj.toLonLat(geometry.getCoordinates());
                const name = feature.get('name');
                alert(`Marker Bilgileri: \nİsim: ${name} \nKoordinatlar: X=${coordinates[0]}, Y=${coordinates[1]}`);
            });
        }
    });

    // Sayfa yüklendiğinde backend'den mevcut noktaları çek
    fetchPointsFromBackend();
}

// Backend'den noktaları çekme ve haritaya ekleme
function fetchPointsFromBackend() {
    fetch('https://localhost:7184/api/Points')  // Backend API URL'ini kullan
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(points => {
            console.log(points);  // Gelen JSON verisini tarayıcı konsoluna yazdır
            points.forEach(point => {
                addMarker(point.pointX, point.pointY, point.name);  // Backend'den gelen verilerle marker ekleniyor
            });
        })
        .catch(error => console.error('Error fetching points:', error));
}

// Panel açma ve isim girme işlemi
function openNamePanel(x, y) {
    jsPanel.create({
        headerTitle: 'İsim Girin',
        position: 'center',
        contentSize: { width: 400, height: 200 },
        content: `
            <div>
                <label for="nameInput">Nokta İsmi:</label>
                <input type="text" id="nameInput" />
                <button id="saveNameBtn">Kaydet</button>
            </div>
        `,
        callback: function (panel) {
            document.getElementById('saveNameBtn').addEventListener('click', function () {
                const name = document.getElementById('nameInput').value;
                if (name) {
                    panel.close(); // Paneli kapat
                    addMarker(x, y, name); // Marker ekle
                    savePointToBackend(x, y, name); // Noktayı backend'e gönder
                } else {
                    alert("Lütfen bir isim girin!");
                }
            });
        }
    });
}

// Marker ekleme fonksiyonu (özelleştirilmiş stil ile)
function addMarker(x, y, name) {
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([x, y])),
        name: name // İsim ekleniyor
    });

    // Marker'ın stilini ayarlıyoruz (dolu, belirgin bir daire)
    const markerStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 9, // Daire büyüklüğü
            fill: new ol.style.Fill({
                color: '#FF0000' // Daire içi rengi (kırmızı)
            }),
            stroke: new ol.style.Stroke({
                color: '#000000', // Dış hat rengi (siyah)
                width: 2 // Dış hat kalınlığı
            })
        }),
        text: new ol.style.Text({
            text: name,
            offsetY: -15, // Yazıyı marker üstüne konumlandır
            fill: new ol.style.Fill({
                color: '#000000'
            })
        })
    });

    marker.setStyle(markerStyle);
    vectorSource.addFeature(marker); // Markerı kaynağa ekliyoruz
}

// Backend'e nokta kaydetme fonksiyonu
function savePointToBackend(x, y, name) {
    const point = {
        pointX: x,
        pointY: y,
        name: name
    };

    fetch('https://localhost:7184/api/Points', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(point),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Point saved:', data);
        })
        .catch(error => {
            console.error('Error saving point:', error);
        });
}

// Query Button Click Event
document.getElementById('queryBtn').addEventListener('click', () => {
    fetchPointsFromBackendAndShowInPanel();  // Veritabanındaki noktaları panelde göster
});

// Backend'den noktaları çekme ve açılan panelde gösterme
function fetchPointsFromBackendAndShowInPanel() {
    fetch('https://localhost:7184/api/Points')  // Backend API URL'ini kullan
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(points => {
            showPointsInPanel(points);  // Veritabanından gelen noktaları panelde göster
        })
        .catch(error => console.error('Error fetching points:', error));
}

// Noktaları açılan panelde gösterme fonksiyonu
function showPointsInPanel(points) {
    let content = '<ul>';
    points.forEach(point => {
        content += `<li>Koordinatlar: (${point.pointX}, ${point.pointY}), İsim: ${point.name}</li>`;
    });
    content += '</ul>';

    // Panel açma
    jsPanel.create({
        headerTitle: 'Noktalar',
        position: 'center',
        contentSize: { width: 400, height: 300 },
        content: content  // Veritabanından gelen noktaları içerik olarak ekliyoruz
    });
}

// Add Point Button Click Event
document.getElementById('addPointBtn').addEventListener('click', () => {
    addPointActive = true;
    alert("Haritada bir noktaya tıklayın ve marker ekleyin.");
});

// Haritayı başlat
initMap();
