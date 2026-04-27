// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let bubbles = []; // 儲存所有產生的水泡

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // 使用全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  // 計算顯示影像的寬高 (全螢幕的 50%)
  let displayW = width * 0.5;
  let displayH = height * 0.5;
  // 計算置中座標
  let displayX = (width - displayW) / 2;
  let displayY = (height - displayH) / 2;

  // 繪製影像到視窗中間
  image(video, displayX, displayY, displayW, displayH);

  // 在畫布中間加上文字
  fill(0); // 文字顏色為黑色
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  text('413737080邱o晴', width / 2, height * 0.1);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 先將所有關鍵點座標映射到縮放且置中後的畫布位置
        let points = hand.keypoints.map(kp => ({
          x: map(kp.x, 0, video.width, displayX, displayX + displayW),
          y: map(kp.y, 0, video.height, displayY, displayY + displayH)
        }));

        // 根據左右手設定顏色
        if (hand.handedness == "Left") {
          fill(255, 0, 255);
          stroke(255, 0, 255);
        } else {
          fill(255, 255, 0);
          stroke(255, 255, 0);
        }

        // 定義要串連的關鍵點編號組
        let fingerPaths = [
          [0, 1, 2, 3, 4],     // 大拇指
          [5, 6, 7, 8],        // 食指
          [9, 10, 11, 12],     // 中指
          [13, 14, 15, 16],    // 無名指
          [17, 18, 19, 20]     // 小指
        ];

        // 繪製線條
        strokeWeight(4);
        for (let path of fingerPaths) {
          for (let i = 0; i < path.length - 1; i++) {
            let p1 = points[path[i]];
            let p2 = points[path[i + 1]];
            line(p1.x, p1.y, p2.x, p2.y);
          }
        }

        // 繪製圓點
        noStroke();
        for (let p of points) {
          circle(p.x, p.y, 16);
        }

        // 在編號 4, 8, 12, 16, 20 的位置產生水泡
        let tipIndices = [4, 8, 12, 16, 20];
        if (frameCount % 5 == 0) { // 每 5 幀產生一次，避免過多
          for (let idx of tipIndices) {
            bubbles.push(new Bubble(points[idx].x, points[idx].y));
          }
        }
      }
    }
  }

  // 更新並繪製所有水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    // 如果水泡透明度太低或上升太高，就讓它「破掉」（移除）
    if (bubbles[i].isFinished()) {
      bubbles.splice(i, 1);
    }
  }
}

// 水泡類別定義
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.startY = y; // 記錄起始點
    this.r = random(5, 12); // 水泡半徑
    this.speed = random(1, 3); // 上升速度
    this.alpha = 200; // 初始透明度
    this.drift = random(-0.5, 0.5); // 左右飄移感
  }

  update() {
    this.y -= this.speed; // 往上串升
    this.x += this.drift; // 輕微左右晃動
    this.alpha -= 2; // 隨著上升逐漸變透明
  }

  display() {
    stroke(255, this.alpha);
    strokeWeight(1);
    fill(255, this.alpha * 0.3); // 半透明填充
    circle(this.x, this.y, this.r * 2);
    
    // 加上一個白色反光點，增加水泡感
    noStroke();
    fill(255, this.alpha * 0.8);
    circle(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.4);
  }

  isFinished() {
    // 當上升超過 150 像素或透明度歸零，視為破掉
    return (this.startY - this.y > 150) || (this.alpha <= 0);
  }
}
