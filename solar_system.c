
#include <graphics.h>
#include <stdio.h>
#include <math.h>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#define KEEPALIVE EMSCRIPTEN_KEEPALIVE
#else
#include <conio.h>
#define KEEPALIVE
#endif

#define PI 3.14159265
#define PLANET_COUNT 8

struct Planet {
    char name[10];
    int radius;
    int orbitRadius;
    int color;
    float revolutionSpeed;
    float rotationSpeed;
    float revolutionAngle;
    float rotationAngle;
};

static float simulationSpeed = 1.0f;
static int paused = 0;
static int showOrbits = 1;
static int showLabels = 1;
static int showTrails = 0;
static float zoomLevel = 1.0f;
static int resetRequested = 0;

static struct Planet planets[PLANET_COUNT] = {
    {"Mercury", 4,  45,  LIGHTGRAY, 4.0f, 12.0f, 0, 0},
    {"Venus",   6,  75,  LIGHTRED,  3.0f,  9.0f, 0, 0},
    {"Earth",   7, 105,  LIGHTBLUE, 2.5f,  8.0f, 0, 0},
    {"Mars",    5, 135,  RED,       2.0f,  7.0f, 0, 0},
    {"Jupiter",11, 180,  BROWN,     1.2f,  5.0f, 0, 0},
    {"Saturn",  9, 225,  YELLOW,    0.9f,  4.0f, 0, 0},
    {"Uranus",  8, 265,  CYAN,      0.6f,  3.0f, 0, 0},
    {"Neptune", 8, 305,  BLUE,      0.4f,  2.0f, 0, 0}
};

KEEPALIVE
void setSimulationSpeed(float speed) {
    if (speed < 0.1f) speed = 0.1f;
    if (speed > 5.0f) speed = 5.0f;
    simulationSpeed = speed;
}

KEEPALIVE
void setPaused(int value) {
    paused = value;
}

KEEPALIVE
void resetSimulation(void) {
    int i;
    for (i = 0; i < PLANET_COUNT; i++) {
        planets[i].revolutionAngle = 0;
        planets[i].rotationAngle = 0;
    }
}

KEEPALIVE
void setZoom(float value) {
    zoomLevel *= value;
    if (zoomLevel < 0.55f) zoomLevel = 0.55f;
    if (zoomLevel > 2.4f) zoomLevel = 2.4f;
}

KEEPALIVE
void setOrbits(int value) {
    showOrbits = value;
}

KEEPALIVE
void setLabels(int value) {
    showLabels = value;
}

KEEPALIVE
void setTrails(int value) {
    showTrails = value;
}

void drawSun(int cx, int cy) {
    setcolor(YELLOW);
    setfillstyle(SOLID_FILL, YELLOW);
    fillellipse(cx, cy, 24, 24);

    setcolor(LIGHTRED);
    circle(cx, cy, 28);
}

void drawPlanet(struct Planet p, int cx, int cy) {
    int x, y, radius;
    float angle;

    radius = (int)(p.radius * zoomLevel);
    if (radius < 2) radius = 2;

    x = cx + (int)(p.orbitRadius * zoomLevel *
        cos(p.revolutionAngle * PI / 180.0));

    y = cy + (int)(p.orbitRadius * zoomLevel *
        sin(p.revolutionAngle * PI / 180.0));

    setcolor(p.color);
    setfillstyle(SOLID_FILL, p.color);
    fillellipse(x, y, radius, radius);

    angle = p.rotationAngle * PI / 180.0;

    setcolor(WHITE);
    setfillstyle(SOLID_FILL, WHITE);
    fillellipse(
        x + (int)((radius - 1) * cos(angle)),
        y + (int)((radius - 1) * sin(angle)),
        2, 2
    );

    if (showLabels) {
        setcolor(WHITE);
        outtextxy(x + radius + 3, y - 5, p.name);
    }
}

void animate_frame(void) {
    int i;
    int cx = getmaxx() / 2;
    int cy = getmaxy() / 2 + 25;

    if (resetRequested) {
        resetSimulation();
        resetRequested = 0;
    }

    cleardevice();
    setbkcolor(BLACK);

    if (showLabels) {
        setcolor(WHITE);
        outtextxy(10, 10, "SOLAR SYSTEM ANIMATION");
        outtextxy(10, 30, "C / WebAssembly Simulation");
    }

    drawSun(cx, cy);

    if (showOrbits) {
        for (i = 0; i < PLANET_COUNT; i++) {
            setcolor(DARKGRAY);
            circle(
                cx, cy,
                (int)(planets[i].orbitRadius * zoomLevel)
            );
        }
    }

    for (i = 0; i < PLANET_COUNT; i++) {
        drawPlanet(planets[i], cx, cy);
    }

    if (!paused) {
        for (i = 0; i < PLANET_COUNT; i++) {
            planets[i].revolutionAngle +=
                planets[i].revolutionSpeed * simulationSpeed;

            planets[i].rotationAngle +=
                planets[i].rotationSpeed * simulationSpeed;

            if (planets[i].revolutionAngle >= 360)
                planets[i].revolutionAngle -= 360;

            if (planets[i].rotationAngle >= 360)
                planets[i].rotationAngle -= 360;
        }
    }
}

int main(int argc, char *argv[]) {
    int gd = DETECT, gm;

    initgraph(&gd, &gm, "");

#ifdef __EMSCRIPTEN__
    emscripten_set_main_loop(animate_frame, 30, 1);
#else
    while (!kbhit()) {
        animate_frame();
        delay(30);
    }
    closegraph();
#endif

    return 0;
}