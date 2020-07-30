getData();

//Get the data from csv file - data is downloaded from https://population.un.org/wpp/Download/Standard/Population/
function getData() {
    d3.csv('data/data.csv')
        .then(res => {
            res.forEach(data => {
                data.Population = +data.Population * 1000
            })
            renderChart(res)
        })
        .catch(err => console.log(err))
}

//Render our chart from the data taken
const renderChart = (data) => {
    const chartData = initializeDataForChart();
    const { xValue, yValue, innerWidth, innerHeight, g } = chartData;

    const scales = scale(data, xValue, yValue, innerWidth, innerHeight);
    const { xScale, yScale } = scales;

    addingAxis(g, xScale, yScale, innerHeight, innerWidth);
    appendTooltip();

    g.selectAll('rect').data(data)  //create a rect (bar) for each of the data
        .enter().append('rect')
        .attr('y', d => yScale(yValue(d)))
        .attr('width', d => xScale(xValue(d))) // each bar will have a width correcsponding to the data.Population
        .attr('height', yScale.bandwidth())    // bandwidth() is the width of a single bar
        .on('mouseover', hoverEffectOver)
        .on('mouseout', hoverEffectDone)

    g.append('text')
        .attr('class', 'chart-title')
        .attr('y', -20)
        .attr('x', innerWidth / 4)
        .text('World Population in 2019')
}

//Hover effect on bars - opacity decrease and data display
function hoverEffectOver() {
    const tooltip = d3.select('.tooltip');
    const selectedElement = d3.select(this);

    selectedElement.transition()
        .duration('50')
        .attr('opacity', '.85')

    tooltip.transition()
        .duration(50)
        .style("opacity", 1)

    tooltip.html(selectedElement._groups[0][0].__data__.Population) //display the data when hovering https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 15) + "px");
}

//Hover effect on bars - back to normal
function hoverEffectDone() {
    const tooltip = d3.select('.tooltip');

    d3.select(this).transition()
        .duration('50')
        .attr('opacity', '1');

    tooltip.transition()
        .duration('50')
        .style("opacity", 0);
}

const appendTooltip = () => {
    d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}

//Initialize some data for our chart to be used later
const initializeDataForChart = () => {
    const svg = d3.select("svg");
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const margin = { top: 70, right: 20, bottom: 50, left: 250 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const xValue = d => d.Population;
    const yValue = d => d.Country;
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    return { xValue, yValue, innerWidth, innerHeight, g }
}

//Scales the values from our data to the screen
const scale = (data, xValue, yValue, innerWidth, innerHeight) => {
    const xScale = d3.scaleLinear()        // scaleLinear maps the value from the domain to the corresponding value in the range: http://www.jeromecukier.net/2011/08/11/d3-scales-and-color/
        .domain([0, d3.max(data, xValue)]) // this is the value from our data - starts from 0 to max of our data
        .range([0, innerWidth])            // the space of our screen

    const yScale = d3.scaleBand() // divide the range evenly between the elements of the domain: https://observablehq.com/@d3/d3-scaleband
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.3)

    return { xScale, yScale }
}

//Adding the X and Y axes (X for popluation and Y for country names) and formatting numbers
const addingAxis = (g, xScale, yScale, innerHeight, innerWidth) => {
    const xAxisTickFormat = number => d3.format('.2s')(number).replace('G', 'B') // format the population numbers: http://bl.ocks.org/zanarmstrong/05c1e95bf7aa16c4768e
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(xAxisTickFormat)
        .tickSize(-innerHeight)

    g.append('g').call(d3.axisLeft(yScale))
    const xAxisGroup = g.append('g').call(xAxis).attr('transform', `translate(0, ${innerHeight})`);

    xAxisGroup.append('text')
        .attr('class', 'xAxis-label')
        .attr('y', 30)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text('Population')
}