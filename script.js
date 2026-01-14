document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // == PREMIUM FIREBASE CONFIGURATION ==
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

    // Initialize Firebase with error handling
    let firebaseApp;
    try {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        console.log('🔥 Firebase initialized successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error);
        showCriticalError('Database connection failed. Please refresh the page.');
        return;
    }

    const db = firebase.firestore();
    const ADMIN_PASSCODE = "123456789";

    // =================================================================
    // == PREMIUM NOTIFICATION SYSTEM ==
    // =================================================================
    function showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container') || createNotificationContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast-premium ${type}`;
        
        // Get appropriate icon
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
                break;
            case 'error':
                icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
                break;
            case 'warning':
                icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
                break;
            default:
                icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
        }
        
        toast.innerHTML = `
            ${icon}
            <div class="toast-message">${message}</div>
            <button class="toast-close" aria-label="Close notification">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="2"/>
                </svg>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);
        
        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
        });
        
        // Auto-remove after duration
        const autoRemove = setTimeout(() => {
            if (toast.parentNode) {
                removeToast(toast);
            }
        }, duration);
        
        // Pause auto-remove on hover
        toast.addEventListener('mouseenter', () => {
            clearTimeout(autoRemove);
        });
        
        toast.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (toast.parentNode) {
                    removeToast(toast);
                }
            }, duration);
        });
    }
    
    function removeToast(toast) {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    }
    
    function createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
    
    function showCriticalError(message) {
        const overlay = document.createElement('div');
        overlay.className = 'critical-error-overlay';
        overlay.innerHTML = `
            <div class="critical-error-modal">
                <div class="error-icon">⚠️</div>
                <h3>Critical Error</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="btn-retry">Retry Connection</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // =================================================================
    // == PREMIUM DYNAMIC BACKGROUND ==
    // =================================================================
    function initAnimatedBackground() {
        const canvas = document.getElementById('background-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        
        // Create particles
        const particles = [];
        const particleCount = Math.min(Math.floor(width * height / 20000), 150);
        
        class Particle {
            constructor() {
                this.reset();
                this.x = Math.random() * width;
                this.y = Math.random() * height;
            }
            
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-primary')
                    .trim() + '20';
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x > width) this.x = 0;
                else if (this.x < 0) this.x = width;
                if (this.y > height) this.y = 0;
                else if (this.y < 0) this.y = height;
            }
            
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-primary')
                            .trim() + Math.max(0, 0.2 - distance / 500);
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            requestAnimationFrame(animate);
        }
        
        // Handle resize
        function handleResize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        
        window.addEventListener('resize', handleResize);
        animate();
    }

    // =================================================================
    // == THEME MANAGEMENT ==
    // =================================================================
    function initThemeManager() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        // Check saved theme or prefer color scheme
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
            document.documentElement.classList.add('light-mode');
        }
        
        // Toggle theme
        themeToggle.addEventListener('click', () => {
            const isLightMode = document.documentElement.classList.toggle('light-mode');
            localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
            
            // Update icon with animation
            const moon = themeToggle.querySelector('.moon');
            const sun = themeToggle.querySelector('.sun');
            
            if (isLightMode) {
                moon.style.transform = 'rotate(90deg) scale(0)';
                sun.style.transform = 'rotate(0deg) scale(1)';
            } else {
                sun.style.transform = 'rotate(90deg) scale(0)';
                moon.style.transform = 'rotate(0deg) scale(1)';
            }
            
            // Show notification
            showNotification(`Switched to ${isLightMode ? 'Light' : 'Dark'} Mode`, 'info', 2000);
        });
        
        // Animate icons initially
        setTimeout(() => {
            const moon = themeToggle.querySelector('.moon');
            const sun = themeToggle.querySelector('.sun');
            const isLightMode = document.documentElement.classList.contains('light-mode');
            
            if (isLightMode) {
                moon.style.display = 'none';
                sun.style.display = 'block';
            } else {
                moon.style.display = 'block';
                sun.style.display = 'none';
            }
        }, 100);
    }

    // =================================================================
    // == PREMIUM REQUEST EMAIL FUNCTIONALITY ==
    // =================================================================
    function initUserPage(db) {
        const requestBtn = document.getElementById('request-btn');
        const emailDisplay = document.getElementById('email-display');
        const emailText = document.getElementById('email-text');
        const statsCount = document.getElementById('stats-count');
        const personalRequests = document.getElementById('personal-requests');
        const personalAvgTime = document.getElementById('personal-avg-time');
        const historyList = document.getElementById('history-list');
        const modal = document.getElementById('delay-modal');
        const countdownTimer = document.getElementById('countdown-timer');
        const modalContent = modal?.querySelector('.modal-content');
        
        let sessionRequests = 0;
        let sessionStartTime = Date.now();
        let requestHistory = JSON.parse(localStorage.getItem('emailHistory') || '[]');
        
        // Initialize real-time stats
        function initRealTimeStats() {
            if (!statsCount) return;
            
            // Real-time listener for available emails
            const unsubscribe = db.collection('emails')
                .where('status', '==', 0)
                .onSnapshot(snapshot => {
                    const count = snapshot.size;
                    statsCount.textContent = count;
                    statsCount.style.color = count > 0 ? '' : 'var(--color-error)';
                    
                    // Update button state
                    if (requestBtn) {
                        requestBtn.disabled = count === 0;
                        requestBtn.title = count === 0 ? 'No emails available' : 'Get a new email';
                    }
                }, error => {
                    console.error('Stats listener error:', error);
                    showNotification('Connection issue - stats may be outdated', 'warning');
                });
                
            return unsubscribe;
        }
        
        // Load history from localStorage
        function loadHistory() {
            if (!historyList || !requestHistory.length) return;
            
            requestHistory.slice(0, 10).forEach(email => {
                addToHistory(email, false);
            });
        }
        
        // Add email to history
        function addToHistory(email, saveToStorage = true) {
            if (!historyList || !email) return;
            
            // Remove placeholder if exists
            const placeholder = historyList.querySelector('.history-placeholder');
            if (placeholder) placeholder.remove();
            
            // Create history item
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const dateString = now.toLocaleDateString();
            
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <span class="history-email">${email}</span>
                <span class="history-time" title="${dateString}">${timeString}</span>
            `;
            
            // Add click to copy functionality
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                copyToClipboard(email);
            });
            
            // Add to beginning of list
            historyList.prepend(li);
            
            // Add to localStorage array
            if (saveToStorage) {
                requestHistory.unshift(email);
                if (requestHistory.length > 20) {
                    requestHistory = requestHistory.slice(0, 20);
                }
                localStorage.setItem('emailHistory', JSON.stringify(requestHistory));
            }
            
            // Limit displayed history
            const items = historyList.querySelectorAll('.history-item');
            if (items.length > 10) {
                items[items.length - 1].remove();
            }
        }
        
        // Copy to clipboard with feedback
        function copyToClipboard(text) {
            if (!text || !text.includes('@')) {
                showNotification('No email to copy', 'error', 2000);
                return;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                // Visual feedback on email display
                if (emailDisplay && emailText.textContent === text) {
                    emailDisplay.classList.add('copied');
                    setTimeout(() => emailDisplay.classList.remove('copied'), 2000);
                }
                
                // Show notification
                showNotification(`📧 Copied: ${text}`, 'success', 3000);
                
                // Add to recent copies
                const recentCopies = JSON.parse(localStorage.getItem('recentCopies') || '[]');
                recentCopies.unshift({
                    email: text,
                    time: new Date().toISOString()
                });
                if (recentCopies.length > 5) recentCopies.pop();
                localStorage.setItem('recentCopies', JSON.stringify(recentCopies));
                
            }).catch(err => {
                console.error('Copy failed:', err);
                showNotification('Failed to copy email', 'error', 3000);
                
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Email copied (fallback method)', 'info', 2000);
            });
        }
        
        // Update personal stats
        function updatePersonalStats() {
            if (!personalRequests || !personalAvgTime) return;
            
            personalRequests.textContent = sessionRequests;
            
            if (sessionRequests > 0) {
                const avgTime = ((Date.now() - sessionStartTime) / 1000 / sessionRequests).toFixed(1);
                personalAvgTime.textContent = `${avgTime}s`;
                personalAvgTime.style.color = avgTime < 5 ? 'var(--color-success)' : 
                                            avgTime < 10 ? 'var(--color-warning)' : 
                                            'var(--color-error)';
            } else {
                personalAvgTime.textContent = '0s';
                personalAvgTime.style.color = '';
            }
        }
        
        // Request new email
        async function requestNewEmail() {
            if (!requestBtn || !emailDisplay || !emailText) return;
            
            // Add loading state
            requestBtn.classList.add('loading');
            requestBtn.disabled = true;
            const originalText = requestBtn.textContent;
            requestBtn.innerHTML = '<span class="loading-spinner"></span> Processing...';
            
            // Show loading animation on email display
            emailDisplay.classList.add('loading-shimmer');
            
            try {
                // Step 1: Get available email
                const snapshot = await db.collection('emails')
                    .where('status', '==', 0)
                    .limit(1)
                    .get();
                
                if (snapshot.empty) {
                    throw new Error('No emails available at the moment. Please try again later.');
                }
                
                const emailDoc = snapshot.docs[0];
                const emailId = emailDoc.id;
                const emailAddress = emailDoc.data().address;
                
                // Step 2: Mark as used with optimistic update
                emailText.textContent = emailAddress;
                emailText.style.opacity = '1';
                
                // Step 3: Update database
                await db.collection('emails').doc(emailId).update({
                    status: 1,
                    used_at: firebase.firestore.FieldValue.serverTimestamp(),
                    session_id: localStorage.getItem('sessionId') || 'unknown'
                });
                
                // Success!
                sessionRequests++;
                updatePersonalStats();
                addToHistory(emailAddress);
                
                // Visual feedback
                emailDisplay.classList.remove('loading-shimmer');
                emailDisplay.style.borderColor = 'var(--color-success)';
                setTimeout(() => {
                    emailDisplay.style.borderColor = '';
                }, 2000);
                
                // Success notification
                showNotification(`✨ New email secured: ${emailAddress}`, 'success', 4000);
                
                // Auto-copy option (if enabled)
                const autoCopy = localStorage.getItem('autoCopy') === 'true';
                if (autoCopy) {
                    setTimeout(() => copyToClipboard(emailAddress), 500);
                }
                
            } catch (error) {
                console.error('Email request error:', error);
                
                // Error handling
                emailText.textContent = 'Error occurred';
                emailText.style.color = 'var(--color-error)';
                setTimeout(() => {
                    emailText.style.color = '';
                }, 3000);
                
                // Show appropriate error message
                if (error.message.includes('No emails available')) {
                    showNotification(error.message, 'warning', 4000);
                } else if (error.message.includes('permission')) {
                    showNotification('Database permission denied', 'error', 4000);
                } else {
                    showNotification('Failed to get email. Please try again.', 'error', 4000);
                }
                
                // Re-enable button sooner for retry
                setTimeout(() => {
                    if (requestBtn) {
                        requestBtn.disabled = false;
                        requestBtn.classList.remove('loading');
                        requestBtn.textContent = originalText;
                    }
                }, 2000);
                
                return;
            } finally {
                // Clean up loading states
                emailDisplay.classList.remove('loading-shimmer');
            }
            
            // Reset button after successful request
            setTimeout(() => {
                if (requestBtn) {
                    requestBtn.disabled = false;
                    requestBtn.classList.remove('loading');
                    requestBtn.textContent = originalText;
                }
            }, 1000);
        }
        
        // Initialize
        function init() {
            // Load history
            loadHistory();
            
            // Set up real-time stats
            const unsubscribe = initRealTimeStats();
            
            // Request button event
            if (requestBtn) {
                requestBtn.addEventListener('click', requestNewEmail);
                
                // Keyboard shortcut: Ctrl/Cmd + R
                document.addEventListener('keydown', (e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                        e.preventDefault();
                        if (!requestBtn.disabled) {
                            requestBtn.click();
                        }
                    }
                });
            }
            
            // Email display click to copy
            if (emailDisplay) {
                emailDisplay.addEventListener('click', () => {
                    const email = emailText?.textContent;
                    if (email && email.includes('@')) {
                        copyToClipboard(email);
                    }
                });
                
                // Keyboard shortcut: Escape to copy current email
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && emailText?.textContent?.includes('@')) {
                        copyToClipboard(emailText.textContent);
                    }
                });
            }
            
            // Initialize personal stats
            updatePersonalStats();
            
            // Cleanup on page unload
            window.addEventListener('beforeunload', () => {
                if (unsubscribe) unsubscribe();
            });
            
            // Show welcome notification
            setTimeout(() => {
                const lastVisit = localStorage.getItem('lastVisit');
                const today = new Date().toDateString();
                
                if (lastVisit !== today) {
                    showNotification('Welcome back! Ready to generate secure emails?', 'info', 5000);
                    localStorage.setItem('lastVisit', today);
                }
            }, 1000);
        }
        
        // Start initialization
        init();
    }

    // =================================================================
    // == PREMIUM ADMIN PAGE FUNCTIONALITY ==
    // =================================================================
    function initAdminPage(db, ADMIN_PASSCODE) {
        const uploadBtn = document.getElementById('upload-btn');
        const emailInput = document.getElementById('email-input');
        const passcodeInput = document.getElementById('passcode-input');
        const statsOverview = document.getElementById('stats-overview');
        
        if (!uploadBtn || !emailInput) return;
        
        // Initialize admin dashboard
        async function initAdminDashboard() {
            try {
                // Get total stats
                const totalEmails = await db.collection('emails').count().get();
                const availableEmails = await db.collection('emails')
                    .where('status', '==', 0)
                    .count()
                    .get();
                const usedEmails = await db.collection('emails')
                    .where('status', '==', 1)
                    .count()
                    .get();
                
                // Update stats display
                if (statsOverview) {
                    statsOverview.innerHTML = `
                        <div class="stat-card">
                            <div class="stat-value">${totalEmails.data().count}</div>
                            <div class="stat-label">Total Emails</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" style="color: var(--color-success)">${availableEmails.data().count}</div>
                            <div class="stat-label">Available</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" style="color: var(--color-warning)">${usedEmails.data().count}</div>
                            <div class="stat-label">Used</div>
                        </div>
                    `;
                }
                
            } catch (error) {
                console.error('Admin dashboard error:', error);
            }
        }
        
        // Process email upload
        async function uploadEmails() {
            // Validate passcode
            if (passcodeInput.value !== ADMIN_PASSCODE) {
                showNotification('Invalid passcode!', 'error', 3000);
                passcodeInput.style.borderColor = 'var(--color-error)';
                setTimeout(() => {
                    passcodeInput.style.borderColor = '';
                }, 2000);
                return;
            }
            
            // Validate input
            const text = emailInput.value.trim();
            if (!text) {
                showNotification('Please enter emails to upload', 'error', 3000);
                emailInput.focus();
                return;
            }
            
            // Extract emails
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
            const rawEmails = text.match(emailRegex) || [];
            
            if (rawEmails.length === 0) {
                showNotification('No valid emails found in the input', 'error', 3000);
                return;
            }
            
            // Clean and deduplicate emails
            const newEmails = [...new Set(rawEmails.map(email => email.toLowerCase().trim()))];
            
            // Check for existing emails
            const existingSnapshot = await db.collection('emails')
                .where('address', 'in', newEmails.slice(0, 10)) // Firestore limit
                .get();
            
            const existingEmails = new Set(existingSnapshot.docs.map(doc => doc.data().address));
            const uniqueEmails = newEmails.filter(email => !existingEmails.has(email));
            
            if (uniqueEmails.length === 0) {
                showNotification('All emails already exist in the database', 'warning', 3000);
                return;
            }
            
            // Prepare for upload
            uploadBtn.disabled = true;
            uploadBtn.classList.add('loading');
            const originalText = uploadBtn.innerHTML;
            uploadBtn.innerHTML = '<span class="loading-spinner"></span> Uploading...';
            
            showNotification(`Preparing to upload ${uniqueEmails.length} emails...`, 'info', 3000);
            
            try {
                // Batch upload in chunks (Firestore limit: 500 operations per batch)
                const chunks = [];
                for (let i = 0; i < uniqueEmails.length; i += 450) {
                    chunks.push(uniqueEmails.slice(i, i + 450));
                }
                
                let totalUploaded = 0;
                let failedUploads = [];
                
                // Process each chunk
                for (const [index, chunk] of chunks.entries()) {
                    const batch = db.batch();
                    
                    chunk.forEach(email => {
                        const docRef = db.collection('emails').doc();
                        batch.set(docRef, {
                            address: email,
                            status: 0,
                            created_at: firebase.firestore.FieldValue.serverTimestamp(),
                            source: 'admin_upload'
                        });
                    });
                    
                    try {
                        await batch.commit();
                        totalUploaded += chunk.length;
                        
                        // Update progress
                        const progress = Math.round(((index + 1) / chunks.length) * 100);
                        uploadBtn.innerHTML = `<span class="loading-spinner"></span> Uploading... ${progress}%`;
                        
                    } catch (error) {
                        console.error('Batch upload error:', error);
                        failedUploads.push(...chunk);
                    }
                }
                
                // Show results
                if (totalUploaded > 0) {
                    showNotification(
                        `✅ Successfully uploaded ${totalUploaded} emails!${failedUploads.length > 0 ? ` (${failedUploads.length} failed)` : ''}`,
                        'success',
                        5000
                    );
                    
                    // Clear input
                    emailInput.value = '';
                    
                    // Refresh stats
                    initAdminDashboard();
                    
                    // Log successful upload
                    await db.collection('admin_logs').add({
                        action: 'email_upload',
                        count: totalUploaded,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        failed_count: failedUploads.length
                    });
                    
                } else {
                    showNotification('No emails were uploaded. Please check the input.', 'error', 4000);
                }
                
                // Show failed emails if any
                if (failedUploads.length > 0) {
                    console.warn('Failed to upload:', failedUploads);
                    showNotification(
                        `${failedUploads.length} emails failed to upload. Check console for details.`,
                        'warning',
                        5000
                    );
                }
                
            } catch (error) {
                console.error('Upload process error:', error);
                showNotification(`Upload failed: ${error.message}`, 'error', 5000);
                
                // Log error
                await db.collection('admin_logs').add({
                    action: 'upload_error',
                    error: error.message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                
            } finally {
                // Reset button
                uploadBtn.disabled = false;
                uploadBtn.classList.remove('loading');
                uploadBtn.innerHTML = originalText;
            }
        }
        
        // Initialize
        function init() {
            // Load admin stats
            initAdminDashboard();
            
            // Upload button event
            uploadBtn.addEventListener('click', uploadEmails);
            
            // Enter key to upload
            emailInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    uploadBtn.click();
                }
            });
            
            // Auto-focus passcode input
            setTimeout(() => {
                if (passcodeInput && !passcodeInput.value) {
                    passcodeInput.focus();
                }
            }, 500);
            
            // Input validation
            emailInput.addEventListener('input', function() {
                const emails = (this.value.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || []);
                if (emails.length > 0) {
                    this.style.borderColor = 'var(--color-success)';
                } else {
                    this.style.borderColor = '';
                }
            });
        }
        
        // Start initialization
        init();
    }

    // =================================================================
    // == INITIALIZE APPLICATION ==
    // =================================================================
    
    // Initialize animations and effects
    initAnimatedBackground();
    initThemeManager();
    
    // Route to appropriate page
    if (document.getElementById('request-btn')) {
        // User page
        initUserPage(db);
        console.log('👤 User page initialized');
    } else if (document.getElementById('upload-btn')) {
        // Admin page
        initAdminPage(db, ADMIN_PASSCODE);
        console.log('🔧 Admin page initialized');
    }
    
    // Add global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + / to toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) themeToggle.click();
        }
        
        // Ctrl/Cmd + L to clear local storage (dev shortcut)
        if ((e.ctrlKey || e.metaKey) && e.key === 'l' && e.shiftKey) {
            if (confirm('Clear all local data?')) {
                localStorage.clear();
                showNotification('Local storage cleared', 'info', 2000);
            }
        }
    });
    
    // Add performance monitoring
    if ('performance' in window) {
        const perfStart = performance.now();
        window.addEventListener('load', () => {
            const loadTime = performance.now() - perfStart;
            console.log(`🚀 Page loaded in ${Math.round(loadTime)}ms`);
            
            if (loadTime > 3000) {
                showNotification('Page loaded completely', 'info', 2000);
            }
        });
    }
});

// =================================================================
// == GLOBAL UTILITY FUNCTIONS ==
// =================================================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll/resize events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Generate a unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Format date for display
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Add CSS for loading spinner
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
    
    .critical-error-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }
    
    .critical-error-modal {
        background: var(--color-surface);
        padding: var(--space-xl);
        border-radius: var(--radius-lg);
        text-align: center;
        max-width: 400px;
        width: 90%;
        border: 2px solid var(--color-error);
    }
    
    .btn-retry {
        background: var(--color-primary);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: var(--radius-md);
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
        transition: all 0.3s ease;
    }
    
    .btn-retry:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-glow);
    }
    
    .toast-close {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }
    
    .toast-close:hover {
        color: var(--color-text-primary);
        background: rgba(255, 255, 255, 0.1);
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
