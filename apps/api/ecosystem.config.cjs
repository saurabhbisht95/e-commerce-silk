module.exports = {
  apps: [
    {
      name: 'doon-silk-api',
      script: 'src/server.js',
      cwd: __dirname,
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '512M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
