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
        alert("FATAL ERROR: Could not connect to the database. Check console.");
        console.error(e);
        return;
    }

    const db = firebase.firestore();
    const ADMIN_PASSCODE = "123456789";

    function showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        let icon = 'ℹ️'; if (type === 'success') icon = '✅'; if (type === 'error') icon = '❌';
        toast.innerHTML = `<div class="icon">${icon}</div><div class="message">${message}</div>`;
        container.appendChild(toast);
        setTimeout(() => {
            if (toast) {
                toast.classList.add('closing');
                setTimeout(() => toast.remove(), 400);
            }
        }, 4000);
    }

    const canvas = document.getElementById('background-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d'); let width, height, grid; const mouse = { x: 0, y: 0, radius: 60 };
        const setup = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; grid = []; const cellSize = 20; for (let y = 0; y < height + cellSize; y += cellSize) { for (let x = 0; x < width + cellSize; x += cellSize) { grid.push({ x, y }); } } };
        const draw = () => { if (!ctx) return; ctx.clearRect(0, 0, width, height); const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--grid-color').trim(); const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(); grid.forEach(point => { const dist = Math.hypot(point.x - mouse.x, point.y - mouse.y); const size = Math.max(0.5, 2 - dist / 150); if (dist < mouse.radius) { ctx.fillStyle = primaryColor; ctx.globalAlpha = Math.max(0, 0.8 - dist / mouse.radius); } else { ctx.fillStyle = gridColor; ctx.globalAlpha = 0.5; } ctx.beginPath(); ctx.arc(point.x, point.y, size, 0, Math.PI * 2); ctx.fill(); }); requestAnimationFrame(draw); };
        window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }); window.addEventListener('resize', setup); setup(); draw();
    }
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) { themeToggle.addEventListener('click', () => { document.documentElement.classList.toggle('light-mode'); localStorage.setItem('theme', document.documentElement.classList.contains('light-mode') ? 'light' : 'dark'); }); }
    if (localStorage.getItem('theme') === 'light') { document.documentElement.classList.add('light-mode'); }
    
    if (document.getElementById('request-btn')) {
        handleUserPage(db, showNotification);
    } else if (document.getElementById('upload-btn')) {
        handleAdminPage(db, ADMIN_PASSCODE, showNotification);
    }
});

function handleUserPage(db, showNotification) {
    const statsCountEl = document.getElementById('stats-count'); const requestBtn = document.getElementById('request-btn'); const emailDisplayEl = document.getElementById('email-display'); const emailTextEl = document.getElementById('email-text'); const personalRequestsEl = document.getElementById('personal-requests'); const personalAvgTimeEl = document.getElementById('personal-avg-time'); const historyListEl = document.getElementById('history-list'); const modal = document.getElementById('delay-modal'); const countdownTimerEl = document.getElementById('countdown-timer');
    let sessionRequests = 0; let sessionStartTime = Date.now();
    db.collection('emails').where('status', '==', 0).onSnapshot(snapshot => {
        statsCountEl.textContent = snapshot.size;
    }, error => { showNotification("DB connection issue.", "error"); });
    requestBtn.addEventListener('click', async () => {
        requestBtn.disabled = true; requestBtn.querySelector('.btn-text').textContent = 'PROCESSING...';
        const randomDelay = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
        let countdown = Math.ceil(randomDelay / 1000);
        countdownTimerEl.textContent = countdown;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 10);
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                countdownTimerEl.textContent = countdown;
            } else {
                countdownTimerEl.innerHTML = `&check;`;
                clearInterval(countdownInterval);
            }
        }, 1000);
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        modal.classList.remove('visible');
        setTimeout(() => modal.style.display = 'none', 300);
        showNotification("Securing a unique email...", "info");
        try {
            const { id, address } = await db.runTransaction(async (transaction) => {
                const query = db.collection('emails').where('status', '==', 0).limit(1);
                const snapshot = await transaction.get(query);
                if (snapshot.empty) { throw new Error("SYSTEM EMPTY"); }
                const emailDoc = snapshot.docs[0];
                transaction.update(emailDoc.ref, { status: 1 });
                return { id: emailDoc.id, address: emailDoc.data().address };
            });
            await db.collection('emails').doc(id).update({ used_at: new Date() });
            emailTextEl.textContent = address;
            emailTextEl.style.opacity = '1';
            showNotification("New email secured!", "success");
            sessionRequests++; updatePersonalStats(); addToHistory(address);
        } catch (error) {
            showNotification(error.message, "error");
            emailTextEl.textContent = 'An error occurred.';
        } finally {
            requestBtn.disabled = false;
            requestBtn.querySelector('.btn-text').textContent = 'REQUEST EMAIL';
        }
    });
    function updatePersonalStats() { if (!personalRequestsEl) return; personalRequestsEl.textContent = sessionRequests; if (sessionRequests > 0) { const avgTime = ((Date.now() - sessionStartTime) / 1000 / sessionRequests).toFixed(1); personalAvgTimeEl.textContent = `${avgTime}s`; } }
    function addToHistory(email) { if (!historyListEl) return; const placeholder = historyListEl.querySelector('.history-placeholder'); if (placeholder) placeholder.remove(); const li = document.createElement('li'); li.textContent = email; li.title = "Click to copy this email"; li.addEventListener('click', () => copyToClipboard(email)); historyListEl.prepend(li); }
    function copyToClipboard(text) { if (text && text.includes('@')) { navigator.clipboard.writeText(text).then(() => showNotification(`Copied: ${text}`, "success")).catch(() => showNotification("Failed to copy email.", "error")); } }
    emailDisplayEl.addEventListener('click', () => copyToClipboard(emailTextEl.textContent));
}

function handleAdminPage(db, ADMIN_PASSCODE, showNotification) {
    // This function is for the separate admin.html page and is not included here
    // for simplicity, but the logic would be the same as previous versions.
}
