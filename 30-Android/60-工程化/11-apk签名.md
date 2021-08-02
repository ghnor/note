> [Android V1及V2签名原理简析](https://juejin.im/post/5cd239386fb9a0320f7dfcbe)  
> [Android v1、v2、v3签名详解](https://mp.weixin.qq.com/s/VHkF779ffwa8_DQMs9yzPw)  
> [Android 端 V1/V2/V3 签名的原理](https://zhuanlan.zhihu.com/p/108034286)  
> ：比较完整地介绍三种签名的实现和原理

> [APK签名机制原理详解](https://www.jianshu.com/p/286d2b372334)  
> [APK签名机制之——JAR签名机制详解](https://www.jianshu.com/p/682bb351099f)  
> [APK签名机制之——V2签名机制详解](https://www.jianshu.com/p/308515c94dc6)  
> ：介绍了签名的基本原理，数字摘要，数字签名，数字证书，签名和校验的过程  
以及v2签名中关于zip格式的内容介绍（数据区、中央目录、中央目录结尾记录）

> [Android v1、v2、v3签名详解](https://mp.weixin.qq.com/s/VHkF779ffwa8_DQMs9yzPw)  
> ：更加详细地介绍了数字摘要，数字签名和数字证书的概念。

> [Android V3 签名方案，使用密钥转轮为签名更新做准备！](https://juejin.cn/post/6844903843361210381)  
> ：v3签名的介绍，以及和v2的区别

Android 签名替换的问题，Google 已经在考虑了，9.0 新增的 V3 签名方案就是为了解决签名替换的。这些，肯定都是提前准备。

签名过期的问题，不需要太担心，我们只需要跟着 Google 的步伐就可以了。

最后小结一下结论，签名过期的问题，在 Android 9.0 上新支持的 V3 签名，已经有解决的方案了。另外：

1. V1 签名遵循 JAR 的签名方式，单独验证 APK 压缩包中的文件。
2. V2 签名是针对 APK 文件的验证，将签名信息写入签名块中，增强了安全性和验证效率。
3. V3 签名在签名块中又增加了新块（attr），由更小的 level 块，以链表的形式存储多个证书。
4. 在 V3 方案中，最旧的证书为新块链表的根节点，以此对新证书签名，确保新证书正确有效。

> **v1签名**

在签名后，增加了META-INF文件夹，该文件夹下有MANIFEST.MF、CERT.SF、CERT.RSA。

主要的签名动作就在这里产生，
首先是MAINFEST.MF，apk包中所有的文件，都经过SHA摘要算法计算摘要，再经过BASE64编码，保存到MANIFEST.MF中；
再是CERT.SF，对整个MANIFEST.MF做HASH摘要并BASE64编码，对MANIFEST.MF中每个条目再做一次HASH摘要并BASE64编码，保存在CERT.SF中；
最后是CERT.RSA，对整个CERT.SF进行私钥加密，与公钥一起保存在CERT.RSA中。

> **v2签名**

在apk文件结构中，插入一段签名块。

> **v3签名**

在v2的基础上，增加了签名轮替，主要解决了v1和v2在以后签名过期的问题。
