function setCSimulationSpeed(speed) {
    const iframe = document.querySelector('.canvas-wrap iframe');

    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
            { type: 'setSimulationSpeed', speed: Number(speed) },
            '*'
        );
    }
}
const planets = [
    { name: 'Mercury', kind: 'TERRESTRIAL PLANET', color: '#aaa9a2', radius: 4, orbit: 42, speed: 4.15, period: '88', distance: '57.9', moons: '0', description: 'The smallest planet, racing around the Sun faster than any other world.', facts: 'A small, rocky world with extreme temperature changes.' },
    { name: 'Venus', kind: 'TERRESTRIAL PLANET', color: '#e6a28a', radius: 6, orbit: 67, speed: 1.62, period: '224.7', distance: '108.2', moons: '0', description: 'A brilliant, cloud-covered world with a dense atmosphere and intense heat.', facts: 'Its thick carbon-dioxide atmosphere traps heat exceptionally well.' },
    { name: 'Earth', kind: 'TERRESTRIAL PLANET', color: '#4d9be8', radius: 7, orbit: 92, speed: 1, period: '365.25', distance: '149.6', moons: '1', description: 'Our pale blue home, with liquid water on the surface and one natural satellite.', facts: 'The only world currently known to support life.' },
    { name: 'Mars', kind: 'TERRESTRIAL PLANET', color: '#dc684f', radius: 5, orbit: 118, speed: .53, period: '687', distance: '227.9', moons: '2', description: 'The red planet, home to giant volcanoes, ancient valleys, and polar ice.', facts: 'A major target for robotic exploration and future human missions.' },
    { name: 'Jupiter', kind: 'GAS GIANT', color: '#c89b72', radius: 12, orbit: 151, speed: .084, period: '4,333', distance: '778.6', moons: '95+', description: 'The largest planet, with banded clouds and a long-lived giant storm.', facts: 'Its immense gravity strongly influences the outer solar system.' },
    { name: 'Saturn', kind: 'GAS GIANT', color: '#d7c18e', radius: 10, orbit: 184, speed: .034, period: '10,759', distance: '1,433.5', moons: '146+', description: 'A gas giant surrounded by a spectacular system of icy rings.', facts: 'Its rings are broad but remarkably thin compared with their diameter.' },
    { name: 'Uranus', kind: 'ICE GIANT', color: '#80d9df', radius: 8, orbit: 215, speed: .012, period: '30,687', distance: '2,872.5', moons: '28', description: 'A pale blue ice giant that rotates on its side relative to its orbit.', facts: 'Its unusual axial tilt produces extreme seasonal patterns.' },
    { name: 'Neptune', kind: 'ICE GIANT', color: '#537ce6', radius: 8, orbit: 245, speed: .006, period: '60,190', distance: '4,495.1', moons: '16', description: 'A distant blue world with powerful winds and a dynamic atmosphere.', facts: 'It was identified using mathematical predictions before visual confirmation.' }
];
function getCFrame() {
    return document.querySelector('.canvas-wrap iframe');
}

function sendToCSimulation(type, value) {
    const frame = getCFrame();

    if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage(
            { type, value },
            '*'
        );
    }
}
const canvas = null;
const ctx = null;
let running = true, speed = 1, zoom = 1, elapsed = 0, selected = 2, showOrbits = true, showLabels = true, showTrails = false, last = 0, frame = 0, panX = 0, panY = 0, drag = null;
const angles = planets.map((_, i) => i * 0.7 + 0.35), trails = planets.map(() => []);
function resizeCanvas() { const r = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr)); ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
function draw() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; ctx.clearRect(0, 0, w, h); const cx = w * .5 + panX, cy = h * .52 + panY; const scale = Math.min(w / 590, h / 430) * zoom; ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
    // subtle background stars
    for (let i = 0; i < 90; i++) { const x = ((i * 137.51) % 590) - 295, y = ((i * 79.37) % 430) - 215; ctx.fillStyle = `rgba(183,207,255,${.12 + (i % 5) * .045})`; ctx.fillRect(x, y, (i % 9 === 0) ? 1.5 : 1, (i % 9 === 0) ? 1.5 : 1) }
    if (showOrbits) { planets.forEach((p, i) => { ctx.beginPath(); ctx.ellipse(0, 0, p.orbit, p.orbit * .67, 0, 0, Math.PI * 2); ctx.strokeStyle = i === selected ? 'rgba(143,190,255,.48)' : 'rgba(118,150,204,.2)'; ctx.lineWidth = i === selected ? 1.2 : .65; ctx.stroke() }) }
    if (showTrails) { trails.forEach((arr, i) => { if (arr.length < 2) return; ctx.beginPath(); arr.forEach((p, j) => j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.strokeStyle = planets[i].color + '88'; ctx.lineWidth = 1; ctx.stroke() }) }
    // sun glow
    let g = ctx.createRadialGradient(0, 0, 4, 0, 0, 37); g.addColorStop(0, 'rgba(255,235,156,.5)'); g.addColorStop(.35, 'rgba(255,160,70,.15)'); g.addColorStop(1, 'rgba(255,125,45,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 37, 0, Math.PI * 2); ctx.fill(); const sun = ctx.createRadialGradient(-5, -6, 1, 0, 0, 13); sun.addColorStop(0, '#fff9cf'); sun.addColorStop(.45, '#ffc05f'); sun.addColorStop(1, '#f06a35'); ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#ffb36c'; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
    planets.forEach((p, i) => {
        const a = angles[i]; const x = Math.cos(a) * p.orbit, y = Math.sin(a) * p.orbit * .67; if (showTrails) { trails[i].push({ x, y }); if (trails[i].length > 90) trails[i].shift() } if (i === selected) { ctx.beginPath(); ctx.arc(x, y, p.radius + 7, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(154,196,255,.65)'; ctx.lineWidth = 1; ctx.stroke() }
        const grad = ctx.createRadialGradient(x - p.radius * .35, y - p.radius * .4, 1, x, y, p.radius * 1.4); grad.addColorStop(0, lighten(p.color)); grad.addColorStop(.55, p.color); grad.addColorStop(1, '#11182a'); ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, p.radius, 0, Math.PI * 2); ctx.fill(); if (p.name === 'Saturn') { ctx.save(); ctx.translate(x, y); ctx.rotate(-.25); ctx.beginPath(); ctx.ellipse(0, 0, p.radius * 1.8, p.radius * .62, 0, 0, Math.PI * 2); ctx.strokeStyle = '#d9c99b'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore() } ctx.save(); ctx.translate(x, y); ctx.rotate(a * 2.5); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(p.radius * .65, 0, Math.max(1, p.radius * .16), 0, Math.PI * 2); ctx.fill(); ctx.restore(); if (showLabels) { ctx.font = '9px "DM Mono",monospace'; ctx.textAlign = x > 0 ? 'left' : 'right'; ctx.fillStyle = i === selected ? '#dbe9ff' : '#94a6c6'; ctx.fillText(p.name, x + (x > 0 ? p.radius + 6 : -p.radius - 6), y - 5) }
    });
    ctx.restore();
}
function lighten(hex) { let n = parseInt(hex.slice(1), 16), r = Math.min(255, ((n >> 16) & 255) + 55), g = Math.min(255, ((n >> 8) & 255) + 55), b = Math.min(255, (n & 255) + 55); return `rgb(${r},${g},${b})` }
function loop(t) { if (!last) last = t; const dt = Math.min((t - last) / 16.667, 3); last = t; if (running) { elapsed += dt * speed; planets.forEach((p, i) => angles[i] += (p.speed * .012) * dt * speed); if (frame++ % 5 === 0) document.getElementById('timeReadout').textContent = 'T + ' + String(Math.floor(elapsed * 1.6)).padStart(3, '0') + ' days' } draw(); requestAnimationFrame(loop) }
function choosePlanet(i) { selected = i; const p = planets[i]; document.getElementById('planetName').textContent = p.name; document.getElementById('planetType').textContent = p.kind; document.getElementById('planetDescription').textContent = p.description; document.getElementById('planetPeriod').innerHTML = `${p.period} <small>days</small>`; document.getElementById('planetDistance').innerHTML = `${p.distance} <small>million km</small>`; document.getElementById('planetMoons').textContent = p.moons; document.getElementById('planetGlyph').style.background = `radial-gradient(circle at 30% 28%, ${lighten(p.color)}, ${p.color} 50%, #101827 100%)`; document.getElementById('selectedCanvasLabel').textContent = 'SELECTED: ' + p.name.toUpperCase(); document.querySelectorAll('.planet-chip').forEach((el, j) => el.classList.toggle('active', j === i)); document.querySelectorAll('.planet-card').forEach((el, j) => el.classList.toggle('chosen', j === i)) }
function makePlanetPicker() { const picker = document.getElementById('planetPicker'); planets.forEach((p, i) => { const b = document.createElement('button'); b.className = 'planet-chip' + (i === selected ? ' active' : ''); b.innerHTML = `<i style="background:${p.color}"></i>${p.name}`; b.addEventListener('click', () => choosePlanet(i)); picker.appendChild(b) }) }
function makePlanetCards() { const grid = document.getElementById('planetCards'); planets.forEach((p, i) => { const c = document.createElement('article'); c.className = 'planet-card'; c.tabIndex = 0; c.setAttribute('role', 'button'); c.setAttribute('aria-label', 'Explore ' + p.name); c.innerHTML = `<div class="planet-card-top"><div class="planet-orb" style="background:radial-gradient(circle at 30% 28%,${lighten(p.color)},${p.color} 50%,#111827 100%)"></div><span class="planet-index">0${i + 1} / 08</span></div><h3>${p.name}</h3><div class="planet-kind">${p.kind}</div><p>${p.facts}</p><span class="card-arrow">↗</span>`; const go = () => { choosePlanet(i); document.getElementById('simulation').scrollIntoView({ behavior: 'smooth' }) }; c.addEventListener('click', go); c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } }); grid.appendChild(c) }) }
document.getElementById('playPause').addEventListener('click', () => { running = !running; document.getElementById('playPause').textContent = running ? 'Ⅱ' : '▶'; document.getElementById('playPause').setAttribute('aria-label', running ? 'Pause simulation' : 'Resume simulation'); document.getElementById('statusText').textContent = running ? 'RUNNING' : 'PAUSED' });
document.getElementById('resetSim').addEventListener('click', () => { elapsed = 0; angles.forEach((_, i) => angles[i] = i * .7 + .35); trails.forEach(t => t.length = 0); zoom = 1; panX = panY = 0; document.getElementById('timeReadout').textContent = 'T + 000 days'; draw() });
document.getElementById('zoomIn').addEventListener('click', () => { zoom = Math.min(zoom * 1.15, 2.4) }); document.getElementById('zoomOut').addEventListener('click', () => { zoom = Math.max(zoom / 1.15, .55) });
document.getElementById('speedRange').addEventListener('input', e => { speed = +e.target.value; document.getElementById('speedValue').textContent = speed.toFixed(1) + '×'; document.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('active', +b.dataset.speed === speed)) }); document.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => { speed = +b.dataset.speed; document.getElementById('speedRange').value = speed; document.getElementById('speedValue').textContent = speed.toFixed(1) + '×'; document.querySelectorAll('[data-speed]').forEach(x => x.classList.toggle('active', x === b)) }));
document.getElementById('orbitToggle').addEventListener('change', e => showOrbits = e.target.checked); document.getElementById('labelToggle').addEventListener('change', e => showLabels = e.target.checked); document.getElementById('trailToggle').addEventListener('change', e => { showTrails = e.target.checked; if (!showTrails) trails.forEach(t => t.length = 0) });
canvas.addEventListener('wheel', e => { e.preventDefault(); zoom = Math.max(.55, Math.min(2.4, zoom * (e.deltaY < 0 ? 1.08 : .92))) }, { passive: false }); canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, px: panX, py: panY }; canvas.setPointerCapture(e.pointerId) }); canvas.addEventListener('pointermove', e => { if (drag) { panX = drag.px + (e.clientX - drag.x); panY = drag.py + (e.clientY - drag.y) } }); canvas.addEventListener('pointerup', () => drag = null); canvas.addEventListener('pointercancel', () => drag = null);
document.getElementById('menuToggle').addEventListener('click', () => document.querySelector('.nav-links').classList.toggle('open')); document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => document.querySelector('.nav-links').classList.remove('open')));
makePlanetPicker(); makePlanetCards(); choosePlanet(selected); resizeCanvas(); window.addEventListener('resize', resizeCanvas);// The C animation runs inside the iframe.


// ORBITAL: interactive educational planet cards
document.addEventListener("DOMContentLoaded", () => {
    const planetGrid = document.getElementById("orbPlanetGrid");

    if (!planetGrid) return;

    const planetCards = planetGrid.querySelectorAll(".orb-planet-card");

    planetCards.forEach((card) => {
        card.addEventListener("click", () => {
            const isExpanded = card.getAttribute("aria-expanded") === "true";

            // Close the other cards so the section stays tidy.
            planetCards.forEach((otherCard) => {
                otherCard.setAttribute("aria-expanded", "false");
            });

            // Toggle the card that was clicked.
            card.setAttribute("aria-expanded", String(!isExpanded));
        });
    });
});

