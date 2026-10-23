const fs = require('fs');
const https = require('https');
const path = require('path');
const crypto = require('crypto');

const token = fs.readFileSync('.env', 'utf8').split('\n')[0].replace('GH_TOKEN=', '').trim();
const releaseId = 421142085;
const exePath = path.join(__dirname, 'dist', 'Vortex Browser Setup 1.3.1.exe');
const blockmapPath = path.join(__dirname, 'dist', 'Vortex Browser Setup 1.3.1.exe.blockmap');
const ymlPath = path.join(__dirname, 'dist', 'latest.yml');

const fileBuffer = fs.readFileSync(exePath);
const sha512 = crypto.createHash('sha512').update(fileBuffer).digest('base64');
const size = fileBuffer.length;

const latestYml = [
  'version: 1.3.1',
  'files:',
  '  - url: Vortex-Browser-Setup-1.3.1.exe',
  '    sha512: ' + sha512,
  '    size: ' + size,
  'path: Vortex-Browser-Setup-1.3.1.exe',
  'sha512: ' + sha512,
  'releaseDate: \'' + new Date().toISOString() + '\''
].join('\n') + '\n';

fs.writeFileSync(ymlPath, latestYml, 'utf8');
console.log('latest.yml para 1.3.1 gerado com sucesso!');

function uploadAsset(name, contentType, data) {
  return new Promise((resolve, reject) => {
    console.log(`Iniciando upload de ${name} (${(data.length / (1024*1024)).toFixed(1)} MB)...`);
    const req = https.request({
      method: 'POST',
      hostname: 'uploads.github.com',
      path: `/repos/vortexbrowser/vortex-browser/releases/${releaseId}/assets?name=${encodeURIComponent(name)}`,
      headers: {
        'Authorization': 'token ' + token,
        'User-Agent': 'VortexUploader',
        'Content-Type': contentType,
        'Content-Length': data.length
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        console.log(`Upload de ${name}: status ${res.statusCode}`);
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function updateReleaseNotes() {
  return new Promise((resolve, reject) => {
    const patchBody = JSON.stringify({
      draft: false,
      name: 'Vortex Browser v1.3.1',
      body: `## 🚀 O que há de novo na versão 1.3.1\n\n- 🖥️ **Abertura Inteligente em Tela Cheia (Estilo Google Chrome)**: O navegador agora salva e restaura automaticamente suas dimensões e posição da janela, abrindo sempre maximizado ou preenchendo sua tela.\n- 🗖 **Duplo Clique para Maximizar**: Dê duplo clique no espaço vazio da barra de abas para alternar facilmente entre tela cheia e tamanho normal.\n- ✨ **Nova Interface Cyber**: Abas modernas curvas com indicador neon dinâmico e barra de endereços Omnibar redesenhada.\n- 🍪 **Gerenciador de Cookies & Consentimento**: Controle granular de cookies, limpeza automática ao sair e assistente de aceitação de banners.\n- 🛡️ **Vortex Privacy Shield**: Proteção reforçada contra rastreadores e popups intrusivos.\n- ⚡ **Auto-Update Integrado**: Atualização silenciosa em segundo plano idêntica ao Google Chrome.`
    });
    const req = https.request({
      method: 'PATCH',
      hostname: 'api.github.com',
      path: `/repos/vortexbrowser/vortex-browser/releases/${releaseId}`,
      headers: {
        'Authorization': 'token ' + token,
        'User-Agent': 'VortexUploader',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(patchBody)
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        console.log(`Atualização das Notas de Release v1.3.1: status ${res.statusCode}`);
        resolve();
      });
    });
    req.on('error', reject);
    req.write(patchBody);
    req.end();
  });
}

(async () => {
  await uploadAsset('Vortex-Browser-Setup-1.3.1.exe', 'application/octet-stream', fileBuffer);
  await uploadAsset('latest.yml', 'text/yaml', Buffer.from(latestYml));
  await updateReleaseNotes();
  console.log('Release v1.3.1 completamente configurada e publicada!');
})();
