var chartwidth = 1000, chartheight = 1000;

var circles, rad = 10, disavg, parseYear;

var times = ["1950s - 1970s","1970s - 1990s","1990 to 1995","1995 to 2005","2000 to 2005","2005 to 2010","2010 to 2012","2012 to 2014",	"2014 to 2016",	"2016 to 2017"];
var genre = ["Action","Adventure","Black Comedy","Comedy", "Concert/Performance", "Documentary", "Drama", "Horror", "Musical", "Romantic Comedy","Thriller/Suspense","Western"]
var x = d3.scaleOrdinal()
	.domain(times)
	.range([10,20,30,40,50,60,70,80,90,100])

var color2 = d3.scaleOrdinal()
	.domain(times)
	.range(d3.schemeCategory10);

var color = d3.scaleOrdinal()
	.domain(genre)
	.range(d3.schemeCategory10);

var margin = {top: 20, right: 20, bottom: 30, left: 40};

var linesvg = d3.select('#timeline')
	.append('svg')
	.attr('width', chartwidth + margin.left + margin.right + 'px')
	.attr('height', chartheight + margin.top + margin.bottom + 'px');

var chartsvg = d3.select('#chart')
	.append('svg')
	.attr('width', chartwidth + 'px')
	.attr('height', chartheight + 'px');

var treesvg = d3.select('#tm1')
	.append('svg')
	.attr('width', chartwidth + 'px')
	.attr('height', chartheight + 'px');

var circsvg = d3.select('#crcs')
	.append('svg')
	.attr('width', chartwidth + margin.left + margin.right + 'px')
	.attr('height', chartheight + margin.top + margin.bottom + 'px');
// line Chart 
d3.csv("disney_movies_groups.csv"). then(function(dataForChart){
	var xMinMax = d3.extent(dataForChart, function(d){return d.release_date});
	var xScale = d3.scaleLinear()
		.domain([xMinMax[0], xMinMax[1]])
		.range([0,chartwidth]);
	
	var yScale = d3.scaleLinear()
		.domain([0, 35])
		.range([chartheight,0]);

	var sumstat = d3.nest()
				.key(function(d){ return d.release_date})
				.entries(dataForChart);
	console.log(sumstat)

	linesvg.append("g")
		.selectAll("dot")
		.data(sumstat)
		.enter()
		.append("circle")
		.attr("r", 5)
		.attr("cx", function(d) {return xScale(d.key)})
		.attr("cy", function(d) {return yScale(d.values.length)})
	
	linesvg.append("g")
		.attr("transform", "translate(0," + chartheight + ")")
		.call(d3.axisBottom(xScale));

	linesvg.append("g")
			.call(d3.axisLeft(yScale));

});

d3.csv("disney_movies_groups.csv"). then(function(dataForChart){
	var xMinMax = d3.extent(dataForChart, function(d){ 
		return parseInt(d.inflation_adjusted_gross/100000)
	})
	var xScale = d3.scaleLinear()
		.range([0,300])
		.domain([xMinMax[0], xMinMax[1]])

	var yScale = d3.scaleBand()
		.domain(times)
		.range([0, chartwidth])
		.padding(0.1)

	subdat = d3.nest()
	.key(function(d) { return d.time; })
	.rollup(function(v) { return d3.mean(v, function(d) {return parseInt(d.inflation_adjusted_gross/10000)}); })
	.sortValues(function(a,b) {return parseInt(a.value) - parseInt(b.value); })
	.entries(dataForChart);

	console.log(subdat)

	treesvg.selectAll(".bar")
		.data(subdat)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", 0)
		.attr('width', function(d) {return xScale(d.value)})
		.attr('y', function(d) {return yScale(d.key)})
		.attr('height', yScale.bandwidth())
		.style('fill', function(d) {return color2(d.key)});

	treesvg.append("g")
		.call(d3.axisLeft(yScale));

	treesvg.selectAll('.label')
		.data(subdat)
		.enter().append('text')
		.attr('class', 'label')
		.attr('y', function(d){
			return yScale(d.key) + yScale.bandwidth() /2+4;
		})
		.attr('x', function(d){
			return xScale(d.value) + 3;
		})
		.text(function(d) {
			return d.key;
		});
});

d3.csv('disney_movies_groups.csv').then(function(dataForChart){
	var rMinMax = d3.extent(dataForChart, function(d){
		return parseInt(d.total_gross/100000)
	})

	var rScale = d3.scaleLinear()
		.domain([rMinMax[0], rMinMax[1]])
		.range([0,100])

	var xband = d3.scaleBand()
		.domain(genre)
		.range([0, chartwidth])
		.padding(0.5)

	subdat = d3.nest()
		.key(function(d) { return d.genre; })
		.rollup(function(v) { return d3.mean(v, function(d) {return d.inflation_adjusted_gross/100000}); })
		.entries(dataForChart)
		.sort(function(a, b){ return d3.descending(a.value, b.value); });

	console.log(subdat)

	circsvg.selectAll(".circ")
		.data(subdat)
		.enter().append("circle")
		.attr("class", "circ")
		.attr("r", function(d) {return rScale(d.value)})
		.attr("cx", function(d) {return xband(d.key)})
		.attr("cy", chartheight/2)
		.style('fill', function(d) { return color(d.key)})


	circsvg.selectAll('.label')
		.data(subdat)
		.enter().append('text')
		.attr('class', 'label')
		.attr('y', (chartwidth/2) + 20)
		.attr('x', function(d){
			return xband(d.key) + xband.bandwidth()-100;
		})
		.text(function(d) {
			return d.key;
		});


})


/// Custom chart
d3.csv("disney_movies_groups.csv"). then(function(dataForChart){
		var rMinMax = d3.extent(dataForChart, function(d){
			return parseInt(d.total_gross/100000)
		})

		var rScale = d3.scaleLinear()
			.domain([rMinMax[0], rMinMax[1]])
			.range([0,60])

		var node = chartsvg.append("g")
			.selectAll("circle")
			.data(dataForChart)
			.enter()
			.append("circle")
				.attr("class", "node")
				.attr("r", function(d) {return rScale(d.total_gross/100000)})
				.attr("cx", chartwidth/2)
				.attr("cy", chartheight/2)
				.style('opacity', 0.7)
				.style("fill", function(d){ return color2(d.time)})
				.style("stroke", function(d){return color2(d.time)})
				.style("stroke-width", 1 +"px")
				.on("mouseover.tooltip",function(d) {
					tooltip.transition()
						.duration(300)
						.style("opacity", 1);
					tooltip.html(d.movie_title + d.time)
						.style("top", d3.event.pageY-10 + "px")
						.style("left", d3.event.pageX+10 + "px");
				})
				.on("mouseout.tooltip",function(d){
					tooltip.transition()
						.duration(200)
						.style("opacity", 0)
				})
				.on("mousemove", function(d) {
					tooltip.style("left", (d3.event.pageX)+"px")
						.style("top", (d3.event.pageY+10)+"px");
				});

		var tooltip = d3.select("#chart").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);

		var simulation = d3.forceSimulation()

		  	.force("center", d3.forceCenter().x(chartwidth / 2).y(chartheight / 2))
		  	.force("charge", d3.forceManyBody().strength(-1))
		  	.force("collide", d3.forceCollide().strength(.5).radius(10).iterations(2))

		simulation
		    .nodes(dataForChart)
		    .on("tick", function(d){
		    node
		      .attr("cx", function(d){ return d.x; })
		      .attr("cy", function(d){ return d.y; })
		    });
		var size = 18;

		var colegend = d3.select("#legend");

		colegend.selectAll('mydots')
			.data(color2.domain())
			.enter()
			.append("rect")
				.attr('class', 'mydots')
				.attr("x", 100)
				.attr("y", function(d,i){ return (chartheight/2) + i*(size+5)})
				.attr('width', size)
				.attr('height', size)
				.style('fill', color2)
		
		colegend.selectAll("mylabels")
			.data(color2.domain())
			.enter()
			.append("text")
				.attr('class', 'mylabels')
				.attr("x", 100 + size*1.2)
				.attr("y", function(d,i) {return (chartheight/2) + i*(size+5) + (size/2)})
				.style("fill", function(d){return color2(d)})
				.text(function(d){ return d})
				.attr("text-anchor", "left")
				.style("alignment-baseline", "middle")

})



function changelegend(cscale){
	if (cscale == color2){
		d3.selectAll("circle")
			.transition()
			.duration(1000)
			.style("fill", function(d){return color2(d.time)})
			.style("stroke", function(d){return color2(d.time)})

		d3.selectAll("rect")
				.data(color2.domain())
				.transition()
				.duration(1000)
				.style('fill', color2)

		d3.selectAll('text')
				.data(color2.domain())
				.transition()
				.duration(1000)
				.style("fill", color2)
				.text(function(d){ return d})
	} else {
		d3.selectAll("circle")
			.transition()
			.duration(1000)
			.style("fill", function(d){return color(d.genre)})
			.style("stroke", function(d){return color(d.genre)})

		d3.selectAll("rect")
			.data(color.domain())
			.transition()
			.duration(1000)
			.style("fill", color)

		d3.selectAll("text")
			.data(color.domain())
			.transition()
			.duration(1000)
			.style("fill", color)
			.text(function(d){ return d })

	}
}
