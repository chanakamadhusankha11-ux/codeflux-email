document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // == YOUR FIREBASE CONFIGURATION ==
    // =================================================================
    const firebaseConfig = {
      apiKey: "AIzaSyCWmj_CjXpN7ivt-8cqhnv9kH-GMgWNu8A",
      authDomain: "aero-github-db.firebaseapp.com",
      projectId: "aero-github-db",
      storageBucket: "aero-github-db.appspot.com", // Corrected domain
      messagingSenderId: "888535890076",
      appId: "1:888535890076:web:a32193f50bba401e039559",
      measurementId: "G-8JCKEHBRVJ"
    };
    // =================================================================

    // Initialize Firebase using the compatibility library
    try {
        firebase.initializeApp(firebaseConfig);
    } catch (e) {
        console.error("Firebase initialization failed. Please check your config.", e);
        const systemMessage = document.getElementById('system-message');
        if(systemMessage) {
            systemMessage.textContent = "FATAL ERROR: Could not connect to the database.";
            systemMessage.style.color = '#ff4757';
        }
        return; // Stop execution if Firebase fails
    }

    const db = firebase.firestore();
    const ADMIN_PASSCODE = "123456789"; // Your secret admin passcode

    // --- Dynamic Background ---
    const canvas = document.getElementById('background-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, grid;
        const mouse = { x: 0, y: 0, radius: 60 };

        const setup = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            grid = [];
            const cellSize = 20;
            for (let y = 0; y < height + cellSize; y += cellSize) {
                for (let x = 0; x < width + cellSize; x += cellSize) {
                    grid.push({ x, y });
                }
            }
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--grid-color').trim();
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            
            grid.forEach(point => {
                const dist = Math.hypot(point.x - mouse.x, point.y - mouse.y);
                const size = Math.max(0.5, 2 - dist / 150);
                if (dist < mouse.radius) {
                    ctx.fillStyle = primaryColor;
                    ctx.globalAlpha = Math.max(0, 0.8 - dist / mouse.radius);
                } else {
                    ctx.fillStyle = gridColor;
                    ctx.globalAlpha = 0.5;
                }
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(draw);
        };
        
        window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener('resize', setup);
        setup();
        draw();
    }

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('light-mode');
            localStorage.setItem('theme', document.documentElement.classList.contains('light-mode') ? 'light' : 'dark');
        });
    }

    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('light-mode');
    }

    // --- Main Logic ---
    if (document.getElementById('request-btn')) {
        handleUserPage(db);
    } else if (document.getElementById('upload-btn')) {
        handleAdminPage(db, ADMIN_PASSCODE);
    }
});

// =================================================
// == USER PAGE LOGIC (WITH THE FIX)
// =================================================
function handleUserPage(db) {
    const statsCountEl = document.getElementById('stats-count');
    const requestBtn = document.getElementById('request-btn');
    const emailTextEl = document.getElementById('email-text');
    const emailDisplayEl = document.getElementById('email-display');
    const copyFeedbackEl = document.getElementById('copy-feedback');
    const systemMessageEl = document.getElementById('system-message');
    let audioUnlocked = false;

    // Real-time listener for stats
    db.collection('emails').where('status', '==', 0).onSnapshot(snapshot => {
        const currentCount = parseInt(statsCountEl.textContent, 10) || 0;
        const newCount = snapshot.size;
        
        if (currentCount !== newCount) {
            const animateCount = (start, end) => {
                let current = start;
                const duration = 500;
                const range = end - start;
                const startTime = performance.now();
                const step = (timestamp) => {
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    current = start + Math.floor(progress * range);
                    statsCountEl.textContent = current;
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            };
            animateCount(currentCount, newCount);
        } else {
            statsCountEl.textContent = newCount;
        }
    }, error => {
        console.error("Firestore listener error:", error);
        systemMessageEl.textContent = "Error connecting to database. Please refresh.";
        systemMessageEl.style.color = '#ff4757';
    });

    requestBtn.addEventListener('click', async () => {
        if (!audioUnlocked) { audioUnlocked = true; }

        requestBtn.disabled = true;
        requestBtn.querySelector('.btn-text').textContent = 'REQUESTING...';
        
        try {
            const email = await db.runTransaction(async (transaction) => {
                const query = db.collection('emails').where('status', '==', 0).limit(1);
                const snapshot = await transaction.get(query);
                if (snapshot.empty) throw new Error("SYSTEM EMPTY");
                
                const doc = snapshot.docs[0];
                transaction.update(doc.ref, {
                    status: 1,
                    // THE FIX IS HERE: Using client-side timestamp instead of server timestamp
                    used_at: new Date() 
                });
                return doc.data().address;
            });

            emailDisplayEl.classList.remove('popped');
            setTimeout(() => {
                emailTextEl.textContent = email;
                emailTextEl.style.opacity = '1';
                emailDisplayEl.classList.add('popped');
            }, 100);

            systemMessageEl.textContent = '✅ Email received! Click to copy.';
            systemMessageEl.style.color = 'var(--primary)';

        } catch (error) {
            systemMessageEl.textContent = `❌ ${error.message}`;
            systemMessageEl.style.color = '#ff4757';
        } finally {
            requestBtn.disabled = false;
            requestBtn.querySelector('.btn-text').textContent = 'REQUEST EMAIL';
        }
    });

    emailDisplayEl.addEventListener('click', () => {
        const email = emailTextEl.textContent;
        if (email && email.includes('@')) {
            navigator.clipboard.writeText(email).then(() => {
                copyFeedbackEl.classList.add('show');
                setTimeout(() => copyFeedbackEl.classList.remove('show'), 1500);
            });
        }
    });
}

// =================================================
// == ADMIN PAGE LOGIC
// =================================================
function handleAdminPage(db, ADMIN_PASSCODE) {
    const uploadBtn = document.getElementById('upload-btn');
    const emailInput = document.getElementById('email-input');
    const passcode_input = document.getElementById('passcode-input');
    const systemMessageEl = document.getElementById('system-message');

    uploadBtn.addEventListener('click', async () => {
        if (passcode_input.value !== ADMIN_PASSCODE) {
            systemMessageEl.textContent = '❌ Invalid Passcode!';
            systemMessageEl.style.color = '#ff4757';
            return;
        }

        const text = emailInput.value;
        const newEmails = [...new Set(text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || [])];
        if (newEmails.length === 0) {
            systemMessageEl.textContent = '⚠️ No valid emails found.';
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.querySelector('.btn-text').textContent = 'UPLOADING...';
        systemMessageEl.textContent = `Uploading ${newEmails.length} emails...`;
        systemMessageEl.style.color = 'var(--text-secondary)';
        
        const chunks = [];
        for (let i = 0; i < newEmails.length; i += 499) {
            chunks.push(newEmails.slice(i, i + 499));
        }

        try {
            for (const chunk of chunks) {
                const batch = db.batch();
                chunk.forEach(email => {
                    const docRef = db.collection('emails').doc(email.toLowerCase());
                    batch.set(docRef, { address: email.toLowerCase(), status: 0 }, { merge: true });
                });
                await batch.commit();
            }
            systemMessageEl.textContent = `✅ Successfully uploaded ${newEmails.length} emails!`;
            systemMessageEl.style.color = 'var(--primary)';
            emailInput.value = '';
        } catch (error) {
            console.error("Error uploading: ", error);
            systemMessageEl.textContent = `❌ Upload Error: ${error.message}`;
            systemMessageEl.style.color = '#ff4757';
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.querySelector('.btn-text').textContent = 'UPLOAD EMAILS';
        }
    });
}
