var map = L.map('map').setView([45.9432, 24.9668], 7);

var normalTiles = L.tileLayer('https://api.maptiler.com/maps/backdrop/{z}/{x}/{y}.png?key=EYzsOICzwnKzN6KnoMqN', 
{
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    maxZoom: 19,
    attribution: '&copy; MapTiler &copy; OpenStreetMap contributors'
});

var satelliteTiles = L.tileLayer('https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EYzsOICzwnKzN6KnoMqN', 
{
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    maxZoom: 19,
    attribution: '&copy; MapTiler &copy; OpenStreetMap contributors'
});

normalTiles.addTo(map);

var baseMaps = 
{
    "Dark": normalTiles,
    "Satellite": satelliteTiles
};

L.control.layers(baseMaps).addTo(map);

navigator.geolocation.watchPosition(success, error);

let marker, circle, zoomed;

function success(pos)
{
    const lat = pos.coords.latitude;
    const long = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;

    marker = L.marker([lat, long]).addTo(map);
    circle = L.circle([lat, long], { radius: accuracy }).addTo(map);

    if(!zoomed)
    {
        zoomed = map.fitBounds(circle.getBounds());
    }

    map.setView([lat, long]);
}

function error(err)
{
    if(err.code === 1)
    {
        alert("Enable location to see current locations");
    }
    else
    {
        alert("Error getting current location");
    }
}

function loadScript(url, callback) 
{
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState) 
    { 
        script.onreadystatechange = function () 
        {
            if (script.readyState == "loaded" || script.readyState == "complete") 
            {
                script.onreadystatechange = null;
                callback();
            }
        };
    } 
    else
    {
        script.onload = function () 
        {
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

loadScript('/scripts/getLocations.js', function () 
{
    addLocationsToMap(map);
});
