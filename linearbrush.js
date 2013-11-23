var contextMargin = {top: 10, right: 40, bottom: 25, left: 60},
contextWidth = 440 - contextMargin.left - contextMargin.right,
contextHeight = 100 - contextMargin.top - contextMargin.bottom;

function linearBrush(layout, callbackObj) {
    this.layout;
    this.callbackObj = callbackObj;

    this.brushContainer = d3.select(layout.container)
	.append("svg")
	.attr("width", contextWidth + contextMargin.left + contextMargin.right)
	.attr("height", contextHeight + contextMargin.top + contextMargin.bottom)
	.attr("class", "contextTracks");

    this.x1 = d3.scale.linear()
	.range([0,contextWidth])
       	.domain([0, layout.genomesize]);

    this.mini = this.brushContainer.append("g")
	.attr("transform", "translate(" + contextMargin.left + "," + contextMargin.top + ")")
	.attr("width", contextWidth)
	.attr("height", contextHeight)
	.attr("class", "miniBrush");

    var brush = d3.svg.brush()
	.x(this.x1)
	.on("brush", brushUpdate);

    this.mini.append("g")
	.attr("class", "track brush")
	.call(brush)
	.selectAll("rect")
	.attr("y", 1)
	.attr("height", contextHeight - 1);
 
    this.axisContainer = this.mini.append("g")
	.attr('class', 'brushAxis')
	.attr("transform", "translate(" + 0 + "," + contextHeight + ")");

    this.xAxis = d3.svg.axis().scale(this.x1).orient("bottom")
	.tickFormat(d3.format("s"));

    this.axisContainer.append("g")
    .attr("class", "context axis bottom")
    .attr("transform", "translate(0," + 0 + ")")
    .call(this.xAxis);



    function brushUpdate(b) {
	var minExtent = brush.extent()[0];
	var maxExtent = brush.extent()[1];
	//	console.log(minExtent, maxExtent);
	callbackObj.update(minExtent, maxExtent);
    }

}