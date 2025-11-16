const { spawn } = require('child_process')

function openBrowser(url) {
  const platform = process.platform
  if (platform === 'win32') {
    spawn('powershell', ['Start-Process', url], { stdio: 'ignore', shell: true })
  } else if (platform === 'darwin') {
    spawn('open', [url], { stdio: 'ignore' })
  } else {
    spawn('xdg-open', [url], { stdio: 'ignore' })
  }
}

function run(cmd, cwd) {
  const p = spawn(cmd, { cwd, stdio: 'inherit', shell: true })
  return p
}

const backend = run('npm run dev', './backend')
setTimeout(() => { run('npm run start:web', './frontend-mobile'); setTimeout(() => openBrowser('http://localhost:8081/'), 3000) }, 1000)

backend.on('exit', (code) => { process.exit(code || 0) })