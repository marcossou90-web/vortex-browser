# 🌪️ Vortex Browser

> **Navegador web moderno, ultrarrápido, minimalista e focado em privacidade & produtividade para desenvolvedores.**

---

## 🔍 1. Análise de Marca e Nome ("Vortex")

### O que encontramos no mercado

1. **iOS / App Store:** Há um app chamado *"Vortex Browser"* para iOS focado em navegação privada móvel.
2. **Android:** Há um app *"Vortex Web Browser"* focado em modo incógnito para Android.
3. **Gaming / Nexus Mods:** Existe o utilitário desktop *"Vortex Mod Manager"*, muito conhecido na comunidade gamer.
4. **Desktop Browser Independente:** Não há nenhum navegador desktop dominante ou monopolizado com essa marca (ao contrário de Chrome, Edge, Firefox, Brave, Safari, Opera).

💡 **Recomendação para seu projeto:**

* Você pode usar e desenvolver seu projeto livremente (código aberto / local).
* Se você for lançar publicamente comercialmente ou registrar marca no INPI (Brasil) ou USPTO (EUA) na classe de software (Classe 9/42), é recomendável um sufixo diferenciador único, como por exemplo:
  * **Vortex OS Browser**
  * **Vortex DevBrowser**
  * **Vortex Web / Vortex Engine**

---

## 🚀 2. Recursos Já Implementados do Vortex

* **Privacidade & Minimalismo por Padrão:**
  * **Bloqueio Nativo de Rastreadores (Privacy Shield):** Bloqueia ativamente domínios de telemetria e anúncios (Google Analytics, Tag Manager, DoubleClick, Criteo, Facebook Pixel, etc.).
  * **Headers Antirrastreio:** Envio automático de `DNT` (Do Not Track) e `Sec-GPC` (Global Privacy Control).
  * **DuckDuckGo Integrado:** Busca sem rastreamento de perfil como padrão ao digitar palavras na barra de pesquisa.
  * **Limpeza Rápida:** Botão para limpar cookies, cache e histórico em 1 clique.
* **Performance & Estética Tech / Dev:**
  * Janela sem moldura nativa com design escuro (*Dark Slate / Glassmorphism*).
  * **Sistema de Múltiplas Abas (`<webview>` isolado)** com suporte a fechar, alternar e abrir instantaneamente.
  * **Speed Dial Minimalista** com atalhos rápidos para GitHub, DuckDuckGo, Hacker News e MDN Web Docs.
  * **Inspecionar / DevTools Integrado:** Botão dedicado e atalhos para debugar qualquer página web.
  * **Menu Três Pontinhos (⋮) e Menu de Contexto Completo:** Acesso direto a todas as funções, controle de zoom, impressão, visualização de código-fonte e página de configurações.
  * **Atalhos de Produtividade:**
    * `Ctrl + T`: Nova aba
    * `Ctrl + Shift + T`: Reabrir última aba fechada (Restore Tab)
    * `Ctrl + Tab` / `Ctrl + Shift + Tab`: Alternar entre abas abertas
    * `Ctrl + W`: Fechar aba ativa
    * `Ctrl + L`: Focar na barra de endereço
    * `Ctrl + N`: Nova janela
    * `Ctrl + Shift + N`: Nova aba anônima/isolada
    * `Ctrl + P`: Imprimir página
    * `Ctrl + R` ou `F5`: Recarregar
    * `F12`: Abrir Ferramentas do Desenvolvedor (DevTools acoplado/destacado)
    * `Ctrl + F`: Localizar texto na página
    * `Ctrl + D`: Adicionar página aos favoritos
    * `Ctrl + H`: Histórico de navegação
    * `Ctrl + J`: Downloads

* **Otimizações & Proteção:**
  * **Cofre Seguro (safeStorage / DPAPI):** Criptografia nativa no nível de SO com fallback AES-256 e migração transparente.
  * **Sleeping Tabs (Economia de RAM):** Congelamento automático de abas em segundo plano após inatividade para manter o sistema leve.
  * **AdBlocker & Privacy Shield Expandido:** Bloqueio nativo de rastreadores, telemetria, pop-ups e ad-servers sem necessidade de extensões pesadas.

---

## 💻 3. Como Rodar o Vortex Browser

No terminal da pasta do projeto, basta executar:

```bash
npm start
```
