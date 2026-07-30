module.exports = {
  apps: [
    {
      name: 'owl-production',
      script: 'npm',
      args: 'start',
      cwd: '/Users/jay/owl',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
