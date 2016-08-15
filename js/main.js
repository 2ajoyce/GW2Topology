
(function() {
  
  //////////////////////////////////////////////////////////////////////
  // Run on load
  //////////////////////////////////////////////////////////////////////
  
  // Including the leaflet js library provides the variable L with various map tools
  var map;

  // Create the custom waypoint icon
  var waypointIcon = L.divIcon({
    iconSize: [22, 22], // size of the icon
    className:"markerIcon",
    html:"<a><img class=\"waypoint\" data-clipboard-target=\"#clipdump\" src=\".\/img\/Waypoint.png\" alt=\"Copy to clipboard\"> <\/a>"
  });

  // Instantiate the clipboardjs object
  new Clipboard('.waypoint');

  
  // The functions that run automatically on page load
  createMap();
  request("https://api.guildwars2.com/v1/map_floor.json?continent_id=1&floor=1", filterMaps);
  
  //////////////////////////////////////////////////////////////////////
  // End run on load
  //////////////////////////////////////////////////////////////////////
  
  // Helper function to convert GW2 coordinates into Leaflet coordinates
  //   GW2 coordinates: Northwest = [0,0], Southeast = [continent_xmax,continent_ymax];
  //   Leaflet: Northwest = [0,0], Southeast = [-256, 256]
  function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
  }

  // Tells you the coordinates that you clicked at
  function onMapClick(e) {
    console.log("You clicked the map at " + map.project(e.latlng, map.getMaxZoom()));
  }

  // Main function
  function createMap() {

    // Adds the leaflet map within the specified element, in this case a div with id="mapdiv"
    // Additionally we set the zoom levels to match the tilelayers, and set the coordinate reference system
    map = L.map("mapdiv", {
      minZoom: 3,
      maxZoom: 7,
      crs: L.CRS.Simple
    });

    // Add map tiles using the [[API:Tile service]]
    L.tileLayer("https://tiles.guildwars2.com/1/1/{z}/{x}/{y}.jpg").addTo(map);

    // Restrict the area which can be panned to
    //  In this case we're using the coordinates for the continent of tyria from "https://api.guildwars2.com/v2/continents/1"
    var continent_dims = [32768, 32768];
    map.setMaxBounds(new L.LatLngBounds(unproject([0, 0]), unproject(continent_dims))); // northwest, southeast

    // Set the default viewport position (in this case the midpoint) and zoom (in this case 2)
    map.setView(unproject([(continent_dims[0] / 2), (continent_dims[1] / 2)]), 3);

    // Add a function to return clicked coordinates to the javascript console
    map.on("click", onMapClick);
  }

  // A function to make api requests
  function request(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var myArr = JSON.parse(xmlhttp.responseText);
        callback(myArr);
      }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  // A function to get a list of all relevant maps
  function filterMaps(maps) {
    // For each region on Tyria
    for(var region in maps.regions) {
      // Print the name of the region to the sidebar as a header
      //print("<h2>" + maps.regions[region].name + "</h2>");
      // Create a markerClusterGroup for markercluster with custom settings
      var region_cluster = L.markerClusterGroup({
        maxClusterRadius: 80,
        showCoverageOnHover: false,
        iconCreateFunction: function (cluster) {
          return waypointIcon;
        }
      });
      // For each map in the region
      for(var regionMap in maps.regions[region].maps) {
        // Print the name of the map to the sidebar under the region header
        //print(maps.regions[region].maps[regionMap].name);
        // For each poi in the map
        for(var poi in maps.regions[region].maps[regionMap].points_of_interest) {
          // If the poi is a waypoint
          if(maps.regions[region].maps[regionMap].points_of_interest[poi].type == "waypoint")
            {
              var coord = maps.regions[region].maps[regionMap].points_of_interest[poi].coord;
              var id = maps.regions[region].maps[regionMap].points_of_interest[poi].poi_id;
              addWaypoint(coord, region_cluster, getIgCode(parseInt(id)));
            }
        }
      }
      map.addLayer(region_cluster);
    }
    //print(maps.regions[1].name)
    //addWaypoint(maps.regions[1].maps[31].points_of_interest[0].coord);
  }
  
  // A function to add waypoints to the cluster group
  function addWaypoint(coords, cluster, code) {
    cluster.addLayer(L.marker(unproject(coords), {
      icon: L.divIcon({
        iconSize: [22, 22], // size of the icon
        className:"markerIcon",
        html:"<a><img class=\"waypoint\" data-clipboard-text=\"" + code +"\" src=\"https:\/\/wiki.guildwars2.com\/images\/d\/d2\/Waypoint_%28map_icon%29.png\" alt=\"Copy to clipboard\"> <\/a>"
      })
    }));
  }

  // A print function for testing purposes
  function print(info) {
    document.getElementById("item1").innerHTML += "<br>";
    document.getElementById("item1").innerHTML += info;
  }
  
  function getIgCode(id)
  {
      return "[&" + btoa(String.fromCharCode(4) + String.fromCharCode(id % 256) + String.fromCharCode(Math.floor(id / 256)) + String.fromCharCode(0) + String.fromCharCode(0)) + "]";   
  }
}());