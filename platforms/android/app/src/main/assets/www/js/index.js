const formatDate = require('rdate/format');

const errorCallback = error => {
  alert("ERROR: ", error.code);
};

function readFile(name) {
  window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
    dir.getFile(name, {}, function(fileEntry) {
      fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function() {
          displayFileData(name, this.result);
        };
        reader.readAsText(file);
      }, errorCallback);
    });
  });
};

function displayFileData(name, data) {
  const date = data.split('<time>')[1]
    ? data.split('<time>')[1].split('</time>')[0]
    : false;
  if (!date) return -1;
  const timer = date.split('T')[1].split(':');
  const distance = data.split('<distance>')[1]
    ? data.split('<distance>')[1].split('</distance>')[0].split(',')
    : false;
  if (!distance) return -1;
  totalDistance += Number(distance);
  const time = data.split('<totalTime>')[1]
    ? data.split('<totalTime>')[1].split('</totalTime>')[0]
    : false;
  if (!time) return -1;
  totalTime += Number(time);
  const tableRef = document.getElementById('history').getElementsByTagName('tbody')[0];
  let newRow = tableRef.insertRow();
  let newCell = newRow.insertCell(0);
  //let newText  = document.createTextNode(new Date(date).toDateString());
  let newText  = document.createTextNode(formatDate(new Date(date), 'YYYY-MM-DD') + ', ' + timer[0] + ':' + timer[1]);
  newCell.appendChild(newText);
  newCell = newRow.insertCell(1);
  newText = document.createTextNode(distance + 'km');
  newCell.appendChild(newText);
  newCell = newRow.insertCell(2);
  newText = document.createTextNode(msToTime(time));
  newCell.appendChild(newText);
  document.getElementById('totals').innerHTML =
    '<dl>' +
      '<dd>Total distance</dd>' +
      `<dt>${totalDistance.toFixed(3)}km</dt>` +
      '<dd>Total time</dd>' +
      `<dt>${msToTime(totalTime)}</dt>` +
    '</dl>'
};

const msToTime = s => {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ':' + mins + ':' + secs + '.' + ms;
}

const listDir = path => {
  window.resolveLocalFileSystemURL(path,
    function (fileSystem) {
      var reader = fileSystem.createReader();
      reader.readEntries(
        function (entries) {
          logEntries = entries;
          logFiles = Object.values(entries).map(file => file.name);
        },
        function (err) {
          alert(err);
        }
      );
    }, function (err) {
      alert(err);
    }
  );
}

const say = text => {
  if (SOUND) {
    TTS.speak({
          text: text,
          locale: 'en-GB',
          rate: 1
      },
      function () {},
      function (reason) {}
    );
  }
};

const GPX_HEADER = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n' +
  '<gpx version=\"1.1\" creator=\"Runner, (c) mkrok\" ' +
  'xsi:schemaLocation=\"http://www.topopgrafix.com/GPX/1/1 ' +
  'http://www.topografix.com/GPX/1/1/gpx.datStringxsd ' +
  'http://www.garmin.com/xmlschemas/GpxExtensions/v3 ' +
  'http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd ' +
  'http://www.garmin.com/xmlschemas/TrackPointExtension/v1 ' +
  'http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd\" ' +
  'xmlns=\"http://www.topografix.com/GPX/1/1\" ' +
  'xmlns:gpxtpx=\"http://www.garmin.com/xmlschemas/TrackPointExtension/v1\" ' +
  'xmlns:gpxx=\"http://www.garmin.com/xmlschemas/GpxExtensions/v3\" ' +
  'xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n' +
  '  <trk>\n' + '    <type>' + activity.toUpperCase() + '</type>\n' +
  '    <trkseg>\n';

const write = data => {
  if (!fileHandler) {
    alert('Error writing file!');
    return -1;
  }
  if (fileHandler === -1) {
    // log file closed by the stopButton click
    return -2;
  }
  fileHandler.createWriter(function(writer) {
    writer.seek(writer.length);
    var blob = new Blob([data], { type: 'text/plain' });
    writer.write(blob);
  });
};

const degreesToRadians = degrees => degrees * Math.PI / 180;

const distanceInKmBetweenEarthCoordinates = (position1, position2) => {
  const lat1 = position1.lat;
  const lon1 = position1.lng;
  const lat2 = position2.lat;
  const lon2 = position2.lng;
  if ( ! (lat1 && lat2 && lon1 && lon2) ) return 0;

  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(lat2-lat1);
  const dLon = degreesToRadians(lon2-lon1);

  lat1Rad = degreesToRadians(lat1);
  lat2Rad = degreesToRadians(lat2);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return earthRadiusKm * c;
};

const secs = minutes => parseInt((minutes - parseInt(minutes, 10)) * 60, 10);

const setTime = time => {
  // side effect - to be rewritten
  year = (time.getFullYear()).toString();
  month = time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1).toString() : (time.getMonth() + 1).toString();
  day = time.getDate() < 10 ? '0' + (time.getDate ()).toString() : (time.getDate()).toString();
  hours = time.getHours() < 10 ? '0' + (time.getHours()).toString() : (time.getHours()).toString();
  minutes = time.getMinutes() < 10 ? '0' + (time.getMinutes()).toString() : (time.getMinutes()).toString();
  seconds = time.getSeconds() < 10 ? '0' + (time.getSeconds()).toString() : (time.getSeconds()).toString();
};

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent();
    },

    // Update DOM on a Received Event
    receivedEvent: function() {

      cordova.plugins.backgroundMode.enable();
      cordova.plugins.backgroundMode.on('activate', function() {
        cordova.plugins.backgroundMode.disableWebViewOptimizations();
      });


      window.onerror = function (msg, url, lineNo, columnNo, error) {
        var string = msg.toLowerCase();
        var substring = "script error";
        if (string.indexOf(substring) > -1){
          alert('Script Error: See Browser Console for Detail');
        } else {
          var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
          ].join(' - ');
          alert(message);
        }
        return false;
      };

      window.addEventListener('load', () => {

        const setButtons = setInterval(() => {
          if ( document.getElementById('geo') && document.getElementById('sound')) {
            document.getElementById('geo').addEventListener('click', function () {
              CENTER_MAP = !CENTER_MAP;
              if (CENTER_MAP) {
                map.setCenter(cordovaPos);
                document.getElementById('geo').style.color = '#333';
              } else {
                document.getElementById('geo').style.color = '#bbb';
              }
            });
            document.getElementById('sound').addEventListener('click', function () {
              SOUND = !SOUND;
              if (SOUND) {
                document.getElementById('sound').style.color = '#333';
              } else {
                document.getElementById('sound').style.color = '#bbb';
              }
            });
            clearInterval(setButtons);
          }

        }, 100);


        listDir(cordova.file.externalDataDirectory);
        setTimeout(() => {
          logFiles = logFiles.sort().reverse();
          logFiles.forEach((file, i) => {
            readFile(file);
          });
        }, 300);

        // hammer swipe gestures
        var pageOne = document.getElementById('page1');
        var pageTwo = document.getElementById('page2');
        // create a simple instance
        // by default, it only adds horizontal recognizers
        var mPageOne = new Hammer(pageOne);
        var mPageTwo =  new Hammer(pageTwo);

        mPageOne.on("swipeleft", () => {
          document.getElementById('page2').style.display = 'flex';
          document.getElementById('page1').style.display = 'none';
        });
        mPageOne.on("swiperight", () => {
          document.getElementById('page2').style.display = 'flex';
          document.getElementById('page1').style.display = 'none';
        });
        mPageTwo.on("swipeleft", () => {
          document.getElementById('page2').style.display = 'none';
          document.getElementById('page1').style.display = 'flex';
        });
        mPageTwo.on("swiperight", () => {
          document.getElementById('page2').style.display = 'none';
          document.getElementById('page1').style.display = 'flex';
        });

      });

      document.addEventListener("backbutton", onBackKeyDown, false);

      function onBackKeyDown() {
          // Handle the back buttons
          navigator.notification.confirm(
              'Terminate app?', // message
              onConfirm,            // callback to invoke with index of button pressed
              'Exit',           // title
              ['Cancel', 'Yes']     // buttonLabels
          );
      }

      function onConfirm(buttonIndex) {
          if (buttonIndex === 2) {
            if (startPressed) {
              setTimeout(
                write('    </trkseg>\n' + '  </trk>\n' + '</gpx>\n' +
                  '<metadata>\n  <distance>' + (distance/1000).toFixed(3) + '</distance>\n' +
                  '  <totalTime>' + (currentMilliseconds - startMilliseconds) + '</totalTime>\n' +
                  '</metadata>\n'
              ), 500);
            }
            setTimeout(navigator.app.exitApp(), 2000);
          }
      }

      document.getElementById('stopButton').addEventListener('click', function () {
        setTimeout(
          write('    </trkseg>\n' + '  </trk>\n' + '</gpx>\n' +
            '<metadata>\n  <distance>' + (distance/1000).toFixed(3) + '</distance>\n' +
            '  <totalTime>' + (currentMilliseconds - startMilliseconds) + '</totalTime>\n' +
            '</metadata>\n'
        ), 500);
        document.getElementById('historyData').innerHTML = ''
        listDir(cordova.file.externalDataDirectory);
        totalDistance = 0;
        totalTime = 0;
        setTimeout(() => {
          logFiles = logFiles.sort().reverse();
          logFiles.forEach((file, i) => {
            readFile(file);
          });

        }, 300);
        initialised = false;
        startPressed = false;
        clearInterval(timeDisplay);
        distance = 0;
        lapTime = 0;
        fileHandler = -1;
        document.getElementById('time').innerHTML = 'Time: ';
        document.getElementById('distance').innerHTML = 'Distance: ';
        document.getElementById('pace').innerHTML = 'Pace: ';
        document.getElementById('lap').innerHTML = 'Last lap: ';
        document.getElementById('startButton').style.display = 'inline-block';
        document.getElementById('startButton').style.color = 'grey';
        document.getElementById('stopButton').style.display = 'none';
      });

      var watchID = navigator.geolocation.watchPosition(
          function (position) {

            // map refresh
            cordovaPos = {lat: position.coords.latitude, lng: position.coords.longitude};
            const newLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            myTrackCoordinates.push(newLatLng);
            myMarker.setPosition(newLatLng);
            if (CENTER_MAP) {
              map.setCenter(cordovaPos);
            }
            if (map.getZoom() === 3) {
                map.setZoom(14);
            }

            if (!startPressed) {
              document.getElementById('startButton').style.color = 'red';
              document.getElementById('startButton').addEventListener('click', () => {
                document.getElementById('startButton').style.display = 'none';
                document.getElementById('stopButton').style.display = 'inline-block';
                startPressed = true;
              });  // startButton click
              return -1;   // app not started
            }

            if (!initialised) {
              say('Application started');
              start = new Date();
              setTime(start);
              logFileName = year + month + day + '-' + hours + minutes + seconds + '.gpx';
              startMilliseconds = start.getTime();
              previousMilliseconds = startMilliseconds;
              tickMilliseconds = startMilliseconds;
              timeDisplay = setInterval(() => {
                const time = new Date ();
                const currentMilliseconds = time.getTime();
                const timeGap = parseInt((currentMilliseconds - startMilliseconds)/1000, 10);
                const s = Number.isNaN(timeGap%60) ? 0 : timeGap%60;
                const m = Number.isNaN(parseInt((timeGap / 60) % 60)) ? 0 : parseInt((timeGap / 60) % 60, 10);
                const h = Number.isNaN(parseInt((timeGap / 3600))) ? 0 : parseInt((timeGap / 3600), 10);
                const ss = s < 10 ? '0' + s.toString() : s.toString();
                const mm = m < 10 ? '0' + m.toString() : m.toString();
                const hh = h.toString();
                document.getElementById('time').innerHTML = 'Time: ' + hh + ':' + mm + ':' + ss;
              }, 1000);

              window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
                dir.getFile(logFileName, { create: true }, function(file) {
                  fileHandler = file;
                  write(GPX_HEADER);
                });
              });

              initialised = true;
              return -2;
            }

            const time = new Date ();
            setTime(time);
            currentMilliseconds = time.getTime();
            const timeGap = parseInt((currentMilliseconds - startMilliseconds)/1000, 10);
            const lastTick = currentMilliseconds - tickMilliseconds;
            tickMilliseconds = currentMilliseconds;
            prevPos = {lat: lat, lng: lon};
            const dist = 1000 * distanceInKmBetweenEarthCoordinates(cordovaPos, prevPos);
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            distance += dist;
            lap += dist;
            if (lap >= lapDistance) {
              say('attention');
              lap = 0;
              lapTime = ((currentMilliseconds - previousMilliseconds)/60000).toFixed (2);
              previousMilliseconds = currentMilliseconds;
              document.getElementById('lap').innerHTML = 'Lap time: ' + lapTime + ' min';
              document.getElementById('pace').innerHTML = 'Pace: ' + ((1000*timeGap)/(60*distance)).toFixed(2) + ' min/km';
              say('distance: ' + (distance/1000).toFixed(0) + ' km\naverage pace: ' +
                ((1000*timeGap)/(60*distance)).toFixed(2) + ' min/km\nlast lap: ' +
                parseInt(lapTime, 10) + 'minutes' + secs(lapTime) + 'seconds');
            }

            // if (lastTick > 0 && position.coords.accuracy <= 7) {
            //   const speed = 3600 * dist / lastTick;
            //   if (speed > maxSpeed) {
            //     maxSpeed = speed;
            //     document.getElementById('max').innerHTML = 'Max: ' + speed.toFixed(1) + ' km/h  at ' + parseInt(distance/1000) + ' km';
            //     say('max speed ' + speed.toFixed(1) + 'km/h');
            //   }
            // }

            const msg = '      <trkpt lat="' + position.coords.latitude + '" lon="' +
                position.coords.longitude + '">\n' + '      <ele>' + position.coords.altitude +
                '</ele>\n' + '      <spd>' + position.coords.speed + '</spd>\n' +
                '      <time>' + year + '-' + month + '-' + day +
                'T' + hours + ':' + minutes + ':' + seconds + 'Z</time>\n' +
                '      </trkpt>\n';
            write(msg);

            document.getElementById('distance').innerHTML = 'Distance: ' + (distance/ 1000).toFixed(3) + ' km';
          },
          function (error) {
              navigator.notification.alert('Waiting for GPS...');
          },
          { maximumAge: 15000, timeout: 20000, enableHighAccuracy: true }
      );
    }
};

app.initialize();
