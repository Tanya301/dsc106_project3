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

// - - - Navigation - - - //
const ARE_WE_HOME = document.documentElement.classList.contains('home');

let pages = [
    { url: '', title: 'Home' },
    { url: 'explore.html', title: 'Exploration' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    // Create link and add it to nav
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    if (a.host !== location.host) {
        a.target = '_blank';
    }
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
    nav.append(a);
}