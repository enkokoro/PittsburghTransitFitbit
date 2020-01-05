export function PittAPI(apiKey) {
  if (apiKey !== undefined) {
    this.apiKey = apiKey;
  }
  else {
    // key for access
    this.apiKey = "EDdRNyfJLv9YV7ZqGibpkAE6L";
  }
};



function parseDate(reqTime, prdTime){
  let req = Number.parseInt(reqTime.substring(9, 11))*60 + Number.parseInt(reqTime.substring(12, 14));
  let prd = Number.parseInt(prdTime.substring(9, 11))*60 + Number.parseInt(prdTime.substring(12, 14));
  let res = prd-req;
  if(res < 0){
    return res + 24*60;
  }
  else{
    return res;
  }
}

function limitResponses(buses, limit){
  let i = 0;
  let stpid = 0;
  for(let b in buses){
    if(i == 0){
      stpid = b["stpid"];
      i++;
    }
    else{
      if(stpid != b["stpid"]){
        i = 1;
        stpid = b["stpid"];
      }
      else if(i >= limit){
        buses.splice(buses.indexOf(b), 1);
      }
      else{
        i++;
      }
    }
  }
}

PittAPI.prototype.realTimeDepartures = function(origin, routes) {
  let self = this;
  return new Promise(function(resolve, reject) {
    let url = "https://realtime.portauthority.org/bustime/api/v3/getpredictions?";
    url += "key=" + self.apiKey;
    url += "&stpid=" + origin;
    url += "&rt=" + routes;
    url += "&rtpidatafeed=Port%20Authority%20Bus";
    url += "&format=json";
    console.log(url);
    fetch(url).then(function(response) {
      return response.json();
    }).then(function(json) {
      console.log("Got JSON response from server:" + JSON.stringify(json));

      let data = json["bustime-response"];
      let buses = [];

      data["prd"].forEach( (bus) => {
        let tm = parseDate(bus.tmstmp, bus.prdtm);
        let d = {
            "stpnm": bus.stpnm,
            "stpid": bus.stpid,
            "rt": bus.rt,
            "rtdir": bus.rtdir,
            "minutes": tm
        };
        buses.push(d);
      });
      let position;
      try{
        position = getLocation();
      }catch{
        position = null;
      }
      
      let gpsurl = "https://realtime.portauthority.org/bustime/api/v3/getstops?";
      gpsurl += "key=" + self.apiKey;
      //gpsurl += "&stpid=" + origin;
      gpsurl += "&rtpidatafeed=Port%20Authority%20Bus";
      gpsurl += "&format=json";
      
      // Sort departures
      buses.sort( (a,b) => { 
        // for same stop, order by minutes
        if (a.stpid == b.stpid) {
          return (a.minutes - b.minutes);
        }
        // between different stop, order by distance (GPS)
        else{
          // if cannot get position, order by stop id
          if(position == null){
            return (a.stpid-b.stpid);  
          }
          else{
            let stopinfo_a = fetch(gpsurl + "&stpid="+a.stpid).json();
            let stopinfo_b = fetch(gpsurl + "&stpid="+b.stpid).json();
            console.log(stopinfo_a);
            console.log(stopinfo_b);
            let a_lat = stopinfo_a["bustime-response"]["stops"][0].lat - position.coords.latitude;
            let a_lon = stopinfo_a["bustime-response"]["stops"][0].lon - position.coords.longitude;
            let b_lat = stopinfo_b["bustime-response"]["stops"][0].lat - position.coords.latitude;
            let b_lon = stopinfo_b["bustime-response"]["stops"][0].lon - position.coords.longitude;
            let dist_a = Math.sqrt(a_lat*a_lat + a_lon*a_lon);
            let dist_b = Math.sqrt(b_lat*b_lat + b_lon*b_lon);
            return (dist_a - dist_b);
          }
        }
      } );
      
      limitResponses(buses, 3);
      
      resolve(buses);
    }).catch(function (error) {
      reject(error);
    });
  });
}