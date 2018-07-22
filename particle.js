// ����ϵͳ


// ����,�ٶȺ���ɫ
function particle(maxSpeed, r, g, b){
	this.maxSpeed = maxSpeed;             // ����˶��ٶ�
	this.r = r + random(-20, 20);         // ��ɫ
	this.g = g + random(-20, 20);
	this.b = b + random(-20, 20);
	
	this.pos = createVector(random(width), random(height));       // λ��
	this.vel = createVector(0.0, 0.0);                            // �ٶ�
	this.acc = createVector(0.0, 0.0);                            // ���ٶ�
	
	this.prevPos = this.pos.copy();       // ��һʱ�������λ��
	
	// ʩ������
	this.applyForce = function(fv){
		this.acc.add(fv);
	}
	// ����
	this.update = function(){
		this.vel.add(this.acc);          // �ٶ�
		this.pos.add(this.vel);          // λ��
		this.vel.limit(this.maxSpeed);   // ����ٶ�
		this.acc.mult(0);                // ���ٶ�Ϊ��
	}
	// ��ʾ
	this.show = function(){
		this.edges();              // �����߽�
		stroke(this.r, this.g, this.b, 15);
		strokeWeight(1);
		// �������Ļ����
		if(abs(this.pos.x - this.prevPos.x) < width * 0.6 && abs(this.pos.y - this.prevPos.y) < height * 0.6){
			line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
		}
		// ����ǰһʱ���λ��
		this.updatePrevPos();
	}
	// �����߽紦��
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
	// �����ݶ������������˶���fields�Ƕ�ά���ݶȾ���-->��һά�������洢
	this.follow = function(fields){
		var x = floor(this.pos.x / gridSize);     // ѡ������λ�����ڵ�����
		var y = floor(this.pos.y / gridSize);
		var index = x + y * cols;
		this.applyForce(fields[index]);           // ʩ����������
	}
	// ����ǰһʱ���λ��
	this.updatePrevPos = function(){
		this.prevPos.x = this.pos.x;
		this.prevPos.y = this.pos.y;
	}
}