const LAP_DISTANCE = 1000;
const LAP_SPEED_DISTANCE = 50;
const ACTIVITY = "RUNNING";
const ACCURACY = 20;
const START_DELAY = 30;
const MAX_SPEED_POSSIBLE = 36;
const colors = [
  "red",
  "darkblue",
  "darkgreen",
  "black",
  "darkorange",
  "purple",
];
var zum = 3;
var map;
var cordovaPos = { lat: 50.061667, lng: 19.937222 };
var CENTER_MAP = true;
var SOUND = true;
var myTrackCoordinates;
var myTrack;
var myMarker;
var year, month, day, hours, minutes, seconds;
var startMilliseconds,
  previousMilliseconds,
  tickMilliseconds,
  currentMilliseconds,
  speedLapStartMilliseconds;
var start;
var distance = 0;
var distanceFlatEarth = 0;
var lat = "";
var lon = "";
var lapTime = 0;
var lap = 0;
var speedLap = 0;
var pace = 0;
var logFileName = "dupa.gpx";
var fileHandler;
var writer;
var maxSpeed = 0;
var startPressed = false;
var initialised = false;
var timeDisplay;
var logFileCreation;
var logFileCreationSuccess = false;
var logFiles = [];
var logEntries = {};
var watchID = null;
var historyData = [];

const getRandomColor = (max) => Math.floor(max * Math.random());

function initMap() {
  // Create an array of styles.
  var styles = [
      {
        stylers: [{ hue: "#B3E9FF" }, { saturation: -80 }, { gamma: 0.3 }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ lightness: 100 }, { visibility: "simplified" }],
      },
      {
        featureType: "road",
        elementType: "labels",
        stylers: [{ visibility: "on" }],
      },
    ],
    // Create a new StyledMapType object, passing it the array of styles,
    // as well as the name to be displayed on the map type control.
    styledMap = new google.maps.StyledMapType(styles, { name: "Styled Map" });

  map = new google.maps.Map(document.getElementById("map"), {
    center: cordovaPos,
    zoom: zum,
    streetViewControl: false,
    zoomControl: false,
    mapTypeControl: false,
    gestureHandling: "cooperative",
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, "map_style"],
    },
    disableDefaultUI: true,
  });

  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set("map_style", styledMap);
  map.setMapTypeId("map_style");

  // add some controls to the map
  var controlsDiv = document.createElement("div");
  controlsDiv.innerHTML =
    '<button id="geo"><i class="fa fa-2x fa-crosshairs"></i></button><button id="sound"><i class="fa fa-2x fa-volume-up"></i></button>';
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlsDiv);

  myMarker = new google.maps.Marker({
    position: cordovaPos,
    map: map,
  });
  myMarker.setMap(map);
}

const setMapButtons = () =>
  setInterval(() => {
    if (document.getElementById("geo") && document.getElementById("sound")) {
      document.getElementById("geo").addEventListener("click", function () {
        CENTER_MAP = !CENTER_MAP;
        if (CENTER_MAP) {
          map.setCenter(cordovaPos);
          document.getElementById("geo").style.color = "#333";
        } else {
          document.getElementById("geo").style.color = "#bbb";
        }
      });
      document.getElementById("sound").addEventListener("click", function () {
        SOUND = !SOUND;
        if (SOUND) {
          document.getElementById("sound").style.color = "#333";
        } else {
          document.getElementById("sound").style.color = "#bbb";
        }
      });
      clearInterval(setMapButtons);
    }
  }, 100);

const setHammer = () => {
  // hammer swipe gestures
  var pageOne = document.getElementById("page1");
  var pageTwo = document.getElementById("page2");
  // create a simple instance
  // by default, it only adds horizontal recognizers
  var mPageOne = new Hammer(pageOne);
  var mPageTwo = new Hammer(pageTwo);

  mPageOne.on("swipeleft", () => {
    document.getElementById("page2").style.display = "flex";
    document.getElementById("page1").style.display = "none";
    document.getElementById("poll").style.visibility = "hidden";
    document.getElementById("run").style.visibility = "visible";
  });
  mPageOne.on("swiperight", () => {
    document.getElementById("page2").style.display = "flex";
    document.getElementById("page1").style.display = "none";
    document.getElementById("poll").style.visibility = "hidden";
    document.getElementById("run").style.visibility = "visible";
  });
  mPageTwo.on("swipeleft", () => {
    document.getElementById("page2").style.display = "none";
    document.getElementById("page1").style.display = "flex";
    document.getElementById("run").style.visibility = "hidden";
    document.getElementById("poll").style.visibility = "visible";
  });
  mPageTwo.on("swiperight", () => {
    document.getElementById("page2").style.display = "none";
    document.getElementById("page1").style.display = "flex";
    document.getElementById("run").style.visibility = "hidden";
    document.getElementById("poll").style.visibility = "visible";
  });
};

const setPages = () => {
  document.getElementById("poll").addEventListener("click", function () {
    document.getElementById("poll").style.visibility = "hidden";
    document.getElementById("run").style.visibility = "visible";
    document.getElementById("page2").style.display = "flex";
    document.getElementById("page1").style.display = "none";
  });

  document.getElementById("run").addEventListener("click", function () {
    document.getElementById("run").style.visibility = "hidden";
    document.getElementById("poll").style.visibility = "visible";
    document.getElementById("page1").style.display = "flex";
    document.getElementById("page2").style.display = "none";
  });
};

const setStopButton = () => {
  document.getElementById("stopButton").addEventListener("click", function () {
    setTimeout(
      write(
        "    </trkseg>\n" +
          "  </trk>\n" +
          "</gpx>\n" +
          "<metadata>\n  <distance>" +
          (distance / 1000).toFixed(3) +
          "</distance>\n" +
          "  <totalTime>" +
          (currentMilliseconds - startMilliseconds) +
          "</totalTime>\n" +
          "</metadata>\n"
      ),
      500
    );
    listDir(cordova.file.externalDataDirectory, readFile);
    totalDistance = 0;
    totalTime = 0;
    initialised = false;
    startPressed = false;
    clearInterval(timeDisplay);
    distance = 0;
    lapTime = 0;
    maxSpeed = 0;
    fileHandler = -1;
    myTrack.setMap(null);
    document.getElementById("time").innerHTML = "Time: ";
    document.getElementById("distance").innerHTML = "Distance: ";
    document.getElementById("pace").innerHTML = "Pace: ";
    document.getElementById("lap").innerHTML = "Last lap: ";
    document.getElementById("speed").innerHTML = "Max speed: ";
    document.getElementById("startButton").style.display = "inline-block";
    document.getElementById("startButton").style.color = "grey";
    document.getElementById("stopButton").style.display = "none";
  });
};

const onConfirm = (buttonIndex) => {
  if (buttonIndex === 2) {
    navigator.geolocation.clearWatch(watchID);
    if (startPressed) {
      setTimeout(
        write(
          "    </trkseg>\n" +
            "  </trk>\n" +
            "</gpx>\n" +
            "<metadata>\n  <distance>" +
            (distance / 1000).toFixed(3) +
            "</distance>\n" +
            "  <totalTime>" +
            (currentMilliseconds - startMilliseconds) +
            "</totalTime>\n" +
            "</metadata>\n"
        ),
        500
      );
    }
    setTimeout(navigator.app.exitApp(), 2000);
  } else {
    setMapButtons();
    setHammer();
    setPages();
    setStopButton();
  }
};

const onBackKeyDown = () => {
  // Handle the back buttons
  navigator.notification.confirm(
    "Terminate app?", // message
    onConfirm, // callback to invoke with index of button pressed
    "Exit", // title
    ["Cancel", "Yes"] // buttonLabels
  );
};

const setBackButton = () => {
  document.addEventListener("backbutton", onBackKeyDown, false);
};

const errorCallback = (error) => {
  alert("ERROR: ", error.code);
};

const sortDate = (a, b) => new Date(a.date) - new Date(b.date);
const sortDistance = (a, b) => Number(a.distance) - Number(b.distance);
const sortTime = (a, b) => Number(a.time) - Number(b.time);

function readFile(name, getData) {
  window.resolveLocalFileSystemURL(
    cordova.file.externalDataDirectory,
    function (dir) {
      dir.getFile(name, {}, function (fileEntry) {
        fileEntry.file(function (file) {
          const reader = new FileReader();
          reader.onloadend = function () {
            if (getData) {
              getData(name, this.result);
            }
          };
          reader.readAsText(file);
        }, errorCallback);
      });
    }
  );
}

const addRowHandlers = () => {
  const table = document.getElementById("history");
  const rows = table.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
    const currentRow = table.rows[i];
    const cells = currentRow.getElementsByTagName("td");
    for (let i = 0; i < cells.length; i++) {
      const currentCell = cells[i];
      const createClickHandler = function (cell) {
        return function () {
          switch (i % 3) {
            case 0:
              historyData = historyData.sort(sortDate);
              displayHistory(historyData);
              break;
            case 1:
              historyData = historyData.sort(sortDistance);
              displayHistory(historyData);
              break;
            case 2:
              historyData = historyData.sort(sortTime);
              displayHistory(historyData);
              break;
            default:
              alert("something went wrong");
          }
        };
      };
      currentCell.onclick = createClickHandler(currentCell);
    }
  }
};

const displayHistory = (historyData) => {
  let totalDistance = 0;
  let totalTime = 0;
  document.getElementById("historyData").innerHTML = "";
  historyData.forEach((training) => {
    const { date, distance, time } = training;
    totalDistance += Number(distance);
    totalTime += Number(time);
    const tableRef = document
      .getElementById("history")
      .getElementsByTagName("tbody")[0];
    let newRow = tableRef.insertRow(0);
    let newCell = newRow.insertCell(0);
    let newText = document.createTextNode(new Date(date).toDateString());
    newCell.appendChild(newText);
    newCell = newRow.insertCell(1);
    newText = document.createTextNode(distance + "km");
    newCell.appendChild(newText);
    newCell = newRow.insertCell(2);
    newText = document.createTextNode(msToTime(time));
    newCell.appendChild(newText);
    document.getElementById("totals").innerHTML =
      "<div" +
      "<dl>" +
      "<dd>Total distance:</dd>" +
      `<dt>${totalDistance.toFixed(0)} km</dt>` +
      "<dd>Total time:</dd>" +
      `<dt>${msToTime(totalTime).substring(0, 5)}</dt>` +
      "</dl>" +
      "</div";
  });
  setTimeout(addRowHandlers(), 1000);
};

const getTrainingData = (name, data) => {
  const date = data.split("<time>")[1]
    ? data.split("<time>")[1].split("</time>")[0]
    : false;
  if (!date) {
    logFiles = logFiles.filter((logFile) => logFile !== name);
    return -1;
  }
  const timer = date.split("T")[1].split(":");
  const distance = data.split("<distance>")[1]
    ? data.split("<distance>")[1].split("</distance>")[0].split(",")
    : false;
  if (!distance) {
    logFiles = logFiles.filter((logFile) => logFile !== name);
    return -1;
  }
  const time = data.split("<totalTime>")[1]
    ? data.split("<totalTime>")[1].split("</totalTime>")[0]
    : false;
  if (!time) {
    logFiles = logFiles.filter((logFile) => logFile !== name);
    return -1;
  }
  historyData.push({
    date: date,
    distance: distance,
    time: time,
  });
  if (historyData.length === logFiles.length) {
    historyData = historyData.sort(sortDate);
    displayHistory(historyData);
  }
  return 0;
};

const msToTime = (s) => {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60 < 10 ? "0" + (s % 60) : s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ":" + mins + ":" + secs + "." + ms;
};

function listDir(path, fileReader) {
  let files = [];
  window.resolveLocalFileSystemURL(
    path,
    function (fileSystem) {
      const reader = fileSystem.createReader();
      reader.readEntries(
        function (entries) {
          logEntries = entries;
          logFiles = Object.values(entries).map((file) => file.name);
          files = logFiles;
          historyData = [];
          if (fileReader) {
            files.map((file) => {
              fileReader(file, getTrainingData);
            });
          }
        },
        function (err) {
          alert(err);
        }
      );
    },
    function (err) {
      alert(err);
    }
  );
  return files;
}

const say = (text) => {
  if (SOUND) {
    TTS.speak(
      {
        text: text,
        locale: "en-GB",
        rate: 1,
      },
      function () {},
      function (reason) {}
    );
  }
};

const GPX_HEADER =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<gpx version="1.1" creator="Runner, (c) mkrok" ' +
  'xsi:schemaLocation="http://www.topopgrafix.com/GPX/1/1 ' +
  "http://www.topografix.com/GPX/1/1/gpx.datStringxsd " +
  "http://www.garmin.com/xmlschemas/GpxExtensions/v3 " +
  "http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd " +
  "http://www.garmin.com/xmlschemas/TrackPointExtension/v1 " +
  'http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd" ' +
  'xmlns="http://www.topografix.com/GPX/1/1" ' +
  'xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" ' +
  'xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3" ' +
  'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n' +
  "  <trk>\n" +
  "    <type>" +
  ACTIVITY +
  "</type>\n" +
  "    <trkseg>\n";

const write = (data) => {
  if (!fileHandler) {
    alert("Error writing file!");
    return -1;
  }
  if (fileHandler === -1) {
    // log file closed by the stopButton click
    return -2;
  }
  fileHandler.createWriter(function (writer) {
    writer.seek(writer.length);
    var blob = new Blob([data], { type: "text/plain" });
    writer.write(blob);
  });
};

const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;

const distanceInKmBetweenEarthCoordinates = (position1, position2) => {
  const lat1 = position1.lat;
  const lon1 = position1.lng;
  const lat2 = position2.lat;
  const lon2 = position2.lng;
  if (!(lat1 && lat2 && lon1 && lon2)) return 0;

  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  lat1Rad = degreesToRadians(lat1);
  lat2Rad = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(lat1Rad) *
      Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const secs = (minutes) => parseInt((minutes - parseInt(minutes, 10)) * 60, 10);

const setTime = (time) => {
  // side effect - to be rewritten
  year = time.getFullYear().toString();
  month =
    time.getMonth() + 1 < 10
      ? "0" + (time.getMonth() + 1).toString()
      : (time.getMonth() + 1).toString();
  day =
    time.getDate() < 10
      ? "0" + time.getDate().toString()
      : time.getDate().toString();
  hours =
    time.getHours() < 10
      ? "0" + time.getHours().toString()
      : time.getHours().toString();
  minutes =
    time.getMinutes() < 10
      ? "0" + time.getMinutes().toString()
      : time.getMinutes().toString();
  seconds =
    time.getSeconds() < 10
      ? "0" + time.getSeconds().toString()
      : time.getSeconds().toString();
};

const GPS_options = {
  maximumAge: 10000,
  timeout: 20000,
  enableHighAccuracy: true,
};

function GPS_found(position) {
  document.getElementById("acc").innerHTML =
    "Accuracy: " + position.coords.accuracy.toFixed(0);

  if (position.coords.accuracy > ACCURACY) return -1;

  document.getElementById("No_GPS").style.display = "none";
  if (startPressed) {
    document.getElementById("stopButton").style.display = "inline-block";
  } else {
    document.getElementById("startButton").style.display = "inline-block";
  }
  // map refresh
  cordovaPos = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
  const newLatLng = new google.maps.LatLng(
    position.coords.latitude,
    position.coords.longitude
  );
  myMarker.setPosition(newLatLng);
  if (CENTER_MAP) {
    map.setCenter(cordovaPos);
  }
  if (map.getZoom() === 3) {
    map.setZoom(13);
  }

  if (!startPressed) {
    document.getElementById("startButton").style.color = "red";
    document.getElementById("startButton").addEventListener("click", () => {
      document.getElementById("startButton").style.display = "none";
      document.getElementById("stopButton").style.display = "inline-block";
      startPressed = true;
    }); // startButton click
    return -1; // app not started
  }

  if (!initialised) {
    myTrack = new google.maps.Polyline({
      strokeColor: colors[getRandomColor(colors.length)],
      strokeOpacity: 1.0,
      strokeWeight: 4,
    });
    myTrackCoordinates = myTrack.getPath();
    myTrack.setMap(map);
    say("Application started");
    start = new Date();
    setTime(start);
    logFileName = year + month + day + "-" + hours + minutes + seconds + ".gpx";
    startMilliseconds = start.getTime();
    previousMilliseconds = startMilliseconds;
    speedLapStartMilliseconds = startMilliseconds;
    tickMilliseconds = startMilliseconds;
    timeDisplay = setInterval(() => {
      const time = new Date();
      const currentMilliseconds = time.getTime();
      const timeGap = parseInt(
        (currentMilliseconds - startMilliseconds) / 1000,
        10
      );
      const s = Number.isNaN(timeGap % 60) ? 0 : timeGap % 60;
      const m = Number.isNaN(parseInt((timeGap / 60) % 60))
        ? 0
        : parseInt((timeGap / 60) % 60, 10);
      const h = Number.isNaN(parseInt(timeGap / 3600))
        ? 0
        : parseInt(timeGap / 3600, 10);
      const ss = s < 10 ? "0" + s.toString() : s.toString();
      const mm = m < 10 ? "0" + m.toString() : m.toString();
      const hh = h.toString();
      document.getElementById("time").innerHTML =
        "Time: " + hh + ":" + mm + ":" + ss;
    }, 1000);
    logFileCreation = setInterval(
      window.resolveLocalFileSystemURL(
        cordova.file.externalDataDirectory,
        function (dir) {
          dir.getFile(logFileName, { create: true }, function (file) {
            fileHandler = file;
            if (fileHandler) {
              logFileCreationSuccess = true;
              write(GPX_HEADER);
              clearInterval(logFileCreation);
            }
          });
        }
      ),
      1000
    );

    initialised = true;
    return -2;
  }

  if (!logFileCreationSuccess) return -3;

  myTrackCoordinates.push(newLatLng);
  const time = new Date();
  setTime(time);
  currentMilliseconds = time.getTime();
  const timeGap = parseInt(
    (currentMilliseconds - startMilliseconds) / 1000,
    10
  );
  const lastTick = currentMilliseconds - tickMilliseconds;
  tickMilliseconds = currentMilliseconds;
  prevPos = { lat: lat, lng: lon };
  const dist = 1000 * distanceInKmBetweenEarthCoordinates(cordovaPos, prevPos);
  const speed = (3600 * dist) / lastTick;
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  distance += dist;
  lap += dist;
  speedLap += dist;

  if (speedLap >= LAP_SPEED_DISTANCE) {
    speedLap = 0;
    const speedLapTime =
      (currentMilliseconds - speedLapStartMilliseconds) / 1000;
    speedLapStartMilliseconds = currentMilliseconds;
    const speed = (3.6 * LAP_SPEED_DISTANCE) / speedLapTime;
    document.getElementById("speed").innerHTML =
      "Speed: " + speed.toFixed(0) + " km/h";

    if (
      speed > maxSpeed &&
      timeGap >= START_DELAY &&
      speed <= MAX_SPEED_POSSIBLE
    ) {
      maxSpeed = speed;
      document.getElementById("maxspeed").innerHTML =
        "Max speed: " +
        maxSpeed.toFixed(0) +
        " km/h at " +
        (distance / 1000).toFixed(2) +
        " km";
    }
  }

  if (lap >= LAP_DISTANCE) {
    say("attention");
    lap = 0;
    lapTime = ((currentMilliseconds - previousMilliseconds) / 60000).toFixed(2);
    previousMilliseconds = currentMilliseconds;
    document.getElementById("lap").innerHTML = "Lap time: " + lapTime + " min";
    document.getElementById("pace").innerHTML =
      "Pace: " + ((1000 * timeGap) / (60 * distance)).toFixed(2) + " min/km";
    say(
      "distance: " +
        (distance / 1000).toFixed(0) +
        " km\naverage pace: " +
        ((1000 * timeGap) / (60 * distance)).toFixed(2) +
        " min/km\nlast lap: " +
        parseInt(lapTime, 10) +
        "minutes" +
        secs(lapTime) +
        "seconds"
    );
  }

  const msg =
    '      <trkpt lat="' +
    position.coords.latitude +
    '" lon="' +
    position.coords.longitude +
    '">\n' +
    "      <ele>" +
    position.coords.altitude +
    "</ele>\n" +
    "      <spd>" +
    position.coords.speed +
    "</spd>\n" +
    "      <time>" +
    year +
    "-" +
    month +
    "-" +
    day +
    "T" +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    "Z</time>\n" +
    "      </trkpt>\n";
  write(msg);

  document.getElementById("distance").innerHTML =
    "Distance: " + (distance / 1000).toFixed(3) + " km";
}

function GPS_lost(error) {
  document.getElementById("No_GPS").innerHTML = "No GPS signal";
  document.getElementById("No_GPS").style.display = "inline-block";
  document.getElementById("startButton").style.display = "none";
  document.getElementById("stopButton").style.display = "none";
  say("No GPS signal");
  if (watchID) {
    navigator.geolocation.clearWatch(watchID);
  }
  watchID = navigator.geolocation.watchPosition(
    GPS_found,
    GPS_lost,
    GPS_options
  );
}

var app = {
  // Application Constructor
  initialize: function () {
    document.addEventListener(
      "deviceready",
      this.onDeviceReady.bind(this),
      false
    );
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function () {
    this.receivedEvent();
  },

  // Update DOM on a Received Event
  receivedEvent: function () {
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.on("activate", function () {
      cordova.plugins.backgroundMode.disableWebViewOptimizations();
    });
    setInterval(() => {
      cordova.plugins.diagnostic.isGpsLocationAvailable(
        function (enabled) {
          if (!enabled) {
            say("GPS unavailable");
            document.getElementById("No_GPS").innerHTML = "GPS unavailable";
            document.getElementById("No_GPS").style.display = "inline-block";
            document.getElementById("startButton").style.display = "none";
            document.getElementById("stopButton").style.display = "none";
            if (watchID) {
              navigator.geolocation.clearWatch(watchID);
            }
            watchID = navigator.geolocation.watchPosition(
              GPS_found,
              GPS_lost,
              GPS_options
            );
          } else {
            document.getElementById("No_GPS").style.display = "none";
            if (startPressed) {
              document.getElementById("stopButton").style.display =
                "inline-block";
            } else {
              document.getElementById("startButton").style.display =
                "inline-block";
            }
          }
        },
        function (error) {
          say("The following error occurred: " + error);
        }
      );
    }, 20000);

    window.onerror = function (msg, url, lineNo, columnNo, error) {
      var string = msg.toLowerCase();
      var substring = "script error";
      if (string.indexOf(substring) > -1) {
        alert("Script Error: See Browser Console for Detail");
      } else {
        var message = [
          "Message: " + msg,
          "URL: " + url,
          "Line: " + lineNo,
          "Column: " + columnNo,
          "Error object: " + JSON.stringify(error),
        ].join(" - ");
        alert(message);
      }
      return false;
    };

    window.onload = function () {
      setMapButtons();
      listDir(cordova.file.externalDataDirectory, readFile);
      setHammer();
      setBackButton();
      setPages();
      setStopButton();
    };

    watchID = navigator.geolocation.watchPosition(
      GPS_found,
      GPS_lost,
      GPS_options
    );
  },
};

app.initialize();
