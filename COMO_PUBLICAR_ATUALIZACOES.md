# 🚀 Como Publicar Atualizações Gratuitas no Vortex Browser (Via GitHub Releases)

O Vortex Browser agora conta com um **sistema de atualização automática idêntico ao Google Chrome** usando **GitHub Releases** (100% gratuito e oficial do ecossistema Electron).

---

## 🟢 Como funciona a experiência para o Usuário
1. **Verificação Automática em Segundo Plano**:
   - Assim que o Vortex abre, ele consulta em background se existe uma nova versão lançada no GitHub.
2. **Aviso no Canto do Navegador (Estilo Google Chrome)**:
   - Um botão de destaque verde pulsante **`● Atualizar`** surge no canto superior direito da janela (ao lado dos 3 pontinhos).
   - O menu de 3 pontinhos também exibe a opção destacada em verde: **`Reiniciar para atualizar`**.
   - Na página de **Configurações > Sobre o Vortex**, há o status da versão e o botão **"Verificar Atualizações"**.
3. **Instalação com 1 Clique**:
   - Ao clicar no botão, uma janela modal moderna se abre exibindo o número da versão.
   - O usuário clica em **"Baixar e Atualizar"**, a barra de progresso avança e, ao concluir, surge o botão **"Reiniciar Agora"**.
   - O app fecha, instala a nova versão e reabre automaticamente mantendo todas as abas e histórico.

---

## ⚙️ Passo a Passo para Configurar Seu Repositório

### 1. Criar o repositório no GitHub (caso ainda não tenha criado)
- Acesse [github.com/new](https://github.com/) e crie um repositório (público para downloads diretos gratuitos, por exemplo: `meu-usuario/vortex-browser`).

### 2. Ajustar o `package.json`
Abra o arquivo [`package.json`](file:///c:/Users/Suporte%20DHS/Desktop/meu%20navegador%20Vortex/package.json) e substitua `"seu-usuario"` e `"vortex-browser"` pelo seu nome de usuário e nome do repositório no GitHub:
```json
"publish": [
  {
    "provider": "github",
    "owner": "SEU_USUARIO_GITHUB",
    "repo": "NOME_DO_REPOSITORIO",
    "releaseType": "release"
  }
]
```

### 3. Como subir uma Nova Atualização (Gratuito):
Sempre que você quiser lançar uma atualização:
1. Execute no terminal:
   ```bash
   npm run dist
   ```
   *(A versão no `package.json` será incrementada automaticamente pelo `bump-version.js`).*
2. Vá até a pasta [`dist`](file:///c:/Users/Suporte%20DHS/Desktop/meu%20navegador%20Vortex/dist).
3. Vá no seu repositório no GitHub > **Releases** > **Draft a new release**.
4. Crie uma tag com a versão (ex: `v1.1.15`).
5. Arraste e solte na release os dois arquivos gerados na pasta `dist`:
   - `Vortex Browser Setup 1.1.15.exe` (ou o nome da versão)
   - `latest.yml` *(importante: o `latest.yml` é o arquivo que avisa os navegadores instalados que há uma versão nova e seu hash de segurança)*.
6. Clique em **Publish release**.

Pronto! Todos os usuários que estiverem com o Vortex aberto receberão o aviso **`● Atualizar`** na tela sem você gastar 1 centavo com servidor.
