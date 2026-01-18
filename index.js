const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ===== CONFIG =====
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const GRAPH_API = "https://graph.facebook.com/v19.0";

const DM_MESSAGE =
  "Hi, You can get full guide, tips, tools to increase your ecommerce sales from this Link https://shobee.in/resources";

// In-memory memory (RAM only, zero disk usage)
const processedUsers = new Set();
// ==================

// Health check
app.get("/", (req, res) => {
  res.send("NEW CODE LIVE 123");
});

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});


// Webhook receiver
app.post("/webhook", async (req, res) => {
  // Always acknowledge Meta immediately
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value || !value.text || !value.from?.id) return;

    const commentText = value.text.toLowerCase();
    const commenterId = value.from.id;

    // Keyword rule
    if (!commentText.includes("shobee")) return;

    // Memory rule (send only once)
    if (processedUsers.has(commenterId)) return;

    // Send DM
    await sendDM(commenterId);

    // Mark as processed
    processedUsers.add(commenterId);

  } catch (err) {
    // Never crash webhook
  }
});

// DM sender
async function sendDM(userId) {
  const url = `${GRAPH_API}/me/messages?access_token=${IG_ACCESS_TOKEN}`;

  const payload = {
    recipient: { id: userId },
    message: { text: DM_MESSAGE }
  };

  await axios.post(url, payload);
}

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
