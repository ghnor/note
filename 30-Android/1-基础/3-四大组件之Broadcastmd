# BroadcastReceiver相关

[Android四大组件：BroadcastReceiver史上最全面解析](https://www.jianshu.com/p/ca3d87a4cdf3)  
[Android 广播Broadcast的两种注册方式静态和动态](https://blog.csdn.net/csdn_aiyang/article/details/68947014)  
[Android四大组件：BroadcastReceiver史上最全面解析](https://blog.csdn.net/carson_ho/article/details/52973504)  
[安卓广播的底层实现原理](https://www.jianshu.com/p/02085150339c)

## 广播的分类？使用方式和场景

* 普通广播：开发者自身定义 intent的广播（最常用），所有的广播接收器几乎会在同一时刻接受到此广播信息，接受的先后顺序随机；
* 有序广播：发送出去的广播被广播接收者按照先后顺序接收，同一时刻只会有一个广播接收器能够收到这条广播消息，当这个广播接收器中的逻辑执行完毕后，广播才会继续传递，且优先级（priority）高的广播接收器会先收到广播消息。有序广播可以被接收器截断使得后面的接收器无法收到它；
* 本地广播：仅在自己的应用内发送接收广播，也就是只有自己的应用能收到，数据更加安全，效率更高，但只能采用动态注册的方式；
* 粘性广播：这种广播会一直滞留，当有匹配该广播的接收器被注册后，该接收器就会收到此条广播；

## 动态广播和静态广播有什么区别

* 使用方式：静态广播在AndroidManifest.xml中通过<receive>标签声明；动态广播在代码中调用Context.registerReceiver()方法使用；
* 特点：静态广播不受任何组件的生命周期的影响；动态广播跟随组件的生命周期变化；
* 应用场景：需要时刻监听广播就用静态广播；只需要在特定时刻监听广播就用动态广播；

## 广播发送和接收的原理了解吗 ？（Binder机制、AMS）

> [安卓广播的底层实现原理](https://www.jianshu.com/p/02085150339c)
