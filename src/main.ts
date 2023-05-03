import * as rpgDiceRoller from 'npm:@dice-roller/rpg-dice-roller';

const roll = new rpgDiceRoller.DiceRoll('4d6');
console.log(roll.total);
