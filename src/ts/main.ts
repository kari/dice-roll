import * as d3 from "d3";
import * as rpgDiceRoller from '@dice-roller/rpg-dice-roller';

const rollWorker = new Worker(new URL("worker.ts", import.meta.url), {type: 'module'}); // new URL for Parcel

const height = 300;
const width = 450;
const margin = { top: 10, bottom: 15, left: 20, right: 15 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const insetLeft = 0.5;
const insetRight = 0.5;
var data = [];

const xScale = d3.scaleLinear()
    .domain([4, 24+1]) // FIXME: choose domain from data
    .range([margin.left, innerWidth]);

// FIXME: Normalize y scale to 100%
const yScale = d3.scaleLinear()
    .range([innerHeight, margin.top])
    .domain([0, 15000]); // FIXME: choose domain from data

const svg = d3
    .select("div.histograms")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", `max-width: ${width}`)

// create histogram chart area
svg.append("g")
    .attr("class", "chart")
    .attr("fill", "steelblue")

// plat y axis
svg.append("g")
    .attr("class", "yAxis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

// plot x axis
svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

function rollSubmit(e:Event) {
    e.preventDefault();

    const input = (document.querySelector("div.dice-roller input") as HTMLInputElement).value;
    try {
        const roll = new rpgDiceRoller.DiceRoll(input);
        // console.log(roll.output);
        console.log(roll.export());
        // FIXME: use roll.min/maxTotal for histogram domain

        // FIXME: delete or zero out histograms
        data = [];
        rollWorker.postMessage(["roll", input]);
        
        var output = document.createElement('div');
        output.setAttribute("class", "alert alert-success");
        output.appendChild(document.createTextNode(roll.output));
        
        const results = document.querySelector("div.results")!
        const firstResult = results.firstChild;
        results.insertBefore(output, firstResult);

        // FIXME: remove elements from results if over X results

    } 
    catch(error) {
        console.error(error);
    }
}

function updateHistogram(newData) {   
    // const data = Array.from({length: 100}, d3.randomInt(0,10));
    data = data.concat(newData);

    const bins = d3.bin().thresholds(20).value(d => d)(data); // FIXME: calculate thresholds
    // FIXME: normalize data to 100%

    d3.select("div.histograms svg g.chart")
        .selectAll("rect")
        .data(bins)
        .join(
            enter => enter.append("rect"),
            update => update,
            exit => exit.remove()
        )
        .attr("y", d => yScale(d.length))
        .attr("height", d => yScale(0) - yScale(d.length))
        .attr("x", d => xScale(d.x0!) + insetLeft)
        .attr("width", d => Math.max(0, xScale(d.x1!) - xScale(d.x0!) - insetLeft - insetRight));

        // FIXME: update axis
}

document.querySelector("form")!.addEventListener("submit", rollSubmit);
rollWorker.onmessage = (e: MessageEvent) => {
    console.log("Got message from worker")
    const [ type, data ] = e.data;
    switch (type) {
        case "rollLog":
            // console.log(data);
            // update histogram
            updateHistogram(data); 
    }
}
