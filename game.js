/* =========================================================
   THE FLOOR FILES
   game.js — versión definitiva
========================================================= */

"use strict";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 650;

const DAY_LENGTH = 50;
const FLOOR_DISAPPEAR_AT = 40;

const PLAYER_SPEED = 3.2;
const JOYSTICK_SPEED = 3.5;

const SAVE_KEY = "floorFilesSave";

/* =========================================================
   ELEMENTOS HTML
========================================================= */

const menu = document.getElementById("menu");
const game = document.getElementById("game");
const endingScreen = document.getElementById("endingScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const world = document.getElementById("world");
const player = document.getElementById("player");

const dayDisplay = document.getElementById("day");
const moneyDisplay = document.getElementById("money");
const timerDisplay = document.getElementById("timer");

const phone = document.getElementById("phone");
const phoneContent = document.getElementById("phoneContent");

const galleryButton = document.getElementById("galleryButton");
const cameraButton = document.getElementById("cameraButton");
const mapsButton = document.getElementById("mapsButton");
const storeButton = document.getElementById("storeButton");
const closePhone = document.getElementById("closePhone");

const grabButton = document.getElementById("grabButton");
const phoneButton = document.getElementById("phoneButton");
const joystick = document.getElementById("joystick");

/* =========================================================
   DATOS PERSISTENTES
========================================================= */

let saveData = JSON.parse(localStorage.getItem(SAVE_KEY)) || {
    money: 0,
    boxItems: [],
    appsUnlocked: [
        "gallery",
        "camera",
        "maps",
        "store"
    ],
    endingLines: {}
};

function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

/* =========================================================
   ESTADO DE LA PARTIDA
========================================================= */

let currentDay = 1;
let timeLeft = DAY_LENGTH;

let timerInterval = null;

let gameRunning = false;
let phoneOpen = false;
let inside = false;

let currentInterior = null;

let missionGiven = false;
let missionPhotos = 0;
let floorPhotos = 0;

let beautifulPhotos = 0;
let phoneUses = 0;
let storePurchases = 0;
let potatoesBought = 0;

let hasBomb = false;
let bombUsed = false;

let actionCount = 0;
let moved = false;
let interacted = false;

let gameStartedAt = 0;

let floorDisappearing = false;
let floorRestored = false;

let endingTriggered = false;

/* =========================================================
   POSICIÓN DEL JUGADOR
========================================================= */

let playerX = 140;
let playerY = 470;

let velocityX = 0;
let velocityY = 0;

let keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

/* =========================================================
   JOYSTICK
========================================================= */

let joystickActive = false;
let joystickStartX = 0;
let joystickStartY = 0;

/* =========================================================
   ELEMENTOS DEL MAPA
========================================================= */

let mapObjects = [];
let floorTiles = [];

let currentZone = "town";

/* =========================================================
   TIENDA
========================================================= */

const shopItems = [
    {
        id: "potato1",
        name: "Patata",
        emoji: "🥔",
        price: 3
    },
    {
        id: "phone",
        name: "Teléfono",
        emoji: "☎️",
        price: 5
    },
    {
        id: "bomb1",
        name: "Bomba",
        emoji: "💣",
        price: 7
    },
    {
        id: "vase1",
        name: "Jarrón",
        emoji: "🏺",
        price: 7
    },
    {
        id: "newspaper1",
        name: "Periódico",
        emoji: "📰",
        price: 2
    },
    {
        id: "eggplant1",
        name: "Objeto misterioso",
        emoji: "🍆",
        price: 5
    },
    {
        id: "potato2",
        name: "Patata",
        emoji: "🥔",
        price: 3
    },
    {
        id: "bomb2",
        name: "Bomba",
        emoji: "💣",
        price: 7
    },
    {
        id: "vase2",
        name: "Jarrón",
        emoji: "🏺",
        price: 7
    },
    {
        id: "newspaper2",
        name: "Periódico",
        emoji: "📰",
        price: 2
    },
    {
        id: "eggplant2",
        name: "Objeto misterioso",
        emoji: "🍆",
        price: 5
    },
    {
        id: "bomb3",
        name: "Bomba",
        emoji: "💣",
        price: 7
    }
];

/* =========================================================
   RADIO
========================================================= */

const radioSounds = [
    "myinstants.mp3",
    "myinstants 2.mp3",
    "myinstants 3.mp3",
    "myinstants 4.mp3",
    "myinstants 5.mp3",
    "myinstants 6.mp3",
    "myinstants 7.mp3",
    "myinstants 8.mp3",
    "myinstants 9.mp3",
    "myinstants 10.mp3",
    "myinstants 11.mp3",
    "myinstants 12.mp3",
    "myinstants 13.mp3",
    "myinstants 14.mp3"
];

let unusedRadioSounds = [...radioSounds];
let currentAudio = null;

/* =========================================================
   UTILIDADES
========================================================= */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function createElement(tag, className, parent = world) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    parent.appendChild(element);

    return element;
}

function setPosition(element, x, y) {
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
}

/* =========================================================
   INICIO
========================================================= */

startButton.addEventListener("click", startGame);

restartButton.addEventListener("click", restartGame);

function startGame() {
    menu.classList.add("hidden");
    endingScreen.classList.add("hidden");
    game.classList.remove("hidden");

    resetRun();

    gameRunning = true;
    gameStartedAt = Date.now();

    buildTown();

    updatePlayer();

    startDayTimer();
}

function resetRun() {
    currentDay = 1;
    timeLeft = DAY_LENGTH;

    inside = false;
    currentInterior = null;
    currentZone = "town";

    missionGiven = false;
    missionPhotos = 0;
    floorPhotos = 0;

    beautifulPhotos = 0;
    phoneUses = 0;
    storePurchases = 0;
    potatoesBought = 0;

    hasBomb = false;
    bombUsed = false;

    actionCount = 0;
    moved = false;
    interacted = false;

    floorDisappearing = false;
    floorRestored = false;

    endingTriggered = false;

    playerX = 140;
    playerY = 470;

    velocityX = 0;
    velocityY = 0;

    mapObjects = [];
    floorTiles = [];

    world.innerHTML = "";
    world.appendChild(player);

    updateHUD();
}

/* =========================================================
   PUEBLO
========================================================= */

function buildTown() {
    world.innerHTML = "";
    world.appendChild(player);

    createRoads();
    createBuildings();
    createDecorations();

    createFloorTiles();

    setPosition(player, playerX, playerY);
}

function createRoads() {
    const horizontal1 = createElement("div", "road horizontal");
    horizontal1.style.top = "300px";

    const horizontal2 = createElement("div", "road horizontal");
    horizontal2.style.top = "450px";

    const vertical = createElement("div", "road vertical");
    vertical.style.left = "410px";

    mapObjects.push(
        {
            type: "road",
            x: 0,
            y: 300,
            width: 900,
            height: 90
        },
        {
            type: "road",
            x: 0,
            y: 450,
            width: 900,
            height: 90
        },
        {
            type: "road",
            x: 410,
            y: 0,
            width: 90,
            height: 650
        }
    );
}

function createBuilding(type, x, y, label) {
    const building = createElement(
        "div",
        `building ${type}`
    );

    setPosition(building, x, y);

    building.dataset.type = type;
    building.dataset.label = label;

    const door = document.createElement("div");
    door.className = "door";
    building.appendChild(door);

    const window1 = document.createElement("div");
    window1.className = "window left";
    building.appendChild(window1);

    const window2 = document.createElement("div");
    window2.className = "window right";
    building.appendChild(window2);

    mapObjects.push({
        type: "building",
        buildingType: type,
        x,
        y,
        width: 115,
        height: 90,
        enterable:
            type === "player-house" ||
            type === "shop" ||
            type === "lab"
    });
}

function createBuildings() {
    createBuilding(
        "player-house",
        55,
        490,
        "Casa"
    );

    createBuilding(
        "shop",
        670,
        180,
        "Tienda"
    );

    createBuilding(
        "lab",
        670,
        35,
        "Laboratorio"
    );

    createBuilding(
        "neighbor",
        55,
        55,
        "Casa vecina"
    );

    createBuilding(
        "neighbor",
        255,
        70,
        "Casa vecina"
    );

    createBuilding(
        "neighbor",
        700,
        490,
        "Casa vecina"
    );
}

function createDecorations() {
    for (let i = 0; i < 18; i++) {
        const tree = createElement("div", "tree");

        tree.style.position = "absolute";
        tree.style.width = "25px";
        tree.style.height = "25px";
        tree.style.borderRadius = "50%";
        tree.style.background = "#3f7136";
        tree.style.border = "4px solid #2c4f28";

        let x;
        let y;

        do {
            x = Math.random() * 840;
            y = Math.random() * 590;
        } while (
            isInsideRoad(x, y) ||
            isInsideBuilding(x, y)
        );

        setPosition(tree, x, y);
    }
}

function isInsideRoad(x, y) {
    return (
        (y >= 300 && y <= 390) ||
        (y >= 450 && y <= 540) ||
        (x >= 410 && x <= 500)
    );
}

function isInsideBuilding(x, y) {
    return mapObjects.some(object => {
        if (object.type !== "building") return false;

        return (
            x + 25 > object.x &&
            x < object.x + object.width &&
            y + 25 > object.y &&
            y < object.y + object.height
        );
    });
}

/* =========================================================
   PISO
========================================================= */

function createFloorTiles() {
    const tileSize = 45;

    for (let y = 0; y < WORLD_HEIGHT; y += tileSize) {
        for (let x = 0; x < WORLD_WIDTH; x += tileSize) {
            const tile = document.createElement("div");

            tile.className = "floor-tile";

            tile.style.width = `${tileSize}px`;
            tile.style.height = `${tileSize}px`;

            tile.style.left = `${x}px`;
            tile.style.top = `${y}px`;

            tile.dataset.x = x;
            tile.dataset.y = y;

            world.insertBefore(tile, player);

            floorTiles.push(tile);
        }
    }
}

/* =========================================================
   MOVIMIENTO
========================================================= */

document.addEventListener("keydown", event => {
    if (!gameRunning || phoneOpen || inside) return;

    if (
        event.key === "ArrowUp" ||
        event.key.toLowerCase() === "w"
    ) {
        keys.up = true;
    }

    if (
        event.key === "ArrowDown" ||
        event.key.toLowerCase() === "s"
    ) {
        keys.down = true;
    }

    if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
    ) {
        keys.left = true;
    }

    if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {
        keys.right = true;
    }
});

document.addEventListener("keyup", event => {
    if (
        event.key === "ArrowUp" ||
        event.key.toLowerCase() === "w"
    ) {
        keys.up = false;
    }

    if (
        event.key === "ArrowDown" ||
        event.key.toLowerCase() === "s"
    ) {
        keys.down = false;
    }

    if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
    ) {
        keys.left = false;
    }

    if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {
        keys.right = false;
    }
});

function movementLoop() {
    if (
        gameRunning &&
        !phoneOpen &&
        !inside &&
        !endingTriggered
    ) {
        let dx = 0;
        let dy = 0;

        if (keys.left) dx--;
        if (keys.right) dx++;
        if (keys.up) dy--;
        if (keys.down) dy++;

        if (dx !== 0 || dy !== 0) {
            const length = Math.hypot(dx, dy);

            dx /= length;
            dy /= length;

            movePlayer(
                dx * PLAYER_SPEED,
                dy * PLAYER_SPEED
            );
        }

        if (velocityX !== 0 || velocityY !== 0) {
            movePlayer(
                velocityX,
                velocityY
            );

            velocityX *= 0.82;
            velocityY *= 0.82;

            if (Math.abs(velocityX) < 0.05) {
                velocityX = 0;
            }

            if (Math.abs(velocityY) < 0.05) {
                velocityY = 0;
            }
        }
    }

    requestAnimationFrame(movementLoop);
}

movementLoop();

function movePlayer(dx, dy) {
    const oldX = playerX;
    const oldY = playerY;

    const newX = clamp(
        playerX + dx,
        0,
        WORLD_WIDTH - 30
    );

    const newY = clamp(
        playerY + dy,
        0,
        WORLD_HEIGHT - 42
    );

    if (!collidesWithBuilding(newX, newY)) {
        playerX = newX;
        playerY = newY;
    } else {
        if (!collidesWithBuilding(newX, playerY)) {
            playerX = newX;
        }

        if (!collidesWithBuilding(playerX, newY)) {
            playerY = newY;
        }
    }

    if (
        oldX !== playerX ||
        oldY !== playerY
    ) {
        moved = true;
        actionCount++;
        updatePlayer();
    }
}

function collidesWithBuilding(x, y) {
    return mapObjects.some(object => {
        if (object.type !== "building") {
            return false;
        }

        return (
            x + 24 > object.x &&
            x < object.x + object.width &&
            y + 40 > object.y &&
            y < object.y + object.height
        );
    });
}

function updatePlayer() {
    setPosition(
        player,
        playerX,
        playerY
    );
}

/* =========================================================
   JOYSTICK TÁCTIL
========================================================= */

joystick.addEventListener(
    "pointerdown",
    event => {
        joystickActive = true;

        joystick.setPointerCapture(event.pointerId);

        joystickStartX = event.clientX;
        joystickStartY = event.clientY;
    }
);

joystick.addEventListener(
    "pointermove",
    event => {
        if (!joystickActive) return;

        const dx =
            event.clientX - joystickStartX;

        const dy =
            event.clientY - joystickStartY;

        const distanceFromCenter =
            Math.hypot(dx, dy);

        if (distanceFromCenter < 8) {
            velocityX = 0;
            velocityY = 0;
            return;
        }

        const limitedDistance =
            Math.min(distanceFromCenter, 35);

        const angle =
            Math.atan2(dy, dx);

        const power =
            limitedDistance / 35;

        velocityX =
            Math.cos(angle) *
            JOYSTICK_SPEED *
            power;

        velocityY =
            Math.sin(angle) *
            JOYSTICK_SPEED *
            power;
    }
);

function stopJoystick() {
    joystickActive = false;
    velocityX = 0;
    velocityY = 0;
}

joystick.addEventListener(
    "pointerup",
    stopJoystick
);

joystick.addEventListener(
    "pointercancel",
    stopJoystick
);

/* =========================================================
   BOTÓN A / INTERACTUAR
========================================================= */

grabButton.addEventListener(
    "click",
    interact
);

function interact() {
    if (!gameRunning || phoneOpen) return;

    actionCount++;
    interacted = true;

    if (inside) {
        interactInside();
        return;
    }

    const nearby = getNearbyObject();

    if (!nearby) {
        showMessage(
            "No hay nada interesante aquí."
        );
        return;
    }

    if (nearby.type === "building") {
        enterBuilding(nearby);
    }
}

/* =========================================================
   OBJETOS CERCANOS
========================================================= */

function getNearbyObject() {
    let closest = null;
    let closestDistance = Infinity;

    for (const object of mapObjects) {
        if (object.type !== "building") continue;

        const centerX =
            object.x + object.width / 2;

        const centerY =
            object.y + object.height / 2;

        const d = distance(
            playerX,
            playerY,
            centerX,
            centerY
        );

        if (
            d < 90 &&
            d < closestDistance
        ) {
            closest = object;
            closestDistance = d;
        }
    }

    return closest;
}

/* =========================================================
   INTERIORES
========================================================= */

function enterBuilding(building) {
    if (
        building.buildingType === "neighbor"
    ) {
        showMessage(
            "Es la casa de un vecino. Mejor no entrar. 😐"
        );
        return;
    }

    if (
        building.buildingType === "lab" &&
        !floorDisappearing &&
        currentDay < 2
    ) {
        showMessage(
            "La puerta del laboratorio está cerrada."
        );
        return;
    }

    inside = true;
    currentInterior =
        building.buildingType;

    world.classList.add("hidden");

    if (
        currentInterior === "player-house"
    ) {
        openHomeInterior();
    }

    if (
        currentInterior === "shop"
    ) {
        openShopInterior();
    }

    if (
        currentInterior === "lab"
    ) {
        openLabInterior();
    }
}

/* =========================================================
   SALIR
========================================================= */

function leaveInterior() {
    inside = false;

    currentInterior = null;

    world.classList.remove("hidden");

    phoneContent.innerHTML = "";

    playerX = clamp(
        playerX,
        0,
        WORLD_WIDTH - 30
    );

    playerY = clamp(
        playerY,
        0,
        WORLD_HEIGHT - 42
    );
}

/* =========================================================
   CASA
========================================================= */

function openHomeInterior() {
    createInteriorBase();

    const bed = document.createElement("div");
    bed.className = "bed";
    setPosition(bed, 90, 80);
    interiorRoot.appendChild(bed);

    const radio = document.createElement("div");
    radio.className = "radio";
    setPosition(radio, 90, 180);
    radio.id = "radio";
    interiorRoot.appendChild(radio);

    const box = document.createElement("div");
    box.className = "box";
    setPosition(box, 90, 280);
    box.id = "storageBox";
    interiorRoot.appendChild(box);

    const title = document.createElement("h2");
    title.textContent = "Casa";
    title.style.position = "absolute";
    title.style.top = "20px";
    title.style.left = "20px";
    interiorRoot.appendChild(title);

    radio.addEventListener(
        "click",
        playRadio
    );

    bed.addEventListener(
        "click",
        () => {
            showInteriorMessage(
                "Te acostaste. No cerraste los ojos ni pasó nada especial. Te quedaste ahí. 🛏️"
            );
        }
    );

    box.addEventListener(
        "click",
        () => {
            showBoxContents();
        }
    );
}

/* =========================================================
   TIENDA
========================================================= */

function openShopInterior() {
    createInteriorBase();

    const title = document.createElement("h2");

    title.textContent = "TIENDA";

    title.style.position = "absolute";
    title.style.top = "20px";
    title.style.left = "50%";
    title.style.transform =
        "translateX(-50%)";

    interiorRoot.appendChild(title);

    const seller = document.createElement("div");

    seller.className = "npc seller";

    setPosition(
        seller,
        420,
        85
    );

    interiorRoot.appendChild(seller);

    const shelf = document.createElement("div");

    shelf.style.position = "absolute";
    shelf.style.left = "70px";
    shelf.style.top = "150px";
    shelf.style.right = "70px";
    shelf.style.bottom = "80px";

    shelf.style.display = "grid";
    shelf.style.gridTemplateColumns =
        "repeat(6, 1fr)";
    shelf.style.gap = "12px";
    shelf.style.alignItems = "center";

    interiorRoot.appendChild(shelf);

    shopItems.forEach(item => {
        const product =
            document.createElement("button");

        product.textContent =
            `${item.emoji}\n$${item.price}`;

        product.style.whiteSpace =
            "pre-line";

        product.style.fontSize = "25px";

        product.style.background =
            "#eee";

        product.style.border =
            "3px solid #555";

        product.style.borderRadius =
            "8px";

        product.style.minHeight =
            "65px";

        product.addEventListener(
            "click",
            () => buyItem(item)
        );

        shelf.appendChild(product);
    });
}

function buyItem(item) {
    if (
        saveData.money <
        item.price
    ) {
        showInteriorMessage(
            "No tienes suficiente dinero. 😭"
        );

        return;
    }

    const confirmed =
        confirm(
            `¿De verdad quieres comprar ${item.emoji} ${item.name} por $${item.price}?`
        );

    if (!confirmed) {
        return;
    }

    saveData.money -= item.price;

    saveData.boxItems.push({
        id: item.id,
        name: item.name,
        emoji: item.emoji
    });

    storePurchases++;

    if (item.name === "Patata") {
        potatoesBought++;
    }

    if (item.name === "Bomba") {
        hasBomb = true;
    }

    saveGame();

    updateHUD();

    showInteriorMessage(
        `Compraste ${item.emoji} ${item.name}.`
    );
}

/* =========================================================
   LABORATORIO
========================================================= */

function openLabInterior() {
    createInteriorBase();

    const title =
        document.createElement("h2");

    title.textContent =
        "LABORATORIO";

    title.style.position =
        "absolute";

    title.style.top = "20px";
    title.style.left = "50%";

    title.style.transform =
        "translateX(-50%)";

    interiorRoot.appendChild(title);

    for (let i = 0; i < 2; i++) {
        const scientist =
            document.createElement("div");

        scientist.className =
            "npc scientist";

        setPosition(
            scientist,
            130 + i * 55,
            150
        );

        interiorRoot.appendChild(
            scientist
        );
    }

    for (let i = 0; i < 2; i++) {
        const scientist =
            document.createElement("div");

        scientist.className =
            "npc scientist";

        setPosition(
            scientist,
            130 + i * 55,
            300
        );

        interiorRoot.appendChild(
            scientist
        );
    }

    const equipment =
        document.createElement("div");

    equipment.textContent =
        "🧫  🔬  🧪";

    equipment.style.position =
        "absolute";

    equipment.style.top =
        "210px";

    equipment.style.left =
        "125px";

    equipment.style.fontSize =
        "35px";

    interiorRoot.appendChild(
        equipment
    );

    const deliver =
        document.createElement("button");

    deliver.textContent =
        "ENTREGAR FOTOS";

    deliver.style.position =
        "absolute";

    deliver.style.bottom =
        "80px";

    deliver.style.left =
        "50%";

    deliver.style.transform =
        "translateX(-50%)";

    deliver.style.padding =
        "12px 20px";

    deliver.style.fontWeight =
        "bold";

    interiorRoot.appendChild(
        deliver
    );

    deliver.addEventListener(
        "click",
        deliverPhotos
    );
}

/* =========================================================
   BASE DE INTERIORES
========================================================= */

let interiorRoot = null;

function createInteriorBase() {
    interiorRoot =
        document.createElement("div");

    interiorRoot.className =
        "interior";

    document.body.appendChild(
        interiorRoot
    );

    const floor =
        document.createElement("div");

    floor.className =
        "interior-floor";

    floor.style.position =
        "absolute";

    floor.style.left =
        "20px";

    floor.style.right =
        "20px";

    floor.style.top =
        "70px";

    floor.style.bottom =
        "60px";

    interiorRoot.appendChild(
        floor
    );

    const close =
        document.createElement("button");

    close.textContent =
        "Salir";

    close.style.position =
        "absolute";

    close.style.bottom =
        "15px";

    close.style.right =
        "20px";

    close.style.padding =
        "10px 20px";

    close.addEventListener(
        "click",
        () => {
            interiorRoot.remove();
            interiorRoot = null;
            leaveInterior();
        }
    );

    interiorRoot.appendChild(
        close
    );
}

/* =========================================================
   MENSAJES
========================================================= */

function showMessage(text) {
    const old =
        document.querySelector(
            ".interaction-box"
        );

    if (old) old.remove();

    const box =
        document.createElement("div");

    box.className =
        "interaction-box";

    box.textContent = text;

    document.body.appendChild(
        box
    );

    setTimeout(
        () => box.remove(),
        2500
    );
}

function showInteriorMessage(text) {
    const old =
        document.querySelector(
            ".interior-message"
        );

    if (old) old.remove();

    const box =
        document.createElement("div");

    box.className =
        "interaction-box interior-message";

    box.textContent =
        text;

    if (interiorRoot) {
        interiorRoot.appendChild(
            box
        );
    }

    setTimeout(
        () => box.remove(),
        2500
    );
}

/* =========================================================
   CAJA
========================================================= */

function showBoxContents() {
    if (
        saveData.boxItems.length === 0
    ) {
        showInteriorMessage(
            "La caja está vacía."
        );

        return;
    }

    const contents =
        saveData.boxItems
            .map(
                item =>
                    `${item.emoji} ${item.name}`
            )
            .join("\n");

    showInteriorMessage(
        `Contenido de la caja:\n${contents}`
    );
}

/* =========================================================
   RADIO
========================================================= */

function playRadio() {
    if (
        unusedRadioSounds.length === 0
    ) {
        unusedRadioSounds =
            [...radioSounds];
    }

    const index =
        Math.floor(
            Math.random() *
            unusedRadioSounds.length
        );

    const soundName =
        unusedRadioSounds.splice(
            index,
            1
        )[0];

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio =
        new Audio(
            `audio/${soundName}`
        );

    currentAudio.play().catch(() => {});

    showInteriorMessage(
        `La radio está reproduciendo un sonido aleatorio. 📻`
    );
}

/* =========================================================
   INTERACCIÓN DENTRO DE INTERIORES
========================================================= */

function interactInside() {
    if (
        currentInterior === "player-house"
    ) {
        showInteriorMessage(
            "Estás dentro de tu casa."
        );

        return;
    }

    if (
        currentInterior === "shop"
    ) {
        showInteriorMessage(
            "Hay productos por toda la tienda."
        );

        return;
    }

    if (
        currentInterior === "lab"
    ) {
        showInteriorMessage(
            "Los científicos están trabajando."
        );
    }
}

/* =========================================================
   TELÉFONO
========================================================= */

phoneButton.addEventListener(
    "click",
    openPhone
);

closePhone.addEventListener(
    "click",
    closePhoneApp
);

function openPhone() {
    if (!gameRunning) return;

    phoneOpen = true;
    phone.classList.remove("hidden");

    phoneUses++;
    actionCount++;

    phoneContent.innerHTML = "";

    showPhoneHome();
}

function closePhoneApp() {
    phoneOpen = false;
    phone.classList.add("hidden");
    phoneContent.innerHTML = "";
}

function showPhoneHome() {
    phoneContent.innerHTML =
        "<p style='text-align:center'>Selecciona una aplicación.</p>";
}

galleryButton.addEventListener(
    "click",
    openGallery
);

cameraButton.addEventListener(
    "click",
    openCamera
);

mapsButton.addEventListener(
    "click",
    openMaps
);

storeButton.addEventListener(
    "click",
    openPlayStore
);

/* =========================================================
   CÁMARA
========================================================= */

function openCamera() {
    phoneContent.innerHTML = `
        <div style="text-align:center">
            <h3>📷 Cámara</h3>
            <p>Apunta al suelo o a algo bonito.</p>
            <button id="takePhoto"
                style="padding:10px;margin-top:15px">
                TOMAR FOTO
            </button>
        </div>
    `;

    document
        .getElementById("takePhoto")
        .addEventListener(
            "click",
            takePhoto
        );
}

function takePhoto() {
    const isFloor =
        Math.random() < 0.65;

    const beautiful =
        Math.random() < 0.25;

    if (isFloor) {
        floorPhotos++;

        if (currentDay >= 2) {
            missionPhotos++;
        }

        addGalleryPhoto(
            "Foto del piso",
            "floor"
        );

        phoneContent.innerHTML = `
            <h3>📸 Foto tomada</h3>
            <p>El piso quedó perfectamente fotografiado.</p>
        `;

        return;
    }

    if (beautiful) {
        beautifulPhotos++;

        const reward =
            Math.random() < 0.5
                ? 1
                : 2;

        saveData.money += reward;

        saveGame();
        updateHUD();

        addGalleryPhoto(
            "Foto bonita",
            "beautiful"
        );

        phoneContent.innerHTML = `
            <h3>📸 ¡Foto increíble!</h3>
            <p>Ganaste $${reward}.</p>
        `;

        return;
    }

    addGalleryPhoto(
        "Foto normal",
        "normal"
    );

    phoneContent.innerHTML = `
        <h3>📸 Foto tomada</h3>
        <p>Bueno... técnicamente es una foto.</p>
    `;
}

/* =========================================================
   GALERÍA
========================================================= */

let galleryPhotos = JSON.parse(
    localStorage.getItem(
        "floorFilesGallery"
    )
) || [
    {
        name: "Patata",
        type: "random",
        emoji: "🥔"
    },
    {
        name: "Foto rara",
        type: "random",
        emoji: "❓"
    }
];

let deletedPhotos = JSON.parse(
    localStorage.getItem(
        "floorFilesTrash"
    )
) || [];

function saveGallery() {
    localStorage.setItem(
        "floorFilesGallery",
        JSON.stringify(
            galleryPhotos
        )
    );

    localStorage.setItem(
        "floorFilesTrash",
        JSON.stringify(
            deletedPhotos
        )
    );
}

function addGalleryPhoto(
    name,
    type
) {
    const emoji =
        type === "floor"
            ? "🟫"
            : type === "beautiful"
                ? "🌄"
                : "📸";

    galleryPhotos.push({
        name,
        type,
        emoji
    });

    saveGallery();
}

function openGallery() {
    phoneContent.innerHTML = `
        <div>
            <h3>🖼️ Galería</h3>
            <div id="galleryList"
                style="
                    display:grid;
                    grid-template-columns:repeat(2,1fr);
                    gap:8px;
                    margin-top:10px;
                ">
            </div>

            <button id="trashButton"
                style="padding:8px;margin-top:10px">
                🗑️ Papelera
            </button>
        </div>
    `;

    const list =
        document.getElementById(
            "galleryList"
        );

    galleryPhotos.forEach(
        (photo, index) => {
            const item =
                document.createElement(
                    "button"
                );

            item.style.padding =
                "12px";

            item.style.minHeight =
                "70px";

            item.innerHTML =
                `${photo.emoji}<br>${photo.name}`;

            item.addEventListener(
                "click",
                () => deletePhoto(index)
            );

            list.appendChild(item);
        }
    );

    document
        .getElementById("trashButton")
        .addEventListener(
            "click",
            openTrash
        );
}

function deletePhoto(index) {
    const photo =
        galleryPhotos[index];

    galleryPhotos.splice(
        index,
        1
    );

    deletedPhotos.push(photo);

    saveGallery();

    openGallery();
}

function openTrash() {
    phoneContent.innerHTML = `
        <h3>🗑️ Papelera</h3>
        <p>Fotos eliminadas:</p>
        <div id="trashList"></div>
        <button id="emptyTrash"
            style="padding:8px;margin-top:10px">
            Vaciar papelera
        </button>
    `;

    const list =
        document.getElementById(
            "trashList"
        );

    deletedPhotos.forEach(
        (photo, index) => {
            const item =
                document.createElement(
                    "button"
                );

            item.style.display =
                "block";

            item.style.width =
                "100%";

            item.style.padding =
                "8px";

            item.style.margin =
                "5px 0";

            item.textContent =
                `${photo.emoji} ${photo.name} — RECUPERAR`;

            item.addEventListener(
                "click",
                () => {
                    galleryPhotos.push(
                        deletedPhotos[index]
                    );

                    deletedPhotos.splice(
                        index,
                        1
                    );

                    saveGallery();

                    openTrash();
                }
            );

            list.appendChild(item);
        }
    );

    document
        .getElementById("emptyTrash")
        .addEventListener(
            "click",
            () => {
                deletedPhotos = [];

                saveGallery();

                openTrash();
            }
        );
}

/* =========================================================
   MAPAS
========================================================= */

function openMaps() {
    phoneContent.innerHTML = `
        <h3>🗺️ Mapas</h3>

        <div style="
            position:relative;
            width:100%;
            height:240px;
            background:#79ad5e;
            border:3px solid white;
            margin-top:10px;
        ">

            <div style="
                position:absolute;
                top:105px;
                width:100%;
                height:40px;
                background:#555;
            "></div>

            <div style="
                position:absolute;
                left:180px;
                height:100%;
                width:40px;
                background:#555;
            "></div>

            <div style="
                position:absolute;
                left:20px;
                bottom:20px;
                width:45px;
                height:35px;
                background:#789;
            "></div>

            <div style="
                position:absolute;
                right:25px;
                top:30px;
                width:45px;
                height:35px;
                background:#d5c08d;
            "></div>

            <div style="
                position:absolute;
                right:25px;
                bottom:20px;
                width:45px;
                height:35px;
                background:#d5c08d;
            "></div>

        </div>

        <p style="margin-top:10px">
            🛖 Tu casa<br>
            🏪 Tienda<br>
            🧪 Laboratorio
        </p>
    `;
}

/* =========================================================
   PLAY STORE
========================================================= */

function openPlayStore() {
    phoneContent.innerHTML = `
        <h3>▶️ Play Store</h3>

        <div style="
            display:grid;
            gap:10px;
            margin-top:10px;
        ">

            <div style="
                padding:15px;
                background:#ff8a00;
                border-radius:8px;
            ">
                🟧 The Floor Files
            </div>

            <div style="
                padding:15px;
                background:#48a85a;
                border-radius:8px;
            ">
                🟩 Futbol sim Esqueleto
            </div>

            <div style="
                padding:15px;
                background:#777;
                border-radius:8px;
            ">
                🟪 Calculadora 3000
            </div>

        </div>

        <p style="margin-top:15px">
            No puedes descargar nada.
            El almacenamiento está lleno.
        </p>
    `;
}

/* =========================================================
   MISIÓN
========================================================= */

function giveMission() {
    if (missionGiven) return;

    missionGiven = true;

    showMessage(
        "MISIÓN: Toma fotos del piso y llévalas al laboratorio."
    );
}

/* =========================================================
   ENTREGAR FOTOS
========================================================= */

function deliverPhotos() {
    if (!missionGiven) {
        showInteriorMessage(
            "Los científicos no saben qué haces aquí."
        );

        return;
    }

    if (missionPhotos < 2) {
        showInteriorMessage(
            "Necesitamos al menos 2 fotos del piso."
        );

        return;
    }

    if (hasBomb && confirm(
        "Tienes una bomba. ¿Quieres usarla en el laboratorio?"
    )) {
        useBombAtLab();
        return;
    }

    restoreFloor();

    showInteriorMessage(
        "¡Fotos recibidas! Los científicos comenzaron a fabricar el piso."
    );

    setTimeout(() => {
        if (
            interiorRoot &&
            currentInterior === "lab"
        ) {
            showInteriorMessage(
                "¡Listo! El piso volvió. 🌎"
            );
        }
    }, 1800);
}

/* =========================================================
   BOMBA
========================================================= */

function useBombAtLab() {
    bombUsed = true;

    showInteriorMessage(
        "💣 BOOOOOOM"
    );

    setTimeout(
        () => {
            triggerEnding(
                "BAD BOY ENDING"
            );
        },
        1200
    );
}

/* =========================================================
   DESAPARICIÓN DEL PISO
========================================================= */

function startFloorDisappearance() {
    if (floorDisappearing) return;

    floorDisappearing = true;

    showMessage(
        "¡EL PISO ESTÁ DESAPARECIENDO!"
    );

    const centerX =
        WORLD_WIDTH / 2;

    const centerY =
        WORLD_HEIGHT / 2;

    const tilesWithDistance =
        floorTiles.map(tile => {
            const x =
                Number(tile.dataset.x);

            const y =
                Number(tile.dataset.y);

            const tileCenterX =
                x + 22;

            const tileCenterY =
                y + 22;

            const d =
                Math.max(
                    Math.abs(
                        tileCenterX -
                        centerX
                    ),
                    Math.abs(
                        tileCenterY -
                        centerY
                    )
                );

            return {
                tile,
                distance: d
            };
        });

    tilesWithDistance.sort(
        (a, b) =>
            b.distance -
            a.distance
    );

    tilesWithDistance.forEach(
        (entry, index) => {
            const delay =
                index * 8;

            setTimeout(
                () => {
                    entry.tile.classList.add(
                        "gone"
                    );
                },
                delay
            );
        }
    );

    setTimeout(
        () => {
            floorDisappearing = true;
        },
        tilesWithDistance.length * 8
    );
}

/* =========================================================
   RESTAURAR PISO
========================================================= */

function restoreFloor() {
    if (floorRestored) return;

    floorRestored = true;

    const centerX =
        WORLD_WIDTH / 2;

    const centerY =
        WORLD_HEIGHT / 2;

    const tilesWithDistance =
        floorTiles.map(tile => {
            const x =
                Number(tile.dataset.x);

            const y =
                Number(tile.dataset.y);

            const tileCenterX =
                x + 22;

            const tileCenterY =
                y + 22;

            const d =
                Math.max(
                    Math.abs(
                        tileCenterX -
                        centerX
                    ),
                    Math.abs(
                        tileCenterY -
                        centerY
                    )
                );

            return {
                tile,
                distance: d
            };
        });

    tilesWithDistance.sort(
        (a, b) =>
            a.distance -
            b.distance
    );

    tilesWithDistance.forEach(
        (entry, index) => {
            setTimeout(
                () => {
                    entry.tile.classList.remove(
                        "gone"
                    );

                    entry.tile.classList.add(
                        "returning"
                    );

                    setTimeout(
                        () => {
                            entry.tile.classList.remove(
                                "returning"
                            );
                        },
                        300
                    );
                },
                index * 8
            );
        }
    );

    setTimeout(
        () => {
            floorDisappearing = false;

            if (
                !endingTriggered
            ) {
                triggerEnding(
                    "GOOD ENDING"
                );
            }
        },
        tilesWithDistance.length * 8 + 1000
    );
}

/* =========================================================
   DÍAS Y TEMPORIZADOR
========================================================= */

function startDayTimer() {
    clearInterval(timerInterval);

    timerInterval =
        setInterval(
            updateTimer,
            1000
        );

    updateTimer();
}

function updateTimer() {
    if (!gameRunning) return;

    timeLeft--;

    if (
        currentDay === 1
    ) {
        if (timeLeft <= 0) {
            startDayTwo();
            return;
        }
    }

    if (
        currentDay === 2
    ) {
        if (
            timeLeft === 40
        ) {
            giveMission();
        }

        if (
            timeLeft === 10
        ) {
            startFloorDisappearance();
        }

        if (
            timeLeft <= 0
        ) {
            finishDayTwo();
            return;
        }
    }

    updateHUD();
}

function startDayTwo() {
    currentDay = 2;
    timeLeft = DAY_LENGTH;

    giveMission();

    updateHUD();

    showMessage(
        "DÍA 2 — Toma fotos del piso y llévalas al laboratorio."
    );
}

function finishDayTwo() {
    clearInterval(timerInterval);

    if (endingTriggered) return;

    determineEnding();
}

/* =========================================================
   HUD
========================================================= */

function updateHUD() {
    dayDisplay.textContent =
        `Día ${currentDay}`;

    moneyDisplay.textContent =
        `$${saveData.money}`;

    timerDisplay.textContent =
        timeLeft;
}

/* =========================================================
   ENDINGS
========================================================= */

const endings = {

    "GOOD ENDING": [
        "¡Salvaste al mundo! Ahora puedes volver a tu casa como si nada hubiera pasado. 👍",
        "El piso volvió, la ciudad está a salvo y nadie entiende cómo lo lograste. 🫡"
    ],

    "BAD ENDING": [
        "No salvaste al mundo. Bueno... al menos lo intentaste. O ni eso.",
        "El piso desapareció y tú no pudiste hacer nada. 💀"
    ],

    "SECRET ENDING": [
        "No hiciste absolutamente nada. Admirable nivel de flojera.",
        "Te quedaste quieto mientras el mundo se acababa. Una estrategia... interesante."
    ],

    "CAPITALISM ENDING": [
        "Moriste, pero rico. Al fin y al cabo, el dinero da felicidad. Así que moriste feliz. 🤑",
        "No salvaste al mundo, pero tienes dinero. ¿Quién necesita un mundo cuando tienes dinero? 🤑"
    ],

    "PATATA ENDING": [
        "Tienes tantas patatas que ya no sabes qué hacer con ellas. Excelente inversión. 🥔",
        "El mundo se acabó, pero al menos tienes patatas. 🥔"
    ],

    "PHONE ADDICT ENDING": [
        "Pasaste tanto tiempo con el celular que olvidaste que existía el piso.",
        "Tu teléfono sobrevivió. Tú no. 📱"
    ],

    "PHOTOGRAPHER ENDING": [
        "El mundo se acabó, pero tus fotos quedaron increíbles. Prioridades. 📸",
        "No salvaste el mundo, pero tu galería quedó espectacular. 📸"
    ],

    "SHOPPING ENDING": [
        "Compraste toda la tienda. ¿Para qué? No sabemos. Pero la compraste.",
        "La tienda está vacía. Tú tienes todo. El mundo sigue desapareciendo. 🛒"
    ],

    "TRASH ENDING": [
        "Borraste las fotos. Luego las borraste otra vez. ¿Qué esperabas?",
        "La papelera tuvo una jornada laboral intensa. 🗑️"
    ],

    "BAD BOY ENDING": [
        "._. Tu objetivo era salvar la ciudad, al menos intentarlo, pero no, tenía que volverte un villano -_-",
        "Tenías que salvar la ciudad. Elegiste explotar el laboratorio. Excelente decisión, villano. 💀"
    ],

    "??? ENDING": [
        "Hiciste tantas cosas que ni nosotros sabemos qué ending darte.",
        "Lograste demasiadas cosas a la vez. El juego simplemente se rindió. ???"
    ]
};

function chooseEndingLine(
    endingName
) {
    const lines =
        endings[endingName];

    if (!lines) {
        return "";
    }

    const previous =
        saveData.endingLines[
            endingName
        ];

    let next;

    if (
        previous === undefined
    ) {
        next = 0;
    } else {
        next =
            previous === 0
                ? 1
                : 0;
    }

    saveData.endingLines[
        endingName
    ] = next;

    saveGame();

    return lines[next];
}

/* =========================================================
   DETERMINAR ENDING
========================================================= */

function determineEnding() {
    if (endingTriggered) return;

    /*
       SECRET:
       No se movió, no sacó el teléfono,
       no interactuó y no hizo absolutamente nada.
    */

    if (
        !moved &&
        !interacted &&
        phoneUses === 0 &&
        actionCount === 0
    ) {
        triggerEnding(
            "SECRET ENDING"
        );

        return;
    }

    /*
       BAD BOY
    */

    if (bombUsed) {
        triggerEnding(
            "BAD BOY ENDING"
        );

        return;
    }

    /*
       TRASH
    */

    const deletedFloorPhotos =
        deletedPhotos.filter(
            photo =>
                photo.type === "floor"
        ).length;

    if (
        deletedFloorPhotos >= 2 &&
        missionPhotos < 2
    ) {
        triggerEnding(
            "TRASH ENDING"
        );

        return;
    }

    /*
       Demasiadas categorías distintas
       activadas = ???
    */

    const conditions = [];

    if (
        saveData.money >= 20
    ) {
        conditions.push(
            "money"
        );
    }

    if (
        potatoesBought >= 3
    ) {
        conditions.push(
            "potato"
        );
    }

    if (
        phoneUses >= 8
    ) {
        conditions.push(
            "phone"
        );
    }

    if (
        beautifulPhotos >= 5
    ) {
        conditions.push(
            "photographer"
        );
    }

    if (
        storePurchases >=
        shopItems.length
    ) {
        conditions.push(
            "shopping"
        );
    }

    if (
        conditions.length >= 3
    ) {
        triggerEnding(
            "??? ENDING"
        );

        return;
    }

    /*
       ENDINGS ESPECÍFICOS
    */

    if (
        potatoesBought >= 3
    ) {
        triggerEnding(
            "PATATA ENDING"
        );

        return;
    }

    if (
        storePurchases >=
        shopItems.length
    ) {
        triggerEnding(
            "SHOPPING ENDING"
        );

        return;
    }

    if (
        phoneUses >= 8
    ) {
        triggerEnding(
            "PHONE ADDICT ENDING"
        );

        return;
    }

    if (
        beautifulPhotos >= 5 &&
        missionPhotos < 2
    ) {
        triggerEnding(
            "PHOTOGRAPHER ENDING"
        );

        return;
    }

    if (
        saveData.money >= 20 &&
        missionPhotos < 2
    ) {
        triggerEnding(
            "CAPITALISM ENDING"
        );

        return;
    }

    /*
       Si completó misión y no hay
       otro ending especial:
       GOOD
    */

    if (
        missionPhotos >= 2 &&
        floorRestored
    ) {
        triggerEnding(
            "GOOD ENDING"
        );

        return;
    }

    triggerEnding(
        "BAD ENDING"
    );
}

/* =========================================================
   MOSTRAR ENDING
========================================================= */

function triggerEnding(
    endingName
) {
    if (endingTriggered) return;

    endingTriggered = true;
    gameRunning = false;

    clearInterval(timerInterval);

    if (currentAudio) {
        currentAudio.pause();
    }

    if (
        interiorRoot
    ) {
        interiorRoot.remove();
        interiorRoot = null;
    }

    phone.classList.add("hidden");

    game.classList.add("hidden");

    endingScreen.classList.remove(
        "hidden"
    );

    document.getElementById(
        "endingTitle"
    ).textContent =
        endingName;

    document.getElementById(
        "endingText"
    ).textContent =
        chooseEndingLine(
            endingName
        );
}

/* =========================================================
   REINICIAR
========================================================= */

function restartGame() {
    endingScreen.classList.add(
        "hidden"
    );

    game.classList.remove(
        "hidden"
    );

    if (interiorRoot) {
        interiorRoot.remove();
        interiorRoot = null;
    }

    phone.classList.add(
        "hidden"
    );

    resetRun();

    gameRunning = true;

    buildTown();

    updatePlayer();

    startDayTimer();
}

/* =========================================================
   COMPROBAR MISIÓN AL LLEGAR AL DÍA 2
========================================================= */

setInterval(
    () => {
        if (
            gameRunning &&
            currentDay === 2 &&
            !missionGiven
        ) {
            giveMission();
        }
    },
    500
);

/* =========================================================
   INICIO
========================================================= */

updateHUD();
