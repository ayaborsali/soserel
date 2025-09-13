const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json()); // pour parser le JSON dans les requêtes

// Configure nodemailer avec ton compte Gmail (à remplacer par tes infos)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ton.email@gmail.com',            
    pass: 'ton_mot_de_passe_app_google',      },
});

console.log('Serveur mail démarré sur le port', PORT);

// Route pour envoyer le mail de réinitialisation
app.post('/send-reset-email', async (req, res) => {
  const { email, token } = req.body;
  console.log('Requête reçue avec email:', email, 'token:', token);

  try {
    await transporter.sendMail({
      from: 'ton.email@gmail.com',
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Voici votre code : ${token}`,
    });
    console.log('Email envoyé avec succès');
    res.status(200).json({ message: 'Email envoyé' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du mail:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du mail' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
