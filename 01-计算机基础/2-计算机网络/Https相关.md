https://juejin.cn/post/6844903599303032845

http://ruanyifeng.com/blog/2014/02/ssl_tls.html

[也许，这样理解HTTPS更容易](https://mp.weixin.qq.com/s?__biz=MzAxMTI4MTkwNQ==&mid=2650825181&idx=1&sn=62bb9652c0236e4b0a9fe4848981493e&chksm=80b7b543b7c03c55e5a86416c3523bdba598456fba9dc5597d5ccce324db43c80d8037e2d68f&scene=21#wechat_redirect)

图文详解 HTTPS 工作原理：https://segmentfault.com/a/1190000022740692

ssl进化到tls

客户端发送第一次消息给服务端，带上随机数和支持的非对称加密算法

服务端返回第二次消息给客户端，带上随机数和证书

客户端读取证书中公钥，加密随机数，发送第三次消息给服务端

服务端用私钥解密随机数，发送第四次消息给客户端

三次的随机数，采用同样的方法生成对称加密秘钥，之后通信的数据全部用对称秘钥加密传输

> 数字证书是如何验证的

