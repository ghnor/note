AppBarLayout其实就是一个垂直方向的LinearLayout，可以实现Material Design中标题栏的滚动效果。

AppBarLayout的子View通过app:layout_scrollFlags属性或LayoutParams.setScrollFlags()方法来声明自身“滚动行为”。

AppBarLayout只有作为CoordinatorLayout的直接子View时，并同时在CoordinatorLayout中添加一个可滚动的scrolling view（如：NestedScrollView、RecyclerView...）才能响应滚动行为。

说一点，普通的ScrollView也是可以的滚动的，却不能响应AppbarLayout的滚动行为。其中关键在于CoordiantorLayout和Behavior，可以看我之前的文章【CoordinatorLayout与Behavior的一己之见】，里面大致介绍了其中的原理，可以让你初窥门径。

## XML布局
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
必须作为AppBarLayout的子View才能生效，通过app:layout_scrollFlags属性或LayoutParams.setScrollFlags()设置：  

* `scroll`

	所有想获得滚动行为的view都需要设置。  

* `enterAlways`

	从滚动开始，该view就会跟着向下滚动。

* `enterAlwaysCollapsed`

	单独设置时，效果就是在scrolling view滚动到顶部后，才会下滚动。
	```java
	app:layout_scrollFlags="scroll|enterAlwaysCollapsed">
	```
	但是如果设置了Toolbar的height和minHeight，并设置layout_scrollFlags为"scroll|enterAlways|enterAlwaysCollapsed"。  
	效果就是，在向下滚动时，会首先滚动到最小高度，知道scrolling view滚动到顶部后，才扩展到原始高度。
	```java
	android:layout_height="150dp"
	android:minHeight="?attr/actionBarSize"
	app:layout_scrollFlags="scroll|enterAlwaysCollapsed|enterAlways"
	```

* `exitUntilCollapsed`

	向上滚动时，会折叠到其最小高度。向下滚动时，在scrolling view滚动到顶部后，才会向下滚动，扩展到原先的高度。  
	我们将Toolbar的height设置为150dp，并设置其minHeight。  
	```java
	android:layout_height="150dp"
	android:minHeight="?attr/actionBarSize"
	```

* `snap`

	在滚动的过程中，一次滚动的距离不一定足够Toolbar完全地隐藏或显示。  
	设置snap之后，就会给view添加一个弹性滚动的效果，会自动地根据滚动的距离，完成完整的隐藏、折叠或者显示的效果。
