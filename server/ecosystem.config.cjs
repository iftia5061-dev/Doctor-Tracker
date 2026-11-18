module.exports = {
  apps: [
    {
      name: 'doctor-tracker-api',
      script: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      max_memory_restart: '300M',
    },
  ],
};
