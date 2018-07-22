// 柏林噪声的应用
// 主要思路：将画布分为大小一样的小方格，按照gridSize来划分
//           每个小方格内部利用柏林噪声初始化一个角度，然后构造一个单位向量，与水平方向夹角即为生成的噪声角度
//           随机生成一定数量粒子，沿着向量场进行运动
//           到一个方格之后，即以该方格的向量为加速度进行运动
//           绘制粒子运动的曲线


var pns = new perlinNoise();       // 柏林噪声生成器
var particles = [];                // 粒子数组
var flowFields = [];               // 向量场数组

var gridSize = 10;                 // 方格大小
var cols = 0;                      // 列方格数目
var rows = 0;                      // 行方格数目

var zoff = 0;                      // 柏林噪声的第三个参数

var zstep = 0.0513;                // 柏林噪声的三个参数xoff, yoff, zoff每次改变的大小
var xstep = 0.0221;
var ystep = 0.0327;

var psNums = 800;                  // 粒子数目
var maxSpeed = 4;                  // 粒子最大速度
var vecMagSize = 0.3;              // 向量场向量的模

var r = 0;                         // 颜色
var b = 0;
var g = 0;

function setup() {
    createCanvas(1350, 600);
    pns.init();                    // 初始化柏林噪声生成器
	
	r = random(0, 255);            // 颜色
	g = random(0, 255);
	b = random(0, 255);
	
	// 生成粒子
	for(var k = 0; k < psNums; k++){
		particles.push(new particle(maxSpeed, r, g, b));
	}
	
	// 行列数目
	cols = floor(width/gridSize);
	rows = floor(height/gridSize);
	
	// 向量场
	flowFields = new Array(cols * rows);
	
	background(255);
}

function draw() {
	var yoff = 0;                     // 柏林噪声y维
	for(var j = 0; j < rows; j++){
		var xoff = 0;                 // 柏林噪声x维
		for(var i = 0; i < cols; i++){
			var index = i + j * cols;
			//var angleNoise = pns.genNoise(xoff, yoff, zoff, 4, 0.5);             // 自己写的柏林噪声
			var angleNoise = noise(xoff, yoff, zoff);                              // p5.js自带的柏林噪声
			//angleNoise = (angleNoise - 0.5) * 3 + 0.5                            // 为了产生更多可能的形状
			var v = p5.Vector.fromAngle(angleNoise * TWO_PI);      // 构造向量
			v.setMag(vecMagSize);                                  // 向量模大小
			flowFields[index] = v;                                 // 加入向量场数组
			
			xoff += xstep;           // 更新xoff
			if(xoff >= 10000.0){
				xoff = 0.0;
			}
		}
		yoff += ystep;               // 更新yoff
		if(yoff >= 10000.0){
			yoff = 0.0;
		}
	}
	zoff += zstep;                  // 更新zoff
	if(zoff >= 10000.0){
		zoff = 0.0;
	}
	
	// 绘制
	for(var k = 0; k < psNums; k++){
		particles[k].follow(flowFields);
		particles[k].update();
		particles[k].show();
	}
}
