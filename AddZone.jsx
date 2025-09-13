// AddZone.jsx
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase'; // Import your Firebase configuration
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import '../../AddZone.css';

const AddZone = () => {
  // States to manage form data
  const [zoneName, setZoneName] = useState('');
  const [zonePopulation, setZonePopulation] = useState('');
  const [zoneArea, setZoneArea] = useState('');
  const [zoneCapital, setZoneCapital] = useState('');
  const [zoneDescription, setZoneDescription] = useState('');
  const [zones, setZones] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedGovernorate, setSelectedGovernorate] = useState(null);
  const mapRef = useRef(null);
  const mapInitialized = useRef(false);

  // Governorates data
  const governoratesData = {
    tunis: { 
      name: "Tunis", 
      population: "1056247", 
      area: "346", 
      capital: "Tunis",
      coords: [36.8, 10.18],
      description: "Capital of Tunisia"
    },
    ariana: { 
      name: "Ariana", 
      population: "576088", 
      area: "482", 
      capital: "Ariana",
      coords: [36.8625, 10.1956],
      description: "Northern governorate of Tunis"
    },
    benArous: { 
      name: "Ben Arous", 
      population: "631842", 
      area: "761", 
      capital: "Ben Arous",
      coords: [36.7531, 10.2189],
      description: "Important industrial governorate"
    },
    manouba: { 
      name: "Manouba", 
      population: "379518", 
      area: "1137", 
      capital: "Manouba",
      coords: [36.8081, 10.0972],
      description: "University governorate"
    },
    nabeul: { 
      name: "Nabeul", 
      population: "787920", 
      area: "2788", 
      capital: "Nabeul",
      coords: [36.4561, 10.7376],
      description: "Region known for its pottery and beaches"
    },
    bizerte: { 
      name: "Bizerte", 
      population: "568219", 
      area: "3685", 
      capital: "Bizerte",
      coords: [37.2744, 9.8739],
      description: "Strategic port in northern Tunisia"
    },
    beja: { 
      name: "Béja", 
      population: "303032", 
      area: "3558", 
      capital: "Béja",
      coords: [36.7256, 9.1817],
      description: "Important agricultural region"
    },
    jendouba: { 
      name: "Jendouba", 
      population: "401477", 
      area: "3102", 
      capital: "Jendouba",
      coords: [36.5011, 8.7803],
      description: "Border region with Algeria"
    },
    kef: { 
      name: "Le Kef", 
      population: "243156", 
      area: "4965", 
      capital: "Le Kef",
      coords: [36.1822, 8.7149],
      description: "Mountainous region in the northwest"
    },
    kairouan: { 
      name: "Kairouan", 
      population: "570559", 
      area: "6712", 
      capital: "Kairouan",
      coords: [35.6711, 10.1008],
      description: "Holy city of Islam"
    },
    kasserine: { 
      name: "Kasserine", 
      population: "439243", 
      area: "8066", 
      capital: "Kasserine",
      coords: [35.1673, 8.8365],
      description: "Mountainous region in the west"
    },
    gafsa: { 
      name: "Gafsa", 
      population: "337331", 
      area: "8990", 
      capital: "Gafsa",
      coords: [34.4259, 8.7842],
      description: "Mining region (phosphates)"
    },
    sfax: { 
      name: "Sfax", 
      population: "955421", 
      area: "7545", 
      capital: "Sfax",
      coords: [34.74, 10.76],
      description: "Second largest city of Tunisia, important port"
    },
    gabes: { 
      name: "Gabès", 
      population: "374300", 
      area: "7166", 
      capital: "Gabès",
      coords: [33.8815, 10.0982],
      description: "Maritime oasis and industrial port"
    },
    medenine: { 
      name: "Médenine", 
      population: "479520", 
      area: "8588", 
      capital: "Médenine",
      coords: [33.3549, 10.5055],
      description: "Gateway to the Tunisian desert"
    },
    tataouine: { 
      name: "Tataouine", 
      population: "149453", 
      area: "38889", 
      capital: "Tataouine",
      coords: [32.9297, 10.4511],
      description: "Region of Ksours and Star Wars filming location"
    },
    tozeur: { 
      name: "Tozeur", 
      population: "107912", 
      area: "4719", 
      capital: "Tozeur",
      coords: [33.9197, 8.1335],
      description: "Oasis and gateway to the Sahara"
    },
    kebili: { 
      name: "Kébili", 
      population: "156961", 
      area: "22454", 
      capital: "Kébili",
      coords: [33.7072, 8.9714],
      description: "Region of oases and palm groves"
    },
    sousse: { 
      name: "Sousse", 
      population: "674971", 
      area: "2669", 
      capital: "Sousse",
      coords: [35.8254, 10.6369],
      description: "Important seaside resort"
    },
    monastir: { 
      name: "Monastir", 
      population: "548828", 
      area: "1019", 
      capital: "Monastir",
      coords: [35.7643, 10.8113],
      description: "Birthplace of Habib Bourguiba"
    },
    mahdia: { 
      name: "Mahdia", 
      population: "410812", 
      area: "2966", 
      capital: "Mahdia",
      coords: [35.5047, 11.0622],
      description: "Seaside resort and fishing port"
    },
    siliana: { 
      name: "Siliana", 
      population: "223087", 
      area: "4631", 
      capital: "Siliana",
      coords: [36.0849, 9.3708],
      description: "Agricultural and mountainous region"
    },
    zaghouan: { 
      name: "Zaghouan", 
      population: "176945", 
      area: "2768", 
      capital: "Zaghouan",
      coords: [36.4029, 10.1429],
      description: "Known for its Roman aqueduct and springs"
    },
    sidiBouzid: { 
      name: "Sidi Bouzid", 
      population: "429912", 
      area: "6994", 
      capital: "Sidi Bouzid",
      coords: [35.0382, 9.4847],
      description: "Place where the Tunisian Revolution began"
    }
  };

  // Load zones from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'zones'), (snapshot) => {
      const zonesData = [];
      snapshot.forEach((doc) => {
        zonesData.push({ id: doc.id, ...doc.data() });
      });
      setZones(zonesData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading zones:", error);
      setLoading(false);
    });

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Initialize map
  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !mapInitialized.current) {
        try {
          const L = await import('leaflet');
          
          // Fix Leaflet icons
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          });

          // Check if map container exists
          if (!document.getElementById('map')) {
            console.error("Map container does not exist");
            return;
          }

          // Initialize map only if it doesn't exist already
          if (!mapRef.current) {
            const mapInstance = L.map('map').setView([34, 9], 6);
            mapRef.current = mapInstance;
            mapInitialized.current = true;
            
            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance);

            // Add scale
            L.control.scale({metric: true, imperial: false}).addTo(mapInstance);
            
            setMap(mapInstance);
            
            // Create markers for each governorate
            const markersObj = {};
            Object.keys(governoratesData).forEach(govId => {
              const data = governoratesData[govId];
              if (data && data.coords) {
                // Create custom green icon
                const greenIcon = L.divIcon({
                  className: 'custom-marker-green',
                  html: `<div style="background-color: #2ecc71; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                });

                const marker = L.marker(data.coords, { icon: greenIcon }).addTo(mapInstance);
                marker.bindPopup(`<b style="color: #27ae60;">${data.name}</b><br>Population: ${data.population}`);
                
                marker.on('click', () => {
                  handleGovernorateClick(govId);
                });
                
                markersObj[govId] = marker;
              }
            });
            
            setMarkers(markersObj);
          }
        } catch (error) {
          console.error("Error loading Leaflet:", error);
        }
      }
    };

    loadLeaflet();

    // Clean up map on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapInitialized.current = false;
      }
    };
  }, []);

  // Zoom to a specific governorate
  const zoomToGovernorate = (govId) => {
    const data = governoratesData[govId];
    if (data && data.coords && mapRef.current) {
      // Zoom to the governorate with appropriate zoom level
      mapRef.current.setView(data.coords, 9);
      
      // Zoom animation for visual effect
      mapRef.current.flyTo(data.coords, 9, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      
      // Highlight the selected governorate
      setSelectedGovernorate(govId);
      
      // Open the marker popup
      if (markers[govId]) {
        markers[govId].openPopup();
      }
    }
  };

  // Handle governorate click
  const handleGovernorateClick = (govId) => {
    const data = governoratesData[govId];
    if (data) {
      setZoneName(data.name);
      setZonePopulation(data.population);
      setZoneArea(data.area);
      setZoneCapital(data.capital);
      setZoneDescription(data.description);
      
      // Zoom to the selected governorate
      zoomToGovernorate(govId);
    }
  };

  // Handle governorate selection from form
  const handleGovernorateSelect = (e) => {
    const govId = e.target.value;
    if (govId) {
      const data = governoratesData[govId];
      if (data) {
        setZoneName(data.name);
        setZonePopulation(data.population);
        setZoneArea(data.area);
        setZoneCapital(data.capital);
        setZoneDescription(data.description);
        
        // Zoom to the selected governorate
        zoomToGovernorate(govId);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newZone = {
      name: zoneName,
      population: zonePopulation,
      area: zoneArea,
      capital: zoneCapital,
      description: zoneDescription,
      createdAt: new Date()
    };

    try {
      if (editingId) {
        // Update existing zone in Firestore
        const zoneRef = doc(db, 'zones', editingId);
        await updateDoc(zoneRef, newZone);
        setEditingId(null);
      } else {
        // Add new zone to Firestore
        await addDoc(collection(db, 'zones'), newZone);
      }

      // Reset form
      setZoneName('');
      setZonePopulation('');
      setZoneArea('');
      setZoneCapital('');
      setZoneDescription('');
      setEditingIndex(null);
      setSelectedGovernorate(null);
    } catch (error) {
      console.error("Error saving zone:", error);
      alert("An error occurred while saving the zone.");
    }
  };

  // Edit existing zone
  const handleEdit = (index) => {
    const zone = zones[index];
    setZoneName(zone.name);
    setZonePopulation(zone.population);
    setZoneArea(zone.area);
    setZoneCapital(zone.capital);
    setZoneDescription(zone.description);
    setEditingIndex(index);
    setEditingId(zone.id);
    
    // Find and zoom to the corresponding governorate
    const govId = Object.keys(governoratesData).find(
      key => governoratesData[key].name === zone.name
    );
    if (govId) {
      zoomToGovernorate(govId);
    }
  };

  // Delete a zone
  const handleDelete = async (index) => {
    const zone = zones[index];
    if (window.confirm(`Are you sure you want to delete the zone "${zone.name}"?`)) {
      try {
        await deleteDoc(doc(db, 'zones', zone.id));
      } catch (error) {
        console.error("Error deleting zone:", error);
        alert("An error occurred while deleting the zone.");
      }
    }
  };

  return (
    <div className="add-zone-container">
      <h2>Tunisia Governorates/Zones Management</h2>
      
      <div className="content">
        <div className="controls">
          {/* Add/Edit form */}
          <form onSubmit={handleSubmit} className="zone-form">
            <div className="form-group">
              <label htmlFor="governorateSelect">Select a governorate:</label>
              <select
                id="governorateSelect"
                onChange={handleGovernorateSelect}
                value={selectedGovernorate || ''}
              >
                <option value="">Choose a governorate</option>
                {Object.keys(governoratesData).map(govId => (
                  <option key={govId} value={govId}>
                    {governoratesData[govId].name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="zoneName">Governorate name:</label>
              <input
                type="text"
                id="zoneName"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zonePopulation">Population:</label>
              <input
                type="number"
                id="zonePopulation"
                value={zonePopulation}
                onChange={(e) => setZonePopulation(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zoneArea">Area (km²):</label>
              <input
                type="number"
                id="zoneArea"
                value={zoneArea}
                onChange={(e) => setZoneArea(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zoneCapital">Capital:</label>
              <input
                type="text"
                id="zoneCapital"
                value={zoneCapital}
                onChange={(e) => setZoneCapital(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zoneDescription">Description:</label>
              <textarea
                id="zoneDescription"
                value={zoneDescription}
                onChange={(e) => setZoneDescription(e.target.value)}
                rows="3"
              />
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {editingId ? 'Update zone' : 'Add zone'}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setZoneName('');
                  setZonePopulation('');
                  setZoneArea('');
                  setZoneCapital('');
                  setZoneDescription('');
                  setEditingIndex(null);
                  setEditingId(null);
                  setSelectedGovernorate(null);
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
        
        <div className="map-container">
          <div id="map" style={{ height: '100%', width: '100%' }}></div>
        </div>
      </div>
      
      {/* List of added zones */}
      <div className="zones-list">
        <h3>Registered Zones/Governorates ({zones.length})</h3>
        
        {loading ? (
          <p className="loading">Loading zones...</p>
        ) : zones.length === 0 ? (
          <p className="no-zones">No zones registered yet.</p>
        ) : (
          <div className="zones-grid">
            {zones.map((zone, index) => (
              <div key={zone.id} className="zone-card">
                <h4>{zone.name}</h4>
                <p><strong>Population:</strong> {zone.population} inhabitants</p>
                <p><strong>Area:</strong> {zone.area} km²</p>
                <p><strong>Capital:</strong> {zone.capital}</p>
                {zone.description && (
                  <p><strong>Description:</strong> {zone.description}</p>
                )}
                
                <div className="zone-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddZone;