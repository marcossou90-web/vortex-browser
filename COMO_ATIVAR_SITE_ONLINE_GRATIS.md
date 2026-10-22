# 🌐 Como Ativar o Site Oficial do Vortex Browser 24h Online e 100% Grátis

O site de download oficial do seu navegador foi construído com visual idêntico ao do **Google Chrome**, com design moderno, abas interativas, detecção de sistema operacional, código QR para celular e **atualização automática do link de download toda vez que você publicar uma nova versão**.

Como os arquivos foram colocados na pasta [`docs/`](./docs) do seu repositório no GitHub, você pode colocá-lo no ar **24 horas por dia, 7 dias por semana, gratuitamente para sempre**, sem precisar pagar hospedagem ou servidor.

---

## ⚡ Passo a Passo: Ativar em 1 minuto no GitHub Pages (100% Gratuito)

1. Acesse o seu repositório no GitHub:
   👉 **[https://github.com/marcossou90-web/vortex-browser](https://github.com/marcossou90-web/vortex-browser)**

2. No topo, clique na aba **Settings** (Configurações).

3. No menu lateral esquerdo, procure e clique em **Pages** (ou acesse direto: `https://github.com/marcossou90-web/vortex-browser/settings/pages`).

4. Na seção **Build and deployment**:
   - **Source**: Selecione `Deploy from a branch`
   - **Branch**: Selecione `main` e no campo ao lado escolha a pasta `/docs` (em vez de `/root`)
   - Clique no botão **Save** (Salvar).

5. **Pronto! 🎉**
   Em cerca de 30 a 60 segundos, seu site estará no ar no endereço oficial:
   👉 **`https://marcossou90-web.github.io/vortex-browser/`**

> 💡 **Nota sobre Repositório Privado vs Público**:
> Para que qualquer usuário no mundo possa acessar a página e baixar o `.exe` sem login, basta que nas configurações do repositório (**Settings > General > Danger Zone**) a visibilidade esteja como **Public**.

---

## 🔄 Como Funciona a Atualização Automática no Site

Você não precisa mexer em código nenhum quando lançar uma versão nova!

Sempre que você quiser liberar uma nova versão para os usuários:

1. Dê dois cliques no arquivo **[`publicar-atualizacao.bat`](./publicar-atualizacao.bat)** (ou execute `npm run release` no terminal).
2. O script automaticamente:
   - Sobe a versão (ex: `1.2.1` -> `1.2.2`);
   - Compila o novo instalador `.exe`;
   - Publica a release no GitHub;
   - Atualiza o arquivo [`docs/version.json`](./docs/version.json) com a nova tag, tamanho do arquivo e data;
   - Faz o commit e sincroniza com o GitHub Pages.
3. Em segundos, quem entrar no site verá o novo número da versão e o link de download baixará o `.exe` da versão mais recente automaticamente!

---

## 🎨 Recursos Incluídos no Site


- **Estética Google Chrome**:
  - Banner superior com anúncio das novidades de IA;
  - Barra de navegação com logotipo Vortex e botão azul de download;
  - Seção Hero: *"O navegador criado para ser seu"* com botão pill de download e detecção automática do Windows;
  - Modal com guia em 3 passos ensinando o usuário a instalar o programa;
  - Widget flutuante de QR Code para escanear com o celular;
  - Mockup interativo da janela do navegador com alternância entre telas (Velocidade & RAM, Vortex IA e Privacy Shield);
  - Comparativo direto (Vortex vs Chrome vs Edge);
  - Perguntas frequentes (FAQ) interativo;
  - Rodapé completo com colunas de links institucionais e direitos autorais.
