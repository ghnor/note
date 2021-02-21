## 导出ANR文件

### 老版本

```
adb pull data/anr/traces.txt
```

### 新版本

在一些新的机型和系统上，使用老版本的方式会报错：

```
adb: error: failed to stat remote object 'data/anr/traces.txt': No such file or directory
```

可能是考虑到多次ANR会覆盖traces.txt的问题，所以为每次产生的traces文件添加时间后缀，**查看traces文件**：

```
adb shell
cd data/anr
ls -a
```

存在的traces文件：

```
anr_2020-09-01-17-59-19-235 anr_2020-09-01-18-17-19-090 transaction_log 
anr_2020-09-01-18-10-27-762 state                       transactions   
```

**尝试导出之前，记得先退出adb（`adb exit`）**，准备导出其中一个文件：

```
adb pull data/anr/anr_2020-09-01-17-59-19-235
```

```
adb: error: failed to copy 'data/anr/anr_2020-09-01-17-59-19-235' to '.\anr_2020-09-01-17-59-19-235': remote open failed: Permission denied
```

新版本的android系统会提示权限被拒绝，无法像以前一样导出anr目录下的某个文件。

可以使用`adb bugreport <directory>`导出，不指定<directory>时，默认导出到当前命令行目录。

导出为zip包，解压后在**FS/data/anr/**下就可以看到trances文件。

## 定位ANR

打开trances文件后，前面大概有百行是在描述线程信息和虚拟机状态，一般不需要管。

定位到我们自己的代码：

```java
"main" prio=5 tid=1 Sleeping
  | group="main" sCount=1 dsCount=0 flags=1 obj=0x718eab88 self=0x719049dc00
  | sysTid=29619 nice=-10 cgrp=default sched=0/0 handle=0x7191a0bed0
  | state=S schedstat=( 336961149 14352763 267 ) utm=31 stm=2 core=5 HZ=100
  | stack=0x7fd6293000-0x7fd6295000 stackSize=8192KB
  | held mutexes=
  at java.lang.Thread.sleep(Native method)
  - sleeping on <0x0e04b658> (a java.lang.Object)
  at java.lang.Thread.sleep(Thread.java:440)
  - locked <0x0e04b658> (a java.lang.Object)
  at java.lang.Thread.sleep(Thread.java:356)
  at com.ghnor.androidpractices.MainActivity.lambda$onCreate$4(MainActivity.java:53)
  at com.ghnor.androidpractices.-$$Lambda$MainActivity$lsS9yIcD8Jk3j1GPfn2GzF5KBIg.onClick(lambda:-1)
  at android.view.View.performClick(View.java:7201)
  at android.view.View.performClickInternal(View.java:7170)
  at android.view.View.access$3500(View.java:806)
  at android.view.View$PerformClick.run(View.java:27562)
  at android.os.Handler.handleCallback(Handler.java:883)
  at android.os.Handler.dispatchMessage(Handler.java:100)
  at android.os.Looper.loop(Looper.java:214)
  at android.app.ActivityThread.main(ActivityThread.java:7682)
  at java.lang.reflect.Method.invoke(Native method)
  at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:516)
  at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:950)
```

在MainActivity的一个控件点击事件，调用`Thread.sleep(50000)`，模拟了一次ANR，可以直接看到产生ANR的代码是在`MainActivity.java:53`。