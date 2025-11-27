// --- 1. INITIALIZATION & EASTER EGGS ---
document.addEventListener('DOMContentLoaded', () => {
    // Speech Warmup
    let speechApiWarmedUp = false;
    function warmUpSpeechAPI() {
        if (speechApiWarmedUp || !window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance("");
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
        window.speechSynthesis.getVoices();
        speechApiWarmedUp = true;
    }
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('mousedown', warmUpSpeechAPI);
    });

    // EASTER EGG 1: THE CLICKER (TEST MODE: Click logo 3 times)
    let logoClicks = 0;
    const logoHeader = document.getElementById('logo-header');
    if (logoHeader) {
        logoHeader.addEventListener('click', () => {
            logoClicks++;
            // --- CHANGED: Now awards after 3 clicks (instead of 10) ---
            if (logoClicks === 3) {
                if (window.StickerManager) {
                    window.StickerManager.awardSticker('clicker_owl');
                }
            }
        });
    }

    // EASTER EGG 2: NIGHT OWL (TEST MODE: Always awards)
    // --- CHANGED: Removed time check for immediate testing ---
    setTimeout(() => {
        if (window.StickerManager) {
            window.StickerManager.awardSticker('night_owl');
        }
    }, 1000);
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW fail', err));
    });
}

// --- 2. STICKER BOOK LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const stickerOverlay = document.getElementById('sticker-overlay');
    const stickerGrid = document.getElementById('sticker-grid');

    if (!stickerOverlay || !stickerGrid) return;

    const contentContainer = stickerOverlay.children[0];
    let playModeStage = null;
    let playModeLayer = null;

    const openBtn = document.getElementById('open-sticker-book');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            stickerOverlay.style.display = 'flex';
            renderStickers();
        });
    }

    const closeBtn = document.getElementById('close-sticker-book');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            stickerOverlay.style.display = 'none';
        });
    }

    // Reset Logic
    const resetBtn = document.getElementById('reset-stickers-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete all stickers and start over?")) {
                localStorage.removeItem('klh_sticker_inventory');
                if (playModeLayer) playModeLayer.destroyChildren();
                if (playModeStage) playModeStage.draw();
                renderStickers();
            }
        });
    }

    // Toggle Play Mode
    const togglePlayBtn = document.getElementById('toggle-play-mode');
    if (togglePlayBtn) {
        togglePlayBtn.addEventListener('click', () => {
            contentContainer.classList.toggle('play-mode-active');
            const isPlayMode = contentContainer.classList.contains('play-mode-active');
            togglePlayBtn.textContent = isPlayMode ? "Back to Grid" : "🎨 Play Mode";

            if (isPlayMode) {
                initPlayMode();
            }
        });
    }

    function renderStickers() {
        stickerGrid.innerHTML = '';
        if (!window.StickerManager) return;

        const allStickers = window.StickerManager.getStickerData();
        const myStickers = window.StickerManager.getInventory();

        // Update Progress Bar
        const total = Object.keys(allStickers).length;
        const earned = myStickers.length;
        const pct = Math.round((earned / total) * 100);
        const bar = document.getElementById('sticker-progress-bar');
        if (bar) {
            bar.style.width = `${pct}%`;
            bar.textContent = `${earned} / ${total} Found`;
        }

        // Render Grid
        for (const [key, data] of Object.entries(allStickers)) {
            const isOwned = myStickers.includes(key);
            const slot = document.createElement('div');
            const iconClass = isOwned ? '' : 'sticker-locked';

            slot.className = 'sticker-slot';
            slot.style.cssText = `
                width: 100px; height: 120px; display:flex; flex-direction:column;
                align-items:center; justify-content:center; border-radius:15px;
                background: ${isOwned ? '#fff' : '#f0f0f0'};
                border: 3px solid ${isOwned ? data.color : '#ccc'};
                box-shadow: ${isOwned ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'};
            `;

            slot.innerHTML = `
                <div class="${iconClass}" style="font-size: 50px; transition: transform 0.2s;">
                    ${data.icon}
                </div>
                <span style="
                    font-family:'Comic Neue'; 
                    font-weight:bold; 
                    margin-top:2px; 
                    font-size:0.6em; 
                    color:#333; 
                    text-align:center; 
                    line-height:1.1; 
                    width: 100%;
                    padding: 0 2px;
                    box-sizing: border-box;
                ">
                    ${isOwned ? data.name : '???'}
                </span>
            `;

            // Click to Speak & Add to Canvas
            if (isOwned) {
                slot.addEventListener('click', () => {
                    // Bounce Animation
                    slot.classList.add('bounce');
                    setTimeout(() => slot.classList.remove('bounce'), 500);

                    // Speech
                    if (window.speakText) window.speakText(data.speech || data.name);

                    // If in play mode, add to canvas
                    if (contentContainer.classList.contains('play-mode-active')) {
                        addToCanvas(data.icon);
                    }
                });
            }

            stickerGrid.appendChild(slot);
        }
    }

    // --- 3. KONVA PLAY MODE ---
    function initPlayMode() {
        const container = document.getElementById('sticker-canvas-container');
        if (!container) return;

        if (!playModeStage) {
            playModeStage = new Konva.Stage({
                container: 'play-canvas',
                width: container.clientWidth,
                height: container.clientHeight
            });

            // 1. Background Layer (Scenery)
            const bgLayer = new Konva.Layer();
            playModeStage.add(bgLayer);

            // Sky
            const sky = new Konva.Rect({
                width: playModeStage.width(),
                height: playModeStage.height(),
                fill: '#E3F2FD' // Light Blue
            });
            bgLayer.add(sky);

            // Ground
            const groundHeight = 150; // Taller ground
            const ground = new Konva.Rect({
                x: 0,
                y: playModeStage.height() - groundHeight,
                width: playModeStage.width(),
                height: groundHeight,
                fill: '#C8E6C9' // Light Green
            });
            bgLayer.add(ground);

            // Sun
            const sun = new Konva.Circle({
                x: playModeStage.width() - 80,
                y: 80,
                radius: 50,
                fill: '#FFF59D',
                shadowBlur: 20,
                shadowColor: '#FFD54F',
                opacity: 0.9
            });
            bgLayer.add(sun);

            // --- SILHOUETTES (SCENERY) ---

            // 1. House
            Konva.Image.fromURL('ShapesAndColors/images/puzzle-house.png', function (houseNode) {
                const h = 180;
                const w = h * (houseNode.width() / houseNode.height());
                houseNode.setAttrs({
                    x: 40,
                    y: playModeStage.height() - groundHeight - h + 20, // Sits on ground
                    width: w,
                    height: h,
                    opacity: 0.7, // Semi-transparent silhouette
                });
                bgLayer.add(houseNode);
            });

            // 2. Train (Added as per plan)
            Konva.Image.fromURL('ShapesAndColors/images/puzzle-train.png', function (trainNode) {
                const h = 120;
                const w = h * (trainNode.width() / trainNode.height());
                trainNode.setAttrs({
                    x: playModeStage.width() - w - 40,
                    y: playModeStage.height() - groundHeight - h + 20,
                    width: w,
                    height: h,
                    opacity: 0.7,
                });
                bgLayer.add(trainNode);
            });


            // 2. Sticker Layer (Draggable Items)
            playModeLayer = new Konva.Layer();
            playModeStage.add(playModeLayer);

            // Resize listener to keep background covering full area
            new ResizeObserver(() => {
                if (!playModeStage) return;
                const w = container.clientWidth;
                const h = container.clientHeight;
                playModeStage.width(w);
                playModeStage.height(h);
                sky.width(w); sky.height(h);
                ground.y(h - groundHeight); ground.width(w);
                sun.x(w - 80);
            }).observe(container);
        }
    }

    function addToCanvas(iconChar) {
        if (!playModeStage) return;
        // Add random position in the "sky" area mostly
        const x = playModeStage.width() / 2 + (Math.random() * 100 - 50);
        const y = playModeStage.height() / 3 + (Math.random() * 60 - 30);
        addKonvaSticker(iconChar, x, y);
    }

    function addKonvaSticker(iconChar, x, y) {
        const textNode = new Konva.Text({
            x: x,
            y: y,
            text: iconChar,
            fontSize: 70, // Bigger stickers
            draggable: true,
            shadowColor: 'black',
            shadowBlur: 2,
            shadowOpacity: 0.2,
            shadowOffset: { x: 2, y: 2 }
        });

        textNode.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
            this.scale({ x: 1.1, y: 1.1 });
            playModeLayer.batchDraw();
        });
        textNode.on('mouseout', function () {
            document.body.style.cursor = 'default';
            this.scale({ x: 1, y: 1 });
            playModeLayer.batchDraw();
        });
        textNode.on('click tap', function () {
            this.moveToTop();
        });

        // Double tap to remove
        textNode.on('dblclick dbltap', function () {
            this.destroy();
            playModeLayer.batchDraw();
        });

        playModeLayer.add(textNode);
        playModeLayer.batchDraw();
    }
});
