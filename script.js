document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // == YOUR FIREBASE CONFIGURATION ==
    // =================================================================
    const firebaseConfig = {
      apiKey: "AIzaSyCWmj_CjXpN7ivt-8cqhnv9kH-GMgWNu8A",
      authDomain: "aero-github-db.firebaseapp.com",
      projectId: "aero-github-db",
      storageBucket: "aero-github-db.appspot.com",
      messagingSenderId: "888535890076",
      appId: "1:888535890076:web:a32193f50bba401e039559",
      measurementId: "G-8JCKEHBRVJ"
    };
    // =================================================================

    try {
        firebase.initializeApp(firebaseConfig);
    } catch (e) {
        showNotification("FATAL ERROR: Could not connect to the database.", "error");
        console.error(e);
        return;
    }

    const db = firebase.firestore();
    const ADMIN_PASSCODE = "123456789";

    // --- Dynamic Background & Theme Toggle (No changes) ---
    const canvas = document.getElementById('background-canvas'); if (canvas) { const ctx = canvas.getContext('2d'); let width, height, grid; const mouse = { x: 0, y: 0, radius: 60 }; const setup = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; grid = []; const cellSize = 20; for (let y = 0; y < height + cellSize; y += cellSize) { for (let x = 0; x < width + cellSize; x += cellSize) { grid.push({ x, y }); } } }; const draw = () => { if (!ctx) return; ctx.clearRect(0, 0, width, height); const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--grid-color').trim(); const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(); grid.forEach(point => { const dist = Math.hypot(point.x - mouse.x, point.y - mouse.y); const size = Math.max(0.5, 2 - dist / 150); if (dist < mouse.radius) { ctx.fillStyle = primaryColor; ctx.globalAlpha = Math.max(0, 0.8 - dist / mouse.radius); } else { ctx.fillStyle = gridColor; ctx.globalAlpha = 0.5; } ctx.beginPath(); ctx.arc(point.x, point.y, size, 0, Math.PI * 2); ctx.fill(); }); requestAnimationFrame(draw); }; window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }); window.addEventListener('resize', setup); setup(); draw(); }
    const themeToggle = document.getElementById('theme-toggle'); if (themeToggle) { themeToggle.addEventListener('click', () => { document.documentElement.classList.toggle('light-mode'); localStorage.setItem('theme', document.documentElement.classList.contains('light-mode') ? 'light' : 'dark'); }); } if (localStorage.getItem('theme') === 'light') { document.documentElement.classList.add('light-mode'); }
    
    // --- NOTIFICATION HANDLER ---
    function showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container'); if (!container) return;
        const toast = document.createElement('div'); toast.className = `toast-notification ${type}`;
        let icon = 'ℹ️'; if (type === 'success') icon = '✅'; if (type === 'error') icon = '❌';
        toast.innerHTML = `<div class="icon">${icon}</div><div class="message">${message}</div>`;
        container.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 4500);
    }

    // --- Main Logic Router ---
    if (document.getElementById('request-btn')) {
        handleUserPage(db, showNotification);
    } else if (document.getElementById('upload-btn')) {
        handleAdminPage(db, ADMIN_PASSCODE, showNotification);
    }
});

// =================================================
// == USER PAGE LOGIC (ALL FEATURES INTEGRATED & STABLE)
// =================================================
function handleUserPage(db, showNotification) {
    // DOM Elements
    const statsCountEl = document.getElementById('stats-count');
    const requestBtn = document.getElementById('request-btn');
    const emailDisplayEl = document.getElementById('email-display');
    const emailTextEl = document.getElementById('email-text');
    const personalRequestsEl = document.getElementById('personal-requests');
    const personalAvgTimeEl = document.getElementById('personal-avg-time');
    const historyListEl = document.getElementById('history-list');

    // State
    let sessionRequests = 0;
    let sessionStartTime = Date.now();

    // Real-time listener for global stats
    db.collection('emails').where('status', '==', 0).onSnapshot(snapshot => {
        statsCountEl.textContent = snapshot.size;
    }, error => {
        showNotification("DB connection issue.", "error");
    });

    // Main Request Logic
    requestBtn.addEventListener('click', async () => {
        requestBtn.disabled = true;
        requestBtn.querySelector('.btn-text').textContent = 'REQUESTING...';
        emailDisplayEl.style.pointerEvents = 'none'; // Disable click during request
        emailTextEl.textContent = 'Requesting...';
        emailTextEl.style.opacity = '0.7';

        showNotification("Requesting new email...", "info");
        
        try {
            const query = db.collection('emails').where('status', '==', 0).limit(1);
            const snapshot = await query.get();
            if (snapshot.empty) throw new Error("SYSTEM EMPTY");

            const emailDoc = snapshot.docs[0];
            const emailAddress = emailDoc.data().address;
            
            await db.collection('emails').doc(emailDoc.id).update({ status: 1, used_at: new Date() });
            
            // --- UI Update ---
            emailTextEl.textContent = emailAddress;
            emailTextEl.style.opacity = '1';
            showNotification("New email received!", "success");

            // Update stats and history
            sessionRequests++;
            updatePersonalStats();
            addToHistory(emailAddress);
        } catch (error) {
            showNotification(error.message, "error");
            emailTextEl.textContent = 'An error occurred. Try again.';
        } finally {
            requestBtn.disabled = false;
            requestBtn.querySelector('.btn-text').textContent = 'REQUEST EMAIL';
            emailDisplayEl.style.pointerEvents = 'auto'; // Re-enable click
        }
    });

    // Helper Functions
    function updatePersonalStats() {
        personalRequestsEl.textContent = sessionRequests;
        if (sessionRequests > 0) {
            const avgTime = ((Date.now() - sessionStartTime) / 1000 / sessionRequests).toFixed(1);
            personalAvgTimeEl.textContent = `${avgTime}s`;
        }
    }

    function addToHistory(email) {
        const placeholder = historyListEl.querySelector('.history-placeholder');
        if (placeholder) placeholder.remove();
        const li = document.createElement('li');
        li.textContent = email;
        li.title = "Click to copy this email";
        li.addEventListener('click', () => copyToClipboard(email));
        historyListEl.prepend(li);
    }
    
    function copyToClipboard(text) {
        if (text && text.includes('@')) {
            navigator.clipboard.writeText(text)
                .then(() => showNotification(`Copied: ${text}`, "success"))
                .catch(() => showNotification("Failed to copy email.", "error"));
        }
    }

    emailDisplayEl.addEventListener('click', () => copyToClipboard(emailTextEl.textContent));
}

// =================================================
// == ADMIN PAGE LOGIC (WITH NOTIFICATIONS)
// =================================================
function handleAdminPage(db, ADMIN_PASSCODE, showNotification) {
    const uploadBtn = document.getElementById('upload-btn');
    const emailInput = document.getElementById('email-input');
    const passcode_input = document.getElementById('passcode-input');
    uploadBtn.addEventListener('click', async () => { if (passcode_input.value !== ADMIN_PASSCODE) { showNotification('Invalid Passcode!', 'error'); return; } const text = emailInput.value; const newEmails = [...new Set(text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || [])]; if (newEmails.length === 0) { showNotification('No valid emails found.', 'error'); return; } uploadBtn.disabled = true; uploadBtn.querySelector('.btn-text').textContent = 'UPLOADING...'; showNotification(`Uploading ${newEmails.length} emails...`, 'info'); const chunks = []; for (let i = 0; i < newEmails.length; i += 499) { chunks.push(newEmails.slice(i, i + 499)); } try { for (const chunk of chunks) { const batch = db.batch(); chunk.forEach(email => { const docRef = db.collection('emails').doc(email.toLowerCase()); batch.set(docRef, { address: email.toLowerCase(), status: 0 }, { merge: true }); }); await batch.commit(); } showNotification(`Successfully uploaded ${newEmails.length} emails!`, 'success'); emailInput.value = ''; } catch (error) { showNotification(`Upload Error: ${error.message}`, 'error'); } finally { uploadBtn.disabled = false; uploadBtn.querySelector('.btn-text').textContent = 'UPLOAD EMAILS'; } });
}
