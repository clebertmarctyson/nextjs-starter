module.exports = {
  apps: [
    {
      name: "dca-bot-dashboard",
      script: "node_modules/next/dist/bin/next",
      instances: 1,
      args: "start",
      cwd: "/var/www/dca-bot-dashboard",
      exec_mode: "cluster",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3003,
      },
    },
  ],
};
