import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let fem_act = null;
let fem_temp = null;
let male_act = null;
let male_temp = null;

// Create a Promise that resolves when all data is loaded
export const dataLoaded = Promise.all([
    d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Fem Act.csv").then(data => { fem_act = data; }),
    d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Fem Temp.csv").then(data => { fem_temp = data; }),
    d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Male Act.csv").then(data => { male_act = data; }),
    d3.csv("./data/Mouse_Data_Student_Copy.xlsx - Male Temp.csv").then(data => { male_temp = data; })
]).then(() => ({ fem_act, fem_temp, male_act, male_temp }));
