import * as rpgDiceRoller from '@dice-roller/rpg-dice-roller';

const rollWorker = new Worker(new URL("worker.ts", import.meta.url), {type: 'module'}); // new URL for Parcel

function roll(e:Event) {
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
        
        const form = document.querySelector("form")!
        form.parentNode!.insertBefore(output, form.nextSibling);

    } 
    catch(error) {
        console.error(error);
    }
}

document.querySelector("form")!.addEventListener("submit", roll);
rollWorker.onmessage = (e: MessageEvent) => {
    console.log("Got message from worker")
    const [ type, data ] = e.data;
    switch (type) {
        case "rollLog":
            console.log(data);
            // create/update histogram
    }
}