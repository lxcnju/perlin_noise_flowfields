// 柏林噪声生成
// 输入：xoff yoff zoff 三个double类型的数
// 输出：0-1之间的小数
// 原理：将xoff，yoff，zoff映射到三维空间里面，对三个坐标取整得到所在的小方格
//       小方格八个顶点随机初始化一个梯度值，这里仅限于[1,1,0]等16个梯度值可选，减少随机性
//       根据点到顶点的向量和顶点的梯度值作内积，得到八个顶点对这个点的影响度
//       然后对八个顶点的影响度进行插值，得到噪声，返回结果
// 细节：如何为顶点随机初始化梯度值？根据顶点值进行hash计算得到一个0-255之间的值，然后对16取余得到相应的梯度
// 细节：如何根据八个顶点进行插值？逐个维度进行插值，采用光滑曲线插值，t * t * t * (t * (t * 6 - 15) + 10)


// 柏林噪声
function perlinNoise(){
	// 所有可能的hash值，0-255
	this.permutation = [
		151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,
		247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,
		175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
		102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,135,130,116,188,159,86,164,100,
		109,198,173,186, 3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,
		182,189,28,42,223,183,170,213,119,248,152, 2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,
		98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,
		51,145,235,249,14,239,107,49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,138,
		236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
	this.p = [];
	
	// 因为后面会有p[ p[ p[xi] + yi] + zi]的操作来取hash值，p[xi] + yi可能会大于255，所以p重复两遍permutation
	this.init = function(){
		for(var k = 0; k < 512; k++){
			this.p.push(this.permutation[k % this.permutation.length]);
		}
	}
	// 生成噪声: x, y, z double类型；times，每次频率double做几次；persistence，每次的幅度更新
	this.genNoise = function(x, y, z, times, persistence){
		var weight = 0;             // 总的权值
		var frequency = 1;          // 频率
		var amplitude = 1;          // 幅度
		var res = 0;                // 噪声结果
		// 重复
		for(var i = 0; i < times; i++){
			res += this.perlin(x * frequency, y * frequency, z * frequency) * amplitude;  // 生成一次，幅度
			weight += amplitude;                 // 权值加上幅度
			amplitude *= persistence;            // 幅度更新
			frequency *= 2;                      // 频率double
		}
		return res/weight;
	}
	// 柏林噪声生成
	this.perlin = function(x, y, z){
		var xi = floor(x) & 255;            // 取整
		var yi = floor(y) & 255;
		var zi = floor(z) & 255;
		
		var xf = x - floor(x);              // 取小数
		var yf = y - floor(y);
		var zf = z - floor(z);
		
		var u = this.fade(xf);              // 平滑
		var v = this.fade(yf);
		var w = this.fade(zf);
		
		// 八个顶点的hash值，通过p[ p[ p[xi] + yi] + zi]的操作来实现
		var aaa = this.p[this.p[this.p[xi] + yi] + zi];
		var aba = this.p[this.p[this.p[xi] + this.inc(yi)] + zi];
		var aab = this.p[this.p[this.p[xi] + yi] + this.inc(zi)];
		var abb = this.p[this.p[this.p[xi] + this.inc(yi)] + this.inc(zi)];
		var baa = this.p[this.p[this.p[this.inc(xi)] + yi] + zi];
		var bba = this.p[this.p[this.p[this.inc(xi)] + this.inc(yi)] + zi];
		var bab = this.p[this.p[this.p[this.inc(xi)] + yi] + this.inc(zi)];
		var bbb = this.p[this.p[this.p[this.inc(xi)] + this.inc(yi)] + this.inc(zi)];
		
		// 根据hash值计算每个顶点的影响度，插值
		var x1 = this.lerp(this.grad(aaa, xf, yf, zf), this.grad(baa, xf - 1, yf, zf), u);
		var x2 = this.lerp(this.grad(aba, xf, yf - 1, zf), this.grad(bba, xf - 1, yf - 1, zf), u);
		var y1 = lerp(x1, x2, v);
		
		x1 = this.lerp(this.grad(aab, xf, yf, zf - 1), this.grad(bab, xf, yf - 1, zf - 1), u);
		x2 = this.lerp(this.grad(abb, xf, yf - 1, zf - 1), this.grad(bbb, xf - 1, yf - 1, zf - 1), u);
		var y2 = this.lerp(x1, x2, v);
		
		return this.lerp(y1, y2, w) * 0.5 + 0.5
	}
	
	// 自增
	this.inc = function(n){
		var res = n + 1;
		return res;
	}
	
	// 根据hash值选择梯度，然后与向量(x, y, z)做内积
	this.grad = function(h, x, y, z){
		switch(h & 15)
		{
			case 0: return  x + y;       // 相当于是选择了梯度(1, 1, 0)
			case 1: return -x + y;
			case 2: return  x - y;
			case 3: return -x - y;
			case 4: return  x + z;
			case 5: return -x + z;
			case 6: return  x - z;
			case 7: return -x - z;
			case 8: return  y + z;
			case 9: return -y + z;
			case 10: return  y - z;
			case 11: return -y - z;
			case 12: return  y + x;
			case 13: return -y + z;
			case 14: return  y - x;
			case 15: return -y - z;
			default: return 0;
		}
	}
	
	// 平滑，五次函数曲线
	this.fade = function(t){
		return t * t * t * (t * (t * 6 - 15) + 10);
	}
	
	// 插值
	this.lerp = function(a, b, f){
		return a * (1 - f) + b * f;
	}
}