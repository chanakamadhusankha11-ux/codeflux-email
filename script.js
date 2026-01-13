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
        // We need showNotification to be defined before we can use it.
        // So we define it outside the main logic flow.
        const container = document.getElementById('notification-container');
        if (container) {
            const toast = document.createElement('div');
            toast.className = 'toast-notification error';
            toast.innerHTML = `<div class="icon">❌</div><div class="message">FATAL ERROR: Could not connect to DB.</div>`;
            container.appendChild(toast);
        }
        console.error(e);
        return;
    }

    const db = firebase.firestore();
    const ADMIN_PASSCODE = "123456789";

    // --- Reusable Notification Handler (Defined Globally in this scope) ---
    function showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        toast.innerHTML = `<div class="icon">${icon}</div><div class="message">${message}</div>`;
        container.appendChild(toast);
        // Automatically remove the toast after animation
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards';
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // --- Main Logic Router ---
    if (document.getElementById('request-btn')) {
        handleUserPage(db, showNotification);
    } else if (document.getElementById('upload-btn')) {
        handleAdminPage(db, ADMIN_PASSCODE, showNotification);
    }
});

// =================================================
// == USER PAGE LOGIC (ALL NOTIFICATIONS WORKING)
// =================================================
function handleUserPage(db, showNotification) {
    const statsCountEl = document.getElementById('stats-count');
    const requestBtn = document.getElementById('request-btn');
    const emailDisplayEl = document.getElementById('email-display');
    const emailTextEl = document.getElementById('email-text');
    const personalRequestsEl = document.getElementById('personal-requests');
    const personalAvgTimeEl = document.getElementById('personal-avg-time');
    const historyListEl = document.getElementById('history-list');
    const modal = document.getElementById('delay-modal');
    const countdownTimerEl = document.getElementById('countdown-timer');

    let sessionRequests = 0;
    let sessionStartTime = Date.now();

    db.collection('emails').where('status', '==', 0).onSnapshot(snapshot => {
        statsCountEl.textContent = snapshot.size;
    }, error => {
        showNotification("DB connection issue.", "error");
    });

    requestBtn.addEventListener('click', async () => {
        requestBtn.disabled = true;
        requestBtn.querySelector('.btn-text').textContent = 'PROCESSING...';
        
        const randomDelay = Math.floor(Math.random() * (4000 - 3000 + 1)) + 3000;
        let countdown = Math.ceil(randomDelay / 1000);
        
        countdownTimerEl.textContent = countdown;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 10);

        const countdownInterval = setInterval(() => {
            countdown--;
            countdownTimerEl.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        await new Promise(resolve => setTimeout(resolve, randomDelay));
        
        modal.classList.remove('visible');
        setTimeout(() => modal.style.display = 'none', 300);

        showNotification("Finding an available email...", "info");
        
        try {
            const query = db.collection('emails').where('status', '==', 0).limit(1);
            const snapshot = await query.get();
            if (snapshot.empty) throw new Error("SYSTEM EMPTY");

            const emailDoc = snapshot.docs[0];
            const emailAddress = emailDoc.data().address;
            
            await db.collection('emails').doc(emailDoc.id).update({
                status: 1,
                used_at: new Date()
            });
            
            emailTextEl.textContent = emailAddress;
            emailTextEl.style.opacity = '1';
            showNotification("New email secured!", "success");

            sessionRequests++;
            updatePersonalStats();
            addToHistory(emailAddress);

        } catch (error) {
            showNotification(error.message, "error");
            emailTextEl.textContent = 'An error occurred.';
        } finally {
            requestBtn.disabled = false;
            requestBtn.querySelector('.btn-text').textContent = 'REQUEST EMAIL';
        }
    });

    function updatePersonalStats() {
        if (!personalRequestsEl) return;
        personalRequestsEl.textContent = sessionRequests;
        if (sessionRequests > 0) {
            const avgTime = ((Date.now() - sessionStartTime) / 1000 / sessionRequests).toFixed(1);
            personalAvgTimeEl.textContent = `${avgTime}s`;
        }
    }

    function addToHistory(email) {
        if (!historyListEl) return;
        const placeholder = historyListEl.querySelector('.history-placeholder');
        if (placeholder) placeholder.remove();
        const li = document.createElement('li');
        li.textContent = email;
        li.title = "Click to copy this email";
        li.addEventListener('click', () => copyToClipboard(email, true));
        historyListEl.prepend(li);
    }
    
    function copyToClipboard(text, isFromHistory = false) {
        if (text && text.includes('@')) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    showNotification(`Copied: ${text}`, "success");
                })
                .catch(() => {
                    showNotification("Failed to copy email.", "error");
                });
        }
    }
    emailDisplayEl.addEventListener('click', () => copyToClipboard(emailTextEl.textContent));
}

// =================================================
// == ADMIN PAGE LOGIC
// =================================================
function handleAdminPage(db, ADMIN_PASSCODE, showNotification) {
    const uploadBtn = document.getElementById('upload-btn');
    const emailInput = document.getElementById('email-input');
    const passcode_input = document.getElementById('passcode-input');
    
    if(!uploadBtn) return;

    uploadBtn.addEventListener('click', async () => {
        if (passcode_input.value !== ADMIN_PASSCODE) { showNotification('Invalid Passcode!', 'error'); return; }
        
        const text = emailInput.value;
        const newEmails = [...new Set(text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || [])];
        if (newEmails.length === 0) { showNotification('No valid emails found.', 'error'); return; }

        uploadBtn.disabled = true;
        uploadBtn.querySelector('.btn-text').textContent = 'UPLOADING...';
        showNotification(`Uploading ${newEmails.length} emails...`, 'info');
        
        const chunks = [];
        for (let i = 0; i < newEmails.length; i += 499) { chunks.push(newEmails.slice(i, i + 499)); }

        try {
            for (const chunk of chunks) {
                const batch = db.batch();
                chunk.forEach(email => {
                    const docRef = db.collection('emails').doc(email.toLowerCase());
                    batch.set(docRef, { address: email.toLowerCase(), status: 0 }, { merge: true });
                });
                await batch.commit();
            }
            showNotification(`Successfully uploaded ${newEmails.length} emails!`, 'success');
            emailInput.value = '';
        } catch (error) {
            showNotification(`Upload Error: ${error.message}`, 'error');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.querySelector('.btn-text').textContent = 'UPLOAD EMAILS';
        }
    });
}
