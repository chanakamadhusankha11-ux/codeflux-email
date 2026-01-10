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
    } catch (e) { console.error("Firebase initialization failed.", e); return; }

    const db = firebase.firestore();
    const ADMIN_PASSCODE = "123456789";

    // --- Dynamic Background & Theme Toggle (No changes) ---
    // (This part remains the same)
    // ... [The previous background and theme code goes here for brevity] ...

    // --- Main Logic Router ---
    if (document.getElementById('request-btn')) {
        handleUserPage(db);
    } else if (document.getElementById('upload-btn')) {
        handleAdminPage(db, ADMIN_PASSCODE);
    }
});

// =================================================
// == USER PAGE LOGIC (WITH FLIP EFFECT)
// =================================================
function handleUserPage(db) {
    // DOM Elements
    const statsCountEl = document.getElementById('stats-count');
    const requestBtn = document.getElementById('request-btn');
    const emailDisplayEl = document.getElementById('email-display');
    const copyFeedbackEl = document.getElementById('copy-feedback');
    const systemMessageEl = document.getElementById('system-message');
    // Flip Elements
    const emailTextFront = document.getElementById('email-text-front');
    const emailTextBack = document.getElementById('email-text-back');
    const flipperFront = document.querySelector('.front');
    const flipperBack = document.querySelector('.back');

    // State
    let isFlipped = false; // To track the card's state

    // --- MAIN REQUEST LOGIC ---
    requestBtn.addEventListener('click', async () => {
        requestBtn.disabled = true;
        requestBtn.querySelector('.btn-text').textContent = 'REQUESTING...';
        
        // Show loading state on the currently visible face
        emailDisplayEl.classList.add('loading');
        
        try {
            const query = db.collection('emails').where('status', '==', 0).limit(1);
            const snapshot = await query.get();
            if (snapshot.empty) throw new Error("SYSTEM EMPTY");

            const emailDoc = snapshot.docs[0];
            const emailAddress = emailDoc.data().address;
            
            await db.collection('emails').doc(emailDoc.id).update({ status: 1, used_at: new Date() });

            // --- FLIP ANIMATION LOGIC ---
            // 1. Determine which side to update (the hidden one)
            const targetTextElement = isFlipped ? emailTextFront : emailTextBack;
            targetTextElement.textContent = emailAddress;

            // 2. Flip the card
            emailDisplayEl.classList.toggle('flipped');
            isFlipped = !isFlipped; // Update the state

            // 3. Update messages after flip completes
            setTimeout(() => {
                systemMessageEl.textContent = '✅ Email received! Click to copy.';
                systemMessageEl.style.color = 'var(--primary)';
            }, 300); // 300ms is half of the flip duration
            
            // --- Update other features (stats, history) ---
            // sessionRequests++; updatePersonalStats(); addToHistory(emailAddress);

        } catch (error) {
            systemMessageEl.textContent = `❌ ${error.message}`;
            systemMessageEl.style.color = '#ff4757';
        } finally {
            // ALWAYS reset the UI state
            requestBtn.disabled = false;
            requestBtn.querySelector('.btn-text').textContent = 'REQUEST EMAIL';
            emailDisplayEl.classList.remove('loading');
        }
    });

    // --- Unified Copy Logic ---
    function copyToClipboard(text) {
        if (text && text.includes('@')) {
            navigator.clipboard.writeText(text).then(() => {
                copyFeedbackEl.classList.add('show');
                setTimeout(() => copyFeedbackEl.classList.remove('show'), 1500);
            }).catch(err => {
                alert('Could not copy email automatically.');
            });
        }
    }

    // Add event listeners to BOTH faces of the card
    flipperFront.addEventListener('click', () => {
        copyToClipboard(emailTextFront.textContent);
    });
    flipperBack.addEventListener('click', () => {
        copyToClipboard(emailTextBack.textContent);
    });

    // Other helper functions like updatePersonalStats, addToHistory can be here
}

// =================================================
// == ADMIN PAGE LOGIC (No changes needed)
// =================================================
function handleAdminPage(db, ADMIN_PASSCODE) {
    // This function remains the same.
    // ...
}
