AppBarLayout其实就是一个垂直方向的LinearLayout，可以实现Material Design中标题栏的滚动效果。  
AppBarLayout的子View通过app:layout_scrollFlags属性或LayoutParams.setScrollFlags()方法来声明自身“滚动行为”。  
AppBarLayout只有作为CoordinatorLayout的直接子View时才能正常工作，为了让AppBarLayout能够知道何时滚动其子View，我们还应该在CoordinatorLayout布局中提供一个可滚动的scrolling view，如：NestedScrollView、RecyclerView...

说一点，普通的ScrollView也是可以的滚动的，却不能响应AppbarLayout的滚动行为。其中关键在于CoordiantorLayout和Behavior，可以看我之前的文章【CoordinatorLayout与Behavior的一己之见】，里面大致介绍了其中的原理，可以让你初窥门径。

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
        android:id="@+id/app_bar_layout"
        android:theme="@style/AppTheme.AppBarOverlay">
        <android.support.v7.widget.Toolbar
            android:id="@+id/toolbar"
            android:layout_width="match_parent"
            android:layout_height="?attr/actionBarSize"
            app:layout_scrollFlags="scroll">
        </android.support.v7.widget.Toolbar>
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

## ScrollFlags
必须作为AppBarLayout的子View才能生效，通过app:layout_scrollFlags属性或LayoutParams.setScrollFlags()设置。  

* `scroll`所有想获得滚动行为的view都需要设置，并同时设置具体的滚动行为，比如：`app:layout_scrollFlags="scroll|enterAlways"`。  

* `enterAlways`任意向下的滚动都会导致该view变为可见，启用快速“返回模式”。  

* `enterAlwaysCollapsed`同时设置minHeight属性，那么在初始化只显示设置的最小高度值，在手动向下滚动时，才扩大到完整高度。  

* `exitUntilCollapsed`一直保持view在可滑动控件的顶部，跟enterAlways相反，这个是懒返回模式。
