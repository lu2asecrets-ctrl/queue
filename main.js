// Main JavaScript file for Queue Management System
// يتعامل مع Firebase و localStorage كبديل

// Global variables
let database = null;
let useFirebase = false;

// Initialize system
function initializeSystem() {
    // Try to initialize Firebase
    database = initializeFirebase();
    useFirebase = database !== null;
    
    console.log('System initialized:', useFirebase ? 'Firebase' : 'Local Storage');
    
    // Set up global event listeners
    setupGlobalEventListeners();
}

// Setup global event listeners
function setupGlobalEventListeners() {
    // Handle online/offline status
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    // Handle page visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Handle online status
function handleOnlineStatus() {
    console.log('System is online');
    showNotification('تم الاتصال بالإنترنت', 'success');
}

// Handle offline status
function handleOfflineStatus() {
    console.log('System is offline');
    showNotification('الاتصال مقطوع، سيتم العمل في وضع عدم الاتصال', 'warning');
}

// Handle page visibility
function handleVisibilityChange() {
    if (document.hidden) {
        console.log('Page is hidden');
    } else {
        console.log('Page is visible');
        // Refresh data when page becomes visible
        refreshCurrentPageData();
    }
}

// Refresh current page data
function refreshCurrentPageData() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'display.html':
            if (typeof loadClinics === 'function') loadClinics();
            break;
        case 'admin.html':
            if (typeof loadClinics === 'function') loadClinics();
            if (typeof loadSettings === 'function') loadSettings();
            break;
        case 'control.html':
            if (typeof updateTracking === 'function') updateTracking();
            break;
    }
}

// Database operations wrapper
const dbWrapper = {
    // Clinics operations
    getClinics: function(callback) {
        if (useFirebase) {
            database.ref('clinics').once('value').then(snapshot => {
                const clinics = [];
                snapshot.forEach(child => {
                    clinics.push({ id: child.key, ...child.val() });
                });
                callback(clinics);
            });
        } else {
            callback(localDB.getClinics());
        }
    },

    getClinic: function(id, callback) {
        if (useFirebase) {
            database.ref('clinics/' + id).once('value').then(snapshot => {
                callback(snapshot.val());
            });
        } else {
            callback(localDB.getClinic(id));
        }
    },

    addClinic: function(clinicData, callback) {
        if (useFirebase) {
            const clinicRef = database.ref('clinics').push();
            clinicRef.set(clinicData).then(() => {
                callback({ id: clinicRef.key, ...clinicData });
            });
        } else {
            const clinic = localDB.addClinic(clinicData);
            callback(clinic);
        }
    },

    updateClinic: function(id, updates, callback) {
        if (useFirebase) {
            database.ref('clinics/' + id).update(updates).then(() => {
                callback(true);
            });
        } else {
            const result = localDB.updateClinic(id, updates);
            callback(result !== null);
        }
    },

    deleteClinic: function(id, callback) {
        if (useFirebase) {
            database.ref('clinics/' + id).remove().then(() => {
                callback(true);
            });
        } else {
            const result = localDB.deleteClinic(id);
            callback(result);
        }
    },

    // Settings operations
    getSettings: function(callback) {
        if (useFirebase) {
            database.ref('settings').once('value').then(snapshot => {
                callback(snapshot.val() || {});
            });
        } else {
            callback(localDB.getSettings());
        }
    },

    updateSettings: function(updates, callback) {
        if (useFirebase) {
            database.ref('settings').update(updates).then(() => {
                callback(true);
            });
        } else {
            localDB.updateSettings(updates);
            callback(true);
        }
    },

    // Calls operations
    addCall: function(callData, callback) {
        if (useFirebase) {
            database.ref('calls').push(callData).then(() => {
                callback(true);
            });
        } else {
            localDB.addCall(callData);
            callback(true);
        }
    },

    getRecentCalls: function(limit, callback) {
        if (useFirebase) {
            database.ref('calls').limitToLast(limit).once('value').then(snapshot => {
                const calls = [];
                snapshot.forEach(child => {
                    calls.push({ id: child.key, ...child.val() });
                });
                callback(calls);
            });
        } else {
            callback(localDB.getCalls(limit));
        }
    },

    // Real-time listeners
    onClinicsChange: function(callback) {
        if (useFirebase) {
            database.ref('clinics').on('value', snapshot => {
                const clinics = [];
                snapshot.forEach(child => {
                    clinics.push({ id: child.key, ...child.val() });
                });
                callback(clinics);
            });
        } else {
            // For local storage, we'll just call the callback periodically
            setInterval(() => {
                callback(localDB.getClinics());
            }, 5000);
        }
    },

    onCallsChange: function(callback) {
        if (useFirebase) {
            database.ref('calls').limitToLast(1).on('child_added', snapshot => {
                callback(snapshot.val());
            });
        } else {
            // For local storage, we'll check for new calls periodically
            setInterval(() => {
                const calls = localDB.getCalls(1);
                if (calls.length > 0) {
                    callback(calls[0]);
                }
            }, 5000);
        }
    }
};

// Utility functions
const utils = {
    // Format time
    formatTime: function(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ar-EG');
    },

    // Format date
    formatDate: function(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('ar-EG');
    },

    // Generate random ID
    generateId: function() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    },

    // Play audio file
    playAudio: function(filename) {
        try {
            const audio = new Audio(filename);
            audio.play().catch(e => console.log('Could not play audio:', e));
        } catch (e) {
            console.log('Audio not available:', e);
        }
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('globalNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'globalNotification';
            notification.className = 'fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 hidden';
            document.body.appendChild(notification);
        }

        // Set message and style
        notification.textContent = message;
        notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'error' ? 'bg-red-500' :
            type === 'success' ? 'bg-green-500' :
            type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
        } text-white`;

        // Show notification
        notification.classList.remove('hidden');

        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    },

    // Validate input
    validateNumber: function(value) {
        const num = parseInt(value);
        return !isNaN(num) && num >= 0;
    },

    // Calculate estimated time
    calculateEstimatedTime: function(position, avgTimePerPatient = 15) {
        return position * avgTimePerPatient;
    }
};

// Initialize system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { dbWrapper, utils };
}