import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';

import { db } from '../../firebase'; // ⬅️ Assure-toi que le chemin est correct
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddConsumptionData = () => {
  const [formData, setFormData] = useState({
    niveau: '',           // zone, poste, ligne, dispositif
    tension: '',
    consommation: '',
    ampere: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Crée une référence dynamique selon le niveau (ex: 'zone_consumption')
      const collectionName = `${formData.niveau}_consumption`;
      const docRef = await addDoc(collection(db, collectionName), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      console.log('Document enregistré avec ID :', docRef.id);
      setSubmitted(true);
      setFormData({
        niveau: '',
        tension: '',
        consommation: '',
        ampere: '',
      });
    } catch (err) {
      console.error('Erreur Firestore :', err);
      setError('Une erreur est survenue lors de l’enregistrement.');
    }

    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 5 }}>
      <Typography variant="h6" gutterBottom>
        Ajouter des données de consommation
      </Typography>

      {submitted && <Alert severity="success">Données enregistrées avec succès !</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="niveau-label">Niveau</InputLabel>
          <Select
            labelId="niveau-label"
            name="niveau"
            value={formData.niveau}
            onChange={handleChange}
            label="Niveau"
          >
            <MenuItem value="zone">Zone</MenuItem>
            <MenuItem value="poste">Poste</MenuItem>
            <MenuItem value="ligne">Ligne</MenuItem>
            <MenuItem value="dispositif">Dispositif</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Tension (V)"
          name="tension"
          value={formData.tension}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Consommation (W)"
          name="consommation"
          value={formData.consommation}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Ampérage (A)"
          name="ampere"
          value={formData.ampere}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Enregistrer
        </Button>
      </Box>
    </Paper>
  );
};

export default AddConsumptionData;
