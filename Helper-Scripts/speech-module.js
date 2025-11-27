/*
 * =================================================================
 * MASTER SPEECH & AUDIO MODULE
 * Includes: TTS Fixes, Audio Unlocking, and Global Music Player
 * =================================================================
 */

// --- PART 1: ROBUST SPEECH SYNTHESIS LOGIC ---

window.voiceList = [];
window.preferredVoice = null;

/**
 * Loads voices and picks the best "human-sounding" one for the platform.
 */
window.loadVoices = function() {
    if (window.voiceList.length > 0) return;
    
    window.voiceList = window.speechSynthesis.getVoices();

    if (window.voiceList.length > 0) {
        window.preferredVoice = null; 

        // 1. Saved Preference
        const savedName = localStorage.getItem('klh_preferred_voice');
        if (savedName) {
            window.preferredVoice = window.voiceList.find(v => v.name === savedName);
        }

        // 2. Windows "Natural" Voices
        if (!window.preferredVoice) {
            const winHighQuality = ['Natural', 'Online', 'Google US English'];
            window.preferredVoice = window.voiceList.find(v => 
                v.lang.startsWith('en') && 
                winHighQuality.some(keyword => v.name.includes(keyword))
            );
        }

        // 3. iOS High-Quality Favorites
        if (!window.preferredVoice) {
            const iosFavorites = ['Samantha', 'Daniel', 'Karen', 'Moira', 'Rishi', 'Tessa'];
            window.preferredVoice = window.voiceList.find(v => 
                v.lang.startsWith('en') && iosFavorites.includes(v.name)
            );
        }

        // 4. iOS "Enhanced" / "Siri"
        if (!window.preferredVoice) {
            window.preferredVoice = window.voiceList.find(v => 
                v.lang.startsWith('en') && 
                (v.name.includes('Enhanced') || v.name.includes('Siri'))
            );
        }

        // 5. Fallbacks
        if (!window.preferredVoice) {
            window.preferredVoice = window.voiceList.find(v => v.lang === 'en-US' && v.default);
        }
        if (!window.preferredVoice) {
            window.preferredVoice = window.voiceList.find(v => v.lang === 'en-US');
        }
    }
};

window.loadVoices();
window.speechSynthesis.onvoiceschanged = window.loadVoices;

/**
 * Speaks text with "Audio Ducking" for music and platform fixes.
 */
window.speakText = function(text, onEndCallback) {
    window.speechSynthesis.cancel();

    // --- 1. MUSIC DUCKING (Lower volume while speaking) ---
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic && !bgMusic.paused) {
        bgMusic.volume = 0.1; // Lower to 10%
    }

    // --- 2. BROWSER FIXES ---
    if (window.voiceList.length === 0) window.loadVoices();

    // Windows Wake-Up Primer
    if (navigator.platform.indexOf('Win') > -1) {
        const primer = new SpeechSynthesisUtterance("_");
        primer.volume = 0.01; 
        primer.rate = 10;
        window.speechSynthesis.speak(primer);
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // iOS Pitch/Rate Adjustments
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
        utterance.rate = 1.05; 
        utterance.pitch = 1.1; 
    } else {
        utterance.rate = 0.9; 
        utterance.pitch = 1.0;
    }

    // Voice Selection
    if (window.preferredVoice) {
        utterance.voice = window.preferredVoice;
        utterance.lang = window.preferredVoice.lang; 
    } else {
        utterance.lang = 'en-US';
    }

    // --- 3. RESTORE MUSIC ON END ---
    const restoreMusic = () => {
        if (bgMusic && !bgMusic.paused) {
            bgMusic.volume = 0.5; // Restore to 50%
        }
        if (onEndCallback) onEndCallback();
    };

    utterance.onend = restoreMusic;
    utterance.onerror = restoreMusic; // Safety fallback

    window.speechSynthesis.speak(utterance);
};


// --- PART 2: AUDIO UNLOCKER ---
;(function globalUnlockSpeech() {
  async function resumeAudio() {
    try {
      const context = (window.__unlockAudioContext && window.__unlockAudioContext.context) || new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended') await context.resume();
      const buffer = context.createBuffer(1, 1, context.sampleRate);
      const src = context.createBufferSource();
      src.buffer = buffer;
      src.connect(context.destination);
      src.start(0);
      return true;
    } catch (e) { return false; }
  }

  function speakUnlockUtterance() {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(false); return; }
      const utter = new SpeechSynthesisUtterance(' ');
      utter.volume = 0;
      utter.onend = () => resolve(true);
      window.speechSynthesis.speak(utter);
      setTimeout(() => resolve(true), 500);
    });
  }

  window.unlockSpeechIfNeeded = function() {
    return new Promise((resolve) => {
      const tryUnlock = async () => {
        await resumeAudio();
        await speakUnlockUtterance();
        document.removeEventListener('click', tryUnlock);
        document.removeEventListener('touchstart', tryUnlock);
        resolve(true);
      };
      document.addEventListener('click', tryUnlock);
      document.addEventListener('touchstart', tryUnlock);
    });
  };
})();


// --- PART 3: GLOBAL MUSIC PLAYER (Auto-Injected) ---
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('bg-music')) return; // Prevent duplicate

        // 1. PATH LOGIC: Check if we are in a game subfolder
        const path = window.location.pathname;
        const needsPrefix = path.includes('/Alphabet/') || path.includes('/Number/') || 
                            path.includes('/Coloring/') || path.includes('/Spelling/') || 
                            path.includes('/ShapesAndColors/') || path.includes('/VideoTime/');
        
        const prefix = needsPrefix ? '../' : '';

        // 2. DEFINE SONGS
        const SONG_LIST = [
            prefix + 'music/song1.mp3',
            prefix + 'music/song2.mp3',
            prefix + 'music/song3.mp3'
        ];

        // 3. INJECT HTML
        const audio = document.createElement('audio');
        audio.id = 'bg-music';
        document.body.appendChild(audio);

        const btn = document.createElement('button');
        btn.id = 'music-toggle-btn';
        btn.className = 'music-btn';
        btn.title = 'Toggle Music';
        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        
        // --- CHANGE: ALWAYS Apply Styles via JS (No CSS file needed) ---
        btn.style.cssText = `
            position: fixed; 
            top: 80px; 
            right: 20px; 
            width: 50px; 
            height: 50px; 
            border-radius: 50%; 
            border: 2px solid #ccc; 
            background: #f44336; 
            color: white; 
            font-size: 1.5em; 
            cursor: pointer; 
            z-index: 2000; 
            display: flex; 
            justify-content: center; 
            align-items: center;
            transition: background-color 0.3s, transform 0.1s;
        `;
        
        // Add hover/active effects via event listeners since inline CSS can't do :hover
        btn.onmouseenter = () => btn.style.transform = 'scale(1.05)';
        btn.onmouseleave = () => btn.style.transform = 'scale(1)';
        btn.onmousedown = () => btn.style.transform = 'scale(0.9)';
        btn.onmouseup = () => btn.style.transform = 'scale(1.05)';

        document.body.appendChild(btn);

        // 4. PLAYER LOGIC
        let currentSongIndex = parseInt(localStorage.getItem('klh_music_index') || '0');
        let savedTime = parseFloat(localStorage.getItem('klh_music_time') || '0');
        let shouldPlay = localStorage.getItem('klh_music_playing') === 'true';

        if (currentSongIndex >= SONG_LIST.length) currentSongIndex = 0;

        audio.src = SONG_LIST[currentSongIndex];
        audio.volume = 0.3;

        if (savedTime > 0) audio.currentTime = savedTime;

        function updateButton() {
            if (!audio.paused) {
                btn.innerHTML = '<i class="fas fa-music"></i>';
                btn.style.background = '#4CAF50'; // Green
                localStorage.setItem('klh_music_playing', 'true');
            } else {
                btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                btn.style.background = '#f44336'; // Red
                localStorage.setItem('klh_music_playing', 'false');
            }
        }

        // Auto-play attempt
        if (shouldPlay) {
            const p = audio.play();
            if (p) {
                p.then(updateButton).catch(() => {
                    const resume = () => { audio.play(); updateButton(); };
                    document.addEventListener('click', resume, { once: true });
                });
            }
        }

        // Toggle
        btn.addEventListener('click', () => {
            if (audio.paused) audio.play();
            else audio.pause();
            updateButton();
        });

        // Next Song
        audio.addEventListener('ended', () => {
            currentSongIndex = (currentSongIndex + 1) % SONG_LIST.length;
            audio.src = SONG_LIST[currentSongIndex];
            audio.play();
            localStorage.setItem('klh_music_index', currentSongIndex);
        });

        // Save Position
        setInterval(() => {
            if (!audio.paused) localStorage.setItem('klh_music_time', audio.currentTime);
        }, 1000);
    });
})();

// --- VISUAL EFFECTS ---
window.playConfettiEffect = function() {
    // ... (Use previous confetti code here if needed, omitted for brevity but should be kept) ...
    // For full file integrity, ensure the Confetti/Burst functions from previous turn are kept here.
    // I will output the full file if you want, but assuming you have the confetti code, just append it.
    // For safety, here is the standard confetti logic to ensure it's not lost:
    
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const parts = [];
    const colors = ['#f44336','#2196F3','#4CAF50','#FFEB3B'];
    for(let i=0; i<100; i++) parts.push({
        x: Math.random()*w, y: Math.random()*h-h, vx: Math.random()*2-1, vy: Math.random()*3+2,
        color: colors[Math.floor(Math.random()*colors.length)], size: Math.random()*10+5
    });
    let start = Date.now();
    function loop() {
        if(Date.now()-start > 5000) { canvas.remove(); return; }
        ctx.clearRect(0,0,w,h);
        parts.forEach(p=>{
            p.x+=p.vx; p.y+=p.vy;
            ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.size,p.size);
            if(p.y>h) p.y=-20;
        });
        requestAnimationFrame(loop);
    }
    loop();
};

window.playBurstEffect = function(el) {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width/2;
    const y = rect.top + rect.height/2;
    for(let i=0; i<20; i++) {
        const p = document.createElement('div');
        p.className = 'burst-particle'; // Ensure CSS exists
        p.style.cssText = `position:fixed;left:${x}px;top:${y}px;z-index:1000;font-size:20px;pointer-events:none`;
        p.innerHTML = ['★','●','▲'][Math.floor(Math.random()*3)];
        p.style.color = ['#f44336','#2196F3','#4CAF50'][Math.floor(Math.random()*3)];
        document.body.appendChild(p);
        
        const angle = Math.random()*Math.PI*2;
        const dist = 50 + Math.random()*50;
        const dx = Math.cos(angle)*dist;
        const dy = Math.sin(angle)*dist;
        
        p.animate([
            {transform: 'translate(0,0) scale(0.5)', opacity:1},
            {transform: `translate(${dx}px, ${dy}px) scale(1.2)`, opacity:0}
        ], {duration: 800, easing: 'ease-out'}).onfinish = () => p.remove();
    }
};