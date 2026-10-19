@echo off
chcp 65001 >nul
title Publicar Atualizacao do Vortex Browser
color 0b

echo ========================================================
echo       🚀 PUBLICADOR AUTOMÁTICO DE ATUALIZAÇÕES DO VORTEX
echo ========================================================
echo.
echo Repositório: https://github.com/marcossou90-web/vortex-browser
echo.

:: Carrega token com segurança a partir do arquivo .env local (protegido pelo .gitignore)
if exist ".env" (
    for /f "usebackq tokens=1,2 delims==" %%A in (".env") do (
        if "%%A"=="GH_TOKEN" set "GH_TOKEN=%%B"
    )
)

echo [1/3] Enviando código-fonte para o GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao enviar para o Git.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Compilando instalador e publicando versao no GitHub Releases...
npm run release

echo.
echo ========================================================
echo [3/3] SUCESSO! A atualizacao foi publicada no GitHub!
echo       Todos os usuarios do Vortex serao notificados.
echo ========================================================
echo.
pause
