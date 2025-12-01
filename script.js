// Manga Advent Calendar Logic

// Configuration
const CALENDAR_YEAR = 2025; // Change this to the year you want the calendar for
const TOTAL_DAYS = 24;
const TEST_MODE = new URLSearchParams(window.location.search).has('test');

// Get today's date info
function getTodayInfo() {
    const today = new Date();
    return {
        day: today.getDate(),
        month: today.getMonth() + 1, // 0-indexed
        year: today.getFullYear()
    };
}

// Check if a day is unlocked (December and day has passed or is today)
function isDayUnlocked(dayNumber) {
    // Test mode: all days unlocked
    if (TEST_MODE) {
        return true;
    }

    const today = getTodayInfo();

    // If it's December of the calendar year
    if (today.year === CALENDAR_YEAR && today.month === 12) {
        return dayNumber <= today.day;
    }

    // If we're past December of the calendar year, all days are unlocked
    if (today.year > CALENDAR_YEAR || (today.year === CALENDAR_YEAR && today.month > 12)) {
        return true;
    }

    // Before December, no days are unlocked
    return false;
}

// Check if a day is today
function isToday(dayNumber) {
    const today = getTodayInfo();
    return today.year === CALENDAR_YEAR && today.month === 12 && today.day === dayNumber;
}

// Get opened days from localStorage
function getOpenedDays() {
    const stored = localStorage.getItem('mangavent-opened');
    return stored ? JSON.parse(stored) : [];
}

// Save opened day to localStorage
function saveOpenedDay(dayNumber) {
    const opened = getOpenedDays();
    if (!opened.includes(dayNumber)) {
        opened.push(dayNumber);
        localStorage.setItem('mangavent-opened', JSON.stringify(opened));
    }
}

// Check if a day has been opened
function isDayOpened(dayNumber) {
    return getOpenedDays().includes(dayNumber);
}

// Get image path for a day
function getImagePath(dayNumber, callback) {
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    function tryExtension(extIndex) {
        if (extIndex >= extensions.length) {
            callback(null);
            return;
        }

        const testImg = new Image();
        const path = `images/${dayNumber}.${extensions[extIndex]}`;
        testImg.onload = () => callback(path);
        testImg.onerror = () => tryExtension(extIndex + 1);
        testImg.src = path;
    }

    tryExtension(0);
}

// Create calendar grid
function createCalendar() {
    const calendar = document.getElementById('calendar');

    // Shuffle day positions for a more interesting layout
    const days = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);
    shuffleArray(days);

    days.forEach(dayNumber => {
        const card = document.createElement('div');
        card.className = 'day-card';
        card.dataset.day = dayNumber;

        const unlocked = isDayUnlocked(dayNumber);
        const opened = isDayOpened(dayNumber);
        const today = isToday(dayNumber);

        if (!unlocked) {
            card.classList.add('locked');
        } else if (opened) {
            card.classList.add('opened');
        } else {
            card.classList.add('unlocked');
        }

        if (today) {
            card.classList.add('today');
        }

        if (opened) {
            // Show image thumbnail for opened days
            getImagePath(dayNumber, (imagePath) => {
                if (imagePath) {
                    card.innerHTML = `
                        <img src="${imagePath}" alt="Jour ${dayNumber}" class="card-thumbnail">
                        <span class="day-number-small">${dayNumber}</span>
                        <span class="star-icon">⭐</span>
                    `;
                } else {
                    card.innerHTML = `
                        <span class="day-number">${dayNumber}</span>
                        <span class="star-icon">⭐</span>
                    `;
                }
            });
        } else {
            card.innerHTML = `
                <span class="day-number">${dayNumber}</span>
                ${!unlocked ? '<span class="lock-icon">🔒</span>' : ''}
            `;
        }

        card.addEventListener('click', () => handleDayClick(dayNumber, card));
        calendar.appendChild(card);
    });
}

// Handle day card click
function handleDayClick(dayNumber, card) {
    if (!isDayUnlocked(dayNumber)) {
        // Shake animation for locked days
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 300);

        // Show message
        showLockedMessage(dayNumber);
        return;
    }

    // Mark as opened
    if (!isDayOpened(dayNumber)) {
        saveOpenedDay(dayNumber);
        card.classList.remove('unlocked');
        card.classList.add('opened');

        // Show image thumbnail
        getImagePath(dayNumber, (imagePath) => {
            if (imagePath) {
                card.innerHTML = `
                    <img src="${imagePath}" alt="Jour ${dayNumber}" class="card-thumbnail">
                    <span class="day-number-small">${dayNumber}</span>
                    <span class="star-icon">⭐</span>
                `;
            } else {
                card.innerHTML = `
                    <span class="day-number">${dayNumber}</span>
                    <span class="star-icon">⭐</span>
                `;
            }
        });

        // Confetti effect
        createConfetti();
    }

    // Show the manga image
    showMangaModal(dayNumber);
}

// Show locked message
function showLockedMessage(dayNumber) {
    const messages = [
        `Patience ! Le jour ${dayNumber} se débloque le ${dayNumber} décembre ! 🎄`,
        `Pas encore ! Reviens le ${dayNumber} décembre ! ⏰`,
        `Cette surprise est pour le ${dayNumber} décembre ! 🎁`,
        `Attends ! Encore ${dayNumber - getTodayInfo().day} jour(s) à patienter ! ✨`
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        z-index: 1001;
        animation: slideUp 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Add animation keyframes
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideUp {
                from { transform: translateX(-50%) translateY(100px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Show manga modal
function showMangaModal(dayNumber) {
    const modal = document.getElementById('modal');
    const dayBadge = document.getElementById('dayBadge');
    const mangaImage = document.getElementById('mangaImage');

    dayBadge.textContent = `Jour ${dayNumber}`;

    // Image path - adjust this based on your image naming convention
    // Expects images in 'images/' folder named 1.jpg, 2.png, etc.
    // Try different extensions
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    let imageLoaded = false;

    function tryLoadImage(extIndex) {
        if (extIndex >= extensions.length) {
            // No image found, show placeholder
            mangaImage.src = `https://via.placeholder.com/600x800/1a1a2e/4ecdc4?text=Jour+${dayNumber}`;
            return;
        }

        const testImg = new Image();
        testImg.onload = () => {
            mangaImage.src = `images/${dayNumber}.${extensions[extIndex]}`;
        };
        testImg.onerror = () => {
            tryLoadImage(extIndex + 1);
        };
        testImg.src = `images/${dayNumber}.${extensions[extIndex]}`;
    }

    tryLoadImage(0);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Create confetti effect
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ffd700', '#00d4ff'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
            z-index: 999;
        `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }

    // Add confetti animation if not exists
    if (!document.getElementById('confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
            @keyframes confettiFall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Shuffle array helper
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Reset state
function resetState() {
    if (confirm('Réinitialiser le calendrier ? Toutes les cases seront refermées.')) {
        localStorage.removeItem('mangavent-opened');
        location.reload();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    createCalendar();

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetState);

    // Close modal on button click
    document.getElementById('closeBtn').addEventListener('click', closeModal);

    // Close modal on outside click
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            closeModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Add some fun console messages
console.log('%c🎄 Calendrier de l\'Avent Manga 🎄', 'font-size: 24px; color: #ff6b6b; font-weight: bold;');
