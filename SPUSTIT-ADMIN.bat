@echo off
title ZS Rudnik - Sprava webu
cd /d "%~dp0server"

echo.
echo  ============================================
echo   ZS Rudnik - spustenie admin panelu
echo  ============================================
echo.
echo  Po spusteni otvorte v prehliadaci:
echo    http://localhost:3000/admin
echo.
echo  Heslo: rschool2026
echo  (zmente ho v subore server\.env)
echo.
echo  Nechajte toto okno otvorene pocas uprav!
echo  ============================================
echo.

start "" "http://localhost:3000/admin"
npm start
