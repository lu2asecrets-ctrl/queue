// Firebase Configuration Template
// قم بتعديل هذا الملف ووضع إعدادات Firebase الخاصة بك

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArFKjBYsFhsPyJPJpjLhH2eSEHlUFEzhI",
  authDomain: "queue-717d5.firebaseapp.com",
  projectId: "queue-717d5",
  storageBucket: "queue-717d5.firebasestorage.app",
  messagingSenderId: "837806460328",
  appId: "1:837806460328:web:f2070b93a2784b1b25619d",
  measurementId: "G-GM30LE46F6"
};

// Local Storage Fallback Functions
// هذه الدوال تعمل كبديل عندما لا يكون Firebase متاحاً

class LocalStorageDB {
    constructor() {
        this.data = {
            clinics: [],
            settings: {
                centerName: 'المركز الطبي',
                alertDuration: 5,
                news: {
                    content: 'أهلاً وسهلاً بكم في المركز الطبي - نرحب بكم ونتمنى لكم الشفاء العاجل',
                    speed: 30
                },
                audio: {
                    speechSpeed: 1,
                    audioPath: 'audio/'
                },
                video: {
                    videoPath: 'media/'
                }
            },
            calls: [],
            alerts: [],
            clients: []
        };
        this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('queueSystemData');
            if (stored) {
                this.data = { ...this.data, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.log('Using default data');
        }
    }

    saveToStorage() {
        localStorage.setItem('queueSystemData', JSON.stringify(this.data));
    }

    // Clinics operations
    getClinics() {
        return this.data.clinics;
    }

    getClinic(id) {
        return this.data.clinics.find(clinic => clinic.id === id);
    }

    addClinic(clinicData) {
        const id = Date.now().toString();
        const clinic = {
            id,
            ...clinicData,
            currentNumber: 0,
            status: 'active',
            lastCall: null
        };
        this.data.clinics.push(clinic);
        this.saveToStorage();
        return clinic;
    }

    updateClinic(id, updates) {
        const index = this.data.clinics.findIndex(clinic => clinic.id === id);
        if (index !== -1) {
            this.data.clinics[index] = { ...this.data.clinics[index], ...updates };
            this.saveToStorage();
            return this.data.clinics[index];
        }
        return null;
    }

    deleteClinic(id) {
        const index = this.data.clinics.findIndex(clinic => clinic.id === id);
        if (index !== -1) {
            this.data.clinics.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Settings operations
    getSettings() {
        return this.data.settings;
    }

    updateSettings(updates) {
        this.data.settings = { ...this.data.settings, ...updates };
        this.saveToStorage();
        return this.data.settings;
    }

    // Calls operations
    addCall(callData) {
        const call = {
            id: Date.now().toString(),
            ...callData,
            timestamp: Date.now()
        };
        this.data.calls.push(call);
        this.saveToStorage();
        return call;
    }

    getCalls(limit = 10) {
        return this.data.calls.slice(-limit);
    }

    // Alerts operations
    addAlert(alertData) {
        const alert = {
            id: Date.now().toString(),
            ...alertData,
            timestamp: Date.now()
        };
        this.data.alerts.push(alert);
        this.saveToStorage();
        return alert;
    }

    // Clients operations
    addClient(clientData) {
        const client = {
            id: Date.now().toString(),
            ...clientData,
            timestamp: Date.now()
        };
        this.data.clients.push(client);
        this.saveToStorage();
        return client;
    }

    getClients() {
        return this.data.clients;
    }
}

// Initialize local storage database
const localDB = new LocalStorageDB();

// Firebase fallback functions
function initializeFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            return firebase.database();
        }
    } catch (e) {
        console.log('Firebase not available, using local storage');
    }
    return null;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, LocalStorageDB };
}
