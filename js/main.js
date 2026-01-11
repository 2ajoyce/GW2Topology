(function () {
  //////////////////////////////////////////////////////////////////////
  // Run on load
  //////////////////////////////////////////////////////////////////////

  // Including the leaflet js library provides the variable L with various map tools
  var map;
  var markerRegistry = {};

  // Create the custom waypoint icon base
  var WaypointIcon = L.Icon.extend({
    options: {
      shadowUrl: "img/waypoint_shadow.png",
      iconSize: [32, 32],
      shadowSize: [44, 32],
      iconAnchor: [16, 16],
      shadowAnchor: [22, 16],
      popupAnchor: [0, -16],
      className: "waypoint",
    },
  });

  var waypointIcon = new WaypointIcon({ iconUrl: "img/Waypoint.png" });

  // The functions that run automatically on page load
  createMap();
  request(
    "https://api.guildwars2.com/v1/map_floor.json?continent_id=1&floor=1",
    filterMaps
  );

  // Search functionality
  function navigateToByCode() {
    var code = document.getElementById("clipdump").value.trim();
    if (markerRegistry[code]) {
      var marker = markerRegistry[code];
      // Zoom to marker and open popup
      map.setView(marker.getLatLng(), 7);
      marker.openPopup();
    } else if (code !== "") {
      console.log("Waypoint code not found in registry: " + code);
    }
  }

  document
    .getElementById("findButton")
    .addEventListener("click", navigateToByCode);
  document
    .getElementById("clipdump")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        navigateToByCode();
      }
    });

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
    console.log(
      "You clicked the map at " + map.project(e.latlng, map.getMaxZoom())
    );
  }

  // Main function
  function createMap() {
    // Adds the leaflet map within the specified element, in this case a div with id="mapdiv"
    // Additionally we set the zoom levels to match the tilelayers, and set the coordinate reference system
    map = L.map("mapdiv", {
      minZoom: 1,
      maxZoom: 7,
      crs: L.CRS.Simple,
    });

    // Add map tiles using the [[API:Tile service]]
    L.tileLayer("https://tiles.guildwars2.com/1/1/{z}/{x}/{y}.jpg").addTo(map);

    // Restrict the area which can be panned to
    // We use a large dimension to accommodate all current and future expansions in Tyria (Continent 1)
    var continent_dims = [81920, 114688];
    var southWest = unproject([0, continent_dims[1]]);
    var northEast = unproject([continent_dims[0], 0]);
    var bounds = new L.LatLngBounds(southWest, northEast);

    // Set max bounds with padding to allow smooth panning at the edges
    map.setMaxBounds(bounds.pad(0.05));

    // Initial centering on the main Tyria content area
    // Setting zoom to 2 and centering on the main Tyria landmass
    var initialCenter = unproject([51200, 35000]);
    map.setView(initialCenter, 2);

    // Ensure the map container is correctly sized and centered after load
    // This handles layout recalculations from flexbox
    var fixMap = function () {
      map.invalidateSize();
      map.setView(initialCenter, 2);
    };

    // Execute immediately and again after a short delay
    fixMap();
    setTimeout(fixMap, 250);
    setTimeout(fixMap, 1000);

    // Add a function to return clicked coordinates to the javascript console
    map.on("click", onMapClick);
  }

  // A function to make api requests
  function request(url, callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
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
    for (var region in maps.regions) {
      // Print the name of the region to the sidebar as a header
      //print("<h2>" + maps.regions[region].name + "</h2>");
      // Create a markerClusterGroup for markercluster with custom settings
      var region_cluster = L.markerClusterGroup({
        maxClusterRadius: 80,
        showCoverageOnHover: false,
        iconCreateFunction: function (cluster) {
          return waypointIcon;
        },
      });
      // For each map in the region
      for (var regionMap in maps.regions[region].maps) {
        // Print the name of the map to the sidebar under the region header
        //print(maps.regions[region].maps[regionMap].name);
        // For each poi in the map
        for (var poi in maps.regions[region].maps[regionMap]
          .points_of_interest) {
          // If the poi is a waypoint
          if (
            maps.regions[region].maps[regionMap].points_of_interest[poi].type ==
            "waypoint"
          ) {
            var poiData =
              maps.regions[region].maps[regionMap].points_of_interest[poi];
            var coord = poiData.coord;
            var id = poiData.poi_id;
            var name = poiData.name || "Waypoint";
            addWaypoint(coord, region_cluster, getIgCode(parseInt(id)), name);
          }
        }
      }
      map.addLayer(region_cluster);
    }
    //print(maps.regions[1].name)
    //addWaypoint(maps.regions[1].maps[31].points_of_interest[0].coord);
  }

  // A function to add waypoints to the cluster group
  function addWaypoint(coords, cluster, code, name) {
    var marker = L.marker(unproject(coords), {
      icon: waypointIcon,
    });
    marker.bindPopup(
      '<div class="waypoint-popup">' +
        '<h3 class="popup-title">' +
        name +
        "</h3>" +
        '<div class="popup-content">' +
        '<div class="popup-code-badge">' +
        '<span class="popup-code">' +
        code +
        "</span>" +
        '<button class="copy-btn" data-clipboard-text="' +
        code +
        '" title="Copy to clipboard">' +
        '<svg class="copy-icon" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>' +
        '<svg class="check-icon hidden" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' +
        "</button>" +
        "</div>" +
        "</div>" +
        "</div>",
      {
        maxWidth: 300,
        className: "custom-gw2-popup",
      }
    );

    marker.on("popupopen", function (e) {
      var popup = e.popup.getElement();
      var copyBtn = popup.querySelector(".copy-btn");
      if (copyBtn) {
        var clipboard = new ClipboardJS(copyBtn);
        clipboard.on("success", function (ev) {
          var btn = ev.trigger;
          var copyIcon = btn.querySelector(".copy-icon");
          var checkIcon = btn.querySelector(".check-icon");

          copyIcon.classList.add("hidden");
          checkIcon.classList.remove("hidden");
          btn.classList.add("copied");

          setTimeout(function () {
            copyIcon.classList.remove("hidden");
            checkIcon.classList.add("hidden");
            btn.classList.remove("copied");
          }, 2000);
          ev.clearSelection();
        });
      }
    });

    cluster.addLayer(marker);
    markerRegistry[code] = marker;
  }

  // A print function for testing purposes
  function print(info) {
    document.getElementById("item1").innerHTML += "<br>";
    document.getElementById("item1").innerHTML += info;
  }

  function getIgCode(id) {
    return (
      "[&" +
      btoa(
        String.fromCharCode(4) +
          String.fromCharCode(id % 256) +
          String.fromCharCode(Math.floor(id / 256)) +
          String.fromCharCode(0) +
          String.fromCharCode(0)
      ) +
      "]"
    );
  }
})();
