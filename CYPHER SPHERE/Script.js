// =========================================================================
// 0. MATRIX RAIN BACKGROUND EFFECT 
// =========================================================================

function startMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const binary = "01";
    const font_size = 18;
    const columns = canvas.width / font_size;
    
    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    function draw() {
        // Subtle background fill
        ctx.fillStyle = 'rgba(7, 6, 13, 0.05)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Get the color from CSS variable for consistency
        const matrixColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-neon') || '#10b981';
        ctx.fillStyle = matrixColor; 
        ctx.font = font_size + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = binary[Math.floor(Math.random() * binary.length)];
            ctx.fillText(text, i * font_size, drops[i] * font_size);

            if (drops[i] * font_size > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    // Run the animation loop
    setInterval(draw, 50); 
}


// =========================================================================
// 1. Core Cipher Implementations (Local Ciphers: 1, 2)
// =========================================================================

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// --- CAESAR CIPHER (Local) ---
function caesar(text, shift, decrypt = false) {
    shift = parseInt(shift);
    if (isNaN(shift)) shift = 0; 

    if (decrypt) {
        shift = 26 - (shift % 26);
    }
    let result = "";
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (char >= "A" && char <= "Z") {
            let start = "A".charCodeAt(0);
            let charCode = char.charCodeAt(0);
            result += String.fromCharCode(((charCode - start + shift) % 26) + start);
        } else if (char >= "a" && char <= "z") {
            let start = "a".charCodeAt(0);
            let charCode = char.charCodeAt(0);
            result += String.fromCharCode(((charCode - start + shift) % 26) + start);
        } else {
            result += char; 
        }
    }
    return result;
}

// --- SUBSTITUTION CIPHER (Local) ---
function substitution(text, key, decrypt = false) {
    const keyMap = key.toUpperCase();
    let result = "";
    
    if (new Set(keyMap.split('')).size !== 26) {
        throw new Error("Substitution key must contain 26 unique characters.");
    }
    
    const standardAlphabet = ALPHABET;

    if (decrypt) {
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            let upperChar = char.toUpperCase();
            let isUpperCase = char === upperChar && char >= 'A' && char <= 'Z';

            let index = keyMap.indexOf(upperChar);
            if (index !== -1) {
                let plainChar = standardAlphabet[index];
                result += isUpperCase ? plainChar : plainChar.toLowerCase();
            } else {
                result += char;
            }
        }
    } else {
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            let upperChar = char.toUpperCase();
            let isUpperCase = char === upperChar && char >= 'A' && char <= 'Z';

            let index = standardAlphabet.indexOf(upperChar);
            if (index !== -1) {
                let cipherChar = keyMap[index];
                result += isUpperCase ? cipherChar : cipherChar.toLowerCase();
            } else {
                result += char;
            }
        }
    }
    return result;
}


// =========================================================================
// 2. Application State Management and Icons
// =========================================================================

const CipherIcons = {
    '1': `<svg class="w-6 h-6 text-secondary-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>`, 
    '2': `<svg class="w-6 h-6 text-secondary-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V9a2 2 0 012-2h2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-1.414 1.414M6.343 17.657L4.929 19.071M20.707 7.05L19.293 8.464M3.293 16.95L4.707 15.536M10.5 4.75V3M13.5 4.75V3M4 12H2M22 12H20M13.5 19.25V21M10.5 19.25V21"></path></svg>`,
    '3': `<svg class="w-6 h-6 text-secondary-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"></path></svg>`,
    '4': `<svg class="w-6 h-6 text-secondary-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>`,
    '5': `<svg class="w-6 h-6 text-secondary-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-4m-2 2h4M9 7V3m0 4h4M9 7h4M12 3v18"></path></svg>`,
    '6': `<svg class="w-6 h-6 text-secondary-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m-2 4h4a2 2 0 002-2v-4a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 002 2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 9.75l-4.5 4.5M4.5 9.75l4.5 4.5M10.5 4.5h3"></path></svg>`,
    '7': `<svg class="w-6 h-6 text-secondary-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2zm0 0l-3-3m3 3l3-3m-6-3h6a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z"></path></svg>`,
    '8': `<svg class="w-6 h-6 text-secondary-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>`,
    '9': `<svg class="w-6 h-6 text-secondary-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`,
};

const Ciphers = {
    '1': { name: 'Caesar Cipher', keyLabel: 'Shift (0-25)', keyPlaceholder: 'e.g., 3' },
    '2': { name: 'Substitution Cipher', keyLabel: 'Substitution Key (26 unique letters)', keyPlaceholder: 'e.g., QWERTYUIOPASDFGHJKLZXCVBNM' },
    '3': { name: 'Playfair Cipher', keyLabel: 'Key Phrase', keyPlaceholder: 'e.g., MONARCHY' },
    '4': { name: 'Hill Cipher (2x2)', keyLabel: 'Key (4 letters, invertible)', keyPlaceholder: 'e.g., TEST' },
    '5': { name: 'Simple Block Cipher (TEA)', keyLabel: 'Key (16 bytes)', keyPlaceholder: 'e.g., 16BYTE_TEA_KEY' },
    '6': { name: 'DES', keyLabel: 'Key (8 bytes)', keyPlaceholder: 'e.g., DESKEY8!' },
    '7': { name: '3DES', keyLabel: 'Key (24 bytes)', keyPlaceholder: 'e.g., KEY1KEY2KEY3KEY4KEY5KEY6' },
    '8': { name: 'AES-128', keyLabel: 'Key (16 bytes)', keyPlaceholder: 'e.g., AES128BITKEY16' },
    '9': { name: 'RSA (Asymmetric)', keyLabel: 'Public/Private Key', keyPlaceholder: 'Key will be loaded automatically. You may paste a different key if needed.' }, 
};

let appState = {
    selectedCipher: null,
    operationType: 'encrypt',
    // Store all output formats from the server
    serverOutput: {
        base64_output: '',
        hex_output: '',
        plaintext_output: ''
    },
    outputFormat: 'base64', 
    rsaKeys: { 
        public_key: '',
        private_key: ''
    }
};

function updateAppState(newState) {
    appState = { ...appState, ...newState };
    renderApp();
}

// =========================================================================
// 3. Rendering and UI Functions
// =========================================================================

function renderApp() {
    const container = document.getElementById('app-container');
    if (!container) return; 

    container.innerHTML = ''; // Clear previous content

    if (!appState.selectedCipher) {
        renderCipherSelection(container);
    } else {
        // Render operation interface
        const interfaceHTML = renderOperationInterface();
        container.innerHTML = interfaceHTML; 
        
        // Setup event listeners and initial values after rendering HTML
        setupOperationInterfaceEvents();
    }
}

function renderCipherSelection(container) {
    const selectionHTML = `
        <div class="max-w-4xl mx-auto">
            <h1 class="text-4xl font-extrabold text-white text-center mb-12 border-b border-primary-neon/50 pb-4">
                <span class="text-primary-neon">Select</span> Encryption Algorithm
            </h1>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${Object.entries(Ciphers).map(([id, cipher]) => `
                    <div class="p-6 rounded-xl border border-primary-neon/30 bg-bg-dark/70 shadow-neon-glow-hover cursor-pointer transition-all hover:border-secondary-neon/50"
                        onclick="handleCipherSelection('${id}')">
                        <div class="flex items-center space-x-3 mb-2">
                            ${CipherIcons[id]}
                            <h2 class="text-xl font-semibold text-text-light">${id}. ${cipher.name}</h2>
                        </div>
                        <p class="text-gray-400 mt-2 text-sm">${id <= 4 ? 'Classical Cipher' : (id == 9 ? 'Asymmetric Cipher' : 'Modern Block Cipher')}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    container.innerHTML = selectionHTML;
}

function renderOperationInterface() {
    const cipher = Ciphers[appState.selectedCipher];
    const { operationType } = appState;
    const isEncrypt = operationType === 'encrypt';
    const isBlockCipher = appState.selectedCipher > '2' && appState.selectedCipher !== '3' && appState.selectedCipher !== '4'; 

    return `
        <div class="max-w-4xl mx-auto bg-bg-dark/70 p-8 rounded-xl shadow-neon-glow border border-primary-neon/30">
            <div class="flex justify-between items-center mb-8 border-b border-primary-neon/50 pb-4">
                <h1 class="text-3xl font-extrabold text-secondary-neon flex items-center space-x-2">
                    ${CipherIcons[appState.selectedCipher]}
                    <span>${cipher.name}</span>
                </h1>
                <button onclick="handleReset()" class="text-sm text-gray-400 hover:text-text-light transition-colors flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path></svg>
                    <span>Back to Cipher Select</span>
                </button>
            </div>

            <div class="mb-6 flex space-x-4">
                <button onclick="handleOperationTypeSelection('encrypt')"
                    class="py-2 px-6 rounded-lg text-sm font-medium transition-all ${isEncrypt ? 'bg-primary-neon text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}">
                    ENCRYPT
                </button>
                <button onclick="handleOperationTypeSelection('decrypt')"
                    class="py-2 px-6 rounded-lg text-sm font-medium transition-all ${!isEncrypt ? 'bg-primary-neon text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}">
                    DECRYPT
                </button>
            </div>

            <form id="cipher-form" class="space-y-6" onsubmit="handleFormSubmit(event)">
                
                <div>
                    <label for="input-text" class="block text-sm font-medium text-text-light mb-2">
                        ${isEncrypt ? 'Input Plaintext' : 'Input Ciphertext (Base64 for Block Ciphers)'}
                    </label>
                    <textarea id="input-text" name="text" rows="7" required
                        class="w-full p-4 bg-[#14121a] border border-primary-neon/50 rounded-lg text-text-light input-focus-neon font-mono"
                        placeholder="${isEncrypt ? 'Enter the text to be encrypted (Max 128 characters for RSA)...' : 'Enter the text to be decrypted...'}"></textarea>
                </div>

                <div>
                    <label for="key-input" class="block text-sm font-medium text-text-light mb-2">
                        ${cipher.keyLabel}
                    </label>
                    <input type="text" id="key-input" name="key" required
                        class="w-full p-4 bg-[#14121a] border border-primary-neon/50 rounded-lg text-text-light input-focus-neon font-mono"
                        placeholder="${cipher.keyPlaceholder}"
                        ${appState.selectedCipher !== '9' ? 'oninput="updateKeyStrengthIndicator(this.value)"' : ''} > ${appState.selectedCipher !== '9' ? `
                        <div class="mt-2 text-xs">
                            <p class="text-gray-400 mb-1">Key Strength: <span id="key-strength-label" class="font-bold text-white">Enter Key</span></p>
                            <div class="h-1.5 w-full bg-gray-700 rounded-full">
                                <div id="key-strength-indicator" class="h-full rounded-full transition-all duration-300 bg-gray-500" style="width: 0%;"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <button type="submit" id="submit-btn"
                    class="w-full py-3 px-4 rounded-lg shadow-neon-glow text-lg font-bold text-white bg-secondary-neon hover:bg-secondary-neon/80 transition-all focus:outline-none focus:ring-4 focus:ring-secondary-neon/50 flex items-center justify-center space-x-2">
                    <span id="submit-text">${isEncrypt ? 'ENCRYPT DATA' : 'DECRYPT DATA'}</span>
                    <div id="loading-spinner" class="spinner mx-auto hidden"></div>
                </button>
            </form>
            
            <div id="progress-container" class="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden hidden">
                <div id="progress-bar" class="h-full bg-secondary-neon transition-all duration-300 ease-in-out" style="width: 0%;"></div>
            </div>

            <div class="mt-8 pt-6 border-t border-primary-neon/20">
                <label class="block text-sm font-medium text-secondary-neon mb-3">
                    Output: ${isEncrypt ? 'Ciphertext' : 'Plaintext'}
                </label>
                
                ${isEncrypt && isBlockCipher ? `
                    <div class="flex space-x-2 mb-3">
                        <button id="output-btn-base64" onclick="switchOutputFormat('base64')" 
                            class="py-1 px-3 text-xs rounded-full transition-all ${appState.outputFormat === 'base64' ? 'bg-primary-neon text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}">
                            Base64
                        </button>
                        <button id="output-btn-hex" onclick="switchOutputFormat('hex')" 
                            class="py-1 px-3 text-xs rounded-full transition-all ${appState.outputFormat === 'hex' ? 'bg-primary-neon text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}">
                            Hexadecimal
                        </button>
                    </div>
                ` : ''}

                <div id="output-container" 
                     class="w-full p-4 bg-[#14121a] border border-secondary-neon/50 rounded-lg font-mono text-sm max-h-64 overflow-auto output-console-style">
                    <pre id="output-text" class="whitespace-pre-wrap text-secondary-neon/80">Awaiting input...</pre>
                </div>
                
                <button onclick="copyOutputTextToClipboard()"
                    class="mt-3 py-2 px-6 rounded-lg text-sm font-medium text-primary-neon border border-primary-neon hover:bg-primary-neon hover:text-white transition-all">
                    Copy Output
                </button>
            </div>
            
            <div id="message-container" class="mt-4 p-3 rounded-lg text-sm hidden"></div>
        </div>

        ${appState.selectedCipher === '9' ? renderRsaKeyDashboard() : ''}
    `;
}


// --- RSA Key Dashboard Renderer ---
function renderRsaKeyDashboard() {
    return `
        <div class="max-w-4xl mx-auto mt-12 pt-8 border-t border-primary-neon/20">
            <h2 class="text-2xl font-bold text-primary-neon mb-4">RSA Key Management (1024-bit)</h2>
            <div class="space-y-6">
                <div class="bg-bg-dark/70 p-4 rounded-lg border border-secondary-neon/30">
                    <h3 class="text-lg font-medium text-text-light mb-2 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-secondary-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V9a2 2 0 012-2h2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a4 4 0 00-4-4H9a4 4 0 00-4 4v2"></path></svg>
                        Public Key (For Encryption)
                    </h3>
                    <textarea id="rsa-public-key" rows="8" readonly class="w-full p-2 bg-[#14121a] text-secondary-neon/80 font-mono text-xs rounded-lg border border-secondary-neon/20">${appState.rsaKeys.public_key}</textarea>
                    <button onclick="copyRsaKey('public')" class="mt-2 py-1 px-4 text-xs rounded-lg text-primary-neon border border-primary-neon hover:bg-primary-neon hover:text-white transition-all">
                        Copy Public Key
                    </button>
                </div>
                <div class="bg-bg-dark/70 p-4 rounded-lg border border-primary-neon/30">
                    <h3 class="text-lg font-medium text-text-light mb-2 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-primary-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        Private Key (For Decryption)
                    </h3>
                    <textarea id="rsa-private-key" rows="8" readonly class="w-full p-2 bg-[#14121a] text-primary-neon/80 font-mono text-xs rounded-lg border border-primary-neon/20">${appState.rsaKeys.private_key}</textarea>
                    <button onclick="copyRsaKey('private')" class="mt-2 py-1 px-4 text-xs rounded-lg text-primary-neon border border-primary-neon hover:bg-primary-neon hover:text-white transition-all">
                        Copy Private Key
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- Setup Events AFTER Rendering HTML ---
function setupOperationInterfaceEvents() {
    const keyInput = document.getElementById('key-input');
    const cipherId = appState.selectedCipher;
    
    if (cipherId === '9') { // RSA
        fetchRsaKeysAndFill();
    } else if (keyInput) {
        keyInput.addEventListener('input', (e) => updateKeyStrengthIndicator(e.target.value));
        updateKeyStrengthIndicator(keyInput.value);
    }
}

// --- Fetch RSA Keys from Server ---
async function fetchRsaKeysAndFill() {
    const keyInput = document.getElementById('key-input');
    const publicKeyEl = document.getElementById('rsa-public-key');
    const privateKeyEl = document.getElementById('rsa-private-key');

    if (!keyInput || !publicKeyEl || !privateKeyEl) return;
    
    // Check if keys are already fetched
    if (appState.rsaKeys.public_key && appState.rsaKeys.private_key) {
        // Use cached keys to update the UI instantly
        if (appState.operationType === 'encrypt') {
            keyInput.value = appState.rsaKeys.public_key;
        } else {
            keyInput.value = appState.rsaKeys.private_key;
        }
        publicKeyEl.value = appState.rsaKeys.public_key;
        privateKeyEl.value = appState.rsaKeys.private_key;
        return;
    }


    // Set a temporary message while loading
    publicKeyEl.value = 'Loading RSA keys...';
    privateKeyEl.value = 'Loading RSA keys...';
    keyInput.value = 'Loading...';
    
    try {
        const response = await fetch('http://127.0.0.1:5000/api/rsa_keys');
        const data = await response.json();

        if (response.ok) {
            
            // Store keys in appState
            appState.rsaKeys.public_key = data.public_key || 'Error: Key not found.';
            appState.rsaKeys.private_key = data.private_key || 'Error: Key not found.';
            
            // Fill dashboard textareas
            publicKeyEl.value = appState.rsaKeys.public_key;
            privateKeyEl.value = appState.rsaKeys.private_key;
            
            // Auto-fill key input based on current operation
            if (appState.operationType === 'encrypt') {
                keyInput.value = appState.rsaKeys.public_key;
            } else {
                keyInput.value = appState.rsaKeys.private_key;
            }
        } else {
            const errorMsg = data.error || 'Failed to fetch RSA keys from server.';
            publicKeyEl.value = errorMsg;
            privateKeyEl.value = errorMsg;
            keyInput.value = 'Error fetching keys.';
        }
    } catch (e) {
        const errorMsg = 'Network error or server down. Check console.';
        publicKeyEl.value = errorMsg;
        privateKeyEl.value = errorMsg;
        keyInput.value = 'Network error.';
        console.error("RSA Key Fetch Error:", e);
    }
}

// =========================================================================
// 4. Utility Functions (Entropy, Copy, Switch)
// =========================================================================

// --- Entropy Calculation (Key Strength) ---
function calculateEntropy(str) {
    if (!str) return 0;
    const len = str.length;
    if (len === 0) return 0;

    const charCounts = {};
    for (let i = 0; i < len; i++) {
        const char = str[i];
        charCounts[char] = (charCounts[char] || 0) + 1;
    }

    let entropy = 0;
    for (const char in charCounts) {
        const p = charCounts[char] / len;
        entropy -= p * (Math.log2(p));
    }

    const maxTheoreticalEntropy = 6.5; 
    let score = (entropy / maxTheoreticalEntropy) * 100;
    
    if (len < 8) {
        score *= (len / 8); 
    } else if (len > 30) {
        score = Math.min(100, score * 1.2); 
    }

    return Math.min(100, Math.max(0, score));
}

function updateKeyStrengthIndicator(key) {
    const score = calculateEntropy(key);
    const indicator = document.getElementById('key-strength-indicator');
    const label = document.getElementById('key-strength-label');

    if (!indicator || !label) return;

    indicator.style.width = `${score}%`;

    let strengthText = 'Very Weak';
    let strengthColor = 'bg-red-500';

    if (score > 80) {
        strengthText = 'Excellent';
        strengthColor = 'bg-green-500';
    } else if (score > 60) {
        strengthText = 'Strong';
        strengthColor = 'bg-yellow-500';
    } else if (score > 30) {
        strengthText = 'Moderate';
        strengthColor = 'bg-orange-500';
    } else if (score > 0) {
        strengthText = 'Weak';
        strengthColor = 'bg-red-400';
    } else {
        strengthText = 'Enter Key';
        strengthColor = 'bg-gray-500';
    }

    indicator.className = `h-full rounded-full transition-all duration-300 ${strengthColor}`;
    label.textContent = strengthText;
}

// --- Output Format Switcher ---
function switchOutputFormat(format) {
    const outputEl = document.getElementById('output-text');
    const btnBase64 = document.getElementById('output-btn-base64');
    const btnHex = document.getElementById('output-btn-hex');

    if (!outputEl) return;
    
    appState.outputFormat = format;

    // 1. Update Buttons (for visual feedback)
    if (btnBase64) {
        btnBase64.className = `py-1 px-3 text-xs rounded-full transition-all ${format === 'base64' ? 'bg-primary-neon text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`;
    }
    if (btnHex) {
        btnHex.className = `py-1 px-3 text-xs rounded-full transition-all ${format === 'hex' ? 'bg-primary-neon text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`;
    }

    // 2. Update Output Content
    if (appState.operationType === 'encrypt') {
        if (format === 'base64') {
            outputEl.textContent = appState.serverOutput.base64_output;
        } else if (format === 'hex') {
            outputEl.textContent = appState.serverOutput.hex_output;
        }
    } else {
        outputEl.textContent = appState.serverOutput.plaintext_output;
    }

    if (!outputEl.textContent) {
        outputEl.textContent = "Output is empty. Run encryption/decryption.";
    }
}


// --- Copy Functions ---
function copyOutputTextToClipboard() {
    const outputEl = document.getElementById('output-text');
    if (!outputEl || !outputEl.textContent) {
        showTemporaryMessage("Output field is empty.", "bg-red-500");
        return;
    }
    navigator.clipboard.writeText(outputEl.textContent).then(() => {
        showTemporaryMessage("Copied to clipboard!", "bg-green-500");
    }).catch(err => {
        showTemporaryMessage("Copy failed.", "bg-red-500");
        console.error("Failed to copy text: ", err);
    });
}

function copyRsaKey(type) {
    const keyId = type === 'public' ? 'rsa-public-key' : 'rsa-private-key';
    const keyEl = document.getElementById(keyId);
    if (!keyEl || !keyEl.value || keyEl.value.includes("Error")) {
        showTemporaryMessage(`Cannot copy: ${type} key is invalid or loading.`, "bg-red-500");
        return;
    }

    navigator.clipboard.writeText(keyEl.value).then(() => {
        showTemporaryMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} Key Copied!`, "bg-green-500");
    }).catch(err => {
        showTemporaryMessage("Copy failed.", "bg-red-500");
        console.error("Failed to copy text: ", err);
    });
}

// --- Temporary Message Helper ---
function showTemporaryMessage(message, bgColor) {
    let msgEl = document.getElementById("temp-message");
    if (!msgEl) {
        msgEl = document.createElement("div");
        msgEl.id = "temp-message";
        document.body.appendChild(msgEl);
    }

    msgEl.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white shadow-xl transition-opacity duration-300 z-[100] ${bgColor}`;
    
    msgEl.textContent = message;
    msgEl.classList.remove("opacity-0");
    msgEl.classList.add("opacity-100");

    setTimeout(() => {
        msgEl.classList.remove("opacity-100");
        msgEl.classList.add("opacity-0");
    }, 3000);
}


// =========================================================================
// 5. Event Handlers and Core Logic
// =========================================================================

function handleCipherSelection(id) {
    updateAppState({ selectedCipher: id, operationType: 'encrypt', serverOutput: { base64_output: '', hex_output: '', plaintext_output: '' } });
}

// --- CORRECTED: Handle operation change for RSA ---
function handleOperationTypeSelection(type) {
    updateAppState({ operationType: type, outputFormat: 'base64' });

    // RSA Key Switching Logic
    if (appState.selectedCipher === '9') {
        setTimeout(() => {
            const keyInput = document.getElementById('key-input');
            
            if (keyInput) {
                if (type === 'encrypt') {
                    // Encryption uses Public Key
                    keyInput.value = appState.rsaKeys.public_key || 'Loading keys...';
                } else {
                    // Decryption uses Private Key
                    keyInput.value = appState.rsaKeys.private_key || 'Loading keys...';
                }
            }
        }, 50); // Small delay to ensure renderApp has finished updating the DOM
    }
}
// --------------------------------------------------

function handleReset() {
    updateAppState({ selectedCipher: null, operationType: 'encrypt', serverOutput: { base64_output: '', hex_output: '', plaintext_output: '' }, rsaKeys: { public_key: '', private_key: '' } });
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const cipherId = appState.selectedCipher;
    const operation = appState.operationType;
    const form = event.target;
    const text = form.elements['text'].value;
    const key = form.elements['key'].value;
    
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const outputEl = document.getElementById('output-text');
    const messageContainer = document.getElementById('message-container');
    const progressBarContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    
    // Reset UI state
    outputEl.textContent = '';
    messageContainer.classList.add('hidden');
    messageContainer.className = 'mt-4 p-3 rounded-lg text-sm hidden'; 
    submitText.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    submitBtn.disabled = true;

    // Show Progress Bar
    progressBarContainer.classList.remove('hidden');
    progressBar.style.width = '20%'; 

    let result = '';
    let error = null;

    try {
        // --- LOCAL CIPHERS (Caesar, Substitution) ---
        if (cipherId === '1' || cipherId === '2') {
            const shift = cipherId === '1' ? parseInt(key) : key;
            const decrypt = operation === 'decrypt';
            
            progressBar.style.width = '70%'; 

            if (cipherId === '1') {
                result = caesar(text, shift, decrypt);
            } else if (cipherId === '2') {
                result = substitution(text, shift, decrypt);
            }
            
            appState.serverOutput.plaintext_output = result; 
            appState.serverOutput.base64_output = result; 
            appState.serverOutput.hex_output = "N/A - Classical Cipher";

        } 
        
        // --- SERVER CIPHERS (Playfair, Hill, DES, 3DES, AES, TEA, RSA) ---
        else {
            progressBar.style.width = '40%';
            const response = await fetch('http://127.0.0.1:5000/api/cipher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cipher_id: cipherId, operation, text, key })
            });

            progressBar.style.width = '70%';
            const data = await response.json();

            if (response.ok) {
                // Store results in state for output toggling (Hex/Base64)
                appState.serverOutput.plaintext_output = data.result; 
                
                if (operation === 'encrypt') {
                    appState.serverOutput.base64_output = data.base64_output;
                    appState.serverOutput.hex_output = data.hex_output;
                    result = data.base64_output; // Show Base64 by default
                    
                } else { // Decrypt
                    appState.serverOutput.base64_output = data.result;
                    appState.serverOutput.hex_output = "N/A - Plaintext";
                    result = data.result;
                }
            } else {
                error = data.error || "An unknown error occurred on the server.";
            }
        }

    } catch (e) {
        error = e.message || "An unexpected error occurred during processing.";
    } finally {
        progressBar.style.width = '100%';
        
        // Reset button/spinner
        setTimeout(() => {
            loadingSpinner.classList.add('hidden');
            submitText.classList.remove('hidden');
            submitBtn.disabled = false;
            progressBarContainer.classList.add('hidden');
            progressBar.style.width = '0%';
        }, 500);

        // Display the result based on the operation/selected format
        if (!error && result) {
            // Use the switch function to populate the output based on current format state
            switchOutputFormat(appState.outputFormat); 
        } else {
            outputEl.textContent = 'Awaiting input...';
        }

        if (error) {
            messageContainer.textContent = `Error: ${error}`;
            // Add the glitch class for dramatic error presentation
            messageContainer.className = 'mt-4 p-3 rounded-lg text-sm bg-red-900/50 text-red-300 block error-glitch-text';
        } else if (result) {
            messageContainer.textContent = `${operation.charAt(0).toUpperCase() + operation.slice(1)} completed successfully.`;
            messageContainer.className = 'mt-4 p-3 rounded-lg text-sm bg-green-900/50 text-green-300 block';
        }
    }
}


// =========================================================================
// 6. Initialization 
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Start the Matrix Rain background effect
    startMatrixRain(); 
    
    // 2. Renders the main cipher selection interface
    renderApp(); 
});

// Expose functions to the global scope for inline onclick handlers
window.handleCipherSelection = handleCipherSelection;
window.handleOperationTypeSelection = handleOperationTypeSelection;
window.handleFormSubmit = handleFormSubmit;
window.handleReset = handleReset;
window.switchOutputFormat = switchOutputFormat;
window.copyOutputTextToClipboard = copyOutputTextToClipboard;
window.copyRsaKey = copyRsaKey; 
window.updateKeyStrengthIndicator = updateKeyStrengthIndicator; 

document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.getElementById('reset-app-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleReset);
    }
});