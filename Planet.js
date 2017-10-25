// Copyright Anton Tkachev 2016
// anton.a.tkachev@gmail.com

// Planet Class
function Planet(name,m,x,y,vx,vy,r,color){
	// Private
	var name = name;
	var m = m;		// [kg] mass
	var x = x;		// [m] current x location
	var y = y;		// [m] current y location
	var xp = null;	// [m] previous x location
	var yp = null;	// [m] previous y location
	var vx = vx;	// [m/s]
	var vy = vy;	// [m/s]
	var Fx = 0;		// [N]
	var Fy = 0;		// [N]
	var r = r;		// [px] radius to draw
	var color = color;
	var traceX = [];
	var traceY = [];
	var traceLength = 100;
	var traceIndex = 0;
	
	// Public
	this.getM  = function(){return m}
	this.getX  = function(){return x}
	this.getY  = function(){return y}
	this.getVx = function(){return vx}
	this.getVy = function(){return vy}
	
	// Physics methods
	this.findDist = function(P){	// finds distance to planet P
		var dx = P.getX() - x;
		var dy = P.getY() - y;
		return Math.sqrt(dx*dx + dy*dy);
	}
	
	this.addForce = function(P){	// adds gravity contribution from planet P
		var dx = P.getX() - x;
		var dy = P.getY() - y;
		var dd = Math.sqrt(dx*dx + dy*dy);
		if(dd < 1E6) return;
		Fx += Planet.G*m*P.getM()*dx/(dd*dd*dd);
		Fy += Planet.G*m*P.getM()*dy/(dd*dd*dd);
	}
	
	this.clearForce = function(){	// clears net force buffers
		Fx = 0;
		Fy = 0;
	}
	
	this.normalize = function(xc,yc,vcx,vcy){	// changes the frame to CoG
		x = x - xc;
		y = y - yc;
		vx = vx - vcx;
		vy = vy - vcy;
	}
	
	this.move = function(dt){	// dt [s] - time step
		var xn;		// new X position
		var yn;		// new Y position
		var ax = Fx/m; 
		var ay = Fy/m;
		
		Planet.ctx.lineWidth = 1;
		Planet.ctx.strokeStyle = "Black";
		
		if(xp == null || yp == null){
			// Euler method 2nd order
			xp = x; yp = y;
			x = xp + vx*dt;
			y = yp + vy*dt;
			return;
		}
		// Verlet integration 4th order
		xn = 2*x - xp + ax*dt*dt;
		yn = 2*y - yp + ay*dt*dt;
		// Velocity calculation 3rd order
		vx = (xn - xp)/2/dt;
		vy = (yn - yp)/2/dt;
		xp = x; yp = y;
		x = xn; y = yn;
	}
	//--------------------------
	
	// Drawing methods
	this.draw = function(){
		Planet.ctx.beginPath();
		Planet.ctx.lineWidth = 2;
		Planet.ctx.strokeStyle = "Black";
		Planet.ctx.arc(x*Planet.scale, y*Planet.scale, r, 0, 2*Math.PI, false);
		Planet.ctx.fillStyle = color;
		Planet.ctx.fill();
		Planet.ctx.stroke();
	}
	
	this.label = function(){
		var dr = 0.7071*r;	// r*cos(45)
		var mr = 5;			// text margin
		Planet.ctx.textAlign = "left";
		Planet.ctx.font = '8pt Verdana';
		Planet.ctx.fillStyle = "Black";
		Planet.ctx.fillText(name, x*Planet.scale + dr + mr, y*Planet.scale - dr - mr);
	}
	
	this.clearPrevPos = function(){
		xp = null;
		yp = null;
	}
	
	this.addTracePiece = function(){
		var i;
	/*	for(i = 0; i < traceLength; i++){
			if(traceX[i] === "undefined") break;
			traceX[i+1] = traceX[i];
			traceY[i+1] = traceY[i];
		}
		traceX[0] = x;
		traceY[0] = y;
	*/
		if(traceIndex < traceLength){
			traceX[traceIndex] = x;
			traceY[traceIndex] = y;
			traceIndex++;
		}
		else{
			for(i = 0; i < traceLength - 1; i++){
				traceX[i] = traceX[i+1];
				traceY[i] = traceY[i+1];
			}
			traceX[traceLength - 1] = x;
			traceY[traceLength - 1] = y;
		}
	}
	
	this.plotTrace = function(){
		var i;
		Planet.ctx.lineWidth = 2;
		Planet.ctx.strokeStyle = color;
		
		Planet.ctx.beginPath();
	/*	Planet.ctx.moveTo(traceX[0]*Planet.scale,traceY[0]*Planet.scale);
		for(i = 1; i < traceLength; i++){
			Planet.ctx.lineTo(traceX[i]*Planet.scale,traceY[i]*Planet.scale);
		}*/
		Planet.ctx.moveTo(traceX[traceLength - 1]*Planet.scale,traceY[traceLength - 1]*Planet.scale);
		for(i = traceLength - 2; i >= 0; i--){
			Planet.ctx.lineTo(traceX[i]*Planet.scale,traceY[i]*Planet.scale);
		}
		Planet.ctx.stroke();
	}
	
	this.setTraceLength = function(n){
		traceLength = n;
	}
	
	this.clearTrace = function(){
		traceX.fill(undefined);
		traceY.fill(undefined);
	}
}

// Static
Planet.G = 6.67408E-11;		// [m3/kg.s2] Gravitational constant
Planet.scale = 1;			// [px/m] scale factor
Planet.ctx = null;			// canvas context

Planet.setScale = function(cnv,biggestScale){
	Planet.scale = Math.min(cnv.width,cnv.height)/2/biggestScale;
	return Planet.scale;
}

Planet.setContext = function(cnv){
	Planet.ctx = cnv.getContext("2d");
	Planet.ctx.translate(cnv.width/2, cnv.height/2);
	return Planet.ctx;
}

Planet.clearCanvas = function(){
	Planet.ctx.clearRect(-cnv.width/2,-cnv.height/2,cnv.width,cnv.height);
}