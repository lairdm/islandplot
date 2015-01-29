var circularlayout = {genomesize: 6264404,
		      container: "#circularchart",
		      dblclick: "doubleClick",
        };

function updateGC(cb) {
    if(cb.checked) {
	cTrack.showTrack("track4");
    } else {
	cTrack.hideTrack("track4");
    }
}

function updateStrand(cb) {
    if(cb.checked) {
	cTrack.showTrack("track1");
    } else {
	cTrack.hideTrack("track1");
    }
}


function updateAdb(cb) {
    if(cb.checked) {
	cTrack.showGlyphTrackType("track5", "adb");
    } else {
	cTrack.hideGlyphTrackType("track5", "adb");
    }
}

function saveImage() {
    cTrack.saveRaster(4.0, "islandviewer.png", "tracks.css");
}

// Demo of the hover over timer, we had to
// do it this way to get around IE <9 not supporting
// parameters to the function called by setTimeout()
var timer;
var d_callback;
function islandPopup(d) {
    d_callback = d;
    timer = setTimeout(function() {console.log(d_callback);}, 1000);
}

function islandPopupClear(d) {
    clearTimeout(timer);
}

function doubleClick(plotid, coords) {
    console.log("double click!");
    console.log(plotid);
    console.log(coords);
}

var cTrack = new circularTrack(circularlayout, tracks);
if('undefined' !== typeof brush) {
    console.log("Attaching linear track brush");
    cTrack.attachBrush(brush);
    cTrack.showBrush();
}
