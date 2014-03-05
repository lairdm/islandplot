var linearlayout = {genomesize: 6264404,
	      container: "#linearchart"};

var contextLayout = {genomesize: 6264404,
	      container: "#brush"};

var linearTrack = new genomeTrack(linearlayout, tracks);
var brush = new linearBrush(contextLayout,linearTrack);

linearTrack.addBrushCallback(brush);

if('undefined' !== typeof cTrack) {
    console.log("Hooking up circular track callback");
    linearTrack.addBrushCallback(cTrack);
}

function linearPopup(d) {
    console.log(d);
}