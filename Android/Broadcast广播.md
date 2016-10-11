Broadcast包括两个概念，广播发送者和广播接收者(Receiver)，这里的广播实际就是指 Intent，程序可以自己发送广播自己接收，也可以接受系统或其他应用的广播或是发送广播给其他应用程序。  
发送者可以通过类似 [Context.sendBroadcast()](http://developer.android.com/reference/android/content/Context.html#sendBroadcast(android.content.Intent)) 接口发送广播，接收者通过  [Context.registerReceiver()](http://developer.android.com/reference/android/content/Context.html#registerReceiver(android.content.BroadcastReceiver,%20android.content.IntentFilter)) 动态注册或在 AndroidManifest.xml 文件中通过 <receiver> 标签静态注册。注册完成后，当发送者发送某个广播时系统会将发送的广播(Intent)与系统中所有注册的符合条件的接收者(Receiver)的 IntentFilter 进行匹配，若匹配成功则执行相应接收者的 onReceive 函数。  

# 1. 广播的接收
自定义广播接收器需要继承基类`BroadcastReceiver`或`WakefulBroadcastReceiver`，并实现抽象方法`onReceive(Context context, Intent intent)`。广播接收器接收到相应广播后，会自动回到onReceive(..)方法。默认情况下，广播接收器也是运行在 UI 线程，因此，`onReceive()`方法中不能执行太耗时的操作。否则将因此 ANR。
> **BroadcastReceiver**：不会保证CPU的持续工作。当你执行长时间的操作时，CPU可能会在中途陷入休眠。
> **WakefulBroadcastReceiver**：保证CPU持续工作直到操作完成。
[BroadcastReceiver Vs WakefulBroadcastReceiver](http://stackoverflow.com/questions/26380534/broadcastreceiver-vs-wakefulbroadcastreceiver)

## 1.1. 继承 BroadcastReceiver
```java
public class CustomBroadcastReceiver extends BroadcastReceiver {

    private static final String TAG = "CustomBroadcastReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        //TODO
        Log.i(TAG, "receive broadcast");
    }
}
```
## 1.2. 继承 WakefulBroadcastReceiver
```java
public class CustomBroadcastReceiver extends WakefulBroadcastReceiver {

    private static final String TAG = "CustomBroadcastReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        //TODO
        Log.i(TAG, "receive broadcast");
    }
}
```

# 2. 广播的注册
广播的注册分为**动态注册**和**静态注册**。
* **对bindService的调用**，<receiver>注册的广播，在onReceive结束后广播即不存在，所以不能在其中给自己异步传递结果，如bindService而只能使用startService，如果想跟service交互可使用peekService。
* **手动控制**。registerReceiver为动态注册，自己可以手动注册或是取消注册；<receiver>标签为静态注册，由系统开机时自动扫描注册，所以无法手动控制，开机一直运行中。
* **资源消耗不同**。registerReceiver可以手动控制，所以适当的注册和取消注册能节省系统资源，<receiver>标签系统开机后一直有效。
* **有效期不同**。通过registerReceiver注册的BroadcastReceiver在对其进行注册的Context对象"销毁"了或者调用了unregisterReceiver方法时也就失效了，而通过<receiver>标签注册的BroadcastReceiver只要应用程序没有被删除就一直有效。
* **对registerReceiver函数的调用许可不同**。通过registerReceiver注册的BroadcastReceiver在其onReceive函数中可以再次调用某个Context的registerReceiver函数，而通过<receiver>标签注册的BroadcastReceiver不允许再调用某个Context的registerReceiver函数 。
* **使用情况不同**。对于自己发送和接受的广播可以通过registerReceiver注册，对于系统常用广播的接收通常用<receiver>标签注册。
* 在 Android 3.1/API level 11 之前，静态注册的广播接收器即使在APP退出的情况下依然可以接收到广播。
但是从 3.1 之后就不成立了。原因在于 Intent 与广播相关的 flag 增加了参数：FLAG_INCLUDE_STOPPED_PACKAGES 和 FLAG_EXCLUDE_STOPPED_PACKAGES。

> FLAG_INCLUDE_STOPPED_PACKAGES：包含已经停止的包（停止：即包所在的进程已经退出）
> FLAG_EXCLUDE_STOPPED_PACKAGES：不包含已经停止的包

自 3.1 开始，系统本身则增加了对所有app当前是否处于运行状态的跟踪。在发送广播时，不管是什么广播类型，系统默认直接增加了值为FLAG_EXCLUDE_STOPPED_PACKAGES的flag，导致即使是静态注册的广播接收器，对于其所在进程已经退出的app，同样无法接收到广播。  
对于系统广播，由于是系统内部直接发出，无法更改此intent flag值，因此，3.1开始对于静态注册的接收系统广播的BroadcastReceiver，如果App进程已经退出，将不能接收到广播。  
但是对于自定义的广播，可以通过复写此flag为FLAG_INCLUDE_STOPPED_PACKAGES，使得静态注册的BroadcastReceiver，即使所在App进程已经退出，也能能接收到广播，并会启动应用进程，但此时的BroadcastReceiver是重新新建的。  
对于动态注册类型的BroadcastReceiver，由于此注册和取消注册实在其他组件（如Activity）中进行，因此，不受此改变影响。  
在3.1以前，相信不少app可能通过静态注册方式监听各种系统广播，以此进行一些业务上的处理（如即时app已经退出，仍然能接收到，可以启动service等..）,3.1后，静态注册接受广播方式的改变，将直接导致此类方案不再可行。于是，通过将Service与App本身设置成不同的进程已经成为实现此类需求的可行替代方案。  
```java
Intent intent = new Intent();
intent.setAction(BROADCAST_ACTION);
intent.addFlags(Intent.FLAG_INCLUDE_STOPPED_PACKAGES); 
sendBroadcast(intent);
```

## 2.1. 动态注册
代码中调用 Context.registerReceiver() 方法动态注册 BroadcastReceiver。  
在 Context 的实例被销毁时，调用 Context.unregisterReceiver() 解除注册的 BroadcastReceiver。
```java
public class MainActivity extends AppCompatActivity {

    private static final String ACTION = "com.test.action";

    private CustomBroadcastReceiver mCustomBroadcastReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mCustomBroadcastReceiver = new CustomBroadcastReceiver();

        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(ACTION);

        registerReceiver(mCustomBroadcastReceiver, intentFilter);
    }

    @Override
    protected void onDestroy() {
        unregisterReceiver(mCustomBroadcastReceiver);
        super.onDestroy();
    }
}
```
## 2.2. 静态注册
在 AndroidManifest.xml 文件中进行注册。
```java
<receiver android:enabled=["true" | "false"]
	android:exported=["true" | "false"]
	android:icon="drawable resource"
	android:label="string resource"
	android:name="string"
	android:permission="string"
	android:process="string" >
	<intent-filter>
		<action android:name="android.net.conn.CONNECTIVITY_CHANGE" />
		<action android:name="com.test.action" />
	</intent-filter>
</receiver>
```
android:exported  —— 此broadcastReceiver能否接收其他App的发出的广播，这个属性默认值有点意思，其默认值是由receiver中有无intent-filter决定的，如果有intent-filter，默认值为true，否则为false。（同样的，activity/service中的此属性默认值一样遵循此规则）同时，需要注意的是，这个值的设定是以application或者application user id为界的，而非进程为界（一个应用中可能含有多个进程）；  
android:name  —— 此broadcastReceiver类名；  
android:permission  ——如果设置，具有相应权限的广播发送方发送的广播才能被此broadcastReceiver所接收；  
android:process  —— broadcastReceiver运行所处的进程。默认为app的进程。可以指定独立的进程（Android四大基本组件都可以通过此属性指定自己的独立进程）  
intent-filter —— 指定此广播接收器将用于接收特定的广播类型。  
广播的类型既可以是系统广播，比如`<action android:name="android.net.conn.CONNECTIVITY_CHANGE" />`表示网络变化；也可以是自定义广播`<action android:name="com.test.action" />`。

# 3. 广播的发送 
广播根据发送方式的不同，可以分为**普通广播**,**有序广播**和**粘性广播**。  

广播实际发送的是意图（Intent），通过Action属性与Receiver匹配。  
如果发送广播时有相应的权限要求，BroadCastReceiver如果想要接收此广播，也需要有相应的权限。  
setAction(...)对应BroadcastReceiver中的intent-Filter中的action。
```java
Intent intent = new Intent();
intent.setAction(BROADCAST_ACTION);
```
## 3.1. 普通广播
普通的广播是不在意顺序的，最简单的理解是同时可以收到这个广播。如果应用是动态注册这个广播的，且广播发送时这个进程还活着，那么当然可以并发的把广播尽快地传送出去是最好的。  
但是，如果是通过AndroidManifest.xml静态注册的情况，也就是说这个广播首先要把一个进程启动起来，这时并发启动很多进程就是个问题了。Android目前的做法是，对这种静态的广播接收者，自动按有序广播的方式来串行处理。但是这对应用是透明的，应用不能假设系统已经把静态的无序广播当成有序广播来处理。
```java
Context.sendBroadcast(Intent intent);
Context.sendBroadcast(Intent intent, String receiverPermission);
```
发送给特定的用户
```java
Context.sendBroadcastAsUser(Intent intent, UserHandle user);
Context.sendBroadcastAsUser(Intent intent, UserHandle user, String receiverPermission);
```
## 3.2. 有序广播
有序广播的有序广播中的“有序”是针对广播接收者而言的，指的是发送出去的广播被BroadcastReceiver按照先后循序接收。有序广播的定义过程与普通广播无异，只是其的主要发送方式变为：sendOrderedBroadcast(intent, receiverPermission, ...)。  
对于有序广播，其主要特点总结如下：

* 多个具有当前已经注册且有效的BroadcastReceiver接收有序广播时，是按照先后顺序接收的，先后顺序判定标准遵循为：将当前系统中所有有效的动态注册和静态注册的BroadcastReceiver按照priority属性值从大到小排序，对于具有相同的priority的动态广播和静态广播，动态广播会排在前面。
* 先接收的BroadcastReceiver可以对此有序广播进行截断，使后面的BroadcastReceiver不再接收到此广播，也可以对广播进行修改，使后面的BroadcastReceiver接收到广播后解析得到错误的参数值。当然，一般情况下，不建议对有序广播进行此类操作，尤其是针对系统中的有序广播。
有序广播因为要处理消息的处理结果，所以要复杂一些。

```java
sendOrderedBroadcast(Intent intent, String receiverPermission, 
		BroadcastReceiver resultReceiver, Handler scheduler, int initialCode, 
		String initialData, Bundle initialExtras);
```
如果只是想让广播可以按优先级来收取，并不在意处理的结果，可以用下面的版本：
```java
sendOrderedBroadcast(Intent intent, String receiverPermission);
```
同样，在多用户环境下，也可以选择给哪个用户发广播：
```java
sendOrderedBroadcastAsUser(Intent intent, UserHandle user, String receiverPermission, 
                BroadcastReceiver resultReceiver, Handler scheduler, int initialCode, 
                String initialData, Bundle initialExtras);
```
## 3.3. 粘性广播
从Android 5.0(API 21)开始，因为安全性的问题，官方已经正式废弃了粘性广播。  
在这里还是稍作介绍：  
广播已经发出，但是没有接收器与广播匹配。或者在广播发出之后，广播接收器才注册。此时，广播接收器就无法接收广播。  
Android引入了StickyBroadcast，在广播发送结束后会保存刚刚发送的广播（Intent），这样当接收者注册完Receiver后就可以继续使用刚才的广播。如果在接收者注册完成前发送了多条相同Action的粘性广播，注册完成后只会收到一条该Action的广播，并且消息内容是最后一次广播内容。  
系统网络状态的改变发送的广播就是粘性广播。  
粘性广播通过Context的[sendStickyBroadcast(Intent)](http://developer.android.com/reference/android/content/Context.html#sendStickyBroadcast(android.content.Intent))接口发送，需要添加权限`<uses-permission android:name="android.permission.BROADCAST_STICKY"/>`  
也可以通过Context的[removeStickyBroadcast](http://developer.android.com/reference/android/content/Context.html#removeStickyBroadcast(android.content.Intent))([Intent](http://developer.android.com/reference/android/content/Intent.html))接口移除缓存的粘性广播。

# 4. 本地广播LocalBroadcastManager

LocalBroadcastManager除了能解决BroadcastReceiver进程间安全性问题外，相对Context操作的BroadcastReceiver而言还具有更高的运行效率。
* 发送广播
```java
LocalBroadcastManager.getInstance(context).sendBroadcast(Intent);
```
* 注册广播
```java
LocalBroadcastManager.getInstance(context).registerReceiver(BroadcastReceiver, IntentFilter);
```
* 解除广播 
```java 
LocalBroadcastManager.getInstance(context).unregisterReceiver(BroadcastReceiver);
```
其他同普通广播。

# 5. 生命周期
BroadcastReceiver**在onReceive函数执行结束后即表示生命周期结束**，所以不适合在onReceive中做绑定服务操作，结束后若某个进程只含有该BroadcastReceiver，则优先级将降低可能被系统回收，所以**BroadcastReceiver中不适合做一些异步操作**，如新建线程下载数据，BroadcastReceiver结束后可能在异步操作完成前进程已经被系统kill。  
同时由于ANR限制BroadcastReceiver的onReceive函数必须在10秒内完成，而且onReceive默认会在主线程中执行，所以**BroadcastReceiver中不适合做一些耗时操作**，对于耗时操作需要交给service处理，比如网络或数据库耗时操作、对话框的显示(因为现实时间可能超时，用Notification代替)。

# 6. 安全性
BroadcastReceiver的设计初衷就是从全局考虑的，可以方便应用程序和系统、应用程序之间、应用程序内的通信，所以对单个应用程序而言BroadcastReceiver是存在安全性问题的，相应问题及解决如下：
* 当应用程序发送某个广播时系统会将发送的Intent与系统中所有注册的BroadcastReceiver的IntentFilter进行匹配，若匹配成功则执行相应的onReceive函数。可以通过类似sendBroadcast(Intent, String)的接口**在发送广播时指定接收者必须具备的permission**。或通过Intent.setPackage设置广播仅对某个程序有效。
 
* 当应用程序注册了某个广播时，即便设置了IntentFilter还是会接收到来自其他应用程序的广播进行匹配判断。对于动态注册的广播可以通过类似registerReceiver(BroadcastReceiver, IntentFilter, String, android.os.Handler)的接口**指定发送者必须具备的permission**，对于静态注册的广播可以通过**android:exported="false"属性**表示接收者对外部应用程序不可用，即不接受来自外部的广播。
 
* 上面两个问题其实都可以通过LocalBroadcastManager来解决，LocalBroadcastManager只会将广播限定在当前应用程序中

# 7. 参考
[Android BroadcastReceiver介绍](http://www.cnblogs.com/trinea/archive/2012/11/09/2763182.html)  
[Android总结篇系列：Android广播机制](http://www.cnblogs.com/lwbqqyumidi/p/4168017.html)  
[说说Android的广播(1) - 普通广播,有序广播和粘性广播](https://yq.aliyun.com/articles/53919)  
