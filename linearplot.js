var linearTrackDefaults = {
    width: 940,
    height: 500,
    left_margin: 15,
    right_margin: 15,
    bottom_margin: 5,
    axis_height: 50,
    name: "defaultlinear",
};

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
	.on("zoomend", this.callBrushFinished.bind(this));

    this.chart = d3.select(layout.container)
	.append("svg")
	.attr("id", function() { return layout.container.slice(1) + "_svg"; })
	.attr("width", this.layout.width)
	.attr("height", this.layout.height)
	.attr("class", "mainTracks")
	.call(this.zoom);

    this.chart.append("defs").append("clipPath")
	.attr("id", "trackClip_" + this.layout.name)
	.append("rect")
	.attr("width", this.layout.width_without_margins)
	//	.attr("width", this.layout.width_without_margins + this.layout.right_margin)
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

    this.tip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function(d) {
		return "<strong>Name:</strong> <span style='color:red'>" + d.name + "</span>";
	    });
    
    this.chart.call(this.tip);

    this.axisContainer = this.chart.append("g")
	.attr('class', 'trackAxis')
	.attr('width', this.layout.width_without_margins)
	.attr("transform", "translate(" + (this.layout.left_margin + 5) + "," + this.layout.height_without_axis + ")");

    this.xAxis = d3.svg.axis().scale(this.x1).orient("bottom")
	.innerTickSize(-this.layout.height)
	.outerTickSize(0)
	.tickFormat(d3.format("s"));

    this.axisContainer.append("g")
	.attr("class", "xaxislinear")
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
		.attr("clip-path", "url(#trackClip_" + this.layout.name + ")");
	    this.displayTrack(this.tracks[i], i);
	    break;
	case "glyph":
	    if(typeof this.tracks[i].linear_invert !== 'undefined' && this.tracks[i].linear_invert == true) {
		this.tracks[i].invert = -1;
	    } else {
		this.tracks[i].invert = 1;
	    }
	    if(typeof this.tracks[i].linear_padding !== 'undefined') {
		this.tracks[i].padding = this.tracks[i].linear_padding;
	    } else {
		this.tracks[i].padding = 0;
	    }
	    this.itemRects[i] = this.main.append("g")
		.attr("class", this.tracks[i].trackName)
		.attr("width", this.layout.width_without_margins)
		.attr("clip-path", "url(#trackClip_" + this.layout.name + ")");
	    this.displayGlyphTrack(this.tracks[i], i);
	    break;
	case "plot":
	    this.tracks[i].g = this.itemRects[i] = this.main.append("g")
		.attr("class", this.tracks[i].trackName)
		.attr("width", this.layout.width_without_margins)
		.attr("clip-path", "url(#trackClip_" + this.layout.name + ")");
	    this.tracks[i].g.append("path")
		.attr("class", this.tracks[i].trackName)
		.attr("id", this.tracks[i].trackName)
		.attr("stroke-width", 1)
		.attr("fill", "none");

	    this.displayPlotTrack(this.tracks[i], i);
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

    // Because of how the tooltip library binds to the SVG object we have to turn it
    // on or off here rather than in the .on() call, we'll redirect the calls to
    // a dummy do-nothing object if we're not showing tips in this context.
    var tip = {show: function() {}, hide: function() {} };
    if(('undefined' !== typeof track.showTooltip) && typeof track.showTooltip) {
	tip = this.tip;
    }

    var stackNum = this.tracks[i].stackNum;
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
    .attr("dy", "0.94em")
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
	    
    entering_rects.append("rect")
    .each(function (d) { d.width = x1(d.end) - x1(d.start); })
    .attr("class", function(d) {return track.trackName + '_' + (d.strand == 1 ? 'pos' : 'neg') + ' ' + ((d.width > 5) ? (track.trackName + '_' + (d.strand == 1 ? 'pos_zoomed' : 'neg_zoomed')) : '' );})
    .attr("width", function(d) {return d.width;})
    .attr("height", function(d) {return .9 * y1(1);})
    .on("click", function(d,i) {
	    if('undefined' !== typeof track.linear_mouseclick) {
		var fn = window[track.linear_mouseclick];
		if('object' ==  typeof fn) {
		    return fn.onclick(track.trackName, d);
		} else if('function' == typeof fn) {
		    return fn(d);
		}
	    } else {
		null;
	    }
	})
    .on('mouseover', function(d) { 
	    tip.show(d);
	    if('undefined' !== typeof track.linear_mouseover) {
		var fn = window[track.linear_mouseover];
		if('object' ==  typeof fn) {
		    return fn.mouseover(track.trackName, d);
		} else if('function' == typeof fn) {
		    return fn(d);
		}
	    }	
	})
    .on('mouseout', function(d) { 
	    tip.hide(d);
	    if('undefined' !== typeof track.linear_mouseout) {
		var fn = window[track.linear_mouseout];
		if('object' ==  typeof fn) {
		    return fn.mouseout(track.trackName, d);
		} else if('function' == typeof fn) {
		    return fn(d);
		}
	    }	
	});

    if(('undefined' !== typeof track.showLabels) && typeof track.showLabels) {
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
    // Because of how the tooltip library binds to the SVG object we have to turn it
    // on or off here rather than in the .on() call, we'll redirect the calls to
    // a dummy do-nothing object if we're not showing tips in this context.
    var tip = {show: function() {}, hide: function() {} };
    if(('undefined' !== typeof track.showTooltip) && typeof track.showTooltip) {
	tip = this.tip;
    }

    var stackNum = this.tracks[i].stackNum;
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
    .attr("class", function(d) {return track.trackName + ' ' + ((d.width > 5) ? (track.trackName + '_zoomed') : '' );});

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
    .attr("width", function(d) {return d.width; })
    .attr("height", function(d) {return .8 * y1(1);})
    .on("click", function(d,i) {
	    if('undefined' !== typeof track.linear_mouseclick) {
		var fn = window[track.linear_mouseclick];
		if('object' ==  typeof fn) {
		    return fn.onclick(track.trackName, d);
		} else if('function' == typeof fn) {
		    return fn(d);
		}
	    } else {
		null;
	    }
	})
    .on('mouseover', function(d) { 
	    tip.show(d);
	    if('undefined' !== typeof track.linear_mouseover) {
		var fn = window[track.linear_mouseover];
		if('object' ==  typeof fn) {
		    return fn.mouseover(track.trackName, d);
		} else if('function' == typeof fn) {
		    return fn(d);
		}
	    }	
	})
    .on('mouseout', function(d) { 
	    tip.hide(d);
	    if('undefined' !== typeof track.linear_mouseout) {
		var fn = window[track.linear_mouseout];
		if('object' ==  typeof fn) {
		    return fn.mouseout(track.trackName, d);
		} else if('function' == typeof fn) {
		    return fn(d);
		}
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

genomeTrack.prototype.displayPlotTrack = function(track, i) {
    var visStart = this.visStart,
    visEnd = this.visEnd,
    x1 = this.x1,
    y1 = this.y1;

    if((typeof track.visible == 'undefined') || (track.visible == false)) {
    	return;
    }

    if((typeof track.linear_plot_width == 'undefined') || (typeof track.linear_plot_height == 'undefined')) {
//    if((typeof track.linear_plot_width == 'undefined')) {
	return;
    }

    var startItem = parseInt(visStart / track.bp_per_element);
    var endItem = Math.min(parseInt(visEnd / track.bp_per_element), track.items.length);
    var offset = ((startItem+1) * track.bp_per_element) - visStart;

    var items = track.items.filter(function(d, i) { return i >= startItem && i <= endItem } );

    track.plotScale = d3.scale.linear()
	.domain([track.plot_min, track.plot_max])
	.range([track.linear_plot_height+(track.linear_plot_width/2), track.linear_plot_height-(track.linear_plot_width/2)]);

    var lineFunction = d3.svg.line()
	.x(function(d, i) { return x1((i*track.bp_per_element)); } )
	.y(function(d, i) { return track.plotScale(d); } )
	.interpolate("linear");

     var plot = this.itemRects[i].selectAll("path")
	.attr("d", lineFunction(track.items))

//    plot.exit().remove();

}

genomeTrack.prototype.displayGlyphTrack = function(track, i) {
    var visStart = this.visStart,
    visEnd = this.visEnd,
    x1 = this.x1,
    y1 = this.y1;

    if((typeof track.visible !== 'undefined') && (track.visible != false)) {
    	return;
    }

    // Because of how the tooltip library binds to the SVG object we have to turn it
    // on or off here rather than in the .on() call, we'll redirect the calls to
    // a dummy do-nothing object if we're not showing tips in this context.
    var tip = {show: function() {}, hide: function() {} };
    if(('undefined' !== typeof track.showTooltip) && typeof track.showTooltip) {
	tip = this.tip;
    }

    var items = track.items.filter(function(d) {return d.bp <= visEnd && d.bp >= visStart;});

    // When we move we need to recalculate the stacking order
    var stackCount = 0;
    for(var j = 0; j < items.length; j++) {
	if(items[j].bp < visStart || items[j].bp > visEnd) {
	    continue;
	}
	if(j < 1) {
	    items[j].stackCount = 0;
	    continue;
	}

	var dist = x1(items[j].bp) - x1(items[j-1].bp);

	if(dist < track.linear_pixel_spacing) {
	    items[j].stackCount = items[j-1].stackCount + 1;
	    continue;
	}

	items[j].stackCount = 0;
    }

    // Because SVG coordinates are from the top-left, the "height" is pixels DOWN from
    // the top of the image to start stacking the glyphs

    var glyphs = this.itemRects[i].selectAll("path")
    .data(items, function(d) { return d.id; })
    .attr("transform", function(d,i) { return "translate(" + (x1(d.bp) + track.padding) + ',' + (track.linear_height - (track.linear_glyph_buffer * d.stackCount * track.invert))  + ")"; });
   
    var entering_glyphs = glyphs.enter()
    .append('path')
    .attr('id', function(d,i) { return track.trackName + "_glyph" + d.id; })
    .attr('class', function(d) {return track.trackName + '_' + d.type + " linear_" + track.trackName + '_' + d.type; })
    .attr("d", d3.svg.symbol().type(track.glyphType).size(track.linear_glyphSize))
    .attr("transform", function(d,i) {  return "translate(" + (x1(d.bp) + track.padding) + ',' + (track.linear_height - (track.linear_glyph_buffer * d.stackCount * track.invert))  + ")"; })
    .on("click", function(d,i) {
	    if('undefined' !== typeof track.linear_mouseclick) {
		var fn = window[track.linear_mouseclick];
		if('object' ==  typeof fn) {
		    return fn.onclick(track.trackName, d);
		} else if('function' == typeof fn) {
		    return fn(d);
		}
	    } else {
		null;
	    }
	})
    .on('mouseover', function(d) { 
	    tip.show(d);
	    if('undefined' !== typeof track.linear_mouseover) {
		var fn = window[track.linear_mouseover];
		if('object' ==  typeof fn) {
		    return fn.mouseover(track.trackName, d);
		} else if('function' == typeof fn) {
		    return fn(d);
		}
	    }	
	})
    .on('mouseout', function(d) { 
	    tip.hide(d);
	    if('undefined' !== typeof track.linear_mouseout) {
		var fn = window[track.linear_mouseout];
		if('object' ==  typeof fn) {
		    return fn.mouseout(track.trackName, d);
		} else if('function' == typeof fn) {
		    return fn(d);
		}
	    }	
	});

    glyphs.exit()
    .remove();
    
}

genomeTrack.prototype.displayAxis = function() {
    this.axisContainer.select(".xaxislinear").call(this.xAxis);
}

genomeTrack.prototype.update = function(startbp, endbp) {
    //    console.log(startbp, endbp);

    this.visStart = startbp;
    this.visEnd = endbp;

    this.zoom.x(this.x1.domain([startbp,endbp]));

    this.redraw();
}

genomeTrack.prototype.update_finished = function(startbp, endbp) {
    //    console.log("Thank you, got: " + startbp, endbp);

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
	case "glyph":
	    this.displayGlyphTrack(this.tracks[i], i);
	    break;
	case "plot":
	    this.displayPlotTrack(this.tracks[i], i);
	    break;
	default:
	    // Do nothing for an unknown track type
	}
    }
    
    this.axisContainer.select(".xaxislinear").call(this.xAxis);

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
	if( Object.prototype.toString.call( this.callbackObj ) === '[object Array]' ) { 
	    for(var obj in this.callbackObj) {
		if(this.callbackObj.hasOwnProperty(obj)) {
		    this.callbackObj[obj].update(this.x1.domain()[0], this.x1.domain()[1]);
		}
	    }
	} else {
	    this.callbackObj.update(this.x1.domain()[0], this.x1.domain()[1]);
	}
    }

    this.redraw();

}

genomeTrack.prototype.addBrushCallback = function(obj) {
    if('undefined' !== typeof this.callbackObj) {

	if( Object.prototype.toString.call( obj ) === '[object Array]' ) { 
	    this.callbackObj.push(obj);
	} else {
	    var tmpobj = this.callbackObj;
	    this.callbackObj = [tmpobj, obj];
	}
    } else {
	this.callbackObj = obj;
    }
}

genomeTrack.prototype.callBrushFinished = function() {
    if('undefined' !== typeof this.callbackObj) {
	if( Object.prototype.toString.call( this.callbackObj ) === '[object Array]' ) { 
	    for(var obj in this.callbackObj) {
		if(this.callbackObj.hasOwnProperty(obj)) {
		    this.callbackObj[obj].update_finished(this.x1.domain()[0], this.x1.domain()[1]);
		}
	    }
	} else {
	    this.callbackObj.update_finished(this.x1.domain()[0], this.x1.domain()[1]);
	}
    }

}
