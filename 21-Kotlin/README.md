重学Kotlin之那些你没注意到的细节：https://mp.weixin.qq.com/s/boqg-yqtkS077pYPF51CCg

> 协程
>
> [浅谈有栈协程与无栈协程](https://zhuanlan.zhihu.com/p/347445164)
>
> 所谓的有栈，无栈并不是说这个协程运行的时候有没有栈，而是说协程之间是否存在调用栈（callbackStack）。
>
> [【码上开学】Kotlin 的协程用力瞥一眼](https://juejin.cn/post/6844903949686800392)
>
> [Android-kotlin-coroutine协程的概念](https://blog.csdn.net/weixin_45365889/article/details/102678217)

> [Kotlin学习系列之：协程的取消和超时](https://blog.csdn.net/xlh1191860939/article/details/104970507/)
>
> - kotlinx.coroutines包下的所有挂起函数都是可取消的。这些挂起函数会检查协程的取消状态，当取消时就会抛出CancellationException异常
> - 如果协程正在处于某个计算过程当中，并且没有检查取消状态，那么它就是无法被取消的

> 作用域函数
>
> [Kotlin作用域函数之间的区别和使用场景详解](https://www.zhangshengrong.com/p/9Oab8JqyXd/)
>
> [Kotlin作用域函数之间的区别与使用场景](https://juejin.cn/post/6863853301210906638#heading-14)

> [Kotlin的inline noinline crossinline笔记](https://www.jianshu.com/p/1d7374349a00)
>
> - inline
>   - 减少了方法调用的开销
>   - 会将方法体中的代码复制一份到调用方法的地方
> - noinline
>   - 已经内联的高阶函数，存在函数参数不想参与内联的情况，使用noinline关键字
> - crossinline
>   - 避免inline产生的可能影响，复制方法体中的局部返回return影响了调用者的整体流程
>   - 通过编译检查，禁止crossinline中使用局部返回return

> [Kotlin 中infix，inline,noinline,crossinline ,refied 等的理解](https://blog.csdn.net/weixin_47933729/article/details/117068706)
>
> - infix
>   - 中缀表示法
> - refied
>   - 搭配inline一起使用

> 扩展函数
>
> 通过生成一个类，将扩展函数作为类的静态方法使用。

> 伴生对象
>
> > [Kotlin的伴生对象到底是不是java的static？ Kotlin的加载顺序是怎样的？](https://www.zhihu.com/question/277220015)
> >
> > 虽然 object 的名称通常建议大写，以至于让一部分人误以为跟 Class 类似是储存一种结构，然后可以基于这种结构创建实例。
> >
> > 实际上 object 在声明后就已经存在实例引用，并且有且只有一个实例，那就是 object 的名称。所以可以将 object 理解为一种只需要单实例的 Class 对象，它在声明的时候定义结构，第一次访问的时候进行创建，以后无论访问多少次都只是同一个对象。

