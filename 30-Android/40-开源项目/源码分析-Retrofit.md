retrofit版本：2.6.1

```java
# ① 定义接口
public interface ServerApi {
  	@GET("getInfo.json")
		Call<Response> getInfo();
}

# ②
Retrofit retrofit = new Retrofit.Builder()
        .baseUrl("baseUrl")
        .build();

# ③
ServerApi serverApi = retrofit.creat(ServerApi.class);

# ④ 发起请求
serverApi.getInfo().execute();
```

## 流程分析

从③开始跟，先看源码：

```java
# Retrofit
public <T> T create(final Class<T> service) {
    // ...
    return (T) Proxy.newProxyInstance(service.getClassLoader(), new Class<?>[] { service },
            new InvocationHandler() {
                // ...
                private final Object[] emptyArgs = new Object[0];

                @Override 
              	public @Nullable Object invoke(Object proxy, Method method, 
                                               @Nullable Object[] args) throws Throwable {
                    // ...
                    return 
                      loadServiceMethod(method).invoke(args != null ? args : emptyArgs);
                }
            });
}
```

利用动态代理，不知道动态代理没关系，只需要知道④当代码去执行`serverApi.getInfo()`的时候，实际上是执行了`invoke(Object proxy, Method method, @Nullable Object[] args)`方法，也就是：

```java
# Retrofit
return loadServiceMethod(method).invoke(args != null ? args : emptyArgs);
```

跟进`loadServiceMethod(method)`方法：

```java
# Retrofit
ServiceMethod<?> loadServiceMethod(Method method) {
    ServiceMethod<?> result = serviceMethodCache.get(method);
    if (result != null) return result;

    synchronized (serviceMethodCache) {
        result = serviceMethodCache.get(method);
        if (result == null) {
            result = ServiceMethod.parseAnnotations(this, method);
            serviceMethodCache.put(method, result);
        }
    }
    return result;
}
```

提供ServiceMethod实例的缓存，继续跟进`ServiceMethod.parseAnnotations(this, method);`，类的代码很少，直接看整个类：

```java
# ServiceMethod
abstract class ServiceMethod<T> {
  static <T> ServiceMethod<T> parseAnnotations(Retrofit retrofit, Method method) {
    RequestFactory requestFactory = RequestFactory.parseAnnotations(retrofit, method);

    // ...

    return HttpServiceMethod.parseAnnotations(retrofit, method, requestFactory);
  }

  // 注意：这里有个抽象方法invoke
  abstract @Nullable T invoke(Object[] args);
}
```

先看`RequestFactory.parseAnnotations(retrofit, method);`方法，里面去解析了定义接口时添加的各种注解。主要是分析组成请求头的注解内容，比如请求的url、contentType和是否formEncoded或者multipart等。

再看`HttpServiceMethod.parseAnnotations(retrofit, method, requestFactory);`方法：

```java
# HttpServiceMethod 继承自 ServiceMethod
static <ResponseT, ReturnT> HttpServiceMethod<ResponseT, ReturnT> parseAnnotations(
        Retrofit retrofit, Method method, RequestFactory requestFactory) {
  	// ...

    Annotation[] annotations = method.getAnnotations();
    Type adapterType;
    if (isKotlinSuspendFunction) {
        // 如果是kotlin协程，这部分先跳过
    } else {
        adapterType = method.getGenericReturnType();
    }

    CallAdapter<ResponseT, ReturnT> callAdapter =
            createCallAdapter(retrofit, method, adapterType, annotations);
    Type responseType = callAdapter.responseType();
    // ...

    Converter<ResponseBody, ResponseT> responseConverter =
            createResponseConverter(retrofit, method, responseType);

    okhttp3.Call.Factory callFactory = retrofit.callFactory;
    if (!isKotlinSuspendFunction) {
      	// 如果不是kotlin协程，也就是普通的java方法
        return new HttpServiceMethod.CallAdapted<>(requestFactory, callFactory, responseConverter, callAdapter);
    }
  	// else if ...
}
```

主要做两件事：一是创建需要的CallAdapter和ResponseConverter，二是校验adapterType、responseType内容的合法性。

CallAdapter和ResponseConverter留待后面再讲，先看最后一句，`return new HttpServiceMethod.CallAdapted<>(requestFactory, callFactory, responseConverter, callAdapter);`：

```java
# CallAdapted 继承自 HttpServiceMethod
static final class CallAdapted<ResponseT, ReturnT> extends HttpServiceMethod<ResponseT, ReturnT> {
    private final CallAdapter<ResponseT, ReturnT> callAdapter;

    CallAdapted(RequestFactory requestFactory, okhttp3.Call.Factory callFactory,
                Converter<ResponseBody, ResponseT> responseConverter,
                CallAdapter<ResponseT, ReturnT> callAdapter) {
        super(requestFactory, callFactory, responseConverter);
        this.callAdapter = callAdapter;
    }

    @Override protected ReturnT adapt(Call<ResponseT> call, Object[] args) {
        return callAdapter.adapt(call);
    }
}
```

其实啥也没干，支持包装了一下前面产生的requestFactory，callFactory，responseConverter和callAdapter实例。

所以`loadServiceMethod(method)`执行完了，最后得到的是一个`CallAdapted`实例，接着便执行`CallAdapted`的`invoke()`方法。

其继承关系是，`CallAdapted`继承自`HttpServiceMethod`，`HttpServiceMethod`继承自`ServiceMethod`。

`invoke()`方法定义在`ServiceMethod`中，实现在`HttpServiceMethod`中，看一下具体的实现：

```java
# HttpServiceMethod
@Override final @Nullable ReturnT invoke(Object[] args) {
    Call<ResponseT> call = new OkHttpCall<>(requestFactory, args, callFactory, responseConverter);
    return adapt(call, args);
}
```

实例化了一个OkHttpCall，抽象地认识OkHttpCall就是一个网络请求的真正执行类。

紧接着执行自己的`adapt(call, args);`方法，``adapt()`方法的最终实现就在`CallAdapted`，代码copy一下：

```java
# CallAdapted
@Override protected ReturnT adapt(Call<ResponseT> call, Object[] args) {
    return callAdapter.adapt(call);
}
```

`callAdapter`是可以由我们去自定义的，我们先不去管，直接看Retrofit提供的默认实现：

```java
# DefaultCallAdapterFactory
@Override
public Call<Object> adapt(Call<Object> call) {
    return executor == null
            ? call
            : ExecutorCallbackCall<>(executor, call);
}
```

`ExecutorCallbackCall`和`OkHttpCall`都是装饰的设计模式。`ExecutorCallbackCall`装饰`OkHttpCall`，而`OkHttpCall`装饰的是真正是的`okttp3.Call`。

在设计上，这里分了两层，一层是`OkHttpCall`用以去执行真正的http请求，第二层`ExecutorCallbackCall`提供Android中UI线程的回调。

回到开篇代码的第④段：

```java
# ④ 发起请求
serverApi.getInfo().execute();
```

其实是去执行了`OkHtppCall`中的`execute()`方法：

```java
# OkHtppCall
@Override public Response<T> execute() throws IOException {
    
    return parseResponse(call.execute());
}
```

这个`call`是`okHttp3.Call`的实例。接着看`parseResponse()`方法：

```java
# OkHtppCall
Response<T> parseResponse(okhttp3.Response rawResponse) throws IOException {
    ResponseBody rawBody = rawResponse.body();
		// ...
  
    int code = rawResponse.code();
    if (code < 200 || code >= 300) {
        try {
            // Buffer the entire body to avoid future I/O.
            ResponseBody bufferedBody = Utils.buffer(rawBody);
            return Response.error(bufferedBody, rawResponse);
        } finally {
            rawBody.close();
        }
    }

    if (code == 204 || code == 205) {
        rawBody.close();
        return Response.success(null, rawResponse);
    }

    OkHttpCall.ExceptionCatchingResponseBody catchingBody = new OkHttpCall.ExceptionCatchingResponseBody(rawBody);
    try {
        T body = responseConverter.convert(catchingBody);
        return Response.success(body, rawResponse);
    } catch (RuntimeException e) {
        // If the underlying source threw an exception, propagate that rather than indicating it was
        // a runtime exception.
        catchingBody.throwIfCaught();
        throw e;
    }
}
```

对http不同响应码做处理，注意一下最后一个`try {}`代码块的内容，`responseConverter`到此时才发挥它的作用。

## CallAdapter和Converter

感性地认识一下这两个类，CallAdapter负责包装请求，每次的网路请求实质上由Okhttp3.Call来完成的，但是在上一部分的分析中，提到过Retrofit提供的默认CallAdapter实现了UI线程的封装。CallAdapter支持自定义，最常见的就是对RxJava的支持。

Converter则是对请求数据和响应数据进行二次加工。

还是进代码去深入了解，首先看CallAdapter和Converter是哪里来的。跟到`Retrofit.Builder.build()`：

```java
public Retrofit build() {
    // ...

    // Make a defensive copy of the adapters and add the default Call adapter.
    List<CallAdapter.Factory> callAdapterFactories = new ArrayList<>(this.callAdapterFactories);
    callAdapterFactories.addAll(platform.defaultCallAdapterFactories(callbackExecutor));

    // Make a defensive copy of the converters.
    List<Converter.Factory> converterFactories = new ArrayList<>(
            1 + this.converterFactories.size() + platform.defaultConverterFactoriesSize());

    // Add the built-in converter factory first. This prevents overriding its behavior but also
    // ensures correct behavior when using converters that consume all types.
    converterFactories.add(new BuiltInConverters());
    converterFactories.addAll(this.converterFactories);
    converterFactories.addAll(platform.defaultConverterFactories());

    return new Retrofit(callFactory, baseUrl, unmodifiableList(converterFactories),
            unmodifiableList(callAdapterFactories), callbackExecutor, validateEagerly);
}
```

callAdapterFactories按照顺序保存了自定义的callAdapter和默认的defaultCallAdapter。

converterFactories按照顺序保存了BuiltInConverters、自定义的converter和默认的defaultConverter。

这个顺序很重要，因为在一次请求的处理过程中，只有一个CallAdapter和Converter会起作用。

回到HttpServiceMethod.parseAnnotations()方法，其中通过createCallAdapter()和createResponseConverter()得到真正的CallAdapter和Converter。

接着方法执行链路会流转到`Retrofi.callAdapter() --> Retrofi.nextCallAdapter()`和`Retrofit.responseBodyConverter() --> Retrofit.nextResponseBodyConverter()`。

```java
# Retrofit
public CallAdapter<?, ?> nextCallAdapter(@Nullable CallAdapter.Factory skipPast, Type returnType, Annotation[] annotations) {
    // ...

    int start = callAdapterFactories.indexOf(skipPast) + 1;
    for (int i = start, count = callAdapterFactories.size(); i < count; i++) {
        CallAdapter<?, ?> adapter = callAdapterFactories.get(i).get(returnType, annotations, this);
        if (adapter != null) {
            return adapter;
        }
    }

    // ...
}
```

```java
# Retrofit
public <T> Converter<ResponseBody, T> nextResponseBodyConverter(@Nullable Converter.Factory skipPast, Type type, Annotation[] annotations) {
    // ...

    int start = converterFactories.indexOf(skipPast) + 1;
    for (int i = start, count = converterFactories.size(); i < count; i++) {
        Converter<ResponseBody, ?> converter =
                converterFactories.get(i).responseBodyConverter(type, annotations, this);
        if (converter != null) {
            //noinspection unchecked
            return (Converter<ResponseBody, T>) converter;
        }
    }

    // ...
}
```

逻辑上差不多，都是遍历各自的集合callAdapterFactories和converterFactories，当找到符合条件之后就返回callAdapter和converter。

那么问题来了，怎么判断是否符合条件呢？

先来看CallAdapter和Converter是如何抽象的：

```java
public interface CallAdapter<R, T> {

  Type responseType();

  T adapt(Call<R> call);

  abstract class Factory {

    public abstract @Nullable CallAdapter<?, ?> get(Type returnType, Annotation[] annotations, Retrofit retrofit);

    // ...
  }
}
```

```java
public interface Converter<F, T> {
  @Nullable T convert(F value) throws IOException;

  abstract class Factory {
    
    public @Nullable Converter<ResponseBody, ?> responseBodyConverter(Type type, Annotation[] annotations, Retrofit retrofit) {
      return null;
    }

    public @Nullable Converter<?, RequestBody> requestBodyConverter(Type type, Annotation[] parameterAnnotations, Annotation[] methodAnnotations, Retrofit retrofit) {
      return null;
    }

    public @Nullable Converter<?, String> stringConverter(Type type, Annotation[] annotations,
        Retrofit retrofit) {
      return null;
    }

    // ...
  }
}
```

扫一眼，知道有这么些个方法：

* `CallAdapter`
  * `responseType()`
  * `adapt()`

* `CallAdapter.Factory`
  * `get()`

* `Converter`
  * `convert()`
* `Converter.Factory`
  * `responseBodyConverter()`
  * `requestBodyConverter()`
  * `stringConverter()`

跟进`CallAdapter<?, ?> adapter = callAdapterFactories.get(i).get(returnType, annotations, this);`，还是看默认的`DefaultCallAdapterFactory`，注意这个入参名字叫`returnType`。

```java
@Override public @Nullable CallAdapter<?, ?> get(
        Type returnType, Annotation[] annotations, Retrofit retrofit) {
    if (getRawType(returnType) != Call.class) {
        return null;
    }
    if (!(returnType instanceof ParameterizedType)) {
        throw new IllegalArgumentException(
                "Call return type must be parameterized as Call<Foo> or Call<? extends Foo>");
    }
    final Type responseType = Utils.getParameterUpperBound(0, (ParameterizedType) returnType);

    final Executor executor = Utils.isAnnotationPresent(annotations, SkipCallbackExecutor.class)
            ? null
            : callbackExecutor;

    return new CallAdapter<Object, Call<?>>() {
        @Override public Type responseType() {
            return responseType;
        }

        @Override public Call<Object> adapt(Call<Object> call) {
            return executor == null
                    ? call
                    : new DefaultCallAdapterFactory.ExecutorCallbackCall<>(executor, call);
        }
    };
}
```

`getRawType()`返回的是`Type`的原始类型。
比如接口的定义是：`Call<Response> getInfo();`。
那么整个`returnType`是`Call<Response>`，而`getRawType`得到的是`Call.class`。

又有一个`responseType`获取的是泛型的子一级的类型，也就是`Response.class`。

`responseType`由`CallAdapter.responseType()`方法返回，也是`Converter<ResponseBody, ?> converter = converterFactories.get(i).responseBodyConverter(type, annotations, this);`方法的`type`入参。

看一下默认的实现类是怎么去使用这个入参的：

```java
@Override public @Nullable Converter<ResponseBody, ?> responseBodyConverter(
        Type type, Annotation[] annotations, Retrofit retrofit) {
    if (type == ResponseBody.class) {
        return Utils.isAnnotationPresent(annotations, Streaming.class)
                ? BuiltInConverters.StreamingResponseBodyConverter.INSTANCE
                : BuiltInConverters.BufferingResponseBodyConverter.INSTANCE;
    }
    if (type == Void.class) {
        return BuiltInConverters.VoidResponseBodyConverter.INSTANCE;
    }
    if (checkForKotlinUnit) {
        try {
            if (type == Unit.class) {
                return BuiltInConverters.UnitResponseBodyConverter.INSTANCE;
            }
        } catch (NoClassDefFoundError ignored) {
            checkForKotlinUnit = false;
        }
    }
    return null;
}
```

很简单，就是去判断这个`Type`各种可能的类型，然后返回对应的`Converter`。