const nodeBin = process.execPath
const nextBin = "node_modules/next/dist/bin/next"
const scriptArgs = "start -p 3000"

module.exports = {
  apps: [
    {
      name: "orcamentario",
      cwd: __dirname,
      script: nextBin,
      args: scriptArgs,
      interpreter: nodeBin,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "700M",
      min_uptime: "10s",
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: "production",
        PORT: "3000"
      }
    }
  ]
}
