用以实现Android中的抽屉样式，在Google自己推出BottomNavigation之前，抽屉样式的交互可谓Material Design的标杆。

添加内容布局作为DrawerLayout的首个子view，并设置宽高为`match_parent`，不能设置`layout_gravity`。

在内容布局之下添加抽屉布局，设置`layout_gravity`，控制其在屏幕的左或右出现。一般设置高度`match_parent`，宽度`wrap_content`。不能设置多个抽屉布局，会报错。

抽屉布局呢，其实任意view都可以，但是Material Design中推荐使用NavigationView。

# 定义Style

首先修改下我们之前的styles.xml文件，设置状态栏为透明。

在《Material Design ( 1 ) - 主题样式》的基础上，再添加如下：  
在res/values/styles.xml中添加：
```xml
<style name="AppTheme.Fit" parent="AppTheme.NoActionBar"/>
```
在res/values-v21/styles.xml中添加：
```xml
<style name="AppTheme.Fit" parent="AppTheme.NoActionBar">
	<item name="android:statusBarColor">@android:color/transparent</item>
</style>
```
# NavigationView

完整的NavigationView由头部自定义布局，下部分的menu布局组成。  
`app:headerLayout`设置头部布局。  
`app:menu`设置menu布局。  

## 定义NavigationView头部布局
在res/layout下创建 nav_header_main.xml：
```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="@dimen/nav_header_height"
    android:background="@drawable/side_nav_bar"
    android:gravity="bottom"
    android:orientation="vertical"
    android:padding="@dimen/spacing_16"
    android:theme="@style/ThemeOverlay.AppCompat.Dark">

    <ImageView
        android:id="@+id/imageView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:paddingTop="@dimen/nav_header_spacing"
        app:srcCompat="@android:drawable/sym_def_app_icon" />

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:paddingTop="@dimen/nav_header_spacing"
        android:text="Android Studio"
        android:textAppearance="@style/TextAppearance.AppCompat.Body1" />

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="android.studio@android.com" />

</LinearLayout>
```

## 定义NavigationView的menu内容
在res/menu下创建 drawer_layout.xml：
```xml
<menu xmlns:android="http://schemas.android.com/apk/res/android">

    <group android:checkableBehavior="single">
        <item
            android:id="@+id/nav_camera"
            android:icon="@drawable/ic_menu_camera"
            android:title="Import" />
        <item
            android:id="@+id/nav_gallery"
            android:icon="@drawable/ic_menu_gallery"
            android:title="Gallery" />
        <item
            android:id="@+id/nav_slideshow"
            android:icon="@drawable/ic_menu_slideshow"
            android:title="Slideshow" />
        <item
            android:id="@+id/nav_manage"
            android:icon="@drawable/ic_menu_manage"
            android:title="Tools" />
    </group>

    <item android:title="Communicate">
        <menu>
            <item
                android:id="@+id/nav_share"
                android:icon="@drawable/ic_menu_share"
                android:title="Share" />
            <item
                android:id="@+id/nav_send"
                android:icon="@drawable/ic_menu_send"
                android:title="Send" />
        </menu>
    </item>

</menu>
```
# DrawerLayout

DrawerLayout需要注意的地方前面说过了，直接看XML。

## XML布局
```xml
<android.support.v4.widget.DrawerLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fitsSystemWindows="true"
    android:id="@+id/drawer_layout">

    <android.support.design.widget.CoordinatorLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <android.support.design.widget.AppBarLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:theme="@style/AppTheme.AppBarOverlay">

            <android.support.v7.widget.Toolbar
                android:id="@+id/toolbar"
                android:layout_width="match_parent"
                android:layout_height="?attr/actionBarSize"
                app:popupTheme="@style/AppTheme.PopupOverlay" />

        </android.support.design.widget.AppBarLayout>

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Hello World!" />

    </android.support.design.widget.CoordinatorLayout>

    <android.support.design.widget.NavigationView
        android:id="@+id/nav_view"
        android:layout_width="wrap_content"
        android:layout_height="match_parent"
        android:layout_gravity="start"
        app:headerLayout="@layout/nav_header_main"
        app:menu="@menu/drawer_layout" />

</android.support.v4.widget.DrawerLayout>
```
* **DrawerLayout**  
很简单，就是单纯作为最外层的布局使用。  
需要注意`android:fitsSystemWindows="true"`，设置为true之后，在5.0以上的设备中就有沉浸式状态栏的效果。

* **NavigationView**  
`app:headerLayout` 设置头部布局。  
`app:menu` 设置menu内容。  
`android:layout_gravity="start"` 必须。如果不设置，NavigationView会占满整个布局。  
`app:itemIconTint` menu图标的颜色  
`app:itemBackground` menu背景颜色  
`app:itemTextColor` menu字体的颜色

## Java代码：DrawerLayoutActivity
```java
public class DrawerLayoutActivity extends AppCompatActivity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_drawerlayout);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.addDrawerListener(toggle);
        toggle.syncState();
    }
}
```
使用了ActionBarDrawerToggle来给Toolbar的左边添加一个图标，带有一个交互动画。

在AndroidManifest.xml中注册该Activity，同时别忘记把主题设置成我们前面定义过的那个。
```xml
<activity android:name=".drawerlayout.DrawerLayoutActivity"
	android:theme="@style/AppTheme.Fit"/>
```

# 给NavigationView添加点击事件
这里menu的点击事件，和头部布局中的点击事件需要分开写。
## menu点击
Activity 需要实现 NavigationView.OnNavigationItemSelectedListener 接口。
```java
NavigationView navigationView = (NavigationView) findViewById(R.id.nav_view);
navigationView.setNavigationItemSelectedListener(this);
```
重写下面的方法：
```java
@Override
public boolean onNavigationItemSelected(@NonNull MenuItem item) {
	int id = item.getItemId();

	if (id == R.id.nav_camera) {
		// Handle the camera action
	} else if (id == R.id.nav_gallery) {

	} else if (id == R.id.nav_slideshow) {

	} else if (id == R.id.nav_manage) {

	} else if (id == R.id.nav_share) {

	} else if (id == R.id.nav_send) {

	}

	DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
	drawer.closeDrawer(GravityCompat.START);
	return true;
}
```

## 头部布局点击
1. 获取头部布局
```java
View headerView = navigationView.getHeaderView(0);
```
2. 然后通过调用headerView中的findViewById方法来查找到头部的控件，设置点击事件即可。

# NavigationView的menu图标颜色
上面这么用的时候，会发现menu的图标好像全是统一的一个颜色，那我们想显示图片自身的颜色呢？
```java
navigationView.setItemIconTintList(null);
```
