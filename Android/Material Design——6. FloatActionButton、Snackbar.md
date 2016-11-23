# FloatActionButton

一个变相的ImageView。

## 属性介绍

* app:fabSize 定义FAB的大小，可选：[ auto | mini | normal ]

* app:elevation 普通状态下的阴影深度

* app:pressedTranslationZ 按下状态的阴影深度

* app:backgroundTint 默认的背景颜色

* app:rippleColor 按下时的背景颜色

* app:border border的宽度

* app:layout_anchor 定位于其他控件，表现形式就是中点跟其他控件的边界相交

* app:layout_anchorGravity 在其他控件上的相对位置

* app:useCompatPadding 设置内边距

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
            android:layout_height="240dp"
            android:id="@+id/collapsing_toolbar_layout"
            app:layout_scrollFlags="scroll|exitUntilCollapsed">
            <android.support.v7.widget.Toolbar
                android:id="@+id/toolbar"
                android:layout_width="match_parent"
                android:layout_height="?attr/actionBarSize"
                app:navigationIcon="?attr/homeAsUpIndicator"
                app:layout_collapseMode="pin">
            </android.support.v7.widget.Toolbar>
        </android.support.design.widget.CollapsingToolbarLayout>
    </android.support.design.widget.AppBarLayout>

    <android.support.design.widget.FloatingActionButton
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:src="@mipmap/ic_launcher"
        app:useCompatPadding="true"
        app:layout_anchor="@id/app_bar_layout"
        app:layout_anchorGravity="bottom|end"/>

    <android.support.design.widget.FloatingActionButton
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:src="@mipmap/ic_launcher"
        android:layout_margin="@dimen/spacing_16"
        android:layout_gravity="bottom|end"/>

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

与`AppBarLayout`和`CollapsingToolbarLayout`组合使用，将自身锚定在上面。`Toolbar`完全折叠时，FAB也会消失。

# Snackbar

类似于Toast的提示控件。

## Java代码
```java
@Override
protected void onCreate(@Nullable Bundle savedInstanceState) {
	super.onCreate(savedInstanceState);
	setContentView(R.layout.activity_floatactionbutton);

	Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
	setSupportActionBar(toolbar);

	FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
	fab.setOnClickListener(new View.OnClickListener() {
		@Override
		public void onClick(View view) {
			Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
					.setAction("Action", null).show();
		}
	});
}
```
