## 订阅流程

先看看所谓的观察者模式，是如何在RxJava中应用的。


```java
Observable.create(new ObservableOnSubscribe<Integer>() {
            @Override
            public void subscribe(ObservableEmitter<Integer> emitter) throws Exception {
                emitter.onNext(1);
                emitter.onNext(2);
                emitter.onNext(3);
                emitter.onComplete();
            }
        }).subscribe(new Observer<Integer>() {
            @Override
            public void onSubscribe(Disposable d) {
            }

            @Override
            public void onNext(Integer value) {
                // 一次输出1、2、3，对应emitter.onNext(...)
            }

            @Override
            public void onError(Throwable e) {
            }

            @Override
            public void onComplete() {
                // 最后调用到这里，对应emitter.onComplete()
            }
        });
```

这是一段Rxjava最简单的应用，我们首先抛开一些复杂的，听上去很空洞的，比如响应式、观察者模式之类的概念。

### 伪代码

单纯通过这些代码，想想如果自己去实现这个流程，内部的类是如何依赖的，方法是如何执行的。

1. **如果说emmiter的onNext()和onComplete()每次执行，对应会执行Observer的onNext()和onComplete()。那就很明显ObservableEmitter肯定持有Observer对象，理解成如下的伪代码：**

```java
class ObservableEmitter {
    Observer observer;
    
    void onNext(Integer value) {
        observer.onNext(value);
    }
    
    void onComplete() {
        observer.onComplete();
    }
}
```

*那么问题来了，首先observer的来源是哪里；第二个是emmiter要执行的话，肯定要执行ObservableOnSubscribe的subscribe()方法，那么是谁又是如何执行了subscribe()方法。*

2. **ObservableOnSubscribe.subscribe()要执行的话，只能是通过Observable.subscribe()，因为除此之外，再没有我们主动去调用的方法了。而且两个方法名也是一样的，猜测一段伪代码：**

```java
class Observable {
    ObservableOnSubscribe observableOnSubscribe;
    ObservableEmitter emitter;
    
    void create(ObservableOnSubscribe e) {
        this.observableOnSubscribe = e;
    }
    
	void subscribe(Observer r) {
        // 将Observer实例交给ObservableEmitter维护，对应1中的理解
        ObservableEmitter emitter = new ObservableEmitter(r);
        // 执行subscribe()方法，并将emitter作为方法入参
        this.observableOnSubscribe.subscribe(emitter);
    }
}
```

最简单的一个流程其实就这么多，会发现其实很简单，但是内部实际的源码会比这个复杂很多，因为要支持更多的特性，处理更多的边界问题。

不论如何，还得看源码，看看它又是如何做的。

### 实际源码

```java
## Observable
public static <T> Observable<T> create(@NonNull ObservableOnSubscribe<T> source) {
    ...
    // return RxJavaPlugins.onAssembly(new ObservableCreate<>(source)); // 简化为下面的代码👇
    // 留意source这个名字，马上会用到，记住它就是ObservableOnSubscribe对象
    return new ObservableCreate<>(source);
}

// create()方法返回了ObservableCreate对象,那么接下来执行的就是ObservableCreate的subscribe()方法
## ObservableCreate
public final void subscribe(@NonNull Observer<? super T> observer) {
	...
    subscribeActual(observer);
    ...
}

protected void subscribeActual(Observer<? super T> observer) {
    // 将observer包装为CreateEmitter
    // CreateEmitter实现自ObservableEmitter
    CreateEmitter<T> parent = new CreateEmitter<>(observer);
    // 这里是个细节，订阅观察者时候，会执行一次Observer的onSubsribe()方法
    observer.onSubscribe(parent);

    try {
        // source就是ObservableOnSubscribe对象
        source.subscribe(parent);
    } catch (Throwable ex) {
        Exceptions.throwIfFatal(ex);
        parent.onError(ex);
    }
}

// 接下来到CreateEmitter该去执行了
## CreateEmitter
CreateEmitter(Observer<? super T> observer) {
    this.observer = observer;
}

// 嵌套执行了onNext
public void onNext(T t) {
    observer.onNext(t);
}
```

## 数据处理流程

上面是为了理解RxJava中的观察者模式，那么再来理解响应式。

响应式理论上是处理数据流，这里的数据并不是通常认为的数据，它将任何操作解构成数据，一个屏幕的点击操作是数据1，长按操作是数据2，一次数据库查询的操作是数据3，一次网络请求是数据4，1、2、3、4、可以被拦截、被过滤、被重新整合排序。

对应到RxJava，它的响应式体现在Observable的流传和传递：

```java
Observable.create(new ObservableOnSubscribe<Integer>() {
            @Override
            public void subscribe(ObservableEmitter<Integer> emitter) throws Exception {
                emitter.xxx(...);
            }
}).map(new Function<Integer, Integer>() {
    @Override
    public Integer apply(Integer integer) throws Throwable {
        return ...;
    }
}).subscribe(new Observer<Object>() {...});
```

### 伪代码

分析订阅流程已经知道了，最后Observable执行subscribe方法，将Observer包装为ObservableEmitter，然后通过emitter的方法去开启整个RxJava的处理流程。

那么现在Observable是嵌套的，执行流程就是[map方法构造的Observable]的subscribe方法执行了[create方法构造的Observable]的subscribe方法。

伪代码如下：

```java
## ObservableMap
class ObservableMap {
    Function function;
    
    void subscribe(Observer r) {
        // 目前位置，observable就是最终的Observable
        observable.subscribe(new map中Observer的包装类(r));
    }
}

// 把上面的也赋值下来，免得要去翻
## Observale
class Observable {
    ObservableOnSubscribe observableOnSubscribe;
    ObservableEmitter emitter;
    
    void create(ObservableOnSubscribe e) {
        this.observableOnSubscribe = e;
    }
    
	void subscribe(Observer r) {
        // 将Observer实例交给ObservableEmitter维护，对应1中的理解
        ObservableEmitter emitter = new ObservableEmitter(r);
        // 执行subscribe()方法，并将emitter作为方法入参
        this.observableOnSubscribe.subscribe(emitter);
    }
}


```

理解下嵌套的情况，如果执行了很多次map，或者很多次其他操作符，最下面执行的操作符构造出来的Observable，嵌套了上一个操作符构造出来的Observable，subscribe方法也是从最下面的Observable开始执行，依次执行上面一个的Observable的subscribe方法。

有一个类还是个迷，就是[map中Observer的包装类]，它起码会有onNext方法，在方法内部还得去处理数据，伪代码：

```java
## map中Observer的包装类
class map中Observer的包装类 {
    Function function;
    Observer observer;
    
    void onNext(Integer value) {
        observer.onNext(function.apply(value));
    }
}

// 把上面的也赋值下来，免得要去翻
## ObservableEmitter
class ObservableEmitter {
    Observer observer;
    
    void onNext(Integer value) {
        observer.onNext(value);
    }
    
    void onComplete() {
        observer.onComplete();
    }
}
```

同样理解嵌套的情况，[create中的Observer包装类（就是ObservableEmitter）]的onNext方法中，会执行下一个[map中的Observer包装类]的onNext方法。从上到下执行，与subscribe方法执行顺序正好相反。

### 实际源码

```java
## ObservableCreate
public final <R> Observable<R> map(@NonNull Function<? super T, ? extends R> mapper) {
    ...
    // return RxJavaPlugins.onAssembly(new ObservableMap<>(this, mapper)); // 简化为下面的代码👇
    return new ObservableMap<>(this, mapper)
}

## ObservableMap
public ObservableMap(ObservableSource<T> source, Function<? super T, ? extends U> function) {
    super(source);
    this.function = function;
}
```

[map构造出的ObservableMap]嵌套了[create构造出的ObservableCreate]。从下往下嵌套Observable。

接着看subscribe方法是怎么执行的。

```java
// 接下来应该执行ObservableMap的subscribe()方法
## ObservableMap
public final void subscribe(@NonNull Observer<? super T> observer) {
	...
    subscribeActual(observer);
    ...
}

public void subscribeActual(Observer<? super U> t) {
    // source就是ObservableCreate
    // 将Observer包装为MapObserver
    source.subscribe(new MapObserver<T, U>(t, function));
}

// 把上面的也赋值下来，免得要去翻
## ObservableCreate
public final void subscribe(@NonNull Observer<? super T> observer) {
	...
    subscribeActual(observer);
    ...
}

protected void subscribeActual(Observer<? super T> observer) {
    // 将observer包装为CreateEmitter
    // CreateEmitter实现自ObservableEmitter
    CreateEmitter<T> parent = new CreateEmitter<>(observer);
    // 这里是个细节，订阅观察者时候，会执行一次Observer的onSubsribe()方法
    observer.onSubscribe(parent);

    try {
        // source就是ObservableOnSubscribe对象
        source.subscribe(parent);
    } catch (Throwable ex) {
        Exceptions.throwIfFatal(ex);
        parent.onError(ex);
    }
}
```

先执行ObservableMap的subscribe方法，再在方法内去执行ObservableCreate的subscribe方法。从下往上执行subscribe方法。

OK，再看看onNext方式是怎么执行的。

```java
// 把上面的也赋值下来，免得要去翻
## CreateEmitter
CreateEmitter(Observer<? super T> observer) {
    // 之前observer是最下游匿名的Observer,那么现在就是MapObserver
    this.observer = observer;
}

// 嵌套执行了onNext
public void onNext(T t) {
    // 现在是执行MapObserver的onNext方法
    observer.onNext(t);
}

## MapObserver
MapObserver(Observer<? super U> actual, Function<? super T, ? extends U> mapper) {
    super(actual);
    // mapper是实现的匿名方法
    this.mapper = mapper;
}

@Override
public void onNext(T t) {

    // mapper.apply(t)对t做了处理
    v = Objects.requireNonNull(mapper.apply(t), "The mapper function returned a null value.");

    // downstream就是构造方法的入参actual
    downstream.onNext(v);
}
```

先执行CreateEmitter的onNext方法，再在方法内去执行MapObserver的onNext方法。从上往下执行onNext方法。

数据流的处理的脉络就是这样的，一些比较复杂的操作符比如flatMap，下面单独去介绍。

## 线程切换

好了，到现在为止，其实RxJava整体的设计已经能够把握了，再看一块比较重要的就是线程切换是如何去做的。

线程切换有两个操作符，分别是subscribeOn方法和observeOn方法，管理数据流的上游和下游。

```java
Observable.create(new ObservableOnSubscribe<Integer>() {
            @Override
            public void subscribe(ObservableEmitter<Integer> emitter) throws Exception {
                emitter.xxx(...);
            }
}).map(new Function<Integer, Integer>() {
    @Override
    public Integer apply(Integer integer) throws Throwable {
        return ...;
    }
})
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe(new Observer<Object>() {...});
```

### subscribeOn伪代码

subscribeOn控制数据流在处理过程中所在的线程，同时只有第一次的subscribeOn操作符会生效。

subscribeOn方法肯定也构造除了一个新的Observable，现在还知道subscribe方式是从下往上执行的，简单点实现的话，切换执行subscribe方法的线程就可以了。

```java
## subscribeOn构造的Observable
class subscribeOn构造的Observable {
    Thread thread = new Thread();
    
    void subscribe(Observer r) {
        thread.run({ // 瞎比写的
            source.subscribe(new subscribeOn的Observer包装类(r));
        });
    }
}
```

这个完全就能实现想要的效果，同时可以很容易理解为什么subscribeOn操作符为什么只有第一次的可以生效。

### subscribeOn实际源码

```java
## ObservableSubscribeOn
public ObservableSubscribeOn(ObservableSource<T> source, Scheduler scheduler) {
    super(source);
    this.scheduler = scheduler;
}

public final void subscribe(@NonNull Observer<? super T> observer) {
	...
    subscribeActual(observer);
    ...
}

@Override
public void subscribeActual(final Observer<? super T> observer) {
    final SubscribeOnObserver<T> parent = new SubscribeOnObserver<>(observer);

    ...

    // scheduler.scheduleDirect(...)肯定内部维护了一个线程或者线程池，执行Runnable
    // 里面的逻辑很绕，代码就不贴了，最后肯定是会去执行Runnable的run方法
    parent.setDisposable(scheduler.scheduleDirect(new SubscribeTask(parent)));
}

// SubscribeTask就是一个Runnable，在run方法中，执行了source.subscribe(parent)方法
## SubscribeTask
final class SubscribeTask implements Runnable {
    private final SubscribeOnObserver<T> parent;

    SubscribeTask(SubscribeOnObserver<T> parent) {
        this.parent = parent;
    }

    @Override
    public void run() {
        source.subscribe(parent);
    }
}
```

### observeOn伪代码

observeOn也控制数据流在处理过程中所在的线程，但是跟subscribeOn不同的是，每次执行observeOn操作符，都会影响后续数据处理所在的线程。

既然subscribe方法被用了，那就只能去考虑onNext方法了。包装Observer的时候，就得把线程切换的类交由Observer包装类维护。

```java
## observeOn构造的Observable
class observeOn构造的Observable {
    
    void subscribe(Observer r) {
        // 将Thead（线程切换类）交由Obserber包装类维护
        source.subscribe(new observeOn的Observer包装类(new Treand(), r));
    }
}

## observeOn的Observer包装类
class observeOn的Observer包装类 {
    Observer observer;
    Thread thread;
    
    void onNext(Integer value) {
        thread.run({ // 瞎比写的
            observer.onNext(value);
        });
    }
}
```

很简单也很容易理解了，每次执行observeOn操作，是怎么影响后续的数据处理。

### observeOn实际代码

```java
## ObservableObserveOn
public ObservableObserveOn(ObservableSource<T> source, Scheduler scheduler, boolean delayError, int bufferSize) {
    super(source);
    this.scheduler = scheduler;
    this.delayError = delayError;
    this.bufferSize = bufferSize;
}

public final void subscribe(@NonNull Observer<? super T> observer) {
	...
    subscribeActual(observer);
    ...
}

@Override
protected void subscribeActual(Observer<? super T> observer) {
    // 构造出线程切换类，跟Thread没有本质区别
    Scheduler.Worker w = scheduler.createWorker();

    source.subscribe(new ObserveOnObserver<>(observer, w, delayError, bufferSize));
}

// 这个流程真的又臭又长，只放关键的代码，其他都删掉
## ObserveOnObserver
ObserveOnObserver(Observer<? super T> actual, Scheduler.Worker worker, boolean delayError, int bufferSize) {
    this.downstream = actual;
    this.worker = worker;
    this.delayError = delayError;
    this.bufferSize = bufferSize;
}

public void onNext(T t) {
    ...
    schedule();
}

// 从之类开始，执行的代码已经切换线程了，这个worker可以是Thread，也可以Handler
void schedule() {
    ...
    worker.schedule(this);
}

public void run() {
    if (outputFused) {
        drainFused(); // 只贴这一个情况
    } else {
        drainNormal();
    }
}

void drainNormal() {
    int missed = 1;

    final SimpleQueue<T> q = queue;
    final Observer<? super T> a = downstream;
    
    T v;
    v = q.poll();

    a.onNext(v);
}
```

### 线程切换小结

重新理解下subscribeOn和observeOn两个操作符的设计。

RxJava的设计中必须先有一个数据产生的源头，比如create方法，为了能够控制源头这一次的数据处理所在的线程，就是emmiter.onNext(...)，设计了subscribeOn操作符。

observeOn就是在控制执行observeOn操作符之后数据处理所在的流程。

subscribeOn和observeOn的调用关系不会对彼此产生影响，第一个数据处理只会被subscribeOn控制，也只控制到第一次执行observeOn之前。合起来就可以理解为是：

```json
subscribeOn
👇
第一个数据处理emmiter.onNext
👇
第二个数据处理xxxObserver.onNext
👇
...
👇
observeOn
👇
...
👇
observeOn
👇
```

## 综上

RxJava的设计中，subscribe和onNext（等价的就是onSubscribe、onComplete、onError）两个方法就是整个RxJava的脉络。

先执行的操作符称为流的上游，后执行的操作符称为流的下游。

Observable的subscribe方法是从下游往上游执行，Observer的onNext方法是从上游往下游执行。
