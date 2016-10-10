# 前言

许多文章都是将`CoordinatorLayout`、`AppbarLayout`、`CollapsingToolbarLayout`、`Toolbar`等放在一起介绍，容易误解为这几个布局一定要互相搭配，且仅仅适用于这些场景中。
其实不然，其中最重要的是`CoordinatorLayout`，我把它称为协调布局。协调什么布局呢？自然是嵌套在其内部的 Child View。
`CoordinatorLayout`充当了一个中间层的角色，一边接收其他组件的事件，一边将接收到的事件通知给内部的其他组件。
`Behavior`就是`CoordinatorLayout`传递事件的媒介，`Behavior` 定义了 `CoordinatorLayout` 中**直接子 View?**的行为规范，决定了当收到不同事件时，应该做怎样的处理。
总结来说，`Behavior`代理以下四种事件，其大致传递流程如下图：

![](https://github.com/ghnor/TechNote/assets/images/behavior-flux.png)

事件流好像很高深莫测的样子...，再简化一点的说法：`CoordinatorLayout`中的某个或某几个方法被其他类调用，之后`CoordinatorLayout`再调用`Behavior`中的某个或某几个方法（=。=好像更抽象了）。总之，让这四类事件现在脑子里有个印象就可以了。

接着先介绍一下自定义Behavior的通用流程。为什么是通用流程呢？因为上面提到了有四种事件流，根据不同的事件流，是要重写不同的方法的，会在下面一一说明。
# 自定义Behavior的通用流程
**1. 重写构造方法**
```java
public class CustomBehavior extends CoordinatorLayout.Behavior {

    public CustomBehavior(Context context, AttributeSet attrs) {
        super(context, attrs);
    }
}
```
一定要重写这个构造方法，因为当你在XML中设置该`Behavior`时，在 `CoordinatorLayout` 中会反射调用该方法，并生成该 `Behavior` 实例。
**2. 绑定到View**
绑定的方法有三种：
在 XML 文件中，设置任意 View 的属性
```java
app:layout_behavior="你的Behavior的包路径和类名"
```
或者在代码中：
```java
(CoordinatorLayout.LayoutParams)child.getLayoutParams().setBehavior();
```
再或者当你的View是自定义的View时。
在你的自定义View类上添加@DefaultBehavior(你的Behavior.class)。
```java
@DefaultBehavior(CustomBehavior.class)
public class CustomView extends View {}
```

**3. 判断依赖对象**
当 `CoordinatorLayout` 收到某个 view 的变化或者嵌套滑动事件时，`CoordinatorLayout`就会尝试把事件下发给`Behavior`，绑定了该 `Behavior` 的 view 就会对事件做出响应。

下面是这两个具有依赖的关系的view在`Behavior`方法中的形参名，方便读者分辨：
被动变化，也就是绑定了`Behavior`的view称为`child`
主动变化的view在「变化事件」中称为`dependency`；在「嵌套滑动事件」中称为`target`。

因为可能会存在很多的Child View可以向`CoordinatorLayout`发出消息，也同时存在很多的Child View拥有着不同的`Behavior`，那么在`CoordinatorLayout`将真正的事件传递进这个`Behavior`之前，肯定需要一个方法，告知`CoordinatorLayout`这两者的依赖关系是否成立。如果关系成立，那么就把事件下发给你，如果关系不成立，那咱就到此over。
下面以「变化事件」的`layoutDependsOn`说几个例子，「嵌套滑动事件」就在`onStartNestedScroll`中做同样的判断。另外的两种「布局事件」「触摸事件」就没有这一步了。
**a.根据id**
```java
@Override
public boolean layoutDependsOn(CoordinatorLayout parent, View child, View dependency) {
    return dependency.getId() == R.id.xxx;
}
```
**b.根据类型**
```java
@Override
public boolean layoutDependsOn(CoordinatorLayout parent, View child, View dependency) {
	return dependency instanceof CustomView;
}
```
**c.根据id的另一种写法**
```java
<declare-styleable name="Follow">
	<attr name="target" format="reference"/>
</declare-styleable>
```
先自定义target这个属性。
```java
<android.support.design.widget.CoordinatorLayout    
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:orientation="vertical"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fitsSystemWindows="true"
    tools:context=".MainActivity">

    <View
        android:id="@+id/first"
        android:layout_width="match_parent"
        android:layout_height="128dp"
        android:background="@android:color/holo_blue_light"/>

    <View
        android:id="@+id/second"
        android:layout_width="match_parent"
        android:layout_height="128dp"
        app:layout_behavior=".FollowBehavior"
        app:target="@id/first"
        android:background="@android:color/holo_green_light"/>

</android.support.design.widget.CoordinatorLayout>
```
```java
public class FollowBehavior extends CoordinatorLayout.Behavior {
	private int targetId;

	public FollowBehavior(Context context, AttributeSet attrs) {
		super(context, attrs);
		TypedArray a = context.obtainStyledAttributes(attrs, R.styleable.Follow);
		for (int i = 0; i < a.getIndexCount(); i++) {
			int attr = a.getIndex(i);
			if(a.getIndex(i) == R.styleable.Follow_target){
				targetId = a.getResourceId(attr, -1);
			}
		}
		a.recycle();
	}

	@Override
	public boolean onDependentViewChanged(CoordinatorLayout parent, View child, View dependency) {

		return true;
	}

	@Override
	public boolean layoutDependsOn(CoordinatorLayout parent, View child, View dependency) {
		return dependency.getId() == targetId;
	}
}
```

# 四种不同的事件流

## 1. 触摸事件
TouchEvent 最主要的方法就是两个：
```java
public boolean onInterceptTouchEvent(MotionEvent ev)
public boolean onTouchEvent(MotionEvent ev)
```
在 `CoordinatorLayout` 的 `onInterceptTouchEvent` 和 `onTouchEvent` 方法中，会尝试调用其 Child View 拥有的 `Behavior` 中的同名方法。
```java
public boolean onInterceptTouchEvent(CoordinatorLayout parent, View child, MotionEvent ev)
public boolean onTouchEvent(CoordinatorLayout parent, View child, MotionEvent ev)
```
如果 `Behavior` 对触摸事件进行了拦截，就不会再分发到 Child View 自身拥有的触摸事件中。
这就意味着：**在不知道具体View的情况下，就可以重写它的触摸事件。**
然而有一点我们需要注意到的是：**onTouch事件是CoordinatorLayout分发下来的，所以这里的onTouchEvent并不是我们控件自己的onTouch事件**，也就是说，你假如手指不在我们的控件上滑动，也会触发onTouchEvent。
需要在`onTouchEvent`方法中的`MotionEvent.ACTION_DOWN`下添加：
```java
ox = ev.getX();
oy = ev.getY();
if (oy < child.getTop() || oy > child.getBottom() || ox < child.getLeft() || ox > child.getRight()) { 
	return true;
}
```
对手势的位置进行过滤，不是我们控件范围内的，舍弃掉。
## 2. 布局事件
视图布局无非就是这两个方法：
```java
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec)
protected void onLayout(boolean changed, int l, int t, int r, int b)
```
在 `CoordinatorLayout` 的 `onMeasure ` 和 `onLayout` 方法中，也会尝试调用其 Child View 拥有的 `Behavior` 中对应的方法，分别是：
```java
public boolean onMeasureChild(CoordinatorLayout parent, V child, int parentWidthMeasureSpec, int widthUsed,
								int parentHeightMeasureSpec, int heightUsed)
public boolean onLayoutChild(CoordinatorLayout parent, V child, int layoutDirection)
```
同样地，`CoordinatorLayout` 会优先处理 `Behavior` 中所重写的布局事件。

## 3. 变化事件
这个变化是指 View 的位置、尺寸发生了变化。
在 `CoordinatorLayout` 的 `onDraw` 方法中，会遍历全部的 Child View 尝试寻找是否有相互关联的对象。
确定是否关联的方式有两种：
**1. Behavior中定义**
通过 `Behavior` 的 `layoutDependsOn` 方法来判断是否有依赖关系，如果有就继续调用 `onDependentViewChanged`。FloatActionButton 可以在 Snackbar 弹出时主动上移就通过该方式实现。
```java
/**
 * 判断是dependency是否是当前behavior需要的对象
 * @param parent CoordinatorLayout
 * @param child 该Behavior对应的那个View
 * @param dependency dependency 要检查的View(child是否要依赖这个dependency)
 * @return true 依赖, false 不依赖
 */
@Override
public boolean layoutDependsOn(CoordinatorLayout parent, Button child, View dependency) {
	return false;
}

/**
 * 当改变dependency的尺寸或者位置时被调用
 * @param parent CoordinatorLayout
 * @param child  该Behavior对应的那个View
 * @param dependency child依赖dependency
 * @return true 处理了, false 没处理
 */
@Override
public boolean onDependentViewChanged(CoordinatorLayout parent, Button child, View dependency) {
	return false;
}

/**
 * 在layoutDependsOn返回true的基础上之后，通知dependency被移除了
 * @param parent CoordinatorLayout
 * @param child 该Behavior对应的那个View
 * @param dependency child依赖dependency
 */
@Override
public void onDependentViewRemoved(CoordinatorLayout parent, Button child, View dependency) {
	
}
```
**2. XML中设置属性**
通过 XML 中设置的 `layout_anchor`，关联设置了 `layout_anchor` 的 Child View 与 `layout_anchor` 对应的目标 dependency View。随后调用 `offsetChildToAnchor(child, layoutDirection);`，其实就是调整两者的位置，让它们可以一起变化。FloatActionButton 可以跟随 Toolbar 上下移动就是该方式实现。
```java
app:layout_anchor="@id/dependencyView.id"
```

## 4. 嵌套滑动事件 
**实现NestedScrollingChild**
如果一个View想向外界传递滑动事件，即通知 NestedScrollingParent?，就必须实现此接口。
而 Child 与 Parent 的具体交互逻辑，?[NestedScrollingChildHelper](https://developer.android.com/reference/android/support/v4/view/NestedScrollingChildHelper.html) 辅助类基本已经帮我们封装好了，所以我们只需要调用对应的方法即可。
NestedScrollingChild接口的一般实现：
```java
public class CustomNestedScrollingChildView extends View implements NestedScrollingChild {

    private NestedScrollingChildHelper mChildHelper = new NestedScrollingChildHelper(this);

    /**
     * 设置当前View能否滑动
     * @param enabled
     */
    @Override
    public void setNestedScrollingEnabled(boolean enabled) {
        mChildHelper.setNestedScrollingEnabled(enabled);
    }

    /**
     * 判断当前View能否滑动
     * @return
     */
    @Override
    public boolean isNestedScrollingEnabled() {
        return mChildHelper.isNestedScrollingEnabled();
    }

    /**
     * 启动嵌套滑动事件流
     * 1. 寻找可以接收 NestedScroll 事件的 parent view，即实现了 NestedScrollingParent 接口的 ViewGroup
     * 2. 通知该 parent view，现在我要把滑动的参数传递给你
     * @param axes
     * @return
     */
    @Override
    public boolean startNestedScroll(int axes) {
        return mChildHelper.startNestedScroll(axes);
    }

    /**
     * 停止嵌套滑动事件流
     */
    @Override
    public void stopNestedScroll() {
        mChildHelper.stopNestedScroll();
    }

    /**
     * 是否存在接收 NestedScroll 事件的 parent view
     * @return
     */
    @Override
    public boolean hasNestedScrollingParent() {
        return mChildHelper.hasNestedScrollingParent();
    }

    /**
     * 在滑动之后，向父view汇报滚动情况，包括child view消费的部分和child view没有消费的部分。
     * @param dxConsumed x方向已消费的滑动距离
     * @param dyConsumed y方向已消费的滑动距离
     * @param dxUnconsumed x方向未消费的滑动距离
     * @param dyUnconsumed y方向未消费的滑动距离
     * @param offsetInWindow 如果parent view滑动导致child view的窗口发生了变化（child View的位置发生了变化）
     *                       该参数返回x(offsetInWindow[0]) y(offsetInWindow[1])方向的变化
     *                       如果你记录了手指最后的位置，需要根据参数offsetInWindow计算偏移量，
     *                       才能保证下一次的touch事件的计算是正确的。
     * @return 如果parent view接受了它的滚动参数，进行了部分消费，则这个函数返回true，否则为false。
     */
    @Override
    public boolean dispatchNestedScroll(int dxConsumed, int dyConsumed, int dxUnconsumed,
                                        int dyUnconsumed, int[] offsetInWindow) {
        return mChildHelper.dispatchNestedScroll(dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed,
                offsetInWindow);
    }

    /**
     * 在滑动之前，先问一下 parent view 是否需要滑动，
     * 即child view的onInterceptTouchEvent或onTouchEvent方法中调用。
     * 1. 如果parent view滑动了一定距离，你需要重新计算一下parent view滑动后剩下给你的滑动距离剩余量，
     *      然后自己进行剩余的滑动。
     * 2. 该方法的第三第四个参数返回parent view消费掉的滑动距离和child view的窗口偏移量，
     *      如果你记录了手指最后的位置，需要根据第四个参数offsetInWindow计算偏移量，
     *      才能保证下一次的touch事件的计算是正确的。
     * @param dx x方向的滑动距离
     * @param dy y方向的滑动距离
     * @param consumed 如果不是null, 则告诉child view现在parent view滑动的情况，
     *                 consumed[0]parent view告诉child view水平方向滑动的距离(dx)
     *                 consumed[1]parent view告诉child view垂直方向滑动的距离(dy)
     * @param offsetInWindow 可选 length=2 的数组，
     *                       如果parent view滑动导致child View的窗口发生了变化（子View的位置发生了变化）
     *                       该参数返回x(offsetInWindow[0]) y(offsetInWindow[1])方向的变化
     *                       如果你记录了手指最后的位置，需要根据参数offsetInWindow计算偏移量，
     *                       才能保证下一次的touch事件的计算是正确的。
     * @return 如果parent view对滑动距离进行了部分消费，则这个函数返回true，否则为false。
     */
    @Override
    public boolean dispatchNestedPreScroll(int dx, int dy, int[] consumed, int[] offsetInWindow) {
        return mChildHelper.dispatchNestedPreScroll(dx, dy, consumed, offsetInWindow);
    }

    /**
     * 在嵌套滑动的child view快速滑动之后再调用该函数向parent view汇报快速滑动情况。
     * @param velocityX 水平方向的速度
     * @param velocityY 垂直方向的速度
     * @param consumed true 表示child view快速滑动了, false 表示child view没有快速滑动
     * @return true 表示parent view快速滑动了, false 表示parent view没有快速滑动
     */
    @Override
    public boolean dispatchNestedFling(float velocityX, float velocityY, boolean consumed) {
        return mChildHelper.dispatchNestedFling(velocityX, velocityY, consumed);
    }

    /**
     * 在嵌套滑动的child view快速滑动之前告诉parent view快速滑动的情况。
     * @param velocityX 水平方向的速度
     * @param velocityY 垂直方向的速度
     * @return true 表示parent view快速滑动了, false 表示parent view没有快速滑动
     */
    @Override
    public boolean dispatchNestedPreFling(float velocityX, float velocityY) {
        return mChildHelper.dispatchNestedPreFling(velocityX, velocityY);
    }
```
**实现NestedScrollingParent**
如果一个View Group想接收来自 NestedScrollingChild 的滑动事件，就需要实现该接口。
同样有一个?[NestedScrollingParentHelper
](https://developer.android.com/reference/android/support/v4/view/NestedScrollingParentHelper.html) 辅助类，帮我们封装好了 parent view 与 child view之间的具体交互逻辑。
由 NestedScrollingChild 主动发出滑动事件传递给 NestedScrollingParent，NestedScrollingParent 做出响应。 
之间的调用关系如下表所示：

|Child View|Parent View|
|---------|---------|
|  startNestedScroll  |  onStartNestedScroll、onNestedScrollAccepted  |
|  dispatchNestedPreScroll  |  onNestedPreScroll  |
|  dispatchNestedScroll  |  onNestedScroll  |
|  stopNestedScroll  |  onStopNestedScroll  |
|  dispatchNestedFling  |  onNestedFling  |
|  dispatchNestedPreFling  |  onNestedPreFling  |

**继承Behavior**
在上面的说明中提到 Parent View 会消费一部分或全部的滑动距离，但其实大部分情况下，我们的 Parent View 自身并不会消费滑动距离，都是传递给 `Behavior`，也就是拥有这个 `Behavior` 的 Child View 才是真正消费滑动距离的实例。
`Behavior` 拥有与 `NestedScrollingParent?` 接口完全同名的方法。在每一个 `NestedScrollingParent?` 的方法中都会调用 `Behavior` 中的同名方法。
有这么几个方法做下特别说明：
```java
/**
 * 开始嵌套滑动的时候被调用
 * 1. 需要判断滑动的方向是否是我们需要的。
 *      nestedScrollAxes == ViewCompat.SCROLL_AXIS_HORIZONTAL 表示是水平方向的滑动
 *      nestedScrollAxes == ViewCompat.SCROLL_AXIS_VERTICAL 表示是竖直方向的滑动
 * 2. 返回 true 表示继续接收后续的滑动事件，返回 false 表示不再接收后续滑动事件
 */
@Override
public boolean onStartNestedScroll(CoordinatorLayout coordinatorLayout, View child,
								   View directTargetChild, View target, int nestedScrollAxes) {
}

/**
 * 滑动中调用
 * 1. 正在上滑：dyConsumed > 0 && dyUnconsumed == 0
 * 2. 已经到顶部了还在上滑：dyConsumed == 0 && dyUnconsumed > 0
 * 3. 正在下滑：dyConsumed < 0 && dyUnconsumed == 0
 * 4. 已经打底部了还在下滑：dyConsumed == 0 && dyUnconsumed < 0
 */
@Override
public void onNestedScroll(CoordinatorLayout coordinatorLayout, View child, View target,
						   int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed) {
}

/**
 * 快速滑动中调用
 */
@Override
public boolean onNestedFling(CoordinatorLayout coordinatorLayout, View child, View target,
							 float velocityX, float velocityY, boolean consumed) {
}
```

# 总结
总结一下这四种事件流，和各自需要实现的方法。
根据在`自定义Behavior`时是否需要判断依赖关系，把`Behavior`代理的四种情况分成两类：
事件来自外部父view：
1.布局事件：`Behavior`的 `onMeasureChild`+`onLayoutChild`
2.触摸事件：`Behavior`的`onInterceptTouchEvent`+`onTouchEvent`
事件来自内部子view：
3.view变化事件：`Behavior`的`layoutDependsOn`+`onDependentViewChanged`+`onDependentViewRemoved`
4.嵌套滑动事件：`Behavior`的`onStartNestedScroll`+`onNestedScrollAccepted`+`onStopNestedScroll`+`onNestedScroll`+
`onNestedPreScroll`+`onNestedFling`+`onNestedPreFling`

# 后记
之前在Google、百度`自定义Behavior`造轮子的时候，刚开始看一篇，觉得不过如此，就这么点东西。再看一篇，咦~实现怎么又不一样了，再来一篇又不一样了。
本文就是想起一个大纲的作用，轮子再怎么造，还是这么些个方法。以后再看别人的轮子或者自己造轮子的时候，可以清晰一些。

# 扩展
[sidhu眼中的CoordinatorLayout.Behavior（一）](https://segmentfault.com/a/1190000006657044)
[sidhu眼中的CoordinatorLayout.Behavior（二）](https://segmentfault.com/a/1190000006665225)
[sidhu眼中的CoordinatorLayout.Behavior（三）](https://segmentfault.com/a/1190000006666005)
[Material Design系列，自定义Behavior支持所有View](http://blog.csdn.net/yanzhenjie1003/article/details/52205665)
[CoordinatorLayout的使用如此简单](http://blog.csdn.net/huachao1001/article/details/51554608)