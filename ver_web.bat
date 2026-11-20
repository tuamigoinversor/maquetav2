@echo off
rem Abre la web en el navegador tal como se vera publicada.
rem Haz doble clic en este fichero. Para parar, cierra esta ventana.
cd /d "%~dp0"
start "" http://localhost:8000/
python -m http.server 8000
