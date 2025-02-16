module.exports = {
  apps: [
    // API Server - Development
    {
      name: "api-server-dev", // ✅ Unique name for development
      script: "./app/api-server.js",
      instances: 2,
      exec_mode: "cluster",
      watch: process.env.NODE_ENV === "dev",
      ignore_watch: ["node_modules", "logs"],

      env_dev: {
        NODE_ENV: "dev",
        // PORT: 3000,
        LOG_LEVEL: "debug",
      },
      env_file: "./app/.env.dev",

      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "./logs/api-error-dev.log",
      out_file: "./logs/api-output-dev.log",
      merge_logs: true,
    },

    // API Server - Production
    {
      name: "api-server-prod", // ✅ Unique name for production
      script: "./app/api-server.js",
      instances: 2,
      exec_mode: "cluster",
      watch: false,

      env_prod: {
        NODE_ENV: "prod",
        // PORT: 8000,
        LOG_LEVEL: "info",
      },
      env_file: "./app/.env.prod",

      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "./logs/api-error-prod.log",
      out_file: "./logs/api-output-prod.log",
      merge_logs: true,
    },

    // WebSocket Server - Development
    {
      name: "websocket-server-dev", // ✅ Unique name for development
      script: "./app/websocket-server.js",
      instances: 2,
      exec_mode: "cluster",
      watch: process.env.NODE_ENV === "dev",
      ignore_watch: ["node_modules", "logs"],

      env_dev: {
        NODE_ENV: "dev",
        PORT: 4000,
        LOG_LEVEL: "debug",
      },
      env_file: "./app/.env.dev",

      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "./logs/ws-error-dev.log",
      out_file: "./logs/ws-output-dev.log",
      merge_logs: true,
    },

    // WebSocket Server - Production
    {
      name: "websocket-server-prod", // ✅ Unique name for production
      script: "./app/websocket-server.js",
      instances: 2,
      exec_mode: "cluster",
      watch: false,

      env_prod: {
        NODE_ENV: "prod",
        PORT: 9000,
        LOG_LEVEL: "info",
      },
      env_file: "./app/.env.prod",

      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "./logs/ws-error-prod.log",
      out_file: "./logs/ws-output-prod.log",
      merge_logs: true,
    },
  ],
};
