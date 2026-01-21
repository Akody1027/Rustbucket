const GOOGLE_MAPS_API_KEY = "AIzaSyDpSeGraT4Oee7tU5WjCfPr9Dskd0smdmU";
let map, directionsService, directionsRenderer;
let markers = [];

// Initialize Map
function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
        center: { lat: 41.8781, lng: -87.6298 }, // Default view
        disableDefaultUI: true,
        styles: [ /* Optional: Add neutral styling here */ ]
    });
    
    directionsRenderer.setMap(map);
}

// 1. Calculate & Link All Stops
async function calculateRoute() {
    const stopElements = document.querySelectorAll('.stop-box');
    const waypoints = [];
    const origin = stopElements[0].querySelector('.addr-input').value;
    const destination = stopElements[stopElements.length - 1].querySelector('.addr-input').value;

    // Build intermediate stops (waypoints)
    for (let i = 1; i < stopElements.length - 1; i++) {
        waypoints.push({
            location: stopElements[i].querySelector('.addr-input').value,
            stopover: true
        });
    }

    const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: 'DRIVING',
        optimizeWaypoints: false // Set to true for the "Optimize" button
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            // Save calculated trip to Firebase
            saveTripToFirebase(result);
        } else {
            alert('Route calculation failed due to ' + status);
        }
    });
}

// 2. Optimize Route (Reorders for best efficiency)
function optimizeRoute() {
    // Same as calculateRoute but sets optimizeWaypoints: true
    // This allows the dispatcher to let Google choose the best order
    calculateRoute(true);
}

// 3. Save Customer to Database
function saveCustomerInfo(name, address) {
    db.collection("customers").doc(name).set({
        address: address,
        lastModified: new Date()
    }).then(() => console.log("Customer saved to DB"));
}