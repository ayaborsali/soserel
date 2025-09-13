import React, { useState } from 'react';

const Uploader = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus('');
  };

  const handleUpload = async () => {
    if (!file) return alert('Choisis un fichier');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setStatus(`Fichier "${data.filename}" uploadé avec succès !`);
    } catch (err) {
      console.error(err);
      setStatus('Erreur pendant l’upload.');
    }
  };

  return (
    <div>
      <h2>Uploader un fichier</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Envoyer</button>
      <p>{status}</p>
    </div>
  );
};

export default Uploader;
