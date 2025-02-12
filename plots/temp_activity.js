import { dataLoaded } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

function processTempActivityData(fem_act, fem_temp, male_act, male_temp) {
    // Process female data
    const femaleData = fem_act.map((row, index) => {
        const actValues = Object.values(row).filter(val => !isNaN(val));
        const tempValues = Object.values(fem_temp[index]).filter(val => !isNaN(val));
        return {
            activity: d3.mean(actValues) || 0,
            temperature: d3.mean(tempValues) || 0,
            gender: 'Female'
        };
    });

    // Process male data
    const maleData = male_act.map((row, index) => {
        const actValues = Object.values(row).filter(val => !isNaN(val));
        const tempValues = Object.values(male_temp[index]).filter(val => !isNaN(val));
        return {
            activity: d3.mean(actValues) || 0,
            temperature: d3.mean(tempValues) || 0,
            gender: 'Male'
        };
    });

    return [...femaleData, ...maleData];
}

function createTempActivityChart(data) {
    // Set dimensions
    const margin = {top: 40, right: 60, bottom: 40, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select("#temp_activity_comparison")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.activity)])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.temperature), d3.max(data, d => d.temperature)])
        .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add scatter points
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.activity))
        .attr("cy", d => y(d.temperature))
        .attr("r", 4)
        .attr("fill", d => d.gender === 'Female' ? "#FF69B4" : "#4169E1")
        .attr("opacity", 0.2);

    // Add labels (keep existing labels)
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 35)
        .attr("text-anchor", "middle")
        .text("Activity Level");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Temperature");

    // Add title (keep existing title)
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("Activity vs Temperature by Gender");

    // Keep existing legend
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

dataLoaded.then(({ fem_act, fem_temp, male_act, male_temp }) => {
    const processedData = processTempActivityData(fem_act, fem_temp, male_act, male_temp);
    createTempActivityChart(processedData);
}).catch(error => console.error("Error loading data:", error));