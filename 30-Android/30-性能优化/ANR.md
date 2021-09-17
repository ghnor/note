[官方文档ANR](https://developer.android.com/topic/performance/vitals/anr?hl=zh-cn#top_of_page)

[看完这篇 Android ANR 分析，就可以和面试官装逼了！](https://mp.weixin.qq.com/s?__biz=MzIwMTAzMTMxMg==&mid=2649493643&idx=1&sn=34b51d1f61bd2ecaa8fd0a2d39c4d1d1&chksm=8eec9b74b99b126246acc4547597dfe55c836b8f689b2d1a65bdf1ee2054ced2fc070bfa2678&mpshare=1&scene=24&srcid=0116vzNfMMv2dLizhAT8mEYq#rd)

[ANR问题的定位与分析](https://cloud.tencent.com/developer/article/1601328)

[如何分析ANR](https://www.jianshu.com/p/cfa9ed42e379)

[Android ANR排查手册](https://blog.csdn.net/zhonglunshun/article/details/89680993)

在Android上，如果你的应用程序有一段时间响应不够灵敏，系统会向用户显示一个对话框，这个对话框称作应 用程序无响应（ANR：Application NotResponding）对话框。 用户可以选择让程序继续运行，但是，他们在使用你的 应用程序时，并不希望每次都要处理这个对话框。因此 ，在程序里对响应性能的设计很重要这样，这样系统就不会显 示ANR给用户。

不同的组件发生ANR的时间不一样，Activity是5秒，BroadCastReceiver是10秒，Service是20秒（均为前台）。

如果开发机器上出现问题，我们可以通过查看/data/anr/traces.txt即可，最新的ANR信息在最开始部分。

主线程被IO操作（从4.0之后网络IO不允许在主线程中）阻塞。
主线程中存在耗时的计算
主线程中错误的操作，比如Thread.wait或者Thread.sleep等 Android系统会监控程序的响应状况，一旦出现下面两种情况，则弹出ANR对话框
应用在5秒内未响应用户的输入事件（如按键或者触摸）
BroadcastReceiver未在10秒内完成相关的处理
Service在特定的时间内无法处理完成 20秒

修正：

1、使用AsyncTask处理耗时IO操作。

2、使用Thread或者HandlerThread时，调用Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND)设置优先级，否则仍然会降低程序响应，因为默认Thread的优先级和主线程相同。

3、使用Handler处理工作线程结果，而不是使用Thread.wait()或者Thread.sleep()来阻塞主线程。

4、Activity的onCreate和onResume回调中尽量避免耗时的代码。 BroadcastReceiver中onReceive代码也要尽量减少耗时，建议使用IntentService处理。

解决方案：

将所有耗时操作，比如访问网络，Socket通信，查询大量SQL语句，复杂逻辑计算等都放在子线程中去，然后通过handler.sendMessage、runonUIThread、AsyncTask、RxJava等方式更新UI。无论如何都要确保用户界面的流畅 度。如果耗时操作需要让用户等待，那么可以在界面上显示度条。

## ANR产生的原因是什么？怎么定位？

## 什么是ANR？什么情况会出现ANR？如何避免？在不看代码的情况下如何快速定位出现ANR问题所在？

* ANR（Application Not Responding，应用无响应）：当操作在一段时间内系统无法处理时，会在系统层面会弹出ANR对话框
* 产生ANR可能是因为5s内无响应用户输入事件、10s内未结束BroadcastReceiver、20s内未结束Service
* 想要避免ANR就不要在主线程做耗时操作，而是通过开子线程，方法比如继承Thread或实现Runnable接口、使用AsyncTask、IntentService、HandlerThread等

