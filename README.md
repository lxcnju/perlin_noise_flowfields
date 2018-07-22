# perlin_noise_flowfields
Using perlin noise and flowfields to create beautiful pictures.

使用柏林噪声和向量场来实现优美图像的绘制，大概原理是：将画布分为若干小方格当作向量场，每个小方格里面根据柏林噪声生成梯度方向当作向量，然后使用粒子系统随机运动，粒子的加速度是为当下运动到的小方格里面的向量。随着时间的变化，向量场发生着有规律的变化，粒子运动的轨迹就是随机但又有一定规律的曲线，若干粒子的运动曲线就组合成了优美的图像。


* 代码架构
* 原理解析
  * 柏林噪声
  * 粒子系统
  * 向量场
  * 绘制曲线
  
## 代码架构
 * home.html     浏览器打开主页
 * perlin_noise.js   Perlin Noise的生成代码
 * particle.js   粒子系统
 * sketch.js     向量场构造，绘制优美图形
 
 
## 原理解析
  * 柏林噪声 <br>
    柏林噪声是一种使物体运动显得更自然，展示物体纹理的一种方法。柏林噪声的基本思想是：假设要想获得N个噪声点，给定幅度和频率生成K(K < N)个噪声点（通常是均匀分布），然后对每两个噪声点之间进行插值若干点，从而得到N个比较连续的噪声点。然后对不同幅度和频率的结果进行求平均得到柏林噪声。 <br>
    上面是柏林噪声的基本思想，下面给出柏林噪声的具体实现方法。柏林噪声的输入是三个double类型的数据，即xoff,yoff,zoff，函数返回结果是一个0\~1之间的随机数。假如要生成一个噪声点，使用noise(0.01, 1.02, 2.01)即可返回一个随机数，同样的noise(1.3, 2.1, 3.2)也会返回一个随机数。所以假如现在要生成一个一维的长度为N的柏林噪声，可以使用noise(i * 0.01,, 0.0, 0.0)来实现，即xoff参数值每次增加0.01(步长可以根据实际情况调整）；假若要生成二维的柏林噪声，每次更新xoff和yoff参数值即可，不同的z值会产生不同的二维柏林噪声。<br>
    下面来看看柏林噪声的原理，为了方便解释，这里使用zoff = 0.0情况下来进行解释，即只有xoff和yoff两个参数。柏林噪声生成的过程可以分为映射、影响度计算、插值三步。<br>
      (1)第一步是映射，即将xoff和yoff映射到一个{(x, y),(x + 1, y),(x, y + 1),(x + 1, y + 1)}的正方形小方格，可以简单使用对x = floor(xoff)，y = floor(yoff)的方法实现，在下图里面即表现为将Q点映射到I、J、K、L四个点组成的小方格。<br>
      (2)第二步是影响度计算，通过第一步映射之后，I、J、K、L四个点的坐标即可以获得，那么根据坐标获得一个hash值。这里有很多实现hash的方法，最简单的是建立一个p数组，p有512项，是0\~255这些数的随机排列，并重复一遍，然后根据p\[p\[x\] + y\]得到hash值。然后根据hash值取得相应的梯度，比如：if hash % 4 == 0 then return (1, 0)等等。假如现在I的梯度为(-1,-1)，即图中向量IM，那么计算向量内积<IM, IQ>，这里即是-1 * fx - 1 * fy，作为I对点Q的影响度。同理可以获得其余三个顶点对Q的影响度。<br>
      (3)第三步是插值，假设记I、J、K、L四个点的影响度分别为aa,ab,bb,ba，那么插值时候使用：y1 = fy * aa + (1 - fy) * ba， y2 = fy * ab + (1 - fy) * bb，res = fx * y1 + (1 - fx) * y2 进行插值。即先对y轴进行插值，然后在对x轴方向进行插值。上面使用的是线性插值，为了方便，通常使用衰减函数，f(x) = t * t * t * (t * (t * 6 - 15) + 10)来进行改变fx和fy。<br>
    <div align=center>
    <img src = "https://github.com/lxcnju/perlin_noise_flowfields/blob/master/pics/perlin_noise.png"/>
    </div><br>
  * 粒子系统 <br>
    粒子系统的具体实现在之前项目[text_particle](https://github.com/lxcnju/text_particle_p5)里面有过详细介绍，这里不再详细解释。这里为了说明的一点是，本次项目使用的粒子系统通过applyForce对粒子施加外力，即改变加速度；为了避免粒子运动过快，加了速度上限限制；另外为了方便绘制粒子运动轨迹，保存了粒子的上一次运动的位置，每次绘图时从上一次位置到现在位置画线。<br>
  * 向量场 <br>
    将画布分为若干大小一样的小方格，每个小方格里面生成一个柏林噪声，然后将柏林噪声乘以2 * pi，得到一个角度alpha，生成一个向量模大小为D，角度为alpha的向量作为该小方格内向量场的方向。<br>
    <div align=center>
    <img src = "https://github.com/lxcnju/perlin_noise_flowfields/blob/master/pics/flowfields.png"/>
    </div><br>
  * 绘图 <br>
    由粒子系统生成一定数目的粒子，初始位置在画布的任意位置，初始速度为0，然后进行运动。每个粒子的加速度由其所在的小方格的向量确定，即可以理解为：向量场给粒子施加了外力，使得粒子沿着向量场进行加速减速运动。那么绘制粒子轨迹的变化，设置透明度为5，就可以得到优美的图形。粒子数目、粒子最大速度、向量场向量模大小以及柏林噪声到向量角度的映射都是可以调整的参数，可以得到不同的图形。<br>
    <div align=center>
    <img src = "https://github.com/lxcnju/perlin_noise_flowfields/blob/master/pics/pn_3.png"/>
    </div><br>
    <div align=center>
    <img src = "https://github.com/lxcnju/perlin_noise_flowfields/blob/master/pics/pn_6.png"/>
    </div><br>
    <div align=center>
    <img src = "https://github.com/lxcnju/perlin_noise_flowfields/blob/master/pics/pn_9.png"/>
    </div><br>
    <div align=center>
    <img src = "https://github.com/lxcnju/perlin_noise_flowfields/blob/master/pics/pn_14.png"/>
    </div><br>
    
  
  
      

