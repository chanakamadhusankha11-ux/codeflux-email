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
    // ... [The previous background and theme code goes here for brevity] ...
    
    // --- NOTIFICATION HANDLER ---
    function showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        let icon = 'ℹ️'; // Default info icon
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';

        toast.innerHTML = `
            <div class="icon">${icon}</div>
            <div class="message">${message}</div>
        `;
        
        container.appendChild(toast);

        // Remove the toast after the animation ends
        setTimeout(() => {
            toast.remove();
        }, 4500); // Must be slightly longer than the animation duration
    }

    // --- Main Logic Router ---
    if (document.getElementById('request-btn')) {
        handleUserPage(db, showNotification);
    } else if (document.getElementById('upload-btn')) {
        handleAdminPage(db, ADMIN_PASSCODE, showNotification);
    }
});

// =================================================
// == USER PAGE LOGIC (WITH NOTIFICATIONS)
// =================================================
function handleUserPage(db, showNotification) {
    // DOM Elements
    const requestBtn = document.getElementById('request-btn');
    const emailDisplayEl = document.getElementById('email-display');
    // Flip Elements
    const emailTextFront = document.getElementById('email-text-front');
    const emailTextBack = document.getElementById('email-text-back');
    const flipperFront = document.querySelector('.front');
    const flipperBack = document.querySelector('.back');
    let isFlipped = false;

    // --- MAIN REQUEST LOGIC ---
    requestBtn.addEventListener('click', async () => {
        requestBtn.disabled = true;
        requestBtn.querySelector('.btn-text').textContent = 'REQUESTING...';
        showNotification("Requesting new email...", "info");
        
        try {
            const query = db.collection('emails').where('status', '==', 0).limit(1);
            const snapshot = await query.get();
            if (snapshot.empty) throw new Error("SYSTEM EMPTY");

            const emailDoc = snapshot.docs[0];
            const emailAddress = emailDoc.data().address;
            
            await db.collection('emails').doc(emailDoc.id).update({ status: 1, used_at: new Date() });

            // --- FLIP ANIMATION & NOTIFICATION ---
            const targetTextElement = isFlipped ? emailTextFront : emailTextBack;
            targetTextElement.textContent = emailAddress;
            emailDisplayEl.classList.toggle('flipped');
            isFlipped = !isFlipped;

            showNotification("New email received!", "success");

        } catch (error) {
            showNotification(error.message, "error");
        } finally {
            requestBtn.disabled = false;
            requestBtn.querySelector('.btn-text').textContent = 'REQUEST EMAIL';
        }
    });

    // --- Unified Copy Logic ---
    function copyToClipboard(text) {
        if (text && text.includes('@')) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification(`Copied: ${text}`, "success");
            }).catch(err => {
                showNotification("Failed to copy email.", "error");
            });
        }
    }

    flipperFront.addEventListener('click', () => copyToClipboard(emailTextFront.textContent));
    flipperBack.addEventListener('click', () => copyToClipboard(emailTextBack.textContent));

    // Other helper functions like stats, history can be here
}

// =================================================
// == ADMIN PAGE LOGIC (WITH NOTIFICATIONS)
// =================================================
function handleAdminPage(db, ADMIN_PASSCODE, showNotification) {
    const uploadBtn = document.getElementById('upload-btn');
    const emailInput = document.getElementById('email-input');
    const passcode_input = document.getElementById('passcode-input');

    uploadBtn.addEventListener('click', async () => {
        if (passcode_input.value !== ADMIN_PASSCODE) {
            showNotification('Invalid Passcode!', 'error');
            return;
        }
        
        const text = emailInput.value;
        const newEmails = [...new Set(text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || [])];
        if (newEmails.length === 0) {
            showNotification('No valid emails found to upload.', 'error');
            return;
        }

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
