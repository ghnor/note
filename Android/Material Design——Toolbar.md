## 基本使用

### 属性说明


### layout布局：activity_toolbar.xml
下面两种方式，在表现形式上有一点点区别，作为AppBarLayout的子View时，在Toolbar的下方会有一条阴影。

方式一：
```xml
<android.support.design.widget.AppBarLayout
	android:layout_width="match_parent"
	android:layout_height="wrap_content"
	android:theme="@style/AppTheme.AppBarOverlay">
	<android.support.v7.widget.Toolbar
		android:layout_width="match_parent"
		android:layout_height="?android:attr/actionBarSize"
		app:popupTheme="@style/AppTheme.PopupOverlay"
		android:id="@+id/toolbar">
	</android.support.v7.widget.Toolbar>
</android.support.design.widget.AppBarLayout>
```

方式二：
```xml
<android.support.v7.widget.Toolbar
	android:layout_width="match_parent"
	android:layout_height="?android:attr/actionBarSize"
	android:background="?colorPrimary"
	android:theme="@style/AppTheme.AppBarOverlay"
	app:popupTheme="@style/AppTheme.PopupOverlay"
	android:id="@+id/toolbar">
</android.support.v7.widget.Toolbar>
```
有几点特别说明：  
* `app:theme`设置Toolbar的样式。  
* `app:popupTheme`设置Toolbar的菜单弹窗的样式。  

一般来讲，View是不能设置theme的，但是Google提供了一部分特殊的ThemeOverlay样式，这些主题可以给View设置theme。  
上面设置给theme和popupTheme的两个style定义自styles.xml中：
```java
<style name="AppTheme.AppBarOverlay" parent="ThemeOverlay.AppCompat.Dark.ActionBar" />

<style name="AppTheme.PopupOverlay" parent="ThemeOverlay.AppCompat.Light" />
```
提供Toolbar黑底白字的样式，Toolbar菜单弹窗白底黑字的样式。

### Java代码：ToolbarActivity
```java
@Override
protected void onCreate(@Nullable Bundle savedInstanceState) {
	super.onCreate(savedInstanceState);
	setContentView(R.layout.activity_toolbar);
	Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
	setSupportActionBar(toolbar);
}
```

