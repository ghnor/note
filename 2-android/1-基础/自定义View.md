# 自定义View

[安卓自定义View教程目录](http://www.gcssloop.com/customview/CustomViewIndex/)

[Android应用自定义View绘制方法手册](https://blog.csdn.net/yanbober/article/details/50577855)

[灵魂画师，Android绘制流程——Android高级UI](https://juejin.im/post/5c9adb5ff265da60c76ceb1c#heading-10)

* ViewRoot：连接WindowManager(外界访问Window的入口)和DecorView（顶级View）的纽带，View的三大流程均是通过ViewRoot来完成的。
* DecorView：DecorView是顶级View，本质就是一个FrameLayout包含了两个部分，标题栏和内容栏。内容栏id是content，也就是activity中setContentView所设置的部分，最终将布局添加到id为content的FrameLayout中

## View的绘制流程

View的绘制流程是从ViewRoot的PerformTraversals方法开始的。

performTraversals会依次调用performMeasure, performLayout, performDraw三个方法，这三个方法分别完成顶层View的measure,layout,draw方法，onMeasure又会调用所有子元素的measure过程，直到完成整个View树的遍历。同理，performLayout, performDraw的传递流程与performMeasure相似。唯一不同在于，performDraw的传递过程在draw方法中通过dispatchDraw实现，但没有本质区别。

Measure过程后可以调用getMeasureWidth和getMeasureHeight方法获取View测量后的宽高，与getWidth和getHeight的区别是：getMeasuredHeight()返回的是原始测量高度，与屏幕无关，getHeight()返回的是在屏幕上显示的高度。实际上在当屏幕可以包裹内容的时候，他们的值是相等的，只有当view超出屏幕后，才能看出他们的区别。当超出屏幕后，getMeasuredHeight()等于getHeight()加上屏幕之外没有显示的高度。

Layout过程确定View四个顶点的位置和实际的宽高。

Draw过程确定View的显示，只有draw方法完成后View的内容才会出现在屏幕上。

* 自定义 View 的流程？如何机型适配？
* 自定义 View 的时怎么获取 View 的大小？
* View 的事件传递分发机制？

##  requestLayout()，onLayout()，onDraw()，drawChild() 区别与联系？
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

## 如何计算一个 View 的嵌套层级？
##  onDraw()的顺序

![绘制过程](https://upload-images.jianshu.io/upload_images/2354038-dec64dea3ad60a0d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/477/format/webp)

![绘制顺序](https://upload-images.jianshu.io/upload_images/2354038-df280209213f573c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/479/format/webp)

* 在 ViewGroup 的子类中重写除 dispatchDraw() 以外的绘制方法时，可能需要调用 setWillNotDraw(false)（出于效率的考虑，ViewGroup 默认会绕过 draw() 方法，换而直接执行 dispatchDraw() 以此来简化绘制流程，ScrollView 等已调用过）
* 在重写的方法有多个选择时，优先选择 onDraw()（Andorid优化了无需绘制时自动跳过onDraw的重复执行，以提升开发效率）

## 双指缩放的实现？