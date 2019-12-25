export function PittAPI(apiKey) {
  if (apiKey !== undefined) {
    this.apiKey = apiKey;
  }
  else {
    // Default key for open public access.
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
      
      // Sort departures
      buses.sort( (a,b) => { if (a.stpid == b.stpid) {return (a.minutes - b.minutes);}
                             else{return (a.stpid-b.stpid);   }} );
      
      limitResponses(buses, 3);
      
      resolve(buses);
    }).catch(function (error) {
      reject(error);
    });
  });
}