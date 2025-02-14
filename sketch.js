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
      // 横向贯穿运动
      this.pos.x += 2; // 持续向右移动
      
      // 当移出屏幕右侧时，从左侧随机Y轴位置重新进入
      if (this.pos.x > width + 50) {
        this.pos.x = -50;
        this.pos.y = random(50, height - 50); // 在屏幕高度范围内随机选择新的Y轴位置
        this.baseY = this.pos.y; // 更新基准Y轴位置
      }
      
      // 波浪运动:正弦波 + 噪声
      let wave = sin(wavePhase + this.angleOffset) * 15;
      let noiseVal = noise(this.pos.x * 0.01, this.baseY * 0.01) * 20;
      this.pos.y = this.baseY + wave + noiseVal;
      
      // 动态缩放逻辑
      if (random() < 0.02) {
        this.targetScale = random(0.8, 1.2);
      }
      this.scale = lerp(this.scale, this.targetScale, 0.1);

      // 鼠标避让交互
      if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        let mouseDist = dist(mouseX, mouseY, this.pos.x, this.pos.y);
        if (mouseDist < 100) {
          // 计算从鼠标指向文字的方向向量
          let repelForce = p5.Vector.sub(this.pos, createVector(mouseX, mouseY));
          repelForce.normalize();
          
          // 根据距离计算推力强度和缩放比例
          let strength = map(mouseDist, 0, 100, 8, 0);
          let scaleInfluence = map(mouseDist, 0, 100, 0.5, 1);
          
          // 应用推力和缩放
          this.pos.add(repelForce.mult(strength));
          this.targetScale = scaleInfluence;
        }
      } else {
        // 鼠标移出窗口时，重置缩放比例
        this.targetScale = 1;
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
  // 使用半透明背景实现残影效果
  background(255, 25);
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