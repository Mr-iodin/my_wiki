# Tracking 框架阶段一：目录骨架 → 坐标工具 → Registry 注册表

> **本章内容/进度：**
>
> - 阶段 0：目录骨架 + `__init__.py` —— ✅
>   - 验证：`import tracklab` 成功
> - 阶段 1a：`utils/bbox.py`（坐标换算 + crop_and_resize）—— ✅
>   - 验证： 手写用例
> - 阶段 1b：`registry.py`（注册表 + build_from_cfg + 嵌套构建）—— ✅
>   - 验证：`python tracklab/registry.py` 包入口导入验证通过
> - 阶段 1c：调试  `tools/debug_crop.py` —— ✅
>   - 验证中间变量

### 0.项目结构

```cmd
tracklab/
├── configs/              # 每个模型一个 yaml（暂空，.gitkeep 占位）
├── tracklab/             # 主包
│   ├── registry.py       # 注册表 + build 逻辑（占位）
│   ├── data/             # dataset、transforms、pair sampling
│   ├── models/
│   │   ├── backbones/    # alexnet / resnet / vit
│   │   ├── fusions/      # corr / depthwise_corr / transformer / mixed_attention
│   │   ├── heads/        # response_head / rpn_head / iou_head / corner_head
│   │   └── trackers/     # siamfc_tracker / siamrpn_tracker / stark_tracker ...
│   ├── update/           # 模板/模型更新策略（固定、动态、token）
│   ├── engine/           # train / test / eval 主循环
│   └── utils/            # bbox 换算、anchor、指标
├── tools/                # train.py / test.py / demo.py（占位）
└── pretrained/           # 权重目录（暂空）
```

### 1.utils 

##### 1.1 `bbox.py` ——（xyxy ↔ xywh ↔ cxcywh）

【作用】`bbox` 是 **bounding box（边界框）** 的缩写，在计算机视觉中表示**包围目标物体的矩形框**。bbox 的作用就是告诉模型：**目标在哪里，以及目标有多大。**

【问】为什么要进行转换：因为每个环节的"口味"不一样。

> - **数据集的标注**（OTB 的 `groundtruth_rect.txt`）给的是 `xywh`；
> - **裁剪图像**（`crop_and_resize`）需要以目标中心为基准，所以要先转成 `cxcywh`；
> - **画框、算指标**（precision/success）喜欢用两个角点 `xyxy`；
> - **SiamRPN 的 anchor、IoU 计算**也是围绕中心点和宽高展开的。

> [!NOTE]
>
> 1. **OTB 是 1 起始下标**，所以要先 `- 1` 再算中心，否则框整体会偏 1 个像素；
> 2. **宽高顺序**：跟踪代码内部习惯存 `[y, x, h, w]`（行、列），而标注和画框常用 `[x, y, w, h]`。`crop` 是按行/列切图像的，所以裁剪前必须确认顺序。我建议你在 `utils/bbox.py` 里把所有函数统一用 `[x, y, w, h]` 入参、内部处理时再转，接口保持一个标准，后面才不会越写越乱。



【例】假设图像里有一个目标框，左上角在 (10, 20)，宽 30、高 40。同一个框可以这样描述：

| 格式     | 含义                              | 这个例子           |
| -------- | --------------------------------- | ------------------ |
| `xywh`   | 左上角 (x, y) + 宽高 (w, h)       | `(10, 20, 30, 40)` |
| `cxcywh` | 中心点 (cx, cy) + 宽高 (w, h)     | `(25, 40, 30, 40)` |
| `xyxy`   | 左上角 (x1, y1) + 右下角 (x2, y2) | `(10, 20, 40, 60)` |

​	转换公式，

```
xywh → cxcywh:   cx = x + w/2,  cy = y + h/2
cxcywh → xywh:   x = cx - w/2,  y = cy - h/2
xywh → xyxy:     x2 = x + w,    y2 = y + h
```



##### 1.2 `crop_and_resize`

【作用】裁剪（crop）图片中的某个区域，然后调整（resize）成指定大小。**以 center 为中心，在原图上圈一个 `size × size` 的方块，把方块裁出来，再缩放到固定尺寸**（模板 127×127、搜索图 255×255）。所以它做三件事：圈方块 → 裁剪 → 缩放。唯一麻烦的是"方块出界了怎么办"，不同情况采取不同策略。

```
crop_and_resize(img, center, size, out_size)
# img: 原图
# center: 目标中心 (y, x)
# size: 在原图上裁的方块边长（像素）
# out_size: 输出尺寸（127 或 255）
```

【代码】

```python
def crop_and_resize(img, center, size, out_size,
                    border_type=cv2.BORDER_CONSTANT,
                    border_value=(0, 0, 0),
                    interp=cv2.INTER_LINEAR):
    """以 center 为中心裁一个边长为 size 的方块，再缩放到 out_size x out_size。
    Args:
        img: 原图，H x W x C。
        center: 目标中心 ``(y, x)``，注意是**行列顺序**（因为要用 img[y, x] 切片）。
        size: 在原图上裁剪的方块边长（像素）。
        out_size: 输出边长（SiamFC 里模板为 127，搜索图为 255）。
        border_type / border_value: 越界时的补边方式，默认常量 + 给定颜色。
        interp: 缩放插值方式，默认双线性。

    Returns:
        形状为 ``(out_size, out_size, C)`` 的图像块。
    """
    # 0. 统一入参：center 可以是元组/列表/数组，这里都转成 float32 数组
    center = np.asarray(center, dtype=np.float32)                

    # 1. 由 center 和 size 算出方块四个角（0 起始下标）
    size = round(size)                                                   		# ①
    corners = np.concatenate((                                           		# ②
        np.round(center - (size - 1) / 2),          # 左上角
        np.round(center - (size - 1) / 2) + size))  # 右下角（排他）
    corners = np.round(corners).astype(int)                              		# ③

    # 2. 越界部分用 copyMakeBorder 补边，保证裁剪结果始终是完整方块
    pads = np.concatenate((
        -corners[:2],            # 上/左需要补多少
        corners[2:] - img.shape[:2]))  # 下/右需要补多少
    npad = max(0, int(pads.max()))                                       		# ⑤
    if npad > 0:                                                         		# ⑥
        img = cv2.copyMakeBorder(
            img, npad, npad, npad, npad,
            border_type, value=border_value)

    # 3. 裁出方块（补边后所有角都平移到合法范围）
    corners = (corners + npad).astype(int)                               		# ⑦
    patch = img[corners[0]:corners[2], corners[1]:corners[3]]            		# ⑧

    # 4. 缩放到固定输出尺寸
    patch = cv2.resize(patch, (out_size, out_size), interpolation=interp)		# ⑨
return patch
```

> ① `size = round(size)`
>
> ​        `size` 在真实代码里是 `sqrt(...)` 算出来的，可能是小数（比如 63.2）。后面要做格点运算、切片，必须是整数，所以先四舍五入。
>
> ② 由 center 和 size 算四个角
>
> ​	`center` 是 `(y, x)` 数组。`center - (size-1)/2` 得到左上角（往回退半个边长），`+ size` 得到右下角（左上角往右下延伸一个边长）。注意这里**先取整再加 size**：左上角取整后，右下角 = 左上角 + size，所以裁剪宽度永远恰好等于 `size`。
>
> ③ `astype(int)`
>
> ​	`np.round` 返回的是 float 数组，而切片索引必须是整数，所以转 int。
>
> ④ 算四个方向的越界量
>
> * 上/左边越界 = 角是负数，缺口 = `-corner`
>
> * 下/右边越界 = 角超过图像尺寸，缺口 = `corner - 图像尺寸`
>
> ⑤ 取四个方向里最大的缺口放入`npad`。
>
> ⑥ 统一补边。
>
> ⑦ 坐标平移：补边后图像整体变大了，原图像的新坐标 = 旧坐标 + npad，所以四个角也跟着 `+ npad`，这时它们全部落在合法范围内。
>
> ⑧ 切片裁剪:`img[行起点:行终点, 列起点:列终点]`，⚠️  **y 先 x 后**。
>
> ⑨ 缩放:统一缩放到 `out_size × out_size`，这就是网络能接收固定 127/255 输入的原因。



【例一】完全在图内，center=(5,5)

```
① size = 5
② 左上角 = (5-2, 5-2) = (3, 3)，四角 = [3, 3, 8, 8]
④ pads = [-3, -3, -2, -2]  → 都是负数，没有越界
⑤ npad = 0，不补边
⑧ patch = img[3:8, 3:8]    → 5×5 方块
⑨ resize 成 5×5
```

【例二】探出上边界 1 格，center=(1,5)

```
① size = 5
② 左上角 = (1-2, 5-2) = (-1, 3)，四角 = [-1, 3, 4, 8]
④ pads = [1, -3, -6, -2]   → 只有"上边"缺 1
⑤ npad = 1
⑥ 图四周各补 1 格 → 变成 12×12，原图移到 (1..10, 1..10)
⑦ corners + 1 = [0, 4, 5, 9]
⑧ patch = img[0:5, 4:9]    → 第 0 行是补出来的，其余是原图
⑨ resize 成 5×5
```

【例三可视化】原图shape为(1280, 1920, 3)，在原图上画了两个裁剪框（红 = 图内，绿 = 贴边，可见绿框探出左上角）如下，

<img src="https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/before.png" alt="before" style="zoom: 25%;" />

​      **情况 1：方块完全在图内**（原图 1577×916，center 在图像中间）

```
输入: center = [640, 960] (y, x), size = 200, out_size = 127
四角 (y1, x1, y2, x2) = [540, 860, 740, 1060]
各边缺口 = [-540, -860, -540, -860] -> npad = 0
裁剪范围 img[540:740, 860:1060] -> 宽高 = 200 x 200
输出形状: (127, 127, 3)
```

​        **情况 2 和 3：center 挪到左上角 `(60, 60)`**，方块探出图外。情况 2 用默认黑色 `(0,0,0)`，情况 3 用这张图的平均色 `[88, 84, 68]`。

```
四角 = [-40, -40, 160, 160]              ← 上/左各探出 40 像素
各边缺口 = [40, 40, -1120, -1760] -> npad = 40
补边后图像尺寸: (1360, 2000, 3)          ← 1280+40×2, 1920+40×2
裁剪范围 img[0:200, 0:200] -> 宽高 = 200 x 200
输出形状: (127, 127, 3)
```

<img src="https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/compare.png" alt="compare" style="zoom:67%;" />

### 2.registry

- **本质**：一个装饰器驱动的字典。❓

- **核心矛盾**：配置文件（`.py`/.yaml）里写的是字符串（如 `'ResNet'`），代码需要的是类（`class ResNet`）。Registry 就是那座桥。

- **Registry 类的三个核心方法：**

  ```python
  class Registry:
      def __init__(self, name):
          self.name = name
          self._registry = {}          # 就是那本通讯录：{名字: 类}
          _REGISTRIES[name] = self     # 全局登记处，方便按名字找回
  ```

- 三种方法对应三种操作：

  | 方法             | 作用                             | 通俗解释                                                     |
  | :--------------- | :------------------------------- | :----------------------------------------------------------- |
  | **`register()`** | 登记（装饰器），把类登记进通讯录 | 在类定义前加 `@REGISTRY.register_module()`，就把名字和类存进字典了 |
  | **`get()`**      | 查通讯录                         | 给个字符串 `'ResNet'`，把类返回给你                          |
  | **`build()`**    | 打电话+自动装配                  | 传一个配置字典 `{'type': 'ResNet', 'depth': 50}`，它先 `get` 到类，再把 `depth=50` 传进去实例化 |

  1. register —— 登记（装饰器）

     ```python
     def register(self, name=None):
         if callable(name):                       # 用法一：@REG.register
             cls = name
             self._registry[cls.__name__] = cls
             return cls                           # 必须原样返回类！
         def _wrap(cls):                          # 用法二：@REG.register('名字')
             self._registry[name or cls.__name__] = cls
             return cls
         return _wrap
     ```

  > 【问】**装饰器为什么必须返回类本身**？因为 `@BACKBONES.register('alexnet_v1')` 只是"顺手登记一下"，装饰完之后 `AlexNetV1` 这个名字仍然要指向这个类，才能正常使用 `AlexNetV1()` 。如果不返回 `cls`，`AlexNetV1` 会变成 `None`，代码就崩了。具体执行流程示例如下：
  >
  > ```
  > @REG.register('alexnet_v1')
  > class AlexNet: pass
  > 
  > 执行步骤：
  > 1. 先调用 register('alexnet_v1')
  >    → name = 'alexnet_v1'（字符串）
  >    → callable(name) 为 False
  >    → 定义 _wrap 函数
  >    → return _wrap      ← ⚠️ 把 _wrap 返回给装饰器
  > 2. Python 拿到 _wrap 后，执行：
  >    AlexNet = _wrap(AlexNet)
  >    → 进入 _wrap 内部：
  >       registry['alexnet_v1'] = AlexNet  # 登记
  >       return AlexNet                    # 返回类本身
  > 3. 最终 AlexNet 仍然指向类，可以正常使用
  > ```

     2. get —— 查通讯录

        ```python
        def get(self, name):
            if name not in self._registry:
                raise KeyError("'%s' 没有注册到 [%s] 注册表。可用: %s" % ...)
            return self._registry[name]
        ```

        查不到就报错，并**列出所有可用名字**——这是调试利器，拼错名字时能直接看到正确答案。

     3. build —— 按配置构造

        ```python
        def build(self, cfg, **kwargs):
            return build_from_cfg(cfg, registry=self, **kwargs)
        ```

        `build` 只是 `build_from_cfg` 的便捷包装，把"用哪个注册表"提前定好。

* `build_from_cfg`：完整的构建流程

  ```python
  def build_from_cfg(cfg, registry=None, **kwargs):
      cfg = dict(cfg)                     # ① 拷贝
      if registry is None:                # ② 确定注册表
          category = cfg.pop('category', None)
          registry = get_registry(category)
      name = cfg.pop('name', None)        # ③ 取名字
      if name is None:
          name = cfg.pop('type', None)
      cls = registry.get(name)            # ④ 找到类
      args = {}                           # ⑤ 组装参数
      for key, value in cfg.items():
          if isinstance(value, dict) and ('name' in value or 'type' in value):
              args[key] = build_from_cfg(value)   # 嵌套组件 → 递归
          else:
              args[key] = value                   # 普通参数 → 透传
      args.update(kwargs)                 # ⑥ 覆盖
      return cls(**args)                  # ⑦ 实例化
    
  # ==================== tracker测试示例 ==================== #
  cfg = {
      'name': 'siamfc',
      'backbone': {'category': 'backbone', 'name': 'AlexNetV1', 'out_channels': 256},
      'head':     {'category': 'head', 'name': 'response_head', 'out_scale': 0.001},
  }
  tracker = TRACKERS.build(cfg)
  ```

  > ① 拷贝：`dict(cfg)` 生成一份副本。后面要 `pop('name')` 删键，如果不拷贝，调用方的原配置会被改掉——这是"函数不要修改入参"的防御习惯。
  >
  > ② 确定注册表：`TRACKERS.build` 已经传了 `registry=TRACKERS`，所以顶层跳过 category。如果是裸调 `build_from_cfg(cfg)`，就必须靠 `cfg['category']` 才知道去哪本通讯录找。
  >
  > ③ 取名字：`cfg.pop('name')` 把名字从配置里"拿走"，剩下的键全是构造参数。支持 `name` 或 `type` 两种写法（不同框架习惯不同，都兼容）。
  >
  > ④ 找类：`TRACKERS.get('siamfc')` → 找到 `SiamFCTracker` 这个类。到这一步只是"找到"，还没创建实例。
  >
  > ⑤ 组装参数（关键）：遍历剩下的键值：
  >
  > - `backbone` 的值是一个含 `name` 的字典 → **递归调用 `build_from_cfg`**，先构建出 `AlexNetV1(out_channels=256)` 实例；
  > - `head` 同理 → 构建出 `ResponseHead(out_scale=0.001, extra={'a': 1})`；
  > - 普通值（比如 `extra={'a': 1}`）原样透传，不误判成组件。
  >
  > 递归的终止条件就是"值不再是含 `name` 的字典"——一层层剥下去，直到全部变成普通参数。
  >
  > ⑥ 覆盖：`args.update(kwargs)` 让显式传入的 `**kwargs` 优先级最高，可以临时改某个参数。
  >
  > ⑦ 实例化：`SiamFCTracker(backbone=net1, head=head2)`，一次调用把整棵模型树搭完。

* 配置文件

  以后写 `configs/siamfc.yaml`：

  ```yaml
  name: siamfc
  backbone:
    category: backbone
    name: alexnet_v1
  head:
    category: head
    name: response_head
    out_scale: 0.001
  ```

  `tools/train.py` 里只需三行：读 yaml → `build_from_cfg` → 开训。

  下一步写 `backbones/alexnet.py` 时，只要在文件末尾加一句 `@BACKBONES.register('alexnet_v1')`，它就会被登记进通讯录，`build` 就能用了。



### 一些零碎知识点补充

##### 1.语法

##### `assert` —— 断言语句

* 用法：assert 条件表达式, "可选错误信息"
* 作用：在开发阶段测试某个条件是否为真，如果为假则立即抛出 `AssertionError` 异常，阻止程序继续运行。

* 例子

  ```python
  x = 10
  assert x > 5   
  # 条件为 True，无反应
  assert x > 20, "x 应该大于 20"  
  # 抛出 AssertionError: x 应该大于 20
  ```

##### `round()`—— 银行家舍入

* `round()` 是 Python 内置的**四舍五入**函数，但它有一个非常重要的“坑”：它采用的是**银行家舍入法（Round Half to Even）**，而不是我们小学数学中学到的“四舍五入”。

* 基本用法

  ```python
  # 不指定小数位数，返回最接近的整数（类型为 int）
  print(round(3.14))   # 输出: 3
  print(round(3.99))   # 输出: 4
  
  # 指定保留 n 位小数（第二个参数 ndigits）
  print(round(3.14159, 2))  # 输出: 3.14
  print(round(3.14159, 3))  # 输出: 3.142
  ```

* 当小数部分**恰好为 0.5** 时，`round()` **不会**直接往上入，而是会取**最接近的偶数**。⚠️

  ```python
  print(round(2.5))   # 输出: 2  （因为 2 是偶数，所以向下取整）
  print(round(3.5))   # 输出: 4  （因为 4 是偶数，所以向上取整）
  print(round(4.5))   # 输出: 4  （因为 4 是偶数，所以向下取整）
  ```

