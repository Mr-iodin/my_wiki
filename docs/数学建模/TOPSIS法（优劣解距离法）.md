# TOPSIS法（优劣解距离法）

### 层次分析法的一些局限

1）评价决策层不能太多，太多的话n会很大，判断矩阵和一致性矩阵差异会很大。

平均随机一致性指标RI的的表格中n最多为15

2）如果决策层中指标的数据是已知的，那么如何使用这些数据来使得评价更加准确？

### 一个例子

请对四名同学进行评分，该评分能合理的描述其高数成绩的高低。

![TOPSIS.高数成绩.png](https://i.loli.net/2020/03/04/WolfqZBnUuh4Qxr.png)

一个简单想法：对排名进行修正，再归一化

![TOPSIS.排名进行修正.png](https://i.loli.net/2020/03/04/7QgeTlV8oYKLapt.png)

但有不合理之处，只要排名不变，可以随便修改成绩，评分也不会变。

一个更好的想法：

用每个成绩减去最小值。除以max-min是为了进行归一化（数更小）

![TOPSIS.用最高分最低分衡量2.png](https://i.loli.net/2020/03/04/GeapT95gUJVlhOd.png)

![TOSIS.用最高分最低分衡量1.png](https://i.loli.net/2020/03/04/QtLw2nW8kZd5YDC.png)

构建计算评分公式
$$
(x-min)/(max-min)
$$
有一下需要注意:

1)比较对象一般要远大于两个；最低分和最高分始终固定在0和1;

2）比较指标也往往不只是一个方向的；例如成绩/工时数/课外竞赛得分等；

3）有很多指标不存在理论上的最大值和最小值，例如衡量经济增长水平指标：GDP增速（可以有正负）。

### 扩展问题：增加指标个数

要综合评价4位同学：

![TOPSIS.增加指标.png](https://i.loli.net/2020/03/04/5L28iMNJm4ErSVB.png)

成绩是越大越好，这样的指标称为极大型指标（效益型指标）；与他人争吵的次数越小越好，这样的指标称为极小型指标（成本型指标）。

##### 统一指标类型

将所有的指标转化为极大型指标称为指标正向化（最常用）

![TOPSIS.指标正向化.png](https://i.loli.net/2020/03/04/K2QsT56Fxg3dCqp.png)

极小型指标转化为极大型指标公式：
$$
max-x
$$

##### 标准化处理

第一步：

为了消去不同指标量纲的影响，需要对正向化的矩阵进行标准化处理。

![TOPSIS.标志化处理.png](https://i.loli.net/2020/03/04/J9MAhKxkwGvzrPu.png)

![TOPSIS.标志化处理步骤.jpg](https://i.loli.net/2020/07/05/iL6VOdPXulB9Khe.jpg)

标准化不影响相对大小。

第二步：

![TOPSIS.公式.jpg](https://i.loli.net/2020/07/05/Bz8Cf5JlP1yRiMI.jpg)

转化为公式：

![转化为公式.png](https://i.loli.net/2020/07/05/3FCOTwh7fGR9Xa4.png)

带入例子中：

![TOPSIS.公式例子.jpg](https://i.loli.net/2020/07/05/sfmgMDE1ZIXBqkh.jpg)

最后结果：

![TOPSIS.最终公式结果](C:\Users\sn159\Desktop\数学建模\二.TOPSIS法（优劣解距离法）\图片档\TOPSIS.最终公式结果.png)

### 总结：

##### 第一步，原始矩阵正向化；

![TOPSIS.常见的四种正向化指标.png](https://i.loli.net/2020/03/04/Ol7eghD5Gjx1EMS.png)

* 极小型指标->极大型指标：

  *①max-x ；②如果所有元素为正数，则取倒数；

* 中间型指标->极大型指标：

![中间型指标.png](https://i.loli.net/2020/07/05/eWtcVzEqDlyIrFK.png)

* 区间型指标->极大型指标：

![区间型指标.png](https://i.loli.net/2020/07/05/Zl96o7tpmkQNsui.png)

##### 第二步：正向化矩阵标准化

目的是消除不同指标量纲的影响。

![TOPSIS.正向化矩阵标准化.png](https://i.loli.net/2020/03/04/19YnZ3QoMwcyKJp.png)

##### 第三步：计算得分并归一化

![计算得分并归一化.png](https://i.loli.net/2020/07/05/XTv2lAwKUSmVIkj.png)



（补）