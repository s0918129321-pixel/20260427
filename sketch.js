// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

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
      }
    }
  }
}
