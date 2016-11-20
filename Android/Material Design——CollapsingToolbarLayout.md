![](https://github.com/ghnor/TechNote/blob/master/assets/images/CollapsingToolbarLayout.gif)

## layout布局
```xml
<android.support.design.widget.CoordinatorLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fitsSystemWindows="true"
    tools:context=".collapsingtoolbarlayout.CollapsingToolbarLayoutActivity">

    <android.support.design.widget.AppBarLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:fitsSystemWindows="true"
        android:id="@+id/app_bar_layout"
        android:theme="@style/AppTheme.AppBarOverlay">
        <android.support.design.widget.CollapsingToolbarLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:id="@+id/collapsing_toolbar_layout"
            app:statusBarScrim="@android:color/transparent"
            app:layout_scrollFlags="scroll|exitUntilCollapsed"
            app:title="CollapsingToolbarLayout">
            <ImageView
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:fitsSystemWindows="true"
                app:layout_collapseMode="parallax"
                app:layout_collapseParallaxMultiplier="0.5"
                android:scaleType="centerCrop"
                android:src="@drawable/toolbar"/>
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                app:layout_collapseMode="pin"
                android:text="pin:固定不动"/>
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="bottom|right"
                android:text="pin:固定不动"/>
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="center_vertical"
                app:layout_collapseMode="parallax"
                android:text="parallax:\n视差滚动默认0.5"/>
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="center"
                app:layout_collapseParallaxMultiplier="0.25"
                app:layout_collapseMode="parallax"
                android:text="parallax:\n视差滚动0.25"/>
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="center_vertical|right"
                app:layout_collapseParallaxMultiplier="0.75"
                app:layout_collapseMode="parallax"
                android:text="parallax:\n视差滚动0.75"/>
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="bottom"
                app:layout_collapseMode="none"
                android:text="none:跟随滚动"/>
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="top|right"
                android:text="不设置:跟随滚动"/>
            <android.support.v7.widget.Toolbar
                android:id="@+id/toolbar"
                android:layout_width="match_parent"
                android:layout_height="?attr/actionBarSize"
                app:navigationIcon="?homeAsUpIndicator"
                app:layout_collapseMode="pin"
                app:title="Toolbar">
                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="真正的Toolbar区域"/>
            </android.support.v7.widget.Toolbar>
        </android.support.design.widget.CollapsingToolbarLayout>
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="AppBarLayout底部固定布局"
            android:padding="16dp"/>
    </android.support.design.widget.AppBarLayout>

    <android.support.v4.widget.NestedScrollView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_behavior="@string/appbar_scrolling_view_behavior">
        <TextView
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:text="@string/ipsum"/>
    </android.support.v4.widget.NestedScrollView>

</android.support.design.widget.CoordinatorLayout>
```

## CollapsingToolbarLayout属性说明
* `app:title`ToolBar的标题，当CollapsingToolbarLayout展开时，title显示的是大字体，在折叠的过程中，title不断变小到一定大小的效果。调用方法setTitle()。  
* `app:contentScrim`ToolBar被折叠到顶部固定时候的背景，调用方法setContentScrim()。  
* `app:statusBarScrim`折叠后状态栏的背景，调用方法setStatusBarScrim()。
* `app:scrimVisibleHeightTrigger`设置收起多少高度时，显示ContentScrim的内容。
* `app:scrimAnimationDuration`展开状态和折叠状态之间，内容转换的动画时间。

## CollapsingToolbarLayout子View属性说明
这两个属性是作为CollapsingToolbarLayout的子View才能设置并生效的。
* `app:layout_collapseMode`折叠模式  
`none`跟随滚动的手势进行折叠。  
`parallax`视差滚动，搭配layout_collapseParallaxMultiplier（视差因子）使用。  
`pin`固定不动。  
* `app:layout_collapseParallaxMultiplier`视差因子，范围：0-1，默认0.5。

## 注意
* 最顶层的布局必须是CoordinatorLayout。  
* CoordinatorLayout的直接子View必须是一个可滑动的控件，并且内部有内容可以滑动。同时需要设置`app:layout_behavior`。
* Toolbar的高度必须固定，不能设置为"wrap_content"，否则Toolbar不会滑动，也没有折叠效果。
