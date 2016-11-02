# onStartCommand方法，返回START_STICKY
* **START_STICKY** service进程被kill后，将保留在开始状态，但是不保留那些传入的intent。不久后service就会再次尝试重新创建，因为保留在开始状态，在创建service后将保证调用onstartCommand。如果没有传递任何开始命令给service，那将获取到null的intent。

* **START_NOT_STICKY** service进程被kill后，并且没有新的intent传递给它，Service将移出开始状态，并且直到被显式调用（startService）才重新创建。因为如果没有传递任何未决定的intent那么service是不会启动，也就是期间onstartCommand不会接收到任何null的intent。

* **START_REDELIVER_INTENT** service进程被kill后，系统将会再次启动service，并传入最后一个intent给onstartCommand。直到调用stopSelf(int)才停止传递intent。如果在被kill后还有未处理好的intent，那被kill后服务还是会自动启动。因此onstartCommand不会接收到任何null的intent。

# 提升service优先级
在AndroidManifest.xml文件中对于intent-filter可以通过`android:priority = "1000"`这个属性设置最高优先级，1000是最高值，如果数字越小则优先级越低，同时适用于广播。

# 提升service进程优先级
Android中的进程是托管的，当系统进程空间紧张的时候，会依照优先级自动进行进程的回收。Android将进程分为6个等级,它们按优先级顺序由高到低依次是:  
1. 前台进程（FOREGROUND_APP）  
2. 可视进程（VISIBLE_APP）  
3. 次要服务进程（SECONDARY_SERVER）  
4. 后台进程（HIDDEN_APP）  
5. 内容供应节点（CONTENT_PROVIDER）  
6. 空进程（EMPTY_APP）  

# onDestroy方法里重启service
service + broadcast方式，就是当service执行onDestory的时候，发送一个自定义的广播，当收到广播的时候，重新启动service。

# Application加上Persistent属性
```java
android:persistent="true"
```

# 监听系统广播重启Service状态
通过系统的一些广播，比如：手机重启、界面唤醒、应用状态改变等等监听并捕获到，然后判断我们的Service是否还存活。如果被kill就重启service。
