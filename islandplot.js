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
       legend_spacing: 5
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
    
    plot_layout: {
      fill: "none",
      stroke: "grey"
    },
    
//    drawGC: function(gc_min, gc_max, gc_mean, gc_radius, gc_width, bp_per_value, gc_values) {
    drawPlot: function(plot_layout, plot_values) {
      var cfg = IslandPlot.cfg;
      var g = IslandPlot.g;

      for(var i in IslandPlot.default_plot_layout){
		if('undefined' == typeof plot_layout[i]){
		    plot_layout[i] = IslandPlot.default_plot_layout[i];
		  }
      }    

      var from_range = [plot_layout.plot_min, plot_layout.plot_max];
      var to_range = [plot_layout.plot_radius-(plot_layout.plot_width/2), plot_layout.plot_radius+(gc_width/2)];

      for(var i = 0; i < plot_values.length; i++) {  
        plot_values[i] = IslandPlot.mapRange(from_range, to_range, plot_values[i]);
      }
      
      var lineFunction = d3.svg.line()
        .x(function(d, i) { return cfg.w/2 + (d*Math.cos((i*plot_layout.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
        .y(function(d, i) { return cfg.h/2 + (d*Math.sin((i*plot_layout.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
        .interpolate("linear");
        
      g.append("path")
        .attr("d", lineFunction(plot_values))
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
        .attr("fill", "none");
      
      // Now do the mean circle if we have one
      if('undefined' !== typeof plot_layout.plot_mean) {
        g.append("circle")
          .attr("r", IslandPlot.mapRange(from_range, to_range, plot_layout.plot_mean))
          .style("fill", plot_layout.fill)
          .style("stroke", plot_layout.stroke)
          .attr("cx", cfg.w/2)
          .attr("cy", cfg.h/2);
      }  
    },

    default_track_layout: {
      fill: "black",
      name: "mytrack",
      inner_radius: 100,
      outer_radius: 120
    },
    
    drawTrack: function(track_layout, track_coords, callback) {
      var cfg = IslandPlot.cfg;
      var g = IslandPlot.g;

      for(var i in IslandPlot.default_track_layout){
		if('undefined' == typeof track_layout[i]){
		    track_layout[i] = IslandPlot.default_track_layout[i];
		  }
      }
        
      var arc = d3.svg.arc()
      .innerRadius(track_layout.inner_radius)
      .outerRadius(track_layout.outer_radius)
      .startAngle(function(d){return IslandPlot.cfg.radians_pre_bp*d[0];})
      .endAngle(function(d){return IslandPlot.cfg.radians_pre_bp*d[1];})
      
      g.selectAll(".tracks."+track_layout.name)
      .data(track_coords)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("id", track_layout.name)
      .style("fill", track_layout.fill)
      .attr("transform", "translate("+cfg.w/2+","+cfg.h/2+")")
      .on("mouseover", function(d, i) {
          if('undefined' !== typeof track_layout.highlight) {
            d3.select(this).style("fill", track_layout.highlight);
          }
          if('undefined' !== typeof callback) {
            callback(d, i)
          } })
      .on("mouseout", function(d, i) {
          if('undefined' !== track_layout.highlight) {
            d3.select(this).style("fill", track_layout.fill)
          } });
    },
    
    mapRange: function(from, to, s) {
       return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
    }
    
};

