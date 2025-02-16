require("dotenv").config({ path: process.env.env_file_dev });

const WebSocket = require("ws");

const isDev = process.env.NODE_ENV === "dev";
console.log(
  `🚀 WebSocket Server running in ${isDev ? "DEVELOPMENT" : "PRODUCTION"} mode`
);

const PORT = process.env.PORT || 4000;
const wss = new WebSocket.Server({ port: PORT });

wss.on("connection", (ws) => {
  console.log("✅ New WebSocket connection established.");
  ws.send(`Connected to WebSocket Server (Mode: ${process.env.NODE_ENV})`);
});

console.log(`✅ WebSocket Server started on port ${PORT}`);
