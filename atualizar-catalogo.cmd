@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules" (
  echo Dependencias nao instaladas. Execute "npm install" antes de rodar este script.
  pause
  exit /b 1
)

echo Atualizando catalogo...
call npx tsx scripts\atualizar-catalogo-completo.ts

echo.
echo Verificando especificacao...
call npx tsx scripts\verificar-especificacao-completa.ts

echo.
echo Concluido.
pause
