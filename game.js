/* =========================================================
   THE FLOOR FILES
   GAME.JS — VERSIÓN DEFINITIVA
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const DAY_LENGTH = 50;
const FLOOR_START = 40;

const RADIO_SOUNDS = [
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


/* =========================================================
   ESTADO DEL JUEGO
   ========================================================= */

let gameRunning = false;
let currentDay = 1;
let timeLeft = DAY_LENGTH;

let money = Number(localStorage.getItem("floorFilesMoney")) || 0;

let photos = 0;
let beautifulPhotos = 0;

let phoneUses = 0;
let cameraUses = 0;
let storePurchases = 0;
let potatoesBought = 0;

let hasMission = false;
let missionCompleted = false;
let floorDisappearing = false;
let floorRestoring = false;
let bombUsed = false;

let playerMoved = false;
let playerInteracted = false;
let phoneOpened = false;

let radioPlayed = false;

let purchasedItems =
    JSON.parse(localStorage.getItem("floorFilesItems")) || [];


/* =========================================================
   ELEMENTOS
   ========================================================= */

const menu = document.getElementById("menu");
const game = document.getElementById("game");
const endingScreen = document.getElementById("endingScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const player = document.getElementById("player");
const world = document.getElementById("world");

const dayDisplay = document.getElementById("day");
const moneyDisplay = document.getElementById("money");
const timerDisplay = document.getElementById("timer");

const grabButton = document.getElementById("grabButton");
const phoneButton = document.getElementById("phoneButton");

const phone = document.getElementById("phone");
const closePhone = document.getElementById("closePhone");

const galleryButton = document.getElementById("galleryButton");
const cameraButton = document.getElementById("cameraButton");
const mapsButton = document.getElementById("mapsButton");
const storeButton = document.getElementById("storeButton");

const phoneContent = document.getElementById("phoneContent");

const endingTitle = document.getElementById("endingTitle");
const endingText = document.getElementById("endingText");


/* =========================================================
   MAPA
   ========================================================= */

const mapLayout = [
    ["house", "wall", "floor", "road", "road", "wall", "lab"],
    ["wall", "wall", "floor", "road", "road", "wall", "wall"],
    ["road", "road", "road", "road", "road", "road", "floor"],
    ["road", "road", "road", "road", "road", "road", "floor"],
    ["floor", "wall", "road", "road", "wall", "wall", "floor"],
    ["home", "wall", "road", "road", "wall", "shop", "floor"]
];

function createMap() {
    const map = document.createElement("div");
    map.id = "map";

    for (let y = 0; y < mapLayout.length; y++) {
        for (let x = 0; x < mapLayout[y].length; x++) {

            const tile = document.createElement("div");

            tile.className = "tile";
            tile.dataset.x = x;
            tile.dataset.y = y;
            tile.dataset.type = mapLayout[y][x];

            switch (mapLayout[y][x]) {

                case "home":
                    tile.textContent = "🛖";
                    tile.classList.add("building");
                    break;

                case "house":
                    tile.textContent = "🏠";
                    tile.classList.add("building");
                    break;

                case "lab":
                    tile.textContent = "🧪";
                    tile.classList.add("building");
                    break;

                case "shop":
                    tile.textContent = "🏪";
                    tile.classList.add("building");
                    break;

                case "road":
                    tile.textContent = "🛣️";
                    break;

                case "wall":
                    tile.textContent = "⬜️";
                    break;

                case "floor":
                    tile.textContent = "▫️";
                    break;
            }

            map.appendChild(tile);
        }
    }

    world.prepend(map);
}

createMap();


/* =========================================================
   POSICIÓN DEL JUGADOR
   ========================================================= */

let playerX = 1;
let playerY = 5;

function updatePlayerPosition() {
    player.style.left = `${playerX * 60 + 10}px`;
    player.style.top = `${playerY * 60 + 10}px`;
}

updatePlayerPosition();


/* =========================================================
   MOVIMIENTO
   ========================================================= */

function movePlayer(dx, dy) {

    if (!gameRunning || floorDisappearing && isFloorGone(playerX, playerY)) {
        return;
    }

    const newX = playerX + dx;
    const newY = playerY + dy;

    if (
        newX < 0 ||
        newY < 0 ||
        newY >= mapLayout.length ||
        newX >= mapLayout[newY].length
    ) {
        return;
    }

    const destination = mapLayout[newY][newX];

    if (destination === "wall") {
        return;
    }

    playerX = newX;
    playerY = newY;

    playerMoved = true;

    updatePlayerPosition();

    checkFloorDanger();
}


/* =========================================================
   TECLADO
   ========================================================= */

document.addEventListener("keydown", (event) => {

    switch (event.key) {

        case "ArrowUp":
        case "w":
            movePlayer(0, -1);
            break;

        case "ArrowDown":
        case "s":
            movePlayer(0, 1);
            break;

        case "ArrowLeft":
        case "a":
            movePlayer(-1, 0);
            break;

        case "ArrowRight":
        case "d":
            movePlayer(1, 0);
            break;
    }
});


/* =========================================================
   BOTONES DE MOVIMIENTO
   ========================================================= */

const joystick = document.getElementById("joystick");

let joystickActive = false;

joystick.addEventListener("click", () => {

    // Movimiento sencillo para el prototipo de control táctil.
    // El estilo definitivo puede convertirlo en joystick real.

    movePlayer(1, 0);
});


/* =========================================================
   INTERACCIÓN
   ========================================================= */

grabButton.addEventListener("click", () => {

    if (!gameRunning) return;

    playerInteracted = true;

    interact();
});


function interact() {

    const location = mapLayout[playerY][playerX];

    if (location === "home") {
        enterHome();
        return;
    }

    if (location === "shop") {
        enterShop();
        return;
    }

    if (location === "lab") {
        enterLab();
        return;
    }

    // Radio
    if (isNearRadio()) {
        playRadio();
        return;
    }
}


/* =========================================================
   CASA DEL JUGADOR
   ========================================================= */

function enterHome() {

    phoneContent.innerHTML = `
        <h2>🛖 Tu casa</h2>
        <p>Tu pequeña casa.</p>
        <p>🛏️ Puedes acostarte.</p>
        <p>📻 Hay una radio.</p>
        <p>📦 Tu caja guarda tus cosas.</p>
    `;
}


/* =========================================================
   RADIO
   ========================================================= */

let unusedRadioSounds = [...RADIO_SOUNDS];

function playRadio() {

    if (unusedRadioSounds.length === 0) {
        unusedRadioSounds = [...RADIO_SOUNDS];
    }

    const randomIndex =
        Math.floor(Math.random() * unusedRadioSounds.length);

    const soundName = unusedRadioSounds[randomIndex];

    unusedRadioSounds.splice(randomIndex, 1);

    const audio = new Audio(`audio/${soundName}`);

    audio.play().catch(() => {
        console.log("No se pudo reproducir:", soundName);
    });

    radioPlayed = true;
}

function isNearRadio() {
    // La radio está dentro de la casa.
    return mapLayout[playerY][playerX] === "home";
}


/* =========================================================
   TIENDA
   ========================================================= */

const storeItems = [
    { name: "🍆", price: 5 },
    { name: "🥔", price: 3 },
    { name: "💣", price: 7 },
    { name: "🏺", price: 7 },
    { name: "📰", price: 2 }
];

function enterShop() {

    phoneContent.innerHTML = `
        <h2>🏪 Tienda</h2>
        <p>👨‍💼 ¡Bienvenido!</p>

        <div id="shopItems"></div>
    `;

    const shopItems = document.getElementById("shopItems");

    storeItems.forEach((item, index) => {

        const button = document.createElement("button");

        button.textContent =
            `${item.name} — $${item.price}`;

        button.addEventListener("click", () => {
            buyItem(item);
        });

        shopItems.appendChild(button);
    });
}


function buyItem(item) {

    if (money < item.price) {
        alert("No tienes suficiente dinero 😭");
        return;
    }

    const confirmation =
        confirm(`¿De verdad quieres comprar ${item.name}?`);

    if (!confirmation) return;

    money -= item.price;

    purchasedItems.push(item.name);

    storePurchases++;

    if (item.name === "🥔") {
        potatoesBought++;
    }

    if (item.name === "💣") {
        bombUsed = true;
    }

    saveMoney();
    saveItems();

    updateHUD();
}


/* =========================================================
   DINERO
   ========================================================= */

function earnMoney(amount) {

    money += amount;

    saveMoney();
    updateHUD();
}


function saveMoney() {
    localStorage.setItem("floorFilesMoney", money);
}


function saveItems() {
    localStorage.setItem(
        "floorFilesItems",
        JSON.stringify(purchasedItems)
    );
}


/* =========================================================
   LABORATORIO
   ========================================================= */

function enterLab() {

    if (!hasMission) {

        phoneContent.innerHTML = `
            <h2>🧪 Laboratorio</h2>
            <p>👨‍🔬 Los científicos están trabajando.</p>
        `;

        return;
    }

    if (photos <= 0) {

        phoneContent.innerHTML = `
            <h2>🧪 Laboratorio</h2>
            <p>👨‍🔬 Científico: "¿Y las fotos?"</p>
        `;

        return;
    }

    if (!missionCompleted) {
        deliverPhotos();
    }
}


function deliverPhotos() {

    missionCompleted = true;

    // La bomba provoca el Bad Boy Ending.
    if (bombUsed) {
        triggerEnding("BAD BOY ENDING");
        return;
    }

    phoneContent.innerHTML = `
        <h2>🧪 Laboratorio</h2>
        <p>📸 ¡Fotos recibidas!</p>
        <p>👨‍🔬 ¡RÁPIDO, AL LABORATORIO!</p>
    `;

    setTimeout(() => {
        startFloorRestoration();
    }, 1200);
}


/* =========================================================
   CÁMARA
   ========================================================= */

function openCamera() {

    cameraUses++;

    phoneContent.innerHTML = `
        <h2>📷 Cámara</h2>
        <div id="cameraView">
            <div class="cameraFrame">
                📸
            </div>

            <button id="takePhoto">
                TOMAR FOTO
            </button>
        </div>
    `;

    document.getElementById("takePhoto")
        .addEventListener("click", takePhoto);
}


function takePhoto() {

    photos++;

    const beautiful =
        Math.random() > 0.45;

    if (beautiful) {

        beautifulPhotos++;

        earnMoney(
            Math.random() > 0.5 ? 1 : 2
        );
    }

    phoneContent.innerHTML = `
        <h2>📸 Foto tomada</h2>
        <p>La foto se guardó en la galería.</p>
        <p>Fotos: ${photos}</p>
    `;

    if (currentDay >= 2 && !hasMission) {
        hasMission = true;
    }
}


/* =========================================================
   GALERÍA
   ========================================================= */

galleryButton.addEventListener("click", openGallery);


function openGallery() {

    phoneUses++;

    phoneContent.innerHTML = `
        <h2>🖼️ Galería</h2>

        <div class="gallery">
            <div>🥔</div>
            <div>🌳</div>
            <div>☁️</div>
            <div>🏠</div>
            <div>🛣️</div>
            <div>📸</div>
        </div>

        <p>Fotos del piso: ${photos}</p>
    `;
}


/* =========================================================
   MAPAS
   ========================================================= */

mapsButton.addEventListener("click", openMaps);


function openMaps() {

    phoneUses++;

    phoneContent.innerHTML = `
        <h2>🗺️ Mapas</h2>

        <div id="phoneMap">
            🛖 Tu casa<br>
            🏪 Tienda<br>
            🧪 Laboratorio<br>
            🏠 Casas de vecinos<br>
            🛣️ Calles
        </div>
    `;
}


/* =========================================================
   PLAY STORE
   ========================================================= */

storeButton.addEventListener("click", openPlayStore);


function openPlayStore() {

    phoneUses++;

    phoneContent.innerHTML = `
        <h2>▶️ Play Store</h2>

        <div class="fakeGame">
            🟧<br>
            The Floor Files
        </div>

        <div class="fakeGame">
            🟩<br>
            Futbol sim Esqueleto
        </div>
    `;
}


/* =========================================================
   TELÉFONO
   ========================================================= */

phoneButton.addEventListener("click", openPhone);


function openPhone() {

    if (!gameRunning) return;

    phone.classList.remove("hidden");

    phoneOpened = true;
    phoneUses++;
}


closePhone.addEventListener("click", () => {

    phone.classList.add("hidden");

});


cameraButton.addEventListener("click", openCamera);


/* =========================================================
   MISIÓN
   ========================================================= */

function startMission() {

    hasMission = true;

    phoneContent.innerHTML = `
        <h2>📸 MISIÓN</h2>
        <p>Toma fotos del piso.</p>
        <p>La humanidad depende de ti.</p>
    `;
}


/* =========================================================
   DÍAS
   ========================================================= */

let timerInterval = null;

function startDay() {

    timeLeft = DAY_LENGTH;

    updateHUD();

    timerInterval = setInterval(() => {

        if (!gameRunning) return;

        timeLeft--;

        updateHUD();

        if (currentDay === 2 && timeLeft === 10) {
            startFloorDisappearance();
        }

        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            finishDay();
        }

    }, 1000);
}


function finishDay() {

    if (currentDay === 1) {

        currentDay = 2;

        hasMission = true;

        alert(
            "DÍA 2\n\n" +
            "⚠️ ALERTA ⚠️\n" +
            "El piso desaparecerá en 40 segundos."
        );

        startDay();

        return;
    }

    if (!missionCompleted) {

        calculateEnding();

    }
}


/* =========================================================
   DESAPARICIÓN DEL PISO
   ========================================================= */

function startFloorDisappearance() {

    if (floorDisappearing) return;

    floorDisappearing = true;

    const tiles =
        document.querySelectorAll(".tile");

    let step = 0;

    const disappearanceInterval =
        setInterval(() => {

            const distanceFromEdge =
                step;

            tiles.forEach(tile => {

                const x = Number(tile.dataset.x);
                const y = Number(tile.dataset.y);

                const width = mapLayout[0].length;
                const height = mapLayout.length;

                const distance =
                    Math.min(
                        x,
                        y,
                        width - 1 - x,
                        height - 1 - y
                    );

                if (distance === distanceFromEdge) {
                    tile.classList.add("gone");
                }
            });

            step++;

            if (step > 3) {
                clearInterval(disappearanceInterval);
            }

        }, 700);
}


function isFloorGone(x, y) {

    const tile = document.querySelector(
        `.tile[data-x="${x}"][data-y="${y}"]`
    );

    return tile && tile.classList.contains("gone");
}


function checkFloorDanger() {

    if (
        floorDisappearing &&
        isFloorGone(playerX, playerY)
    ) {
        triggerEnding("BAD ENDING");
    }
}


/* =========================================================
   RECUPERACIÓN DEL PISO
   ========================================================= */

function startFloorRestoration() {

    floorRestoring = true;

    const tiles =
        Array.from(document.querySelectorAll(".tile"));

    let step = 3;

    const restorationInterval =
        setInterval(() => {

            tiles.forEach(tile => {

                const x = Number(tile.dataset.x);
                const y = Number(tile.dataset.y);

                const width = mapLayout[0].length;
                const height = mapLayout.length;

                const distance =
                    Math.min(
                        x,
                        y,
                        width - 1 - x,
                        height - 1 - y
                    );

                if (distance === step) {
                    tile.classList.remove("gone");
                }
            });

            step--;

            if (step < 0) {

                clearInterval(restorationInterval);

                floorDisappearing = false;
                floorRestoring = false;

                setTimeout(() => {
                    triggerEnding("GOOD ENDING");
                }, 1000);
            }

        }, 700);
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


/* =========================================================
   SELECCIÓN DE ENDING
   ========================================================= */

let lastEnding = null;

function calculateEnding() {

    // No hacer absolutamente nada.
    if (
        !playerMoved &&
        !phoneOpened &&
        !playerInteracted &&
        photos === 0
    ) {
        triggerEnding("SECRET ENDING");
        return;
    }

    // Muchas condiciones a la vez.
    const conditions = [];

    if (money >= 20) conditions.push("money");
    if (potatoesBought >= 3) conditions.push("potatoes");
    if (phoneUses >= 8) conditions.push("phone");
    if (beautifulPhotos >= 5) conditions.push("photographer");
    if (storePurchases >= storeItems.length) conditions.push("shopping");
    if (photos === 0 && missionCompleted === false) conditions.push("trash");

    if (conditions.length >= 3) {
        triggerEnding("??? ENDING");
        return;
    }

    if (potatoesBought >= 5) {
        triggerEnding("PATATA ENDING");
        return;
    }

    if (storePurchases >= storeItems.length) {
        triggerEnding("SHOPPING ENDING");
        return;
    }

    if (phoneUses >= 8) {
        triggerEnding("PHONE ADDICT ENDING");
        return;
    }

    if (beautifulPhotos >= 5) {
        triggerEnding("PHOTOGRAPHER ENDING");
        return;
    }

    if (money >= 20) {
        triggerEnding("CAPITALISM ENDING");
        return;
    }

    triggerEnding("BAD ENDING");
}


/* =========================================================
   MOSTRAR ENDING
   ========================================================= */

function triggerEnding(endingName) {

    if (!gameRunning) return;

    gameRunning = false;

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    game.classList.add("hidden");
    phone.classList.add("hidden");

    endingScreen.classList.remove("hidden");

    endingTitle.textContent = endingName;

    const possibleTexts =
        endings[endingName] || [
            "Bueno... pasó algo."
        ];

    let selectedText =
        possibleTexts[
            Math.floor(Math.random() * possibleTexts.length)
        ];

    // Evita repetir la misma frase inmediatamente.
    if (
        selectedText === lastEnding &&
        possibleTexts.length > 1
    ) {
        selectedText =
            possibleTexts.find(
                text => text !== lastEnding
            );
    }

    lastEnding = selectedText;

    endingText.textContent = selectedText;
}


/* =========================================================
   REINICIO
   ========================================================= */

restartButton.addEventListener("click", restartGame);


function restartGame() {

    currentDay = 1;
    timeLeft = DAY_LENGTH;

    photos = 0;
    beautifulPhotos = 0;

    phoneUses = 0;
    cameraUses = 0;
    storePurchases = 0;
    potatoesBought = 0;

    hasMission = false;
    missionCompleted = false;

    floorDisappearing = false;
    floorRestoring = false;

    bombUsed = false;

    playerMoved = false;
    playerInteracted = false;
    phoneOpened = false;

    playerX = 1;
    playerY = 5;

    document
        .querySelectorAll(".tile")
        .forEach(tile => {
            tile.classList.remove("gone");
        });

    updatePlayerPosition();

    endingScreen.classList.add("hidden");
    menu.classList.add("hidden");
    game.classList.remove("hidden");

    gameRunning = true;

    startDay();
    updateHUD();
}


/* =========================================================
   HUD
   ========================================================= */

function updateHUD() {

    dayDisplay.textContent =
        `Día ${currentDay}`;

    moneyDisplay.textContent =
        `$${money}`;

    timerDisplay.textContent =
        timeLeft;
}


/* =========================================================
   INICIO
   ========================================================= */

startButton.addEventListener("click", () => {

    menu.classList.add("hidden");
    game.classList.remove("hidden");

    gameRunning = true;

    currentDay = 1;
    timeLeft = DAY_LENGTH;

    updateHUD();
    startDay();
});


/* =========================================================
   INICIO DE MISIÓN
   ========================================================= */

setTimeout(() => {

    if (gameRunning && currentDay === 1) {
        // La misión se activa al comenzar el día 2.
    }

}, 100);


/* =========================================================
   FIN DEL ARCHIVO
   ========================================================= */
