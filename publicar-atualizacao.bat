@echo off
chcp 65001 >nul
title Publicar Atualizacao do Vortex Browser
color 0b

node publish-release.js

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Ocorreu uma falha durante o processo.
    pause
    exit /b %errorlevel%
)

echo.
pause
