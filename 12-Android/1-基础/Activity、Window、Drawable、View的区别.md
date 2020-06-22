# Activity、Window、Drawable、View的区别

Activity 创建时通过attach()初始化了一个 Window 也就是 PhoneWindow，一个 PhoneWindow 持有一个 DecorView 的实例，DecorView 本身是一个 FrameLayout，继承于View，Activty通过setContentView将xml布局控件不断addView()添加到View中，最终显示到Window与我们交互；

[Activity、View、Window的理解一篇文章就够了](https://blog.csdn.net/zane402075316/article/details/69822438)

[简析Window、Activity、DecorView以及ViewRoot之间的错综关系](https://www.jianshu.com/p/8766babc40e0)