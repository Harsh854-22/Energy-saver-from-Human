// Global variables
let detectionActive = false;
let statusInterval = null;
const UPDATE_INTERVAL = 500; // Update every 500ms
const CO2_PER_KWH = 0.5; // kg CO2 per kWh (approximate)

// DOM Elements
const detectionIndicator = document.getElementById('detection-indicator');
const statusText = document.getElementById('status-text');
const humanCountElement = document.getElementById('human-count');
const energySavedElement = document.getElementById('energy-saved');
const co2SavedElement = document.getElementById('co2-saved');
const cameraStateElement = document.getElementById('camera-state');
const toggleBtn = document.getElementById('toggle-btn');
const resetBtn = document.getElementById('reset-btn');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Human Detection System Initialized');
    
    // Initial status check
    updateStatus();
    
    // Set up event listeners
    toggleBtn.addEventListener('click', toggleDetection);
    resetBtn.addEventListener('click', resetCounters);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Spacebar to toggle detection
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            toggleDetection();
        }
        // R key to reset
        if (e.key === 'r' || e.key === 'R') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                resetCounters();
            }
        }
    });
});

/**
 * Fetch and update status from backend
 */
function updateStatus() {
    fetch('/status')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Status update:', data);
            
            // Update detection indicator
            if (data.human_detected) {
                detectionIndicator.className = 'indicator green';
                statusText.innerHTML = '✅ Human Detected<br><small>Light ON</small>';
            } else {
                detectionIndicator.className = 'indicator red';
                statusText.innerHTML = '❌ No Human Detected<br><small>Light OFF</small>';
            }
            
            // Update human count with animation
            animateValue(humanCountElement, parseInt(humanCountElement.textContent), data.human_count, 300);
            
            // Update energy saved
            const energyValue = data.energy_saved;
            energySavedElement.textContent = energyValue.toFixed(3);
            
            // Calculate and update CO2 saved
            const co2Value = (energyValue / 1000) * CO2_PER_KWH * 1000; // Convert to grams
            co2SavedElement.textContent = co2Value.toFixed(3);
            
            // Update camera status
            if (data.camera_available !== undefined) {
                cameraStateElement.textContent = data.camera_available ? 
                    '✅ Connected' : '⚠️ Simulation Mode';
                cameraStateElement.style.color = data.camera_available ? '#26de81' : '#ffa502';
            }
        })
        .catch(error => {
            console.error('Error fetching status:', error);
            cameraStateElement.textContent = '❌ Connection Error';
            cameraStateElement.style.color = '#ff4757';
        });
}

/**
 * Toggle detection on/off
 */
function toggleDetection() {
    const shouldStart = !detectionActive;
    
    // Disable button during request
    toggleBtn.disabled = true;
    
    fetch('/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start: shouldStart })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Toggle response:', data);
        
        if (data.status === 'started') {
            detectionActive = true;
            statusInterval = setInterval(updateStatus, UPDATE_INTERVAL);
            toggleBtn.innerHTML = '<span class="btn-icon">⏸️</span><span class="btn-text">Stop Detection</span>';
            toggleBtn.classList.remove('btn-primary');
            toggleBtn.classList.add('btn-secondary');
            showNotification('Detection started!', 'success');
        } else if (data.status === 'stopped') {
            detectionActive = false;
            clearInterval(statusInterval);
            statusInterval = null;
            toggleBtn.innerHTML = '<span class="btn-icon">▶️</span><span class="btn-text">Start Detection</span>';
            toggleBtn.classList.remove('btn-secondary');
            toggleBtn.classList.add('btn-primary');
            
            // Reset indicator to red when stopped
            detectionIndicator.className = 'indicator red';
            statusText.innerHTML = '⏸️ Detection Stopped<br><small>Click Start to Resume</small>';
            showNotification('Detection stopped!', 'info');
        }
        
        toggleBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error toggling detection:', error);
        toggleBtn.disabled = false;
        showNotification('Error toggling detection', 'error');
    });
}

/**
 * Reset all counters
 */
function resetCounters() {
    if (!confirm('Are you sure you want to reset all counters?')) {
        return;
    }
    
    resetBtn.disabled = true;
    
    fetch('/reset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Reset response:', data);
        
        // Reset UI elements
        humanCountElement.textContent = '0';
        energySavedElement.textContent = '0.000';
        co2SavedElement.textContent = '0.000';
        
        showNotification('Counters reset successfully!', 'success');
        resetBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error resetting counters:', error);
        showNotification('Error resetting counters', 'error');
        resetBtn.disabled = false;
    });
}

/**
 * Animate number changes
 */
function animateValue(element, start, end, duration) {
    if (start === end) return;
    
    const range = end - start;
    const increment = range / (duration / 16); // 60 FPS
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '8px',
        backgroundColor: type === 'success' ? '#26de81' : 
                        type === 'error' ? '#ff4757' : '#ffa502',
        color: 'white',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: '9999',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '300px'
    });
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);