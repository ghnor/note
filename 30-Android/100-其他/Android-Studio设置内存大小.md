# Android Studio设置内存大小

**需要修改的文件的路径：**

```
# Mac平台

Android studio包内容中的contents/bin/studio.vmoptions
```

```
# Windows平台

## 64位
Android Studio安装目录中的studio64.exe.vmoptions

## 32位
Android Studio安装目录中的studio.exe.vmoptions
```

**可修改的参数说明：**

* -Xms128m

    JVM启动的起始堆内存，堆内存是分配给对象的内存。

* -Xmx750m

    Android Studio可以使用的最大堆内存。

这两个参数都是-X开头的，表示非标准的参数。什么叫非标准的呢？我们知道JVM有很多个实现，Oracle的，OpenJDK等等，这里的-X参数，是Oracle的JVM实现使用的，OpenJDK不一定能使用，也就是没有将这些参数标准化，让所有的JVM实现都能使用。

* -XX:PermSize

    最小永久代内存。

* -XX:MaxPermSize

    最大永久代内存。

在Java8之后，已经移除了永久代内存区域。

---

同时在gradle中也可以配置相关内容。

打开根目录下的`gradle.properties`，添加`org.gradle.jvmargs=-Xmx5120M -XX:MaxPermSize=512m`。

默认情况下，`-Xms`和`-XX:PermSize`是物理内存的1/64，`-Xmx`和`-XX:MaxPermSize`是物理内存的1/4，