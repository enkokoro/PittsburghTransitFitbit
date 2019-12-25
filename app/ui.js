import { STOP_COUNT, STOPS } from "../common/globals.js";
import document from "document";

export function PittUI() {
  this.busList = document.getElementById("busList");
  this.statusText = document.getElementById("status");

  this.tiles = [];
  for (let i = 0; i < STOP_COUNT; i++) {
    let tile = document.getElementById(`bus-${i}`);
    if (tile) {
      this.tiles.push(tile);
    }
  }
}

PittUI.prototype.updateUI = function(state, departures) {
  if (state === "loaded") {
    this.busList.style.display = "inline";
    this.statusText.text = "";

    this.updateDepartureList(departures);
  }
  else {
    this.busList.style.display = "none";

    if (state === "loading") {
      this.statusText.text = "Loading departures ...";
    }
    else if (state === "disconnected") {
      this.statusText.text = "Please check connection to phone and Fitbit App"
    }
    else if (state === "error") {
      this.statusText.text = "Something terrible happened.";
    }
  }
}

PittUI.prototype.updateDepartureList = function(departures) {
  for (let i = 0; i < Math.min(STOP_COUNT, departures.length); i++) {
    let tile = this.tiles[i];
    if (!tile) {
      continue;
    }

    const bus = departures[i];
    if (!bus) {
      tile.style.display = "none";
      continue;
    }

    tile.style.display = "inline";
    tile.getElementById("stpnm").text = bus.stpnm;
    tile.getElementById("rt").text = bus.rt;
    tile.getElementById("tmrem").text = bus.minutes + " min";
  }
}