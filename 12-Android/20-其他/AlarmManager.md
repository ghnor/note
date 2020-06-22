## API演进

在Android 4.4（API 19）之前，一般是用如下三个方法：

```java
// 设定一个一次性的闹钟
set(int type, long triggerAtMillis, PendingIntent operation): void
```

```java
// 设定一个重复执行的闹钟
setRepeating(int type, long triggerAtMillis, long intervalMillis, PendingIntent operation): void
```

```java
// 同样是重复执行的闹钟，但是触发时间不是精确的。比如说设定在09：00的闹钟，不会在正好在9点触发，可能会有延迟；同时，设定间隔1小时，但是每次触发的实际时间可能不是1小时。
setInexactRepeating(int type, long triggerAtMillis, long intervalMillis, PendingIntent operation): void
```

在Android 4.4（API 19）之后

> [Note: Beginning with API 19 (Build.VERSION_CODES.KITKAT) alarm delivery is inexact: the OS will shift alarms in order to minimize wakeups and battery use. There are new APIs to support applications which need strict delivery guarantees; see setWindow(int, long, long, PendingIntent) and setExact(int, long, PendingIntent). Applications whose targetSdkVersion is earlier than API 19 will continue to see the previous behavior in which all alarms are delivered exactly when requested.](https://developer.android.google.cn/reference/android/app/AlarmManager)

为了减少CPU唤醒和优化耗电量，上述的三个方法设置的闹钟不能精确触发，如果需要精确定时，Google提供了如下两个方法：

```java
// 这个闹钟是绝对精确的，设定在09：00触发，绝对不会等到01分才响。
setExact(int type, long triggerAtMillis, PendingIntent operation): void
```

```java
// This method allows an application to take advantage of the battery optimizations that arise from delivery batching
// 行吧，我承认，文档上原文我没看懂，意思可能是这个方法比第一个会省电一些吧。
setWindow(int type, long windowStartMillis, long windowLengthMillis, PendingIntent operation): void
```

在Android 6.0（API 23）中引入了[低电耗模式和应用待机模式](https://developer.android.google.cn/about/versions/marshmallow/android-6.0-changes)，[对低电耗模式和应用待机模式进行针对性优化](https://developer.android.google.cn/training/monitoring-device-state/doze-standby)：

![](https://shanghai-1252949174.cos.ap-shanghai.myqcloud.com/20181213/59bbb257367363d4674ad25769351cb1.png)

```java
// 跟set方法同样的策略
setAndAllowWhileIdle(int type, long triggerAtMillis, PendingIntent operation): void
```

```java
// 跟setExact方法同样的策略
setExactAndAllowWhileIdle(int type, long triggerAtMillis, PendingIntent operation): void
```

在Android 7.0（API 24）中，引入了一个新接口——`AlarmManager.OnAlarmListener`，同时也新增了几个方法：

```java
set(int type, long triggerAtMillis, String tag, AlarmManager.OnAlarmListener listener, Handler targetHandler): void
```

```java
setExact(int type, long triggerAtMillis, String tag, AlarmManager.OnAlarmListener listener, Handler targetHandler): void
```

```java
setWindow(int type, long windowStartMillis, long windowLengthMillis, String tag, AlarmManager.OnAlarmListener listener, Handler targetHandler): void
```

这几个方法的执行策略跟之前的是一样的，区别在于，之前的方法在触发之后通过PendingIntent来执行你想要的操作，比如发送一个广播。但是新的方法可以直接通过回调来触发。

## 参数详解

* int type

    * AlarmManager.ELAPSED_REALTIME
    
        闹钟在手机睡眠状态下不可用，该状态下闹钟使用相对时间（相对于系统启动开始），状态值为3；

    * AlarmManager.ELAPSED_REALTIME_WAKEUP

        闹钟在睡眠状态下会唤醒系统并执行提示功能，该状态下闹钟也使用相对时间，状态值为2；
    
    * AlarmManager.RTC

        闹钟在睡眠状态下不可用，该状态下闹钟使用绝对时间，即当前系统时间，状态值为1； 

    * AlarmManager.RTC_WAKEUP

        闹钟在睡眠状态下会唤醒系统并执行提示功能，该状态下闹钟使用绝对时间，状态值为0。

* long triggerAtMillis

    闹钟的第一次执行时间，以毫秒为单位。该参数的入参跟第一个参数`int type`有关，如果`int type`是相对时间（`ELAPSED_REALTIME`和`ELAPSED_REALTIME_WAKEUP`），那么该参数使用的就是相对时间（`SystemClock.elapsedRealtime()`）；如果`int type`是绝对时间（`RTC`和`RTC_WAKEUP`），那么该参数使用的就是绝对时间（`System.currentTimeMillis()`）。

* long intervalMillis

    两次闹钟执行的间隔时间，以毫秒为单位。

* PendingIntent operation

    闹钟触发之后需要执行的动作。  
    如果是启动服务，通过`PendingIntent.getService`方法获取`PendingIntent`对象;如果是启动`Activity`，通过`PendingIntent.getActivity`方法获取；如果是发送广播，通过`PendingIntent.getBroadcast`方法获取。

## Demo

定一个每天早上9点的闹钟，通过广播提醒。

```java
public enum DailyOpenEventTracker {

    INSTANCE;

    DailyOpenEventTracker() {
        initAlarm();
    }

    private static final String TAG = "DailyOpenEventTracker";

    private Context context;
    private BroadcastReceiver alarmReceiver;
    private Handler handler;
    private DateFormat dateFormat;
    {
        context = MainApplication.get().getApplicationContext();
        alarmReceiver = new AlarmReceiver();
        context.registerReceiver(alarmReceiver, new IntentFilter(AlarmReceiver.ACTION));
        handler = new Handler() {
            @Override
            public void handleMessage(Message msg) {
                super.handleMessage(msg);
                if (msg.what == AlarmReceiver.HANDLER_MESSAGE) {
                    LogUtil.i(TAG, "定时任务启动！！！");
                    repeatingAlarm();
                    // do something you want...
                }
            }
        };
        dateFormat = new SimpleDateFormat("yyyy年MM月dd日HH时mm分ss秒");
    }

    private void initAlarm() {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Service.ALARM_SERVICE);
        PendingIntent pendingIntent = getPendingIntent();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            LogUtil.i(TAG, "启动方式--->" + "M");
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, getTriggerMillis(), pendingIntent);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            LogUtil.i(TAG, "启动方式--->" + "KITKAT");
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, getTriggerMillis(), pendingIntent);
        } else {
            LogUtil.i(TAG, "启动方式--->" + "Other");
            alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, getTriggerMillis(), AlarmManager.INTERVAL_DAY, pendingIntent);
        }
    }

    private void repeatingAlarm() {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Service.ALARM_SERVICE);
        PendingIntent pendingIntent = getPendingIntent();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            LogUtil.i(TAG, "启动方式--->" + "M");
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, getTriggerMillis(), pendingIntent);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            LogUtil.i(TAG, "启动方式--->" + "KITKAT");
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, getTriggerMillis(), pendingIntent);
        }
    }

    private PendingIntent getPendingIntent() {
        Intent intent = new Intent(AlarmReceiver.ACTION);
        PendingIntent pendingIntent = PendingIntent
                .getBroadcast(context, 0, intent, 0);
        return pendingIntent;
    }

    private long getTriggerMillis() {
        // 这里设置的是当天的09：00分，注意精确到秒，时间可以自由设置
        Calendar ca = Calendar.getInstance();
        ca.set(Calendar.HOUR_OF_DAY, 9);
        ca.set(Calendar.MINUTE, 0);
        ca.set(Calendar.SECOND, 0);
        long now = System.currentTimeMillis();
        long future = getFutureMillis(ca, now);
        LogUtil.i(TAG, dateFormat.format(new Date(future)));
        return future;
    }

    private long getFutureMillis(Calendar ca, long now) {
        long future = ca.getTimeInMillis();
        if (future <= now) {
            ca.set(Calendar.DAY_OF_MONTH, ca.get(Calendar.DAY_OF_MONTH) + 1);
            return getFutureMillis(ca, now);
        } else {
            return future;
        }
    }

    private class AlarmReceiver extends BroadcastReceiver {
        public static final String ACTION = "alarm_receiver_action";
        public static final int HANDLER_MESSAGE = 0x301;

        @Override
        public void onReceive(Context context, Intent intent) {
            handler.sendEmptyMessage(HANDLER_MESSAGE);
        }
    }
}
```