在Eclipes中没有区分applicaitonId和包名。

在Android Studio中，applicationId和包名默认是保持一致的。但是各自可以被修改。

## 包名（package）

包名（package）默认为物理包路径，在AndroidManifest.xml中声明：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.example.myapplication">
		...
  	<activity
    		android:name=".MainActivity"
    ...>
    </activity>
</manifest>
```

**包名（package）的作用：**

* **为R.java提供命名空间，例如R class的包名为com.example.myapplication；**

  例如：java文件头部的导入声明，`import com.example.myapplicaton.R`;

* **影响AndroidManifest.xml中声明的activity的相对包路径；**

  例如上图所示，当被编译之后，`android:name=".MainActivity"`实际的内容是`android:name="com.example.myapplication.MainActivity"`。

## applicationId

applicationId默认声明在app/build.gradle中：

```gradle
android {
  defaultConfig {
    applicationId "com.example.myapplication"
    ...
  }
  ...
}
```

**applicationId的作用：**

* **大部分看上去是获取的API，实际获取的都是applicationId，例如context.getPackageName()；**
* **在编译之后，package会被applicationId覆盖，但是actiivty以及R文件的包路径还是编译前的；**
* **每个Android应用都有唯一的applictionId,各个应用市场靠applicationId去区分不同的应用；**
* **第三方SDK需要提供的包名也是applicationId；**

