## 属性说明
* app:tabIndicatorColor / setSelectedTabIndicatorColor  
下方滚动的下划线颜色  

* app:tabSelectedTextColor / setTabTextColors  
tab被选中后，文字的颜色

* app:tabTextColor / setTabTextColors  
tab默认的文字颜色  

* app:tabBackground / android:background  
tab的背景

* app:tabMode / setTabMode  
排列模式，可选：[ fixed | scrollable ]

* app:tabGravity / setTabGravity  
对齐方式，可选：[ fill | center ]


## layout布局：activity_toolbar.xml
```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:orientation="vertical" android:layout_width="match_parent"
    android:layout_height="match_parent">

    <android.support.design.widget.TabLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:id="@+id/tab_layout"></android.support.design.widget.TabLayout>

    <android.support.v4.view.ViewPager
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:id="@+id/view_pager"></android.support.v4.view.ViewPager>

</LinearLayout>
```

## java：TabLayoutActivity
```java
@Override
protected void onCreate(@Nullable Bundle savedInstanceState) {
	super.onCreate(savedInstanceState);
	setContentView(R.layout.activity_tablayout);

	TabFragment tfAndroid = TabFragment.newInstance("Android");
	TabFragment tfIos = TabFragment.newInstance("iOS");
	TabFragment tfWeb = TabFragment.newInstance("WEB");

	TabLayout tabLayout = (TabLayout) findViewById(R.id.tab_layout);
	ViewPager viewPager = (ViewPager) findViewById(R.id.view_pager);
	TabFragmentPagerAdapter tabFragmentPagerAdapter =
			new TabFragmentPagerAdapter(getSupportFragmentManager());
	tabFragmentPagerAdapter.add(tfAndroid, "Android");
	tabFragmentPagerAdapter.add(tfIos, "iOS");
	tabFragmentPagerAdapter.add(tfWeb, "WEB");

	viewPager.setAdapter(tabFragmentPagerAdapter);
	tabLayout.setupWithViewPager(viewPager);
}

public static class TabFragmentPagerAdapter extends FragmentPagerAdapter {

	private List<Fragment> fragmentList = new ArrayList<>(); //fragment列表
	private List<String> titleList = new ArrayList<>(); //tab名的列表

	public TabFragmentPagerAdapter(FragmentManager fm) {
		super(fm);
	}

	public void add(Fragment fragment, String title) {
		fragmentList.add(fragment);
		titleList.add(title);
	}

	@Override
	public Fragment getItem(int position) {
		return fragmentList.get(position);
	}

	@Override
	public int getCount() {
		return fragmentList.size();
	}

	@Override
	public CharSequence getPageTitle(int position) {
		return titleList.get(position);
	}
}

public static class TabFragment extends Fragment {

	private String title;

	public static TabFragment newInstance(String title) {
		TabFragment tabFragment = new TabFragment();
		Bundle args = new Bundle();
		args.putString("title", title);
		tabFragment.setArguments(args);
		return tabFragment;
	}

	@Override
	public void onCreate(@Nullable Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		title = getArguments().getString("title");
	}

	@Nullable
	@Override
	public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {

		TextView tv = new TextView(container.getContext());
		tv.setText(title);

		return tv;
	}
}
```

## 另外
大多数时候，这个应该都会跟AppBarLayout配合一起使用：
```xml
<android.support.design.widget.AppBarLayout
	android:layout_width="match_parent"
	android:layout_height="wrap_content"
	android:theme="@style/AppTheme.AppBarOverlay">
	<android.support.design.widget.TabLayout
		android:layout_width="match_parent"
		android:layout_height="wrap_content"
		android:id="@+id/tab_layout"></android.support.design.widget.TabLayout>
</android.support.design.widget.AppBarLayout>
```
* `android:theme="@style/AppTheme.AppBarOverlay"`上一篇提过，是定义在`styles.xml`中的。  
设置之后，背景颜色就会变成`styles.xml`中的`colorPrimary`颜色，字体颜色就会变成白色，非常方便。
