// Dans App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import MainApp from './MainApp';
import SignIn from './auth/SignIn.jsx';
import ResetPassword from './components/ResetPassword';
import ForgetPassword from './components/ForgetPassword';
import HomePage from './components/HomePage'; // Importez la nouvelle page
import { SectionVisibilityProvider } from './components/UserActivities/SectionVisibilityContext';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Page d'accueil publique */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/mainapp"
          element={
            user ? (
              <SectionVisibilityProvider>
                <MainApp />
              </SectionVisibilityProvider>
            ) : (
              <Navigate to="/signin" />
            )
          }
        />

        {/* Redirection vers la page d'accueil au lieu de signin */}
               <Route path="*" element={<Navigate to={user ? "/mainapp" : "/"} />} />
      </Routes>

    </Router>
  );
};

export default App;