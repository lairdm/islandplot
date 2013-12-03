var circularlayout = {genomesize: 6264404,
		      container: "#circularchart",
        };

var cTrack = new circularTrack(circularlayout, tracks);
cTrack.attachBrush(linearTrack);

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
	cTrack.showTrack("track5");
    } else {
	cTrack.hideTrack("track5");
    }
}

