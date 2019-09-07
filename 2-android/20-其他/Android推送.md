> [推送，从入门到放弃](http://mp.weixin.qq.com/s?__biz=MzAxNzMxNzk5OQ==&mid=2649484726&idx=1&sn=7bcd8c2c9265be6a49b9e9f7fe4a95ad&chksm=83f824b6b48fada09d01bbd7ff09adb2ede6fbc4857d8be7114dab7f9c3f45137b7c6e008c2b#rd)  
> [Android推送技术研究](http://www.jianshu.com/p/584707554ed7)

> [Android 心跳的分析](http://blog.csdn.net/wangliang198901/article/details/16542567)

### 三种实现思路：

* 轮询

* SMS

* 长连接

### 四种实现方案：

* GCM服务

* XMPP协议

* MQTT协议

* HTTP轮询

### TCP长连接

TCP在连接时有三次握手的过程，长连接即在成功连接后，除非主动断开，否则可以直接进行数据传输。

### 心跳包

目的在于检测Client和Server之间的连接是否正常。  
在检测在连接中断之后，也要在尝试重新建立连接。

### Android端保证连接Service的稳定
