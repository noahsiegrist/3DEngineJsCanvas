let cam;
let space = [];
let d, second, fps;

function setup() {
  createCanvas(screenWidth, screenHight);
  cam = new Cam(0-screenWidth/2,0-screenHight/2,0,0,0);
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
  if (keyIsDown(RIGHT_ARROW)) {
    cam.right();
  }
  if (keyIsDown(LEFT_ARROW)) {
    cam.left();
  }
  if (keyIsDown(UP_ARROW)) {
    cam.forward();
  }
  if (keyIsDown(DOWN_ARROW)) {
    cam.backward();
  }
}

function mouseCalculations(){
  cam.viewx = (mouseX - startMouseX ) / 100;
  cam.viewy = (mouseY - startMouseY ) / 100;
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


