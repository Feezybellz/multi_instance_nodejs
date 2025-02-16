const ENV_PATH = process.env.env_file;
require("dotenv").config({ path: ENV_PATH });

const express = require("express");
const app = express();

const isDev = process.env.NODE_ENV === "dev";
console.log(
  `🚀 API Server running in ${isDev ? "DEVELOPMENT" : "PRODUCTION"} mode`
);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const content = `
    <h1>Hello from API Server (Mode: ${process.env.NODE_ENV}). </h1>
    <h2>Environment: ${process.env.NODE_ENV}</h2>
    <h2>Port: ${process.env.PORT} || ${PORT}</h2>
    <p>process data = ${JSON.stringify(process.env)}</p>
  `;
  res.send(JSON.stringify(process.env));
});

app.listen(PORT, () => {
  console.log(`✅ API Server started on port ${PORT}`);
});
