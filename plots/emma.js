import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { dataLoaded } from "../global.js";

dataLoaded.then(({ fem_act, fem_temp, male_act, male_temp }) => {
  console.log("Female Activity Data:", fem_act);
  console.log("Male Activity Data:", male_act);

  // 1) Process data for light and dark phases.
  //    We'll accept a prefix = 'f' or 'm' so we look up f1..f13 or m1..m13.
  function calculatePhaseAveragesWithPrefix(data, prefix) {
    if (!data || data.length === 0) {
      console.error("No data provided to calculatePhaseAverages");
      return { light: 0, dark: 0 };
    }

    let lightSum = 0, lightCount = 0;
    let darkSum  = 0, darkCount  = 0;

    // Go through each row in the CSV
    data.forEach(row => {
      // Light phase columns: f1..f6 or m1..m6
      for (let i = 1; i <= 6; i++) {
        const colName = `${prefix}${i}`;   // e.g. "f1" or "m1"
        const val = parseFloat(row[colName]);
        if (!isNaN(val)) {
          lightSum += val;
          lightCount++;
        }
      }

      // Dark phase columns: f7..f13 or m7..m13
      for (let i = 7; i <= 13; i++) {
        const colName = `${prefix}${i}`;
        const val = parseFloat(row[colName]);
        if (!isNaN(val)) {
          darkSum += val;
          darkCount++;
        }
      }
    });

    console.log(`Light phase (${prefix}1–${prefix}6):`, { sum: lightSum, count: lightCount });
    console.log(`Dark phase  (${prefix}7–${prefix}13):`, { sum: darkSum, count: darkCount });

    return {
      light: lightCount > 0 ? lightSum / lightCount : 0,
      dark:  darkCount  > 0 ? darkSum / darkCount   : 0
    };
  }

  // 2) Calculate averages for female (f1–f13) and male (m1–m13)
  const femaleAverages = calculatePhaseAveragesWithPrefix(fem_act,  "f");
  const maleAverages   = calculatePhaseAveragesWithPrefix(male_act, "m");

  console.log("Female averages:", femaleAverages);
  console.log("Male averages:",   maleAverages);

  // 3) Create data array for the chart
  const chartData = [
    {
      phase: "Light",
      Female: femaleAverages.light,
      Male:   maleAverages.light
    },
    {
      phase: "Dark",
      Female: femaleAverages.dark,
      Male:   maleAverages.dark
    }
  ];

  console.log("Chart data:", chartData);

  // 4) Set up dimensions
  const margin = { top: 40, right: 80, bottom: 40, left: 60 },
        width  = 600 - margin.left - margin.right,
        height = 400 - margin.top  - margin.bottom;

  // Clear any existing SVG in the container
  d3.select("#mouse_activity_phases").selectAll("svg").remove();

  // Create SVG
  const svg = d3.select("#mouse_activity_phases")
    .append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // 5) Create scales
  const x = d3.scaleBand()
    .domain(["Light", "Dark"])
    .range([0, width])
    .padding(0.2);

  // Sub-band scale for Female vs. Male bars
  const x1 = d3.scaleBand()
    .domain(["Female", "Male"])
    .range([0, x.bandwidth()])
    .padding(0.05);

  // If your data can go above 40, you might want to dynamically compute the Y-domain, e.g.:
  const maxVal = d3.max(chartData, d => Math.max(d.Female, d.Male));
  const y = d3.scaleLinear()
    .domain([0, maxVal])  // or [0, 40] if you know your max is 40
    .nice()
    .range([height, 0]);

  // Color scale
  const color = d3.scaleOrdinal()
    .domain(["Female", "Male"])
    .range(["#6baed6", "#fb8072"]);

  // 6) Axes
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  // 7) Create grouped bars
  const phaseGroups = svg.selectAll(".phase-group")
    .data(chartData)
    .enter()
    .append("g")
      .attr("class", "phase-group")
      .attr("transform", d => `translate(${x(d.phase)}, 0)`);

  // For each phase, create two bars (Female, Male)
  phaseGroups.selectAll("rect")
    .data(d => ["Female", "Male"].map(gender => ({
      gender,
      value: d[gender]
    })))
    .join("rect")
      .attr("x", d => x1(d.gender))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.gender));

  // 8) Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Average Activity Levels During Light and Dark Phases");

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 15)
    .attr("text-anchor", "middle")
    .text("Average Activity Level");

  // 9) Legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 10}, 0)`);

  legend.append("text")
    .attr("x", 0)
    .attr("y", -5)
    .style("font-weight", "bold")
    .text("Gender");

  const legendItems = legend.selectAll(".legend-item")
    .data(["Female", "Male"])
    .enter()
    .append("g")
      .attr("class", "legend-item")
      .attr("transform", (_, i) => `translate(0,${i * 20 + 10})`);

  legendItems.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", color);

  legendItems.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .text(d => d);
});
