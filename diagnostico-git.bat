@echo off
echo 🔍 DIAGNOSTICANDO PROBLEMA DE SINCRONIZACIÓN...

cd "d:\PROYECTOS\FINANZA BOTICA"

echo.
echo ============================================
echo ESTADO LOCAL DEL REPOSITORIO:
echo ============================================
git status

echo.
echo ============================================
echo ÚLTIMOS COMMITS LOCALES:
echo ============================================
git log --oneline -5

echo.
echo ============================================
echo RAMAS DISPONIBLES:
echo ============================================
git branch -a

echo.
echo ============================================
echo CONFIGURACIÓN REMOTA:
echo ============================================
git remote -v

echo.
echo ============================================
echo SINCRONIZANDO CON GITHUB...
echo ============================================
git fetch origin
git push origin main

echo.
echo ============================================
echo VERIFICACIÓN FINAL:
echo ============================================
git status

echo.
echo ✅ ¡Diagnóstico completado!
echo 🌐 Tu sitio debería actualizarse en 1-2 minutos
echo 📍 URL: https://maupanta.github.io/finanzas-personales/

pause
