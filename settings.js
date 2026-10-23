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

  // Preferências de Cookies & Consentimento
  if (document.getElementById('cookiePolicySelect')) document.getElementById('cookiePolicySelect').value = s.cookiePolicy || 'block_third_party';
  if (document.getElementById('autoAcceptBannersToggle')) document.getElementById('autoAcceptBannersToggle').checked = s.autoAcceptBanners !== false;
  if (document.getElementById('clearCookiesOnExitToggle')) document.getElementById('clearCookiesOnExitToggle').checked = !!s.clearCookiesOnExit;
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
    cookiePolicy: document.getElementById('cookiePolicySelect')?.value || 'block_third_party',
    autoAcceptBanners: document.getElementById('autoAcceptBannersToggle')?.checked !== false,
    clearCookiesOnExit: !!document.getElementById('clearCookiesOnExitToggle')?.checked,
  };
  localStorage.setItem('vortex-settings', JSON.stringify(s));

  // Sincroniza política de cookies com o processo principal via IPC
  const api = window.vortexAPI || window.parent?.vortexAPI;
  if (api && api.setCookieSettings) {
    api.setCookieSettings({
      policy: s.cookiePolicy,
      autoAcceptBanners: s.autoAcceptBanners,
      clearOnExit: s.clearCookiesOnExit
    });
  }

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
  if (section === 'cookies') {
    loadStoredCookies();
  }
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

// Botão Salvar Página Inicial com feedback visual
document.getElementById('btnSaveHomePage')?.addEventListener('click', () => {
  saveSettings();
  const btn = document.getElementById('btnSaveHomePage');
  if (btn) {
    const oldText = btn.innerHTML;
    btn.innerHTML = '<span>✓</span> Salvo!';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.background = '';
    }, 1500);
  }
});

// Botão Usar Página Atual
document.getElementById('btnUseCurrentPage')?.addEventListener('click', () => {
  try {
    window.parent.postMessage({ type: 'get-current-page-url-request' }, '*');
  } catch(e) {}
});

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'current-page-url-response') {
    const input = document.getElementById('homePageInput');
    if (input && e.data.url) {
      input.value = e.data.url;
      saveSettings();
      const btn = document.getElementById('btnSaveHomePage');
      if (btn) {
        btn.innerHTML = '<span>✓</span> Salvo!';
        setTimeout(() => { btn.innerHTML = '<span>💾</span> Salvar'; }, 1500);
      }
    }
  }
});

// Botão limpar dados (abre o modal estilo Chrome ou envia solicitação)
document.getElementById('btnClearNow')?.addEventListener('click', () => {
  try {
    window.parent.postMessage({ type: 'open-chrome-clear-modal' }, '*');
  } catch (e) {
    window.parent.postMessage({ type: 'clear-browsing-data-request' }, '*');
  }
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
      if (desc) desc.textContent = `Nova versão ${res.version} pronta para atualização!`;
      if (badge) {
        badge.textContent = `v${res.version} Disponível!`;
        badge.style.background = 'rgba(34, 197, 94, 0.2)';
        badge.style.color = '#22c55e';
      }
      if (btn) {
        btn.textContent = `Baixar Atualização`;
        btn.onclick = () => {
          btn.disabled = true;
          if (desc) desc.textContent = 'Iniciando download da atualização...';
          window.parent.postMessage({ type: 'trigger-download-update' }, '*');
        };
      }
    } else if (res && res.success === false) {
      if (desc) desc.textContent = `Falha ao checar: ${res.error || 'Erro de conexão'}`;
      if (badge) {
        badge.textContent = 'Falha';
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.color = '#ef4444';
      }
    } else {
      if (desc) desc.textContent = 'O Vortex Browser está na versão mais recente.';
      if (badge) {
        badge.textContent = '✓ Atualizado';
        badge.style.background = 'rgba(34, 197, 94, 0.2)';
        badge.style.color = '#22c55e';
      }
      if (btn) btn.textContent = 'Verificar Atualizações';
    }
  } else if (event.data.type === 'update-download-progress') {
    const pct = event.data.progress?.percent || 0;
    const desc = document.getElementById('aboutUpdateStatusDesc');
    const badge = document.getElementById('badgeUpdateStatus');
    const btn = document.getElementById('btnCheckUpdateSettings');
    if (desc) desc.textContent = `Baixando atualização... ${pct}%`;
    if (badge) {
      badge.textContent = `Baixando ${pct}%`;
      badge.style.background = 'rgba(56, 189, 248, 0.2)';
      badge.style.color = '#38bdf8';
    }
    if (btn) btn.disabled = true;
  } else if (event.data.type === 'update-downloaded') {
    const desc = document.getElementById('aboutUpdateStatusDesc');
    const badge = document.getElementById('badgeUpdateStatus');
    const btn = document.getElementById('btnCheckUpdateSettings');
    if (desc) desc.textContent = 'Atualização baixada! Clique para reiniciar e aplicar a nova versão.';
    if (badge) {
      badge.textContent = '✓ Pronto';
      badge.style.background = 'rgba(34, 197, 94, 0.2)';
      badge.style.color = '#22c55e';
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Reiniciar Agora';
      btn.onclick = () => {
        window.parent.postMessage({ type: 'trigger-install-update' }, '*');
      };
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
        if (desc) desc.textContent = `Nova versão ${res.version} pronta para atualização!`;
        if (badge) {
          badge.textContent = `v${res.version} Disponível!`;
          badge.style.background = 'rgba(34, 197, 94, 0.2)';
          badge.style.color = '#22c55e';
        }
        if (btn) {
          btn.textContent = 'Baixar Atualização';
          btn.onclick = () => {
            btn.disabled = true;
            if (desc) desc.textContent = 'Iniciando download...';
            window.vortexAPI.downloadUpdate?.();
          };
        }
      } else if (res && res.success === false) {
        if (desc) desc.textContent = `Falha ao checar: ${res.error || 'Erro de conexão'}`;
        if (badge) {
          badge.textContent = 'Falha';
          badge.style.background = 'rgba(239, 68, 68, 0.2)';
          badge.style.color = '#ef4444';
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
      // Dispara evento para a janela principal checar via IPC
      window.parent.postMessage({ type: 'trigger-check-updates' }, '*');
      setTimeout(() => {
        if (btn && btn.disabled) btn.disabled = false;
      }, 7000);
    }
  } catch (err) {
    if (btn) btn.disabled = false;
    if (desc) desc.textContent = 'Não foi possível verificar no momento (offline ou servidor indisponível).';
  }
});

// ── Utilitário de Escape HTML ─────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Módulo de Gerenciamento de Cookies no Settings ───────
let storedCookiesList = [];

async function loadStoredCookies() {
  const container = document.getElementById('cookiesListContainer');
  const countBadge = document.getElementById('cookiesCountBadge');
  if (!container) return;
  
  const api = window.vortexAPI || window.parent?.vortexAPI;
  if (!api || !api.getCookies) {
    container.innerHTML = '<div class="cookies-empty-state">Gerenciamento de cookies ativo via sessão segura do Vortex Browser.</div>';
    return;
  }

  container.innerHTML = '<div class="cookies-empty-state">Carregando cookies da sessão atual...</div>';
  try {
    const res = await api.getCookies({});
    if (res && res.success && Array.isArray(res.cookies)) {
      storedCookiesList = res.cookies;
      renderCookiesList();
    } else {
      container.innerHTML = '<div class="cookies-empty-state">Nenhum cookie armazenado no momento.</div>';
      if (countBadge) countBadge.textContent = '0';
    }
  } catch (err) {
    container.innerHTML = `<div class="cookies-empty-state">Erro ao carregar cookies: ${escapeHtml(err.message)}</div>`;
  }
}

function renderCookiesList(filterText = '') {
  const container = document.getElementById('cookiesListContainer');
  const countBadge = document.getElementById('cookiesCountBadge');
  if (!container) return;

  const filter = (filterText || document.getElementById('cookiesSearchInput')?.value || '').toLowerCase().trim();

  // Agrupa cookies por domínio
  const groups = {};
  for (const c of storedCookiesList) {
    const domain = (c.domain || 'desconhecido').startsWith('.') ? c.domain.substring(1) : (c.domain || 'desconhecido');
    if (filter && !domain.toLowerCase().includes(filter) && !c.name.toLowerCase().includes(filter)) {
      continue;
    }
    if (!groups[domain]) groups[domain] = [];
    groups[domain].push(c);
  }

  const domains = Object.keys(groups).sort();
  if (countBadge) countBadge.textContent = storedCookiesList.length;

  if (domains.length === 0) {
    container.innerHTML = filter 
      ? '<div class="cookies-empty-state">Nenhum cookie corresponde à sua pesquisa.</div>'
      : '<div class="cookies-empty-state">Nenhum cookie salvo no armazenamento do navegador.</div>';
    return;
  }

  container.innerHTML = domains.map(domain => {
    const cookies = groups[domain];
    const safeDomainId = domain.replace(/[^a-zA-Z0-9]/g, '_');
    return `
      <div class="cookie-domain-card" data-domain="${escapeHtml(domain)}">
        <div class="cookie-domain-header">
          <div class="cookie-domain-info">
            <span class="cookie-domain-icon">🌐</span>
            <div class="cookie-domain-title">${escapeHtml(domain)}</div>
            <span class="cookie-domain-count">${cookies.length} cookie${cookies.length > 1 ? 's' : ''}</span>
          </div>
          <div class="cookie-domain-actions">
            <button type="button" class="btn-cookie-toggle" onclick="toggleDomainCookies('${safeDomainId}')" title="Ver detalhes dos cookies">Detalhes ▼</button>
            <button type="button" class="btn-cookie-del-domain" onclick="deleteDomainCookies('${escapeHtml(domain)}')" title="Excluir todos os cookies deste site">🗑️ Excluir</button>
          </div>
        </div>
        <div class="cookie-items-list hidden" id="domain-cookies-${safeDomainId}">
          ${cookies.map(c => `
            <div class="cookie-item-row">
              <div class="cookie-item-details">
                <div class="cookie-item-name">
                  <strong>${escapeHtml(c.name)}</strong>
                  ${c.secure ? '<span class="cookie-secure-tag">🔒 Seguro</span>' : ''}
                  ${c.httpOnly ? '<span class="cookie-httponly-tag">HttpOnly</span>' : ''}
                </div>
                <div class="cookie-item-val" title="${escapeHtml(c.value || '')}">Valor: ${escapeHtml(c.value ? (c.value.length > 60 ? c.value.substring(0, 60) + '...' : c.value) : '(vazio)')}</div>
                <div class="cookie-item-meta">Caminho: ${escapeHtml(c.path || '/')} • Expiração: ${c.expirationDate ? new Date(c.expirationDate * 1000).toLocaleDateString('pt-BR') : 'Sessão'}</div>
              </div>
              <button type="button" class="btn-cookie-del-single" onclick="deleteSingleCookie('${c.secure ? 'https' : 'http'}://${domain}${c.path || '/'}', '${escapeHtml(c.name)}', '${escapeHtml(domain)}')" title="Remover este cookie">✕</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

window.toggleDomainCookies = function(safeDomainId) {
  const el = document.getElementById('domain-cookies-' + safeDomainId);
  if (el) {
    el.classList.toggle('hidden');
  }
};

window.deleteDomainCookies = async function(domain) {
  if (!confirm(`Deseja remover todos os cookies salvos de "${domain}"?`)) return;
  const api = window.vortexAPI || window.parent?.vortexAPI;
  if (api && api.clearCookiesDomain) {
    await api.clearCookiesDomain(domain);
    await loadStoredCookies();
  }
};

window.deleteSingleCookie = async function(url, name, domain) {
  const api = window.vortexAPI || window.parent?.vortexAPI;
  if (api && api.deleteCookie) {
    await api.deleteCookie({ url, name });
    await loadStoredCookies();
  }
};

// Listener de busca de cookies
document.getElementById('cookiesSearchInput')?.addEventListener('input', (e) => {
  renderCookiesList(e.target.value);
});

// Botão excluir todos os cookies
document.getElementById('btnClearAllCookiesBtn')?.addEventListener('click', async () => {
  if (!confirm('Atenção: Isso excluirá TODOS os cookies e sessões ativas de sites. Deseja continuar?')) return;
  const api = window.vortexAPI || window.parent?.vortexAPI;
  if (api && api.clearAllCookies) {
    await api.clearAllCookies();
    await loadStoredCookies();
    alert('Todos os cookies foram removidos com sucesso!');
  }
});




