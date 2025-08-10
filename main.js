let cam;
let space = [];
let d, second, fps;

function setup() {
  createCanvas(screenWidth, screenHight);
  // Start facing diagonally right (45° yaw), with zero pitch
  cam = new Cam(0-screenWidth/2,0-screenHight/2,0,Math.PI/4,0);
  startMouseX = mouseX;
  startMouseY = mouseY;
  space = [];
  space[1] = new Qube(new Pos(300,300,300),100,100,100);
  space[2] = new Qube(new Pos(400,300,300),100,100,100);
  space[3] = new Qube(new Pos(500,300,300),50,100,10);
  space[4] = new Qube(new Pos(200,300,300),100,100,100);
  space[5] = new Qube(new Pos(200,300,600),100,100,100);
  space[6] = new Qube(new Pos(200,300,2000),10,10,1000);
  space[7] = new Qube(new Pos(250,400,550),100,100,100);
  space[8] = new Surface(new Pos(250,400,550),new Pos(20,400,550),new Pos(0,0,0));
  space[9] = new Sphere(new Pos(500,300,600), 100);
  space[10] = new Sphere(new Pos(700,300,600), 150);
  for(i=3;i<12;i++){
    for(ii=1;ii<10;ii++){
      space[i*10+ii] = new Qube(new Pos(ii*100,500,i*100),100,100,100);
    } 
  }
  d = new Date();
  second = d.getTime();
  fps = 0;
}

function mousePressed(){
  startMouseX = mouseX;
  startMouseY = mouseY;
}

function keyDown() {
  // Keyboard controls
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(KEY_D)) {
    cam.right();
  }
  if (keyIsDown(LEFT_ARROW) || keyIsDown(KEY_A)) {
    cam.left();
  }
  if (keyIsDown(UP_ARROW) || keyIsDown(KEY_W)) {
    cam.forward();
  }
  if (keyIsDown(DOWN_ARROW) || keyIsDown(KEY_S)) {
    cam.backward();
  }

  // Touch movement (left half): translate moveVecX/Y to strafing/forward
  if (typeof moveVecX !== 'undefined' && typeof moveVecY !== 'undefined' && !window.isMenuVisible()) {
    const strafe = moveVecX;
    const forward = -moveVecY; // up is negative y on screen
    // Apply scaled movement in camera plane
    const speed = flyspeed * 0.6; // slight reduction for touch precision
    // forward/back along viewx
    cam.x += speed * forward * Math.sin(cam.viewx);
    cam.z += speed * forward * Math.cos(cam.viewx);
    // strafe perpendicular to viewx
    cam.x += speed * strafe * Math.cos(cam.viewx);
    cam.z -= speed * strafe * Math.sin(cam.viewx);
  }
}

function mouseCalculations(){
  // If pointer locked, use relative deltas; otherwise preserve original behavior
  const menuVisible = typeof window.isMenuVisible === 'function' ? window.isMenuVisible() : false;
  if (!menuVisible && typeof mouseDX !== 'undefined' && typeof mouseDY !== 'undefined' && (document.pointerLockElement === canvas)) {
    cam.viewx += mouseDX / 500; // sensitivity
    cam.viewy += mouseDY / 500;
    mouseDX = 0;
    mouseDY = 0;
  } else if (!menuVisible && typeof touchLookDX !== 'undefined' && typeof touchLookDY !== 'undefined') {
    // Touch look (right half) when not in menu
    cam.viewx += touchLookDX / 300; // separate sensitivity for touch
    cam.viewy += touchLookDY / 300;
    touchLookDX = 0;
    touchLookDY = 0;
  }
  if(cam.viewy>Math.PI/2){
    cam.viewy = Math.PI/2;
  }else if (cam.viewy< 0-Math.PI/2){
    cam.viewy = 0-Math.PI/2;
  }
}

function draw() {
  d = new Date();
  if((d.getTime()-second)>=1000){
    print("FPS: "+fps);
    fps = d.getTime()-second-1000;
    second = d.getTime();
  };
  fps++;
  keyDown();
  mouseCalculations();
  space[4].rollAroundXAxis();
  space[4].rollAroundYAxis();
  space[4].rollAroundZAxis();
  space[9].rollAroundXAxis();
  space[9].rollAroundYAxis();
  space[9].rollAroundZAxis();
  clear();
  drawSpace = space.slice();
  drawSpace.sort(function(a, b){
      return b.getClosestPoint(cam).getRelVectorAmount(cam) - a.getClosestPoint(cam).getRelVectorAmount(cam);
    });
  drawSpace.forEach(function(e){
    e.draw(cam);
  });
}


