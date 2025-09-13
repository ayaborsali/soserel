import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Collapse,
  Alert,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
  keyframes,
} from '@mui/material';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import PublicIcon from '@mui/icons-material/Public';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const roles = [
  'Administrator',
  'Supervisor',
  'Local Director',
  'Regional Director',
  'General Doctor',
  'Engineer',
];

const roleIcons = {
  Administrator: <AdminPanelSettingsIcon />,
  Supervisor: <SupervisorAccountIcon />,
  'Local Director': <LocationCityIcon />,
  'Regional Director': <PublicIcon />,
  'General Doctor': <MedicalServicesIcon />,
  Engineer: <EngineeringIcon />,
};

const Users = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [userPoste, setUserPoste] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    if (selectedRole && emailRef.current) {
      emailRef.current.focus();
    }
  }, [selectedRole]);

  const handleSelectRole = (role) => {
    if (loading) return;
    setSelectedRole((prev) => (prev === role ? null : role));
    setFormData({ email: '', password: '' });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async () => {
    const { email, password } = formData;

    if (!email || !password || !selectedRole) {
      setError('Please fill in all fields and select a role.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email;

      const docRef = doc(db, 'authorizedUsers', userEmail);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError('Unauthorized user: document not found in Firestore.');
        setLoading(false);
        return;
      }

      const userData = docSnap.data();
      const poste = userData.poste;

      if (!poste) {
        setError('No role found in Firestore for this user.');
        setLoading(false);
        return;
      }

      if (poste !== selectedRole) {
        setError(`Selected role (${selectedRole}) does not match Firestore role (${poste}).`);
        setLoading(false);
        return;
      }

      setUserPoste(poste);
      localStorage.setItem('userPoste', poste);
      localStorage.setItem('userEmail', userEmail);
      setError('');
      onLogin(poste, userEmail);
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') setError('User not found.');
      else if (error.code === 'auth/wrong-password') setError('Incorrect password.');
      else if (error.code === 'auth/invalid-email') setError('Invalid email format.');
      else setError('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        maxWidth: 500,
        mx: 'auto',
        mt: 6,
        borderRadius: 4,
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        background: 'linear-gradient(to bottom right, #e6f2ea, #d0f0c0)',
      }}
    >
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: '#2e7d32' }}>
        User Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} role="alert">
          {error}
        </Alert>
      )}

      <List sx={{ maxHeight: 350, overflowY: 'auto' }}>
        {roles.map((role) => {
          const isSelected = selectedRole === role;
          return (
            <Box key={role}>
              <ListItem
                button
                selected={isSelected}
                onClick={() => handleSelectRole(role)}
                disabled={loading}
                sx={{
                  borderRadius: 3,
                  mb: 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  '&.Mui-selected': {
                    backgroundColor: '#43a047',
                    color: 'white',
                    '& svg': {
                      color: 'white',
                      transform: 'scale(1.2)',
                      animation: `${pulse} 1.5s infinite`,
                    },
                  },
                  '&:hover': {
                    backgroundColor: isSelected ? '#43a047' : '#c8e6c9',
                    '& svg': { color: isSelected ? 'white' : '#2e7d32', transform: 'scale(1.1)' },
                  },
                }}
                aria-pressed={isSelected}
                aria-label={`Select role ${role}`}
              >
                <Box
                  sx={{
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    color: isSelected ? 'white' : '#2e7d32',
                    minWidth: 32,
                  }}
                >
                  {roleIcons[role]}
                </Box>
                <ListItemText primary={role} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>

              <Collapse in={isSelected} timeout="auto" unmountOnExit>
                <Paper sx={{ p: 3, mt: 1, mb: 2, borderRadius: 3, backgroundColor: '#f1f8e9', boxShadow: 'none' }}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={formData.email}
                    onChange={handleChange}
                    inputRef={emailRef}
                    disabled={loading}
                    autoComplete="username"
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleShowPassword}
                            edge="end"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontWeight: 600,
                      backgroundColor: '#2e7d32',
                      '&:hover': { backgroundColor: '#1b5e20' },
                    }}
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
                  </Button>
                </Paper>
              </Collapse>

              <Divider sx={{ mb: 1 }} />
            </Box>
          );
        })}
      </List>
    </Paper>
  );
};

export default Users;
