@echo off
title ZS Rudnik - Export na verejny web
cd /d "%~dp0server"

echo.
echo  Exportujem obsah do statickych suborov pre Vercel...
echo.
call npm run export
echo.
echo  Hotovo! Teraz nahrajte zmeny na GitHub (git push),
echo  aby sa zobrazili na skola-web-eta.vercel.app
echo.
pause
