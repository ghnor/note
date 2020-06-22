`Path`是对直线和曲线（包括二三次被塞尔曲线）组成的几何路径的抽象。

配合`Canvas`来绘制路径（`canvas.drawPath()`），也可以绘制文字（`canvas.drawTextOnPath()`），甚至对`Canvas`本身进行裁剪（`canvas.clipPath()`、`canvas.clipOutPath()`）。



默认的初始坐标都是屏幕左上角(0, 0)。绝对坐标都是以左上角(0, 0)为原点进行计算的，相对坐标则是以`Path`中最后操作的点坐标为原点进行计算。

| 方法及分类               |                                                              |
| ------------------------ | ------------------------------------------------------------ |
| **操作点**               |                                                              |
| moveTo                   | 移动到绝对坐标，影响之后操作的起始点                         |
| rMoveTo                  | 移动到相对坐标，影响之后操作的起始点                         |
| setLastPoint             | 改变之前操作的最后一个点的坐标                               |
|                          |                                                              |
| **绘制直线**             |                                                              |
| lineTo                   | 从当前坐标连接到绝对坐标画一条直线                           |
| rLineTo                  | 从当前坐标连接到相对坐标画一条直线                           |
| close                    | 连接Path的终点与起点                                         |
|                          |                                                              |
| **绘制常规图形**         |                                                              |
| addRect                  | 绘制矩形                                                     |
| addRoundRect             | 绘制圆角矩形                                                 |
| addCircle                | 绘制圆                                                       |
| addOval                  | 绘制椭圆                                                     |
| addArc、arcTo            | 绘制圆弧                                                     |
|                          |                                                              |
| **绘制贝塞尔曲线**       |                                                              |
| quadTo、rQuadTo          | 绘制二阶贝塞尔曲线                                           |
| cubicTo、rCubicTo        | 绘制三阶贝塞尔曲线                                           |
|                          |                                                              |
| **直接操作Path**         |                                                              |
| set                      | 设置为其他的Path                                             |
| addPath                  | 添加其他的Path                                               |
| op                       | 配合Path.Op，可以改变两个Path重叠之后的显示效果              |
| offset                   | 平移变换Path                                                 |
| transform                | 配合Matrix，作平移变换、缩放变换等                           |
|                          |                                                              |
| **填充类型**             |                                                              |
| setFillType、getFillType | 设置、获取填充类型                                           |
| isInverseFillType        | 是否是INVERSE的填充类型，即：是否是INVERSE_EVEN_ODD或INVERSE_WINDING |
| toggleInverseFillType    | 反转填充类型，如：从EVEN_ODD切换到INVERSE_EVEN_ODD或者从INVERSE_EVEN_ODD切换到EVEN_ODD |
|                          |                                                              |
| **重置**                 |                                                              |
| reset                    | 清空Path的内容，不保留内部已经存在的数据结构，但保留FillType |
| rewind                   | 清空Path的内容，但保留内部已经存在的数据结构，可以更快复用   |
|                          |                                                              |
| **其他**                 |                                                              |
| approximate（API 26）    | 将连续的路径切割成不连续的点，一次将点相连组成线段，每个点被包装为float数组，每三个float为一组描述一个点，分别是线段的长度、点的x坐标、点的y坐标 |
| computeBounds            | 计算Path的边界。相当于得到一个可以包裹住整个Path的矩形       |
| incReserve               | 提示Path准备添加多少个点，可以优化Path的存储结构             |
| isConvex（API 21）       | 判断Path是否具有凸性。[凸性（数学术语）]([https://baike.baidu.com/item/%E5%87%B8%E6%80%A7/18895500?fr=aladdin](https://baike.baidu.com/item/凸性/18895500?fr=aladdin)) |
| isEmpty                  | 判断Path是否为空                                             |
| isRect                   | 判断Path是否为矩形                                           |



绘制几何图形的方法，也可以接收`Path.Direction`参数。该参数影响图形绘制的方向，例如物理世界中我们拿一只画笔去画圆，以顺时针或者顺时针的笔顺去画圆。

| Path.Direction     |                                      |
| ------------------ | ------------------------------------ |
| Path.Direction.CCW | counter-clockwise ，沿逆时针方向绘制 |
| Path.Direction.CW  | clockwise ，沿顺时针方向绘制         |



`Path.FillType`影响一个`Path`绘制的图形相互之间有重叠（即：路径相交）时的显示效果，效果也会被`Path.Direction`影响。

| Path.FillType                  |                                                              |
| ------------------------------ | ------------------------------------------------------------ |
| Path.FillType.EVEN_ODD         | 表示**奇偶原则**。从任意一点射出一条线，与图形的交线是奇数，则认为这个点在图形内部，需要绘制颜色；反之如果是偶数，则认为这个点在图形外部，不需要绘制颜色。 |
| Path.FillType.WINDING          | 表示**非零环绕原则**，从任意一点发射一条线，默认值是0，遇到顺时针交点则+1，遇到逆时针交点则-1，最终如果不等于0，则认为这个点是图形内部的点，则需要绘制颜色；反之，如果这个值是0，则认为这个点不在图形内部，则不需要绘制颜色。 |
| Path.FillType.INVERSE_EVEN_ODD | 与EVEN_ODD相反。                                             |
| Path.FillType.INVERSE_WINDING  | 与WINDING相反。                                              |



`Path.FillType`是对一个`Path`而言的，而`Path.Op`则影响的是对多个Path重叠（即：`Path`和`Path`之间的路径相交）时的显示效果。方法是`path1.op(path2)`，以调用方法的`Path`为`path1`，以作为入参的`Path`为`path2`。

| Path.Op                    |                                                |
| -------------------------- | ---------------------------------------------- |
| Path.Op.DIFFERENCE         | 抹去path1中与path2重合的部分                   |
| Path.Op.INTERSECT          | 保留path1与path2重合的部分                     |
| Path.Op.REVERSE_DIFFERENCE | 抹去path2中与path1重合的部分，与DIFFERENCE相反 |
| Path.Op.UNION              | 同时保留path1和path2                           |
| Path.Op.XOR                | 抹去path1与path2重合的部分，与INTERSECT相反    |

