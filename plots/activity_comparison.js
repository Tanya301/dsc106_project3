import { dataLoaded } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

function processActivityData(fem_act, male_act) {
    // Create minute index (0-1439) for each dataset
    const minuteData = new Array(1440).fill(0).map((_, i) => ({
        minute: i,
        femaleActivity: 0,
        maleActivity: 0
    }));
    // Process female data
    fem_act.forEach((row, index) => {
        const minute = index % 1440;
        const values = Object.values(row).filter(val => !isNaN(val));
        minuteData[minute].femaleActivity += d3.mean(values) || 0;
    });
    // Process male data
    male_act.forEach((row, index) => {
        const minute = index % 1440;
        const values = Object.values(row).filter(val => !isNaN(val));
        minuteData[minute].maleActivity += d3.mean(values) || 0;
    });
    // Calculate averages
    minuteData.forEach(d => {
        d.femaleActivity /= Math.ceil(fem_act.length / 1440);
        d.maleActivity /= Math.ceil(male_act.length / 1440);
    });
    return minuteData;
}

// Create the visualization
function createActivityChart(data) {
    // dimensions
    const margin = {top: 40, right: 60, bottom: 40, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#activity_comparison")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // scales
    const x = d3.scaleLinear()
        .domain([0, 1439])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.femaleActivity, d.maleActivity))])
        .range([height, 0]);

    // lines
    const femaleLine = d3.line()
        .x(d => x(d.minute))
        .y(d => y(d.femaleActivity));

    const maleLine = d3.line()
        .x(d => x(d.minute))
        .y(d => y(d.maleActivity));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#FF69B4")
        .attr("stroke-width", 2)
        .attr("d", femaleLine);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#4169E1")
        .attr("stroke-width", 2)
        .attr("d", maleLine);

    // axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .ticks(6)
            .tickFormat(d => d));

    svg.append("g")
        .call(d3.axisLeft(y));

    // labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 35)
        .attr("text-anchor", "middle")
        .text("Time (Minutes from Lights Off)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Mean Activity Level");

    // title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("Which Gender is More Active?");

    // legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, 20)`);

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#FF69B4");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#4169E1");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("Female");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 32)
        .text("Male");
}


dataLoaded.then(({ fem_act, male_act }) => {
    const processedData = processActivityData(fem_act, male_act);
    createActivityChart(processedData);
}).catch(error => console.error("Error loading data:", error));
