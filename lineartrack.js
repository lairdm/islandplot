var LinearTrack = {
    cfg: {
	w: 600,
	h: 600,
	ExtraWidthX: 100,
	ExtraWidthY: 100,

    },

    // In the options we should be given a 
    // start and end bp so we know to what
    // level to zoom

    createCanvas: function(id, options) {
	if('undefined' !== typeof options){
	    for(var i in options){
		if('undefined' !== typeof options[i]){
		    LinearTrack.cfg[i] = options[i];
		}
	    }
	}
	var cfg = LinearPlot.cfg;

	// Find the range and scale
	LinearTrack.range = Math.abs(options.end - options.start);
	LinearTrack.pixel_per_bp = LinearTrack.w / LinearTrack.range;
	LinearTrack.tracks = [];

	d3.select(id).select("svg").remove();
	
	IslandPlot.g = d3.select(id)
	    .append("svg")
	    .attr("width", cfg.w+cfg.ExtraWidthX)
	    .attr("height", cfg.h+cfg.ExtraWidthY)
	    .append("g")
	    .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");

    },

    drawAxis: function() {
	var cfg = IslandPlot.cfg;
	var g = IslandPlot.g;

	

    }
};
