var IslandPlot = {
    cfg: {
       radius: 5,
       w: 600,
       h: 600,
       factor: 1,
       factorLegend: .85,
       levels: 3,
       maxValue: 0,
       radians: 2 * Math.PI,
       opacityArea: 0.5,
       ToRight: 5,
       TranslateX: 80,
       TranslateY: 30,
       ExtraWidthX: 100,
       ExtraWidthY: 100,
       spacing: 100000,
       legend_spacing: 5,
       layout: "polar"
    },

    createCanvas: function(id, options) {
      if('undefined' !== typeof options){
	    for(var i in options){
		  if('undefined' !== typeof options[i]){
		    IslandPlot.cfg[i] = options[i];
		  }
	    }
	  }
      var cfg = IslandPlot.cfg;
        
      IslandPlot.cfg.radians_pre_bp = cfg.radians/cfg.genomesize;
      IslandPlot.cfg.radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
      IslandPlot.cfg.tracks = [];
      IslandPlot.cfg.glyph_tracks = [];
      IslandPlot.cfg.plot_values = [];
      IslandPlot.cfg.plot_layout = [];
      d3.select(id).select("svg").remove();
	
	  IslandPlot.g = d3.select(id)
			.append("svg")
			.attr("width", cfg.w+cfg.ExtraWidthX)
			.attr("height", cfg.h+cfg.ExtraWidthY)
			.append("g")
			.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
			;

    },
    
    drawAxis: function() {
      var cfg = IslandPlot.cfg;
      var g = IslandPlot.g;
        
      var axis = g.selectAll(".axis")
		.data(d3.range(0,cfg.genomesize, cfg.spacing))
		.enter()
		.append("g")
		.attr("class", "axis");

	  axis.append("line")
		.attr("x1", function(d, i){return cfg.w/2 + (20*Math.cos((d*cfg.radians_pre_bp)-Math.PI/2));})
		.attr("y1", function(d, i){return cfg.h/2 + (20*Math.sin((d*cfg.radians_pre_bp)-Math.PI/2));})
		.attr("x2", function(d, i){return cfg.w/2 + (cfg.radius*Math.cos((d*cfg.radians_pre_bp)-Math.PI/2));})
		.attr("y2", function(d, i){return cfg.h/2 + (cfg.radius*Math.sin((d*cfg.radians_pre_bp)-Math.PI/2));})
		.attr("class", "line")
		.style("stroke", "grey")
		.style("stroke-width", "1px");

    var axis_label = g.selectAll(".axislabel")
			.data(d3.range(0,cfg.genomesize, cfg.spacing*cfg.legend_spacing))
			.enter()
			.append("g")
			.attr("class", "axislabel");
      
	axis_label.append("text")
		.attr("class", "legend")
        .text(function(d){ var prefix = d3.formatPrefix(d);
                                    return prefix.scale(d) + prefix.symbol;
                                 })
    
		.style("font-family", "sans-serif")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "1.5em")
		.attr("transform", function(d, i){return "translate(0, -10)"})
        .attr("x", function(d, i){return cfg.w/2 + ((cfg.radius+10)*Math.cos((d*cfg.radians_pre_bp)-Math.PI/2));})
		.attr("y", function(d, i){return cfg.h/2 + ((cfg.radius+10)*Math.sin((d*cfg.radians_pre_bp)-Math.PI/2));});

    },
    
    // Default values for the plot, some sanity settings

    plot_layout: {
      fill: "none",
      stroke: "grey"
    },
    
    // Draw a plot function

    drawPlot: function(plot_layout, plot_values, animate) {
      var cfg = IslandPlot.cfg;
      var g = IslandPlot.g;

      for(var i in IslandPlot.default_plot_layout){
		if('undefined' == typeof plot_layout[i]){
		    plot_layout[i] = IslandPlot.default_plot_layout[i];
		  }
      }    

      var from_range = [plot_layout.plot_min, plot_layout.plot_max];
      var to_range = [plot_layout.plot_radius-(plot_layout.plot_width/2), plot_layout.plot_radius+(plot_layout.plot_width/2)];
      
      var lineFunction = d3.svg.line()
      .x(function(d, i) { return cfg.w/2 + ((('undefined' == typeof animate) ? IslandPlot.mapRange(from_range, to_range, d) : 1 )*Math.cos((i*plot_layout.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
      .y(function(d, i) { return cfg.h/2 + ((('undefined' == typeof animate) ? IslandPlot.mapRange(from_range, to_range, d) : 1 )*Math.sin((i*plot_layout.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
        .interpolate("linear");

      g.append("path")
        .attr("d", lineFunction(plot_values))
        .attr("stroke", plot_layout.stroke)
        .attr("class", plot_layout.name)
        .attr("id", plot_layout.name)
        .attr("stroke-width", 1)
        .attr("fill", "none");
      
      // Now do the mean circle if we have one
      if('undefined' !== typeof plot_layout.plot_mean) {
	  IslandPlot.drawCircle(plot_layout.name, IslandPlot.mapRange(from_range, to_range, plot_layout.plot_mean), plot_layout.mean_stroke, animate);

      }  

      // Save the plot_data for later if we need it
      IslandPlot.cfg.plot_values[plot_layout.name] = plot_values;
      IslandPlot.cfg.plot_layout[plot_layout.name] = plot_layout;

      if('undefined' !== typeof animate) {
	  IslandPlot.movePlot(plot_layout.name, plot_layout.plot_radius);
      }

    },

    movePlot: function(name, radius) {
      var cfg = IslandPlot.cfg;
      var g = IslandPlot.g;
      var plot_values = IslandPlot.cfg.plot_values[name];
      var plot_layout = IslandPlot.cfg.plot_layout[name];

      IslandPlot.cfg.plot_layout[name].plot_radius = radius;

      var from_range = [plot_layout.plot_min, plot_layout.plot_max];
      var to_range = [radius-(plot_layout.plot_width/2), radius+(plot_layout.plot_width/2)]; 

      var lineFunction = d3.svg.line()
      .x(function(d, i, j) { return cfg.w/2 + (IslandPlot.mapRange(from_range, to_range, d)*Math.cos((i*plot_layout.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
        .y(function(d, i) { return cfg.h/2 + (IslandPlot.mapRange(from_range, to_range, d)*Math.sin((i*plot_layout.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
        .interpolate("linear");

	var plot = g.selectAll("." + name)

	plot.transition()
	    .duration(1000)
	    .attr("d", function(d,i) { return lineFunction(plot_values)})
      	
    },

    removePlot: function(name) {
      var cfg = IslandPlot.cfg;
      var g = IslandPlot.g;
      var plot_values = IslandPlot.cfg.plot_values[name];
      var plot_layout = IslandPlot.cfg.plot_layout[name];

      var from_range = [plot_layout.plot_min, plot_layout.plot_max];
      var to_range = [1-(plot_layout.plot_width/2), 1+(plot_layout.plot_width/2)]; 

      var lineFunction = d3.svg.line()
      .x(function(d, i) { return cfg.w/2 + (IslandPlot.mapRange(from_range, to_range, d)*Math.cos((i*plot_layout.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
        .y(function(d, i) { return cfg.h/2 + (IslandPlot.mapRange(from_range, to_range, d)*Math.sin((i*plot_layout.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
        .interpolate("linear");

      g.selectAll("." + name)
      .transition()
      .duration(1000)
      .attr("d", lineFunction(plot_values))
      .style("opacity", 0)
      .remove();

      if('undefined' !== typeof plot_layout.plot_mean) {
	  IslandPlot.removeCircle(name);
      }
      
      IslandPlot.cfg.plot_values[name] = undefined;

    },

    // The default layout for a track, some sanity values

    default_track_layout: {
      fill: "black",
      name: "mytrack",
      inner_radius: 100,
      outer_radius: 120,
      centre_line_stroke: "grey"
    },
    
    // Pass in a track_layout which may contain
    // the following:
    // track_layout: {
    //    fill: "colour",
    //    highlight: "colour",
    //    name: "namestr"     [REQUIRED]
    //    inner_radius: num   [REQUIRED]
    //    outer_radius: num   [REQUIRED]
    //    mouseover: callback(d, i)
    //    mouseout: callback(d, i)
    //    mouseclick: callback(d, i)
    // }

    // track_coords is an array of objects
    // track_coord = [
    //    { 
    //       start: num,  [REQUIRED] start point in bp
    //       end: num,    [REQUIRED] end point in bp
    //       fill: "colour",
    //       highlight: "colour",
    //       strand: [1,-1],
    //       name: "string"
    // ]

    // And a final argument to animate the addition of the elements

    drawTrack: function(track_layout, track_coords, animate) {
      var cfg = IslandPlot.cfg;
      var g = IslandPlot.g;

      // Fill in any mandatory defaults that weren't provided
      for(var i in IslandPlot.default_track_layout){
		if('undefined' == typeof track_layout[i]){
		    track_layout[i] = IslandPlot.default_track_layout[i];
		  }
      }

      // Save the track_layout for later if we need it
      IslandPlot.cfg.tracks[track_layout.name] = track_layout;
        
      // The arc object which will be passed in to each
      // set of data
      var arc = d3.svg.arc()
      .innerRadius(function(d){ return (('undefined' == typeof animate) ? 
					IslandPlot.calcInnerRadius(track_layout.inner_radius, track_layout.outer_radius, d.strand) 
					: 1);})
      .outerRadius(function(d){ return (('undefined' == typeof animate) ? 
					IslandPlot.calcOuterRadius(track_layout.inner_radius, track_layout.outer_radius, d.strand)
					: 2);})
      .startAngle(function(d){return IslandPlot.cfg.radians_pre_bp*d.start;})
      .endAngle(function(d){return IslandPlot.cfg.radians_pre_bp*d.end;})
      
      // Draw the track, putting in elements such as hover colour change
      // if one exists, click events, etc
      g.selectAll(".tracks."+track_layout.name)
      .data(track_coords)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("class", track_layout.name)
      .style("fill", function(d) { return ('undefined' !== typeof d.fill) ? d.fill : track_layout.fill})
      .attr("transform", "translate("+cfg.w/2+","+cfg.h/2+")")
      .on("mouseover", function(d, i) {
	  if('undefined' !== typeof d.highlight) {
	    d3.select(this).style("fill", d.highlight);
          } else if('undefined' !== typeof track_layout.highlight) {
            d3.select(this).style("fill", track_layout.highlight);
          }
          if('undefined' !== typeof track_layout.mouseover) {
	      track_layout.mouseover(d, i);
	  } })
       .on("mouseout", function(d, i) {
          if('undefined' !== typeof d.fill) {
            d3.select(this).style("fill", d.fill)
          } else {
      	    d3.select(this).style("fill", track_layout.fill)
      	  }
      	  if('undefined' !== typeof track_layout.mouseout) {
      	      track_layout.mouseout(d, i);
      	  } })
      .on("click", function(d,i) {
	      if('undefined' !== typeof track_layout.mouseclick) {
		  track_layout.mouseclick(d,i);
	      }
	  });

      // If we're doing an animated addition, move the track out to its
      // new spot
      if('undefined' !== typeof animate) {
	  IslandPlot.moveTrack(track_layout.name, track_layout.inner_radius, track_layout.outer_radius);
      }

      // And check if we've been asked to do a centre line
      if('undefined' !== typeof track_layout.centre_line) {
	  IslandPlot.drawCircle(track_layout.name, (track_layout.inner_radius + track_layout.outer_radius)/2, track_layout.centre_line_stroke, animate);
      }

    },

    // Helper function for drawing needed circles such
    // as in stranded tracks
    // Can be called standalone in setting up the look
    // of your genome
    drawCircle: function(name, radius, line_stroke, animate) {
	var g = IslandPlot.g;
	var cfg = IslandPlot.cfg;

        g.append("circle")
	.attr("r", (('undefined' == typeof animate) ? radius : 1 ))
  	  .attr("class", name + "_circle")
          .style("fill", "none")
          .style("stroke", line_stroke)
          .attr("cx", cfg.w/2)
          .attr("cy", cfg.h/2);

	// An animated entrance
	if('undefined' !== typeof animate) {
	    IslandPlot.moveCircle(name, radius);
	}
	
    },

    // Change the radius of an inscribed circle

    moveCircle: function(name, radius) {
	var g = IslandPlot.g;

	g.selectAll("." + name + "_circle")
	.transition()
	.duration(1000)
	.attr("r", radius);
    },

    // Remove a drawn circle, in a pretty animated way

    removeCircle: function(name) {
	var g = IslandPlot.g;

	g.selectAll("." + name + "_circle")
	.transition()
	.duration(1000)
	.attr("r", 1)
	.style("opacity", 0)
	.remove();

    },

    // If we're displaying a stranded track, calculate
    // the inner radius depending on which strand the 
    // gene is on.

    calcInnerRadius: function(inner, outer, strand) {
	if('undefined' == typeof strand) {
	    return inner;
	} else if(strand == -1) {
	    return inner;
	} else {
	    return (inner+outer)/2;
	}
    },

    // If we're displaying a stranded track, calculate
    // the outer radius depending on which strand the 
    // gene is on.

    calcOuterRadius: function(inner, outer, strand) {
	if('undefined' == typeof strand) {
	    return outer;
	} else if(strand == -1) {
	    return (inner+outer)/2;
	} else {
	    return outer;
	}
    },

    // Map ranges such as gc content which is a fractional number
    // to the radius range we're going to be drawing in, I think
    // the d3 range() function would have done this, but I'm still
    // learning d3, this works efficiently for now.

    mapRange: function(from, to, s) {
       return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
    },

    moveTrack: function(name, innerRadius, outerRadius) {
	var track_layout = IslandPlot.cfg.tracks[name];
        var g = IslandPlot.g;

	var arcShrink = d3.svg.arc()
	.innerRadius(function(d){return IslandPlot.calcInnerRadius(innerRadius, outerRadius, d.strand);})
	.outerRadius(function(d){return IslandPlot.calcOuterRadius(innerRadius, outerRadius, d.strand);})
	.endAngle(function(d){return IslandPlot.cfg.radians_pre_bp*d.start;})
	.startAngle(function(d){return IslandPlot.cfg.radians_pre_bp*d.end;});

	g.selectAll("." + name)
	.transition()
	.duration(1000)
       	.attr("d", arcShrink)

	// Just record the new radii in case we need them later
	IslandPlot.cfg.tracks[name].inner_radius = innerRadius;
	IslandPlot.cfg.tracks[name].outer_radius = outerRadius;

    },

    removeTrack: function(name) {
	var track_layout = IslandPlot.cfg.tracks[name];
        var g = IslandPlot.g;

	var arcShrink = d3.svg.arc()
	.innerRadius(1)
	.outerRadius(2)
	.endAngle(function(d){return IslandPlot.cfg.radians_pre_bp*d.start;})
	.startAngle(function(d){return IslandPlot.cfg.radians_pre_bp*d.end;});

	g.selectAll("." + name)
	.transition()
	.duration(1000)
       	.attr("d", arcShrink)
	.style("opacity", 0)
	.remove();

	if('undefined' !== track_layout.centre_line) {
	    IslandPlot.removeCircle(name);
	}

    },
 
    default_glyph_track: {
	name: 'myglyphtrack',
	pixel_spacing: 8,
	glyph_buffer: 8
    },
   
    drawGlyphTrack: function(track_info, track_data) {
	var cfg = IslandPlot.cfg;
        var g = IslandPlot.g;
	var stack_count = 0;

	// Fill in any mandatory defaults that weren't provided
	for(var i in IslandPlot.default_glyph_track){
	    if('undefined' == typeof track_info[i]){
		track_info[i] = IslandPlot.default_glyph_track[i];
	    }
	}

	// Save the track_layout for later if we need it
	IslandPlot.cfg.glyph_tracks[track_info.name] = track_info;


	var x = function(d,i,proximity) { return cfg.w/2 + (((proximity == true ? (track_info.glyph_buffer * stack_count) : 0) + track_info.radius)*Math.cos((d.bp*cfg.radians_pre_bp)-Math.PI/2)); };
	var y = function(d,i,proximity) {return cfg.h/2 + (((proximity == true ? (track_info.glyph_buffer * stack_count) : 0) + track_info.radius)*Math.sin((d.bp*cfg.radians_pre_bp)-Math.PI/2)); };

	var test_proximity = function(d,i) {
	    var xs = 0;
	    var ys = 0;

	    if(i < 1) { return false; }

	    xs = (cfg.h/2 + (track_info.radius*Math.sin((d.bp*cfg.radians_pre_bp)-Math.PI/2))) -
	    (cfg.h/2 + (track_info.radius*Math.sin((track_data[i-1].bp*cfg.radians_pre_bp)-Math.PI/2)));
	    ys = (cfg.h/2 + (track_info.radius*Math.cos((d.bp*cfg.radians_pre_bp)-Math.PI/2))) -
	    (cfg.h/2 + (track_info.radius*Math.cos((track_data[i-1].bp*cfg.radians_pre_bp)-Math.PI/2)));
	    xs = xs * xs;
	    ys = ys * ys;
	    var dist = Math.sqrt(xs + ys);

	    if(dist < track_info.pixel_spacing) { stack_count++; return true; }

	    stack_count = 0;
	    return false;
	}

	var track = g.selectAll('.' + track_info.name)
	.data(track_data)
	.enter()
	.append('path')
	.attr('class', track_info.name)
	.attr("d", d3.svg.symbol().type(track_info.type))
	.attr("transform", function(d,i) { var proximity = test_proximity(d,i); 
					   return "translate(" + x(d,i, proximity) + ","
					   + y(d,i, proximity) + ")" })
	.style("fill", function(d) { return glyph_layout.colours[d.type] })
	
    },

    updateGlyphTrack: function(name, track_data) {
	var cfg = IslandPlot.cfg;
        var g = IslandPlot.g;
	var track_info = IslandPlot.cfg.glyph_tracks[name];
	var stack_count = 0;

	var x = function(i,proximity) { return cfg.w/2 + (((proximity == true ? (track_info.pixel_spacing * stack_count) : 0) + track_info.radius)*Math.cos((track_data[i].bp*cfg.radians_pre_bp)-Math.PI/2)); };
	var y = function(i,proximity) {return cfg.h/2 + (((proximity == true ? (track_info.pixel_spacing * stack_count) : 0) + track_info.radius)*Math.sin((track_data[i].bp*cfg.radians_pre_bp)-Math.PI/2)); };

	var test_proximity = function(i) {
	    var xs = 0;
	    var ys = 0;

	    if(i < 1) { return false; }

	    xs = (cfg.h/2 + (track_info.radius*Math.sin((track_data[i].bp*cfg.radians_pre_bp)-Math.PI/2))) -
	    (cfg.h/2 + (track_info.radius*Math.sin((track_data[i-1].bp*cfg.radians_pre_bp)-Math.PI/2)));
	    ys = (cfg.h/2 + (track_info.radius*Math.cos((track_data[i].bp*cfg.radians_pre_bp)-Math.PI/2))) -
	    (cfg.h/2 + (track_info.radius*Math.cos((track_data[i-1].bp*cfg.radians_pre_bp)-Math.PI/2)));
	    xs = xs * xs;
	    ys = ys * ys;
	    var dist = Math.sqrt(xs + ys);

	    if(dist < track_info.pixel_spacing) { stack_count++; return true; }

	    stack_count = 0;
	    return false;
	}

	var track = g.selectAll('.' + name)
	.data(track_data);


	track.transition()
	.duration(1000)
	.attr("d", d3.svg.symbol().type(track_info.type))
	.attr("transform", function(d,i) { var proximity = test_proximity(i); 
					   return "translate(" + x(i, proximity) + ","
					   + y(i, proximity) + ")" })
	.style("fill", function(d) { return glyph_layout.colours[d.type] })

	track.enter()
	.append('path')
	.attr('class', name)
	.attr("d", d3.svg.symbol().type(track_info.type))
	.attr("transform", "translate(" + cfg.h/2 + "," + cfg.w/2 + ")")
	.style("fill", function(d) { return glyph_layout.colours[d.type] })
	.transition()
	.duration(1000)
	.attr("transform", function(d,i) { var proximity = test_proximity(i); 
					   return "translate(" + x(i, proximity) + ","
					       + y(i, proximity) + ")"; })

	track.exit()
	.transition()
	.duration(1000)
	.attr("transform", "translate(" + cfg.h/2 + "," + cfg.w/2 + ")")
	.style("opacity", 0)
	.remove()

    },
    
    attachBrush: function() {
	var cfg = IslandPlot.cfg;
	var g = IslandPlot.g;

	g.on('mousemove', function() {
		var x = d3.mouse(this)[0] - (cfg.w/2);
		var y = -(d3.mouse(this)[1] - (cfg.h/2));
		rad = Math.PI/2 - Math.atan(y/x);// - Math.PI/2;
		if(x < 0) {
		    // II & III quadrant
		    rad = rad + Math.PI;
		}
		//		} else if(x < 0 && y < 0) {
		//		    rad = rad + Math.PI;
		//		}
		console.log(x, y, rad);
		    //		console.log(d3.mouse(this)[0], d3.mouse(this)[1]);
	    });
    }

};

