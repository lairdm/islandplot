
// Setup the defaults
var margin = {top: 10, right: 40, bottom: 150, left: 60},
width = 940 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom,
contextHeight = 50;
contextWidth = width * .5;

var track_coords = [
		    {start:0, end:30000, name:"island0", fill:"green", strand: -1},
		    {start:60000,end:100000, name:"island1", fill:"green", strand: -1},
		    {start:800000,end:1000000, name:"island2", strand: 1},
		    {start:1200000,end:1500000, name:"island3", strand: 1},
		    {start:1500000,end:1700000, name:"island4",fill:"green",strand: -1},
		    {start:2000000,end:2100000, name:"island5", strand: 1}
		    ]



var layout = {genomesize: 6200000};
												
function genomeTrack(layout,svg) {

    this.svg = svg;

    // First let's make the axis
    var xAxisScale = d3.scale.linear()
    .range([0, width])
    .domain([0, layout.genomesize]);
    this.xScale = xAxisScale;

    var zoom = d3.behavior.zoom()
//    .scale(xAxisScale)
	.x(xAxisScale)
	.on("zoom", zoomed);
    this.zoom = zoom;

    var xAxisArea = d3.svg.area()
    .interpolate("basis")
    .x(function(d) {console.log(d); return d; })
    .y0(0)
    .y1(height);

    this.createAxis(layout);

//    svg.append("defs").append("clipPath")
//    .attr("id", "clip-xxis")
//    .append("rect")
//    .attr("width", width)
//    .attr("height", height);

    function zoomed() {
	console.log(d3.event.translate);
	console.log(d3.event.scale);
//	var t = d3.event.translate;
//	t[0] = Math.min(0, t[0]);
//	t[1] = Math.max(
	axisContainer.select(".x.axis.bottom").call(xAxis);

    }



}

genomeTrack.prototype.createAxis = function(layout){
    
    var axisContainer = this.svg.append("g")
    .attr('class', 'axisContainter')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(this.zoom);
    this.axisContainer = axisContainer;
    
    this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom")
    .tickFormat(d3.format("s"));

    this.axisContainer.append("g")
    .attr("class", "x axis bottom")
    .attr("transform", "translate(0," + height + ")")
    .call(this.xAxis);

};

genomeTrack.prototype.updateAxis = function(b) {
	this.xScale.domain(b);
	console.log(b);
	this.axisContainer.select(".x.axis.bottom").call(this.xAxis);

}

var svg = d3.select("#chart-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", (height + margin.top + margin.bottom));

var axis = new genomeTrack(layout,svg);
var track = new Track({data: track_coords,
		       id: 1,
		       name: 'track_1',
		       width: width,
		       height: height/2,
		       svg: svg,
		       margin: margin,
		       bp: layout.genomesize
		      });

/* Let's create the context brush that will 
   let us zoom and pan the chart */
    var contextXScale = d3.scale.linear()
	.range([0, contextWidth])
	.domain([0, layout.genomesize]);	
							
    var contextAxis = d3.svg.axis()
	.scale(contextXScale).tickFormat(d3.format("s"))
	.tickSize(contextHeight)
	.tickPadding(0)
	.orient("bottom");

    var contextArea = d3.svg.area()
	.interpolate("monotone")
	.x(function(d) { return contextXScale(d); })
	.y0(contextHeight)
	.y1(0);
				
    var brush = d3.svg.brush()
	.x(contextXScale)
	.on("brush", onBrush);
				
    var context = svg.append("g")
	.attr("class","context")
	.attr("transform", "translate(" + (margin.left + width * .25) + "," + (height + margin.top+ 30) + ")");						

    context.append("g")
	.attr("class", "x axis top")
	.attr("transform", "translate(0,0)")
	.call(contextAxis)
																
    context.append("g")
	.attr("class", "x brush")
	.call(brush)
	.selectAll("rect")
	.attr("y", 0)
	.attr("height", contextHeight);
							
    context.append("text")
	.attr("class","instructions")
	.attr("transform", "translate(0," + (contextHeight + 20) + ")")
	.text('Click and drag above to zoom / pan the data');
												
							


    function onBrush(){
	/* this will return a date range to pass into the chart object */
	var b = brush.empty() ? contextXScale.domain() : brush.extent();
	axis.updateAxis(b);
	track.update(b);
//	xAxisScale.domain(b);
//	console.log(b);
//	var axisContainer = this.axisContainer;
//	axisContainer.select(".x.axis.bottom").call(this.xAxis);
//	for(var i = 0; i < countriesCount; i++){
//	    charts[i].showOnly(b);
//	}
    }
