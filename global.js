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