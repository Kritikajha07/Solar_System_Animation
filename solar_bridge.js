
window.addEventListener('message', function (event) {
    const data = event.data;
    if (!data || typeof data.type !== 'string') return;

    const functions = {
        speed: ['setSimulationSpeed', [Number(data.value)]],
        pause: ['setPaused', [1]],
        resume: ['setPaused', [0]],
        reset: ['resetSimulation', []],
        zoom: ['setZoom', [Number(data.value)]],
        orbits: ['setOrbits', [data.value ? 1 : 0]],
        labels: ['setLabels', [data.value ? 1 : 0]],
        trails: ['setTrails', [data.value ? 1 : 0]]
    };

    const command = functions[data.type];
    if (!command || !window.Module || !Module.calledRun) return;

    Module.ccall(
        command[0],
        null,
        command[1].length ? ['number'] : [],
        command[1]
    );
});