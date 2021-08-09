`<meta-data>`是提供组件额外的数据用的，它本身就是一个键值对，可以自定义名称和值。  
它可以包含在`<activity>`、`<application>`、`<service>`和`<receiver>`中。

## 配置

```xml
<meta-data android:name="string"
     android:resource="resource specification"
     android:value="string" />
```

一般的值可以通过value属性来指定，但是如果要指定一个资源的id,则需要使用resource属性来配置。

例如：

```xml
<meta-data android:name="api_key" android:value="@string/api_key" />
```

指定的api_key值为存储在资源文件string中的api_key值 如：AIzaSyBhBFOgVQclaa8p1JJeqaZHiCo2nfiyBBo。

```xml
<meta-data android:name="resId" android:resource="@string/res_id" />
```

指定的resId值则是为res_id的资源id号 而不是string中的res_id值。

## 获取

### 在`<application...>`元素下配置`<mate-data...>`元素

```xml
<application...>
    .....
    <meta-data
        android:name="api_key"
        android:value="AIzaSyBhBFOgVQclaa8p1JJeqaZHiCo2nfiyBBo" />
</application>
```

```java
try {
    ApplicationInfo appInfo = getPackageManager().getApplicationInfo(getPackageName(),
            PackageManager.GET_META_DATA);
    String value = appInfo.metaData.getString("api_key");
    Log.d("Tag", " app key : " + value);  // Tag﹕ app key : AIzaSyBhBFOgVQclaa8p1JJeqaZHiCo2nfiyBBo
} catch (PackageManager.NameNotFoundException e) {
    e.printStackTrace();
}
```

### 在`<activity...>`元素下配置`<mate-data...>`元素

```xml
<activity ...>
    .....
    <meta-data android:name="resource_id"
        android:resource="@string/ice" />
</activity>
```

```java
try {
    ActivityInfo activityInfo = getPackageManager().getActivityInfo(getComponentName(),
	        PackageManager.GET_META_DATA);
    // 获取到的是 @string/ice 对应的资源id值
    int value = activityInfo.metaData.getInt("resource_id");
    Log.d("Activity Tag", "resource_id : " + value);  // Activity Tag﹕ resource_id : 2131361808
} catch (PackageManager.NameNotFoundException e) {
    e.printStackTrace();
}
```

### 在`<service...>`元素下配置`<mate-data...>`元素

```xml
<service android:name="MetaDataService">
    .....
    <meta-data android:name="service_meta_data" android:value="xxxxxxx" />
</service>
```

```java
try {
	ComponentName cn=new ComponentName(this, MetaDataService.class);
	ServiceInfo info=this.getPackageManager()
			 .getServiceInfo(cn, PackageManager.GET_META_DATA);
	String value = info.metaData.getString("service_meta_data");
	Log.d("Service TAG", " value == " + value);
} catch (PackageManager.NameNotFoundException e) {
	e.printStackTrace();
}
```

### 在`<receiver...>`元素下配置`<mate-data...>`元素

```xml
<receiver android:name="MetaDataReceiver">
    .....
    <meta-data android:name="receiver_meta_data" android:value="xxxxxxx" />
</receiver>
```

```java
try {
	ComponentName cn=new ComponentName(this, MetaDataReceiver.class);
	ActivityInfo info=context.getPackageManager()
            .getReceiverInfo(cn, PackageManager.GET_META_DATA);
	String value = info.metaData.getString("receiver_meta_data");
	Log.d("Receiver TAG", " value == " + value);
} catch (PackageManager.NameNotFoundException e) {
	e.printStackTrace();
}
```