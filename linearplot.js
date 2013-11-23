var margin = {top: 10, right: 40, bottom: 150, left: 60},
width = 940 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom,
contextHeight = 50;
contextWidth = width * .5;

function genomeTrack(layout,tracks) {

    this.tracks = tracks;
    this.layout = layout;
    this.numTracks = tracks.length;
    this.itemRects = [];

    this.x = d3.scale.linear()
	.domain([0, layout.genomesize])
	.range([0,width]);
    this.x1 = d3.scale.linear()
	.range([0,width])
       	.domain([0, layout.genomesize]);
    this.y1 = d3.scale.linear()
	.domain([0,this.numTracks])
	.range([0,height]);

    this.chart = d3.select(layout.container)
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.attr("class", "mainTracks");

    this.chart.append("defs").append("clipPath")
	.attr("id", "trackClip")
	.append("rect")
	.attr("width", width)
	.attr("height", height);
    
    this.main = this.chart.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.attr("width", width)
	.attr("height", height)
	.attr("class", "mainTrack");

    // Start with showing the entire genome
    this.visStart = 0;
    this.visEnd = layout.genomesize;

    this.axisContainer = this.chart.append("g")
	.attr('class', 'trackAxis')
	.attr("transform", "translate(" + 0 + "," + height + ")");

    this.xAxis = d3.svg.axis().scale(this.x1).orient("bottom")
	.tickFormat(d3.format("s"));

    this.axisContainer.append("g")
    .attr("class", "x axis bottom")
    .attr("transform", "translate(0," + 10 + ")")
    .call(this.xAxis);


    for(var i=0; i < tracks.length; i++) {
	// We're going to see what type of tracks we have
	// and dispatch them appropriately

	switch(tracks[i].trackType) {
	case "stranded":
	    this.itemRects[i] = this.main.append("g")
		.attr("class", tracks[i].trackName)
		.attr("clip-path", "url(#clipPath)");
	    this.displayStranded(tracks[i], i);
	    break;
	default:
	    // Do nothing for an unknown track type
	}
    }

}

genomeTrack.prototype.displayStranded = function(track, i) {
    var visStart = this.visStart,
    visEnd = this.visEnd,
    x1 = this.x1,
    y1 = this.y1;
    console.log(visStart, visEnd);
    var visItems = track.items.filter(function(d) {return d.start < visEnd && d.end > visStart;});

    console.log(track.items);

    var rects = this.itemRects[i].selectAll("rect")
    .data(visItems, function(d) { return d.id; })
    .attr("x", function(d) {return x1(d.start);})
    .attr("width", function(d) {return x1(d.end) - x1(d.start);});

    rects.enter().append("rect")
    .attr("class", function(d) {return track.trackName + '_' + (d.strand == 1 ? 'pos' : 'neg');})
    .attr("x", function(d) {return x1(d.start);})
    .attr("y", function(d) {return y1(i) + 10 + (d.strand == -1 ? y1(1)/2: (.2 * y1(1)/2))})
    .attr("width", function(d) {return x1(d.end) - x1(d.start);})
    .attr("height", function(d) {return .8 * y1(1)/2;});

    rects.exit().remove();
}

genomeTrack.prototype.displayAxis = function() {
    this.axisContainer.select(".x.axis.bottom").call(this.xAxis);
}

genomeTrack.prototype.update = function(startbp, endbp) {
    console.log(startbp, endbp);

    this.visStart = startbp;
    this.visEnd = endbp;

    this.x1.domain([startbp,endbp]);

    for(var i = 0; i < this.tracks.length; i++) {

	switch(this.tracks[i].trackType) {
	case "stranded":
	    this.displayStranded(this.tracks[i], i);
	    break;
	default:
	    // Do nothing for an unknown track type
	}
    }
    
    this.axisContainer.select(".x.axis.bottom").call(this.xAxis);

}
