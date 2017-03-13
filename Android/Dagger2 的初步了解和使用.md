# Dagger2？

Dagger 是 Java 平台的依赖注入库。在 J2EE 开发上流行甚广的 Spring 就是一个依赖注入库。此外还有 Google 的 Guice 和 Square 的 Dagger1。但它们都是是通过在运行时读取注解来实现依赖注入的，依赖的生成和注入需要依靠 Java 的反射机制，这对于对性能非常敏感的 Android 来说是一个硬伤。

Dagger 同样使用注解来实现依赖注入，但它利用 APT(Annotation Process Tool) 在编译时生成辅助类，这些类继承特定父类或实现特定接口，程序在运行时 Dagger 加载这些辅助类，调用相应接口完成依赖生成和注入。Dagger 对于程序的性能影响非常小，因此更加适用于 Android 应用的开发。

# 开始之前

在了解 Dagger2 之前，请务必先通晓两个概念：  
1. [依赖注入（Dependency Injection : DI）](http://a.codekk.com/detail/Android/%E6%89%94%E7%89%A9%E7%BA%BF/%E5%85%AC%E5%85%B1%E6%8A%80%E6%9C%AF%E7%82%B9%E4%B9%8B%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5)：面向对象编程的一种模式，最大的作用是解耦。  
2. [Java 注解（Annotation）](http://a.codekk.com/detail/Android/Trinea/%E5%85%AC%E5%85%B1%E6%8A%80%E6%9C%AF%E7%82%B9%E4%B9%8B%20Java%20%E6%B3%A8%E8%A7%A3%20Annotation)：了解到哪些是 Java 原生支持的注解。  

# Dagger2 带给我们的注解

下文尝试尽量抛开特定的场景（比如 MVP 模式），以更具有普适性的代码，从骨架开始，慢慢去丰满血肉，更全面的去理解这里这些注解的使用。

### @Inject

假设 MainActivity 依赖一个 Tester 的类，代码应该如下：

```java
public class Tester {
    @Inject
    public Tester() {
    }
}
```

```java
public class MainActivity extends Activity {
    @Inject 
    Tester tester;
}
```

**@Inject 有两个作用：**  
1. 标记 Tester 的构造方法，通知 Dagger2 在需要该类实例时可以通过该构造函数 new 出相关实例从而提供依赖。提供依赖的方式还有 @Provide ，下面细说。  
2. 标记 MainActivity 的 Tester 变量，通知 Dagger2 该变量实例需要由它来提供，也就是上述的需要 Dagger2 去 new 出 Tester 的实例 tester 。  

我们另外还需要一个中间件去连接**依赖提供方**和**依赖使用方**，这就是 @Component ，详细的内容在下面介绍，先看下这个例子中的 TestComponent：

```java
@Component
public interface TestComponent {
    void inject(CActivity cActivity);
}
```

在 MainActivity 的 onCreate() 加入：

```java
@Override
protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    ...
    DaggerTestComponent.builder().build().inject(this);
    ...
}
```

DaggerTestComponent 是 Dagger2 帮我们生成的类，命名规则就是在我们定义的接口名称前加上Dagger，实现了我们之前定义的 TestComponent 接口。执行完这一行代码，tester 就已经不是 null 了。

### @Provides

@Inject 标记构造方法来生成依赖对象的方式有它的局限性，如：  
1. 接口（Interface），没有构造方法，自然无处标记。  
2. 第三方库提供的类，不适合去直接修改源码，标记构造方法。  

对于上述的问题，就需要 @Provide 来提供依赖：

```java
@Module
public class TestModule {
    @Provides
    Tester provideTester() {
        return new Tester();
    }
}
```

**需要注意的是：**  
1. @Provides 只能用于标记非构造方法，并且该方法必须在 @Moudle 内部。  
2. @Provides 修饰的方法的方法名建议以 provide 开头。  

```java
@Component(modules = TestModule.class)
public interface TestComponent {
    void inject(CActivity cActivity);
}
```

这里跟之前使用 @Inject 提供依赖时的 Component 不同，标识了提供依赖的 TestModule。 

```java
public class MainActivity extends Activity {
    @Inject 
    Tester tester;
    
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        DaggerTestComponent.builder().testModule(new TestModule()).build().inject(this);
    }
}
```

DaggerTestComponent 也同样多了 testModule() 方法，参数就是我们自己定义的 TestModule。

### @Module

@Module 一般用来标记类，该注解告知 Dagger2 可以到该类中寻找需要的依赖。上述的 @Provides 则标记提供依赖实例的方法。两者都是一起使用的。  

### @Component

Component一般用来标注接口，如上文所说，作用在于作为**依赖提供方**和**依赖使用方**沟通的桥梁。

更重要的一点在于：Component 可以组合不同的 Module 和 Component。

```java
@Component(dependencies = ApplicationComponent.class, modules = ActivityModule.class)
public interface ActivityComponent {}
```

多个 Module 和 Component 的情况：

```java
@Component(
dependencies = {Component1.class,Component2.class,...}, 
modules = {Module1.class,Module1.class,...})
public interface ActivityComponent {}
```

**敲黑板，划重点：**

* Component 和它依赖的其他 Component 的 @Scope 作用域（@Scope下文会详细介绍）不能相同。

* 如果在依赖使用方需要依赖的对象并不是由当前直接的 Component 的 Module 提供的，而是由其所依赖的其他 Component 的 Module 提供的。那么就在被依赖的 Component 中就需要提供一个返回值为这个被依赖的 Compnent 的 Module 提供的依赖对象的方法，方法名可以随意。（贼™绕，血崩！）  

举个栗子：  

这里有一个 AModule 和 AComponent：

```java
@Module
public class AModule {
    @Provides
    Tester provideTester() {
        return new Tester();
    }
}
```
```java
@Component(modules = AModule.class)
public interface AComponent {}
```

还有一个依赖于 AComponent 的 BComponent：

```java
@Component(dependencies = AComponent.class)
public interface BComponent {
    void inject(MainActivity mainActivity);
}
```

在 MainActivity 中就依赖 Tester 对象：

```java
public class MainActivity extends Activity {
    @Inject 
    Tester tester;
}
```
这么写的话，编译器就不干了...我们需要在被依赖的 ACompnent 中添加返回值为 Tester 的方法，如下：

```java
@Component(modules = AModule.class)
public interface AComponent {
    Tester getTester();
}
```

栗子举完了，但是这里我仍有个疑惑，为何这里这么不智能？需要显示去提供依赖？明明 @Subcomponent （下文详述）就可以很智能的去父 Component 中查找缺失的依赖...

### @Subcomponent

@Subcomponent 其功能效果类似 component 的 dependencies。但是使用 @Subcomponent 不需要在父 component 中显式添加子 component 需要用到的对象，只需要添加返回子 Component 的方法即可，子 Component 能自动在父 Component 中查找缺失的依赖。

```
// 父Component
@PerApp
@Component(modules = AppModule.class)
public AppComponent{
    ActivityComponent getActivityComponent();  // 1.只需要在父Component添加返回子Component的方法即可
}

// 子Component
@PerAcitivity   // 2.注意子 Component 的 Scope 范围小于父 Component 
@Subcomponent(modules = ActivityModule.class)   // 3.使用 @Subcomponent 注解
public ActivityComponent{
    void inject(MainActivity activity); 
}

public class App extends Application {

    AppComponent mAppComponent;
    
    @Inject
    ToastUtil toastUtil;
    
    @Override
    public void onCreate() {
        super.onCreate();

        mAppComponent = DaggerAppComponent.builder().appModule(new AppModule(this)).build();
    }

    public AppComponent getAppComponent(){
        return mAppComponent;
    }
}

public class SomeActivity extends Activity{
    public void onCreate(Bundle savedInstanceState){
        ...
        App.getAppComponent().getActivityComponent().inject(this);//4.调用getActivityComponent方法创建出子Component
    }    
}
```

@Subcomponent 和 Component 在使用最大的差异就在于：  
当我们使用的 @Subcomponent，父 Component 可以完全不暴露自己，而只把子 Component 传递给其使用者。

### @Qualifier

> 这段内容引自：[Dagger 源码解析](http://a.codekk.com/detail/Android/%E6%89%94%E7%89%A9%E7%BA%BF/Dagger%20%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90)

如果有两类程序员，他们的能力值 power 分别是 5 和 1000，应该怎样让 Dagger 对他们做出区分呢？使用 @Qualifier 注解即可。

(1). 创建一个 @Qualifier 注解，用于区分两类程序员：

```java
@Qualifier
@Documented
@Retention(RUNTIME)
public @interface Level {
  String value() default "";
}
```

(2). 为这两类程序员分别设置 @Provides 函数，并使用 @Qualifier 注解对他们做出不同的标记：

```java
@Provides @Level("low") Coder provideLowLevelCoder() {
    Coder coder = new Coder();
    coder.setName("战五渣");
    coder.setPower(5);
    return coder;
}

@Provides @Level("high") Coder provideHighLevelCoder() {
    Coder coder = new Coder();
    coder.setName("大神");
    coder.setPower(1000);
    return coder;
}
```

(3). 在声明 @Inject 对象的时候，加上对应的 @Qualifier 注解：

```java
@Inject @Level("low") Coder lowLevelCoder;
@Inject @Level("high") Coder highLevelCoder;
```

此外，还有一个默认实现的注解 @Named，使用方法同上，源码如下：
```java
@Qualifier
@Documented
@Retention(RUNTIME)
public @interface Named {

    /** The name. */
    String value() default "";
}
```


### @Scope

Dagger2 可以通过 @Scope 自定义注解限定注解作用域。  
我们直接看 Dagger2 自带的，通过 @Scope 实现的 @Singleton 注解，源码如下：
```java
@Scope
@Documented
@Retention(RUNTIME)
public @interface Singleton{}
```

用法如下：

```java
@Singleton // @Inject 提供对象的单例模式
public class Tester {
    @Inject
    public Tester() {}
}
```

```java
@Provides
@Singleton // @Provides 提供对象的单例模式
Tester provideTester() {
    return new Tester();
}
```

```java
@Singleton // 标明该 Component 中有 Module 使用了 @Singleton
@Component(modules = TestModule.class)
public interface ActivityComponent {
    void inject();
}
```

如果要使用我们自己的注解，比如在 MVP 中非常常见的 @PreActivity，将上面的 @Singleton 替换成 @PreActivity 即可，使用上无区别：

```java
@Scope
@Documented
@Retention(RetentionPolicy.RUNTIME)
public @interface PreActivity {}
```

#### 如何理解 @Scope

> [参看：Android：dagger2让你爱不释手-重点概念讲解、融合篇](http://www.jianshu.com/p/1d42d2e6f4a5)

这里我们使用一个最简单的 @Singleton 注解提供一个 AppComponent。编译后，Dagger2 自动帮我们生成如下代码：
```java
@Generated("dagger.internal.codegen.ComponentProcessor")
public final class DaggerAppComponent implements AppComponent {
  private Provider<Context> provideContextProvider;
  private MembersInjector<App> appMembersInjector;

  private DaggerAppComponent(Builder builder) {  
    assert builder != null; // 判断了只有第一次实例化这个Component时才会去执行下面的代码
    initialize(builder);
  }

  public static Builder builder() {  
    return new Builder();
  }

  private void initialize(final Builder builder) {  
    this.provideContextProvider = ScopedProvider.create(AppModule_ProvideContextFactory.create(builder.appModule));
    this.appMembersInjector = App_MembersInjector.create((MembersInjector) MembersInjectors.noOp(), provideToastUtilProvider);
  }

  @Override
  public Context context() {  
    return provideContextProvider.get();
  }

  @Override
  public void inject(App app) {  
    appMembersInjector.injectMembers(app);
  }

  public static final class Builder {
    private AppModule appModule;
  
    private Builder() {  
    }
  
    public AppComponent build() {  
      if (appModule == null) {
        throw new IllegalStateException("appModule must be set");
      }
      return new DaggerAppComponent(this);
    }
  
    public Builder appModule(AppModule appModule) {  
      if (appModule == null) {
        throw new NullPointerException("appModule");
      }
      this.appModule = appModule;
      return this;
    }
  }
}
```
传递进来的 appModule 首先交由 AppModule_ProvideContextFactory：
```java
@Generated("dagger.internal.codegen.ComponentProcessor")
public final class AppModule_ProvideContextFactory implements Factory<Context> {
  private final AppModule module;

  public AppModule_ProvideContextFactory(AppModule module) {  
    assert module != null;
    this.module = module;
  }

  @Override
  public Context get() {  
    Context provided = module.provideContext(); // 这就是我们在 AppModule 中定义的方法，去提供 Context 对象的实例。
    if (provided == null) {
      throw new NullPointerException("Cannot return null from a non-@Nullable @Provides method");
    }
    return provided;
  }

  public static Factory<Context> create(AppModule module) {  
    return new AppModule_ProvideContextFactory(module);
  }
}
```
这个类的功能其实就是维护了 Context 对象，其他类在想使用时就可以从这里拿。  
继续看之前，AppModule_ProvideContextFactory 通过工厂模式创建了自己的实例后就把自己传递给了 ScopedProvider：
```java
public final class ScopedProvider<T> implements Provider<T> {
  private static final Object UNINITIALIZED = new Object();

  private final Factory<T> factory;
  private volatile Object instance = UNINITIALIZED;

  private ScopedProvider(Factory<T> factory) {
    assert factory != null;
    this.factory = factory;
  }

  @SuppressWarnings("unchecked") // cast only happens when result comes from the factory
  @Override
  public T get() {
    // double-check idiom from EJ2: Item 71
    Object result = instance;
    if (result == UNINITIALIZED) {
      synchronized (this) {
        result = instance;
        if (result == UNINITIALIZED) {
          instance = result = factory.get();
        }
      }
    }
    return (T) result;
  }

  /** Returns a new scoped provider for the given factory. */
  public static <T> Provider<T> create(Factory<T> factory) {
    if (factory == null) {
      throw new NullPointerException();
    }
    return new ScopedProvider<T>(factory);
  }
}
```
对之前的 Context 对象，做一次双重校验锁，目的是为了实现对象的线程安全。
在用到 Context 对象的地方，都是类似于 DaggerAppComponent 中的 provideContextProvider.get() 方法去获取实例。

总结来说，@Scope本身并不控制对象的生命周期，其生命周期其实还是看生成的 Component 对象的生命周期。

# 后话

其实知晓 Dagger2 注解的使用，大致了解 Dagger2 的原理其实并不是难点或者说重点。  
在实际工程中如何灵活去使用它，如何根据业务的需要切分 Module 和 Component 才是我们在之后需要时间不断去打磨。