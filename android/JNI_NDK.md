# JNI/NDK

[Android JNI 篇 - 从入门到放弃](https://www.jianshu.com/p/3dab1be3b9a4)

## 对JNI是否了解

* Java的优点是跨平台，但也因为其跨平台的的特性导致其本地交互的能力不够强大，一些和操作系统相关的的特性Java无法完成，于是Java提供JNI专门用于和本地代码交互，通过JNI，用户可以调用C、C++编写的本地代码
* NDK是Android所提供的一个工具集合，通过NDK可以在Android中更加方便地通过JNI访问本地代码，其优点在于：
  * 提高代码的安全性。由于so库反编译困难，因此NDK提高了Android程序的安全性
  * 可以很方便地使用目前已有的C/C++开源库
  * 便于平台的移植。通过C/C++实现的动态库可以很方便地在其它平台上使用
  * 提高程序在某些特定情形下的执行效率，但是并不能明显提升Android程序的性能

## 如何加载NDK库？如何在JNI中注册Native函数，有几种注册方法？

```
public class JniTest{
    //加载NDK库 
    static{
        System.loadLirary("jni-test");
    }
}
```

注册JNI函数的两种方法：
* 静态方法
* 动态注册

[注册JNI函数的两种方式](https://blog.csdn.net/wwj_748/article/details/52347341)

## 你用JNI来实现过什么功能 ？ 怎么实现的 ？（加密处理、影音方面、图形图像处理)

[Android JNI 篇 - ffmpeg 获取音视频缩略图](https://www.jianshu.com/p/411761bd5f5b)