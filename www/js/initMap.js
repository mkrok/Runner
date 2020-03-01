var zum = 3;
var map;
var cordovaPos = {lat: 50.061667, lng: 19.937222};
var initialPos = {lat: 70.061667, lng: -12.337222};
var CENTER_MAP = true;
var SOUND = true;
var myMarker;

function initMap() {
    // Create an array of styles.
    var styles = [
        {
            stylers: [
                { hue: '#B3E9FF' },
                { saturation: -80 },
                { gamma: 0.30 }
            ]
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [
                { lightness: 100 },
                { visibility: 'simplified' }
            ]
        },
        {
            featureType: 'road',
            elementType: 'labels',
            stylers: [
                { visibility: 'on' }
            ]
        }
    ],
    // Create a new StyledMapType object, passing it the array of styles,
    // as well as the name to be displayed on the map type control.
    styledMap = new google.maps.StyledMapType(styles, {name: 'Styled Map'});

    map = new google.maps.Map(document.getElementById('mapa'), {
        center: initialPos,
        zoom: zum,
        streetViewControl: false,
        zoomControl: false,
        mapTypeControl: false,
        gestureHandling: 'cooperative',
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
    });

    //Associate the styled map with the MapTypeId and set it to display.
    map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');
    //map.setCenter(initialPos);

    // add some controls to the map
    var controlsDiv = document.createElement('div');
    controlsDiv.innerHTML = '<button id="geo"><i class="fa fa-2x fa-crosshairs"></i></button><button id="sound"><i class="fa fa-2x fa-volume-up"></i></button>';
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlsDiv);

    myTrack = new google.maps.Polyline({
      strokeColor: 'red',
      strokeOpacity: 1.0,
      strokeWeight: 4
    });
    myTrackCoordinates = myTrack.getPath();
    myTrack.setMap(map);

    myMarker = new google.maps.Marker({
        position: cordovaPos,
        map: map
    });
    myMarker.setMap(map);
}
