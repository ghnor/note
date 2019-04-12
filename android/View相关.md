# View相关

## 自定义View

[安卓自定义View教程目录](http://www.gcssloop.com/customview/CustomViewIndex/)

[Android应用自定义View绘制方法手册](https://blog.csdn.net/yanbober/article/details/50577855)

* ViewRoot：连接WindowManager(外界访问Window的入口)和DecorView（顶级View）的纽带，View的三大流程均是通过ViewRoot来完成的。
* DecorView：DecorView是顶级View，本质就是一个FrameLayout包含了两个部分，标题栏和内容栏。内容栏id是content，也就是activity中setContentView所设置的部分，最终将布局添加到id为content的FrameLayout中

### 自定义View如何考虑机型适配

* 合理使用warp_content，match_parent
* 尽可能的是使用RelativeLayout
* 针对不同的机型，使用不同的布局文件放在对应的目录下，android会自动匹配
* 尽量使用点9图片
* 使用与密度无关的像素单位dp，sp
* 引入android的百分比布局
* 切图的时候切大分辨率的图，应用到布局当中。在小分辨率的手机上也会有很好的显示效果

## View的绘制流程

[灵魂画师，Android绘制流程——Android高级UI](https://juejin.im/post/5c9adb5ff265da60c76ceb1c#heading-10)  
[Android View的绘制流程](https://www.jianshu.com/p/5a71014e7b1b)  
[Android应用层View绘制流程与源码分析](https://blog.csdn.net/yanbober/article/details/46128379)

郭神出品：  
[Android LayoutInflater原理分析，带你一步步深入了解View(一)](https://blog.csdn.net/guolin_blog/article/details/12921889)  
[Android视图绘制流程完全解析，带你一步步深入了解View(二)](https://blog.csdn.net/guolin_blog/article/details/16330267)  
[Android视图状态及重绘流程分析，带你一步步深入了解View(三)](https://blog.csdn.net/guolin_blog/article/details/17045157)  
[Android自定义View的实现方法，带你一步步深入了解View(四)](https://blog.csdn.net/guolin_blog/article/details/17357967)

---

View的绘制流程是从ViewRoot的PerformTraversals方法开始的。

performTraversals会依次调用performMeasure, performLayout, performDraw三个方法，这三个方法分别完成顶层View的measure,layout,draw方法，onMeasure又会调用所有子元素的measure过程，直到完成整个View树的遍历。同理，performLayout, performDraw的传递流程与performMeasure相似。唯一不同在于，performDraw的传递过程在draw方法中通过dispatchDraw实现，但没有本质区别。

Measure过程后可以调用getMeasureWidth和getMeasureHeight方法获取View测量后的宽高，与getWidth和getHeight的区别是：getMeasuredHeight()返回的是原始测量高度，与屏幕无关，getHeight()返回的是在屏幕上显示的高度。实际上在当屏幕可以包裹内容的时候，他们的值是相等的，只有当view超出屏幕后，才能看出他们的区别。当超出屏幕后，getMeasuredHeight()等于getHeight()加上屏幕之外没有显示的高度。

Layout过程确定View四个顶点的位置和实际的宽高。

Draw过程确定View的显示，只有draw方法完成后View的内容才会出现在屏幕上。

## 自定义 View 的流程？如何机型适配？
## 自定义 View 的时怎么获取 View 的大小？
## View 的事件传递分发机制？

郭神出品：  
[Android事件分发机制完全解析，带你从源码的角度彻底理解(上)](https://blog.csdn.net/guolin_blog/article/details/9097463)  
[Android事件分发机制完全解析，带你从源码的角度彻底理解(下)](https://blog.csdn.net/guolin_blog/article/details/9153747)

鸿洋出品：  
[Android View 事件分发机制 源码解析 （上）](https://blog.csdn.net/lmj623565791/article/details/38960443)  
[Android ViewGroup事件分发机制](https://blog.csdn.net/lmj623565791/article/details/39102591)

[面试：讲讲 Android 的事件分发机制](https://www.jianshu.com/p/d3758eef1f72)  

## View的事件冲突

常见开发中事件冲突的有ScrollView与RecyclerView的滑动冲突、RecyclerView内嵌同时滑动同一方向。

滑动冲突的处理规则：
* 对于由于外部滑动和内部滑动方向不一致导致的滑动冲突，可以根据滑动的方向判断谁来拦截事件。
* 对于由于外部滑动方向和内部滑动方向一致导致的滑动冲突，可以根据业务需求，规定何时让外部View拦截事件，何时由内部View拦截事件。
* 对于上面两种情况的嵌套，相对复杂，可同样根据需求在业务上找到突破点。

滑动冲突的实现方法：
* 外部拦截法：指点击事件都先经过父容器的拦截处理，如果父容器需要此事件就拦截，否则就不拦截。具体方法：需要重写父容器的onInterceptTouchEvent方法，在内部做出相应的拦截。
* 内部拦截法：指父容器不拦截任何事件，而将所有的事件都传递给子容器，如果子容器需要此事件就直接消耗，否则就交由父容器进行处理。具体方法：需要配合requestDisallowInterceptTouchEvent方法。

## scrollTo()和scollBy()的区别

* scollBy内部调用了scrollTo，它是基于当前位置的相对滑动；而scrollTo是绝对滑动，因此如果使用相同输入参数多次调用scrollTo方法，由于View的初始位置是不变的，所以只会出现一次View滚动的效果
* 两者都只能对View内容的滑动，而非使View本身滑动。可以使用Scroller有过度滑动的效果

---

[View 的滑动原理和实现方式](https://www.jianshu.com/p/a177869b0382)

## Scroller是怎么实现View的弹性滑动

* 在MotionEvent.ACTION_UP事件触发时调用startScroll()方法，该方法并没有进行实际的滑动操作，而是记录滑动相关量（滑动距离、滑动时间）
* 接着调用invalidate/postInvalidate()方法，请求View重绘，导致View.draw方法被执行
* 当View重绘后会在draw方法中调用computeScroll方法，而computeScroll又会去向Scroller获取当前的scrollX和scrollY；然后通过scrollTo方法实现滑动；接着又调用postInvalidate方法来进行第二次重绘，和之前流程一样，如此反复导致View不断进行小幅度的滑动，而多次的小幅度滑动就组成了弹性滑动，直到整个滑动过成结束

![](https://user-gold-cdn.xitu.io/2019/3/8/1695c37ec2b0e11b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## requestLayout()，onLayout()，onDraw()，drawChild() 区别与联系？
## invalidate() 和 postInvalidate() 以及 requestLayout() 的区别？

invalidate()和postInvalidate()都会递归调用父View的invalidateChildInParent()方法，直到调用ViewRootImpl的invalidateChildInParent()方法，最终触发ViewRootImpl的performTraversals()方法，此时mLayoutRequestede为false，不会触发onMesaure()与onLayout()方法，有可能会触发onDraw()方法。

共同点：都是调用onDraw()方法，然后去达到重绘view的目的。

区别：invalidate()用于主线程，postInvalidate()用于子线程。

requestLayout()也会递归调用父窗口的requestLayout()方法，直到触发ViewRootImpl的performTraversals()方法，此时mLayoutRequestede为true，会触发onMesaure()与onLayout()方法，不一定会触发onDraw()方法。

当view确定自身已经不再适合现有的区域时，该view本身调用这个方法要求parent view(父类的视图)重新调用他的onMeasure、onLayout来重新设置自己位置。特别是当view的layoutparameter发生改变，并且它的值还没能应用到view上时，这时候适合调用这个方法requestLayout()。requestLayout调用onMeasure和onLayout，不一定调用onDraw()。

## requestLayout()何时不会触发onDraw()？

如果没有改变控件的leftrighttopbottom就不会触发onDraw()，即没有改变View自身的大小。

## invalidate()在什么情况下不会触发onDraw()？

在ViewGroup中，invalidate()默认不重新绘制子view。

## 如何让ViewGroup在invalidate()时会触发onDraw()？

本质需要将ViewGroup的dirtyOpaque设置为false。

* 在构造函数中调用setWillNotDraw(false);
* 给ViewGroup设置背景。调用setBackground。

## 如何计算一个 View 的嵌套层级
##  onDraw()的顺序

![绘制过程](https://upload-images.jianshu.io/upload_images/2354038-dec64dea3ad60a0d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/477/format/webp)

![绘制顺序](https://upload-images.jianshu.io/upload_images/2354038-df280209213f573c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/479/format/webp)

* 在 ViewGroup 的子类中重写除 dispatchDraw() 以外的绘制方法时，可能需要调用 setWillNotDraw(false)（出于效率的考虑，ViewGroup 默认会绕过 draw() 方法，换而直接执行 dispatchDraw() 以此来简化绘制流程，ScrollView 等已调用过）
* 在重写的方法有多个选择时，优先选择 onDraw()（Andorid优化了无需绘制时自动跳过onDraw的重复执行，以提升开发效率）

## 双指缩放的实现

## SurfaceView和View的区别

* View需要在UI线程对画面进行刷新，而SurfaceView可在子线程进行页面的刷新
* View适用于主动更新的情况，而SurfaceView适用于被动更新，如频繁刷新，这是因为如果使用View频繁刷新会阻塞主线程，导致界面卡顿
* SurfaceView在底层已实现双缓冲机制，而View没有，因此SurfaceView更适用于需要频繁刷新、刷新时数据处理量很大的页面（如视频播放界面）