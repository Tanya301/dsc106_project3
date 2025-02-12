// estrus_plot.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { dataLoaded } from "../global.js"; // Adjust path as needed

dataLoaded.then(({ fem_temp }) => {
  // 1) Convert strings to numbers & define Estrus
  fem_temp.forEach(d => {
    d.Time        = +d.Time;        // e.g., minutes
    d.Temperature = +d.Temperature; // e.g., °C
    // Estrus days: (Time // 1440) % 4 === 2
    d.Estrus = (Math.floor(d.Time / 1440) % 4 === 2) ? 1 : 0;
  });

  // 2) Group by Mouse => an array of [mouseID, rows[]]
  const miceGroups = d3.groups(fem_temp, d => d.Mouse);

  // Also extract the rows where Estrus=1
  const estrusData = fem_temp.filter(d => d.Estrus === 1);

  // 3) Chart dimensions
  const margin = { top: 30, right: 110, bottom: 40, left: 50 },
        width  = 700 - margin.left - margin.right,
        height = 400 - margin.top  - margin.bottom;

  // Clear any old SVG in #time_ernus
  d3.select("#time_ernus").selectAll("svg").remove();

  // Create the SVG
  const svg = d3.select("#time_ernus")
    .append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // 4) Scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(fem_temp, d => d.Time))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(fem_temp, d => d.Temperature))
    .nice()
    .range([height, 0]);

  const mouseIDs = miceGroups.map(d => d[0]); // e.g. ["f1","f2",...]
  const color = d3.scaleOrdinal()
    .domain(mouseIDs)
    .range(d3.schemeCategory10); // or any color palette you like

  // 5) Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .call(d3.axisLeft(yScale));

  // 6) Line generator for Temperature vs. Time
  const line = d3.line()
    .x(d => xScale(d.Time))
    .y(d => yScale(d.Temperature));

  // 7) One line per mouse
  miceGroups.forEach(([mouseID, rows]) => {
    rows.sort((a, b) => d3.ascending(a.Time, b.Time));
    svg.append("path")
      .datum(rows)
      .attr("fill", "none")
      .attr("stroke", color(mouseID))
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.5)
      .attr("d", line);
  });

  // 8) Scatter plot the Estrus days in red
  svg.selectAll(".estrus-point")
    .data(estrusData)
    .enter()
    .append("circle")
      .attr("class", "estrus-point")
      .attr("cx", d => xScale(d.Time))
      .attr("cy", d => yScale(d.Temperature))
      .attr("r", 2.5)
      .attr("fill", "red")
      .attr("fill-opacity", 0.6);

  // 9) Title & labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Estrus Cycle Highlighting: Female Temperature");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 15)
    .attr("text-anchor", "middle")
    .text("Temperature (°C)");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 35)
    .attr("text-anchor", "middle")
    .text("Time (Minutes)");

  // 10) Legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 10},0)`);

  mouseIDs.forEach((mouse, i) => {
    const row = legend.append("g")
      .attr("transform", `translate(0,${i*20})`);
    row.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(mouse))
      .attr("opacity", 0.5);
    row.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(`Mouse ${mouse}`);
  });

  // Extra entry for Estrus
  const estrusLegend = legend.append("g")
    .attr("transform", `translate(0,${mouseIDs.length*20})`);
  estrusLegend.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "red")
    .attr("opacity", 0.6);
  estrusLegend.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .text("Estrus Days");
});
