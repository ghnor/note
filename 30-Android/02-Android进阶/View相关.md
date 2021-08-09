# View相关

* ViewRoot：连接WindowManager(外界访问Window的入口)和DecorView（顶级View）的纽带，View的三大流程均是通过ViewRoot来完成的。
* DecorView：DecorView是顶级View，本质就是一个FrameLayout包含了两个部分，标题栏和内容栏。内容栏id是content，也就是activity中setContentView所设置的部分，最终将布局添加到id为content的FrameLayout中

## 自定义View

[安卓自定义View教程目录](http://www.gcssloop.com/customview/CustomViewIndex/)

[Android应用自定义View绘制方法手册](https://blog.csdn.net/yanbober/article/details/50577855)

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
[Android View的绘制流程](https://jsonchao.github.io/2018/10/28/Android%20View%E7%9A%84%E7%BB%98%E5%88%B6%E6%B5%81%E7%A8%8B/)

郭神出品：  
[Android LayoutInflater原理分析，带你一步步深入了解View(一)](https://blog.csdn.net/guolin_blog/article/details/12921889)  
[Android视图绘制流程完全解析，带你一步步深入了解View(二)](https://blog.csdn.net/guolin_blog/article/details/16330267)  
[Android视图状态及重绘流程分析，带你一步步深入了解View(三)](https://blog.csdn.net/guolin_blog/article/details/17045157)  
[Android自定义View的实现方法，带你一步步深入了解View(四)](https://blog.csdn.net/guolin_blog/article/details/17357967)

View的绘制流程是从ViewRoot的PerformTraversals方法开始的。

performTraversals会依次调用performMeasure, performLayout, performDraw三个方法，这三个方法分别完成顶层View的measure,layout,draw方法，onMeasure又会调用所有子元素的measure过程，直到完成整个View树的遍历。同理，performLayout, performDraw的传递流程与performMeasure相似。唯一不同在于，performDraw的传递过程在draw方法中通过dispatchDraw实现，但没有本质区别。

### MeasureSpec

MeasureSpec表示的是一个32位的整形值，它的高2位表示测量模式SpecMode，低30位表示某种测量模式下的规格大小SpecSize。MeasureSpec是View类的一个静态内部类，用来说明应该如何测量这个View。

它有三种测量模式，如下：

* **EXACTLY**：精确测量模式，视图宽高指定为match_parent或具体数值时生效，表示父视图已经决定了子视图的精确大小，这种模式下View的测量值就是SpecSize的值。
* **AT_MOST**：最大值测量模式，当视图的宽高指定为wrap_content时生效，此时子视图的尺寸可以是不超过父视图允许的最大尺寸的任何尺寸。
* **UNSPECIFIED**：不指定测量模式, 父视图没有限制子视图的大小，子视图可以是想要的任何尺寸，通常用于系统内部，应用开发中很少用到。

MeasureSpec通过将SpecMode和SpecSize打包成一个int值来避免过多的对象内存分配，为了方便操作，其提供了打包和解包的方法，打包方法为makeMeasureSpec，解包方法为getMode和getSize。

普通View的MeasureSpec的创建规则如下：

![](https://shanghai-1252949174.cos.ap-shanghai.myqcloud.com/20190420/f43437c0678d6369.png)

对于DecorView而言，它的MeasureSpec由窗口尺寸和其自身的LayoutParams共同决定；对于普通的View，它的MeasureSpec由父视图的MeasureSpec和其自身的LayoutParams共同决定。

### Measure

1. 首先，在ViewGroup中的measureChildren()方法中会遍历测量ViewGroup中所有的View，当View的可见性处于GONE状态时，不对其进行测量。
2. 然后，测量某个指定的View时，根据父容器的MeasureSpec和子View的LayoutParams等信息计算子View的MeasureSpec。
3. 最后，将计算出的MeasureSpec传入View的measure方法，这里ViewGroup没有定义测量的具体过程，因为ViewGroup是一个抽象类，其测量过程的onMeasure方法需要各个子类去实现。不同的ViewGroup子类有不同的布局特性，这导致它们的测量细节各不相同，如果需要自定义测量过程，则子类可以重写这个方法。（setMeasureDimension方法用于设置View的测量宽高，如果View没有重写onMeasure方法，则会默认调用getDefaultSize来获得View的宽高）

#### getMeasureWidth（getMeasureHeight）和getWidth（getHeight）的区别

Measure过程后可以调用getMeasureWidth和getMeasureHeight方法获取View测量后的宽高，与getWidth和getHeight的区别是：getMeasuredHeight()返回的是原始测量高度，与屏幕无关，getHeight()返回的是在屏幕上显示的高度。实际上在当屏幕可以包裹内容的时候，他们的值是相等的，只有当view超出屏幕后，才能看出他们的区别。当超出屏幕后，getMeasuredHeight()等于getHeight()加上屏幕之外没有显示的高度。

#### getSuggestMinimumWidth分析

如果View没有设置背景，那么返回android:minWidth这个属性所指定的值，这个值可以为0；如果View设置了背景，则返回android:minWidth和背景的最小宽度这两者中的最大值。

#### 自定义View时手动处理wrap_content时的情形

直接继承View的控件需要重写onMeasure方法并设置wrap_content时的自身大小，否则在布局中使用wrap_content就相当于使用match_parent。此时，可以在wrap_content的情况下（对应MeasureSpec.AT_MOST）指定内部宽/高(mWidth和mHeight)。

#### 在Activity中获取某个View的宽高

由于View的measure过程和Activity的生命周期方法不是同步执行的，如果View还没有测量完毕，那么获得的宽/高就是0。所以在onCreate、onStart、onResume中均无法正确得到某个View的宽高信息。解决方式如下：

* Activity/View#onWindowFocusChanged：此时View已经初始化完毕，当Activity的窗口得到焦点和失去焦点时均会被调用一次，如果频繁地进行onResume和onPause，那么onWindowFocusChanged也会被频繁地调用。
* view.post(runnable)： 通过post可以将一个runnable投递到消息队列的尾部，始化好了然后等待Looper调用次runnable的时候，View也已经初始化好了。
* ViewTreeObserver#addOnGlobalLayoutListener：当View树的状态发生改变或者View树内部的View的可见性发生改变时，onGlobalLayout方法将被回调。
* View.measure(int widthMeasureSpec, int heightMeasureSpec)：match_parent时不知道parentSize的大小，测不出；具体数值时，直接makeMeasureSpec固定值，然后调用view..measure就可以了；wrap_content时，在最大化模式下，用View理论上能支持的最大值去构造MeasureSpec是合理的。

### Layout

Layout过程确定View四个顶点的位置和实际的宽高。

### Draw

![绘制过程](https://upload-images.jianshu.io/upload_images/2354038-dec64dea3ad60a0d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/477/format/webp)

![绘制顺序](https://upload-images.jianshu.io/upload_images/2354038-df280209213f573c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/479/format/webp)

* 在 ViewGroup 的子类中重写除 dispatchDraw() 以外的绘制方法时，可能需要调用 setWillNotDraw(false)（出于效率的考虑，ViewGroup 默认会绕过 draw() 方法，换而直接执行 dispatchDraw() 以此来简化绘制流程，ScrollView 等已调用过）
* 在重写的方法有多个选择时，优先选择 onDraw()（Andorid优化了无需绘制时自动跳过onDraw的重复执行，以提升开发效率）

#### setWillNotDraw的作用

如果一个View不需要绘制任何内容，那么设置这个标记位为true以后，系统会进行相应的优化。

* 默认情况下，View没有启用这个优化标记位，但是ViewGroup会默认启用这个优化标记位。
* 当我们的自定义控件继承于ViewGroup并且本身不具备绘制功能时，就可以开启这个标记位从而便于系统进行后续的优化。
* 当明确知道一个ViewGroup需要通过onDraw来绘制内容时，我们需要显示地关闭WILL_NOT_DRAW这个标记位。

## 自定义View的时怎么获取View的大小


## scrollTo()和scollBy()的区别

* scollBy内部调用了scrollTo，它是基于当前位置的相对滑动；而scrollTo是绝对滑动，因此如果使用相同输入参数多次调用scrollTo方法，由于View的初始位置是不变的，所以只会出现一次View滚动的效果
* 两者都只能对View内容的滑动，而非使View本身滑动。可以使用Scroller有过度滑动的效果

[View 的滑动原理和实现方式](https://www.jianshu.com/p/a177869b0382)

## Scroller是怎么实现View的弹性滑动

* 在MotionEvent.ACTION_UP事件触发时调用startScroll()方法，该方法并没有进行实际的滑动操作，而是记录滑动相关量（滑动距离、滑动时间）
* 接着调用invalidate/postInvalidate()方法，请求View重绘，导致View.draw方法被执行
* 当View重绘后会在draw方法中调用computeScroll方法，而computeScroll又会去向Scroller获取当前的scrollX和scrollY；然后通过scrollTo方法实现滑动；接着又调用postInvalidate方法来进行第二次重绘，和之前流程一样，如此反复导致View不断进行小幅度的滑动，而多次的小幅度滑动就组成了弹性滑动，直到整个滑动过成结束

![](https://user-gold-cdn.xitu.io/2019/3/8/1695c37ec2b0e11b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## requestLayout()，onLayout()，onDraw()，drawChild() 区别与联系？

requestLayout()方法 ：会导致调用 measure()过程 和 layout()过程，将会根据标志位判断是否需要ondraw。

onLayout()方法：如果该View是ViewGroup对象，需要实现该方法，对每个子视图进行布局。

onDraw()方法：绘制视图本身 (每个View都需要重载该方法，ViewGroup不需要实现该方法)。

drawChild()：去重新回调每个子视图的draw()方法。

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

## 双指缩放的实现

## SurfaceView和View的区别

* View需要在UI线程对画面进行刷新，而SurfaceView可在子线程进行页面的刷新
* View适用于主动更新的情况，而SurfaceView适用于被动更新，如频繁刷新，这是因为如果使用View频繁刷新会阻塞主线程，导致界面卡顿
* SurfaceView在底层已实现双缓冲机制，而View没有，因此SurfaceView更适用于需要频繁刷新、刷新时数据处理量很大的页面（如视频播放界面）

## Selector 是怎么实现的