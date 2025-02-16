# Node.js Multi-Environment Setup with PM2

This guide covers how to set up, run, and manage your Node.js API and WebSocket servers in both development and production environments using PM2.

## Prerequisites

Ensure you have the following installed:

- Node.js
- NPM (comes with Node.js)
- PM2
- Git (optional but recommended)

### Clone the Project

```sh
 git clone <your-repository-url>
 cd <your-project-folder>
```

### Install Dependencies

```sh
npm install
```

## PM2 Configuration (ecosystem.config.js)

Ensure that your `ecosystem.config.js` file is correctly set up to manage both development and production environments separately.

### Key Fix: Use Unique Names for Each Environment

```javascript
module.exports = {
  apps: [
    {
      name: "api-server-dev",
      script: "./app/api-server.js",
      instances: 2,
      exec_mode: "cluster",
      watch: process.env.NODE_ENV === "dev",
      ignore_watch: ["node_modules", "logs"],
      env_dev: {
        NODE_ENV: "dev",
        /*You can add PORT here or in .env file but cache issues occur when you add PORT here, so I advice using the .env file*/
        PORT: 3000,
        LOG_LEVEL: "debug",
      },
      env_file_dev: "./app/.env.dev",
    },
    {
      name: "api-server-prod",
      script: "./app/api-server.js",
      instances: 2,
      exec_mode: "cluster",
      watch: false,
      env_prod: {
        NODE_ENV: "prod",
        PORT: 8000,
        LOG_LEVEL: "info",
      },
      env_file_production: "./app/.env.prod",
    },
    {
      name: "websocket-server-dev",
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
      env_file_dev: "./app/.env.dev",
    },
    {
      name: "websocket-server-prod",
      script: "./app/websocket-server.js",
      instances: 2,
      exec_mode: "cluster",
      watch: false,
      env_prod: {
        NODE_ENV: "prod",
        PORT: 9000,
        LOG_LEVEL: "info",
      },
      env_file_production: "./app/.env.prod",
    },
  ],
};
```

## Running the App with PM2

### Start Development Environment

```sh
npm run dev
```

Or manually:

```sh
pm2 start ecosystem.config.js --only api-server-dev,websocket-server-dev --env dev
```

### Start Production Environment

```sh
npm run prod
```

Or manually:

```sh
pm2 start ecosystem.config.js --only api-server-prod,websocket-server-prod --env prod
```

## Managing PM2 Processes

### Check Running Processes

```sh
pm2 list
```

### Reload Without Downtime

#### Development

```sh
npm run dev:reload
```

#### Production

```sh
npm run prod:reload
```

### Restart Manually (If Needed)

#### Development

```sh
npm run dev:restart
```

#### Production

```sh
npm run prod:restart
```

### Stop Running Processes

#### Development

```sh
npm run dev:stop
```

#### Production

```sh
npm run prod:stop
```

### Delete Processes (Permanent Stop)

#### Development

```sh
npm run dev:delete
```

#### Production

```sh
npm run prod:delete
```

## Logs and Debugging

### View Logs for Development

```sh
npm run logs:dev
npm run logs:ws-dev
```

### View Logs for Production

```sh
npm run logs:prod
npm run logs:ws-prod
```

## Auto-Restart After Reboot

Ensure PM2 processes restart after a system reboot.

```sh
npm run pm2:save
npm run pm2:startup
```

## Conclusion

With this setup, you can run development and production environments separately without conflicts using PM2. This ensures smooth scaling, monitoring, and management of your Node.js app.
