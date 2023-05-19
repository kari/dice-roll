import * as d3 from "d3";
import * as rpgDiceRoller from '@dice-roller/rpg-dice-roller';

const rollWorker = new Worker(new URL("worker.ts", import.meta.url), {type: 'module'}); // new URL for Parcel

const height = 300;
const width = 450*3;
const margin = { top: 10, bottom: 15, left: 50, right: 15 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const insetLeft = 0.5;
const insetRight = 0.5;
var data: Array<number> = [];

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

// plot x axis
svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(0, ${innerHeight})`)

// plot right y axis
svg.append("g")
    .attr("class", "yAxisRight")
    .attr("transform", `translate(${innerWidth},0)`)


function rollSubmit(e:Event) {
    e.preventDefault();

    const input = (document.querySelector("div.dice-roller input") as HTMLInputElement).value;
    try {
        const roll = new rpgDiceRoller.DiceRoll(input);

        // console.log(roll.export());

        data = []; // zero out histogram
        rollWorker.postMessage(["roll", input]);
        
        var output = document.createElement('div');
        output.setAttribute("class", "alert alert-success");
        output.appendChild(document.createTextNode(roll.output));
        
        const results = document.querySelector("div.results")!
        const firstResult = results.firstChild;
        results.insertBefore(output, firstResult);

        if (results.childElementCount > 5) {
            for (let i = 5; i < results.childElementCount; i++) results.children[i].remove();
        }

    } 
    catch(error) {
        console.error(error);
    }
}

function updateHistogram(newData: Array<number>) {   
    data = data.concat(newData);

    const bins = d3.bin().thresholds(d3.max(data)! - d3.min(data)!).value(d => d)(data);
    const Y = Array.from(bins, b => b.length);
    const total = d3.sum(Y);
    for (let i = 0; i < Y.length; ++i) Y[i] /= total;
    const cumY = d3.map(d3.cumsum(Y), x => 1-x);

    const xScale = d3.scaleLinear()
        .domain([bins[0].x0 as number, bins[bins.length - 1].x1 as number])
        .range([margin.left, innerWidth]);

    const yScale = d3.scaleLinear()
        .range([innerHeight, margin.top])
        .domain([0, d3.max(Y)!]);

    const yCumScale = d3.scaleLinear()
        .range([innerHeight, margin.top])
        .domain([0, 1]);

    const cdfLine = d3.line()
        .curve(d3.curveStep)
        .x(d => xScale(d.x0))
        .y((_d, i) => yCumScale(cumY[i]))     

    d3.select("div.histograms svg g.chart")
        .selectAll("rect")
        .data(bins)
        .join(
            enter => enter.append("rect"),
            update => update,
            exit => exit.remove()
        )
        .attr("y", (_d, i) => yScale(Y[i]))
        .attr("height", (_d, i) => yScale(0) - yScale(Y[i]))
        .attr("x", d => xScale(d.x0!) + insetLeft)
        .attr("width", d => Math.max(0, xScale(d.x1!) - xScale(d.x0!) - insetLeft - insetRight));

    d3.select("div.histograms svg g.chart")
        .selectAll("path")
        .data(bins)
        .join(
            enter => enter.append("path"),
            update => update,
            exit => exit.remove()
        )
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", cdfLine(bins)); // doesn't work without explicilty having bins here

    svg.select("g.xAxis")
        .call(d3.axisBottom(xScale));

    svg.select("g.yAxis")
        .call(d3.axisLeft(yScale));

    svg.select("g.yAxisRight")
        .call(d3.axisRight(yCumScale));

}

document.querySelector("form")!.addEventListener("submit", rollSubmit);
rollWorker.onmessage = (e: MessageEvent) => {
    // console.log("Got message from worker")
    const [ type, data ] = e.data;
    switch (type) {
        case "rollLog":
            updateHistogram(data); 
    }
}
