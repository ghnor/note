[Android AOP 总结](https://blog.csdn.net/chenzhiqin20/article/details/62444064)

https://juejin.im/post/5c45bce5f265da612c5e2d3f

编译时注解：
https://blog.csdn.net/lmj623565791/article/details/51931859
https://blog.csdn.net/lmj623565791/article/details/43452969



https://www.jianshu.com/p/44d39585fc20

https://juejin.im/post/5c01533de51d451b80257752#heading-9

https://www.jianshu.com/p/dca3e2c8608a

https://zhuanlan.zhihu.com/p/24876611

https://blog.csdn.net/qq_32115439/article/details/78361596

[动态代理、Hook、AOP、插件化技术的联系与区别](https://www.jianshu.com/p/480b2eddea9c)

[Android进阶；AOP框架深入原理研究与实战](https://www.jianshu.com/p/7df5d71e4e03)

> ## APT
>
> > [Android编译时注解--入门篇（AbstractProcessor、APT）](https://www.jianshu.com/p/b5be6b896a1a)
> > [Android APT工作原理（annotationProcessor）](https://www.jianshu.com/p/89ac9a2513c4?utm_campaign=haruki)
> >
> > javaCompile编译时，会经过词法分析、语法分析，注解处理，在注解处理阶段会重新对抽象语法树进行修改，再重新执行词法分析和语法分析，直到处理完全部注解。
> > apt就在注解处理阶段介入，生成java代码，或者修改抽象语法树。
>
> > [Android 注解系列之APT工具（三）](https://juejin.cn/post/6844903701283340301)
> >
> > `APT(Annotation Processing Tool)`是javac中提供的一种编译时扫描和处理注解的工具，它会对源代码文件进行检查，并找出其中的注解，然后根据用户自定义的注解处理方法进行额外的处理。APT工具不仅能解析注解，还能根据注解生成其他的源文件，最终将生成的新的源文件与原来的源文件共同编译（`注意：APT并不能对源文件进行修改操作，只能生成新的文件，例如在已有的类中添加方法`）。
>
> > [AOP 最后一块拼图 | AST 抽象语法树 —— 最轻量级的AOP方法](https://juejin.cn/post/6844903764982235150)
>
> > 1. 实现AbstractProcess类，用@AutoService(Processor.class)注解
> > 2. process方法中去实现逻辑，生成java类，或者去修改抽象语法树

> ## AspectJ
>
> [AspectJ in Android （一），AspectJ 基础概念](https://www.jianshu.com/p/9425be43968a)
> [AspectJ in Android （二），AspectJ 语法](https://www.jianshu.com/p/691acc98c0b8)
> [AspectJ in Android （三），AspectJ 两种用法以及常见问题](https://www.jianshu.com/p/d32a2453786e)
>
> [看AspectJ在Android中的强势插入](https://zhuanlan.zhihu.com/p/24876611)
>
> [Android面向切面编程（AOP）](https://juejin.cn/post/6844903511835017223)
>
> [Aspectj 解决Android 6.0以上权限问题](https://www.jianshu.com/p/6c1b0ec68ff6)
>
> [Aspect示例之继承关系测试](https://blog.csdn.net/fei20121106/article/details/70285499)
>
> > 1. 定义一个类，用@AspectJ注解
> > 2. 定义方法，用Aspect提供织入点注解标记
>
> > 织入点call和execution的区别
> >
> > call是方法调用的地方，在方法体外；execution是方法执行的地方，在方法体中。
>
> > [原生AspectJ用法分析以及Spring-AOP原理分析](https://blog.mythsman.com/post/5d301cf2976abc05b34546be/)
> >
> > [AspectJ框架实现原理](https://blog.csdn.net/zhao9tian/article/details/37762389)
> >
> > [AOP之@AspectJ技术原理详解](https://blog.csdn.net/woshimalingyi/article/details/73252013)
> >
> > 在javac编译之后，javac.dolast{}介入。
> >
> > 这当中重点的文件是四个jar包中的前三个，bin文件夹中的脚本其实都是调用这些jar包的命令。
> >
> > - aspectjrt.jar包主要是提供**运行时**的一些注解，静态方法等等东西，通常我们要使用aspectJ的时候都要使用这个包。
> > - aspectjtools.jar包主要是提供赫赫有名的**ajc编译器**，可以在编译期将将java文件或者class文件或者aspect文件定义的切面织入到业务代码中。通常这个东西会被封装进各种IDE插件或者自动化插件中。
> > - aspectjweaverjar包主要是提供了一个java agent用于在**类加载期**间织入切面(Load time weaving)。并且提供了对切面语法的相关处理等基础方法，供ajc使用或者供第三方开发使用。这个包一般我们不需要显式引用，除非需要使用LTW。
> >
> > 上面的说明其实也就指出了aspectJ的几种标准的使用方法(参考[文档](http://www.eclipse.org/aspectj/doc/released/devguide/ltw.html#weaving-class-files-more-than-once))：
> >
> > 1. **编译时织入**，利用ajc编译器替代javac编译器，直接将源文件(java或者aspect文件)编译成class文件并将切面织入进代码。
> > 2. **编译后织入**，利用ajc编译器向javac编译期编译后的class文件或jar文件织入切面代码。
> > 3. **加载时织入**，不使用ajc编译器，利用aspectjweaver.jar工具，使用java agent代理在类加载期将切面织入进代码。

