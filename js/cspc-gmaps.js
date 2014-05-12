var CSPC = CSPC || {};

function loadScript(url) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=initializeMapApi';
    document.body.appendChild(script);
}

function initializeMapApi() {
    CSPC.geocoder = new google.maps.Geocoder();
    var mapOptions = {
        center: new google.maps.LatLng(-34.397, 150.644),
        zoom: 8
    };
    CSPC.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}

function placeMarker(map, location) {
    return new google.maps.Marker({
        position: location,
        map: map
    });
}

function geoCodeAddress(address, callback) {
    CSPC.geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            callback(results[0].geometry.location);
        } else {
            console.log("Geocode was not successful for the following reason: " + status);
        }
    });
}

function addMarkersAtAddresses(addrArr){
    var locationArr = [];
    var bounds = new google.maps.LatLngBounds();

    function getAddrLatLang(location){
        locationArr.push(location);
        bounds.extend (location);

        var marker = placeMarker(CSPC.map, location);

        if(locationArr.length === addrArr.length){
            CSPC.map.fitBounds(bounds);
        }
    }

    for(var i = 0; i < addrArr.length; i++){
        geoCodeAddress(addrArr[i], getAddrLatLang);
    }
}