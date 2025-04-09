@echo off
echo Creating backup of Stockfish implementation...
if not exist .stockfish_backup mkdir .stockfish_backup
copy /Y src\utils\stockfish.min.js .stockfish_backup\stockfish.min.js

echo Running build process...
npm run build

echo Ensuring Stockfish is preserved in build...
if not exist build\stockfish mkdir build\stockfish
copy /Y .stockfish_backup\stockfish.min.js build\stockfish\stockfish.min.js

echo Build complete with Stockfish engine preserved
