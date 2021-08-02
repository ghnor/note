[借腾讯开源 VasDolly，谈谈 Android 签名和多渠道打包的原理！](https://juejin.im/post/5a96325bf265da4e9b5942e5)

[带你了解腾讯开源的多渠道打包技术 VasDolly源码解析](https://blog.csdn.net/lmj623565791/article/details/79998048)

[Android多渠道打包（VasDolly实现原理）](https://www.jianshu.com/p/5baea0e1cd1e?utm_campaign=maleskine&utm_content=note&utm_medium=seo_notes&utm_source=recommendation)

> 针对v1签名

* 美团的方案

    修改apk的目录META-INF中添加空文件

* 腾讯的方案

    在APK文件的注释字段，添加渠道信息

都利用v1的签名的漏洞，美团的是不会校验META_INF下的内容；腾讯的是不会校验apk文件整体，只会校验apk中的单个文件。

> 针对v2

v2的签名相对v1完善了许多，会校验apk整体文件，说主流方案都是在apk中的签名块中插入key-value。
