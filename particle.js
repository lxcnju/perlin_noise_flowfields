// 粒子系统


// 粒子,速度和颜色
function particle(maxSpeed, r, g, b){
	this.maxSpeed = maxSpeed;             // 最大运动速度
	this.r = r + random(-20, 20);         // 颜色
	this.g = g + random(-20, 20);
	this.b = b + random(-20, 20);
	
	this.pos = createVector(random(width), random(height));       // 位置
	this.vel = createVector(0.0, 0.0);                            // 速度
	this.acc = createVector(0.0, 0.0);                            // 加速度
	
	this.prevPos = this.pos.copy();       // 上一时间点粒子位置
	
	// 施加外力
	this.applyForce = function(fv){
		this.acc.add(fv);
	}
	// 更新
	this.update = function(){
		this.vel.add(this.acc);          // 速度
		this.pos.add(this.vel);          // 位置
		this.vel.limit(this.maxSpeed);   // 最大速度
		this.acc.mult(0);                // 加速度为零
	}
	// 显示
	this.show = function(){
		this.edges();              // 超过边界
		stroke(this.r, this.g, this.b, 15);
		strokeWeight(1);
		// 避免跨屏幕画线
		if(abs(this.pos.x - this.prevPos.x) < width * 0.6 && abs(this.pos.y - this.prevPos.y) < height * 0.6){
			line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
		}
		// 更新前一时间点位置
		this.updatePrevPos();
	}
	// 超出边界处理
	this.edges = function(){
		if(this.pos.x > width){
			this.pos.x = 0;
		}
		if(this.pos.x < 0){
			this.pos.x = width;
		}
		if(this.pos.y > height){
			this.pos.y = 0;
		}
		if(this.pos.y < 0){
			this.pos.y = height;
		}
	}
	// 跟随梯度向量场进行运动，fields是二维的梯度矩阵-->用一维数组来存储
	this.follow = function(fields){
		var x = floor(this.pos.x / gridSize);     // 选择现在位置所在的向量
		var y = floor(this.pos.y / gridSize);
		var index = x + y * cols;
		this.applyForce(fields[index]);           // 施加向量的力
	}
	// 更新前一时间点位置
	this.updatePrevPos = function(){
		this.prevPos.x = this.pos.x;
		this.prevPos.y = this.pos.y;
	}
}