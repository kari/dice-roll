import * as rpgDiceRoller from '@dice-roller/rpg-dice-roller';

function roll(e:Event) {
    e.preventDefault();

    const input = (document.querySelector("div.dice-roller input") as HTMLInputElement).value;
    try {
        const roll = new rpgDiceRoller.DiceRoll(input);
        console.log(roll.output);
        
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

(function () {
        document.querySelector("form")!.addEventListener("submit", roll);
})();


