var screenHight = 700;
var screenWidth = 900;
var fovAngle = 90;
var fov = Math.tan(fovAngle/2)*screenWidth/2;
var flyspeed = 5;
var elementRotSpeed = 0.01;


class Pos {
	constructor(x,y,z){
		this.x = x;
		this.y = y;
		this.z = z;
	
	}
	isPointinfrontCam(camPos){
		if(camPos){
			return this.screenPosX(camPos)>0 && this.screenPosX(camPos)<screenWidth &&
				this.screenPosY(camPos)>0 && this.screenPosY(camPos)<screenHight;
		}
	}
	
	getVectorAmount(){
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	}
	getRelVectorAmount(){
		return Math.sqrt(this.relx*this.relx + this.rely*this.rely + this.relz*this.relz);
	}
	
	getPosRelativToCam(cam){
		this.relx  = this.x - cam.x - screenWidth/2;
		this.rely = this.y - cam.y - screenHight/2;
		this.relz = this.z - cam.z;
		
		this.relxs = this.relx * Math.cos(cam.viewx) - this.relz * Math.sin(cam.viewx);
		this.relzs = this.relz * Math.cos(cam.viewx) + this.relx * Math.sin(cam.viewx);
		
		this.relz = this.relzs;
		this.relys = this.rely * Math.cos(cam.viewy) - this.relz * Math.sin(cam.viewy);
		this.relzs = this.relz * Math.cos(cam.viewy) + this.rely * Math.sin(cam.viewy);	
		
		this.relx = this.relxs;
		this.relz = this.relzs;
		this.rely = this.relys;
		
	}
	
	screenPosX(camPos){
		this.getPosRelativToCam(camPos);
		if(camPos){
			if(this.relz<=0){
				this.relz = 0.01;
			}
			return this.relx * fov / this.relz + screenWidth/2;
		}
	}
	screenPosY (camPos) {
		if(camPos){
			if(this.relz<=0){
				this.relz = 0.01;
			}
			return this.rely * fov / this.relz + screenHight/2;
		}
	}
} 

class Cam extends Pos {
	constructor(x,y,z, viewx, viewy){
		super(x,y,z);
		this.viewx = viewx;
		this.viewy = viewy;
	
	}
	
	forward(){
		this.x += flyspeed * Math.sin(this.viewx);
		this.z += flyspeed * Math.cos(this.viewx);
		this.y += flyspeed * Math.sin(this.viewy);
	}
	backward(){
		this.x -= flyspeed * Math.sin(this.viewx);
		this.z -= flyspeed * Math.cos(this.viewx);
		this.y -= flyspeed * Math.sin(this.viewy);
	}
	right(){
		this.x += flyspeed * Math.cos(this.viewx);
		this.z -= flyspeed * Math.sin(this.viewx);
	}
	left(){
		this.x -= flyspeed * Math.cos(this.viewx);
		this.z += flyspeed * Math.sin(this.viewx);
	}
}

class SpaceObj {
	constructor(){
		this.points = [];
	}
	getClosestPoint(cam){
		var ret = this.points.slice();
		ret.sort(function(a, b){
			return a.getRelVectorAmount(cam) - b.getRelVectorAmount(cam);
		});
		return ret[0];
	}
	connectPoint(p1, p2, cam){
		line(p1.screenPosX(cam), p1.screenPosY(cam), p2.screenPosX(cam), p2.screenPosY(cam));
	}
	rollAroundXAxis(){
		
		this.points.forEach(function(e){
			var tmpz = (e.z - this.centerPos.z) * Math.cos(elementRotSpeed) - (e.y - this.centerPos.y) * Math.sin(elementRotSpeed);
			var tmpy = (e.y - this.centerPos.y) * Math.cos(elementRotSpeed) + (e.z - this.centerPos.z) * Math.sin(elementRotSpeed);
			e.z = tmpz+this.centerPos.z;
			e.y = tmpy+this.centerPos.y;
		}, this);
		
	}
	rollAroundYAxis(){
		
		this.points.forEach(function(e){
			var tmpz = (e.z - this.centerPos.z) * Math.cos(elementRotSpeed) - (e.x - this.centerPos.x) * Math.sin(elementRotSpeed);
			var tmpx = (e.x - this.centerPos.x) * Math.cos(elementRotSpeed) + (e.z - this.centerPos.z) * Math.sin(elementRotSpeed);
			e.z = tmpz+this.centerPos.z;
			e.x = tmpx+this.centerPos.x;
		}, this);
		
	}
	rollAroundZAxis(){
		
		this.points.forEach(function(e){
			var tmpy = (e.y - this.centerPos.y) * Math.cos(elementRotSpeed) - (e.x - this.centerPos.x) * Math.sin(elementRotSpeed);
			var tmpx = (e.x - this.centerPos.x) * Math.cos(elementRotSpeed) + (e.y - this.centerPos.y) * Math.sin(elementRotSpeed);
			e.y = tmpy+this.centerPos.y;
			e.x = tmpx+this.centerPos.x;
		}, this);
		
	}
}

class Surface extends SpaceObj{
	constructor(a, b, c){
		super();
		this.points[0] = a; 
		this.points[1] = b; 
		this.points[2] = c; 
		
	}
	draw(cam){
		noFill();
		fill(200);
		triangle(this.points[0].screenPosX(cam), this.points[0].screenPosY(cam),
			this.points[1].screenPosX(cam), this.points[1].screenPosY(cam),
			this.points[2].screenPosX(cam), this.points[2].screenPosY(cam));
	}
}


class Sphere extends SpaceObj{
	constructor(centerPos, radius){
		super();
		this.centerPos = centerPos;
		this.radius = radius;	
		var pointCount = 0;
		var amoutOfBelts = 12;
		this.points[pointCount] = new Pos(centerPos.x, centerPos.y + radius, centerPos.z);
		pointCount++;
		var tranglesPerBelt = (amoutOfBelts)*2;
		var tranglesPerBeltConst = (amoutOfBelts)*2;
		for(var ii=1;ii<= amoutOfBelts;ii++){
			var tmpRadius = this.radius * Math.sin((Math.PI/(amoutOfBelts)*(ii)));
			var tmpHeitghRadius = this.radius * Math.cos((Math.PI/(amoutOfBelts)*(ii)));
			
			print(tranglesPerBelt);
			var direction = 0;
			
			for(var iii=0;iii < tranglesPerBelt; iii++){
				
				var x = tmpRadius * Math.cos(direction);
				var z = tmpRadius * Math.sin(direction);
				this.points[pointCount] = new Pos(centerPos.x+x, centerPos.y+tmpHeitghRadius, centerPos.z+z);
				pointCount++;
				direction += (2 * Math.PI)/tranglesPerBelt;
			}
			
		}
		this.points[pointCount] = new Pos(centerPos.x, centerPos.y - this.radius, centerPos.z);
		print(this.points);
		var top = 0;
		this.surf = [];
		var pointCount = 0;
		var thisTriangle = 0;
		for(var ii=0;ii<tranglesPerBelt;ii++){
			if(ii+1<tranglesPerBelt){
				this.surf[pointCount] = new Surface(this.points[top], this.points[ii+1], this.points[ii+2]);
			}else{
				this.surf[pointCount] = new Surface(this.points[top], this.points[ii+1], this.points[ii+2-tranglesPerBelt]);
			}
			pointCount++;
		}
		for(var ii=1;ii<= amoutOfBelts-1;ii++){
			thisTriangle = tranglesPerBelt +thisTriangle;
			print(thisTriangle+" : "+tranglesPerBelt)
			for(var iii=0;iii < tranglesPerBelt ; iii++){
				if(typeof this.points[(thisTriangle-iii)+tranglesPerBeltConst] != 'undefined'){
					var a = (thisTriangle-iii)+tranglesPerBeltConst;
					var b = a+1;
					var c = a+2;
					var thisTriangleNow = (thisTriangle-iii);
					pointCount++;
					
					if(iii!=0){
						this.surf[pointCount] = new Surface(this.points[thisTriangleNow], this.points[a], this.points[b]);
						pointCount++;
						this.surf[pointCount] = new Surface(this.points[thisTriangleNow], this.points[thisTriangleNow+1], this.points[b]);
					}else{
						this.surf[pointCount] = new Surface(this.points[thisTriangleNow], this.points[a], this.points[b-tranglesPerBelt]);
						pointCount++;
						this.surf[pointCount] = new Surface(this.points[thisTriangleNow], this.points[thisTriangleNow-tranglesPerBelt+1], this.points[b-tranglesPerBelt]);
					}
					pointCount++;
					print( thisTriangleNow+ " : ("+ a+" : "+b+" : "+c+")");
				}
			}
		}
		
	}
	draw(cam){
		if(this.points.some(function(e){
			return e.isPointinfrontCam(this);
			}, cam)){
				var drawSurf = this.surf.slice();
				drawSurf.sort(function(a, b){
					return b.getClosestPoint(cam).getRelVectorAmount(cam) - a.getClosestPoint(cam).getRelVectorAmount(cam);
				});
				drawSurf.forEach(function(e,index, array){
					e.draw(cam);
			},this);
		}
	}
	
	
}
class Qube extends SpaceObj{
	constructor(centerPos, widht, height, depth){
		super();
		this.centerPos = centerPos;
		this.points[0] = new Pos(centerPos.x - widht/2, centerPos.y + height/2, centerPos.z - depth/2); 
		this.points[1] = new Pos(centerPos.x + widht/2, centerPos.y + height/2, centerPos.z - depth/2); 
		this.points[2] = new Pos(centerPos.x + widht/2, centerPos.y - height/2, centerPos.z - depth/2); 
		this.points[3] = new Pos(centerPos.x - widht/2, centerPos.y - height/2, centerPos.z - depth/2); 
		this.points[4] = new Pos(centerPos.x - widht/2, centerPos.y + height/2, centerPos.z + depth/2); 
		this.points[5] = new Pos(centerPos.x + widht/2, centerPos.y + height/2, centerPos.z + depth/2); 
		this.points[6] = new Pos(centerPos.x + widht/2, centerPos.y - height/2, centerPos.z + depth/2); 
		this.points[7] = new Pos(centerPos.x - widht/2, centerPos.y - height/2, centerPos.z + depth/2); 
	
	}	
	
	draw(cam){
		if(this.points.some(function(e){
			return e.isPointinfrontCam(this);
			}, cam)){
			this.connectPoint(this.points[0], this.points[1], cam);
			this.connectPoint(this.points[0], this.points[4], cam);
			this.connectPoint(this.points[1], this.points[2], cam);
			this.connectPoint(this.points[1], this.points[5], cam);
			this.connectPoint(this.points[2], this.points[3], cam);
			this.connectPoint(this.points[2], this.points[6], cam);
			this.connectPoint(this.points[3], this.points[7], cam);
			this.connectPoint(this.points[3], this.points[0], cam);
			this.connectPoint(this.points[4], this.points[5], cam);
			this.connectPoint(this.points[5], this.points[6], cam);
			this.connectPoint(this.points[6], this.points[7], cam);
			this.connectPoint(this.points[7], this.points[4], cam);
		}
	}
}

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
		
	drawSpace.forEach(function(e){;
		e.draw(cam);});
}