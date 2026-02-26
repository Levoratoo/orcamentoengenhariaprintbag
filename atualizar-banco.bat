@echo off
echo ========================================
echo  ATUALIZACAO DOS CAMPOS DE ENTREGAS
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando dependencias...
call npm --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: NPM nao encontrado!
    pause
    exit /b 1
)

echo.
echo Executando atualizacao do banco de dados...
echo.

call npx tsx scripts\update-entregas-fields.ts

if errorlevel 1 (
    echo.
    echo ERRO ao executar o script!
    echo Tentando alternativa com .mjs...
    echo.
    call node scripts\update-entregas-fields.mjs
)

echo.
echo ========================================
echo Pressione qualquer tecla para fechar...
pause >nul
