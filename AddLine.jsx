import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const AddLine = () => {
  const [lineName, setLineName] = useState('');
  const [substations, setSubstations] = useState([]);
  const [selectedSubstation, setSelectedSubstation] = useState('');
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [voltageTolerance, setVoltageTolerance] = useState('');
  const [currentTolerance, setCurrentTolerance] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch posts (substations)
  useEffect(() => {
    const fetchSubstations = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'postes')); // collection name must be correct
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubstations(data);
      } catch (err) {
        console.error('Error fetching substations:', err);
        setError('Failed to load substations.');
      }
    };

    fetchSubstations();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !lineName.trim() ||
      !selectedSubstation.trim() ||
      isNaN(Number(voltage)) ||
      isNaN(Number(current)) ||
      isNaN(Number(voltageTolerance)) ||
      isNaN(Number(currentTolerance))
    ) {
      setError('Please fill in all required fields with valid values.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'lines'), {
        name: lineName,
        substationId: selectedSubstation,
        voltage: Number(voltage),
        current: Number(current),
        voltageTolerance: Number(voltageTolerance),
        currentTolerance: Number(currentTolerance),
        createdAt: serverTimestamp(),
      });

      setSuccess('Line added successfully!');
      setLineName('');
      setSelectedSubstation('');
      setVoltage('');
      setCurrent('');
      setVoltageTolerance('');
      setCurrentTolerance('');
    } catch (err) {
      console.error('Error adding line:', err);
      setError('Failed to add line. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 5, p: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Line
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Line Name"
            value={lineName}
            onChange={(e) => setLineName(e.target.value)}
            fullWidth
            margin="normal"
          />

          <TextField
            select
            label="Select Post (Substation)"
            value={selectedSubstation}
            onChange={(e) => setSelectedSubstation(e.target.value)}
            fullWidth
            margin="normal"
          >
            {substations.length === 0 ? (
              <MenuItem disabled>No posts available</MenuItem>
            ) : (
              substations.map((post) => (
                <MenuItem key={post.id} value={post.id}>
                  {post.name}
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            label="Voltage (V)"
            type="number"
            value={voltage}
            onChange={(e) => setVoltage(e.target.value)}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Voltage Tolerance (±%)"
            type="number"
            value={voltageTolerance}
            onChange={(e) => setVoltageTolerance(e.target.value)}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Current (A)"
            type="number"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Current Tolerance (±%)"
            type="number"
            value={currentTolerance}
            onChange={(e) => setCurrentTolerance(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Add Line'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddLine;
