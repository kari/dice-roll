import * as rpgDiceRoller from '@dice-roller/rpg-dice-roller';

const MAX_SAMPLES = 100000;
const ITERATION_TIME = 100;

self.onmessage = (e: MessageEvent) => {
    // console.log("Message recieved from main thread");
    // FIXME: cache results
    const [ type, data ] = e.data;
    switch (type) {
        case "roll": // start simulation and feed back results to histogram
            simulate(data);
    }
}

// initialize a empty cancel function
let cancel = () => {}; 

function simulate(data: string) {
    // console.log(`Starting a simulation for ${data}`);
    cancel(); // cancel existing simulation, if it exists
    const roller = new rpgDiceRoller.DiceRoller();
    roll(roller, data, 0);
}

function roll(roller: rpgDiceRoller.DiceRoller, rollStr: string, sampleCount: number) {
    const endOn = performance.now() + ITERATION_TIME;
    while (true) {
        roller.roll(rollStr);
        sampleCount += 1;
        if (sampleCount >= MAX_SAMPLES) break;
        if (performance.now() >= endOn) break;
    }
    self.postMessage(["rollLog", roller.log.map(r => r.total)]); // FIXME: Only really need frequency of totals
    roller.clearLog();
    if (sampleCount < MAX_SAMPLES) {
        const timeoutID = setTimeout(roll, 0, roller, rollStr, sampleCount);
        cancel = () => { clearTimeout(timeoutID); }
    }
}