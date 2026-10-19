// settings.js — Lógica da página de configurações do Vortex Browser

const SEARCH_ENGINES = {
  duckduckgo: 'https://duckduckgo.com/?q=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  brave: 'https://search.brave.com/search?q=',
  startpage: 'https://www.startpage.com/search?q=',
  ecosia: 'https://www.ecosia.org/search?q='
};

// Carrega configurações do localStorage
function loadSettings() {
  const s = JSON.parse(localStorage.getItem('vortex-settings') || '{}');
  if (document.getElementById('themeSelect')) document.getElementById('themeSelect').value = s.theme || 'dark';
  if (document.getElementById('fontSizeSelect')) document.getElementById('fontSizeSelect').value = s.fontSize || 'medium';
  if (document.getElementById('showBookmarksBar')) document.getElementById('showBookmarksBar').checked = !!s.showBookmarksBar;
  if (document.getElementById('showHomeBtn')) document.getElementById('showHomeBtn').checked = s.showHomeBtn !== false;
  if (document.getElementById('defaultZoomSelect')) document.getElementById('defaultZoomSelect').value = s.defaultZoom || '100';
  if (document.getElementById('adblockEnabled')) document.getElementById('adblockEnabled').checked = s.adblock !== false;
  if (document.getElementById('dntEnabled')) document.getElementById('dntEnabled').checked = s.dnt !== false;
  if (document.getElementById('gpcEnabled')) document.getElementById('gpcEnabled').checked = s.gpc !== false;
  if (document.getElementById('clearOnExit')) document.getElementById('clearOnExit').checked = !!s.clearOnExit;
  if (document.getElementById('httpWarning')) document.getElementById('httpWarning').checked = s.httpWarning !== false;
  if (document.getElementById('searchEngineSelect')) document.getElementById('searchEngineSelect').value = s.searchEngine || 'duckduckgo';
  if (document.getElementById('searchSuggestions')) document.getElementById('searchSuggestions').checked = s.searchSuggestions !== false;
  if (document.getElementById('startupSelect')) document.getElementById('startupSelect').value = s.startup || 'home';
  if (document.getElementById('homePageInput')) document.getElementById('homePageInput').value = s.homePage || '';
  if (document.getElementById('askDownloadLocation')) document.getElementById('askDownloadLocation').checked = s.askDownload !== false;
  if (document.getElementById('languageSelect')) document.getElementById('languageSelect').value = s.language || 'pt-BR';
  if (document.getElementById('translatePages')) document.getElementById('translatePages').checked = s.translate !== false;
  if (document.getElementById('uiAnimations')) document.getElementById('uiAnimations').checked = s.animations !== false;
  if (document.getElementById('highContrast')) document.getElementById('highContrast').checked = !!s.highContrast;
}

// Salva configurações no localStorage e notifica o renderer
function saveSettings() {
  const s = {
    theme: document.getElementById('themeSelect')?.value,
    fontSize: document.getElementById('fontSizeSelect')?.value,
    showBookmarksBar: document.getElementById('showBookmarksBar')?.checked,
    showHomeBtn: document.getElementById('showHomeBtn')?.checked,
    defaultZoom: document.getElementById('defaultZoomSelect')?.value,
    adblock: document.getElementById('adblockEnabled')?.checked,
    dnt: document.getElementById('dntEnabled')?.checked,
    gpc: document.getElementById('gpcEnabled')?.checked,
    clearOnExit: document.getElementById('clearOnExit')?.checked,
    httpWarning: document.getElementById('httpWarning')?.checked,
    searchEngine: document.getElementById('searchEngineSelect')?.value,
    searchSuggestions: document.getElementById('searchSuggestions')?.checked,
    startup: document.getElementById('startupSelect')?.value,
    homePage: document.getElementById('homePageInput')?.value,
    askDownload: document.getElementById('askDownloadLocation')?.checked,
    language: document.getElementById('languageSelect')?.value,
    translate: document.getElementById('translatePages')?.checked,
    animations: document.getElementById('uiAnimations')?.checked,
    highContrast: document.getElementById('highContrast')?.checked,
  };
  localStorage.setItem('vortex-settings', JSON.stringify(s));
  // Notifica o renderer pai (iframe parent) sobre as mudanças em tempo real
  try {
    window.parent.postMessage({ type: 'settings-updated', settings: s }, '*');
  } catch (e) {}
  // Fallback: notifica se aberto em janela separada
  try {
    if (window.opener) window.opener.postMessage({ type: 'settings-updated', settings: s }, '*');
  } catch (e) {}
}

function switchSection(section) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
  const nav = document.querySelector(`.nav-item[data-section="${section}"]`);
  if (nav) nav.classList.add('active');
  const sec = document.getElementById('section-' + section);
  if (sec) sec.classList.add('active');
}

// Navegação entre seções
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const section = item.getAttribute('data-section');
    switchSection(section);
  });
});

// Auto-salvar em qualquer mudança
document.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('change', saveSettings);
});

// Botão limpar dados (limpa histórico, cache de sessão, cookies via renderer/IPC)
document.getElementById('btnClearNow')?.addEventListener('click', () => {
  const confirmed = confirm('Tem certeza que deseja limpar dados de navegação (histórico, cookies e cache)?');
  if (!confirmed) return;
  try {
    window.parent.postMessage({ type: 'clear-browsing-data-request' }, '*');
  } catch (e) {}
  alert('Solicitação de limpeza enviada com sucesso!');
});

// ── Módulo de Senhas Salvas e Sincronização por E-mail ───────────────
async function loadPasswordsSection() {
  const container = document.getElementById('passwordsListContainer');
  const countEl = document.getElementById('passwordsCount');
  if (!container) return;

  let passwords = [];
  try {
    if (window.vortexAPI && window.vortexAPI.getSavedPasswords) {
      passwords = await window.vortexAPI.getSavedPasswords();
    } else {
      window.parent.postMessage({ type: 'get-passwords-request' }, '*');
      return;
    }
  } catch (e) {
    console.error('Erro ao buscar senhas:', e);
  }

  renderPasswordsList(passwords);
}

function renderPasswordsList(passwords) {
  const container = document.getElementById('passwordsListContainer');
  const countEl = document.getElementById('passwordsCount');
  if (!container) return;
  if (countEl) countEl.innerText = passwords.length;

  if (!passwords || passwords.length === 0) {
    container.innerHTML = `
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:24px;text-align:center;color:var(--text-muted);">
        <div style="font-size:32px;margin-bottom:8px;">🔒</div>
        <div style="font-weight:600;color:var(--text-main);margin-bottom:4px;">Nenhuma senha salva ainda</div>
        <div style="font-size:13px;">Quando você fizer login em sites (como e-SUS, Webmail, Google, etc.), o Vortex oferecerá para salvar e preencher automaticamente.</div>
      </div>
    `;
    return;
  }

  let html = '';
  passwords.forEach(p => {
    const domain = p.domain || p.url;
    html += `
      <div class="setting-card" style="display:flex; justify-content:space-between; align-items:center; padding:12px 18px;" id="pwd-card-${p.id}">
        <div style="flex:1;">
          <div style="font-weight:600; font-size:14px; color:var(--text-main); display:flex; align-items:center; gap:6px;">
            <span>🌐</span> <span>${domain}</span>
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">
            Usuário: <span style="color:var(--text-main); font-weight:500;">${p.username || 'Não identificado'}</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="password" value="${p.password}" readonly style="background:var(--input-bg); border:1px solid var(--border); border-radius:4px; padding:4px 8px; color:var(--text-main); width:130px; font-size:12px;" id="pwd-field-${p.id}" />
          <button class="btn-setting-action" style="padding:4px 8px; font-size:12px;" onclick="togglePasswordVisibility('${p.id}')" title="Mostrar/Ocultar Senha">👁️</button>
          <button class="btn-setting-action" style="padding:4px 8px; font-size:12px;" onclick="copyPassword('${p.password}')" title="Copiar senha">📋</button>
          <button class="btn-setting-action" style="padding:4px 8px; font-size:12px; color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="deleteSavedPassword('${p.id}')" title="Excluir">🗑️</button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

window.togglePasswordVisibility = function(id) {
  const input = document.getElementById('pwd-field-' + id);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
};

window.copyPassword = function(pwd) {
  navigator.clipboard.writeText(pwd);
  alert('Senha copiada para a área de transferência!');
};

window.deleteSavedPassword = async function(id) {
  if (!confirm('Deseja realmente remover esta senha salva?')) return;
  if (window.vortexAPI && window.vortexAPI.deletePassword) {
    const res = await window.vortexAPI.deletePassword(id);
    if (res && res.passwords) renderPasswordsList(res.passwords);
  } else {
    window.parent.postMessage({ type: 'delete-password-request', id }, '*');
  }
};

// Carregar e salvar perfil de sincronização por e-mail
async function loadSyncProfileSection() {
  let profile = { email: '', name: '', syncEnabled: true, lastSync: null };
  try {
    if (window.vortexAPI && window.vortexAPI.getUserProfile) {
      profile = await window.vortexAPI.getUserProfile();
    } else {
      window.parent.postMessage({ type: 'get-sync-profile-request' }, '*');
      return;
    }
  } catch (e) {}

  renderSyncProfile(profile);
}

function renderSyncProfile(profile) {
  const emailInput = document.getElementById('syncEmailInput');
  const nameInput = document.getElementById('syncNameInput');
  const statusDesc = document.getElementById('syncStatusDesc');
  if (emailInput && profile.email) emailInput.value = profile.email;
  if (nameInput && profile.name) nameInput.value = profile.name;
  if (statusDesc) {
    if (profile.email) {
      const syncDate = profile.lastSync ? new Date(profile.lastSync).toLocaleString('pt-BR') : 'Ativo';
      statusDesc.innerHTML = `<span style="color:var(--accent-emerald); font-weight:600;">✓ Sincronizado com ${profile.email}</span> (Última sync: ${syncDate})`;
    } else {
      statusDesc.innerText = 'Nenhuma conta vinculada. Digite seu e-mail para sincronizar.';
    }
  }
}

document.getElementById('btnSaveSyncProfile')?.addEventListener('click', async () => {
  const email = document.getElementById('syncEmailInput')?.value.trim();
  const name = document.getElementById('syncNameInput')?.value.trim();
  if (!email) {
    alert('Por favor, informe um e-mail válido para a sincronização.');
    return;
  }
  const payload = { email, name, syncEnabled: true };
  if (window.vortexAPI && window.vortexAPI.saveUserProfile) {
    const res = await window.vortexAPI.saveUserProfile(payload);
    if (res && res.profile) {
      renderSyncProfile(res.profile);
      alert('Perfil conectado e sincronizado com sucesso com ' + email);
    }
  } else {
    window.parent.postMessage({ type: 'save-sync-profile-request', profile: payload }, '*');
  }
});

// Exportar e Importar Backup do Cofre
document.getElementById('btnExportVault')?.addEventListener('click', async () => {
  let jsonString = '';
  if (window.vortexAPI && window.vortexAPI.exportVault) {
    jsonString = await window.vortexAPI.exportVault();
  } else {
    window.parent.postMessage({ type: 'export-vault-request' }, '*');
    return;
  }
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vortex-backup-senhas-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('btnImportVault')?.addEventListener('click', () => {
  document.getElementById('importVaultFileInput')?.click();
});

document.getElementById('importVaultFileInput')?.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (evt) => {
    const content = evt.target.result;
    if (window.vortexAPI && window.vortexAPI.importVault) {
      const res = await window.vortexAPI.importVault(content);
      if (res && res.success) {
        alert(`Backup importado com sucesso! ${res.count} senhas sincronizadas.`);
        loadPasswordsSection();
        loadSyncProfileSection();
      } else {
        alert('Erro ao importar backup. Verifique se o arquivo JSON é válido.');
      }
    } else {
      window.parent.postMessage({ type: 'import-vault-request', data: content }, '*');
    }
  };
  reader.readAsText(file);
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) switchSection(hash);
});

loadSettings();
loadPasswordsSection();
loadSyncProfileSection();

if (window.location.hash) {
  switchSection(window.location.hash.replace('#', ''));
}

// Carregar caminho da pasta de downloads
try {
  window.parent.postMessage({ type: 'get-downloads-path-request' }, '*');
} catch (e) {}

// ── Aplicar tema ao body da página de configurações ──
function applyThemeToBody(s) {
  document.body.classList.toggle('theme-light', s.theme === 'light');
  document.body.classList.toggle('high-contrast', !!s.highContrast);
}

// Aplica tema salvo ao carregar
try {
  const saved = JSON.parse(localStorage.getItem('vortex-settings') || '{}');
  applyThemeToBody(saved);
} catch(e) {}

// ── Módulo de Downloads Estilo Google Chrome ────────────────────────
let allDownloadsList = [];

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return 'Tamanho desconhecido';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function getFileIcon(fileName) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  if (['exe', 'msi', 'bat', 'cmd'].includes(ext)) return '⚙️';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
  if (['pdf'].includes(ext)) return '📄';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return '🖼️';
  if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) return '🎬';
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return '🎵';
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return '📝';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
  if (['iso', 'img'].includes(ext)) return '💿';
  return '📁';
}

function renderDownloadsList(list) {
  const container = document.getElementById('downloadsListContainer');
  const countBadge = document.getElementById('downloadsCountBadge');
  const search = (document.getElementById('downloadsSearchInput')?.value || '').toLowerCase().trim();
  if (!container) return;

  allDownloadsList = list || [];
  let filtered = allDownloadsList;
  if (search) {
    filtered = filtered.filter(d => (d.fileName || '').toLowerCase().includes(search));
  }

  if (countBadge) countBadge.innerText = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-md); padding:32px; text-align:center; color:var(--text-muted);">
        <div style="font-size:36px; margin-bottom:10px;">📥</div>
        <div style="font-size:15px; font-weight:600; color:var(--text-main); margin-bottom:4px;">
          ${search ? 'Nenhum download encontrado para "' + search + '"' : 'Nenhum download registrado'}
        </div>
        <div style="font-size:13px;">Os arquivos baixados ou em andamento aparecerão organizados aqui.</div>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    const isProgressing = item.state === 'progressing';
    const isCompleted = item.state === 'completed';
    const isFailed = item.state === 'interrupted' || item.state === 'cancelled';

    let statusText = 'Concluído';
    let statusClass = 'status-completed';
    if (isProgressing) {
      const pct = item.percent !== undefined ? item.percent : (item.totalBytes > 0 ? Math.round((item.receivedBytes / item.totalBytes) * 100) : 0);
      statusText = `Baixando (${pct}%)`;
      statusClass = 'status-progressing';
    } else if (isFailed) {
      statusText = item.state === 'cancelled' ? 'Cancelado' : 'Falhou';
      statusClass = 'status-failed';
    }

    const sizeInfo = isProgressing
      ? `${formatFileSize(item.receivedBytes)} de ${formatFileSize(item.totalBytes)}`
      : formatFileSize(item.totalBytes || item.receivedBytes);

    const dateStr = item.completedTime ? new Date(item.completedTime).toLocaleString('pt-BR') : (item.startTime ? new Date(item.startTime).toLocaleTimeString('pt-BR') : '');

    html += `
      <div class="download-item-card" id="card-${item.id}">
        <div class="download-item-left">
          <div class="download-item-icon">${getFileIcon(item.fileName)}</div>
          <div class="download-item-info">
            <div class="download-item-title" title="${item.fileName}">${item.fileName}</div>
            <div class="download-item-meta">
              <span class="download-badge-status ${statusClass}">${statusText}</span>
              <span>•</span>
              <span>${sizeInfo}</span>
              ${dateStr ? `<span>•</span><span>${dateStr}</span>` : ''}
            </div>
            ${isProgressing ? `
              <div class="download-progress-track">
                <div class="download-progress-bar" style="width: ${item.percent || 15}%;"></div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="download-item-actions">
          ${isCompleted && item.savePath ? `
            <button class="btn-setting-action" onclick="openDownloadedFile('${item.savePath.replace(/\\/g, '\\\\')}')" title="Abrir arquivo">
              Abrir
            </button>
            <button class="btn-setting-action" onclick="showDownloadedInFolder('${item.savePath.replace(/\\/g, '\\\\')}')" title="Mostrar na pasta">
              Mostrar na pasta
            </button>
          ` : ''}
          ${isFailed ? `
            <span style="font-size:12px; color:#ef4444;">Não foi possível concluir</span>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.openDownloadedFile = function(savePath) {
  try {
    window.parent.postMessage({ type: 'open-download-file', path: savePath }, '*');
  } catch(e) {}
};

window.showDownloadedInFolder = function(savePath) {
  try {
    window.parent.postMessage({ type: 'show-download-in-folder', path: savePath }, '*');
  } catch(e) {}
};

// Eventos dos botões da seção de downloads
document.getElementById('btnOpenDownloadsFolder')?.addEventListener('click', () => {
  window.parent.postMessage({ type: 'open-downloads-folder' }, '*');
});

document.getElementById('btnClearDownloadsHistory')?.addEventListener('click', () => {
  if (confirm('Deseja limpar todo o histórico de downloads? (Os arquivos no disco não serão apagados)')) {
    window.parent.postMessage({ type: 'clear-downloads-history-request' }, '*');
    renderDownloadsList([]);
  }
});

document.getElementById('downloadsSearchInput')?.addEventListener('input', () => {
  renderDownloadsList(allDownloadsList);
});

// Carregar lista de downloads inicial
try {
  const cachedDownloads = JSON.parse(localStorage.getItem('vortex-downloads') || '[]');
  renderDownloadsList(cachedDownloads);
} catch(e) {}

try {
  window.parent.postMessage({ type: 'get-downloads-list-request' }, '*');
} catch(e) {}

// Recebe atualização de tema e downloads do renderer pai
window.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'settings-updated' && event.data.settings) {
    applyThemeToBody(event.data.settings);
    loadSettings();
  } else if (event.data.type === 'navigate-section' && event.data.section) {
    switchSection(event.data.section);
  } else if (event.data.type === 'downloads-path-response' && event.data.path) {
    const pEl = document.getElementById('downloadFolderPath');
    if (pEl) pEl.innerText = event.data.path;
  } else if (event.data.type === 'downloads-list-updated' && event.data.downloads) {
    renderDownloadsList(event.data.downloads);
  } else if (event.data.type === 'passwords-response') {
    renderPasswordsList(event.data.passwords || []);
  } else if (event.data.type === 'app-version-response' && event.data.version) {
    const vEl = document.getElementById('aboutAppVersion');
    if (vEl) vEl.innerText = `Versão ${event.data.version} (Versão oficial) 64 bits`;
  } else if (event.data.type === 'check-updates-response') {
    const res = event.data.result;
    const btn = document.getElementById('btnCheckUpdateSettings');
    const desc = document.getElementById('aboutUpdateStatusDesc');
    const badge = document.getElementById('badgeUpdateStatus');

    if (btn) btn.disabled = false;
    if (res && res.updateAvailable) {
      if (desc) desc.textContent = `Nova versão ${res.version} encontrada!`;
      if (badge) {
        badge.textContent = 'Nova Versão!';
        badge.style.background = 'rgba(34, 197, 94, 0.2)';
        badge.style.color = '#22c55e';
      }
    } else {
      if (desc) desc.textContent = 'O Vortex Browser está na versão mais recente.';
      if (badge) {
        badge.textContent = '✓ Atualizado';
        badge.style.background = 'rgba(34, 197, 94, 0.2)';
        badge.style.color = '#22c55e';
      }
    }
  }
});

try {
  window.parent.postMessage({ type: 'get-app-version-request' }, '*');
} catch(e) {}

// Botão manual de verificar atualizações na tela Sobre
document.getElementById('btnCheckUpdateSettings')?.addEventListener('click', async () => {
  const btn = document.getElementById('btnCheckUpdateSettings');
  const desc = document.getElementById('aboutUpdateStatusDesc');
  const badge = document.getElementById('badgeUpdateStatus');

  if (btn) btn.disabled = true;
  if (desc) desc.textContent = 'Verificando se há atualizações no repositório...';
  if (badge) {
    badge.textContent = 'Verificando...';
    badge.style.background = 'rgba(56, 189, 248, 0.2)';
    badge.style.color = '#38bdf8';
  }

  try {
    if (window.vortexAPI?.checkForUpdates) {
      const res = await window.vortexAPI.checkForUpdates();
      if (btn) btn.disabled = false;
      if (res && res.updateAvailable) {
        if (desc) desc.textContent = `Nova versão ${res.version} encontrada!`;
        if (badge) {
          badge.textContent = 'Nova Versão!';
          badge.style.background = 'rgba(34, 197, 94, 0.2)';
          badge.style.color = '#22c55e';
        }
      } else {
        if (desc) desc.textContent = 'O Vortex Browser está na versão mais recente.';
        if (badge) {
          badge.textContent = '✓ Atualizado';
          badge.style.background = 'rgba(34, 197, 94, 0.2)';
          badge.style.color = '#22c55e';
        }
      }
    } else {
      // Como roda em <webview> isolada, dispara evento para o processo pai checar
      window.parent.postMessage({ type: 'trigger-check-updates' }, '*');
      setTimeout(() => {
        if (btn && btn.disabled) btn.disabled = false;
      }, 5000);
    }
  } catch (err) {
    if (btn) btn.disabled = false;
    if (desc) desc.textContent = 'Não foi possível verificar no momento (offline ou servidor indisponível).';
  }
});




