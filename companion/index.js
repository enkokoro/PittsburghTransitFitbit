import { me } from "companion";
import * as messaging from "messaging";
import { geolocation } from "geolocation";
import { settingsStorage } from "settings";

import { PittAPI } from "./pitt.js"
import { STOPS, FAVORITE_STOP_SETTING, ROUTES } from "../common/globals.js";

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


function getNearestStops(){
  //let position = getLocation();
  
  // use favorite stops if cannot use gps
  //if(position == null){ 
    return settingsStorage.getItem(FAVORITE_STOP_SETTING);
  //}
  
  /*else{
    let s, s1, s2;
    let min_dist1, min_dist2;
    min_dist1 = -1;
    min_dist2 = -1;
    for(s in STOPS){
      
    }
   
  }*/
}

function sendPittSchedule() {
  
  let stop = settingsStorage.getItem(FAVORITE_STOP_SETTING);
  if (stop) {
    try {
      stop = JSON.parse(stop);
    }
    catch (e) {
      console.log("error parsing setting value: " + e);
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
  
  let pittApi = new PittAPI();
  pittApi.realTimeDepartures(stop, ROUTES).then(function(departures) {
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