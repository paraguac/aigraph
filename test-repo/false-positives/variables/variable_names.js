/**
 * Variable Names That Look Like AI - False Positive Test
 * Variable and class names that coincidentally match AI terms.
 */

class Claude {
  constructor(name) {
    this.name = name;
    this.occupation = 'Artist';
  }
  
  introduce() {
    return `Hello, I'm ${this.name}`;
  }
}

class Gemini {
  constructor(birthDate) {
    this.zodiacSign = 'Gemini';
    this.birthDate = birthDate;
  }
  
  getHoroscope() {
    return 'Geminis are adaptable and versatile';
  }
}

// Variables with AI-sounding names
const claude = { name: 'Claude Monet', profession: 'Painter' };
const gemini = { constellation: 'Twins', month: 'May-June' };
const mistral = { type: 'Wind', region: 'Mediterranean' };
const llama = { species: 'Lama glama', habitat: 'Andes' };
const titan = { moon: 'Saturn', discovered: 1655 };
const palm = { tree: 'Arecaceae', height: 20 };

// Functions with coincidental AI term names
function gptProcessor(data) {
  // GPT = General Purpose Transform, not the AI model
  return data.map(x => x * 2);
}

function o1Sort(array) {
  // O(1) lookup, not O1 model
  const lookup = new Map();
  array.forEach(item => lookup.set(item.id, item));
  return lookup;
}

function falconCheck(data) {
  // Checking for a bird species called Falcon
  return data.species === 'Falcon';
}

function phiRatio() {
  // Golden ratio phi (φ), not Phi model
  return 1.618033988749;
}

export { Claude, Gemini, gptProcessor, o1Sort, falconCheck, phiRatio };
