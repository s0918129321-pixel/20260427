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
        // Loop through keypoints and draw circles
        for (let keypoint of hand.keypoints) {
          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }
          noStroke();

          // 將偵測到的座標映射到縮放且置中後的影像位置上
          let x = map(keypoint.x, 0, video.width, displayX, displayX + displayW);
          let y = map(keypoint.y, 0, video.height, displayY, displayY + displayH);
          circle(x, y, 16);
        }
      }
    }
  }
}
