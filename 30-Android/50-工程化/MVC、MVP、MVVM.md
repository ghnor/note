# MVC、MVP、MVVM

MVC

* 视图层(View) 对应于xml布局文件和java代码动态view部分
* 控制层(Controller) MVC中Android的控制层是由Activity来承担的，Activity本来主要是作为初始化页面，展示数据的操作，但是因为XML视图功能太弱，所以Activity既要负责视图的显示又要加入控制逻辑，承担的功能过多。
* 模型层(Model) 针对业务模型，建立数据结构和相关的类，它主要负责网络请求，数据库处理，I/O的操作。
* 具有一定的分层，model彻底解耦，controller和view并没有解耦层与层之间的交互尽量使用回调或者去使用消息机制去完成，尽量避免直接持有 controller和view在android中无法做到彻底分离，但在代码逻辑层面一定要分清业务逻辑被放置在model层，能够更好的复用和修改增加业务。

MVP

* 通过引入接口BaseView，让相应的视图组件如Activity，Fragment去实现BaseView，实现了视图层的独立，通过中间层Preseter实现了Model和View的完全解耦。MVP彻底解决了MVC中View和Controller傻傻分不清楚的问题，但是随着业务逻辑的增加，一个页面可能会非常复杂，UI的改变是非常多，会有非常多的case，这样就会造成View的接口会很庞大。

MVVM

* MVP中我们说过随着业务逻辑的增加，UI的改变多的情况下，会有非常多的跟UI相关的case，这样就会造成View的接口会很庞大。而MVVM就解决了这个问题，通过双向绑定的机制，实现数据和UI内容，只要想改其中一方，另一方都能够及时更新的一种设计理念，这样就省去了很多在View层中写很多case的情况，只需要改变数据就行。

三者如何选择？

* 如果项目简单，没什么复杂性，未来改动也不大的话，那就不要用设计模式或者架构方法，只需要将每个模块封装好，方便调用即可，不要为了使用设计模式或架构方法而使用。
* 对于偏向展示型的app，绝大多数业务逻辑都在后端，app主要功能就是展示数据，交互等，建议使用mvvm。
* 对于工具类或者需要写很多业务逻辑app，使用mvp或者mvvm都可。

[MVC、MVP、MVVM，我到底该怎么选](https://juejin.im/post/5b3a3a44f265da630e27a7e6)

## 封装p层之后.如果p层数据过大,如何解决？

对于MVP模式来说，P层如果数据逻辑过于臃肿，建议引入RxJava或则Dagger，越是复杂的逻辑，越能体现RxJava的优越性。

[（仿有道精品课）RxJava+OkHttp+Retrofit+Dagger2+MVP框架(kotlin版本)](https://juejin.im/post/5c6e601cf265da2dc675b69e#comment)