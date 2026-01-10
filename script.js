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
        console.error("Firebase initialization failed.", e);
        // Handle initialization error
        return;
    }

    const db = firebase.firestore();
    const ADMIN_PASSCODE = "123456789";

    // Dynamic background, theme toggle, etc. (No changes here)
    // ... (The previous code for background and theme toggle goes here)

    // --- Main Logic ---
    if (document.getElementById('request-btn')) {
        handleUserPage(db);
    } else if (document.getElementById('upload-btn')) {
        handleAdminPage(db, ADMIN_PASSCODE);
    }
});

// =================================================
// == USER PAGE LOGIC (WITH THE NEW FIX)
// =================================================
function handleUserPage(db) {
    const statsCountEl = document.getElementById('stats-count');
    const requestBtn = document.getElementById('request-btn');
    const emailTextEl = document.getElementById('email-text');
    // ... other element variables

    // Real-time listener for stats (No change here)
    db.collection('emails').where('status', '==', 0).onSnapshot(snapshot => {
        statsCountEl.textContent = snapshot.size;
        // ... counter animation logic ...
    });

    requestBtn.addEventListener('click', async () => {
        // ... audio unlock logic ...

        requestBtn.disabled = true;
        requestBtn.querySelector('.btn-text').textContent = 'REQUESTING...';
        
        try {
            // ===============================================================
            // == THE NEW, SIMPLER APPROACH (NO TRANSACTION) - THIS IS THE FIX ==
            // ===============================================================
            const query = db.collection('emails').where('status', '==', 0).limit(1);
            const snapshot = await query.get();

            if (snapshot.empty) {
                throw new Error("SYSTEM EMPTY");
            }

            const emailDoc = snapshot.docs[0];
            const emailAddress = emailDoc.data().address;
            
            // Now, update the found document directly by its ID
            await db.collection('emails').doc(emailDoc.id).update({
                status: 1,
                used_at: new Date()
            });
            // ===============================================================

            // Display logic (No changes here)
            // ... (code to show the email on screen) ...
            emailTextEl.textContent = emailAddress;
            systemMessageEl.textContent = '✅ Email received! Click to copy.';
            // ...

        } catch (error) {
            systemMessageEl.textContent = `❌ ${error.message}`;
            systemMessageEl.style.color = '#ff4757';
        } finally {
            requestBtn.disabled = false;
            requestBtn.querySelector('.btn-text').textContent = 'REQUEST EMAIL';
        }
    });

    // ... email copy logic ...
}

// =================================================
// == ADMIN PAGE LOGIC (No changes needed here)
// =================================================
function handleAdminPage(db, ADMIN_PASSCODE) {
    // ... The same admin page logic as before ...
}
