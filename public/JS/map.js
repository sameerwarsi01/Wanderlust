const mapDiv = document.getElementById("map");

if (mapDiv && typeof L !== "undefined" && window.coordinates?.length === 2) {
    const longitude = window.coordinates[0];
    const latitude = window.coordinates[1];

    const map = L.map("map").setView([latitude, longitude], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(window.listingTitle || "Listing")
        .openPopup();
}