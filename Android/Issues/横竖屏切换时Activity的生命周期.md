* 不设置`Activity`的`android:configChanges`  
切横屏或者切竖屏，重新创建Activity  

* 设置`Activity`的`android:configChanges="orientation"`  
切横屏或者切竖屏，重新创建Activity  

**以上都不存在常见的横屏切竖屏时，执行两次生命周期的情况**  

* 设置`Activity`的`android:configChanges="orientation|keyboardHidden"`  
`android:targetSdkVersion<="12"`(API 12:Android 3.1)，表现为不重新创建`Activity`  
`android:targetSdkVersion>"12"`(API 12:Android 3.1)，表现为重新创建`Activity`  

* 设置`Activity`的`android:configChanges="orientation|keyboardHidden|screenSize"`  
真正可以保证在任何版本下，不重新创建`Activity`  
只调用`onConfigurationChanged`  
