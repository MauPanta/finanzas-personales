@echo off
echo 🚀 Subiendo aplicación a GitHub...

rem Inicializar repositorio Git
git init

rem Agregar archivos
git add index.html script.js script-simple.js styles.css README-github.md .gitignore

rem Renombrar README
git mv README-github.md README.md

rem Hacer commit
git commit -m "Aplicación de finanzas personales completa"

rem Configurar rama principal
git branch -M main

rem Conectar con repositorio remoto
git remote add origin https://github.com/maupanta/finanzas-personales.git

rem Subir archivos
git push -u origin main

echo ✅ Archivos preparados para subir a GitHub
echo 📝 Recuerda cambiar la URL del repositorio en este script
echo 🌐 Después activa GitHub Pages en Settings > Pages
pause
