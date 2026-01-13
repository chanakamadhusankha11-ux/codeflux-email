document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // == YOUR FIREBASE CONFIGURATION FOR THE EMAIL TOOL ==
    // =================================================================
    const firebaseConfig = {
      apiKey: "AIzaSyCWmj_CjXpN7ivt-8cqhnv9kH-GMgWNu8A", // <-- Your EMAIL tool's config
      authDomain: "aero-github-db.firebaseapp.com",     // <-- Your EMAIL tool's config
      projectId: "aero-github-db",                      // <-- Your EMAIL tool's config
      storageBucket: "aero-github-db.appspot.com",      // <-- Your EMAIL tool's config
      messagingSenderId: "888535890076",                // <-- Your EMAIL tool's config
      appId: "1:888535890076:web:a32193f50bba401e039559",// <-- Your EMAIL tool's config
      measurementId: "G-8JCKEHBRVJ"                     // <-- Your EMAIL tool's config
    };
    // =================================================================

    try {
        firebase.initializeApp(firebaseConfig);
    } catch (e) {
        showNotification("FATAL ERROR: Could not connect to the database.", "error");
        console.error("Firebase initialization failed.", e);
        return; // Stop execution if Firebase fails
    }

    const db = firebase.firestore();
    const ADMIN_PASSCODE = "123456789";

    // --- Reusable Notification Handler ---
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
// == USER PAGE LOGIC (WITH PROFESSIONAL DELAY & TRANSACTION FIX)
// =================================================
function handleUserPage(db, showNotification) {
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

    // Real-time listener for stats
    db.collection('emails').where('status', '==', 0).onSnapshot(snapshot => {
        statsCountEl.textContent = snapshot.size;
    });

    // --- MAIN REQUEST LOGIC WITH THE DELAY ---
    requestBtn.addEventListener('click', async () => {
        // --- STEP 1: INITIAL UI LOCK & RANDOM DELAY CALCULATION ---
        requestBtn.disabled = true;
        requestBtn.querySelector('.btn-text').textContent = 'PLEASE WAIT...';
        emailDisplayEl.style.pointerEvents = 'none';

        const randomDelay = Math.floor(Math.random() * (4000 - 3000 + 1)) + 3000; // 3 to 4 seconds
        let countdown = Math.ceil(randomDelay / 1000);

        emailTextEl.textContent = `Securing connection...`;
        emailTextEl.style.opacity = '0.7';

        // --- STEP 2: COUNTDOWN TIMER FOR USER FEEDBACK ---
        showNotification(`Processing request. Please wait ${countdown} seconds...`, 'info');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                showNotification(`Please wait ${countdown} more second(s)...`, 'info');
            }
        }, 1000);

        // --- STEP 3: WAIT FOR THE DELAY TO FINISH ---
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        clearInterval(countdownInterval);

        // --- STEP 4: EXECUTE THE SECURE TRANSACTION AFTER DELAY ---
        emailTextEl.textContent = 'Acquiring email...';
        showNotification('Finding an available email...', 'info');

        try {
            const emailAddress = await db.runTransaction(async (transaction) => {
                const query = db.collection('emails').where('status', '==', 0).limit(1);
                const snapshot = await transaction.get(query);
                if (snapshot.empty) throw new Error("SYSTEM EMPTY");
                
                const emailDoc = snapshot.docs[0];
                const address = emailDoc.data().address;
                
                transaction.update(emailDoc.ref, {
                    status: 1,
                    used_at: new Date()
                });
                
                return address;
            });
            
            // --- SUCCESS: UPDATE UI ---
            emailTextEl.textContent = emailAddress;
            emailTextEl.style.opacity = '1';
            showNotification("New email secured and received!", "success");

            sessionRequests++;
            updatePersonalStats();
            addToHistory(emailAddress);

        } catch (error) {
            // --- ERROR: UPDATE UI ---
            showNotification(error.message, "error");
            emailTextEl.textContent = 'An error occurred. Try again.';
        } finally {
            // --- ALWAYS: RESET UI ---
            requestBtn.disabled = false;
            requestBtn.querySelector('.btn-text').textContent = 'REQUEST EMAIL';
            emailDisplayEl.style.pointerEvents = 'auto';
        }
    });

    // --- Helper Functions ---
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
// == ADMIN PAGE LOGIC (for the EMAIL tool)
// =================================================
function handleAdminPage(db, ADMIN_PASSCODE, showNotification) {
    const uploadBtn = document.getElementById('upload-btn');
    const emailInput = document.getElementById('email-input'); // Assuming textarea for email list
    const passcode_input = document.getElementById('passcode-input');

    if(!uploadBtn) return; // Make sure we are on the admin page

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
