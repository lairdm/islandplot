var linearlayout = {genomesize: 6264404,
	      container: "#linearchart"};

var contextLayout = {genomesize: 6264404,
	      container: "#brush"};

var linearTrack = new genomeTrack(linearlayout, tracks);
var brush = new linearBrush(contextLayout,linearTrack);

linearTrack.addBrushCallback(brush);

function linearPopup(d) {
    console.log(d);
}