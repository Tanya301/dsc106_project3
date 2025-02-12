import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { dataLoaded } from "../global.js";

dataLoaded.then(({ fem_act, fem_temp }) => {
  // Calculate correlations between temperature and activity for each time point
  function calculateCorrelations(activityData, tempData) {
    const correlations = [];
    
    // For each time point (f1 through f13)
    for (let i = 1; i <= 13; i++) {
      const timePoint = `f${i}`;
      const activityValues = [];
      const tempValues = [];
      
      // Collect paired values
      for (let j = 0; j < activityData.length; j++) {
        const activity = parseFloat(activityData[j][timePoint]);
        const temp = parseFloat(tempData[j][timePoint]);
        if (!isNaN(activity) && !isNaN(temp)) {
          activityValues.push(activity);
          tempValues.push(temp);
        }
      }
      
      // Calculate correlation coefficient
      const correlation = calculateCorrelationCoefficient(activityValues, tempValues);
      correlations.push({
        timePoint,
        correlation: correlation || 0
      });
    }
    return correlations;
  }

  // Helper function to calculate correlation coefficient
  function calculateCorrelationCoefficient(x, y) {
    const n = x.length;
    if (n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  // Calculate correlations
  const correlations = calculateCorrelations(fem_act, fem_temp);

  // Set up dimensions
  const margin = { top: 40, right: 100, bottom: 40, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Clear any existing SVG
  d3.select("#time_ernus").selectAll("svg").remove();

  // Create SVG
  const svg = d3.select("#time_ernus")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create scales
  const y = d3.scaleBand()
    .domain(correlations.map(d => d.timePoint))
    .range([0, height])
    .padding(0.1);

  const x = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width]);

  const colorScale = d3.scaleSequential()
    .domain([0.3, 0.8])
    .interpolator(d3.interpolateRdBu);

  // Create bars
  svg.selectAll("rect")
    .data(correlations)
    .join("rect")
      .attr("y", d => y(d.timePoint))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", width)
      .attr("fill", d => colorScale(d.correlation));

  // Add correlation values
  svg.selectAll(".correlation-text")
    .data(correlations)
    .join("text")
      .attr("class", "correlation-text")
      .attr("x", width / 2)
      .attr("y", d => y(d.timePoint) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .text(d => d.correlation.toFixed(2));

  // Add axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Correlation Between Temperature and Activity");

  // Add color legend
  const legendWidth = 20;
  const legendHeight = height;
  
  const legendScale = d3.scaleSequential()
    .domain([0.3, 0.8])
    .interpolator(d3.interpolateRdBu);
    
  const legendAxis = d3.axisRight()
    .scale(d3.scaleLinear().domain([0.3, 0.8]).range([legendHeight, 0]))
    .ticks(5);

  const legend = svg.append("g")
    .attr("transform", `translate(${width + 20}, 0)`);

  const gradient = legend.append("defs")
    .append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%");

  const numberOfStops = 10;
  for (let i = 0; i <= numberOfStops; i++) {
    const offset = i / numberOfStops;
    const value = 0.3 + offset * 0.5;  // Scale from 0.3 to 0.8
    gradient.append("stop")
      .attr("offset", `${offset * 100}%`)
      .attr("stop-color", legendScale(value));
  }

  legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");

  legend.append("g")
    .attr("transform", `translate(${legendWidth},0)`)
    .call(legendAxis);
});