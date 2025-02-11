import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Your variables
let fem_act = null;
let fem_temp = null;
let male_act = null;
let male_temp = null;

// Fetch the data
d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Fem Act.csv").then(data => {
    fem_act = data;
    console.log(fem_act);
}).catch(error => console.error(error));

d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Fem Temp.csv").then(data => {
    fem_temp = data;
    console.log(fem_temp);
}).catch(error => console.error(error));

d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Male Act.csv").then(data => {
    male_act = data;
    console.log(male_act);
}).catch(error => console.error(error));

d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Male Temp.csv").then(data => {
    male_temp = data;
    console.log(male_temp);
}).catch(error => console.error(error));


const margin = {top: 20, right: 30, bottom: 40, left: 50},
      width = 600 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const svg = d3.select("svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

Promise.all([
    d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Fem Temp.csv"),
    d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Male Temp.csv")
]).then(([femData, maleData]) => {
    const femaleTemps = femData.map(d => +d.temperature);
    const maleTemps = maleData.map(d => +d.temperature);
    const categories = ["Male", "Female"];
    const data = [maleTemps, femaleTemps];

    const xScale = d3.scaleBand()
        .domain(categories)
        .range([0, width])
        .padding(0.5);

    const yScale = d3.scaleLinear()
        .domain([d3.min([...maleTemps, ...femaleTemps]), d3.max([...maleTemps, ...femaleTemps])])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    function kernelDensityEstimator(kernel, X) {
        return function(V) {
            return X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
        };
    }

    function gaussianKernel(scale) {
        return function(u) {
            return Math.exp(-0.5 * (u / scale) ** 2) / (Math.sqrt(2 * Math.PI) * scale);
        };
    }

    const kde = kernelDensityEstimator(gaussianKernel(0.5), yScale.ticks(50));
    const densities = data.map(d => kde(d));

    const violinWidth = 50;

    densities.forEach((density, i) => {
        const area = d3.area()
            .x0(d => xScale(categories[i]) - violinWidth * d[1])
            .x1(d => xScale(categories[i]) + violinWidth * d[1])
            .y(d => yScale(d[0]))
            .curve(d3.curveBasis);

        svg.append("path")
            .datum(density)
            .attr("class", "violin")
            .attr("fill", i === 0 ? "blue" : "red")
            .attr("d", area);
    });
}).catch(error => console.error(error));
