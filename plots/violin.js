// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// const svg = d3.select("#violinPlot");
// const width = +svg.attr("width");
// const height = +svg.attr("height");
// const margin = { top: 50, right: 40, bottom: 60, left: 60 };
// const innerWidth = width - margin.left - margin.right;
// const innerHeight = height - margin.top - margin.bottom;

// const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// export const dataLoaded = Promise.all([
//     d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Fem Temp.csv"),
//     d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Male Temp.csv")
// ]).then(([fem_temp, male_temp]) => {
//     console.log("Data Loaded:", { fem_temp, male_temp });
//     return { fem_temp, male_temp };
// });

// dataLoaded.then(({ fem_temp, male_temp }) => {
//     const femaleTemps = fem_temp.flatMap(d =>
//         Object.values(d).map(v => +v).filter(v => !isNaN(v))
//     );
//     const maleTemps = male_temp.flatMap(d =>
//         Object.values(d).map(v => +v).filter(v => !isNaN(v))
//     );

//     const categories = ["Male", "Female"];
//     const data = [maleTemps, femaleTemps];

//     // X-axis: Category scale (centered points)
//     const xScale = d3.scalePoint()
//         .domain(categories)
//         .range([0, innerWidth])
//         .padding(0.5);

//     // Y-axis: Temperature range (starting at 34)
//     const yScale = d3.scaleLinear()
//         .domain([34, d3.max([...maleTemps, ...femaleTemps])])
//         .nice()
//         .range([innerHeight, 0]);

//     // Draw X-axis
//     g.append("g")
//         .attr("transform", `translate(0,${innerHeight})`)
//         .call(d3.axisBottom(xScale));

//     // Draw Y-axis
//     g.append("g")
//         .call(d3.axisLeft(yScale));

//     // Axis Labels
//     g.append("text")
//         .attr("x", innerWidth / 2)
//         .attr("y", innerHeight + 40)
//         .attr("text-anchor", "middle")
//         .attr("font-size", "14px")
//         .text("Mouse Group");

//     g.append("text")
//         .attr("x", -innerHeight / 2)
//         .attr("y", -50)
//         .attr("text-anchor", "middle")
//         .attr("transform", "rotate(-90)")
//         .attr("font-size", "14px")
//         .text("Temperature (°C)");

//     // KDE functions
//     function kernelDensityEstimator(kernel, X) {
//         return function(V) {
//             return X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
//         };
//     }

//     function gaussianKernel(scale) {
//         return function(u) {
//             return Math.exp(-0.5 * (u / scale) ** 2) / (Math.sqrt(2 * Math.PI) * scale);
//         };
//     }

//     // Kernel Density Estimation
//     const kde = kernelDensityEstimator(gaussianKernel(0.5), yScale.ticks(50));
//     const densities = data.map(d => kde(d));

//     // Adjust violin width
//     const violinWidth = innerWidth / 6;  // Dynamically adjust based on plot width

//     densities.forEach((density, i) => {
//         const area = d3.area()
//             .x0(d => xScale(categories[i]) - violinWidth * d[1])  // Shift properly around xScale center
//             .x1(d => xScale(categories[i]) + violinWidth * d[1])
//             .y(d => yScale(d[0]))
//             .curve(d3.curveBasis);

//         g.append("path")
//             .datum(density)
//             .attr("class", "violin")
//             .attr("fill", i === 0 ? "blue" : "red")
//             .attr("opacity", 0.6)
//             .attr("d", area);
//     });

//     // Legend
//     const legend = g.append("g")
//         .attr("transform", `translate(${innerWidth - 100},${20})`);

//     legend.append("rect")
//         .attr("x", 0)
//         .attr("y", 0)
//         .attr("width", 15)
//         .attr("height", 15)
//         .attr("fill", "blue");

//     legend.append("text")
//         .attr("x", 20)
//         .attr("y", 12)
//         .style("font-size", "12px")
//         .text("Male");

//     legend.append("rect")
//         .attr("x", 0)
//         .attr("y", 20)
//         .attr("width", 15)
//         .attr("height", 15)
//         .attr("fill", "red");

//     legend.append("text")
//         .attr("x", 20)
//         .attr("y", 32)
//         .style("font-size", "12px")
//         .text("Female");

// }).catch(error => console.error(error));
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const svg = d3.select("#violinPlot");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 80, right: 40, bottom: 60, left: 60 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Add title
svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text("Temperature Distributions Between Male and Female Mice");

export const dataLoaded = Promise.all([
    d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Fem Temp.csv"),
    d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Male Temp.csv")
]).then(([fem_temp, male_temp]) => {
    console.log("Data Loaded:", { fem_temp, male_temp });
    return { fem_temp, male_temp };
});

dataLoaded.then(({ fem_temp, male_temp }) => {
    const femaleTemps = fem_temp.flatMap(d =>
        Object.values(d).map(v => +v).filter(v => !isNaN(v))
    );
    const maleTemps = male_temp.flatMap(d =>
        Object.values(d).map(v => +v).filter(v => !isNaN(v))
    );

    const categories = ["Male", "Female"];
    const data = [maleTemps, femaleTemps];

    // X-axis: Category scale (centered points)
    const xScale = d3.scalePoint()
        .domain(categories)
        .range([0, innerWidth])
        .padding(0.5);

    // Y-axis: Temperature range
    const yScale = d3.scaleLinear()
        .domain([34, d3.max([...maleTemps, ...femaleTemps])])
        .nice()
        .range([innerHeight, 0]);

    // Draw X-axis
    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

    // Draw Y-axis
    g.append("g")
        .call(d3.axisLeft(yScale));

    // Axis Labels
    g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Mouse Group");

    g.append("text")
        .attr("x", -innerHeight / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "14px")
        .text("Temperature (°C)");

    // KDE functions
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

    // Kernel Density Estimation
    const kde = kernelDensityEstimator(gaussianKernel(0.5), yScale.ticks(50));
    const densities = data.map(d => kde(d));

    // Find max density value for width scaling
    const maxDensity = Math.max(...densities.flat().map(d => d[1]));
    const maxViolinWidth = innerWidth / 4;  // Adjusted dynamically for better spacing

    densities.forEach((density, i) => {
        const area = d3.area()
            .x0(d => xScale(categories[i]) - (maxViolinWidth * d[1]) / maxDensity)  // Adjust width dynamically
            .x1(d => xScale(categories[i]) + (maxViolinWidth * d[1]) / maxDensity)
            .y(d => yScale(d[0]))
            .curve(d3.curveBasis);

        g.append("path")
            .datum(density)
            .attr("class", "violin")
            .attr("fill", i === 0 ? "blue" : "red")
            .attr("opacity", 0.6)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("d", area);
    });

    // Legend
    const legend = g.append("g")
        .attr("transform", `translate(${innerWidth - 100},${20})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "blue");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .text("Male");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "red");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 32)
        .style("font-size", "12px")
        .text("Female");

}).catch(error => console.error(error));


