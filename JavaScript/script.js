   let towns = [
            { name: "New York", coordinates: [40.7128, -74.0060], info: "The Big Apple" },
            { name: "Los Angeles", coordinates: [34.0522, -118.2437], info: "City of Angels" },
            { name: "Chicago", coordinates: [41.8781, -87.6298], info: "The Windy City" },
            { name: "Houston", coordinates: [29.7604, -95.3698], info: "Space City" },
            { name: "Phoenix", coordinates: [33.4484, -112.0740], info: "Valley of the Sun" }
        ];

        // Initialize map
        const map = L.map('map').setView([39.8283, -98.5795], 4);

        // Add default OpenStreetMap layer
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add satellite layer (ESRI)
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

        // Add topographic layer
        const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenTopoMap contributors'
        });

        // Create layer control
        const styleControl = document.createElement('div');
        styleControl.className = 'map-style-control';
        const styleSelect = document.createElement('select');
        const styles = {
            'Street': osmLayer,
            'Satellite': satelliteLayer,
            'Topographic': topoLayer
        };

        for (const style in styles) {
            const option = document.createElement('option');
            option.value = style;
            option.textContent = style;
            styleSelect.appendChild(option);
        }

        styleSelect.onchange = (e) => {
            const selectedStyle = styles[e.target.value];
            map.eachLayer((layer) => {
                if (layer instanceof L.TileLayer) {
                    map.removeLayer(layer);
                }
            });
            selectedStyle.addTo(map);
        };

        styleControl.appendChild(styleSelect);
        document.body.appendChild(styleControl);

        let currentMarker = null;

        // Custom icon
        const customIcon = L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 0C5.59644 0 0 5.59644 0 12.5C0 14.4276 0.40007 16.2563 1.11307 17.9198L12.5 41L23.8869 17.9198C24.5999 16.2563 25 14.4276 25 12.5C25 5.59644 19.4036 0 12.5 0Z" fill="#2b8a3e"/>
                </svg>
            `),
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -41]
        });

        function showTownOnMap(town) {
            // Remove active class from all items
            document.querySelectorAll('.town-item').forEach(item => {
                item.classList.remove('active');
            });

            // Add active class to clicked item
            event.currentTarget.classList.add('active');

            // Remove existing marker
            if (currentMarker) {
                map.removeLayer(currentMarker);
            }

            // Create new marker
            currentMarker = L.marker(town.coordinates, {icon: customIcon})
                .addTo(map)
                .bindPopup(`
                    <div>
                        <h3>${town.name}</h3>
                        <p>${town.info}</p>
                    </div>
                `, {
                    className: 'custom-popup'
                })
                .openPopup();

            // Pan to location with animation
            map.setView(town.coordinates, 12, {
                animate: true,
                duration: 1
            });
        }

        function deleteLocation(index) {
            towns.splice(index, 1);
            updateTownList();
        }

        function addLocation() {
            const name = document.getElementById('locationName').value;
            const lat = parseFloat(document.getElementById('latitude').value);
            const lng = parseFloat(document.getElementById('longitude').value);
            const info = document.getElementById('locationInfo').value;

            if (!name || isNaN(lat) || isNaN(lng)) {
                alert('Please fill in all required fields with valid values');
                return;
            }

            const newTown = {
                name: name,
                coordinates: [lat, lng],
                info: info || 'No information provided'
            };

            towns.push(newTown);
            updateTownList();

            // Clear form
            document.getElementById('locationName').value = '';
            document.getElementById('latitude').value = '';
            document.getElementById('longitude').value = '';
            document.getElementById('locationInfo').value = '';

            // Show the new location on the map
            showTownOnMap(newTown);
        }

        function updateTownList() {
            const townList = document.getElementById('town-list');
            townList.innerHTML = '';
            towns.forEach((town, index) => {
                const townElement = document.createElement('div');
                townElement.className = 'town-item';
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = town.name;
                
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = (e) => {
                    e.stopPropagation();
                    deleteLocation(index);
                };

                townElement.appendChild(nameSpan);
                townElement.appendChild(deleteButton);
                townElement.addEventListener('click', () => showTownOnMap(town));
                townList.appendChild(townElement);
            });
        }

        // Add click event to map for getting coordinates
        map.on('click', function(e) {
            document.getElementById('latitude').value = e.latlng.lat.toFixed(6);
            document.getElementById('longitude').value = e.latlng.lng.toFixed(6);
        });

        // Initial population of town list
        updateTownList();

        // Add scale control
        L.control.scale().addTo(map);
