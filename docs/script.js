/**
 * Vortex Browser - Interactive Site Script
 * Handles: Auto-fetching latest release, OS detection, interactive mockup, modal & animations.
 */

// Configuration
const CONFIG = {
  repoOwner: 'marcossou90-web',
  repoName: 'vortex-browser',
  fallbackVersion: '1.2.1',
  fallbackTag: 'v1.2.1',
  fallbackSize: '80.5 MB',
  fallbackExeName: 'Vortex Browser Setup 1.2.1.exe',
  fallbackUrl: 'https://github.com/marcossou90-web/vortex-browser/releases/latest'
};

// Current resolved release data
let currentRelease = {
  version: CONFIG.fallbackVersion,
  tag: CONFIG.fallbackTag,
  downloadUrl: `https://github.com/${CONFIG.repoOwner}/${CONFIG.repoName}/releases/download/${CONFIG.fallbackTag}/Vortex.Browser.Setup.${CONFIG.fallbackVersion}.exe`,
  fileSize: CONFIG.fallbackSize,
  fileName: CONFIG.fallbackExeName,
  releaseDate: 'Outubro de 2026'
};

document.addEventListener('DOMContentLoaded', () => {
  initReleaseSync();
  initOsDetection();
  initMockupTabs();
  initFeaturePills();
  initFaqAccordion();
  initDownloadModal();
  initFloatingQr();
  initHeaderScroll();
});

/**
 * 1. Sincroniza dinamicamente a versão mais recente
 * Consulta a API do GitHub Releases; caso não responda, consulta version.json local.
 */
async function initReleaseSync() {
  let releaseFound = false;

  // Tentativa 1: API oficial do GitHub Releases
  try {
    const ghApiUrl = `https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/releases/latest`;
    const response = await fetch(ghApiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.tag_name) {
        const tag = data.tag_name;
        const ver = tag.replace(/^v/, '');
        
        // Procura asset .exe
        let exeAsset = null;
        if (data.assets && data.assets.length > 0) {
          exeAsset = data.assets.find(a => a.name.endsWith('.exe')) || data.assets[0];
        }

        currentRelease.version = ver;
        currentRelease.tag = tag;
        if (exeAsset) {
          currentRelease.downloadUrl = exeAsset.browser_download_url;
          currentRelease.fileName = exeAsset.name;
          currentRelease.fileSize = formatBytes(exeAsset.size);
        } else {
          currentRelease.downloadUrl = data.html_url;
        }

        if (data.published_at) {
          currentRelease.releaseDate = new Date(data.published_at).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
        releaseFound = true;
      }
    }
  } catch (err) {
    console.warn('[Vortex Site] GitHub API inacessível, utilizando version.json:', err);
  }

  // Tentativa 2: fallback para version.json local mantido no repositório
  if (!releaseFound) {
    try {
      const localRes = await fetch('./version.json');
      if (localRes.ok) {
        const vData = await localRes.json();
        currentRelease.version = vData.version || CONFIG.fallbackVersion;
        currentRelease.tag = vData.tag || `v${currentRelease.version}`;
        currentRelease.downloadUrl = vData.downloadUrl || currentRelease.downloadUrl;
        currentRelease.fileName = vData.fileName || currentRelease.fileName;
        currentRelease.fileSize = vData.fileSize || currentRelease.fileSize;
        if (vData.releaseDate) {
          currentRelease.releaseDate = new Date(vData.releaseDate).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }
    } catch (e) {
      console.warn('[Vortex Site] Usando defaults estáticos:', e);
    }
  }

  // Atualiza todos os elementos visuais na página
  applyReleaseToUI();
}

function applyReleaseToUI() {
  // Versão em texto
  document.querySelectorAll('.vortex-version-text').forEach(el => {
    el.textContent = `v${currentRelease.version}`;
  });

  // Tamanho do arquivo
  document.querySelectorAll('.vortex-size-text').forEach(el => {
    el.textContent = currentRelease.fileSize;
  });

  // Nome do instalador
  document.querySelectorAll('.vortex-filename-text').forEach(el => {
    el.textContent = currentRelease.fileName;
  });

  // Atualiza href de todos os botões de download
  document.querySelectorAll('.btn-download-trigger').forEach(btn => {
    btn.setAttribute('href', currentRelease.downloadUrl);
  });
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '80.5 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

/**
 * 2. Detecção automática de Sistema Operacional (Windows, Mac, Linux)
 */
function initOsDetection() {
  const osTextEl = document.getElementById('osTargetText');
  if (!osTextEl) return;

  const ua = navigator.userAgent || '';
  let osName = 'Windows 11/10 64-bit';

  if (/Macintosh|Mac OS X/i.test(ua)) {
    osName = 'macOS (Intel & Apple Silicon)';
  } else if (/Linux/i.test(ua)) {
    osName = 'Linux 64-bit';
  } else if (/Win64|x64|WOW64/i.test(ua)) {
    osName = 'Windows 11/10 64-bit';
  } else if (/Windows/i.test(ua)) {
    osName = 'Windows 32-bit';
  }

  osTextEl.textContent = osName;
}

/**
 * 3. Mockup Interativo do Navegador Vortex (Alternar abas ao vivo)
 */
function initMockupTabs() {
  const tabs = document.querySelectorAll('.mockup-tab');
  const pages = document.querySelectorAll('.mockup-page');
  const omnibarUrl = document.getElementById('mockupOmnibarUrl');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.target;
      const targetUrl = tab.dataset.url || 'vortex://speed';

      tabs.forEach(t => t.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPage = document.getElementById(targetId);
      if (targetPage) {
        targetPage.classList.add('active');
      }

      if (omnibarUrl) {
        omnibarUrl.innerHTML = targetUrl;
      }
    });
  });
}

/**
 * 4. Pílulas de Filtro de Recursos (Chrome Sub-navigation)
 */
function initFeaturePills() {
  const pills = document.querySelectorAll('.feature-pill-btn');
  const cards = document.querySelectorAll('.feature-showcase-card');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const filter = pill.dataset.filter;

      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'grid';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/**
 * 5. Accordion de Dúvidas Frequentes (FAQ)
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/**
 * 6. Modal de Download Iniciado (Feedback imediato e guia em 3 passos)
 */
function initDownloadModal() {
  const modalBackdrop = document.getElementById('downloadModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const downloadBtns = document.querySelectorAll('.btn-download-trigger');

  if (!modalBackdrop) return;

  downloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // Dispara o download real do instalador
      if (currentRelease.downloadUrl && currentRelease.downloadUrl !== '#') {
        const tempLink = document.createElement('a');
        tempLink.href = currentRelease.downloadUrl;
        tempLink.setAttribute('download', currentRelease.fileName);
        tempLink.target = '_blank';
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();
      }

      // Abre a janela modal com o guia de 3 passos estilo Chrome
      modalBackdrop.classList.add('open');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('open');
    });
  }

  const understoodBtn = document.getElementById('modalUnderstoodBtn');
  if (understoodBtn) {
    understoodBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('open');
    });
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      modalBackdrop.classList.remove('open');
    }
  });
}

/**
 * 7. QR Code Flutuante
 */
function initFloatingQr() {
  const qrBadge = document.getElementById('floatingQrBadge');
  const qrClose = document.getElementById('qrCloseBtn');

  if (qrClose && qrBadge) {
    qrClose.addEventListener('click', (e) => {
      e.stopPropagation();
      qrBadge.style.opacity = '0';
      setTimeout(() => qrBadge.remove(), 250);
    });
  }
}

/**
 * 8. Header scroll shadow
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });
}
