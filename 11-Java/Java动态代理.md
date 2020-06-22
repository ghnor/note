为了行文方便，预设两个设定：

**功能类** ：实际执行的类，也称之为被代理类，不同的人有不同的叫法，无所谓，它是我们最后真正想执行的类。

**操作类** ：代理类，它是我们在业务代码中持有的类，同时它自身持有功能类的实例。

那么首先思考一个问题，为什么要用代理模式？（或者说代理模式到底解决了实际编程中的什么问题）

以我浅薄的编程阅历，模拟这样一个场景。我们要修改的功能类被封装在jar包中，导致我们无法直接修改该功能类。所以就新建一个操作类，以该操作类为媒介去执行功能类的方法，在此基础上，可以任意的添加或修改功能。

本来主要是讲动态代理的，但为了更好地理解动态代理，先从静态代理入手。

## 静态代理

首先是功能类，懒得模拟什么场景，反正就有一个方法`doAction`可以给我们调用：

```java
public interface IFunction {
    void doAction();
}
```

```java
public class FunctionClass implements IFunction {
    @Override
    public void doAction() {
        System.out.println("FunctionClass--->doAction");
    }
}
```

我们希望给它加上一个功能，随便什么功能啦，例子就是多打印一行日志，通过静态代理完成：

```java
public class OperationClass implements IFunction {
    FunctionClass functionClass = new FunctionClass();

    @Override
    public void doAction() {
        System.out.println("OperationClass--->doAction");
        functionClass.doAction();
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        OperationClass operationClass = new OperationClass();
        operationClass.doAction();
    }
}
```

**运行结果：**

```
OperationClass--->doAction
FunctionClass--->doAction
```

**为什么要使用动态代理？**

业务如果保持当前的规模，静态代理足够解决问题。假设极端情况，现在有一百个方法，需要加上日志添加、权限检查、异常处理的功能。当然，还可以使用静态代理，但是使用动态代理会是一个更合理的选择。

## 动态代理

```java
public class OperationHandler implements InvocationHandler {
    private FunctionClass functionClass;

    public OperationHandler(FunctionClass functionClass) {
        this.functionClass = functionClass;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("OperationHandler--->invoke");
        return method.invoke(functionClass, args);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Class clazz = FunctionClass.class;
        FunctionClass functionClass = new FunctionClass();
        OperationHandler operationInvocationHandler = new OperationHandler(functionClass);
        IFunction iFunction = (IFunction) Proxy.newProxyInstance(clazz.getClassLoader(), clazz.getInterfaces(), operationInvocationHandler);
        iFunction.doAction();
    }
}
```

**运行结果：**

```java
OperationHandler--->invoke
FunctionClass--->doAction
```

通过`Proxy.newProxyInstance`方法生成动态代理类，需要三个参数：被代理类的ClassLoader；被代理类的接口集合；实现的`InvocationHandler`对象。返回的是系统帮我们生成的动态代理类，实际上是`com.sun.proxy.$Proxy0`，该动态代理类实现了我们的接口，所以一般会强转为我们的接口来使用。

当我们调用`iFunction.fromDisk()`时，执行了`InvocationHandler`的`invoke`方法。

`InvocationHandler`的`invoke`方法也有三个参数：第一个`Object proxy`就是动态代理类，也就上文说的`com.sun.proxy.$Proxy0`；第二个`Method method`是我们调用的方法，例子中我们调用了`iFunction.fromDisk()`，那么此时`method`就是`fromDisk`方法；第三个`Object[] args`就是方法里的参数。

很多时候`invoke`方法返回的都是方法执行的结果，就如本例中：`return method.invoke(functionClass, args);`，可能有时候被代理类实现的接口方法返回值是接口自身，那么这时返回`proxy`就可以了，即`return proxy;`。

现在这个动态代理的功能是由JDK实现提供的，它有其局限性，被代理类必须实现自接口。借助CGLib库，我们可以在没有接口的情况下，实现动态代理的功能。

## CGLib动态代理

CGLib可以在运行期动态的生成字节码，扩展Java类与实现Java接口。

定义被代理类，因为不需要接口，直接写：

```java
public class CGLibReal {
    public void doAction() {
        System.out.println("CGLibReal--->doAction");
    }
}
```

借助CGLib实现动态代理类：

```java
public class CGLibInterceptor implements MethodInterceptor {
    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        System.out.println("CGLibInterceptor--->intercept");
        return methodProxy.invokeSuper(o, objects);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        CGLibInterceptor cgLibInterceptor = new CGLibInterceptor();
        CGLibReal cgLibReal = (CGLibReal) Enhancer.create(CGLibReal.class, cgLibInterceptor);
        cgLibReal.doAction();
    }
}
```

一样地，`Enhancer.create`方法替我们生成代理类，当我们调用`cgLibReal.doAction();`时，执行了`CGLibInterceptor`的`intercept`方法。

**运行结果：**

```
CGLibInterceptor--->intercept
CGLibReal--->doAction
```

> [公共技术点之 Java 动态代理](http://www.codekk.com/blogs/detail/54cfab086c4761e5001b253d)  
> [十分钟理解Java之动态代理](http://www.jianshu.com/p/cbd58642fc08)  
> [戏说代理模式和Java动态代理](http://www.jianshu.com/p/0d919e54eef0)  
> [设计模式-代理模式VS委托模式VS适配器模式](http://blog.ruaby.com/?p=126)