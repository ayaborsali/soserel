// src/auth/ResetPassword.jsx

import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';

const ResetPassword = () => {
  const [params] = useSearchParams(); // to get the oobCode from the URL
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const oobCode = params.get('oobCode'); // verification code in the URL

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage('Password successfully reset!');
      setTimeout(() => navigate('/signin'), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={10}>
      <Typography variant="h5" mb={2}>New Password</Typography>
      <form onSubmit={handleReset} style={{ width: '300px' }}>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Reset Password
        </Button>

        {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </form>
    </Box>
  );
};

export default ResetPassword;
