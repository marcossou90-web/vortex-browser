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

## ⚙️ Repositório Configurado no Vortex

O código e o instalador já foram configurados para o seu repositório:
- **Repositório oficial**: [https://github.com/marcossou90-web/vortex-browser](https://github.com/marcossou90-web/vortex-browser)
- **Configuração no `package.json`**:
```json
"publish": [
  {
    "provider": "github",
    "owner": "marcossou90-web",
    "repo": "vortex-browser",
    "releaseType": "release"
  }
]
```

---

## 🚀 Como subir a Primeira Versão e as Próximas Atualizações (Passo a Passo)

### 1. Criar a Release no GitHub
1. Abra no navegador: [https://github.com/marcossou90-web/vortex-browser/releases/new](https://github.com/marcossou90-web/vortex-browser/releases/new)
2. No campo **Choose a tag**, digite: `v1.1.15` (ou a versão atual) e clique em **Create new tag**.
3. No campo **Release title**, coloque: `Vortex Browser v1.1.15`.
4. Arraste e solte na caixa de arquivos da release os dois arquivos da sua pasta [`dist`](file:///c:/Users/Suporte%20DHS/Desktop/meu%20navegador%20Vortex/dist):
   - 📌 `Vortex Browser Setup 1.1.15.exe`
   - 📌 `latest.yml` *(Fundamental: é este arquivo que indica a nova versão e o hash para o instalador)*
5. Clique no botão verde **Publish release**.

---

## 🔄 Como Lançar Atualizações Futuras
Sempre que fizer alterações no código e quiser liberar uma atualização para os usuários:
1. No terminal execute:
   ```bash
   npm run dist
   ```
   *(A versão no `package.json` sobe automaticamente: `1.1.15` -> `1.1.16`)*.
2. Acesse [Releases do GitHub](https://github.com/marcossou90-web/vortex-browser/releases/new), crie a tag `v1.1.16` e anexe o novo `.exe` e o novo `latest.yml` gerados na pasta `dist/`.
3. Clique em **Publish release**.

Em instantes, todos os usuários com o Vortex aberto verão o aviso **`● Atualizar`** no canto superior direito e atualizarão o navegador com 1 clique!
