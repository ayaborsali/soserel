import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ProjectSettings = () => {
  const [config, setConfig] = useState({
    name: '',
    description: '',
    contactEmail: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState('Administrator');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'projectConfig');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        }
      } catch (err) {
        setError('Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const validate = () => {
    if (!config.name.trim()) {
      setError('Project name is required');
      return false;
    }
    if (config.contactEmail && !/\S+@\S+\.\S+/.test(config.contactEmail)) {
      setError('Invalid contact email format');
      return false;
    }
    if (config.startDate && config.endDate && new Date(config.endDate) < new Date(config.startDate)) {
      setError('End date cannot be before start date');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({ ...config, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async () => {
    setError('');
    if (!validate()) return;

    setSaving(true);
    try {
      const docRef = doc(db, 'config', 'projectConfig');
      await setDoc(docRef, config);
      setSuccess(true);
    } catch (err) {
      setError('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Typography>Loading configuration...</Typography>;

  return (
    <Box sx={{ maxWidth: 650, mx: 'auto', mt: 5 }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            background: '#f9fbe7',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            Project Configuration
          </Typography>

          {['name', 'description', 'contactEmail'].map((field) => (
            <TextField
              key={field}
              label={
                field === 'name'
                  ? 'Project Name'
                  : field === 'description'
                  ? 'Project Description'
                  : 'Contact Email'
              }
              name={field}
              value={config[field]}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline={field === 'description'}
              rows={field === 'description' ? 4 : 1}
              disabled={userRole !== 'Administrator'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#66bb6a' },
                  '&:hover fieldset': { borderColor: '#2e7d32' },
                  '&.Mui-focused fieldset': { borderColor: '#1b5e20' },
                },
              }}
            />
          ))}

          {['startDate', 'endDate'].map((field) => (
            <TextField
              key={field}
              label={field === 'startDate' ? 'Start Date' : 'End Date'}
              name={field}
              type="date"
              value={config[field]}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={userRole !== 'Administrator'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#66bb6a' },
                  '&:hover fieldset': { borderColor: '#2e7d32' },
                  '&.Mui-focused fieldset': { borderColor: '#1b5e20' },
                },
              }}
            />
          ))}

          <FormControlLabel
            control={
              <Checkbox
                checked={config.isActive}
                onChange={handleChange}
                name="isActive"
                disabled={userRole !== 'Administrator'}
                sx={{
                  color: '#66bb6a',
                  '&.Mui-checked': { color: '#2e7d32' },
                }}
              />
            }
            label="Project Active"
          />

          {userRole === 'Administrator' && (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{
                mt: 2,
                backgroundColor: '#2e7d32',
                '&:hover': { backgroundColor: '#1b5e20' },
                transition: 'all 0.3s ease-in-out',
                fontWeight: 'bold',
              }}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          )}
        </Paper>
      </motion.div>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Configuration saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectSettings;
