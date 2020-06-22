# Activity相关

[Activity的四种启动模式应用场景](https://blog.csdn.net/black_bird_cn/article/details/79764794)  
[onSaveInstanceState()和onRestoreInstanceState()使用详解](https://www.jianshu.com/p/27181e2e32d2)  
[onConfigurationChanged方法介绍及问题解决](https://www.jianshu.com/p/0127fb67516d)  
[Android隐式启动intent-filter详解](https://blog.csdn.net/sunzhaojie613/article/details/77433994)

[Activity 的 36 大难点，你会几个？「建议收藏」](https://juejin.im/post/5db902b7f265da4d39629d6d)

## 主要的生命周期有哪些？

* onCreate()：表示Activity正在被创建，常用来初始化工作，比如调用setContentView加载界面布局资源，初始化Activity所需数据等；
* onRestart()：表示Activity正在重新启动，一般情况下，当前Acitivty从不可见重新变为可见时，OnRestart就会被调用；
* onStart()：表示Activity正在被启动，此时Activity可见但不在前台，还处于后台，无法与用户交互；
* onResume()：表示Activity获得焦点，此时Activity可见且在前台并开始活动，这是与onStart的区别所在；
* onPause()：表示Activity正在停止，此时可做一些存储数据、停止动画等工作，但是不能太耗时，因为这会影响到新Activity的显示，onPause必须先执行完，新Activity的onResume才会执行；
* onStop()：表示Activity即将停止，可以做一些稍微重量级的回收工作，比如注销广播接收器、关闭网络连接等，同样不能太耗时；
* onDestroy()：表示Activity即将被销毁，这是Activity生命周期中的最后一个回调，常做回收工作、资源释放；

从整个生命周期来看，onCreate和onDestroy是配对的，分别标识着Activity的创建和销毁，并且只可能有一次调用；  
从Activity是否可见来说，onStart和onStop是配对的，这两个方法可能被调用多次；  
从Activity是否在前台来说，onResume和onPause是配对的，这两个方法可能被调用多次；  
除了这种区别，在实际使用中没有其他明显区别；

![](https://developer.android.google.cn/guide/components/images/activity_lifecycle.png)

## Activity A 启动另一个Activity B 会调用哪些方法？如果B是透明主题的又或则是个DialogActivity呢？

* Activity A 的onPause() → Activity B的onCreate() → onStart() → onResume() → Activity A的onStop()；
* 如果B是透明主题又或则是个DialogActivity，则不会回调A的onStop；

## 横竖屏切换时 Activity 的生命周期

* 不设置Activity的android:configChanges时，切屏会销毁当前Activity，然后重新加载调用各个生命周期，切横屏时会执行一次，切竖屏时会执行两次；
onPause() →onStop()→onDestory()→onCreate()→onStart()→onResume()
* 设置Activity的android:configChanges="orientation"时，切屏还是会重新调用各个生命周期，切横、竖屏时只会执行一次；
* 设置Activity的android:configChanges="orientation|keyboardHidden|screenSize"时，切屏不会重新调用各个生命周期，只会执行onConfigurationChanged方法；

[Android 横竖屏切换加载不同的布局](https://blog.csdn.net/u010365819/article/details/76618443)

## 前台切换到后台，然后再回到前台时 Activity 的生命周期
## 弹出 Dialog 的时候按 Home 键时 Activity 的生命周期
## 两个 Activity 之间跳转时的生命周期
## 下拉状态栏时 Activity 的生命周期

## Activity 状态保存与恢复

发生条件：异常情况下（系统配置发生改变时导致Activity被杀死并重新创建、资源内存不足导致低优先级的Activity被杀死）

* 系统会调用onSaveInstanceState来保存当前Activity的状态，此方法调用在onStop之前，与onPause没有既定的时序关系；
* 当Activity被重建后，系统会调用onRestoreInstanceState，并且把onSave(简称)方法所保存的Bundle对象同时传参给onRestore(简称)和onCreate()，因此可以通过这两个方法判断Activity是否被重建；

## Activity 的四种 LaunchMode（启动模式）的区别

使用android:launchMode="standard|singleInstance|singleTask|singleTop"来控制Acivity任务栈。

任务栈是一种后进先出的结构。位于栈顶的Activity处于焦点状态,当按下back按钮的时候,栈内的Activity会一个一个的出栈,并且调用其onDestory()方法。如果栈内没有Activity,那么系统就会回收这个栈,每个APP默认只有一个栈,以APP的包名来命名。

* standard : 标准模式,每次启动Activity都会创建一个新的Activity实例,并且将其压入任务栈栈顶,而不管这个Activity是否已经存在。Activity的启动三回调(onCreate()->onStart()->onResume())都会执行。
* singleTop : 栈顶复用模式.这种模式下,如果新Activity已经位于任务栈的栈顶,那么此Activity不会被重新创建,所以它的启动三回调就不会执行,同时Activity的onNewIntent()方法会被回调.如果Activity已经存在但是不在栈顶,那么作用与standard模式一样.
* singleTask: 栈内复用模式.创建这样的Activity的时候,系统会先确认它所需任务栈已经创建,否则先创建任务栈.然后放入Activity,如果栈中已经有一个Activity实例,那么这个Activity就会被调到栈顶,onNewIntent(),并且singleTask会清理在当前Activity上面的所有Activity.(clear top)
* singleInstance : 加强版的singleTask模式,这种模式的Activity只能单独位于一个任务栈内,由于栈内复用的特性,后续请求均不会创建新的Activity,除非这个独特的任务栈被系统销毁了

Activity的堆栈管理以ActivityRecord为单位,所有的ActivityRecord都放在一个List里面.可以认为一个ActivityRecord就是一个Activity栈

## Acitivty的启动流程

解释一：  
调用startActivity()后经过重重方法会转移到ActivityManagerService的startActivity()，并通过一个IPC回到ActivityThread的内部类ApplicationThread中，并调用其scheduleLaunchActivity()将启动Activity的消息发送并交由Handler H处理。Handler H对消息的处理会调用handleLaunchActivity()→performLaunchActivity()得以完成Activity对象的创建和启动；

解释二：  
1. 点击App图标后通过startActivity远程调用到AMS中，AMS中将新启动的activity以activityrecord的结构压入activity栈中，并通过远程binder回调到原进程，使得原进程进入pause状态，原进程pause后通知AMS我pause了
2. 此时AMS再根据栈中Activity的启动intent中的flag是否含有new_task的标签判断是否需要启动新进程，启动新进程通过startProcessXXX的函数
3. 启动新进程后通过反射调用ActivityThread的main函数，main函数中调用looper.prepar和lopper.loop启动消息队列循环机制。最后远程告知AMS我启动了。AMS回调handleLauncherAcitivyt加载activity。在handlerLauncherActivity中会通过反射调用Application的onCreate和activity的onCreate以及通过handleResumeActivity中反射调用Activity的onResume

[Android四大组件启动机制之Activity启动过程](https://blog.csdn.net/qq_30379689/article/details/79611217)  
[【凯子哥带你学Framework】Activity启动过程全解析](https://blog.csdn.net/zhaokaiqiang1992/article/details/49428287)  
[Android进阶——Android四大组件启动机制之Activity启动过程](https://blog.csdn.net/qq_30379689/article/details/79611217)

## resume时activity是否完成了渲染