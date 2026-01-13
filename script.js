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
    } catch (e) { showNotification("FATAL ERROR: Could not connect to DB.", "error"); return; }

    const db = firebase.firestore();
    const ADMIN_PASSCODE = "123456789";

    function showNotification(message, type = 'info') { /* Unchanged */ }

    if (document.getElementById('request-btn')) {
        handleUserPage(db, showNotification);
    } else if (document.getElementById('upload-btn')) {
        handleAdminPage(db, ADMIN_PASSCODE, showNotification);
    }
});

// =================================================
// == USER PAGE LOGIC (NO TRANSACTION & MODAL POPUP)
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
    const modal = document.getElementById('delay-modal');
    const countdownTimerEl = document.getElementById('countdown-timer');

    // State
    let sessionRequests = 0;
    let sessionStartTime = Date.now();

    // Real-time listener for stats
    db.collection('emails').where('status', '==', 0).onSnapshot(snapshot => {
        statsCountEl.textContent = snapshot.size;
    });

    // --- MAIN REQUEST LOGIC WITH DELAY & POPUP ---
    requestBtn.addEventListener('click', async () => {
        requestBtn.disabled = true;
        requestBtn.querySelector('.btn-text').textContent = 'PROCESSING...';
        
        // --- STEP 1: SHOW MODAL AND START COUNTDOWN ---
        const randomDelay = Math.floor(Math.random() * (4000 - 3000 + 1)) + 3000;
        let countdown = Math.ceil(randomDelay / 1000);
        
        countdownTimerEl.textContent = countdown;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 10); // Trigger transition

        const countdownInterval = setInterval(() => {
            countdown--;
            countdownTimerEl.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        // --- STEP 2: WAIT FOR THE DELAY TO FINISH ---
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        
        // --- STEP 3: HIDE MODAL AND EXECUTE DB LOGIC ---
        modal.classList.remove('visible');
        setTimeout(() => modal.style.display = 'none', 300); // Hide after transition

        showNotification("Finding an available email...", "info");
        
        try {
            // --- THE DEFINITIVE FIX: NO TRANSACTION ---
            // 1. Get an available document
            const query = db.collection('emails').where('status', '==', 0).limit(1);
            const snapshot = await query.get();
            if (snapshot.empty) throw new Error("SYSTEM EMPTY");

            const emailDoc = snapshot.docs[0];
            const emailAddress = emailDoc.data().address;
            
            // 2. Update that specific document by its ID
            await db.collection('emails').doc(emailDoc.id).update({
                status: 1,
                used_at: new Date()
            });
            
            // --- SUCCESS: UPDATE UI ---
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

    // Helper functions (updatePersonalStats, addToHistory, copyToClipboard) remain the same
    function updatePersonalStats() { /* ... */ }
    function addToHistory(email) { /* ... */ }
    function copyToClipboard(text) { /* ... */ }
    emailDisplayEl.addEventListener('click', () => copyToClipboard(emailTextEl.textContent));
}

// Admin page logic remains unchanged
function handleAdminPage(db, ADMIN_PASSCODE, showNotification) { /* ... */ }
