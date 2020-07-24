var dataset, simulation, nodes;
var chartwidth = 800, chartheight = 800;
var blob;
var circles, rad = 10, disavg, parseYear;

var times = ["1950s - 1970s","1970s - 1990s","1990 to 1995","1995 to 2000","2000 to 2005","2005 to 2010","2010 to 2012","2012 to 2014","2014 to 2016",	"2016 to 2017"];
var genre = ["Action","Adventure","Black Comedy","Comedy", "Concert/Performance", "Documentary", "Drama", "Horror", "Musical", "Romantic Comedy","Thriller/Suspense","Western"]

var margin = {top: 50, right: 20, bottom: 50, left: 170};
var width = chartwidth - margin.left - margin.right;
var height = chartheight - margin.top - margin.bottom;

const PeriodX = {"1950s - 1970s": 0,
"1970s - 1990s": 0,
"1990 to 1995": 0,
"1995 to 2000": 300,
"2000 to 2005": 300,
"2005 to 2010": 300,
"2010 to 2012": 600,
"2012 to 2014": 600,
"2014 to 2016": 600,
"2016 to 2017": 900}

const PeriodY = {"1950s - 1970s": 300,
"1970s - 1990s": 600,
"1990 to 1995": 900,
"1995 to 2000": 300,
"2000 to 2005": 600,
"2005 to 2010": 900,
"2010 to 2012": 300,
"2012 to 2014": 600,
"2014 to 2016": 900,
"2016 to 2017": 300}


d3.csv("disney_movies_groups.csv", function(d){
	return{
		Title: d.movie_title,
		Releasedate: d.release_date,
		Genre: d.genre,
		Rating: d.mpaa_rating,
		Sales: +d.inflation_adjusted_gross,
		Period: d.time,
		Midpoint: +d.midpoint,
		Histcol: +d.Hist_col
	};

}).then(data => {
	dataset = data
	subdat = d3.nest()
		.key(function(d) { return d.genre; })
		.rollup(function(v) { return {
			count: v.length,
			total: d3.sum(v, function(d) {return d.Sales/1000000}),
			avg: d3.mean(v, function(d) {return d.Sales/100000}),
			percapita: d3.sum(v, function(d) {return (d.Sales/1000000/v.length)})
		};})
		.entries(dataset)
		.sort(function(a, b){ return d3.descending(a.value, b.value); })
	datestat = d3.nest()
		.key(function(d){ return d.Releasedate})
		.entries(dataset);
	createScales()
	setTimeout(drawInitial(),100)
});

function createScales(){
	genreScale = d3.scaleOrdinal().domain(genre).range(d3.schemeCategory10)
	periodScale = d3.scaleOrdinal().domain(times).range(d3.schemeCategory10)
	salesScale = d3.scaleLinear().domain(d3.extent(dataset, function(d){return parseInt(d.Sales/100000)})).range([5,60])
	releaseScale = d3.scaleLinear().domain(d3.extent(dataset, function(d){return d.Releasedate})).range([0,chartwidth])
	percapitaScale = d3.scaleLinear().domain(d3.extent(subdat, function(d){return parseInt(d.value.percapita)})).range([height,0])
	genreband = d3.scaleBand().domain(genre).range([0, width]).padding(0.5)
	yScale = d3.scaleLinear().domain([0, 35]).range([chartheight,0])
}

// function createLegend(x,y){
// 	let svg = d3.select('#legend')

// 	svg.append('g')
// 		.attr('class', 'Genre Legend')
// 		.attr('transform', 'translate(${x},${y}')

// 	categoryLegend = d3.legendColor()
// 							.shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
//                             .shapePadding(10)
//                             .scale(genreScale)
//     d3.select('.categoryLegend')
//     .call(categoryLegend)
// }

// function createSizeLegend(){
//     let svg = d3.select('#legend2')
//     svg.append('g')
//         .attr('class', 'sizeLegend')
//         .attr('transform', `translate(100,50)`)

//     sizeLegend2 = d3.legendSize()
//         .scale(salesScale)
//         .shape('circle')
//         .shapePadding(15)
//         .title('Salary Scale')
//         .labelFormat(d3.format("$,.2r"))
//         .cells(7)

//     d3.select('.sizeLegend')
//         .call(sizeLegend2)
// }

function drawInitial(){
	// createSizeLegend()

	//create axis for initial graph
	let svg = d3.select("#vis")
					.append('svg')
					.attr('width', 1000)
					.attr('height', 950)
					.attr('opacity', 1)

	let xaxis = svg.append("g")
				.attr("transform", "translate(0," + chartheight + ")")
				.call(d3.axisBottom(releaseScale));

	let yaxis = svg.append("g")
					.call(d3.axisLeft(yScale))

	// svg.selectAll("circle")
	// 	.data(datestat)
	// 	.enter()
	// 	.append("circle")
	// 	.attr("r", 5)
	// 	.attr("cx", function(d) {return releaseScale(d.key)})
	// 	.attr("cy", function(d) {return yScale(d.values.length)});

	//Get forces ready for cluster chart

	// simulation = d3.forceSimulation(dataset)
	// simulation
	//     .nodes(dataset)
	//     .on("tick", function(d){
	//     nodes
	//       .attr("cx", function(d){ return d.x; })
	//       .attr("cy", function(d){ return d.y; })
	//     });
	// simulation.stop()

	// nodes = svg.append("g")
	// 	.selectAll("circle")
	// 	.data(dataset)
	// 	.enter()
	// 	.append("circle")
	// 		.attr("class", function(d) {return d.Genre})
	// 		.attr("r", function(d) {return salesScale(d.Sales/100000)})
	// 		.attr("cx", chartwidth/2)
	// 		.attr("cy", chartheight/2)
	// 		.style('opacity', 0.7)
	// 		.style("fill", function(d){ return genreScale(d.Genre)})
	// 		.style("stroke", function(d){return genreScale(d.Genre)})
	// 		.style("stroke-width", 1 +"px")
}

// function clean(chartType){
// 	let svg = d3.select

function draw1() {

	let svg = d3.select("#vis")
					.select('svg')
					.attr('width', 1000)
					.attr('height', 1000)

	svg.selectAll("circle")
		.data(datestat)
		.enter()
		.append("circle")
		.attr("r", 5)
		.attr("cx", function(d) {return releaseScale(d.key)})
		.attr("cy", function(d) {return yScale(d.values.length)})

console.log("what")
}

function draw2(){

	let svg = d3.select("#vis").select('svg')

	svg.selectAll('circle')
		.data(dataset)
		.enter()
		.append("circle")
		.transition().duration(300)
		.attr("r", function(d) {return salesScale((d.Sales/100000))})
		.attr("cx", chartwidth/2)
		.attr("cy", chartheight/2)
		.style("fill", function(d){ return genreScale(d.Genre)})

	simulation = d3.forceSimulation(dataset)
	simulation
	    .nodes(dataset)
	    .on("tick", function(d){
	    nodes
	      .attr("cx", function(d){ return d.x; })
	      .attr("cy", function(d){ return d.y; })
	    });

	nodes = svg.append("g")
		.selectAll("circle")
		.data(dataset)
		.enter()
		.append("circle")
			.attr("class", function(d) {return d.Genre})
			.attr("r", function(d) {return salesScale(d.Sales/100000)})
			.attr("cx", chartwidth/2)
			.attr("cy", chartheight/2)
			.style('opacity', 0.7)
			.style("fill", function(d){ return genreScale(d.Genre)})
			.style("stroke", function(d){return genreScale(d.Genre)})
			.style("stroke-width", 1 +"px")

	simulation = d3.forceSimulation(dataset)
		.force('charge', d3.forceManyBody().strength([2]))
		.force('forceX', d3.forceX(d => PeriodX[d.Period] + 100))
		.force('forceY', d3.forceY(d => PeriodY[d.Period] + 50))
		.force('collide', d3.forceCollide(function(d) {return salesScale(d.Sales/100000) + 4}))
		.alphaDecay([0.02])

	simulation.alpha(0.9).restart()

	// createLegend(20,50)

}

function draw3(){
	console.log("when")
	let svg = d3.select("#vis").select('svg')

	console.log("when-2")
	svg.selectAll('circle')
		.data(subdat)
		.enter().append("circle")
		.attr("transform", "translate(0,50)")
		.attr("class", function(d) {return d.key})
		.attr("r", function(d) {return salesScale(d.value.count)})
		.attr("cx", function(d) {return genreband(d.key)})
		.attr("cy", function(d) {return yScale(d.value.percapita)})
		.style("fill", function(d) {return genreScale(d.key)})
	console.log("when-3")
}

function draw4(){
	console.log("woo")
	let svg = d3.select("#vis").select('svg')

	svg.selectAll('circle')
		.transition()
		.attr("r", function(d) {return salesScale(d.Sales/100000)})
		.attr("cx", chartwidth/2)
		.attr("cy", chartheight/2)
		.style("fill", function(d){ return periodScale(d.time)})
		.style("stroke", function(d){return periodScale(d.time)})

}

let activationFunctions = [
	draw1,
	draw2,
	draw3,
	draw4
]

// var color2 = d3.scaleOrdinal()
// 	.domain(times)
// 	.range(d3.schemeCategory10);

// var color = d3.scaleOrdinal()
// 	.domain(genre)
// 	.range(d3.schemeCategory10);

// var linesvg = d3.select('#timeline')
// 	.append('svg')
// 	.attr('width', chartwidth + margin.left + margin.right + 'px')
// 	.attr('height', chartheight + margin.top + margin.bottom + 'px');

// var chartsvg = d3.select('#chart')
// 	.append('svg')
// 	.attr('width', chartwidth + 'px')
// 	.attr('height', chartheight + 'px');

// var clustersvg = d3.select('#cluster-chart')
// 	.append('svg')
// 	.attr('width', chartwidth + 'px')
// 	.attr('height', chartheight + 'px');

// var histsvg = d3.select('#hist-chart')
// 	.append('svg')
// 	.attr('width', chartwidth + 'px')
// 	.attr('height', chartheight + 'px');

// // line Chart 
// d3.csv("disney_movies_groups.csv"). then(function(dataForChart){
// 	var xMinMax = d3.extent(dataForChart, function(d){return d.release_date});
// 	var xScale = d3.scaleLinear()
// 		.domain([xMinMax[0], xMinMax[1]])
// 		.range([0,chartwidth]);
	
// 	var yScale = d3.scaleLinear()
// 		.domain([0, 35])
// 		.range([chartheight,0]);

// 	var sumstat = d3.nest()
// 				.key(function(d){ return d.release_date})
// 				.entries(dataForChart);

// 	linesvg.append("g")
// 		.selectAll("dot")
// 		.data(sumstat)
// 		.enter()
// 		.append("circle")
// 		.attr("r", 5)
// 		.attr("cx", function(d) {return xScale(d.key)})
// 		.attr("cy", function(d) {return yScale(d.values.length)})
	
// 	linesvg.append("g")
// 		.attr("transform", "translate(0," + chartheight + ")")
// 		.call(d3.axisBottom(xScale));

// 	linesvg.append("g")
// 			.call(d3.axisLeft(yScale));

// });
// // Cluster chart
// d3.csv("disney_movies_groups.csv").then(function(dataForChart){
// 	var rMinMax = d3.extent(dataForChart, function(d){
// 		return parseInt(d.inflation_adjusted_gross/100000)
// 	})

// 	var rScale = d3.scaleLinear()
// 		.domain([rMinMax[0], rMinMax[1]])
// 		.range([0,60])

// 	nodes = clustersvg.append("g")
// 		.selectAll("circle")
// 		.data(dataForChart)
// 		.enter()
// 		.append("circle")
// 			.attr("class", function(d) {return d.genre})
// 			.attr("r", function(d) {return rScale(d.inflation_adjusted_gross/100000)})
// 			.attr("cx", chartwidth/2)
// 			.attr("cy", chartheight/2)
// 			.style('opacity', 0.7)
// 			.style("fill", function(d){ return color(d.genre)})
// 			.style("stroke", function(d){return color(d.genre)})
// 			.style("stroke-width", 1 +"px")

// 	simulation = d3.forceSimulation(dataForChart)
// 		.force('charge', d3.forceManyBody().strength([2]))
// 		.force('forceX', d3.forceX(d => PeriodX[d.time] + 100))
// 		.force('forceY', d3.forceY(d => PeriodY[d.time] + 50))
// 		.force('collide', d3.forceCollide(function(d) {return rScale(d.inflation_adjusted_gross/100000) + 4}))
// 		.alphaDecay([0.02])

// 	simulation
// 	    .nodes(dataForChart)
// 	    .on("tick", function(d){
// 	    nodes
// 	      .attr("cx", function(d){ return d.x; })
// 	      .attr("cy", function(d){ return d.y; })
// 	    });

// })

// //simple line
// d3.csv('disney_movies_groups.csv').then(function(dataForChart){
// 	subdat = d3.nest()
// 		.key(function(d) { return d.genre; })
// 		.rollup(function(v) { return {
// 			count: v.length,
// 			total: d3.sum(v, function(d) {return d.inflation_adjusted_gross/1000000}),
// 			avg: d3.mean(v, function(d) {return d.inflation_adjusted_gross/100000}),
// 			percapita: d3.sum(v, function(d) {return (d.inflation_adjusted_gross/1000000/v.length)})
// 		};})
// 		.entries(dataForChart)
// 		.sort(function(a, b){ return d3.descending(a.value, b.value); });
// 	console.log(subdat)
// 	var xMinMax = d3.extent(subdat, function(d){
// 		return parseInt(d.value.percapita)
// 	})

// 	var yScale = d3.scaleLinear()
// 		.domain([xMinMax[0], xMinMax[1]])
// 		.range([height,0])

// 	var xband = d3.scaleBand()
// 		.domain(genre)
// 		.range([0, width])
// 		.padding(0.5)

// 	var rMinMax = d3.extent(subdat, function(d){
// 		return parseInt(d.value.count)
// 		})

// 	var rScale = d3.scaleLinear()
// 		.domain([rMinMax[0], rMinMax[1]])
// 		.range([10,60])

// 	console.log(xMinMax, height, subdat)

// 	histsvg.selectAll('circle')
// 		.data(subdat)
// 		.enter().append("circle")
// 		.attr("transform", "translate(0,50)")
// 		.attr("class", function(d) {return d.key})
// 		.attr("r", function(d) {return rScale(d.value.count)})
// 		.attr("cx", function(d) {return xband(d.key)})
// 		.attr("cy", function(d) {return yScale(d.value.percapita)})
// 		.style("fill", function(d) {return color(d.key)})

// })


// /// Custom chart
// d3.csv("disney_movies_groups.csv"). then(function(dataForChart){
// 		var rMinMax = d3.extent(dataForChart, function(d){
// 			return parseInt(d.total_gross/100000)
// 		})

// 		var rScale = d3.scaleLinear()
// 			.domain([rMinMax[0], rMinMax[1]])
// 			.range([0,60])

// 		var node = chartsvg.append("g")
// 			.selectAll("circle")
// 			.data(dataForChart)
// 			.enter()
// 			.append("circle")
// 				.attr("transform", "translate("+chartwidth/2+"," + chartheight/2 + ")")
// 				.attr("class", "node")
// 				.attr("r", function(d) {return rScale(d.total_gross/100000)})
// 				.attr("cx", chartwidth/2)
// 				.attr("cy", chartheight/2)
// 				.style('opacity', 0.7)
// 				.style("fill", function(d){ return color2(d.time)})
// 				.style("stroke", function(d){return color2(d.time)})
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
// 		  	.force("charge", d3.forceManyBody().strength(-1))
// 		  	.force("collide", d3.forceCollide().strength(.5).radius(10).iterations(2))

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
// 				.attr('class', 'mydots')
// 				.attr("x", 100)
// 				.attr("y", function(d,i){ return (chartheight/2) + i*(size+5)})
// 				.attr('width', size)
// 				.attr('height', size)
// 				.style('fill', color2)
		
// 		colegend.selectAll("mylabels")
// 			.data(color2.domain())
// 			.enter()
// 			.append("text")
// 				.attr('class', 'mylabels')
// 				.attr("x", 100 + size*1.2)
// 				.attr("y", function(d,i) {return (chartheight/2) + i*(size+5) + (size/2)})
// 				.style("fill", function(d){return color2(d)})
// 				.text(function(d){ return d})
// 				.attr("text-anchor", "left")
// 				.style("alignment-baseline", "middle")

// })



// function changelegend(cscale){
// 	if (cscale == color2){
// 		d3.selectAll("circle")
// 			.transition()
// 			.duration(1000)
// 			.style("fill", function(d){return color2(d.time)})
// 			.style("stroke", function(d){return color2(d.time)})

// 		d3.selectAll("rect")
// 				.data(color2.domain())
// 				.transition()
// 				.duration(1000)
// 				.style('fill', color2)

// 		d3.selectAll('text')
// 				.data(color2.domain())
// 				.transition()
// 				.duration(1000)
// 				.style("fill", color2)
// 				.text(function(d){ return d})
// 	} else {
// 		d3.selectAll("circle")
// 			.transition()
// 			.duration(1000)
// 			.style("fill", function(d){return color(d.genre)})
// 			.style("stroke", function(d){return color(d.genre)})

// 		d3.selectAll("rect")
// 			.data(color.domain())
// 			.transition()
// 			.duration(1000)
// 			.style("fill", color)

// 		d3.selectAll("text")
// 			.data(color.domain())
// 			.transition()
// 			.duration(1000)
// 			.style("fill", color)
// 			.text(function(d){ return d })

// 	}
// }

let scroll = scroller()
    .container(d3.select('#graphic'))
scroll()

let lastIndex, activeIndex = 0

scroll.on('active', function(index){
    d3.selectAll('.step')
        .transition().duration(500)
        .style('opacity', function (d, i) {return i === index ? 1 : 0.1;});
    
    activeIndex = index
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1; 
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

scroll.on('progress', function(index, progress){
    if (index == 2 & progress > 0.7){

    }
})