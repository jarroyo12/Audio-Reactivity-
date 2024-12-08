
let grid = []; 
let cols = 12;
let rows = 12;

//current and next wave starting point 
let currentWaveStart = null;
let nextWaveStart = null; 

//radius of current and next wave 
let currentWaveRadius = 0;
let nextWaveRadius = 0;

let waveSpeed = 0.05;

//between waves 
let transition = 0; 

let song;
let fft;

function preload() {
  song = loadSound("media/wind.mp3");
}


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); 

  song.play();
  fft = new p5.FFT();

  cols = width / 50;
  rows = height/ 50;

  // set first wave to start 
  currentWaveStart = createVector(floor(random(cols)), floor(random(rows)));
  nextWaveStart = createVector(floor(random(cols)), floor(random(rows)));
}

function draw() {
  background(255);

  let spectrum = fft.analyze();
  console.log(spectrum);

  // energy of the "mid" frequency range to control wave speed 
  let energy = fft.getEnergy("treble");
  let smoothingFactor = 0.001;
  let energySpeed = map(energy, 0, 255, 0, 2);
  waveSpeed = lerp(smoothingFactor, energySpeed, 0.2);
  
  //expand wave 
  currentWaveRadius += waveSpeed;
  nextWaveRadius += waveSpeed;

  // find max distance from the wave start to any corner 
  let maxDist = dist(0, 0, cols - 1, rows - 1) / 2;

  //transition 
  transition += waveSpeed / maxDist;
  if (transition > 1) {
    transition = 0;
    currentWaveStart = nextWaveStart;
    nextWaveStart = createVector(floor(random(cols)), floor(random(rows)));
    currentWaveRadius = nextWaveRadius;
    nextWaveRadius = 0;
  }

  //draw grid tiles 
  push();

  translate(-cols * 25, -rows * 25, 0);
  drawSingleGrid();

  pop();
}

function drawSingleGrid() {
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {

      push();

      translate(i * 50, j * 50, 0);
      // distances from both current and next wave start points 
      let distFromCurrent = dist(currentWaveStart.x, currentWaveStart.y, i, j);
      let distFromNext = dist(nextWaveStart.x, nextWaveStart.y, i, j);
      
      //sine wave effect for both waves based on distance and wave radius 
      let currentWaveEffect = sin((distFromCurrent - currentWaveRadius) * 0.5);
      currentWaveEffect = map(currentWaveEffect, -1, 1, 0, 1);

      let nextWaveEffect = sin((distFromNext - nextWaveRadius) * 0.5);
      nextWaveEffect = map(nextWaveEffect, -1, 1, 0, 1);

      //b;end two wave effects based on transition 
      let blendedEffect = lerp(currentWaveEffect, nextWaveEffect, transition);

      let size = map(blendedEffect, 0, 1, 15, 30);
      let animateColor = map(blendedEffect, 0, 1, 0, 255);

      let color1 = color(animateColor, 50, 255);
      let color2 = color(animateColor, 255, 255, 150);
      let col = lerpColor(color1, color2, blendedEffect);
      fill(col);

      let rotationAmt = map(blendedEffect, 0, 1, 0, PI);
      rotateX(rotationAmt);
      rotateY(rotationAmt);

      noStroke();
      ellipsoid(size, 100, 200);

      pop();
    }
  }
}


