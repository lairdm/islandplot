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

    this.zoom = d3.behavior.zoom()
	.x(this.x1)
	.on("zoom", this.rescale.bind(this))

    this.chart = d3.select(layout.container)
	.append("svg")
	.attr("width", this.layout.width)
	.attr("height", this.layout.height)
	.attr("class", "mainTracks")
	.call(this.zoom);

    this.chart.append("defs").append("clipPath")
	.attr("id", "trackClip_" + this.layout.name)
	.append("rect")
	.attr("width", this.layout.width_without_margins + this.layout.right_margin)
	.attr("height", this.layout.height)
	.attr("transform", "translate(0,0)");
    //	.attr("transform", "translate(" + this.layout.left_margin + ",0)");
    
    this.main = this.chart.append("g")
       	.attr("transform", "translate(" + this.layout.left_margin + ",0)")
	.attr("width", this.layout.width_without_margins)
	.attr("height", this.layout.height)
	.attr("class", "mainTrack");

    // Start with showing the entire genome
    this.visStart = 0;
    this.visEnd = layout.genomesize;
    this.genomesize = layout.genomesize;

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

    var rects = this.itemRects[i].selectAll("g")
    .data(visItems, function(d) { return d.id; })
    .attr("transform", function(d,i) { return "translate(" + x1(d.start) + ',' +  (y1((d.strand == -1 ? stackNum : stackNum-1)) + 10) + ")"; });

    rects.selectAll("rect")
    .each(function (d) { d.width = x1(d.end) - x1(d.start); })
    //    .attr("x", function(d) {return x1(d.start);})
    .attr("width", function(d) {return d.width;})
    .attr("class", function(d) {return track.trackName + '_' + (d.strand == 1 ? 'pos' : 'neg') + ' ' + ((d.width > 5) ? (track.trackName + '_' + (d.strand == 1 ? 'pos_zoomed' : 'neg_zoomed')) : '' );});

    rects.selectAll("text")
    .attr("dx", "2px")
    .attr("dy", "1em")
    .each(function (d) {
	    var bb = this.getBBox();
	    var slice_length = x1(d.end) - x1(d.start) - 2; // -2 to offset the dx above
	    d.visible = (slice_length > bb.width);
	    //	    console.log(d);
	    //	    console.log(slice_length);
	    //	    console.log(bb.width);
	    //	    console.log(d.visible);
	})
    .attr("class", function(d) {return track.trackName + '_text ' + track.trackName + '_' + (d.strand == 1 ? 'pos' : 'neg') + '_text ' + (d.visible ? null : "linear_hidden" ); });

    var entering_rects = rects.enter().append("g")
    .attr("transform", function(d,i) { return "translate(" + x1(d.start) + ',' +  (y1((d.strand == -1 ? stackNum : stackNum-1)) + 10) + ")"; })
    .attr("class", function(d) {return track.trackName + '_' + (d.strand == 1 ? 'pos' : 'neg') + '_group'; });
	    
    //    var entering_rects = rects.enter().append("rect")
    entering_rects.append("rect")
    .each(function (d) { d.width = x1(d.end) - x1(d.start); })
    .attr("class", function(d) {return track.trackName + '_' + (d.strand == 1 ? 'pos' : 'neg') + ' ' + ((d.width > 5) ? (track.trackName + '_' + (d.strand == 1 ? 'pos_zoomed' : 'neg_zoomed')) : '' );})
    //    .attr("x", function(d) {return x1(d.start);})
    //    .attr("y", function(d) {return y1((d.strand == -1 ? stackNum : stackNum-1)) + 10})
    //old bad one    .attr("y", function(d) {return y1(i) + 10 + (d.strand == -1 ? y1(1)/2: (.2 * y1(1)/2))})
    .attr("width", function(d) {return d.width;})
    .attr("height", function(d) {return .8 * y1(1);})
    //    .attr("height", function(d) {return .8 * y1(1)/2;})
    //    .attr("clip-path", "url(#trackClip_" + this.layout.name + ")")
    .on("click", function(d,i) {
	    if('undefined' !== typeof track.linear_mouseclick) {
		var fn = window[track.linear_mouseclick];
		return fn(d);
	    } else {
		null;
	    }
	});

    if('undefined' !== typeof track.showLabels) {
	entering_rects.append("text")
	    .text(function(d) {return d.name;})
	    .attr("dx", "2px")
	    .attr("dy", "1em")
	    .each(function (d) {
		    var bb = this.getBBox();
		    var slice_length = x1(d.end - d.start);
		    d.visible = (slice_length > bb.width);
		    //		    console.log(d);
		    //		    console.log(slice_length);
		    //		    console.log(bb.width);
		    //		    console.log(d.visible);
		})
	    .attr("class", function(d) {return track.trackName + '_text ' +  track.trackName + '_' + (d.strand == 1 ? 'pos' : 'neg') + '_text ' + (d.visible ? null : "linear_hidden"  ); });
    }

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

    var rects = this.itemRects[i].selectAll("g")
    .data(visItems, function(d) { return d.id; })
    .attr("transform", function(d,i) { return "translate(" + x1(d.start) + ',' + (y1(stackNum) + 10)  + ")"; });


    this.itemRects[i].selectAll("rect")
    .each(function (d) { d.width = x1(d.end) - x1(d.start); })
    //    .attr("x", function(d) {return x1(d.start);})
    .attr("width", function(d) {return d.width; })
    .attr("class", function(d) {return track.trackName + ' ' + ((d.width > 5) ? (track.trackName + '_zoomed') : '' );})

    rects.selectAll("text")
    .attr("dx", "2px")
    .attr("dy", "1em")
    .each(function (d) {
	    var bb = this.getBBox();
	    var slice_length = x1(d.end) - x1(d.start) - 2; // -2 to offset the dx above
	    d.visible = (slice_length > bb.width);
	    //	    console.log(d);
	    //	    console.log(slice_length);
	    //	    console.log(bb.width);
	    //	    console.log(d.visible);
	})
    .attr("class", function(d) {return track.trackName + '_text ' + (d.visible ? null : "linear_hidden" ); });

    var entering_rects = rects.enter().append("g")
    .attr("transform", function(d,i) { return "translate(" + x1(d.start) + ',' + (y1(stackNum) + 10)  + ")"; })
    .attr("class", function(d) {return track.trackName + '_group'; });

    entering_rects.append("rect")
    .each(function (d) { d.width = x1(d.end) - x1(d.start); })
    .attr("class", function(d) {return track.trackName + ' ' + ((d.width > 5) ? (track.trackName + '_zoomed') : '' );})
    //    .attr("x", function(d) {return x1(d.start);})
    //    .attr("y", function(d) {return y1(stackNum) + 10})
    .attr("width", function(d) {return d.width; })
    .attr("height", function(d) {return .8 * y1(1);})
    //    .attr("clip-path", "url(#trackClip_" + this.layout.name + ")");
    .on("click", function(d,i) {
	    if('undefined' !== typeof track.linear_mouseclick) {
		var fn = window[track.linear_mouseclick];
		return fn(d);
	    } else {
		null;
	    }
	});

    if('undefined' !== typeof track.showLabels) {
	entering_rects.append("text")
	    .text(function(d) {return d.name;})
	    .attr("dx", "2px")
	    .attr("dy", "1em")
	    .each(function (d) {
		    var bb = this.getBBox();
		    var slice_length = x1(d.end) - x1(d.start) -2 ; // -2 to offset the dx above
		    d.visible = (slice_length > bb.width);
		    //		    console.log(d);
		    //		    console.log(slice_length);
		    //		    console.log(bb.width);
		    //		    console.log(d.visible);
		})
	    .attr("class", function(d) {return track.trackName + '_text ' + (d.visible ? null : "linear_hidden" ); });
    }


    rects.exit().remove();
}

genomeTrack.prototype.displayAxis = function() {
    this.axisContainer.select(".x.axis.bottom").call(this.xAxis);
}

genomeTrack.prototype.update = function(startbp, endbp) {
    //    console.log(startbp, endbp);

    this.visStart = startbp;
    this.visEnd = endbp;

    this.zoom.x(this.x1.domain([startbp,endbp]));

    this.redraw();
}

genomeTrack.prototype.redraw = function() {

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

genomeTrack.prototype.rescale = function() {

    var reset_s = 0;
    if ((this.x1.domain()[1] - this.x1.domain()[0]) >= (this.genomesize - 0)) {
	this.zoom.x(this.x1.domain([0, this.genomesize]));
	reset_s = 1;
    }

    if (reset_s == 1) { // Both axes are full resolution. Reset.
	this.zoom.scale(1);
	this.zoom.translate([0,0]);
    }
    else {
	if (this.x1.domain()[0] < 0) {
	    this.x1.domain([0, this.x1.domain()[1] - this.x1.domain()[0] + 0]);
	}
	if (this.x1.domain()[1] > this.genomesize) {
	    var xdom0 = this.x1.domain()[0] - this.x1.domain()[1] + this.genomesize;
	    this.x1.domain([xdom0, this.genomesize]);
	}
    }

    var cur_domain = this.x1.domain();
    this.visStart = cur_domain[0];
    this.visEnd = cur_domain[1];

    if('undefined' !== typeof this.callbackObj) {
	this.callbackObj.update(this.x1.domain()[0], this.x1.domain()[1]);
    }

    this.redraw();

}

genomeTrack.prototype.addBrushCallback = function(obj) {
    this.callbackObj = obj;
}

