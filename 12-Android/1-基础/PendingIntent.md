可以理解为是条件触发的`Intent`。

![](https://shanghai-1252949174.cos.ap-shanghai.myqcloud.com/20191202/86e83d65a76520b0.jpg)

通过上图的静态方法分别对应去打开`Activity`，启动`Service`或者发送广播。

以`getBroadcast()`为例：

```java
    /**
     * @param context 上下文context
     * @param requestCode 发送方自己的requestCode
     * @param intent The Intent to be broadcast.
       * @param flags May be {@link #FLAG_ONE_SHOT}, {@link #FLAG_NO_CREATE},
     * {@link #FLAG_CANCEL_CURRENT}, {@link #FLAG_UPDATE_CURRENT},
     * {@link #FLAG_IMMUTABLE} or any of the flags as supported by
     * {@link Intent#fillIn Intent.fillIn()} to control which unspecified parts
     * of the intent that can be supplied when the actual send happens.
     *
     * @return 返回一个新的或者已经存在的PendingIntent对象，如果flags是FLAG_NO_CREATE会返回一个空对象。
     */
    public static PendingIntent getBroadcast(Context context, int requestCode,
            Intent intent, @Flags int flags) {
        return getBroadcastAsUser(context, requestCode, intent, flags,
                new UserHandle(UserHandle.myUserId()));
    }
```

主要看第四个参数flags：

* `FLAG_ONE_SHOT`

一次性的`PengdingIntent`，例如在发送过一次广播之后就会被销毁。

* `FLAG_NO_CREATE`

不会创建新的`PendingIntent`，如果没有已经存在`PendingIntent`就直接返回空对象。

* `FLAG_CANCEL_CURRENT`

取消已经存在的`PendingIntent`。

* `FLAG_UPDATE_CURRENT`

更新已经存在的`PendingIntent`。

* `FLAG_IMMUTABLE`

表示一个不可变的`PendingIntent`。



初始化一个`PendingIntent`之后，都是交给下游的其他类去调用，例如`SmsManager`、`AlarmManager`等。它们根据各自的触发条件，内部会去调用`PendingIntent`的`send()`方法，`send()`方法内部再去真正地发送`Intent`。

