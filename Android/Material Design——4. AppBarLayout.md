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
            app:title="Toolbar"
            app:layout_scrollFlags="scroll">
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="真正的Toolbar区域"/>
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

## AppBarLayout子View属性说明
必须作为AppBarLayout的子View才能设置和生效。  
* `app:layout_scrollFlags`设置是否需要滚动，以及滚动的模式。  
`scroll`所有想滚动出屏幕的view都需要设置这个flag，没有设置这个flag的view将被固定在屏幕顶部。  
`enterAlways`任意向下的滚动都会导致该view变为可见，启用快速“返回模式”。  
`enterAlwaysCollapsed`同时设置minHeight属性，那么在初始化只显示设置的最小高度值，在手动向下滚动时，才扩大到完整高度。  
`exitUntilCollapsed`一直保持view在可滑动控件的顶部，跟enterAlways相反，这个是懒返回模式。
