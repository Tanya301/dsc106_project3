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

// Get the directory path from the current URL
const currentPath = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    
    // Construct the correct URL by combining current directory path with the page URL
    url = currentPath + url;
    
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    
    if (a.host !== location.host) {
        a.target = '_blank';
    }
    
    // Check if this is the current page
    if (a.host === location.host && location.pathname === a.pathname) {
        a.classList.add('current');
    }
    
    nav.append(a);
}