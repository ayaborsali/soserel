import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import {
  Sensors,
  QrCode,
  NotificationsActive,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ChatBox from "./ChatBox"; // chemin correct

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/signin");
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardHover = {
    whileHover: { scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" },
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* Navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
          bgcolor: "white",
          boxShadow: 1,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#2E7D32" }}>
          SOSEREL
        </Typography>
        <Button
          variant="contained"
          sx={{ bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" } }}
          onClick={handleLoginRedirect}
        >
          Sign In
        </Button>
      </Box>

      {/* Hero Section */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #2E7D32, #1B5E20)",
            color: "white",
            py: 8,
            px: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
            Smart Street Lighting Supervision
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 800, mx: "auto", mb: 4 }}>
            Our platform enables real-time management of urban streetlights:
            device monitoring, QR code generation, automatic alerts, and detailed reports
            for a smarter and more energy-efficient city.
          </Typography>
        </Box>
      </motion.div>

      {/* Features Section */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <Box sx={{ py: 8, px: 3 }}>
          <Typography
            variant="h4"
            sx={{ textAlign: "center", mb: 6, color: "#2E7D32", fontWeight: "bold" }}
          >
            Key Features
          </Typography>

          <Grid container spacing={4} sx={{ maxWidth: 1200, mx: "auto" }}>
            {[
              {
                icon: <Sensors sx={{ fontSize: 40, color: "#2E7D32", mb: 2 }} />,
                title: "Device Management",
                desc: "Add, edit, and monitor your streetlights in real-time with status data (ON/OFF, maintenance, malfunction).",
              },
              {
                icon: <QrCode sx={{ fontSize: 40, color: "#2E7D32", mb: 2 }} />,
                title: "Smart QR Code",
                desc: "Each device is identified by a unique QR code, making field maintenance and quick localization much easier.",
              },
              {
                icon: <NotificationsActive sx={{ fontSize: 40, color: "#2E7D32", mb: 2 }} />,
                title: "Alerts & Reports",
                desc: "Receive instant notifications in case of failures or anomalies and generate detailed reports to optimize maintenance.",
              },
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div {...cardHover}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s, box-shadow 0.3s",
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {feature.icon}
                      <Typography variant="h5" sx={{ mb: 2, color: "#2E7D32" }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1">{feature.desc}</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Why Choose Section */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <Box sx={{ py: 8, px: 3, bgcolor: "#E8F5E9", borderRadius: 3 }}>
          <Typography
            variant="h4"
            sx={{ textAlign: "center", mb: 6, color: "#2E7D32", fontWeight: "bold" }}
          >
            Why Choose SOSEREL?
          </Typography>

          <Grid container spacing={4} sx={{ maxWidth: 1200, mx: "auto" }}>
            {[
              "Real-time smart supervision of streetlights",
              "Optimized maintenance and reduced downtime",
              "Energy-efficient management to cut costs",
              "User-friendly dashboard with actionable insights",
            ].map((text, index) => (
              <Grid item xs={12} md={3} key={index}>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 * index }}
                >
                  <Card
                    sx={{
                      p: 4,
                      textAlign: "center",
                      borderRadius: 3,
                      bgcolor: "white",
                      boxShadow: 2,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 50, color: "#2E7D32", mb: 2 }} />
                    <Typography variant="body1">{text}</Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              sx={{ bgcolor: "#2E7D32", px: 4, py: 1.5, "&:hover": { bgcolor: "#1B5E20" } }}
              onClick={handleLoginRedirect}
            >
              Explore Dashboard
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: "#1B5E20", color: "white", textAlign: "center" }}>
        <Typography variant="body2">© 2025 SOSEREL - Smart Street Lighting Management</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Optimize energy consumption and reduce maintenance costs
        </Typography>
      </Box>

      {/* Widget Chat Assistant (flottant) */}
      <ChatBox />
    </Box>
  );
};

export default HomePage;
