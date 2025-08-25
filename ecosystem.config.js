module.exports = {
  apps: [
    {
      name: "nextjs-app",
      script: "npm",
      args: "run start",
      exec_mode: "cluster",
      instances: "max", // uses all cores (2 on t3.medium)
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "express-app",
      script: "node",
      args: "your-express-entry.js", // replace with your actual entry point, e.g., index.js or server.js
      exec_mode: "cluster",
      instances: "max",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
