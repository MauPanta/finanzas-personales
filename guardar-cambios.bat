@echo off
echo 🚀 Guardando cambios en GitHub...

cd "d:\PROYECTOS\FINANZA BOTICA"

echo 📝 Agregando archivos...
git add .

echo 💾 Haciendo commit...
git commit -m "Actualización %date% %time%"

echo 🌐 Subiendo a GitHub...
git push origin main

echo ✅ ¡Cambios guardados en GitHub Pages!
echo 🌍 Tu sitio se actualizará en: https://maupanta.github.io/finanzas-personales/

pause
