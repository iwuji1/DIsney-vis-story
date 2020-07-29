var dataset, simulation, nodes;
var chartwidth = 1000, chartheight = 1000;
var circles, rad = 10, disavg, parseYear;

var times = ["1950s - 1970s","1970s - 1990s","1990 to 1995","1995 to 2000","2000 to 2005","2005 to 2010","2010 to 2012","2012 to 2014","2014 to 2016",	"2016 to 2017"];
var genre = ["Action","Adventure","Black Comedy","Comedy", "Concert/Performance", "Documentary", "Drama", "Horror", "Musical", "Romantic Comedy","Thriller/Suspense","Western"]

var margin = {top: 50, right: 20, bottom: 50, left: 170};
var width = chartwidth - margin.left - margin.right;
var height = chartheight - margin.top - margin.bottom;

const PeriodX = {"1950s - 1970s": 0,
"1970s - 1990s": 0,
"1990 to 1995": 0,
"1995 to 2000": 250,
"2000 to 2005": 250,
"2005 to 2010": 250,
"2010 to 2012": 500,
"2012 to 2014": 500,
"2014 to 2016": 500,
"2016 to 2017": 750
}

const PeriodY = {"1950s - 1970s": 250,
"1970s - 1990s": 500,
"1990 to 1995": 750,
"1995 to 2000": 250,
"2000 to 2005": 500,
"2005 to 2010": 750,
"2010 to 2012": 250,
"2012 to 2014": 500,
"2014 to 2016": 750,
"2016 to 2017": 250,
}

var color2 = d3.scaleOrdinal()
	.domain(times)
	.range(d3.schemeCategory10);

var color = d3.scaleOrdinal()
	.domain(genre)
	.range(d3.schemeCategory10);

var linesvg = d3.select('#timeline')
	.append('svg')
	.attr('width', chartwidth + 'px')
	.attr('height', chartheight + 'px');

var chartsvg = d3.select('#chart')
	.append('svg')
	.attr('width', chartwidth )
	.attr('height', chartheight);

var clustersvg = d3.select('#cluster-chart')
	.append('svg')
	.attr('width',  chartwidth)
	.attr('height', 1100);

var histsvg = d3.select('#hist-chart')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

// line Chart 
d3.csv("disney_movies_groups.csv").then(function(dataForChart) {
	var xMinMax = d3.extent(dataForChart, function(d){return d.release_date});
	var xScale = d3.scaleLinear()
		.domain([xMinMax[0], xMinMax[1]])
		.range([5,width]);
	
	var yScale = d3.scaleLinear()
		.domain([0, 35])
		.range([height - 50,0]);

	var sumstat = d3.nest()
				.key(function(d){ return d.release_date})
				.entries(dataForChart);

	linesvg.append("g")
		.selectAll("dot")
		.data(sumstat)
		.enter()
		.append("circle")
		.attr("r", 5)
		.attr("cx", function(d) {return xScale(d.key)})
		.attr("cy", function(d) {return yScale(d.values.length)})
		.on("mouseover.tooltip",function(d) {
			tooltip.transition()
				.duration(300)
				.style("opacity", 1);
			tooltip
				.html("<strong>Release Date: </strong>"+ d.key +
					"<br><strong># of Movies: </strong>" + d.values.length)
				.style("top", d3.event.pageY-10 + "px")
				.style("left", d3.event.pageX+10 + "px")
				.style('display', 'inline-block');
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
	
	linesvg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale).ticks(2));

});
// Cluster chart
d3.csv("disney_movies_groups.csv").then(function(dataForChart){
	var rMinMax = d3.extent(dataForChart, function(d){
		return parseInt(d.inflation_adjusted_gross/100000)
	})

	var rScale = d3.scaleLinear()
		.domain([rMinMax[0], rMinMax[1]])
		.range([5,60])
	console.log(dataForChart)
	nodes = clustersvg.append("g")
		.selectAll("circle")
		.data(dataForChart)
		.enter()
		.append("circle")
			.attr("class", "circle")
			.attr("r", function(d) {return rScale(d.inflation_adjusted_gross/100000)})
			.attr("cx", chartwidth/2)
			.attr("cy", chartheight/2)
			.style('opacity', 0.7)
			.style("fill", function(d){ return color(d.genre)})
			.style("stroke", function(d){return color(d.genre)})
			.style("stroke-width", 1 +"px")
			.on("mouseover.tooltip",function(d) {
				tooltip.transition()
					.duration(300)
					.style("opacity", 1);
				tooltip
					.html("<strong>Title: </strong>"+ d.movie_title+
						"<br><strong>Period: </strong>" + d.time +
						"<br><strong>Genre: </strong>" + d.genre +
						"<br><strong>Revenue: </strong>$" + Math.round(d.inflation_adjusted_gross/10000000) + " Mill")
					.style("top", d3.event.pageY-10 + "px")
					.style("left", d3.event.pageX+10 + "px")
					.style('display', 'inline-block');
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


	simulation = d3.forceSimulation(dataForChart)
		.force('charge', d3.forceManyBody().strength([2]))
		.force('forceX', d3.forceX(d => PeriodX[d.time] + 100))
		.force('forceY', d3.forceY(d => PeriodY[d.time] + 25))
		.force('collide', d3.forceCollide(function(d) {return rScale(d.inflation_adjusted_gross/100000) + 4}))
		.alphaDecay([0.02])

	simulation
	    .nodes(dataForChart)
	    .on("tick", function(d){
	    nodes
	      .attr("cx", function(d){ return d.x; })
	      .attr("cy", function(d){ return d.y; })
	    });

})

//simple line
d3.csv('disney_movies_groups.csv').then(function(dataForChart){
	subdat = d3.nest()
		.key(function(d) { return d.genre; })
		.rollup(function(v) { return {
			count: v.length,
			total: d3.sum(v, function(d) {return d.inflation_adjusted_gross/1000000}),
			avg: d3.mean(v, function(d) {return d.inflation_adjusted_gross/100000}),
			percapita: d3.sum(v, function(d) {return (d.inflation_adjusted_gross/1000000/v.length)})
		};})
		.entries(dataForChart)
		.sort(function(a, b){ return d3.descending(a.value, b.value); });
	console.log(subdat)
	var xMinMax = d3.extent(subdat, function(d){
		return parseInt(d.value.percapita)
	})

	var yScale = d3.scaleLinear()
		.domain([xMinMax[0], xMinMax[1]])
		.range([height-100,0])

	var xband = d3.scaleBand()
		.domain(genre)
		.range([0, width])
		.padding(0.5)

	var rMinMax = d3.extent(subdat, function(d){
		return parseInt(d.value.count)
		})

	var rScale = d3.scaleLinear()
		.domain([rMinMax[0], rMinMax[1]])
		.range([10,60])

	console.log(xMinMax, height, subdat)

	histsvg.selectAll('circle')
		.data(subdat)
		.enter().append("circle")
		.attr("transform", "translate(0,50)")
		.attr("class", function(d) {return d.key})
		.attr("r", function(d) {return rScale(d.value.count)})
		.attr("cx", function(d) {return xband(d.key)})
		.attr("cy", function(d) {return yScale(d.value.percapita)})
		.style("fill", function(d) {return color(d.key)})
		.on("mouseover.tooltip",function(d) {
			tooltip.transition()
				.duration(300)
				.style("opacity", 1);
			tooltip
				.html("<strong>Genre: </strong>"+ d.key+
					"<br><strong># of Movies: </strong>" + d.value.count+
					"<br><strong>Revenue: </strong>$" + Math.round(d.value.percapita) + " Mill")
				.style("top", d3.event.pageY-10 + "px")
				.style("left", d3.event.pageX+10 + "px")
				.style('display', 'inline-block');
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
})


/// Custom chart
d3.csv("disney_movies_groups.csv"). then(function(dataForChart){
		var rMinMax = d3.extent(dataForChart, function(d){
			return parseInt(d.total_gross/100000)
		})

		var rScale = d3.scaleLinear()
			.domain([rMinMax[0], rMinMax[1]])
			.range([5,60])

		var node = chartsvg.append("g")
			.selectAll("circle")
			.data(dataForChart)
			.enter()
			.append("circle")
				.attr("transform", "translate("+chartwidth/2+"," + chartheight/2 + ")")
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
					tooltip
						.html("<strong>Title: </strong>"+ d.movie_title+
							"<br><strong>Period: </strong>" + d.time+
							"<br><strong>Genre: </strong>" + d.genre +
							"<br><strong>Revenue: </strong>$" + Math.round(d.inflation_adjusted_gross/10000000) + " Mill")
						.style("top", d3.event.pageY-10 + "px")
						.style("left", d3.event.pageX+10 + "px")
						.style('display', 'inline-block');
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
		  	.force("charge", d3.forceManyBody().strength(-1))
		  	.force("collide", d3.forceCollide().strength(.5).radius(12).iterations(2))

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