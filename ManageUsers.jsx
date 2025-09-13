import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  IconButton,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { db, auth } from '../../firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';

const ROLES = [
  { name: 'Administrator', icon: <SupervisorAccountIcon /> },
  { name: 'Supervisor', icon: <SupervisorAccountIcon /> },
  { name: 'Engineer', icon: <EngineeringIcon /> },
  { name: 'Local Director', icon: <AccountCircleIcon /> },
  { name: 'Regional Director', icon: <AccountCircleIcon /> },
  { name: 'General Doctor', icon: <AccountCircleIcon /> },
];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPoste, setNewUserPoste] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');

  const usersRef = collection(db, 'users');

  useEffect(() => {
    const savedRole = localStorage.getItem('userPoste');
    setCurrentUserRole(savedRole);

    const fetchUsers = async () => {
      const snapshot = await getDocs(usersRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    };

    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPoste.trim()) return;

    const userDocRef = doc(db, 'authorizedUsers', newUserEmail.trim());
    const existing = await getDoc(userDocRef);

    if (existing.exists()) {
      alert('This email is already registered!');
      return;
    }

    try {
      const tempPassword = 'defaultPassword123';
      await createUserWithEmailAndPassword(auth, newUserEmail.trim(), tempPassword);

      const newUser = {
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        poste: newUserPoste.trim(),
        password: tempPassword,
      };

      const docRef = await addDoc(usersRef, newUser);
      setUsers([...users, { id: docRef.id, ...newUser }]);
      await setDoc(userDocRef, { poste: newUser.poste });

      alert(`User added successfully.\nTemporary password: ${tempPassword}`);

      setNewUserName('');
      setNewUserEmail('');
      setNewUserPoste('');
    } catch (error) {
      console.error('Error adding user:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteDoc(doc(usersRef, id));
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditUserId(user.id);
    setEditUserName(user.name);
  };

  const handleSaveUser = async () => {
    try {
      const userRef = doc(usersRef, editUserId);
      await updateDoc(userRef, { name: editUserName.trim() });

      setUsers(users.map((user) => (user.id === editUserId ? { ...user, name: editUserName.trim() } : user)));
      setEditUserId(null);
      setEditUserName('');
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditUserName('');
  };

  const canEditOrDelete = currentUserRole === 'Administrator' || currentUserRole === 'Supervisor';

  return (
    <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#E8F5E9' }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#2E7D32', mb: 3 }}>
        Manage Users ({currentUserRole})
      </Typography>

      {currentUserRole === 'Administrator' && (
        <Box display="flex" flexDirection="column" gap={2} mb={4}>
          <TextField label="Name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} fullWidth />
          <TextField label="Email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={newUserPoste} label="Role" onChange={(e) => setNewUserPoste(e.target.value)}>
              {ROLES.map((role) => (
                <MenuItem key={role.name} value={role.name}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {role.icon} {role.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="contained" color="success" startIcon={<PersonAddIcon />} onClick={handleAddUser}>
              Add User
            </Button>
          </motion.div>
        </Box>
      )}

      <List>
        {users.map((user) => (
          <motion.div key={user.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <ListItem
              secondaryAction={
                canEditOrDelete &&
                (editUserId === user.id ? (
                  <>
                    <IconButton edge="end" color="success" onClick={handleSaveUser}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton edge="end" color="error" onClick={handleCancelEdit} sx={{ ml: 1 }}>
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton edge="end" color="primary" onClick={() => handleEditUser(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" color="error" onClick={() => handleDeleteUser(user.id)} sx={{ ml: 1 }}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                ))
              }
              sx={{
                mb: 2,
                borderRadius: 2,
                bgcolor: 'white',
                boxShadow: 1,
                '&:hover': { boxShadow: 4 },
              }}
            >
              {editUserId === user.id ? (
                <TextField value={editUserName} onChange={(e) => setEditUserName(e.target.value)} fullWidth />
              ) : (
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccountCircleIcon sx={{ color: '#2E7D32' }} />
                      {user.name} ({user.poste})
                    </Box>
                  }
                  secondary={
                    <>
                      {user.email}
                      {user.password && (
                        <span style={{ display: 'block', fontWeight: 'bold', color: 'green' }}>
                          Temp password: {user.password}
                        </span>
                      )}
                    </>
                  }
                />
              )}
            </ListItem>
          </motion.div>
        ))}
      </List>
    </Paper>
  );
};

export default ManageUsers;
