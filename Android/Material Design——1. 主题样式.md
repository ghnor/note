在build.grade中添加：
```
compile 'com.android.support:appcompat-v7:version'
compile 'com.android.support:design:version'
```
从5.0 API-21开始支持Material Desigh主题，如果要直接使用，那么需要设置应用的minSdkVersion = 21
```java
android:Theme.Material
android:Theme.Material.Light
android:Theme.Material.Light.DarkActionBar
```
如果需要兼容低版本，在Support包提供了兼容主题
```java
Theme.AppCompat
Theme.AppCompat.Light
Theme.AppCompat.Light.DarkActionBar
```

## 在color.mxl中定义需要的颜色
```xml
<resources>
    <color name="colorPrimary">#3F51B5</color>
    <color name="colorPrimaryDark">#303F9F</color>
    <color name="colorAccent">#FF4081</color>
</resources>
```

## 在styles.xml中定义主题
```xml
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
	<!-- Customize your theme here. -->
	<item name="colorPrimary">@color/colorPrimary</item>
	<item name="colorPrimaryDark">@color/colorPrimaryDark</item>
	<item name="colorAccent">@color/colorAccent</item>
</style>

<style name="AppTheme.NoActionBar" parent="AppTheme">
	<item name="windowActionBar">false</item>
	<item name="windowNoTitle">true</item>
</style>
```
在res目录下，创建一个values-v21目录，再创建一个styles.xml：
```xml
<style name="AppTheme.NoActionBar" parent="AppTheme">
	<item name="windowActionBar">false</item>
	<item name="windowNoTitle">true</item>
	<item name="android:windowDrawsSystemBarBackgrounds">true</item>
	<item name="android:statusBarColor">?colorPrimaryDark</item>
</style>
```

## 在AndroidManifest.xml中设置主题
```xml
<application
	android:allowBackup="true"
	android:icon="@mipmap/ic_launcher"
	android:label="@string/app_name"
	android:supportsRtl="true"
	android:theme="@style/AppTheme.NoActionBar">
	<activity 
		android:name=".MainActivity"
		android:theme="@style/AppTheme">
		<intent-filter>
			<action android:name="android.intent.action.MAIN" />

			<category android:name="android.intent.category.LAUNCHER" />
		</intent-filter>
	</activity>
	<activity android:name=".toolbar.ToolbarActivity"/>
</application>
```
直接给application设置AppTheme.NoActionBar主题，默认其他Activity的标题栏都采用自定义的样式，在Material Design中，建议使用Toolbar。  
在需要系统ActionBar时，就单独给Activity设置AppTheme主题。
