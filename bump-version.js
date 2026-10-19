const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');

try {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const versionParts = pkg.version.split('.').map(n => parseInt(n, 10));
  
  if (versionParts.length === 3 && !versionParts.some(isNaN)) {
    // Incrementa a versão PATCH conforme SemVer (ex: 1.1.3 -> 1.1.4)
    versionParts[2] += 1;
    const oldVersion = pkg.version;
    const newVersion = versionParts.join('.');
    pkg.version = newVersion;
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log(`[Vortex Build Auto-Version] Versão atualizada com sucesso: ${oldVersion} -> ${newVersion}`);
  } else {
    console.warn('[Vortex Build Auto-Version] Formato de versão não reconhecido:', pkg.version);
  }
} catch (err) {
  console.error('[Vortex Build Auto-Version] Erro ao incrementar versão:', err.message);
}
