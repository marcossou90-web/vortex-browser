@echo off
chcp 65001 >nul
title Publicar Atualização do Vortex Browser
color 0b

echo ========================================================
echo       🚀 PUBLICADOR AUTOMÁTICO DE ATUALIZAÇÕES DO VORTEX
echo ========================================================
echo.
echo Repositório: https://github.com/marcossou90-web/vortex-browser
echo.

if "%GH_TOKEN%"=="" (
    echo [!] Para publicar automaticamente no GitHub sem precisar arrastar arquivos,
    echo     o electron-builder precisa de um Personal Access Token (GH_TOKEN).
    echo.
    echo 1. Gere seu token gratuito em: https://github.com/settings/tokens (classic)
    echo    Marque apenas a permissão: 'repo'
    echo.
    set /p USER_TOKEN="Cole seu Personal Access Token aqui (ou aperte ENTER para modo manual): "
    if not "%USER_TOKEN%"=="" (
        set "GH_TOKEN=%USER_TOKEN%"
        echo [OK] Token configurado para esta sessão!
    )
)

echo.
echo [1/3] Enviando código fonte para o GitHub...
git push -u origin main

if not "%GH_TOKEN%"=="" (
    echo.
    echo [2/3] Compilando e publicando release automaticamente no GitHub...
    npm run release
    echo.
    echo [3/3] Sucesso! Nova versão publicada no GitHub Releases!
) else (
    echo.
    echo [2/3] Compilando instalador local...
    npm run dist
    echo.
    echo [3/3] Concluído! Os arquivos .exe e latest.yml estão na pasta 'dist'.
    echo       Abra https://github.com/marcossou90-web/vortex-browser/releases/new e anexe-os!
)

echo.
echo ========================================================
pause
