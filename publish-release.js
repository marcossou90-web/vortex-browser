const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// 1. Carrega GH_TOKEN do .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0]?.trim();
      const val = parts.slice(1).join('=').trim();
      if (key && val) {
        process.env[key] = val;
      }
    }
  }
}

if (!process.env.GH_TOKEN) {
  console.error('[ERRO] GH_TOKEN não encontrado no arquivo .env!');
  process.exit(1);
}

console.log('[Release] Executando electron-builder com token autenticado...');
const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

const res = spawnSync(npxCmd, ['electron-builder', '--win', 'nsis', '--publish', 'always'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

process.exit(res.status || 0);
