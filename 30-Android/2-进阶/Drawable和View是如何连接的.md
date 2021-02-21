https://blog.csdn.net/kongbaidepao/article/details/47018141

https://www.jianshu.com/p/92798b28725e

https://blog.csdn.net/RationalGo/article/details/9631019

https://blog.csdn.net/lilu_leo/article/details/8191989

<img src="https://shanghai-1252949174.cos.ap-shanghai.myqcloud.com/20201127112459ageTPp.png" alt="image-20201127112459580" style="zoom:50%;" />

Drawable可以理解为是屏幕上任何可见事物的抽象，一般认为的图片就是BitmapDrawable，文字其实也是绘制出来的也就能理解为是TextDrawable（当然实际上因为文本内容的特殊性不存在TextDrawable）。

常见的xml中定义的selector就是StateListDrawable。

Drawable的状态到底是如何跟View连接在一起的呢

首先看View和Drawable是如何初始化的。

对于View来说，通用的方式就是构造函数中解析xml获得的background和foreground，以及setBackground和setForeground设置的

View的点击事件、状态设置方法（setChecked、setVisible）等等，会触发Drawable状态改变，重新绘制视图。
