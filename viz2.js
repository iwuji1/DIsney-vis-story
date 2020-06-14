var chartwidth = 1000, chartheight = 1000;
var circles, xScale, yScale, rad = 10, disavg, parseYear;

var x = d3.scaleOrdinal()
	.domain(["1950s - 1970s","1970s - 1990s","1990 to 1995","1995 to 2005","2000 to 2005","2005 to 2010","2010 to 2012","2012 to 2014",	"2014 to 2016",	"2016 to 2017"])
	.range([10,20,30,40,50,60,70,80,90,100])

var color = d3.scaleOrdinal()
	.domain(["Action","Adventure","Black Comedy","Comedy", "Concert/Performance", "Documentary", "Drama", "Horror", "Musical", "Romantic Comedy","Thriller/Suspense","Western"])
	.range(d3.schemeSet1);

var margin = {top: 20, right: 20, bottom: 30, left: 40};

d3.csv("disney_movies_groups.csv").then(function(data){
	var data = data.filter(function(d){return d.release_date;});
	var elements = Object.keys(data[0])
		.filter(function(d){
			return (( d!= "release_date") & (d!= "time"))
		});
	var selection = elements[2];
	console.log(selection)
})

var chartsvg = d3.select('#chart')
	.append('svg')
	.attr('width', chartwidth + 'px')
	.attr('height', chartheight + 'px');

// var bar = d3.select('#bars')
// 	.append('svg')
// 	.attr('width', width + 'px')
// 	.attr('height', height + 'px')
// 	.append("g")
// 	.attr("transform", "translate("+ margin.left +", " + margin.top + ")")
makeChart();


function makeChart(){
	d3.csv("disney_movies_groups.csv"). then(function(dataForChart){
		var node = chartsvg.append("g")
			.selectAll("circle")
			.data(dataForChart)
			.enter()
			.append("circle")
				.attr("class", "node")
				.attr("r", 10)
				.attr("cx", chartwidth/2)
				.attr("cy", chartheight/2)
				.style("fill", function(d){ return color(d.time)})
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
		  	//.force("x", d3.forceX().strength(0.02).x( function(d){ return x(d.time)/2; } ))
		  	//.force("y", d3.forceY().strength(0.02).y( function(d){ return x(d.time)/2; } ))
		  	// .force("y", d3.forceY().strength(0.1).y( height/2 ))
		  	.force("center", d3.forceCenter().x(chartwidth / 2).y(chartheight / 2)) // Attraction to the center of the svg area
		  	.force("charge", d3.forceManyBody().strength(-1)) // Nodes are attracted one each other of value is > 0
		  	.force("collide", d3.forceCollide().strength(.5).radius(10).iterations(2)) // Force that avoids circle overlapping

	  // Apply these forces to the nodes and update their positions.
	  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
		simulation
		    .nodes(dataForChart)
		    .on("tick", function(d){
		    node
		      .attr("cx", function(d){ return d.x; })
		      .attr("cy", function(d){ return d.y; })
		      });
		getMovieData();
	});
}

function getMovieData() {
	d3.csv("disney_movies_groups.csv"). then(function(dataForChart){
		var formatdate = d3.timeFormat("%y");

		var dataForTimeline = [],
			dateToMovieCount = {};

		dataForChart.forEach(function(d, i){
			d.TITLE = d.movie_title;
			d.TIME = formatdate(d.release_date);
			d.GENRE = d.genre;
			d.Sales = +d.inflation_adjusted_gross;
			d.PERIOD = +d.time;

			if (!dateToMovieCount[d.release_date]) {
				dateToMovieCount[d.release_date] = d.Sales;
			} else {
				dateToMovieCount[d.release_date] += d.Sales;
			}
		});

		Object.keys(dateToMovieCount).forEach(function(time){
			dataForTimeline.push({ TIME: new Date(time), SALES: dateToMovieCount[time]});
		});
		dataForTimeline.sort(function(a,b) { return a.TIME - b.TIME; })
		makeTimeline(dataForChart, dataForTimeline);
	    // makeLegend();	
	});
}

function makeTimeline(dataForChart, dataForTimeline) {
    var margin = { top: 10, right: 10, bottom: 20, left: 25 },
        width  = chartwidth - margin.left - margin.right,
        height = 80 - margin.top  - margin.bottom;

    var timelineSvg = d3.select(".timeline-container").append("svg")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom);

    var timeline = timelineSvg.append("g")
        .attr("class", "timeline")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime()
        .domain(d3.extent(dataForTimeline.map(function(d) { return d.TIME; })))
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain(d3.extent(dataForTimeline.map(function(d) { return d.SALES; })))
        .range([height, 0]);

    var xAxis = d3.axisBottom(x)

    var yAxis = d3.axisLeft(y)
        .ticks(2);

    var area = d3.area()
        .x(function(d) { return x(d.TIME); })
        .y0(height)
        .y1(function(d) { return y(d.SALES); });

    timeline.append("path")
        .datum(dataForTimeline)
        .attr("class", "area")
        .attr("d", area);

    timeline.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    timeline.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    timeline.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text("# Movies");

    // Add brush to timeline, hook up to callback
    var brush = d3.brushX()
        .on("brush", function() { brushCallback(brush, dataForChart); })
        .extent([new Date("12/1/2013"), new Date("1/1/2014")]); // initial value

    timeline.append("g")
        .attr("class", "x brush")
        .call(brush)
      .selectAll("rect")
      	.attr("class", "brushed")
        .attr("y", -6)
        .attr("height", height + 7);
    brush(timeline.select('g.x.brush')); // dispatches a single brush event
}

function brushCallback(brush, dataForChart) {
    if (brush.empty()) {
        updateChartpoints([]);
        updateTitleText();
    } else {
        var newDateRange = brush.extent(),
            filteredData = [];

        dataForChart.forEach(function(d) {
            if (d.TIME >= newDateRange[0] && d.TIME <= newDateRange[1]) {
                filteredData.push(d);
            }
        });
        updateChartpoints(filteredData);
        updateTitleText(newDateRange);
    }
}
function updateTitleText(newDateArray) {
    if (!newDateArray) {
        title.text("Disney Movies (select a time range)");
    } else {
        var from = newDateArray[0].getFullYear(),
            to = newDateArray[1].getFullYear();
        title.text("Disney Movies " + from + " - " + to);
    }
}
function updateMapPoints(data) {
		var node = chartsvg.append("g")
			.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
				.attr("class", "node")
				.attr("r", 10)
				.attr("cx", chartwidth/2)
				.attr("cy", chartheight/2)
				.style("fill", function(d){ return color(d.time)})
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
		  	//.force("x", d3.forceX().strength(0.02).x( function(d){ return x(d.time)/2; } ))
		  	//.force("y", d3.forceY().strength(0.02).y( function(d){ return x(d.time)/2; } ))
		  	// .force("y", d3.forceY().strength(0.1).y( height/2 ))
		  	.force("center", d3.forceCenter().x(chartwidth / 2).y(chartheight / 2)) // Attraction to the center of the svg area
		  	.force("charge", d3.forceManyBody().strength(-1)) // Nodes are attracted one each other of value is > 0
		  	.force("collide", d3.forceCollide().strength(.5).radius(10).iterations(2)) // Force that avoids circle overlapping

	  // Apply these forces to the nodes and update their positions.
	  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
		simulation
		    .nodes(data)
		    .on("tick", function(d){
		    node
		      .attr("cx", function(d){ return d.x; })
		      .attr("cy", function(d){ return d.y; })
		      });
		getMovieData();
	};

// var Height = 40;
// var maxBarLength = 300;
// var padding = 10;
// var barsNum = 12;

// var bodyHeight = height - margin.top - margin.bottom;
// var bodyWidth = width - margin.left - margin.right;


// var barwidth = maxBarLength*2;
// var barheight = ((barsNum + 1) * (Height + padding)) + (padding * 2);


// d3.csv("disney_movies_groups.csv").then(function(data){
// 	disavg = d3.nest()
// 		.key(function(d) { return d.genre; })
// 		.rollup(function(v) { return d3.mean(v, function(d) {return d.inflation_adjusted_gross}); })
// 		.entries(data);
// 		console.log(disavg)
// 	var maxCount = d3.max(disavg).value;
// 	var xScale = d3.scaleBand()
// 	  	.range([0, bodyWidth])
// 	  	.domain(["Action","Adventure","Black Comedy","Comedy", "Concert/Performance", "Documentary", "Drama", "Horror", "Musical", "Romantic Comedy","Thriller/Suspense","Western"])
// 	  	.padding(0.2)
// 	var yScale = d3.scaleLinear()
// 	    .range([bodyHeight, 0])
// 	    .domain([0, maxCount]) //The domain is the list of ailines names
// 	var bars = bar.append("g")
// 		.selectAll("rect")
// 		.data(disavg)
// 		.enter()
// 		.append("rect")
// 		.style("fill", "steelblue")
// 		.attr("x", function(d) {return xScale(d.key)})
// 		// .attr("y", function(d,i) {return (Height + (i%3)*(Height*2) - padding)})
// 		// .attr("y", function(d) {return y(Number(d.value));})
// 		.attr("width", xScale.bandwidth())
// 		.attr("height", function(d,i) {return height - yScale(d.value);});
// });

// d3.csv("disney_movies.csv").then(function(data){
// 	xMinMax = d3.extent(data, function(d){
// 		return parseFloat(d.release_date-1000);
// 	})

// 	rMinMax = d3.extent(data, function(d){
// 		return parseInt(d.total_gross/1000000);
// 	})

// 	xScale = d3.scaleLinear()
// 		.domain([xMinMax[0], xMinMax[1]])
// 		.range([0, width]);
// 	rScale = d3.scaleLinear()
// 		.domain([rMinMax[0], rMinMax[1]])
// 		.range([0, 50])


// 	ringer = svg
// 		.data(data)
// 		.enter()
// 		.data(data, function(d){
// 			if (dates.includes(d.release_date) == false){
// 				dates.push(d.release_date)
// 			} else {
// 				return dates;
// 			};
// 		})
// 	rings = svg.selectAll('rings')
// 		.data(dates)
// 		.enter()
// 		.append('circle')
// 		.attr('class', 'rings')
// 		.attr('id', function(d){
// 			return d;
// 		})
// 		.attr('cx', width/2)
// 		.attr('cy', height/2)
// 		.attr('r', function(d){
// 			rad = rad*1.5
// 			return rad;
// 		})
// 		.attr('stroke', 'gray')
// 		.style('stroke-width', 2)
// 		.attr('fill', 'none')
	
	// circles = svg.selectAll('.point')
	// 	.data(data)
	// 	.enter()
	// 	.append('circle')
	// 	.attr('class', 'point')
	// 	.attr('cx', function(d){
	// 		return xScale(d.release_date - 1000);
	// 	})
	// 	.attr('cy','200')
	// 	.attr('r', function(d){
	// 		return rScale(d.total_gross/1000000);
	// 	})
	// 	.attr('fill', '#000')
	// 	.style('opacity', 0.5)
// });

// function update(Colorscale) {s
// 	d3.csv("disney_movies_groups.csv"). then(function(dataForChart){
		
// 		rMinMax = d3.extent(dataForChart, function(d){
// 			return parseInt(d.total_gross/100000)
// 		})

// 		rScale = d3.scaleLinear()
// 			.domain([rMinMax[0], rMinMax[1]])
// 			.range([0,60])

// 		console.log(rMinMax)
// 		var node = chartsvg.append("g")
// 			.selectAll("circle")
// 			.data(dataForChart)
// 			.enter()
// 			.append("circle")
// 				.attr("class", "node")
// 				.merge()
//     			.transition()
//     			.duration(3000)
// 				.attr("r", function(d) {return rScale(d.total_gross/100000)})
// 				.attr("cx", chartwidth/2)
// 				.attr("cy", chartheight/2)
// 				.style('opacity', 0.7)
// 				.style("fill", function(d){return Colorscale(d.time)})
// 				.style("stroke", function(d){return Colorscale(d.time)})
// 				.style("stroke-width", 1 +"px")
// 				.on("mouseover.tooltip",function(d) {
// 					tooltip.transition()
// 						.duration(300)
// 						.style("opacity", 1);
// 					tooltip.html(d.movie_title + d.time)
// 						.style("top", d3.event.pageY-10 + "px")
// 						.style("left", d3.event.pageX+10 + "px");
// 				})
// 				.on("mouseout.tooltip",function(d){
// 					tooltip.transition()
// 						.duration(200)
// 						.style("opacity", 0)
// 				})
// 				.on("mousemove", function(d) {
// 					tooltip.style("left", (d3.event.pageX)+"px")
// 						.style("top", (d3.event.pageY+10)+"px");
// 				});

// 		var tooltip = d3.select("#chart").append("div")
// 			.attr("class", "tooltip")
// 			.style("opacity", 0);

// 		var simulation = d3.forceSimulation()
// 		  	//.force("x", d3.forceX().strength(0.02).x( function(d){ return x(d.time)/2; } ))
// 		  	//.force("y", d3.forceY().strength(0.02).y( function(d){ return x(d.time)/2; } ))
// 		  	// .force("y", d3.forceY().strength(0.1).y( height/2 ))
// 		  	.force("center", d3.forceCenter().x(chartwidth / 2).y(chartheight / 2)) // Attraction to the center of the svg area
// 		  	.force("charge", d3.forceManyBody().strength(-1)) // Nodes are attracted one each other of value is > 0
// 		  	.force("collide", d3.forceCollide().strength(.5).radius(10).iterations(2)) // Force that avoids circle overlapping

// 	  // Apply these forces to the nodes and update their positions.
// 	  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
// 		simulation
// 		    .nodes(dataForChart)
// 		    .on("tick", function(d){
// 		    node
// 		      .attr("cx", function(d){ return d.x; })
// 		      .attr("cy", function(d){ return d.y; })
// 		    });
// 		var size = 18;
// 		var colegend = d3.select("#legend");

// 		colegend.selectAll('mydots')
// 			.data(color2.domain())
// 			.enter()
// 			.append("rect")
// 				.attr('class', 'legend')
// 				.attr("x", 100)
// 				.attr("y", function(d,i){ return (chartheight/2) + i*(size+5)})
// 				.attr('width', size)
// 				.attr('height', size)
// 				.style('fill', Colorscale)
		
// 		colegend.selectAll("mylabels")
// 			.data(Colorscale.domain())
// 			.enter()
// 			.append("text")
// 				.attr('class', 'legend')
// 				.attr("x", 100 + size*1.2)
// 				.attr("y", function(d,i) {return (chartheight/2) + i*(size+5) + (size/2)})
// 				.style("fill", function(d){return Colorscale(d)})
// 				.text(function(d){ return d})
// 				.attr("text-anchor", "left")
// 				.style("alignment-baseline", "middle")

// 	})
// }