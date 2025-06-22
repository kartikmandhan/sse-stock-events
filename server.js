// server.js (no Redis)
const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.static("public"));

const clients = new Set();

// SSE endpoint
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.add(res);

  req.on("close", () => {
    clients.delete(res);
  });
});

// Stock price generator (every 2 seconds)
let lastPrice = 100;

setInterval(() => {
  const delta = (Math.random() * 4 - 2).toFixed(2); // ±2
  lastPrice = (parseFloat(lastPrice) + parseFloat(delta)).toFixed(2);

  const data = JSON.stringify({
    price: lastPrice,
    timestamp: new Date().toISOString(),
  });

  for (const client of clients) {
    client.write(`data: ${data}\n\n`);
  }
}, 2000);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
