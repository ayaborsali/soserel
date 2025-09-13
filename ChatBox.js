import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", text: input }]);

    try {
      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Erreur connexion au serveur" },
      ]);
    }

    setInput("");
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 1300,
      }}
    >
      {/* Bouton flottant */}
      {!open && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: "#2E7D32",
            color: "white",
            "&:hover": { bgcolor: "#1B5E20" },
            width: 60,
            height: 60,
            boxShadow: 3,
          }}
        >
          <ChatIcon fontSize="large" />
        </IconButton>
      )}

      {/* Fenêtre du Chat */}
      {open && (
        <Paper
          elevation={4}
          sx={{
            width: 350,
            height: 450,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: "#2E7D32",
              color: "white",
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Assistant TataDashboard 🤖
            </Typography>
            <IconButton size="small" sx={{ color: "white" }} onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              bgcolor: "#fafafa",
            }}
          >
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: msg.role === "user" ? "#2E7D32" : "#eee",
                    color: msg.role === "user" ? "white" : "black",
                    maxWidth: "70%",
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Input */}
          <Box sx={{ display: "flex", p: 1, borderTop: "1px solid #ddd" }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Pose ta question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              variant="contained"
              sx={{ ml: 1, bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" } }}
              onClick={sendMessage}
            >
              Envoyer
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default ChatBox;
