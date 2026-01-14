// ===================================================
// == AERO SYSTEM - PREMIUM JAVASCRIPT ==
// ===================================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCWmj_CjXpN7ivt-8cqhnv9kH-GMgWNu8A",
    authDomain: "aero-github-db.firebaseapp.com",
    projectId: "aero-github-db",
    storageBucket: "aero-github-db.appspot.com",
    messagingSenderId: "888535890076",
    appId: "1:888535890076:web:a32193f50bba401e039559",
    measurementId: "G-8JCKEHBRVJ"
};

// Admin Configuration
const ADMIN_PASSCODE = "123456789";

// Application State
const AppState = {
    isInitialized: false,
    firebaseApp: null,
    db: null,
    sessionId: null,
    sessionRequests: 0,
    sessionStartTime: Date.now(),
    requestHistory: [],
    autoCopyEnabled: false,
    currentEmail: null
};

// ===================================================
// == UTILITY FUNCTIONS ==
// ===================================================

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

// Generate a unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Format time for display
function formatTime(seconds) {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
        return `${Math.round(seconds / 60)}m`;
    } else {
        return `${Math.round(seconds / 3600)}h`;
    }
}

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Extract emails from text
function extractEmails(text) {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const emails = text.match(emailRegex) || [];
    return [...new Set(emails.map(email => email.toLowerCase().trim()))];
}

// Copy to clipboard with feedback
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    }
}

// ===================================================
// == NOTIFICATION SYSTEM ==
// ===================================================

function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast-premium ${type}`;
    
    // Set icon based on type
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
    
    return toast;
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

// ===================================================
// == ANIMATED BACKGROUND ==
// ===================================================

function initAnimatedBackground() {
    const canvas = document.getElementById('background-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = [];
    const particleCount = Math.min(Math.floor(width * height / 15000), 100);
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-primary')
                .trim() + '30';
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Wrap around edges
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
    
    // Create particles
    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Draw connections between particles
    function drawConnections() {
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
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        drawConnections();
        
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
        createParticles();
    }
    
    // Initialize
    createParticles();
    animate();
    
    // Event listeners
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    
    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Add interactive effect
        particles.forEach(particle => {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const force = (150 - distance) / 150;
                particle.x += dx * force * 0.02;
                particle.y += dy * force * 0.02;
            }
        });
    });
}

// ===================================================
// == THEME MANAGEMENT ==
// ===================================================

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
            if (moon) moon.style.transform = 'rotate(90deg) scale(0)';
            if (sun) sun.style.transform = 'rotate(0deg) scale(1)';
        } else {
            if (sun) sun.style.transform = 'rotate(90deg) scale(0)';
            if (moon) moon.style.transform = 'rotate(0deg) scale(1)';
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
            if (moon) moon.style.display = 'none';
            if (sun) sun.style.display = 'block';
        } else {
            if (moon) moon.style.display = 'block';
            if (sun) sun.style.display = 'none';
        }
    }, 100);
}

// ===================================================
// == INITIALIZE FIREBASE ==
// ===================================================

async function initializeFirebase() {
    if (AppState.isInitialized) return AppState.db;
    
    try {
        // Check if Firebase is already initialized
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded');
        }
        
        // Initialize Firebase
        AppState.firebaseApp = firebase.initializeApp(firebaseConfig);
        AppState.db = firebase.firestore();
        AppState.isInitialized = true;
        
        console.log('🔥 Firebase initialized successfully');
        return AppState.db;
        
    } catch (error) {
        console.error('Firebase initialization error:', error);
        showCriticalError('Database connection failed. Please check your internet connection and refresh the page.');
        throw error;
    }
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

// ===================================================
// == USER PAGE FUNCTIONALITY ==
// ===================================================

async function initUserPage(db) {
    // Elements
    const requestBtn = document.getElementById('request-btn');
    const emailDisplay = document.getElementById('email-display');
    const emailText = document.getElementById('email-text');
    const statsCount = document.getElementById('stats-count');
    const personalRequests = document.getElementById('personal-requests');
    const personalAvgTime = document.getElementById('personal-avg-time');
    const sessionDuration = document.getElementById('session-duration');
    const successRate = document.getElementById('success-rate');
    const historyList = document.getElementById('history-list');
    const historyCount = document.getElementById('history-count');
    const clearHistoryBtn = document.getElementById('clear-history');
    const exportHistoryBtn = document.getElementById('export-history');
    const refreshStatsBtn = document.getElementById('refresh-stats');
    const autoCopyToggle = document.getElementById('auto-copy-toggle');
    const modal = document.getElementById('delay-modal');
    const countdownTimer = document.getElementById('countdown-timer');
    const modalClose = modal?.querySelector('.modal-close');
    const copyBtn = emailDisplay?.querySelector('.copy-btn');
    
    // Initialize state
    AppState.sessionId = generateSessionId();
    AppState.requestHistory = JSON.parse(localStorage.getItem('emailHistory') || '[]');
    AppState.autoCopyEnabled = localStorage.getItem('autoCopy') === 'true';
    
    // Update UI from state
    if (autoCopyToggle) {
        autoCopyToggle.checked = AppState.autoCopyEnabled;
    }
    
    // Load history from localStorage
    function loadHistory() {
        if (!historyList) return;
        
        // Clear existing items except placeholder
        const placeholder = historyList.querySelector('.history-placeholder');
        if (placeholder) placeholder.remove();
        
        const items = historyList.querySelectorAll('.history-item');
        items.forEach(item => item.remove());
        
        // Add history items
        if (AppState.requestHistory.length === 0) {
            historyList.innerHTML = `
                <li class="history-placeholder">
                    <div class="placeholder-icon">📭</div>
                    <div class="placeholder-text">
                        <p>No emails generated yet</p>
                        <small>Click "Request New Email" to start</small>
                    </div>
                </li>
            `;
            if (historyCount) historyCount.textContent = '0';
        } else {
            AppState.requestHistory.slice(0, 10).forEach(email => {
                addToHistory(email, false);
            });
            if (historyCount) historyCount.textContent = AppState.requestHistory.length;
        }
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
        
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <span class="history-email">${email}</span>
            <span class="history-time" title="${now.toLocaleString()}">${timeString}</span>
        `;
        
        // Add click to copy functionality
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            copyEmailToClipboard(email);
        });
        
        // Add to beginning of list
        historyList.prepend(li);
        
        // Add to localStorage array
        if (saveToStorage) {
            AppState.requestHistory.unshift(email);
            if (AppState.requestHistory.length > 20) {
                AppState.requestHistory = AppState.requestHistory.slice(0, 20);
            }
            localStorage.setItem('emailHistory', JSON.stringify(AppState.requestHistory));
        }
        
        // Update history count
        if (historyCount) {
            const items = historyList.querySelectorAll('.history-item');
            historyCount.textContent = items.length;
        }
        
        // Limit displayed history
        const items = historyList.querySelectorAll('.history-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }
    }
    
    // Copy email to clipboard with feedback
    async function copyEmailToClipboard(email) {
        if (!email || !email.includes('@')) {
            showNotification('No email to copy', 'error', 2000);
            return;
        }
        
        const success = await copyToClipboard(email);
        
        if (success) {
            // Visual feedback on email display
            if (emailDisplay && emailText.textContent === email) {
                emailDisplay.classList.add('copied');
                setTimeout(() => emailDisplay.classList.remove('copied'), 2000);
            }
            
            // Show notification
            showNotification(`📧 Copied: ${email}`, 'success', 3000);
        } else {
            showNotification('Failed to copy email', 'error', 3000);
        }
    }
    
    // Update personal stats
    function updatePersonalStats() {
        if (!personalRequests || !personalAvgTime || !sessionDuration || !successRate) return;
        
        // Update session requests
        personalRequests.textContent = AppState.sessionRequests;
        
        // Update average time
        if (AppState.sessionRequests > 0) {
            const avgTime = ((Date.now() - AppState.sessionStartTime) / 1000 / AppState.sessionRequests).toFixed(1);
            personalAvgTime.textContent = `${avgTime}s`;
            personalAvgTime.style.color = avgTime < 5 ? 'var(--color-success)' : 
                                        avgTime < 10 ? 'var(--color-warning)' : 
                                        'var(--color-error)';
        } else {
            personalAvgTime.textContent = '0s';
            personalAvgTime.style.color = '';
        }
        
        // Update session duration
        const duration = (Date.now() - AppState.sessionStartTime) / 1000;
        sessionDuration.textContent = formatTime(duration);
        
        // Update success rate (simplified)
        successRate.textContent = AppState.sessionRequests > 0 ? '100%' : '100%';
        successRate.style.color = 'var(--color-success)';
    }
    
    // Initialize real-time stats
    function initRealTimeStats() {
        if (!statsCount || !db) return;
        
        // Real-time listener for available emails
        return db.collection('emails')
            .where('status', '==', 0)
            .onSnapshot(snapshot => {
                const count = snapshot.size;
                if (statsCount) {
                    statsCount.textContent = count;
                    statsCount.style.color = count > 0 ? '' : 'var(--color-error)';
                }
                
                // Update button state
                if (requestBtn) {
                    requestBtn.disabled = count === 0;
                    requestBtn.title = count === 0 ? 'No emails available' : 'Get a new email';
                }
            }, error => {
                console.error('Stats listener error:', error);
                showNotification('Connection issue - stats may be outdated', 'warning');
            });
    }
    
    // Request new email
    async function requestNewEmail() {
        if (!requestBtn || !emailDisplay || !emailText || !db) return;
        
        // Check if button is already disabled
        if (requestBtn.disabled) return;
        
        // Add loading state
        requestBtn.disabled = true;
        requestBtn.classList.add('loading');
        const originalText = requestBtn.querySelector('.button-text')?.textContent || 'REQUEST NEW EMAIL';
        if (requestBtn.querySelector('.button-text')) {
            requestBtn.querySelector('.button-text').textContent = 'PROCESSING...';
        }
        
        // Show loading animation on email display
        emailDisplay.classList.add('loading-shimmer');
        
        try {
            // Show modal with countdown
            if (modal) {
                modal.style.display = 'flex';
                setTimeout(() => modal.classList.add('visible'), 10);
                
                // Start countdown animation
                let countdown = 3;
                countdownTimer.textContent = countdown;
                
                const countdownInterval = setInterval(() => {
                    countdown--;
                    if (countdown > 0) {
                        countdownTimer.textContent = countdown;
                    } else {
                        countdownTimer.textContent = '✓';
                        clearInterval(countdownInterval);
                    }
                }, 1000);
                
                // Animate progress steps
                const steps = modal.querySelectorAll('.step');
                steps.forEach((step, index) => {
                    setTimeout(() => {
                        step.classList.add('active');
                    }, index * 750);
                });
            }
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Get available email from database
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
            
            // Mark as used in database
            await db.collection('emails').doc(emailId).update({
                status: 1,
                used_at: firebase.firestore.FieldValue.serverTimestamp(),
                session_id: AppState.sessionId
            });
            
            // Success - update UI
            emailText.textContent = emailAddress;
            emailText.style.opacity = '1';
            AppState.currentEmail = emailAddress;
            
            // Update session stats
            AppState.sessionRequests++;
            updatePersonalStats();
            addToHistory(emailAddress);
            
            // Remove loading states
            emailDisplay.classList.remove('loading-shimmer');
            emailDisplay.style.borderColor = 'var(--color-success)';
            setTimeout(() => {
                emailDisplay.style.borderColor = '';
            }, 2000);
            
            // Auto-copy if enabled
            if (AppState.autoCopyEnabled) {
                setTimeout(() => copyEmailToClipboard(emailAddress), 500);
            }
            
            // Success notification
            showNotification(`✨ New email secured: ${emailAddress}`, 'success', 4000);
            
        } catch (error) {
            console.error('Email request error:', error);
            
            // Error handling
            if (emailText) {
                emailText.textContent = 'Error occurred';
                emailText.style.color = 'var(--color-error)';
                setTimeout(() => {
                    if (emailText) {
                        emailText.style.color = '';
                        emailText.textContent = 'Click below to generate email';
                    }
                }, 3000);
            }
            
            // Show appropriate error message
            if (error.message.includes('No emails available')) {
                showNotification(error.message, 'warning', 4000);
            } else if (error.message.includes('permission') || error.message.includes('Firebase')) {
                showNotification('Database connection error. Please refresh the page.', 'error', 4000);
            } else {
                showNotification('Failed to get email. Please try again.', 'error', 4000);
            }
            
        } finally {
            // Close modal
            if (modal) {
                modal.classList.remove('visible');
                setTimeout(() => {
                    modal.style.display = 'none';
                    // Reset modal
                    countdownTimer.textContent = '3';
                    const steps = modal.querySelectorAll('.step');
                    steps.forEach(step => step.classList.remove('active'));
                }, 300);
            }
            
            // Reset button
            if (requestBtn) {
                requestBtn.disabled = false;
                requestBtn.classList.remove('loading');
                if (requestBtn.querySelector('.button-text')) {
                    requestBtn.querySelector('.button-text').textContent = originalText;
                }
            }
            
            // Remove loading shimmer
            if (emailDisplay) {
                emailDisplay.classList.remove('loading-shimmer');
            }
        }
    }
    
    // Event Listeners
    
    // Request button
    if (requestBtn) {
        requestBtn.addEventListener('click', requestNewEmail);
    }
    
    // Email display click to copy
    if (emailDisplay) {
        emailDisplay.addEventListener('click', () => {
            const email = emailText?.textContent;
            if (email && email.includes('@')) {
                copyEmailToClipboard(email);
            }
        });
    }
    
    // Copy button
    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const email = emailText?.textContent;
            if (email && email.includes('@')) {
                copyEmailToClipboard(email);
            }
        });
    }
    
    // Auto-copy toggle
    if (autoCopyToggle) {
        autoCopyToggle.addEventListener('change', (e) => {
            AppState.autoCopyEnabled = e.target.checked;
            localStorage.setItem('autoCopy', AppState.autoCopyEnabled);
            
            showNotification(
                AppState.autoCopyEnabled 
                    ? 'Auto-copy enabled' 
                    : 'Auto-copy disabled',
                'info',
                2000
            );
        });
    }
    
    // Clear history button
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (AppState.requestHistory.length === 0) return;
            
            if (confirm('Clear all email history?')) {
                AppState.requestHistory = [];
                localStorage.removeItem('emailHistory');
                loadHistory();
                showNotification('History cleared', 'success', 2000);
            }
        });
    }
    
    // Export history button
    if (exportHistoryBtn) {
        exportHistoryBtn.addEventListener('click', () => {
            if (AppState.requestHistory.length === 0) {
                showNotification('No history to export', 'warning', 2000);
                return;
            }
            
            const data = {
                exportedAt: new Date().toISOString(),
                count: AppState.requestHistory.length,
                emails: AppState.requestHistory
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aero-history-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification(`Exported ${AppState.requestHistory.length} emails`, 'success', 3000);
        });
    }
    
    // Refresh stats button
    if (refreshStatsBtn) {
        refreshStatsBtn.addEventListener('click', () => {
            if (statsCount) {
                statsCount.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    statsCount.style.transform = 'scale(1)';
                }, 300);
            }
            showNotification('Refreshing stats...', 'info', 1000);
        });
    }
    
    // Modal close button
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('visible');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + R to request new email
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            if (requestBtn && !requestBtn.disabled) {
                requestBtn.click();
            }
        }
        
        // Escape to copy current email
        if (e.key === 'Escape' && emailText?.textContent?.includes('@')) {
            copyEmailToClipboard(emailText.textContent);
        }
        
        // Ctrl/Cmd + / to toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) themeToggle.click();
        }
    });
    
    // Initialize
    function init() {
        // Load history
        loadHistory();
        
        // Set up real-time stats
        const unsubscribe = initRealTimeStats();
        
        // Update personal stats
        updatePersonalStats();
        
        // Set up session timer
        setInterval(updatePersonalStats, 10000);
        
        // Show welcome notification
        setTimeout(() => {
            const lastVisit = localStorage.getItem('lastVisit');
            const today = new Date().toDateString();
            
            if (lastVisit !== today) {
                showNotification('Welcome back! Ready to generate secure emails?', 'info', 5000);
                localStorage.setItem('lastVisit', today);
            }
            
            // Show tips notification
            setTimeout(() => {
                showNotification('💡 Tip: Press Ctrl+R to quickly generate emails', 'info', 4000);
            }, 3000);
        }, 1000);
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (unsubscribe) unsubscribe();
        });
    }
    
    // Start initialization
    init();
}

// ===================================================
// == ADMIN PAGE FUNCTIONALITY ==
// ===================================================

async function initAdminPage(db) {
    // Elements
    const uploadBtn = document.getElementById('upload-btn');
    const emailInput = document.getElementById('email-input');
    const passcodeInput = document.getElementById('passcode-input');
    const emailCount = document.getElementById('email-count');
    const totalEmails = document.getElementById('total-emails');
    const availableEmails = document.getElementById('available-emails');
    const usedEmails = document.getElementById('used-emails');
    const adminSuccessRate = document.getElementById('success-rate');
    const activityList = document.getElementById('activity-list');
    const refreshStatsBtn = document.getElementById('refresh-stats-btn');
    const clearDbBtn = document.getElementById('clear-db-btn');
    const exportDataBtn = document.getElementById('export-data-btn');
    const viewLogsBtn = document.getElementById('view-logs-btn');
    const skipDuplicatesToggle = document.getElementById('skip-duplicates');
    const validateEmailsToggle = document.getElementById('validate-emails');
    
    // Update email count in real-time
    function updateEmailCount() {
        if (!emailInput || !emailCount) return;
        
        const text = emailInput.value;
        const emails = extractEmails(text);
        const validEmails = emails.filter(email => isValidEmail(email));
        
        emailCount.textContent = `${validEmails.length} valid emails detected`;
        emailCount.style.color = validEmails.length > 0 ? 'var(--color-success)' : 'var(--color-error)';
        
        // Update input border color
        if (validEmails.length > 0) {
            emailInput.style.borderColor = 'var(--color-success)';
        } else if (text.trim() !== '') {
            emailInput.style.borderColor = 'var(--color-error)';
        } else {
            emailInput.style.borderColor = '';
        }
    }
    
    // Load admin dashboard stats
    async function loadDashboardStats() {
        try {
            // Get total emails count
            const totalSnapshot = await db.collection('emails').count().get();
            if (totalEmails) totalEmails.textContent = totalSnapshot.data().count;
            
            // Get available emails count
            const availableSnapshot = await db.collection('emails')
                .where('status', '==', 0)
                .count()
                .get();
            if (availableEmails) {
                availableEmails.textContent = availableSnapshot.data().count;
                availableEmails.style.color = availableSnapshot.data().count > 0 
                    ? 'var(--color-success)' 
                    : 'var(--color-error)';
            }
            
            // Get used emails count
            const usedSnapshot = await db.collection('emails')
                .where('status', '==', 1)
                .count()
                .get();
            if (usedEmails) usedEmails.textContent = usedSnapshot.data().count;
            
            // Calculate success rate
            if (adminSuccessRate && totalSnapshot.data().count > 0) {
                const successRate = Math.round((availableSnapshot.data().count / totalSnapshot.data().count) * 100);
                adminSuccessRate.textContent = `${successRate}%`;
                adminSuccessRate.style.color = successRate > 80 
                    ? 'var(--color-success)' 
                    : successRate > 50 
                    ? 'var(--color-warning)' 
                    : 'var(--color-error)';
            }
            
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            showNotification('Failed to load dashboard stats', 'error');
        }
    }
    
    // Load recent activity
    async function loadRecentActivity() {
        if (!activityList) return;
        
        try {
            const snapshot = await db.collection('admin_logs')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();
            
            if (snapshot.empty) {
                activityList.innerHTML = `
                    <div class="activity-placeholder">
                        <div class="placeholder-icon">📊</div>
                        <div class="placeholder-text">
                            <p>No recent activity</p>
                            <small>Upload emails to see activity logs</small>
                        </div>
                    </div>
                `;
                return;
            }
            
            activityList.innerHTML = '';
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                
                let icon = '📝';
                let title = 'Activity';
                let description = '';
                
                if (data.action === 'email_upload') {
                    icon = '📤';
                    title = 'Email Upload';
                    description = `Uploaded ${data.count} emails${data.failed_count > 0 ? ` (${data.failed_count} failed)` : ''}`;
                } else if (data.action === 'upload_error') {
                    icon = '❌';
                    title = 'Upload Error';
                    description = data.error || 'Unknown error';
                }
                
                const time = data.timestamp?.toDate 
                    ? data.timestamp.toDate().toLocaleString() 
                    : new Date().toLocaleString();
                
                activityItem.innerHTML = `
                    <div class="activity-icon">${icon}</div>
                    <div class="activity-content">
                        <div class="activity-title">${title}</div>
                        <div class="activity-description">${description}</div>
                        <div class="activity-time">${time}</div>
                    </div>
                `;
                
                activityList.appendChild(activityItem);
            });
            
        } catch (error) {
            console.error('Error loading activity:', error);
            activityList.innerHTML = `
                <div class="activity-placeholder">
                    <div class="placeholder-icon">⚠️</div>
                    <div class="placeholder-text">
                        <p>Failed to load activity</p>
                        <small>${error.message}</small>
                    </div>
                </div>
            `;
        }
    }
    
    // Upload emails function
    async function uploadEmails() {
        if (!uploadBtn || !emailInput || !passcodeInput || !db) return;
        
        // Validate passcode
        if (passcodeInput.value !== ADMIN_PASSCODE) {
            showNotification('Invalid passcode!', 'error', 3000);
            passcodeInput.style.borderColor = 'var(--color-error)';
            setTimeout(() => {
                passcodeInput.style.borderColor = '';
            }, 2000);
            return;
        }
        
        // Get and validate emails
        const text = emailInput.value.trim();
        if (!text) {
            showNotification('Please enter emails to upload', 'error', 3000);
            emailInput.focus();
            return;
        }
        
        // Extract emails
        let emails = extractEmails(text);
        
        // Validate emails if toggle is enabled
        if (validateEmailsToggle && validateEmailsToggle.checked) {
            emails = emails.filter(email => isValidEmail(email));
        }
        
        if (emails.length === 0) {
            showNotification('No valid emails found in the input', 'error', 3000);
            return;
        }
        
        // Prepare for upload
        uploadBtn.disabled = true;
        uploadBtn.classList.add('loading');
        const originalText = uploadBtn.querySelector('.button-text')?.textContent || 'UPLOAD EMAILS';
        if (uploadBtn.querySelector('.button-text')) {
            uploadBtn.querySelector('.button-text').textContent = 'UPLOADING...';
        }
        
        showNotification(`Preparing to upload ${emails.length} emails...`, 'info', 3000);
        
        try {
            // Check for existing emails if skip duplicates is enabled
            let emailsToUpload = emails;
            if (skipDuplicatesToggle && skipDuplicatesToggle.checked) {
                // Check first 10 emails to see if any exist (Firestore limit for 'in' queries)
                const sampleEmails = emails.slice(0, 10);
                const existingSnapshot = await db.collection('emails')
                    .where('address', 'in', sampleEmails)
                    .get();
                
                const existingEmails = new Set(existingSnapshot.docs.map(doc => doc.data().address));
                emailsToUpload = emails.filter(email => !existingEmails.has(email));
                
                if (emailsToUpload.length === 0) {
                    showNotification('All emails already exist in the database', 'warning', 3000);
                    return;
                }
                
                if (emailsToUpload.length < emails.length) {
                    showNotification(`Skipping ${emails.length - emailsToUpload.length} duplicate emails`, 'info', 2000);
                }
            }
            
            // Batch upload in chunks (Firestore limit: 500 operations per batch)
            const chunks = [];
            for (let i = 0; i < emailsToUpload.length; i += 450) {
                chunks.push(emailsToUpload.slice(i, i + 450));
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
                    if (uploadBtn.querySelector('.button-text')) {
                        uploadBtn.querySelector('.button-text').textContent = `UPLOADING... ${progress}%`;
                    }
                    
                } catch (error) {
                    console.error('Batch upload error:', error);
                    failedUploads.push(...chunk);
                }
            }
            
            // Log the upload
            await db.collection('admin_logs').add({
                action: 'email_upload',
                count: totalUploaded,
                failed_count: failedUploads.length,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Show results
            if (totalUploaded > 0) {
                showNotification(
                    `✅ Successfully uploaded ${totalUploaded} emails!${failedUploads.length > 0 ? ` (${failedUploads.length} failed)` : ''}`,
                    'success',
                    5000
                );
                
                // Clear input
                if (emailInput) emailInput.value = '';
                
                // Refresh stats
                await loadDashboardStats();
                await loadRecentActivity();
                
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
            if (uploadBtn) {
                uploadBtn.disabled = false;
                uploadBtn.classList.remove('loading');
                if (uploadBtn.querySelector('.button-text')) {
                    uploadBtn.querySelector('.button-text').textContent = originalText;
                }
            }
        }
    }
    
    // Clear used emails
    async function clearUsedEmails() {
        if (!confirm('Are you sure you want to clear all used emails? This action cannot be undone.')) {
            return;
        }
        
        try {
            showNotification('Clearing used emails...', 'info');
            
            // Get all used emails
            const snapshot = await db.collection('emails')
                .where('status', '==', 1)
                .get();
            
            if (snapshot.empty) {
                showNotification('No used emails to clear', 'info', 3000);
                return;
            }
            
            // Delete in batches
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            showNotification(`Cleared ${snapshot.size} used emails`, 'success', 3000);
            await loadDashboardStats();
            
        } catch (error) {
            console.error('Error clearing used emails:', error);
            showNotification('Failed to clear used emails', 'error', 3000);
        }
    }
    
    // Export database data
    async function exportDatabaseData() {
        try {
            showNotification('Exporting data...', 'info');
            
            const snapshot = await db.collection('emails').get();
            const data = {
                exportedAt: new Date().toISOString(),
                total: snapshot.size,
                emails: snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aero-database-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification(`Exported ${snapshot.size} emails`, 'success', 3000);
            
        } catch (error) {
            console.error('Error exporting data:', error);
            showNotification('Failed to export data', 'error', 3000);
        }
    }
    
    // Event Listeners
    
    // Update email count in real-time
    if (emailInput) {
        emailInput.addEventListener('input', debounce(updateEmailCount, 300));
    }
    
    // Upload button
    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadEmails);
    }
    
    // Enter key to trigger upload
    if (emailInput) {
        emailInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (uploadBtn && !uploadBtn.disabled) {
                    uploadBtn.click();
                }
            }
        });
    }
    
    // Quick action buttons
    if (refreshStatsBtn) {
        refreshStatsBtn.addEventListener('click', async () => {
            refreshStatsBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                if (refreshStatsBtn) refreshStatsBtn.style.transform = 'scale(1)';
            }, 300);
            
            await loadDashboardStats();
            await loadRecentActivity();
            showNotification('Dashboard refreshed', 'success', 2000);
        });
    }
    
    if (clearDbBtn) {
        clearDbBtn.addEventListener('click', clearUsedEmails);
    }
    
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportDatabaseData);
    }
    
    if (viewLogsBtn) {
        viewLogsBtn.addEventListener('click', async () => {
            await loadRecentActivity();
            showNotification('Activity logs loaded', 'info', 2000);
        });
    }
    
    // Auto-focus passcode input
    setTimeout(() => {
        if (passcodeInput && !passcodeInput.value) {
            passcodeInput.focus();
        }
    }, 500);
    
    // Initialize
    async function init() {
        // Load initial data
        await loadDashboardStats();
        await loadRecentActivity();
        
        // Update email count
        updateEmailCount();
        
        // Set up periodic refresh
        setInterval(async () => {
            await loadDashboardStats();
        }, 30000); // Refresh every 30 seconds
    }
    
    // Start initialization
    init();
}

// ===================================================
// == MAIN INITIALIZATION ==
// ===================================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize animated background
        initAnimatedBackground();
        
        // Initialize theme manager
        initThemeManager();
        
        // Initialize Firebase
        const db = await initializeFirebase();
        
        // Route to appropriate page
        if (document.getElementById('request-btn')) {
            // User page
            await initUserPage(db);
            console.log('👤 User page initialized');
        } else if (document.getElementById('upload-btn')) {
            // Admin page
            await initAdminPage(db);
            console.log('🔧 Admin page initialized');
        }
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + L to clear local storage (dev shortcut)
            if ((e.ctrlKey || e.metaKey) && e.key === 'l' && e.shiftKey) {
                if (confirm('Clear all local data?')) {
                    localStorage.clear();
                    showNotification('Local storage cleared', 'info', 2000);
                    setTimeout(() => window.location.reload(), 1000);
                }
            }
        });
        
        // Performance monitoring
        if ('performance' in window) {
            const perfStart = performance.now();
            window.addEventListener('load', () => {
                const loadTime = performance.now() - perfStart;
                console.log(`🚀 Page loaded in ${Math.round(loadTime)}ms`);
            });
        }
        
    } catch (error) {
        console.error('Application initialization failed:', error);
        // Error already handled by showCriticalError
    }
});
