import { me } from "companion";
import * as messaging from "messaging";
import { geolocation } from "geolocation";
import { settingsStorage } from "settings";

import { PittAPI } from "./pitt.js"
import { STOPS, FAVORITE_ROUTE_SETTING, FAVORITE_STOP_SETTING, ROUTES } from "../common/globals.js";

settingsStorage.onchange = function(evt) {
  sendPittSchedule();
}

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  // Ready to send or receive messages
  sendPittSchedule();
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  // Output the message to the console
  console.log(JSON.stringify(evt.data));
}

// Get GPS Locations
function getLocation(){
  return geolocation.getCurrentPosition(locationSuccess, locationError);

  function locationSuccess(position) {
      console.log("Latitude: " + position.coords.latitude,
                  "Longitude: " + position.coords.longitude);
      return position;
  }

  function locationError(error) {
    console.log("Error: " + error.code,
                "Message: " + error.message);
    return null;
  }
}


function sendPittSchedule() {
  // get stops
  let stop = settingsStorage.getItem(FAVORITE_STOP_SETTING);
  if (stop) {
    try {
      stop = JSON.parse(stop);
    }
    catch (e) {
      console.log("error parsing stop setting value: " + e);
    }
  }
 
  if (!stop || typeof(stop) !== "object" || stop.length < 1 || typeof(stop[0]) !== "object") {
    stop = "7117";
  }
  else {
    let temp = "";
    stop.forEach(s => {temp += "," + STOPS[s.name].id});
    
    stop = temp.substring(1);
  }
  console.log(stop);
  
  // get routes
  let route = settingsStorage.getItem(FAVORITE_ROUTE_SETTING);
  if (route) {
    try {
      route = JSON.parse(route);
    }
    catch (e) {
      console.log("error parsing route setting value: " + e);
    }
  }
 
  if (!route || typeof(route) !== "object" || route.length < 1 || typeof(route[0]) !== "object") {
    route = ROUTES;
  }
  else {
    let temp = "";
    route.forEach(r => {temp += "," + r.name});
    
    route = temp.substring(1);
  }
  console.log(route);
  
  
  let pittApi = new PittAPI();
  pittApi.realTimeDepartures(stop, route).then(function(departures) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      console.log(departures);
      // Limit results to the number of tiles available in firmware
      //departures.splice(0, Math.min(STOP_COUNT, departures.length));
      messaging.peerSocket.send(departures);
    }
  }).catch(function (e) {
    console.log("error"); console.log(e)
  });
}