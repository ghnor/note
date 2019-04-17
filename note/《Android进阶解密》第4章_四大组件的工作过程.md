# 《Android进阶解密》第4章 四大组件的工作过程

## Activity的启动过程

1. `Launcher` -> `Activity` -> `Instrumentation` -> `IActivityManager` -> `AMS`

    这一步是用户应用进程通知AMS进程。

    因为是根Activity，所以Itent会加上Intent.FLAG_ACTIVITY_NEW_TASK的Flag，让根Activity在新的任务栈中启动。

    Instrumentation主要用来监控应用程序和系统的交互，IActivityManager是AMS在应用进程的本地代理对象，IActivityManager就是在Instrumentation中获取到的。

    对AMS的本地代理对象，在Android 8.0前后有一些区别，Android 8.0之前，是ActivityManagerProxy，通过ActitiyManagerNative.getDefault()方法获得，这种方式并不是AIDL；而在Android 8.0之后，就采用了完整的AIDL方式，通过ActivityManger.getService()方法获得。

2. `AMS` -> `ActivityStarter` -> `ActivityStackSupervisor` -> `ActivityStack` -> `ApplicationThread`

    在AMS中会判断调用者进程是否被隔离，检查调用是否有权限。

    ApplicationThread继承了IApplicationTread.Stub，可以理解为ApplicationThread就是用户应用进程相对AMS进程的远程Binder对象。

3. `ApplicationThread` -> `ActivityThread` -> `H` -> `Instrumentation` -> `Activity`

    ApplicationThread是一个Binder，它运行在Binder线程池中，所以通过Handler对象H切换到主线程。

    在ActivityThread中会创建Application，调用Activity的attach方法初始化Activity，attach方法中会创建Window对象并与Activity自身关联。

### 启动涉及到的进程

* 根Activity
  
    Launcher进程、AMS进程、Zygote进程和应用程序进程。

* 普通Activity

    AMS进程和应用程序进程。

## Service的启动过程

1. `ContextWrapper` -> `ContextImpl` -> `IActivityManager` -> `AMS`

2. `AMS` -> `ActiveServices` -> `ApplicationThread`

3. `ApplicationThread` -> `ActivityThread` -> `H` -> `Service`

## Service的绑定过程



## 广播的注册、发送和接收过程

