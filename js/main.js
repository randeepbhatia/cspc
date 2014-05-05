var CSPC = CSPC || {};

function loadScript(url) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=initializeMapApi';
    document.body.appendChild(script);
}

function initializeMapApi() {
    var mapOptions = {
        center: new google.maps.LatLng(-34.397, 150.644),
        zoom: 8
    };
    CSPC.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    setupGoogleMapEventListeners(CSPC.map);
    addFiveRandomMarkers(CSPC.map);

    //CSPC.map.getCenter()
    //CSPC.map.setCenter(location);
}

// google maps event listeners
function setupGoogleMapEventListeners(map){
    google.maps.event.addListener(map, 'center_changed', function() {
        // 3 seconds after the center of the map has changed, pan back to the
        // marker.
        window.setTimeout(function() {
            map.panTo(marker.getPosition());
        }, 3000);
    });

    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(map, event.latLng);
    });
}

function placeMarker(map, location) {
    return new google.maps.Marker({
        position: location,
        map: map
    });
}

function addFiveRandomMarkers(map) {
    // Add 5 markers to the map at random locations.
    var southWest = new google.maps.LatLng(-31.203405,125.244141);
    var northEast = new google.maps.LatLng(-25.363882,131.044922);
    var bounds = new google.maps.LatLngBounds(southWest,northEast);
    map.fitBounds(bounds);
    var lngSpan = northEast.lng() - southWest.lng();
    var latSpan = northEast.lat() - southWest.lat();

    for (var i = 0; i < 5; i++) {
        var location = new google.maps.LatLng(southWest.lat() + latSpan * Math.random(),
                southWest.lng() + lngSpan * Math.random());
        var marker = placeMarker(map, location);
        marker.setTitle("Marker #" + (i+1));

        var infowindow = new google.maps.InfoWindow(
            { content: "This is marker #" + (i+1),
                size: new google.maps.Size(100,150)
            }
        );
        marker.infoWindow = infowindow;
        google.maps.event.addListener(marker, 'click', function() {
            var thisMarker = this;
            thisMarker.infoWindow.open(map, thisMarker);
            map.setZoom(8);
            map.setCenter(thisMarker.getPosition());
        });
    }
}

