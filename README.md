# ORBITAL — Solar System Simulator Website

A responsive, dark space-themed project website prototype for the existing C solar-system simulation.

## Run it

1. Extract the folder if downloaded as a ZIP.
2. Open `index.html` in a modern browser. For the best development workflow, use VS Code with the Live Server extension or run a simple local HTTP server.
3. The interactive browser preview works independently of the C source and includes pause/resume, reset, speed, zoom, orbit/label/trail toggles, draggable panning, planet selection, and planet information.

## Important: current integration status

The canvas simulation in `app.js` is a **temporary browser-side preview** so the complete website and its interactions can be reviewed now. It is not yet running `solar_system.c`. The site intentionally marks this in the interface.

The uploaded C program uses BGI-style `graphics.h` calls (`initgraph`, `getmaxx`, `fillellipse`, `outtextxy`, etc.) and already has an Emscripten conditional main loop. The next step is to identify the exact BGI implementation/build environment, then compile with a compatible SDL_bgi/Emscripten setup or adapt the rendering boundary. Once compiled, we can replace the preview canvas with the C/WebAssembly output and wire compatible controls to it.

## Project structure

- `index.html` — page structure and content sections
- `styles.css` — responsive styling and layout
- `app.js` — temporary interactive canvas preview and UI controls
- `README.md` — setup and integration notes

## Sections included

- Landing page / project introduction
- Interactive simulation dashboard
- Eight planet selector and detail cards
- Computer graphics concepts and equations
- Project architecture / integration roadmap

## Scientific note

This is an educational visualization. The preview uses schematic circular orbits and compressed scales, not a precision ephemeris. The current C source also uses circular orbits and fixed angular increments. Keep that distinction clear in a project presentation.
