const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

console.log('========================================================');
console.log('       🚀 PUBLICADOR AUTOMÁTICO DE ATUALIZAÇÕES DO VORTEX');
console.log('========================================================\n');

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

// 2. Incrementa a versão no package.json
console.log('[1/4] Incrementando versão de patch...');
const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const parts = pkg.version.split('.').map(n => parseInt(n, 10));
parts[2] += 1;
const oldVer = pkg.version;
const newVer = parts.join('.');
pkg.version = newVer;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(`Versão: ${oldVer} -> ${newVer}`);

const tag = `v${newVer}`;

// 3. Git commit e tag
console.log('\n[2/4] Registrando no Git e sincronizando com GitHub...');
spawnSync('git', ['add', '-A'], { stdio: 'inherit' });
spawnSync('git', ['commit', '-m', `chore: release ${tag}`, '--allow-empty'], { stdio: 'inherit' });
spawnSync('git', ['push', 'origin', 'main'], { stdio: 'inherit' });

// 4. Compila e publica via electron-builder (ele próprio cria a release no GitHub com todos os assets)
console.log(`\n[3/4] Compilando instalador .exe e publicando release oficial ${tag} no GitHub...`);
const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

const buildResult = spawnSync(npxCmd, ['electron-builder', '--win', 'nsis', '--publish', 'always'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

if (buildResult.status !== 0) {
  console.error('\n[ERRO] Falha durante a compilação ou publicação.');
  process.exit(buildResult.status || 1);
}

console.log('\n========================================================');
console.log(`[4/4] SUCESSO! A versão ${tag} foi publicada no GitHub!`);
console.log('      Todos os usuários do Vortex serão atualizados automaticamente.');
console.log('========================================================\n');
