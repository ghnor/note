# Fragment相关

[Android Fragment完全解析，关于碎片你所需知道的一切](https://blog.csdn.net/guolin_blog/article/details/8881711)  
[Android Fragment学习与使用—高级篇](https://blog.csdn.net/qq_24442769/article/details/77679147)  
[Activity与Fragment生命周期探讨](https://www.jianshu.com/p/1b3f829810a1)

## 生命周期

Fragment从创建到销毁整个生命周期中涉及到的方法依次为：onAttach()→onCreate()→ onCreateView()→onActivityCreated()→onStart()→onResume()→onPause()→onStop()→onDestroyView()→onDestroy()→onDetach()，其中和Activity有不少名称相同作用相似的方法，而不同的方法有:

* onAttach()：当Fragment和Activity建立关联时调用；
* onCreateView()：当fragment创建视图调用，在onCreate之后；
* onActivityCreated()：当与Fragment相关联的Activity完成onCreate()之后调用；
* onDestroyView()：在Fragment中的布局被移除时调用；
* onDetach()：当Fragment和Activity解除关联时调用；

![](https://developer.android.google.cn/images/fragment_lifecycle.png)

## Fragment 各种情况下的生命周期
## Activity 与 Fragment 之间生命周期比较

![](https://developer.android.google.cn/images/activity_fragment_lifecycle.png)

## Activity 和 Fragment 之间怎么通信， Fragment 和 Fragment 怎么通信

Activity 传值给 Fragment：通过 Bundle 对象来传递，Activity 中构造 bundle 数据包，调用 Fragment 对象的 setArguments(Bundle b) 方法，Fragment 中使用 getArguments() 方法获取 Activity 传递过来的数据包取值。

Fragment 传值给 Activity：在 Fragment 中定义一个内部回调接口，Activity 实现该回调接口， Fragment 中获取 Activity 的引用，调用 Activity 实现的业务方法。接口回调机制式 Java 不同对象之间数据交互的通用方法。

Fragment 传值给 Fragment：一个 Fragment 通过 Activity 获取到另外一个 Fragment 直接调用方法传值。

## 谈谈Activity和Fragment的区别？

相似点：都可包含布局、可有自己的生命周期
不同点：
* Fragment相比较于Activity多出4个回调周期，在控制操作上更灵活；
* Fragment可以在XML文件中直接进行写入，也可以在Activity中动态添加；
* Fragment可以使用show()/hide()或者replace()随时对Fragment进行切换，并且切换的时候不会出现明显的效果，用户体验会好；Activity虽然也可以进行切换，但是Activity之间切换会有明显的翻页或者其他的效果，在小部分内容的切换上给用户的感觉不是很好；

## Fragment中add与replace的区别（Fragment重叠）

* add不会重新初始化fragment，replace每次都会。所以如果在fragment生命周期内获取获取数据,使用replace会重复获取；
* 添加相同的fragment时，replace不会有任何变化，add会报IllegalStateException异常；
* replace先remove掉相同id的所有fragment，然后在add当前的这个fragment，而add是覆盖前一个fragment。所以如果使用add一般会伴随hide()和show()，避免布局重叠；
* 使用add，如果应用放在后台，或以其他方式被系统销毁，再打开时，hide()中引用的fragment会销毁，所以依然会出现布局重叠bug，可以使用replace或使用add时，添加一个tag参数；

## getFragmentManager、getSupportFragmentManager 、getChildFragmentManager之间的区别？

* getFragmentManager()所得到的是所在fragment 的父容器的管理器，getChildFragmentManager()所得到的是在fragment  里面子容器的管理器，如果是fragment嵌套fragment，那么就需要利用getChildFragmentManager()；
* 因为Fragment是3.0 Android系统API版本才出现的组件，所以3.0以上系统可以直接调用getFragmentManager()来获取FragmentManager()对象，而3.0以下则需要调用getSupportFragmentManager() 来间接获取；

## FragmentPagerAdapter与FragmentStatePagerAdapter的区别与使用场景?

相同点：二者都继承PagerAdapter  
不同点：
* FragmentPagerAdapter的每个Fragment会持久的保存在FragmentManager中，只要用户可以返回到页面中，它都不会被销毁。因此适用于那些数据相对静态的页，Fragment数量也比较少的那种；
* FragmentStatePagerAdapter只保留当前页面，当页面不可见时，该Fragment就会被消除，释放其资源。因此适用于那些数据动态性较大、占用内存较多，多Fragment的情况；