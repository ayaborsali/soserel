import React, { useEffect, useRef, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; 
import '../../Code.css';

const QRCodeComponent = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const qrCanvasRef = useRef(null);

  // Convert Firebase Timestamp to readable format
  const formatFirebaseTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp.seconds && timestamp.nanoseconds !== undefined) {
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return date.toLocaleString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZoneName: 'short'
      });
    }
    return 'N/A';
  };

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devicesCollection = collection(db, 'devices');
        const snapshot = await getDocs(devicesCollection);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDevices(list);
        setLoading(false);
      } catch (error) {
        console.error('Error loading devices:', error);
        alert('Error loading devices');
        setLoading(false);
      }
    };
    fetchDevices();
    updateTime();
  }, []);

  const updateTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }));
  };

  const handleDeviceSelect = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    setSelectedDevice(device);
    setTimeout(() => { if(device) generateQRCode(device); }, 100);
  };

  const generateQRText = (deviceData) => {
    if (!deviceData) return '';

    let text = `TECHNICAL DEVICE INFORMATION\nType: ${deviceData.deviceType || 'N/A'}\nID: ${deviceData.lampId || deviceData.concentratorId || deviceData.transformerId || 'N/A'}\nAdded by: ${deviceData.addedBy || 'N/A'}\nDate: ${formatFirebaseTimestamp(deviceData.addedAt)}`;

    if (deviceData.deviceType === 'Lamp') {
      text += `\nStatus: ${deviceData.lampState === "1" ? "On" : "Off"}\nLevel: ${deviceData.lightLevel || 'N/A'}%\nLine: ${deviceData.lineId || 'N/A'}\nPost: ${deviceData.postId || 'N/A'}\nLocation: ${deviceData.location?.lat || 'N/A'}, ${deviceData.location?.lng || 'N/A'}`;
    } else if (deviceData.deviceType === 'Concentrateur') {
      text += `\nCapacity: ${deviceData.capacity || 'N/A'}\nLocation: ${deviceData.location?.lat || 'N/A'}, ${deviceData.location?.lng || 'N/A'}`;
    } else if (deviceData.deviceType === 'Transformateur') {
      text += `\nVoltage: ${deviceData.voltage || 'N/A'} V\nLocation: ${deviceData.location?.lat || 'N/A'}, ${deviceData.location?.lng || 'N/A'}`;
    }

    return text;
  };

  const showNotification = (msg, isError=false) => alert(msg);

  const downloadQRCode = () => {
    if (!qrCanvasRef.current || !selectedDevice) return showNotification('QR Code not generated', true);
    const link = document.createElement('a');
    link.href = qrCanvasRef.current.toDataURL('image/png');
    link.download = `QRCode_${selectedDevice.lampId || selectedDevice.concentratorId || selectedDevice.transformerId || 'device'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('QR Code downloaded successfully!');
  };

  const copyTextCode = () => {
    if (!selectedDevice) return showNotification('Select a device first', true);
    const textToCopy = generateQRText(selectedDevice);
    navigator.clipboard.writeText(textToCopy)
      .then(() => showNotification('Data copied to clipboard!'))
      .catch(() => showNotification('Error copying data', true));
  };

  const generateQRCode = (deviceData) => {
    import('qrcode-generator').then(qrcode => {
      const qrText = generateQRText(deviceData);
      const qrContainer = document.getElementById('qrcode');
      if (!qrContainer) return;
      qrContainer.innerHTML = '';

      const canvas = document.createElement('canvas');
      const size = 250;
      canvas.width = size;
      canvas.height = size;

      const qr = qrcode.default(0, 'H');
      qr.addData(qrText);
      qr.make();

      const ctx = canvas.getContext('2d');
      const moduleCount = qr.getModuleCount();
      const moduleSize = size / moduleCount;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,size,size);
      ctx.fillStyle = '#2E7D32';
      for (let row=0; row<moduleCount; row++) {
        for (let col=0; col<moduleCount; col++) {
          if(qr.isDark(row,col)) ctx.fillRect(col*moduleSize,row*moduleSize,moduleSize,moduleSize);
        }
      }

      qrContainer.appendChild(canvas);
      qrCanvasRef.current = canvas;
    });
  };

  return (
    <div className="qr-code-container">
      <div className="container">
        <header>
          <h1>QR Code Device Information</h1>
          <p>Select a device to generate its QR code</p>
        </header>

        <div className="device-selection">
          <h2>Device Selection</h2>
          {loading ? <p>Loading devices...</p> : (
            <select value={selectedDevice?.id || ''} onChange={(e)=>handleDeviceSelect(e.target.value)}>
              <option value="">Select a device</option>
              {devices.map(d=>(
                <option key={d.id} value={d.id}>{d.deviceType} - {d.lampId || d.concentratorId || d.transformerId}</option>
              ))}
            </select>
          )}
        </div>

        {selectedDevice && (
          <div className="content">
            <div className="info-panel">
              <h2>Device Information</h2>
              <div className="info-item"><div className="info-label">Type:</div><div className="info-value">{selectedDevice.deviceType}</div></div>
              <div className="info-item"><div className="info-label">ID:</div><div className="info-value">{selectedDevice.lampId || selectedDevice.concentratorId || selectedDevice.transformerId}</div></div>
              {selectedDevice.deviceType === 'Lamp' && <>
                <div className="info-item"><div className="info-label">Status:</div><div className="info-value">{selectedDevice.lampState === "1" ? "On":"Off"}</div></div>
                <div className="info-item"><div className="info-label">Level:</div><div className="info-value">{selectedDevice.lightLevel || 'N/A'}%</div></div>
                <div className="info-item"><div className="info-label">Line:</div><div className="info-value">{selectedDevice.lineId || 'N/A'}</div></div>
                <div className="info-item"><div className="info-label">Post:</div><div className="info-value">{selectedDevice.postId || 'N/A'}</div></div>
              </>}
              {selectedDevice.deviceType === 'Concentrateur' && <div className="info-item"><div className="info-label">Capacity:</div><div className="info-value">{selectedDevice.capacity || 'N/A'}</div></div>}
              {selectedDevice.deviceType === 'Transformateur' && <div className="info-item"><div className="info-label">Voltage:</div><div className="info-value">{selectedDevice.voltage || 'N/A'} V</div></div>}
              <div className="info-item"><div className="info-label">Location:</div><div className="info-value">{selectedDevice.location?.lat || 'N/A'}, {selectedDevice.location?.lng || 'N/A'}</div></div>
              <div className="info-item"><div className="info-label">Added by:</div><div className="info-value">{selectedDevice.addedBy || 'N/A'}</div></div>
              <div className="info-item"><div className="info-label">Date Added:</div><div className="info-value">{formatFirebaseTimestamp(selectedDevice.addedAt)}</div></div>
            </div>

            <div className="code-panel">
              <div id="qrcode"></div>
              <div className="text-code"><pre>{generateQRText(selectedDevice)}</pre></div>
              <div className="button-container">
                <button className="btn" onClick={downloadQRCode}>Download QR Code</button>
                <button className="btn btn-copy" onClick={copyTextCode}>Copy Data</button>
              </div>
              <div className="timestamp">Generated on <span>{currentTime}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeComponent;
