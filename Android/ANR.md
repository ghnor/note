ANR：Application Not Responding，即应用无响应。

可以通过 /data/anr/traces.txt 文件查看ANR信息。

### ANR一般有三种类型

1. KeyDispatchTimeout(5 seconds)  
按键或触摸事件在特定时间内无响应

2. BroadcastTimeout(10 seconds)  
BroadcastReceiver在特定时间内无法处理完成

3. ServiceTimeout(20 seconds)  
Service在特定的时间内无法处理完成

### 可能的原因

* 主线程被IO操作（从4.0之后网络IO不允许在主线程中）阻塞。
* 主线程中存在耗时的计算
* 主线程中错误的操作，比如Thread.wait或者Thread.sleep等 Android系统会监控程序的响应状况，一旦出现下面两种情况，则弹出ANR对话框
* 应用在5秒内未响应用户的输入事件（如按键或者触摸）
* BroadcastReceiver未在10秒内完成相关的处理
* Service在特定的时间内无法处理完成 20秒
* 使用AsyncTask处理耗时IO操作。
* 使用Thread或者HandlerThread时，调用Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND)设置优先级，否则仍然会降低程序响应，因为默认Thread的优先级和主线程相同。
* 使用Handler处理工作线程结果，而不是使用Thread.wait()或者Thread.sleep()来阻塞主线程。
* Activity的onCreate和onResume回调中尽量避免耗时的代码
* BroadcastReceiver中onReceive代码也要尽量减少耗时，建议使用IntentService处理。

### 如何避免

* UI线程尽量只做跟UI相关的工作，但一些复杂的UI操作，还是需要一些技巧来处理，不如你让一个Button去setText一个10M的文本，UI肯定崩掉了，不过对于此类问题，分段加载貌似是最好的方法了。

* 让耗时的工作（比如数据库操作，I/O，连接网络或者别的有可能阻碍UI线程的操作）把它放入单独的线程处理。

* 尽量用Handler来处理UIthread和别的thread之间的交互。

### 主要的UI线程

* Activity：onCreate()、onResume()、onDestroy()、onKeyDown()、onClick()

* Service：onCreate(), onStart()、onDestroy()

* BroadcastReceiver：onReceiver()

* Application：onCreate()、onTerminate()

* AsyncTask：onPreExecute()、onProgressUpdate()、onPostExecute()、onCancel()

* Mainthread handler：handleMessage()、post(runnable r)
