// server.js
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const tf = require("@tensorflow/tfjs-node");
const path = require("path");

const serviceAccount = require("./serviceAccountKey.json");

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ------------------ Routes existantes ------------------

// Test API
app.get("/", (req, res) => {
  res.send("API fonctionne ✅");
});

// Ajouter poste, ligne, device...
// (copier ici toutes tes routes existantes /addpost, /addline, /adddevice, /devices, etc.)

// ------------------ Chargement modèle TensorFlow ------------------
let model;
const loadModel = async () => {
  try {
    model = await tf.loadLayersModel(`file://${path.join(__dirname, "model/model.json")}`);
    console.log("Modèle TensorFlow chargé ✅");
  } catch (err) {
    console.error("Erreur chargement modèle:", err);
  }
};
loadModel();

// ------------------ Route prédiction ------------------
app.get("/predict/:lampId", async (req, res) => {
  try {
    const lampId = req.params.lampId;

    // 🔹 Récupérer l'historique du device
    const historySnap = await db.collection("history")
      .where("deviceId", "==", lampId)
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    if (historySnap.empty) return res.status(404).json({ message: "Device non trouvé ❌" });

    const historyData = historySnap.docs.map(doc => doc.data());

    // 🔹 Récupérer les alertes du poste associé
    const deviceSnap = await db.collection("devices").where("name", "==", lampId).limit(1).get();
    if (deviceSnap.empty) return res.status(404).json({ message: "Device non trouvé ❌" });
    const posteId = deviceSnap.docs[0].data().posteId;

    const alertsSnap = await db.collection("alerts")
      .where("postId", "==", posteId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const alertsData = alertsSnap.docs.map(doc => doc.data());

    // 🔹 Préparer les features pour le modèle ML
    const features = historyData.map(h => [
      parseFloat(h.electricalData?.L1?.current?.value || 0),
      parseFloat(h.electricalData?.L2?.current?.value || 0),
      parseFloat(h.electricalData?.L3?.current?.value || 0),
      parseFloat(h.electricalData?.L1?.voltage?.value || 0),
      parseFloat(h.electricalData?.L2?.voltage?.value || 0),
      parseFloat(h.electricalData?.L3?.voltage?.value || 0),
      parseFloat(h.localData?.temperature || 0),
      parseFloat(h.localData?.humidity || 0),
      alertsData.filter(a => a.severity === "High").length,
    ]);

    if (!model) return res.status(500).json({ message: "Modèle non chargé ❌" });

    // 🔹 Convertir features en Tensor et prédire
    const inputTensor = tf.tensor2d(features);
    const predictionTensor = model.predict(inputTensor);
    const predictionArray = predictionTensor.arraySync();

    // 🔹 Pour simplifier, on prend la moyenne des prédictions
    const avgPrediction = predictionArray.reduce((sum, p) => sum + p[0], 0) / predictionArray.length;

    // 🔹 Etat final
    const prediction = avgPrediction > 0.5 ? "Faulty" : "Healthy";

    res.json({ lampId, prediction, avgPrediction, featuresCount: features.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur prédiction ❌", error: err.message });
  }
});

// ------------------ Lancer serveur ------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
