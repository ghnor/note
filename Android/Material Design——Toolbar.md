# 基本使用

## 属性说明
设置导航图标（NavigationIcon/HomeAsUpIndicator）；  
设置Logo（Logo）；  
设置标题（Title）；  
设置副标题（Subtitle）。

方式一：
```xml
app:navigationIcon=""
app:logo=""
app:title=""
app:subtitle=""
```
方式二：
```java
Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
toolbar.setNavigationIcon();
toolbar.setLogo();
toolbar.setTitle();
toolbar.setSubtitle();
```
方式三：
```java
setSupportActionBar(toolbar);
getSupportActionBar().setHomeAsUpIndicator();
getSupportActionBar().setLogo();
getSupportActionBar().setTitle();
getSupportActionBar().setSubtitle();
```

**如果想要系统默认的返回图标：**

方式一：
```xml
app:navigationIcon="?attr/homeAsUpIndicator"
```
方式二：
```java
getSupportActionBar().setDisplayHomeAsUpEnabled(true);
```

## layout布局：activity_toolbar.xml
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
**有几点特别说明：**  
* `app:theme`设置Toolbar的样式。  
* `app:popupTheme`设置Toolbar的菜单弹窗的样式。  

一般来讲，View是不能设置theme的，但是Google提供了一部分特殊的ThemeOverlay样式，这些主题可以给View设置theme。  
上面设置给theme和popupTheme的两个style定义自styles.xml中：
```java
<style name="AppTheme.AppBarOverlay" parent="ThemeOverlay.AppCompat.Dark.ActionBar" />

<style name="AppTheme.PopupOverlay" parent="ThemeOverlay.AppCompat.Light" />
```
提供Toolbar黑底白字的样式，Toolbar菜单弹窗白底黑字的样式。

## 在Activity中使用：ToolbarActivity
```java
@Override
protected void onCreate(@Nullable Bundle savedInstanceState) {
	super.onCreate(savedInstanceState);
	setContentView(R.layout.activity_toolbar);
	Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
	setSupportActionBar(toolbar);
}
```

## 在Fragment中使用：ToolbarFragment
```java
@Nullable
@Override
public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
	View rootView = inflater.inflate(R.layout.activity_toolbar, container, false);

	Toolbar toolbar = (Toolbar) rootView.findViewById(R.id.toolbar);
	((AppCompatActivity) getActivity()).setSupportActionBar(toolbar);

	return rootView;
}
```

# Options Menu
在res下创建menu目录，再创建toolbar.xml：
```xml
<menu xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    tools:context=".toolbar.ToolbarActivity">
    <item
        android:id="@+id/action_settings"
        android:title="@string/action_settings"
        app:showAsAction="never" />
</menu>
```

## 在Activity中创建Options Menu
创建Toolbar的Options Menu，以及监听Options Menu的点击事件。  
如果调用过`setSupportActionBar(toolbar);`，那就只需要重写下面的方法：
```java
@Override
public boolean onCreateOptionsMenu(Menu menu) {
	getMenuInflater().inflate(R.menu.toolbar, menu);
	return true;
}

@Override
public boolean onOptionsItemSelected(MenuItem item) {

	switch (item.getItemId()) {
		case android.R.id.home:
			finish();
			return true;
		default:
			break;
	}

	return super.onOptionsItemSelected(item);
}
```

## 在Fragment中创建Options Menu

如果想让Fragment中的onCreateOptionsMenu生效必须先调用setHasOptionsMenu方法。
```java
@Override
public void onCreate(@Nullable Bundle savedInstanceState) {
	super.onCreate(savedInstanceState);
	setHasOptionsMenu(true);
}
```

同样，已经设置过`setSupportActionBar(toolbar);`，重写如下方法：
```java
@Override
public void onCreateOptionsMenu(Menu menu, MenuInflater inflater) {
	super.onCreateOptionsMenu(menu, inflater);
	inflater.inflate(R.menu.toolbar, menu);
}

@Override
public boolean onOptionsItemSelected(MenuItem item) {
	switch (item.getItemId()) {
		case android.R.id.home:
			getActivity().finish();
			return true;
		default:
			break;
	}

	return super.onOptionsItemSelected(item);
}
```

## 注意
* 导航按钮的id

设置导航图标（NavigationIcon/HomeAsUpIndicator），其默认id就是android.R.id.home。

* menu重复显示

系统会先执行Activity中的onCreateOptionsMenu，再执行Fragment中的onCreateOptionsMenu。

如果Fragment和Activity都同时inflate了一个menu资源文件，那么menu资源所包含的菜单会出现两次。

一开始，在activity中menu是空的，当调用了getMenuInflater().inflate(R.menu.main, menu)，menu中便有了菜单项。

而在执行到Fragment的(Menu menu, MenuInflater inflater)时，activity的menu就传递下来，作为第一个参数。

activity和Fragment中的menu其实是一个对象。

那么当存在一个Activity和多个Fragment，但又想显示不同的Options Menu时，可以在Fragment的onCreateOptionsMenu中调用`menu.clear();`。
```java
@Override
public void onCreateOptionsMenu(Menu menu, MenuInflater inflater) {
	super.onCreateOptionsMenu(menu, inflater);
	menu.clear();
	inflater.inflate(R.menu.toolbar, menu);
}
```

* menu事件重复响应

用`menu.clear()`可以解决inflate同一个menu资源文件时，重复显示的问题。

但是如果Activity和Fragment都对该menu响应的话，就会执行两次响应事件。

事件的执行顺序同样是显示执行Activity的onOptionsItemSelected，再执行Fragment的onOptionsItemSelected。

所以，如果业务上Activity具有更高的优先级，可以通过`return true;`，拦截试图传递到Fragment的事件。

但是如果Fragment具有更高的优先级的，就无解了。
