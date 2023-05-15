import * as rpgDiceRoller from '@dice-roller/rpg-dice-roller';
// import * as bootstrap from 'bootstrap'
import * as d3 from "d3";

const rollWorker = new Worker(new URL("worker.ts", import.meta.url), {type: 'module'}); // new URL for Parcel

function rollSubmit(e:Event) {
    e.preventDefault();

    const input = (document.querySelector("div.dice-roller input") as HTMLInputElement).value;
    try {
        const roll = new rpgDiceRoller.DiceRoll(input);
        console.log(roll.output);
        console.log(roll.export());

        rollWorker.postMessage(["roll", input]);
        
        var output = document.createElement('div');
        output.setAttribute("class", "alert alert-success");
        output.appendChild(document.createTextNode(roll.output));
        
        const results = document.querySelector("div.results")!
        const firstResult = results.firstChild;
        results.insertBefore(output, firstResult);

        // FIXME: remove elements from results if over X results

        // FIXME: delete or zero out histograms
        const height = 300;
        const width = 450;
        const margin = { top: 0, bottom: 20, left: 30, right: 20 };

        const svg = d3
            .select("div.histograms")
            .append("svg")
            .attr("viewBox", [0, 0, width, height])
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        /*
        https://medium.com/@louisemoxy/a-simple-way-to-make-d3-js-charts-svgs-responsive-7afb04bc2e4b
        https://d3-graph-gallery.com/graph/histogram_basic.html
        https://observablehq.com/@d3/histogram
        */

    } 
    catch(error) {
        console.error(error);
    }
}

document.querySelector("form")!.addEventListener("submit", rollSubmit);
rollWorker.onmessage = (e: MessageEvent) => {
    console.log("Got message from worker")
    const [ type, data ] = e.data;
    switch (type) {
        case "rollLog":
            console.log(data);
            // update histogram
            
    }
}