# Service相关

## Service 的生命周期

* onCreate()：如果service没被创建过，调用startService()后会执行onCreate()回调；如果service已处于运行中，调用startService()不会执行onCreate()方法。也就是说，onCreate()只会在第一次创建service时候调用，多次执行startService()不会重复调用onCreate()，此方法适合完成一些初始化工作；
* onStartComand()：服务启动时调用，此方法适合完成一些数据加载工作，比如会在此处创建一个线程用于下载数据或播放音乐；
* onBind()：服务被绑定时调用；
* onUnBind()：服务被解绑时调用；
* onDestroy()：服务停止时调用；

![](https://developer.android.google.cn/images/service_lifecycle.png)

# Service 的启动方式

* startService()：通过这种方式调用startService，onCreate()只会被调用一次，多次调用startSercie会多次执行onStartCommand()和onStart()方法。如果外部没有调用stopService()或stopSelf()方法，service会一直运行。
* bindService()：如果该服务之前还没创建，系统回调顺序为onCreate()→onBind()。如果调用bindService()方法前服务已经被绑定，多次调用bindService()方法不会多次创建服务及绑定。如果调用者希望与正在绑定的服务解除绑定，可以调用unbindService()方法，回调顺序为onUnbind()→onDestroy()；

> [Android Service两种启动方式详解（总结版）](https://www.jianshu.com/p/4c798c91a613)

## Service保活

* onStartCommand方法中，返回START_STICKY或则START_REDELIVER_INTENT
  * START_STICKY：如果返回START_STICKY，表示Service运行的进程被Android系统强制杀掉之后，Android系统会将该Service依然设置为started状态（即运行状态），但是不再保存onStartCommand方法传入的intent对象
  * START_NOT_STICKY：如果返回START_NOT_STICKY，表示当Service运行的进程被Android系统强制杀掉之后，不会重新创建该Service
  * START_REDELIVER_INTENT：如果返回START_REDELIVER_INTENT，其返回情况与START_STICKY类似，但不同的是系统会保留最后一次传入onStartCommand方法中的Intent再次保留下来并再次传入到重新创建后的Service的onStartCommand方法中
* 提高Service的优先级  
  在AndroidManifest.xml文件中对于intent-filter可以通过android:priority = "1000"这个属性设置最高优先级，1000是最高值，如果数字越小则优先级越低，同时适用于广播；
* 在onDestroy方法里重启Service  
  当service走到onDestroy()时，发送一个自定义广播，当收到广播时，重新启动service；
* 提升Service进程的优先级  
  进程优先级由高到低：前台进程 一 可视进程 一 服务进程 一 后台进程 一 空进程 可以使用startForeground将service放到前台状态，这样低内存时，被杀死的概率会低一些；
* 系统广播监听Service状态
* 将APK安装到/system/app，变身为系统级应用

## Service 与 IntentService 的区别
## Service 和 Activity 之间的通信方式
  * 通过 Binder 对象
  * 通过 Broadcast（广播）的形式