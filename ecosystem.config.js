export default {
  apps: [
    {
      name: 'api',
      cwd: './api',
      script: 'index.js',
      watch: true,
      env: {
        NODE_ENV: 'development',
      },
      max_memory_restart: '300M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'manager',
      cwd: './manager',
      script: 'index.js',
      watch: true,
      env: {
        NODE_ENV: 'development',
      },
      max_memory_restart: '200M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    }
  ],
};