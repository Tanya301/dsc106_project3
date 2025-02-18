import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { dataLoaded } from './global.js';

// Setup dimensions
const margin = {top: 30, right: 50, bottom: 50, left: 70};
const width = 1100 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define scales
const x = d3.scaleLinear()
    .domain([0, 1439])
    .range([0, width]);

const y = d3.scaleLinear()
    .domain([35, 39])
    .range([height, 0]);

// Add X axis
svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(formatMinutesToTime));

// Add Y axis
svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

// Add axis labels
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height + margin.bottom - 5)
    .text("Time of Day");

svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -height/2)
    .text("Temperature (°C)");

// Add light/dark cycle backgrounds
// Light period (7:00-19:00)
svg.insert("rect", ":first-child")
    .attr("x", x(420)) // 7:00
    .attr("y", 0)
    .attr("width", x(1140) - x(420)) // 19:00
    .attr("height", height)
    .attr("fill", "#FFEFBE")
    .attr("opacity", 0.2);

// Dark period (19:00-7:00)
// Evening (19:00-24:00)
svg.insert("rect", ":first-child")
    .attr("x", x(1140)) // 19:00
    .attr("y", 0)
    .attr("width", x(1439) - x(1140)) // Until end of day
    .attr("height", height)
    .attr("fill", "#E1F5FE")
    .attr("opacity", 0.2);

// Early morning (00:00-7:00)
svg.insert("rect", ":first-child")
    .attr("x", x(0)) // 00:00
    .attr("y", 0)
    .attr("width", x(420)) // Until 7:00
    .attr("height", height)
    .attr("fill", "#E1F5FE")
    .attr("opacity", 0.2);

// Global data variables
let femaleData = [];
let maleData = [];
let processedFemaleData = [];
let processedMaleData = [];

// Process data for a specific day
function processDataForDay(data, dayNum) {
    const startIdx = (dayNum - 1) * 1440;
    const endIdx = startIdx + 1440;
    return data.slice(startIdx, endIdx).map((row, idx) => {
        const temps = Object.values(row).filter(v => !isNaN(v));
        return {
            minute: idx,
            temp: d3.mean(temps)
        };
    });
}

// Calculate average data across all days
function calculateAverageData(data) {
    const averages = new Array(1440).fill(0).map(() => ({ sum: 0, count: 0 }));

    data.forEach((row, idx) => {
        const minuteOfDay = idx % 1440;
        const temps = Object.values(row).filter(v => !isNaN(v));

        if (temps.length > 0) {
            averages[minuteOfDay].sum += d3.mean(temps);
            averages[minuteOfDay].count++;
        }
    });

    return averages.map((avg, minute) => ({
        minute,
        temp: avg.count > 0 ? avg.sum / avg.count : null
    }));
}

// Update chart based on selected day and current time
function updateChart(minute, selectedDay) {
    svg.selectAll(".temp-line").remove();
    svg.selectAll(".current-time").remove();

    let femaleDisplayData, maleDisplayData;

    if (selectedDay === 'average') {
        femaleDisplayData = processedFemaleData;
        maleDisplayData = processedMaleData;
    } else {
        const dayNum = parseInt(selectedDay);
        femaleDisplayData = processDataForDay(femaleData, dayNum);
        maleDisplayData = processDataForDay(maleData, dayNum);
    }

    // Line generator
    const line = d3.line()
        .x(d => x(d.minute))
        .y(d => y(d.temp))
        .defined(d => d.temp != null);

    // Add female line
    svg.append("path")
        .datum(femaleDisplayData)
        .attr("class", "temp-line")
        .attr("fill", "none")
        .attr("stroke", "#FF6B6B")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add male line
    svg.append("path")
        .datum(maleDisplayData)
        .attr("class", "temp-line")
        .attr("fill", "none")
        .attr("stroke", "#4D96FF")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add current time indicator
    svg.append("line")
        .attr("class", "current-time")
        .attr("x1", x(minute))
        .attr("y1", 0)
        .attr("x2", x(minute))
        .attr("y2", height)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5");

    // Update time and light status
    updateTimeDisplay(minute);
}

// Format minutes to time string (HH:MM)
function formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Update time display and light status
function updateTimeDisplay(minute) {
    const timeStr = formatMinutesToTime(minute);
    document.getElementById("time-label").textContent = `Time: ${timeStr}`;

    const hourOfDay = Math.floor(minute / 60);
    const isLightOn = hourOfDay >= 7 && hourOfDay < 19;
    const lightStatus = document.getElementById("light-status");

    lightStatus.innerHTML = isLightOn ? "Light On <img src='lights_on.png' alt='Light On'style='width: 13px; vertical-align: middle;'>" : "Light Off  <img src='lights_off.png' alt='Light Off'style='width: 18px; vertical-align: middle;'>";
    lightStatus.className = `light-indicator ${isLightOn ? 'light-on' : 'light-off'}`;
}

// Initialize data
dataLoaded.then(data => {
    femaleData = data.fem_temp;
    maleData = data.male_temp;

    // Calculate averages
    processedFemaleData = calculateAverageData(femaleData);
    processedMaleData = calculateAverageData(maleData);

    // Initialize chart
    updateChart(0, 'average');
}).catch(error => {
    console.error("Error loading data:", error);
    document.querySelector('.description').textContent =
    'Error loading data. Please check the console for details.';
});

// Slider interaction
const slider = document.getElementById("time-slider");
slider.addEventListener("input", function() {
    const selectedDay = document.getElementById("day-select").value;
    updateChart(+this.value, selectedDay);
});

// Day selection
document.getElementById("day-select").addEventListener("change", function() {
    updateChart(+slider.value, this.value);
});

// Play/pause functionality
let animationId = null;
const playSpeed = 100; // Adjust this value to change animation speed

document.getElementById("play-btn").addEventListener("click", function() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        this.textContent = "Play";
    } else {
        this.textContent = "Pause";
        let lastTime = 0;

        function animate(currentTime) {
            if (lastTime === 0) lastTime = currentTime;
            const deltaTime = currentTime - lastTime;

            if (deltaTime > playSpeed) {
                slider.value = (+slider.value + 1) % 1440;
                const selectedDay = document.getElementById("day-select").value;
                updateChart(+slider.value, selectedDay);
                lastTime = currentTime;
            }

            if (+slider.value === 1439) {
                cancelAnimationFrame(animationId);
                animationId = null;
                document.getElementById("play-btn").textContent = "Play";
            } else {
                animationId = requestAnimationFrame(animate);
            }
        }

        animationId = requestAnimationFrame(animate);
    }
});

// Reset button
document.getElementById("reset-btn").addEventListener("click", function() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        document.getElementById("play-btn").textContent = "Play";
    }

    slider.value = 0;
    const selectedDay = document.getElementById("day-select").value;
    updateChart(0, selectedDay);
});

// Add tooltip interaction
const tooltip = d3.select("#tooltip");

svg
    .on("mousemove", function(event) {
        const [mouseX] = d3.pointer(event);
        const minute = Math.round(x.invert(mouseX));
        const selectedDay = document.getElementById("day-select").value;

        let femaleTemp, maleTemp;

        if (selectedDay === 'average') {
            femaleTemp = processedFemaleData[minute]?.temp;
            maleTemp = processedMaleData[minute]?.temp;
        } else {
            const dayIndex = (parseInt(selectedDay) - 1) * 1440 + minute;
            const femaleRow = femaleData[dayIndex];
            const maleRow = maleData[dayIndex];

            femaleTemp = femaleRow ? d3.mean(Object.values(femaleRow).filter(v => !isNaN(v))) : null;
            maleTemp = maleRow ? d3.mean(Object.values(maleRow).filter(v => !isNaN(v))) : null;
        }

        if (femaleTemp !== null || maleTemp !== null) {
            tooltip.style("opacity", 0.9)
                .html(`<strong>Time: ${formatMinutesToTime(minute)}</strong><br>` +
                `Female: ${femaleTemp ? femaleTemp.toFixed(2) : 'N/A'}°C<br>` +
                `Male: ${maleTemp ? maleTemp.toFixed(2) : 'N/A'}°C`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        }
    })
    .on("mouseout", function() {
        tooltip.style("opacity", 0);
    });
