## 布局优化

屏幕上的某个像素在同一帧的时间内被绘制了多次。在多层次的UI结构里面，如果不可见的UI也在做绘制的操作，这就会导致某些像素区域被绘制了多次。这就浪费大量的CPU以及GPU资源。

* 如果父控件有颜色，也是自己需要的颜色，那么就不必在子控件加背景颜色
* 如果每个自控件的颜色不太一样，而且可以完全覆盖父控件，那么就不需要再父控件上加背景颜色
* 尽量减少不必要的嵌套
* 能用LinearLayout和FrameLayout，就不要用RelativeLayout，因为RelativeLayout控件相对比较复杂，测绘也想要耗时。
* 使用include和merge增加复用，减少层级
* ViewStub按需加载，更加轻便
* 复杂界面可选择ConstraintLayout，可有效减少层级

## 绘制优化

Android系统每隔16ms发出VSYNC信号，触发对UI进行渲染。View的绘制频率保证60fps是最佳的，这就要求每帧绘制时间不超过16ms(16ms = 1000/60)，虽然程序很难保证16ms这个时间，但是尽量降低onDraw方法中的复杂度总是切实有效的。

* onDraw中不要创建新的局部对象
* onDraw方法中不要做耗时的任务

> [Android性能工具——Systrace使用](https://blog.csdn.net/vicwudi/article/details/100191529)

