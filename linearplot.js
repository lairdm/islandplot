var linearTrackDefaults = {
    width: 940,
    height: 500,
    left_margin: 15,
    right_margin: 15,
    bottom_margin: 5,
    axis_height: 50,
    name: "defaultlinear",
}

function genomeTrack(layout,tracks) {

    this.tracks = tracks;
    this.layout = layout;
    this.numTracks = this.countTracks();

    if('undefined' !== typeof layout) {
	// Copy over any defaults not passed in
	// by the user
	for(var i in linearTrackDefaults) {
	    if('undefined' == typeof layout[i]) {
		this.layout[i] = linearTrackDefaults[i];
	    }
	}
    }

    this.layout.width_without_margins =
	this.layout.width - this.layout.left_margin -
	this.layout.right_margin;

    this.layout.height_without_axis = this.layout.height -
	this.layout.axis_height;

    this.itemRects = [];

    this.x = d3.scale.linear()
	.domain([0, layout.genomesize])
	.range([0,this.layout.width_without_margins]);
    this.x1 = d3.scale.linear()
	.range([0,this.layout.width_without_margins])
       	.domain([0, layout.genomesize]);
    this.y1 = d3.scale.linear()
	.domain([0,this.numTracks])
	.range([0,(this.layout.height_without_axis-this.layout.bottom_margin)]);

    this.chart = d3.select(layout.container)
	.append("svg")
	.attr("width", this.layout.width)
	.attr("height", this.layout.height)
	.attr("class", "mainTracks");

    this.chart.append("defs").append("clipPath")
	.attr("id", "trackClip_" + this.layout.name)
	.append("rect")
	.attr("width", this.layout.width_without_margins)
	.attr("height", this.layout.height)
	.attr("transform", "translate(" + this.layout.left_margin + ",0)");
    
    this.main = this.chart.append("g")
       	.attr("transform", "translate(" + this.layout.left_margin + ",0)")
	.attr("width", this.layout.width_without_margins)
	.attr("height", this.layout.height)
	.attr("class", "mainTrack");

    // Start with showing the entire genome
    this.visStart = 0;
    this.visEnd = layout.genomesize;

    this.axisContainer = this.chart.append("g")
	.attr('class', 'trackAxis')
	.attr('width', this.layout.width_without_margins)
	.attr("transform", "translate(" + (this.layout.left_margin + 15) + "," + this.layout.height_without_axis + ")");

    this.xAxis = d3.svg.axis().scale(this.x1).orient("bottom")
	.tickFormat(d3.format("s"));

    this.axisContainer.append("g")
	.attr("class", "x axis bottom")
	.attr('width', this.layout.width_without_margins)

	.attr("transform", "translate(0," + 10 + ")")
	.call(this.xAxis);


    for(var i=0; i < this.tracks.length; i++) {
	// We're going to see what type of tracks we have
	// and dispatch them appropriately

	 if("undefined" !== this.tracks[i].skipLinear
	    &&  this.tracks[i].skipLinear == true) {
	     continue;
	 }

	switch(this.tracks[i].trackType) {
	case "stranded":
	    this.itemRects[i] = this.main.append("g")
		.attr("class", this.tracks[i].trackName)
		.attr("width", this.layout.width_without_margins)
		.attr("clip-path", "url(#trackClip_" + this.layout.name + ")");
	    this.displayStranded(this.tracks[i], i);
	    break;
	case "track":
	    this.itemRects[i] = this.main.append("g")
		.attr("class", this.tracks[i].trackName)
		.attr("width", this.layout.width_without_margins)
		.attr("clip-path", "url(#clipPath_" + this.layout.name + ")");
	    this.displayTrack(this.tracks[i], i);
	    break;
	default:
	    // Do nothing for an unknown track type
	}
    }

}

// We can't display all track types, or some don't
// add to the stacking (ie. graph type)

genomeTrack.prototype.countTracks = function() {
    var track_count = 0;

     for(var i=0; i < this.tracks.length; i++) {

	 if("undefined" !== this.tracks[i].skipLinear
	    &&  this.tracks[i].skipLinear == true) {
	     continue;
	 }

	switch(this.tracks[i].trackType) {
	case "stranded":
	    // a linear track counts as two
	    track_count++;
	    this.tracks[i].stackNum = track_count;
	    track_count++;
	    break;
	case "track":
	    this.tracks[i].stackNum = track_count;
	    track_count++;
	    break;
	default:
	    // Do nothing for an unknown track type
	}
    }
   
    return track_count;
}

genomeTrack.prototype.displayStranded = function(track, i) {
    var visStart = this.visStart,
    visEnd = this.visEnd,
    x1 = this.x1,
    y1 = this.y1;
    var stackNum = this.tracks[i].stackNum
    //    console.log(visStart, visEnd);
    var visItems = track.items.filter(function(d) {return d.start < visEnd && d.end > visStart;});

    //    console.log(track.items);

    var rects = this.itemRects[i].selectAll("rect")
    .data(visItems, function(d) { return d.id; })
    .attr("x", function(d) {return x1(d.start);})
    .attr("width", function(d) {return x1(d.end) - x1(d.start);});

    rects.enter().append("rect")
    .attr("class", function(d) {return track.trackName + '_' + (d.strand == 1 ? 'pos' : 'neg');})
    .attr("x", function(d) {return x1(d.start);})
    .attr("y", function(d) {return y1((d.strand == -1 ? stackNum : stackNum-1)) + 10})
    //    .attr("y", function(d) {return y1(i) + 10 + (d.strand == -1 ? y1(1)/2: (.2 * y1(1)/2))})
    .attr("width", function(d) {return x1(d.end) - x1(d.start);})
    .attr("height", function(d) {return .8 * y1(1);})
    //    .attr("height", function(d) {return .8 * y1(1)/2;})
    .attr("clip-path", "url(#trackClip_" + this.layout.name + ")");


    rects.exit().remove();
}

genomeTrack.prototype.displayTrack = function(track, i) {
    var visStart = this.visStart,
    visEnd = this.visEnd,
    x1 = this.x1,
    y1 = this.y1;
    var stackNum = this.tracks[i].stackNum
    //    console.log(visStart, visEnd);
    var visItems = track.items.filter(function(d) {return d.start < visEnd && d.end > visStart;});

    //    console.log(track.items);

    var rects = this.itemRects[i].selectAll("rect")
    .data(visItems, function(d) { return d.id; })
    .attr("x", function(d) {return x1(d.start);})
    .attr("width", function(d) {return x1(d.end) - x1(d.start);});

    rects.enter().append("rect")
    .attr("class", function(d) {return track.trackName;})
    .attr("x", function(d) {return x1(d.start);})
    .attr("y", function(d) {return y1(stackNum) + 10})
    .attr("width", function(d) {return x1(d.end) - x1(d.start);})
    .attr("height", function(d) {return .8 * y1(1);})
    .attr("clip-path", "url(#trackClip_" + this.layout.name + ")");

    rects.exit().remove();
}

genomeTrack.prototype.displayAxis = function() {
    this.axisContainer.select(".x.axis.bottom").call(this.xAxis);
}

genomeTrack.prototype.update = function(startbp, endbp) {
    //    console.log(startbp, endbp);

    this.visStart = startbp;
    this.visEnd = endbp;

    this.x1.domain([startbp,endbp]);

    for(var i = 0; i < this.tracks.length; i++) {

	 if("undefined" !== this.tracks[i].skipLinear
	    &&  this.tracks[i].skipLinear == true) {
	     continue;
	 }

	switch(this.tracks[i].trackType) {
	case "stranded":
	    this.displayStranded(this.tracks[i], i);
	    break;
	case "track":
	    this.displayTrack(this.tracks[i], i);
	    break;
	default:
	    // Do nothing for an unknown track type
	}
    }
    
    this.axisContainer.select(".x.axis.bottom").call(this.xAxis);

}
