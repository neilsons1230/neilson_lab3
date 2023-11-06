var map = L.map('map').setView([-20, -10], 2.0);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 1,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

fetch('data/airports.geojson')
    .then(response => response.json())
    .then(data => {
        createPropSymbols(data, map); 
    });


function pointToLayer(features, latlng) {
    var attribute = "scalerank";
    var options = {
        fillColor: "#debad3",
        color: "#FF69B4",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    };

    var attValue = Number(features.properties[attribute]);

    options.radius = calcPropRadius(attValue);

    var layer = L.circleMarker(latlng, options);

    var popupContent = "<p><b>Name:</b> " + features.properties.name + "</p><p><b>" + attribute + ":</b> " + attValue + "</p>"; // Changed from features.properties[attribute]

    layer.bindPopup(popupContent);

    return layer;
}


function createPropSymbols(data, map) {
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
}


function calcPropRadius(attValue) {

    var minSize = 0.5; 
    var maxSize = 10; 

    return minSize + (attValue - 1) * (maxSize - minSize) / 8;
}


    
// THIS IS WHERE YOUR MAP 2 STARTS DO NOT DELETE ANYTHING ABOVE THIS OR ELSE
function getColor(d) {
    console.log("Density:", d);
    return d > 1000 ? '#7a0177' :
           d > 500  ? '#ae017e' :
           d > 200  ? '#dd3497' :
           d > 100  ? '#f768a1' :
           d > 50   ? '#fa9fb5' :
           d > 20   ? '#fcc5c0' :
           d > 10   ? '#fde0dd' :
                      '#fff7f3';
}


function style(feature) {
    console.log("Feature density:", feature.properties.density);
    return {
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: '#7a0177',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

var map2 = L.map('map2').setView([37.8, -96], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map2);

fetch('data/us-states.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: style, 
            onEachFeature: onEachFeature
        }).addTo(map2);
    })
   //The code above works! dont mess it up 

   function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#49006a',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}


function zoomToFeature(e) {
    map2.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}
var info = L.control();

info.onAdd = function (map2) {
    this._div = L.DomUtil.create('div', 'info'); 
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>US Population Density</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
        : 'Hover over a state');
};

info.addTo(map2);

function highlightFeature(e) {
   
    info.update(e.target.feature.properties);
}

function resetHighlight(e) {
    
    info.update();
}

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map2) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map2);

   
  

   