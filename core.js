class Pos {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  isPointinfrontCam(camPos) {
    if (camPos) {
      return this.screenPosX(camPos) > 0 && this.screenPosX(camPos) < screenWidth &&
             this.screenPosY(camPos) > 0 && this.screenPosY(camPos) < screenHight;
    }
  }

  getVectorAmount() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
  }
  getRelVectorAmount() {
    return Math.sqrt(this.relx*this.relx + this.rely*this.rely + this.relz*this.relz);
  }

  getPosRelativToCam(cam) {
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

  screenPosX(camPos) {
    this.getPosRelativToCam(camPos);
    if (camPos) {
      if (this.relz <= 0) {
        this.relz = 0.01;
      }
      return this.relx * fov / this.relz + screenWidth/2;
    }
  }
  screenPosY(camPos) {
    if (camPos) {
      if (this.relz <= 0) {
        this.relz = 0.01;
      }
      return this.rely * fov / this.relz + screenHight/2;
    }
  }
}

class Cam extends Pos {
  constructor(x, y, z, viewx, viewy) {
    super(x, y, z);
    this.viewx = viewx;
    this.viewy = viewy;
  }

  forward() {
    this.x += flyspeed * Math.sin(this.viewx);
    this.z += flyspeed * Math.cos(this.viewx);
    this.y += flyspeed * Math.sin(this.viewy);
  }
  backward() {
    this.x -= flyspeed * Math.sin(this.viewx);
    this.z -= flyspeed * Math.cos(this.viewx);
    this.y -= flyspeed * Math.sin(this.viewy);
  }
  right() {
    this.x += flyspeed * Math.cos(this.viewx);
    this.z -= flyspeed * Math.sin(this.viewx);
  }
  left() {
    this.x -= flyspeed * Math.cos(this.viewx);
    this.z += flyspeed * Math.sin(this.viewx);
  }
}


