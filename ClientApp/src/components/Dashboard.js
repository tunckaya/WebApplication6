import React, { useState, useEffect, useRef } from 'react';
import { LogOut, MapPin, Plus, Search, Target, Trash2, Route, Navigation2, X } from 'lucide-react';
import L from 'leaflet';

const Dashboard = ({ onLogout }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [isSelectingRoute, setIsSelectingRoute] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapPoints, setMapPoints] = useState([
    { 
      id: 1, 
      lat: 39.925533, 
      lng: 32.866287, 
      name: "Ankara Merkez", 
      type: "city", 
      description: "Ankara şehir merkezi",
      createdAt: new Date().toLocaleDateString()
    },
    { 
      id: 2, 
      lat: 39.919200, 
      lng: 32.854600, 
      name: "Kızılay", 
      type: "district", 
      description: "Kızılay meydanı",
      createdAt: new Date().toLocaleDateString()
    },
    { 
      id: 3, 
      lat: 39.928800, 
      lng: 32.842100, 
      name: "Anıtkabir", 
      type: "monument", 
      description: "Atatürk Anıtı",
      createdAt: new Date().toLocaleDateString()
    },
    { 
      id: 4, 
      lat: 39.940000, 
      lng: 32.860000, 
      name: "Çankaya", 
      type: "district", 
      description: "Çankaya ilçesi",
      createdAt: new Date().toLocaleDateString()
    },
    { 
      id: 5, 
      lat: 39.890000, 
      lng: 32.780000, 
      name: "Gölbaşı", 
      type: "lake", 
      description: "Gölbaşı gölü",
      createdAt: new Date().toLocaleDateString()
    }
  ]);

  const pointTypes = {
    city: { color: '#ef4444', icon: '🏙️', label: 'Şehir' },
    district: { color: '#3b82f6', icon: '🏘️', label: 'İlçe' },
    monument: { color: '#10b981', icon: '🏛️', label: 'Anıt' },
    lake: { color: '#06b6d4', icon: '🏞️', label: 'Doğal Alan' },
    custom: { color: '#8b5cf6', icon: '📍', label: 'Özel Nokta' }
  };

  // Ankara koordinatları
  const ankaraCenter = [39.925533, 32.866287];

  // Haversine formula ile mesafe hesaplama (km cinsinden)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // OpenRouteService API ile rota hesaplama (gerçek yol güzergahı)
  const calculateRoute = async (startPoint, endPoint) => {
    try {
      // Basit düz çizgi rotası (API olmadan)
      const distance = calculateDistance(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
      
      // Simüle edilmiş rota bilgisi
      const routeData = {
        distance: distance,
        duration: (distance / 50) * 60, // 50 km/h ortalama hız varsayımı
        coordinates: [
          [startPoint.lng, startPoint.lat],
          [endPoint.lng, endPoint.lat]
        ],
        startPoint: startPoint,
        endPoint: endPoint
      };

      return routeData;
    } catch (error) {
      console.error('Rota hesaplama hatası:', error);
      return null;
    }
  };

  // Custom marker oluştur
  const createCustomIcon = (color, emoji, isSelected = false) => {
    const borderColor = isSelected ? '#fbbf24' : 'white';
    const borderWidth = isSelected ? '4px' : '3px';
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: ${borderWidth} solid ${borderColor};
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          font-weight: bold;
          cursor: pointer;
        ">${emoji}</div>
      `,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  // Rota çizme
  const drawRoute = (routeData) => {
    if (!mapInstanceRef.current) return;

    // Önceki rotayı temizle
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
    }

    // Yeni rota çiz
    const latlngs = routeData.coordinates.map(coord => [coord[1], coord[0]]);
    routeLayerRef.current = L.polyline(latlngs, {
      color: '#ef4444',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 5'
    }).addTo(mapInstanceRef.current);

    // Haritayı rotaya fit et
    const bounds = L.latLngBounds(latlngs);
    mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
  };

  const handleAddPoint = () => {
    console.log('handleAddPoint çağrıldı, mevcut isAddingPoint:', isAddingPoint);
    
    if (!isAddingPoint) {
      setIsAddingPoint(true);
      setIsSelectingRoute(false); // Rota seçimi modunu kapat
      console.log('Nokta ekleme modu aktif edildi');
      alert('Haritaya tıklayarak yeni nokta ekleyebilirsiniz!');
    } else {
      setIsAddingPoint(false);
      console.log('Nokta ekleme modu iptal edildi');
    }
  };

  const handleRouteMode = () => {
    if (!isSelectingRoute) {
      setIsSelectingRoute(true);
      setIsAddingPoint(false); // Nokta ekleme modunu kapat
      setRoutePoints([]);
      setRouteInfo(null);
      // Önceki rotayı temizle
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      alert('Rota hesaplamak için iki nokta seçin!');
    } else {
      setIsSelectingRoute(false);
      setRoutePoints([]);
      setRouteInfo(null);
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
    }
  };

  const handlePointClick = async (point) => {
    if (isSelectingRoute) {
      if (routePoints.length === 0) {
        // İlk nokta seçimi
        setRoutePoints([point]);
        alert(`Başlangıç noktası: ${point.name}\nŞimdi bitiş noktasını seçin.`);
      } else if (routePoints.length === 1) {
        // İkinci nokta seçimi ve rota hesaplama
        const startPoint = routePoints[0];
        const endPoint = point;
        
        if (startPoint.id === endPoint.id) {
          alert('Aynı noktayı seçemezsiniz! Farklı bir nokta seçin.');
          return;
        }

        setRoutePoints([startPoint, endPoint]);
        
        // Rota hesapla
        const routeData = await calculateRoute(startPoint, endPoint);
        
        if (routeData) {
          setRouteInfo(routeData);
          drawRoute(routeData);
          alert(`Rota hesaplandı!\nMesafe: ${routeData.distance.toFixed(2)} km\nTahmini süre: ${Math.round(routeData.duration)} dakika`);
        } else {
          alert('Rota hesaplanamadı!');
        }
      } else {
        // Yeni rota başlat
        setRoutePoints([point]);
        setRouteInfo(null);
        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
        }
        alert(`Yeni rota başlatıldı.\nBaşlangıç noktası: ${point.name}\nBitiş noktasını seçin.`);
      }
    } else {
      setSelectedPoint(point);
    }
  };

  const handleMapClick = React.useCallback((latlng) => {
    console.log('handleMapClick çağrıldı!');
    console.log('Koordinatlar:', latlng);
    console.log('isAddingPoint durumu:', isAddingPoint);
    
    if (!isAddingPoint) {
      console.log('Nokta ekleme modu aktif değil, işlem iptal ediliyor');
      return;
    }

    const pointName = prompt('Nokta adı girin:');
    console.log('Girilen nokta adı:', pointName);
    
    if (!pointName || pointName.trim() === '') {
      console.log('Nokta adı boş, işlem iptal ediliyor');
      setIsAddingPoint(false);
      return;
    }

    const pointDescription = prompt('Nokta açıklaması girin (opsiyonel):');
    console.log('Girilen açıklama:', pointDescription);
    
    const newPoint = {
      id: Date.now(),
      lat: latlng.lat,
      lng: latlng.lng,
      name: pointName.trim(),
      type: 'custom',
      description: pointDescription?.trim() || 'Kullanıcı tarafından eklenen nokta',
      createdAt: new Date().toLocaleDateString()
    };
    
    console.log('Yeni nokta oluşturuluyor:', newPoint);
    
    setMapPoints(prevPoints => {
      const updatedPoints = [...prevPoints, newPoint];
      console.log('Güncellenmiş nokta listesi:', updatedPoints);
      return updatedPoints;
    });
    
    setSelectedPoint(newPoint);
    setIsAddingPoint(false);
    
    console.log('Nokta başarıyla eklendi, ekleme modu kapatıldı');
    alert(`"${newPoint.name}" noktası başarıyla eklendi!`);
  }, [isAddingPoint, mapPoints]);

  // Haritayı başlat
  useEffect(() => {
    console.log('Harita useEffect çalışıyor');
    
    if (mapRef.current && !mapInstanceRef.current) {
      console.log('Harita oluşturuluyor...');
      
      mapInstanceRef.current = L.map(mapRef.current).setView(ankaraCenter, 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      L.control.zoom({
        position: 'topright'
      }).addTo(mapInstanceRef.current);
      
      console.log('Harita başarıyla oluşturuldu');
    }

    return () => {
      if (mapInstanceRef.current) {
        console.log('Harita temizleniyor...');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Harita click event'ini ayrı useEffect'te yönet
  useEffect(() => {
    if (mapInstanceRef.current) {
      console.log('Harita click event güncelleniyor, isAddingPoint:', isAddingPoint);
      
      mapInstanceRef.current.off('click');
      
      mapInstanceRef.current.on('click', (e) => {
        console.log('Harita click event tetiklendi');
        console.log('Event koordinatları:', e.latlng);
        console.log('Güncel isAddingPoint:', isAddingPoint);
        
        if (isAddingPoint) {
          console.log('Nokta ekleme modu aktif, handleMapClick çağrılıyor');
          handleMapClick(e.latlng);
        } else {
          console.log('Nokta ekleme modu aktif değil');
        }
      });
    }
  }, [isAddingPoint, handleMapClick]);

  // Markerları güncelle
  useEffect(() => {
    if (mapInstanceRef.current) {
      console.log('Markerlar güncelleniyor...');
      
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      const filteredPoints = mapPoints.filter(point => 
        point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        point.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      console.log('Filtrelenmiş noktalar:', filteredPoints);

      filteredPoints.forEach(point => {
        const isInRoute = routePoints.some(rp => rp.id === point.id);
        const marker = L.marker([point.lat, point.lng], {
          icon: createCustomIcon(pointTypes[point.type]?.color, pointTypes[point.type]?.icon, isInRoute)
        }).addTo(mapInstanceRef.current);

        const popupContent = `
          <div style="min-width: 200px; padding: 10px;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${point.name}</h4>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${point.description}</p>
            <div style="margin: 8px 0; font-size: 12px; color: #888;">
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="margin-right: 8px;">${pointTypes[point.type]?.icon}</span>
                <span>${pointTypes[point.type]?.label}</span>
              </div>
              <div>Lat: ${point.lat.toFixed(6)}</div>
              <div>Lng: ${point.lng.toFixed(6)}</div>
              <div>Eklenme: ${point.createdAt}</div>
            </div>
            ${point.type === 'custom' ? `
              <button 
                onclick="window.deletePoint(${point.id})"
                style="
                  width: 100%; 
                  padding: 6px 12px; 
                  background-color: #ef4444; 
                  color: white; 
                  border: none; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  font-size: 12px;
                  margin-top: 8px;
                "
              >
                Noktayı Sil
              </button>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        
        marker.on('click', (e) => {
          if (!isAddingPoint) {
            handlePointClick(point);
          }
          e.originalEvent.stopPropagation();
        });

        markersRef.current.push(marker);
      });
      
      console.log('Markerlar güncellendi, toplam:', markersRef.current.length);
    }
  }, [mapPoints, searchQuery, isAddingPoint, routePoints]);

  // Global delete function
  useEffect(() => {
    window.deletePoint = (pointId) => {
      console.log('Nokta siliniyor, ID:', pointId);
      if (window.confirm('Bu noktayı silmek istediğinizden emin misiniz?')) {
        setMapPoints(prev => {
          const filtered = prev.filter(point => point.id !== pointId);
          console.log('Nokta silindi, yeni liste:', filtered);
          return filtered;
        });
        setSelectedPoint(null);
        
        // Eğer silinen nokta rotada varsa rotayı temizle
        if (routePoints.some(rp => rp.id === pointId)) {
          setRoutePoints([]);
          setRouteInfo(null);
          if (routeLayerRef.current) {
            mapInstanceRef.current.removeLayer(routeLayerRef.current);
            routeLayerRef.current = null;
          }
        }
      }
    };

    return () => {
      delete window.deletePoint;
    };
  }, [routePoints]);

  const handleGoToLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error('Konum alınamadı:', error);
          alert('Konum bilgisi alınamadı. Lütfen konum izinlerini kontrol edin.');
        }
      );
    } else {
      alert('Bu tarayıcı konum özelliğini desteklemiyor.');
    }
  };

  const filteredPoints = mapPoints.filter(point => 
    point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    point.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm-px-6 lg-px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r p-2 rounded-lg" style={{background: 'linear-gradient(to right, #22d3ee, #3b82f6)'}}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">GeoPoint</h1>
              <span className="ml-2 text-sm text-gray-500">Harita Yönetimi & Rota Planlama</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 translate-y-neg-half text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nokta ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{user.avatar}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm-px-6 lg-px-8">
        <div className="px-4 py-6 sm-px-0">
          <div className="grid grid-cols-1 lg-grid-cols-4 gap-6">
            
            {/* Map Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Map Toolbar */}
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAddPoint}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isAddingPoint 
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-md'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAddingPoint ? 'İptal Et' : 'Nokta Ekle'}</span>
                    </button>

                    <button
                      onClick={handleRouteMode}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSelectingRoute 
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md'
                      }`}
                    >
                      <Route className="w-4 h-4" />
                      <span>{isSelectingRoute ? 'Rota İptal' : 'Rota Hesapla'}</span>
                    </button>

                    <button
                      onClick={handleGoToLocation}
                      className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-colors shadow-md"
                    >
                      <Target className="w-4 h-4" />
                      <span>Konumum</span>
                    </button>
                    
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg text-sm">
                      <span className="text-blue-700 font-medium">Toplam: {mapPoints.length} nokta</span>
                    </div>
                    
                    {searchQuery && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-lg text-sm">
                        <span className="text-cyan-700 font-medium">Filtrelenmiş: {filteredPoints.length}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {isAddingPoint && '🖱️ Haritaya tıklayarak nokta ekleyin'}
                    {isSelectingRoute && `🎯 ${routePoints.length === 0 ? 'Başlangıç noktasını seçin' : routePoints.length === 1 ? 'Bitiş noktasını seçin' : 'Yeni rota için nokta seçin'}`}
                  </div>
                </div>

                {/* Route Info Panel */}
                {routeInfo && (
                  <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border-t border-blue-200 px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Navigation2 className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            {routeInfo.startPoint.name} → {routeInfo.endPoint.name}
                          </span>
                        </div>
                        <div className="text-sm text-blue-700 bg-white px-2 py-1 rounded-md shadow-sm">
                          📏 {routeInfo.distance.toFixed(2)} km
                        </div>
                        <div className="text-sm text-blue-700 bg-white px-2 py-1 rounded-md shadow-sm">
                          ⏱️ ~{Math.round(routeInfo.duration)} dk
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setRouteInfo(null);
                          setRoutePoints([]);
                          if (routeLayerRef.current) {
                            mapInstanceRef.current.removeLayer(routeLayerRef.current);
                            routeLayerRef.current = null;
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-white rounded-full p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Real Map Container */}
                <div 
                  ref={mapRef} 
                  style={{ height: '600px', width: '100%' }}
                  className="relative"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Route Info */}
              {isSelectingRoute && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rota Hesaplama</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      {routePoints.length === 0 && "Başlangıç noktasını seçin"}
                      {routePoints.length === 1 && (
                        <div>
                          <div className="font-medium text-green-600">✓ Başlangıç: {routePoints[0].name}</div>
                          <div className="text-gray-500">Bitiş noktasını seçin</div>
                        </div>
                      )}
                      {routePoints.length === 2 && routeInfo && (
                        <div className="space-y-2">
                          <div className="font-medium text-green-600">✓ Rota hesaplandı!</div>
                          <div className="text-sm bg-gray-50 p-3 rounded">
                            <div><strong>Başlangıç:</strong> {routeInfo.startPoint.name}</div>
                            <div><strong>Bitiş:</strong> {routeInfo.endPoint.name}</div>
                            <div><strong>Mesafe:</strong> {routeInfo.distance.toFixed(2)} km</div>
                            <div><strong>Süre:</strong> ~{Math.round(routeInfo.duration)} dakika</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Point Info */}
              {selectedPoint && !isSelectingRoute && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Seçili Nokta</h3>
                  <div className="space-y-2">
                    <div className="font-medium">{selectedPoint.name}</div>
                    <div className="text-sm text-gray-600">{selectedPoint.description}</div>
                    <div className="flex items-center text-sm">
                      <span className="mr-2">{pointTypes[selectedPoint.type]?.icon}</span>
                      <span>{pointTypes[selectedPoint.type]?.label}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedPoint.lat.toFixed(6)}, {selectedPoint.lng.toFixed(6)}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Nokta:</span>
                    <span className="font-semibold">{mapPoints.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Özel Noktalar:</span>
                    <span className="font-semibold">{mapPoints.filter(p => p.type === 'custom').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aktif Filtre:</span>
                    <span className="font-semibold">{searchQuery ? 'Var' : 'Yok'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rota Durumu:</span>
                    <span className="font-semibold">{routeInfo ? 'Hesaplandı' : 'Yok'}</span>
                  </div>
                  {routeInfo && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mesafe:</span>
                        <span className="font-semibold">{routeInfo.distance.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tahmini Süre:</span>
                        <span className="font-semibold">{Math.round(routeInfo.duration)} dk</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Point Types Legend */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nokta Türleri</h3>
                <div className="space-y-3">
                  {Object.entries(pointTypes).map(([key, type]) => {
                    const count = mapPoints.filter(p => p.type === key).length;
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: type.color }}
                          ></div>
                          <span className="text-sm">{type.icon}</span>
                          <span className="text-sm text-gray-700">{type.label}</span>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Map Controls Help */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Harita Kontrolleri</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>🖱️ Nokta Ekle: Butona tıklayın, sonra haritaya tıklayın</div>
                  <div>🛣️ Rota Hesapla: Butona tıklayın, 2 nokta seçin</div>
                  <div>📍 Nokta Seç: Haritadaki noktalara tıklayın</div>
                  <div>🔍 Zoom: Mouse tekerleği veya +/- butonları</div>
                  <div>📍 Konum: "Konumum" butonuna tıklayın</div>
                  <div>🗑️ Sil: Özel noktaları popup'tan silebilirsiniz</div>
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                    <strong>Rota İpuçları:</strong><br/>
                    • Sarı kenarlı noktalar rota için seçilmiş<br/>
                    • Kırmızı çizgi hesaplanan rotayı gösterir<br/>
                    • Mesafe kuş uçuşu hesaplanır
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;