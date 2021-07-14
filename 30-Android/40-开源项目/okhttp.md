# OkHttp

[Android OkHttp完全解析 是时候来了解OkHttp了](https://blog.csdn.net/lmj623565791/article/details/47911083)

[Android OkHttp源码解析入门教程（一）](https://juejin.im/post/5c46822c6fb9a049ea394510)  
[Android OkHttp源码解析入门教程（二）](https://juejin.im/post/5c4682d2f265da6130752a1d)

[OKHttp全解析系列（一） -- HTTP基础](https://www.jianshu.com/p/8962f1f175e8)

## 参数是如何组装的？

## 拦截器

> [Okhttp3拦截器-应用拦截器和网络拦截器的区别](https://www.jianshu.com/p/2734d0c0e88c)
>
> ##### Application interceptors
>
> - Don't need to worry about intermediate responses like redirects and retries.
>      不需要关心是否重定向或者失败重连
> - Are always invoked once, even if the HTTP response is served from the cache.
>      应用拦截器只会调用一次，即使数据来源于缓存
> - Observe the application's original intent. Unconcerned with OkHttp-injected headers like If-None-Match.
>      只考虑应用的初始意图，不去考虑Okhhtp注入的Header比如：if-None-Match,意思就是不管其他外在因素只考虑最终的返回结果
> - Permitted to short-circuit and not call Chain.proceed().
>      根据第二张图我们可以看出，自定义的应用拦截器是第一个开始执行的拦截器，所以这句话的意思就是，应用拦截器可以决定是否执行其他的拦截器，通过Chain.proceed().
> - Permitted to retry and make multiple calls to Chain.proceed().
>      和上一句的意思差不多，可以执行多次调用其他拦截器，通过Chain.proceed().
>
> ##### Network Interceptors
>
> - Able to operate on intermediate responses like redirects and retries.
>      根据第三张图，我们可以理解这句话的意思是，网络拦截器可以操作重定向和失败重连的返回值
> - Not invoked for cached responses that short-circuit the network.
>      根据第一张图，我们可以以看出，这句换的意思是，取缓存中的数据就不会去还行Chain.proceed().所以就不能执行网络拦截器
> - Observe the data just as it will be transmitted over the network.
>      意思是通过网络拦截器可以观察到所有通过网络传输的数据
> - Access to the Connection that carries the request.
>      根据第二张图我们可以看出，请求服务连接的拦截器先于网络拦截器执行，所以在进行网络拦截器执行时，就可以看到Request中服务器请求连接信息，因为应用拦截器是获取不到对应的连接信息的。
>
> 
>
> 作者：lengyan_zhao
> 链接：https://www.jianshu.com/p/2734d0c0e88c
> 来源：简书
> 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

分为应用拦截器和网络拦截器。

在拦截器链中插入的位置不同，应用拦截器插入在整个链路的最前部，网络拦截器插入到ConnectInterceptor（与服务端建立连接）之后。
表现为就算实际请求是来自缓存，也不管当中经过多少次重定向或者重试，应用拦截器的请求和响应都只会触发一次；
而网络拦截器，如果来自缓存就不会触发，有多少次重定向或者重试就会触发几次。