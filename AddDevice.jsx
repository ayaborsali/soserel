import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🔹 Custom icons
const icons = {
  Lamp: L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1681/1681003.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  Concentrateur: L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  Transformateur: L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3523/3523066.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
};

// Component to pick location
const LocationPicker = ({ setLocation }) => {
  const map = useMapEvents({
    click(e) {
      setLocation([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return null;
};

const AddDevice = () => {
  const [deviceType, setDeviceType] = useState("Lamp");

  // Lamp-specific
  const [lampId, setLampId] = useState("");
  const [lineId, setLineId] = useState("");
  const [postId, setPostId] = useState("");
  const [lampState, setLampState] = useState("1");
  const [lightLevel, setLightLevel] = useState(0);

  // Concentrator-specific
  const [concentratorId, setConcentratorId] = useState("");
  const [capacity, setCapacity] = useState("");

  // Transformer-specific
  const [transformerId, setTransformerId] = useState("");
  const [voltage, setVoltage] = useState("");

  const [location, setLocation] = useState(null);
  const [devices, setDevices] = useState([]);
  const [message, setMessage] = useState("");
  const [mapReady, setMapReady] = useState(false);

  // 🔹 Fetch devices in real-time
  useEffect(() => {
    const q = query(collection(db, "devices"), orderBy("addedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDevices(data);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Light level calculation for lamps
  const fetchWeather = async () => {
    try {
      const apiKey = "YOUR_OPENWEATHER_API_KEY";
      const city = "Tunis";
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      const data = await response.json();
      return data.weather[0].main || "Clear";
    } catch (error) {
      console.error("Weather error:", error);
      return "Clear";
    }
  };

  const calculateLightLevel = (hour, weather) => {
    let level = 0;
    if (hour >= 6 && hour < 18) level = 20;
    else if (hour >= 18 && hour < 23) level = 80;
    else level = 50;
    if (weather === "Rain" || weather === "Clouds") level += 20;
    return Math.min(100, level);
  };

  useEffect(() => {
    const updateLight = async () => {
      const weather = await fetchWeather();
      const hour = new Date().getHours();
      setLightLevel(calculateLightLevel(hour, weather));
    };
    updateLight();
    const interval = setInterval(updateLight, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Add device
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deviceType) return setMessage("⚠️ Select a device type");
    if (!location) return setMessage("⚠️ Click on map to select location");

    if (deviceType === "Lamp" && (!lampId || !lineId || !postId)) {
      return setMessage("⚠️ Fill in all lamp fields");
    }
    if (deviceType === "Concentrateur" && !concentratorId) {
      return setMessage("⚠️ Fill in concentrator ID");
    }
    if (deviceType === "Transformateur" && !transformerId) {
      return setMessage("⚠️ Fill in transformer ID");
    }

    try {
      const user = auth.currentUser;
      if (!user) return setMessage("⚠️ User not logged in");

      const newDevice = {
        deviceType,
        location: { lat: location[0], lng: location[1] },
        addedAt: new Date(),
        addedBy: user.email || user.uid,
      };

      if (deviceType === "Lamp") {
        newDevice.lampId = lampId;
        newDevice.lineId = lineId;
        newDevice.postId = postId;
        newDevice.lampState = lampState;
        newDevice.lightLevel = lightLevel;
      } else if (deviceType === "Concentrateur") {
        newDevice.concentratorId = concentratorId;
        newDevice.capacity = capacity;
      } else if (deviceType === "Transformateur") {
        newDevice.transformerId = transformerId;
        newDevice.voltage = voltage;
      }

      const newDeviceRef = await addDoc(collection(db, "devices"), newDevice);

      await addDoc(collection(db, "history"), {
        message: `✅ ${deviceType} added by ${user.email}`,
        timestamp: serverTimestamp(),
        user: user.email,
        deviceId: newDeviceRef.id,
        action: "add",
      });

      setMessage(`✅ ${deviceType} added successfully!`);
      // Reset fields
      setLampId(""); setLineId(""); setPostId(""); setLampState("1");
      setConcentratorId(""); setCapacity("");
      setTransformerId(""); setVoltage("");
      setLocation(null);
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    }
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 4, boxShadow: 6, backgroundColor: "#e8f5e9" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32", mb: 3 }}>
        Add Device
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Device Type</InputLabel>
          <Select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
            <MenuItem value="Lamp">💡 Lamp</MenuItem>
            <MenuItem value="Concentrateur">📡 Concentrateur</MenuItem>
            <MenuItem value="Transformateur">⚡ Transformateur</MenuItem>
          </Select>
        </FormControl>

        {/* Lamp fields */}
        {deviceType === "Lamp" && (
          <>
            <TextField label="Lamp ID" value={lampId} onChange={(e) => setLampId(e.target.value)} fullWidth margin="normal" />
            <TextField label="Line ID" value={lineId} onChange={(e) => setLineId(e.target.value)} fullWidth margin="normal" />
            <TextField label="Post ID" value={postId} onChange={(e) => setPostId(e.target.value)} fullWidth margin="normal" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Lamp State</InputLabel>
              <Select value={lampState} onChange={(e) => setLampState(e.target.value)}>
                <MenuItem value="1">💡 On</MenuItem>
                <MenuItem value="0">⏹️ Off</MenuItem>
              </Select>
            </FormControl>
            <Typography sx={{ mt: 2, color: "#2e7d32" }}>💡 Light Level: <b>{lightLevel}%</b></Typography>
          </>
        )}

        {/* Concentrator fields */}
        {deviceType === "Concentrateur" && (
          <>
            <TextField label="Concentrator ID" value={concentratorId} onChange={(e) => setConcentratorId(e.target.value)} fullWidth margin="normal" />
            <TextField label="Capacity (KW)" value={capacity} onChange={(e) => setCapacity(e.target.value)} fullWidth margin="normal" />
          </>
        )}

        {/* Transformer fields */}
        {deviceType === "Transformateur" && (
          <>
            <TextField label="Transformer ID" value={transformerId} onChange={(e) => setTransformerId(e.target.value)} fullWidth margin="normal" />
            <TextField label="Voltage (V)" value={voltage} onChange={(e) => setVoltage(e.target.value)} fullWidth margin="normal" />
          </>
        )}

        {/* Map */}
        <Box sx={{ position: "relative", width: "100%", height: 400, mt: 3, borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
          <MapContainer center={[36.8065, 10.1815]} zoom={13} style={{ height: "100%", width: "100%" }} whenReady={() => setMapReady(true)}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
            <LocationPicker setLocation={setLocation} />
            {location && <Marker position={location} icon={icons[deviceType]}><Popup>{deviceType}</Popup></Marker>}
          </MapContainer>

          {!mapReady && <Box sx={{position: "absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#f5f5f5"}}>Loading map...</Box>}
        </Box>

        {location && <Typography sx={{ mt:2, color:"#1b5e20" }}>📍 Lat: <b>{location[0].toFixed(6)}</b> — Lng: <b>{location[1].toFixed(6)}</b></Typography>}

        <Button type="submit" variant="contained" sx={{ mt:3, backgroundColor:"#2e7d32", "&:hover":{backgroundColor:"#1b5e20", transform:"scale(1.03)", transition:"0.2s"} }} fullWidth>
          Add Device
        </Button>
      </form>

      {message && <Typography sx={{ mt:2, fontWeight:600, color: message.includes("✅")?"#2e7d32":"red" }}>{message}</Typography>}

      {/* Device list */}
      <Typography variant="h6" sx={{ mt:4, mb:2, color:"#2e7d32" }}>Device List</Typography>
      {devices.length===0 && <Typography>No devices added.</Typography>}
      <Box>
        {devices.map((d) => (
          <Card key={d.id} sx={{ mb:2, borderRadius:3, boxShadow:2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight:600 }}>{d.deviceType}: {d.lampId || d.concentratorId || d.transformerId || d.id}</Typography>
              {d.deviceType==="Lamp" && <Typography>Line: {d.lineId} — Post: {d.postId} — State: {d.lampState==="1"?"💡 On":"⏹️ Off"} — Light: {d.lightLevel}%</Typography>}
              {d.deviceType==="Concentrateur" && <Typography>Capacity: {d.capacity}</Typography>}
              {d.deviceType==="Transformateur" && <Typography>Voltage: {d.voltage} V</Typography>}
              {d.location && <Typography>📍 {d.location.lat}, {d.location.lng} — 👤 {d.addedBy}</Typography>}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
};

export default AddDevice;
