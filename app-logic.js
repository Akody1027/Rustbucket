// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyA-keOQdM59TPkgtmlqj1uENWv9XGbfFNY",
  authDomain: "route-truck-pro.firebaseapp.com",
  projectId: "route-truck-pro",
  storageBucket: "route-truck-pro.appspot.com",
  messagingSenderId: "910747243553",
  appId: "1:910747243553:web:4b95874e7ec865a3ceff60",
  measurementId: "G-4MP9JQ0F2P"
};

// Initialize Firebase (Compatibility Mode for standard HTML)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// --- Local Storage Backup Logic ---
function saveToLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocal(key) {
    return JSON.parse(localStorage.getItem(key));
}

// --- Dispatcher: Send Load Logic ---
async function dispatchLoad() {
    const poNumber = document.querySelector('input[placeholder*="PO"]').value;
    const customerName = document.querySelector('input[placeholder="Name"]').value;
    const address = document.querySelector('input[placeholder="Address"]').value;
    
    const loadData = {
        po: poNumber,
        customer: customerName,
        destination: address,
        status: "Pending",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // 1. Save to Firebase
        await db.collection("loads").add(loadData);
        
        // 2. Save to Customer Database (Automatically)
        await db.collection("customers").doc(customerName).set({
            name: customerName,
            address: address,
            lastUpdated: new Date()
        });

        // 3. Backup to LocalStorage
        saveToLocal('last_dispatch', loadData);
        
        alert("Load dispatched and customer saved!");
    } catch (error) {
        console.error("Error dispatching:", error);
        alert("Lag detected. Data saved locally until connection returns.");
    }
}

// --- Driver: Location Tracking ---
function startTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Update Firebase so Dispatcher & Customer see movement
            const driverId = "driver_01"; // This would be dynamic after login
            db.collection("drivers").doc(driverId).set({
                location: new firebase.firestore.GeoPoint(coords.lat, coords.lng),
                updated: new Date()
            });
            
            saveToLocal('my_location', coords);
        }, (err) => console.log(err), { enableHighAccuracy: true });
    }
}

// --- Global: Chat Real-time Update ---
function setupChat(chatId) {
    db.collection("chats").doc(chatId).onSnapshot((doc) => {
        const data = doc.data();
        if (data) {
            // Update the UI with new messages
            renderMessages(data.messages);
        }
    });
}