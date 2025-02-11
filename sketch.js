let particles = [];
let gridSpacing = 80;
let wavePhase = 0;
let isExploded = false;

class TextParticle {
  constructor(x, y) {
    this.baseX = x;
    this.baseY = y;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.scale = 1;
    this.targetScale = 1;
    this.angleOffset = random(TWO_PI);
    this.explodeForce = createVector(0, 0);
  }

  update() {
    if (!isExploded) {
      // 波浪运动:正弦波 + 噪声
      let wave = sin(wavePhase + this.angleOffset) * 20;
      let noiseVal = noise(this.baseX * 0.01, this.baseY * 0.01) * 30;
      this.pos.y = this.baseY + wave + noiseVal;
      
      // 动态缩放逻辑
      if (random() < 0.02) {
        this.targetScale = random(0.8, 1.2);
      }
      this.scale = lerp(this.scale, this.targetScale, 0.1);

      // 鼠标悬停交互
      let mouseDist = dist(mouseX, mouseY, this.pos.x, this.pos.y);
      if (mouseDist < 100) {
        let influence = map(mouseDist, 0, 100, 1.5, 0);
        this.pos.x += random(-3 * influence, 3 * influence);
        this.pos.y += random(-3 * influence, 3 * influence);
      }
    } else {
      // 爆炸运动
      this.vel.mult(0.98);
      this.pos.add(this.vel);
      this.scale *= 0.97;
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    scale(this.scale);
    
    // 文字样式:白字黑边
    fill(255);
    stroke(0);
    strokeWeight(2);
    textFont('sans-serif');
    textStyle(BOLD);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Unlimited", 0, 0);
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(24);
  
  // 初始化文字网格
  for (let x = gridSpacing/2; x < width; x += gridSpacing) {
    for (let y = gridSpacing/2; y < height; y += gridSpacing) {
      particles.push(new TextParticle(x, y));
    }
  }
}

function draw() {
  background(255);
  wavePhase += 0.05;

  particles.forEach(particle => {
    particle.update();
    particle.display();
  });
}

function mousePressed() {
  if (!isExploded) {
    isExploded = true;
    particles.forEach(p => {
      let explosionForce = p5.Vector.sub(p.pos, createVector(mouseX, mouseY));
      explosionForce.normalize().mult(random(5, 15));
      p.vel = explosionForce;
    });
  } else {
    isExploded = false;
    particles.forEach(p => {
      p.pos.set(p.baseX, p.baseY);
      p.scale = 1;
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}