const backgroundClr = '080d19';
const particlesClr1 = 'f72585';
const particlesClr2 = 'f2e9e4';
const particlesOpacity = 1;
const particleWeight = 3; // if 0 or less, will use the cell size
const trail = true;

const gridResolution = 100; // amount of grid cells along height and width
const particlesNum = 5000; // number of particles. Make sure it is smaller
                           // than gridResolution * gridResolution

const speed = 1; // movement speed of the particles as an inte

const dirRatio = 0.5; // proportion of particles going along the first direction
const dir1 = [0, 1]; // directions along which particles move
const dir2 = [1, 0];

const drawGrid = false; // debug functionality which draws the underlying grid


let grid = []
let cellX;
let cellY;

function setup() {
  if (particlesNum >= gridResolution * gridResolution) {
    throw "The number of pqrticles must be less than the number of cells"
  }

  createCanvas(1440, 1440);
  background(colorFromHex(backgroundClr));
  setSeed();

  // init the grid
  for (let i = 0; i < gridResolution * gridResolution; i++) {
    grid.push([]);
  }

  // compute cell width and height
  cellX = width / gridResolution;
  cellY = height / gridResolution;

  // scatter particles
  let j = 0;
  for (let i = 0; i < particlesNum; i++) {
    let pos = createVector(random(-width / 2, width / 2), random(-height / 2, height / 2));
    while (!checkIfCellEmpty(pos, -1)) {
      pos = createVector(random(-width / 2, width / 2), random(-height / 2, height / 2));
    }
    let p = createParticle(pos.x, pos.y);
    if (particleWeight > 0) {
      p.radius = particleWeight;
    }
    else {
      p.radius = cellX / 2;
    }
    
    // choose direction randomly and set color accordingly
    if (random() <= dirRatio) {
      p.color = colorFromHex(particlesClr1, particlesOpacity);
      p.velocity = createVector(dir1[0] * speed, dir1[1] * speed);
    }
    else {
      p.color = colorFromHex(particlesClr2, particlesOpacity);
      p.velocity = createVector(dir2[0] * speed, dir2[1] * speed);
    }
    // register cell
    registerCell(p, i, true);
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  if (!trail) {
    background(colorFromHex(backgroundClr));
  }

  // draw the collision grid
  if (drawGrid) {
    for (let i = 0; i < gridResolution; i++) {
      strokeWeight(0.5);
      line(0, i * cellY, width, i * cellY);
      line(i * cellX, 0, i * cellX, height);
    }
  }

  // move all particles from one direction 
  for (let  i = 0; i < getParticlesNum(); i++) {
    // retrieve i-th  particle
    let p = getParticle(i);

    // store current position as the previous position
    p.previousPosition = p.position();

    // to simplify the problem we only check the arrival position to see if we can move
    let new_pos = p.position().add(p.velocity);
    let wrap = false
    // wrap around borders
    if (Math.abs(new_pos.x) >= width / 2) {
      new_pos.x = -Math.sign(new_pos.x) * (width / 2 - 1);
      wrap = true;
    }
    if (Math.abs(new_pos.y) >= height / 2) {
      new_pos.y = -Math.sign(new_pos.y) * (height / 2 - 1);
      wrap = true;
    }

    if (checkIfCellEmpty(new_pos, i)) {
      // deregister previous cell
      registerCell(p, i, false);

      // move particle
      p.x = new_pos.x;
      p.y = new_pos.y;

      // register new cell
      registerCell(p, i, true);
    }

    // if the particle hasn't wrapped around, draw the trail
    // from previous position
    // else simply draw the particle
    if (trail && !wrap) {
      p.drawLastMove();
    }
    else {
      p.draw();
    }
  }
}


function getCell(pos) {
  let x = Math.floor((pos.x + width / 2) / cellX);
  let y = Math.floor((pos.y + height / 2) / cellY);

  return x * gridResolution + y;
}

function registerCell(pos, idx, register=true) {
  let cell = getCell(pos);

  if (register) {
    grid[cell].push(idx);
  }
  else {
    let k = grid[cell].indexOf(idx);
    grid[cell].splice(k, 1);
  }
}

function checkIfCellEmpty(pos, idx) {
  let cell = getCell(pos);

  if (cell >= grid.length || cell < 0) {
    print(cell, pos, idx)
  }
  
  // cell is considered empty if this particle is already in
  // it or the cell is truely empty
  return (grid[cell].length <= 0 || grid[cell].indexOf(idx) >= 0);
}