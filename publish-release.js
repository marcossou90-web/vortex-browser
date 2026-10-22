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
process.env.GITHUB_TOKEN = process.env.GH_TOKEN;

// 2. Incrementa a versão no package.json (suporta minor/major quando for grande atualização)
const arg = process.argv[2];
const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const parts = pkg.version.split('.').map(n => parseInt(n, 10));

let newVer = '';
if (arg === 'minor') {
  parts[1] += 1;
  parts[2] = 0;
  newVer = parts.join('.');
  console.log('[1/4] Grande atualização (Minor release)...');
} else if (arg === 'major') {
  parts[0] += 1;
  parts[1] = 0;
  parts[2] = 0;
  newVer = parts.join('.');
  console.log('[1/4] Atualização Maior (Major release)...');
} else if (arg && /^\d+\.\d+\.\d+$/.test(arg)) {
  newVer = arg;
  console.log(`[1/4] Definindo versão específica para ${newVer}...`);
} else {
  parts[2] += 1;
  newVer = parts.join('.');
  console.log('[1/4] Incrementando versão de patch...');
}

const oldVer = pkg.version;
pkg.version = newVer;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(`Versão: ${oldVer} -> ${newVer}`);

const tag = `v${newVer}`;

// Atualiza o arquivo version.json do site na pasta docs para o site sincronizar instantaneamente
const docsVerPath = path.join(__dirname, 'docs', 'version.json');
try {
  const versionInfo = {
    version: newVer,
    tag: tag,
    name: `Vortex Browser ${tag}`,
    releaseDate: new Date().toISOString(),
    fileName: `Vortex Browser Setup ${newVer}.exe`,
    fileSize: '80.5 MB',
    downloadUrl: `https://github.com/vortexbrowser/vortex-browser/releases/download/${tag}/Vortex.Browser.Setup.${newVer}.exe`,
    githubReleaseUrl: `https://github.com/vortexbrowser/vortex-browser/releases/tag/${tag}`,
    changelog: [
      `Vortex Browser ${tag} Oficial`,
      'Nova interface moderna com abas curvas cibernéticas e Omnibar com efeito glow neon',
      'Novo gerenciador de Cookies & Consentimento com controle de privacidade e limpeza ao fechar',
      'Assistente inteligente de aceitação de banners de cookies (LGPD / GDPR)',
      'Vortex Privacy Shield atualizado com proteção ultrarrápida contra anúncios e rastreadores',
      'Sistema de atualização automática em segundo plano idêntico ao Google Chrome'
    ]
  };
  fs.writeFileSync(docsVerPath, JSON.stringify(versionInfo, null, 2) + '\n', 'utf8');
  console.log(`[Site Vortex] docs/version.json atualizado automaticamente para ${tag}!`);
} catch (e) {
  console.warn('[Site Vortex] Aviso: Não foi possível atualizar docs/version.json:', e.message);
}

// 3. Git commit e sincronização
console.log('\n[2/4] Registrando no Git e sincronizando com GitHub...');
spawnSync('git', ['add', '-A'], { stdio: 'inherit' });
spawnSync('git', ['commit', '-m', `chore: release ${tag}`, '--allow-empty'], { stdio: 'inherit' });
spawnSync('git', ['push', 'origin', 'main'], { stdio: 'inherit' });

// 4. Compila e publica via electron-builder (ele próprio cria a release no GitHub com todos os assets)
console.log(`\n[3/4] Compilando instalador .exe e publicando release oficial ${tag} no GitHub...`);
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// Limpa artefatos antigos de dist para evitar que o latest.yml anterior seja enviado
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  try {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('[Build] Pasta dist limpa para evitar conflitos de versão.');
  } catch (e) {}
}

const buildResult = spawnSync(npmCmd, ['run', 'dist', '--', '--publish', 'always'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

if (buildResult.status !== 0) {
  console.error('\n[ERRO] Falha durante a compilação ou publicação.');
  process.exit(buildResult.status || 1);
}

// 5. Garantir que a release seja marcada como publicada (draft: false) via GitHub API
const https = require('https');
const token = process.env.GH_TOKEN;
if (token) {
  const getReq = https.request({
    hostname: 'api.github.com',
    path: '/repos/vortexbrowser/vortex-browser/releases',
    headers: { 'Authorization': 'token ' + token, 'User-Agent': 'VortexUpdater' }
  }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      try {
        const list = JSON.parse(data);
        const rel = Array.isArray(list) ? list.find(r => r.tag_name === tag) : null;
        if (rel) {
          const patchBody = JSON.stringify({
            draft: false,
            name: `Vortex Browser ${tag}`,
            body: `## Novidades na versão ${tag}\n\n- ✨ **Nova Interface Cyber**: Abas modernas curvas com indicador neon dinâmico e barra de endereços Omnibar redesenhada.\n- 🍪 **Gerenciador de Cookies & Consentimento**: Controle granular de cookies, limpeza automática ao sair e assistente de aceitação de banners.\n- 🛡️ **Vortex Privacy Shield**: Proteção reforçada contra rastreadores e popups intrusivos.\n- ⚡ **Auto-Update Integrado**: Atualização silenciosa em segundo plano idêntica ao Google Chrome.`
          });
          const patchReq = https.request({
            method: 'PATCH',
            hostname: 'api.github.com',
            path: `/repos/vortexbrowser/vortex-browser/releases/${rel.id}`,
            headers: {
              'Authorization': 'token ' + token,
              'User-Agent': 'VortexUpdater',
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(patchBody)
            }
          }, pres => {
            console.log(`[GitHub API] Status da publicação oficial: ${pres.statusCode}`);
          });
          patchReq.write(patchBody);
          patchReq.end();
        }
      } catch(e) {}
    });
  });
  getReq.end();
}

// Sincroniza tamanho real e artefato gerado em docs/version.json
const ymlPath = path.join(__dirname, 'dist', 'latest.yml');
if (fs.existsSync(ymlPath) && fs.existsSync(docsVerPath)) {
  try {
    const ymlContent = fs.readFileSync(ymlPath, 'utf8');
    const sizeMatch = ymlContent.match(/size:\s*(\d+)/);
    const fileMatch = ymlContent.match(/path:\s*([^\r\n]+)/);
    if (sizeMatch && sizeMatch[1]) {
      const bytes = parseInt(sizeMatch[1], 10);
      const curDocs = JSON.parse(fs.readFileSync(docsVerPath, 'utf8'));
      curDocs.fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      if (fileMatch && fileMatch[1]) {
        curDocs.fileName = fileMatch[1].trim();
      }
      fs.writeFileSync(docsVerPath, JSON.stringify(curDocs, null, 2) + '\n', 'utf8');
      spawnSync('git', ['add', docsVerPath], { stdio: 'ignore' });
      spawnSync('git', ['commit', '-m', `chore: update site metadata for ${tag}`], { stdio: 'ignore' });
      spawnSync('git', ['push', 'origin', 'main'], { stdio: 'ignore' });
      console.log(`[Site Vortex] Metadados finais do site sincronizados com sucesso no GitHub Pages!`);
    }
  } catch (e) {}
}

console.log('\n========================================================');
console.log(`[4/4] SUCESSO! A versão ${tag} foi publicada no GitHub!`);
console.log('      Todos os usuários do Vortex serão atualizados automaticamente.');
console.log('      O site de download oficial em /docs foi atualizado com a nova versão.');
console.log('========================================================\n');

