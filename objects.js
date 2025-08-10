class SpaceObj {
  constructor() {
    this.points = [];
  }
  getClosestPoint(cam) {
    var ret = this.points.slice();
    ret.sort(function(a, b){
      return a.getRelVectorAmount(cam) - b.getRelVectorAmount(cam);
    });
    return ret[0];
  }
  connectPoint(p1, p2, cam) {
    line(p1.screenPosX(cam), p1.screenPosY(cam), p2.screenPosX(cam), p2.screenPosY(cam));
  }
  rollAroundXAxis() {
    this.points.forEach(function(e){
      var tmpz = (e.z - this.centerPos.z) * Math.cos(elementRotSpeed) - (e.y - this.centerPos.y) * Math.sin(elementRotSpeed);
      var tmpy = (e.y - this.centerPos.y) * Math.cos(elementRotSpeed) + (e.z - this.centerPos.z) * Math.sin(elementRotSpeed);
      e.z = tmpz+this.centerPos.z;
      e.y = tmpy+this.centerPos.y;
    }, this);
  }
  rollAroundYAxis() {
    this.points.forEach(function(e){
      var tmpz = (e.z - this.centerPos.z) * Math.cos(elementRotSpeed) - (e.x - this.centerPos.x) * Math.sin(elementRotSpeed);
      var tmpx = (e.x - this.centerPos.x) * Math.cos(elementRotSpeed) + (e.z - this.centerPos.z) * Math.sin(elementRotSpeed);
      e.z = tmpz+this.centerPos.z;
      e.x = tmpx+this.centerPos.x;
    }, this);
  }
  rollAroundZAxis() {
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


