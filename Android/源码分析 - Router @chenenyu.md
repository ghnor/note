> [项目地址：Router @chenenyu](https://github.com/chenenyu/Router)

最简单的一次调用：

```java
Router.build("test").go(this);
```

就从这个调用开始看，跟着走一遍。

Router.build入口真正的调用类是RealRouter。

RealRouter.build接受两种入参，Uri（String也会被包装为Uri）和RouterRequest。

入参是Uri时，AbsRouter（RealRouter的父类）会把Uri包装为RouterRequest。同时新建Bundle，key是Router.RAW_URI，value是前面的Uri。并把bundle设置给request（setExtras）。

```java
public IRouter build(Uri uri) {
    mRouteRequest = new RouteRequest(uri);
    Bundle bundle = new Bundle();
    bundle.putString(Router.RAW_URI, uri == null ? null : uri.toString());
    mRouteRequest.setExtras(bundle);
    return this;
}
```

接着去走RealRouter中的go方法。

```java
public void go(Context context) {
    Intent intent = getIntent(context);
    if (intent != null) {
        Bundle options = mRouteRequest.getActivityOptionsBundle();
        if (context instanceof Activity) {
            ActivityCompat.startActivityForResult((Activity) context, intent,
                    mRouteRequest.getRequestCode(), options);
            if (mRouteRequest.getEnterAnim() >= 0 && mRouteRequest.getExitAnim() >= 0) {
                ((Activity) context).overridePendingTransition(
                        mRouteRequest.getEnterAnim(), mRouteRequest.getExitAnim());
            }
        } else {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            // The below api added in v4:25.1.0
            // ContextCompat.startActivity(context, intent, options);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                context.startActivity(intent, options);
            } else {
                context.startActivity(intent);
            }
        }
    }
}
```

第一行就拿到了Intent对象，之后就执行startActivity方法，此时就已经跳转到其他Activity了。

那么就看getIntent方法到底做了哪些事情。

```java
public Intent getIntent(@NonNull Object source) {
    List<RouteInterceptor> interceptors = new ArrayList<>();
    Collections.addAll(interceptors, mBaseValidator, mIntentValidator,
            mIntentProcessor, mAppInterceptorsHandler);
    RealInterceptorChain chain = new RealInterceptorChain(source, mRouteRequest, interceptors);
    RouteResponse response = chain.process();
    callback(response);
    return (Intent) response.getResult();
}
```

首先声明一个新的list实例，interceptors。

mBaseValidator、mIntentValidator、mIntentProcessor、mAppInterceptorsHandler塞到interceptors里面。

把context、routerRequest、interceptors作为入参，生成一个RealInterceptorChain类的实例化对象chain。

调用chain的process方法，返回RouteResponse。

再把RouteResponse作为入参，调用callback。

最后返回response.getResult。

先看chain的process方法：

```java
public RouteResponse process() {
    if (index >= interceptors.size()) {
        RouteResponse response = RouteResponse.assemble(RouteStatus.SUCCEED, null);
        if (targetObject != null) {
            response.setResult(targetObject);
        } else {
            response.setStatus(RouteStatus.FAILED);
        }
        return response;
    }
    RouteInterceptor interceptor = interceptors.get(index++);
    return interceptor.intercept(this);
}
```

单看这里是会觉得if判断莫名其妙，chain对象首次生成，index肯定是0，interceptors.get(0)取出来的是mBaseValidator对象。

那么继续看mBaseValidator的intercept方法：

```java
public RouteResponse intercept(Chain chain) {
    // ...

    return chain.process();
}
```

最后会递归调用chain的process方法。然后从interceptors中拿第二个interceptor，也就是mIntentValidator，去执行intercept方法。

那么上面的if判断就看懂了，经过多次递归调用之后，全部的interceptor都执行过之后，就把结果包装成Response的实例化对象返回。

当然，如果是自定义的RouteInterceptor，比如说判断用户是否已经登录，发现没登录，不让跳转Activity的话，最后返回`return chain.intercept();`就可以了。

那么这个所谓的targetObject对象从何而来呢。

看一下IntentProcessor的intercept方法：

```java
public RouteResponse intercept(Chain chain) {
    RealInterceptorChain realChain = (RealInterceptorChain) chain;
    RouteRequest request = chain.getRequest();
    List<AbsMatcher> matcherList = MatcherRegistry.getMatcher();
    List<AbsImplicitMatcher> implicitMatcherList = MatcherRegistry.getImplicitMatcher();
    Set<Map.Entry<String, Class<?>>> entries = AptHub.routeTable.entrySet();

    // ...
}
```

首先拿到matcherList和implicitMatcherList。这两个list是在MatcherRegistry初始化的时候添加进去的。

再拿到routeTable，它就是路由表，里头就是Map键值对。

每次在activity或者fragment上写了注解之后，就会由apt生成一个路由表。

```java
@Route(value = "test")
public class TestActivity extends AppCompatActivity {
    // ...
}
```

上面这样的就是`map.put("test", TestActivity.class);`，key是注解的内容，value是Activity的class对象。

接着看下一部分，如果这个路由表是空：

```java
public RouteResponse intercept(Chain chain) {
    // ...

    for (AbsImplicitMatcher implicitMatcher : implicitMatcherList) {
        if (implicitMatcher.match(chain.getContext(), request.getUri(), null, request)) {
            RLog.i(String.format("{uri=%s, matcher=%s}",
                    chain.getRequest().getUri(), implicitMatcher.getClass().getCanonicalName()));
            realChain.setTargetClass(null);
            Object result = implicitMatcher.generate(chain.getContext(), request.getUri(), null);
            if (result instanceof Intent) {
                intent = (Intent) result;
                assembleIntent(intent, request);
                realChain.setTargetObject(intent);
            } else {
                return RouteResponse.assemble(RouteStatus.FAILED, String.format(
                        "The matcher can't generate an intent for uri: %s",
                        request.getUri().toString()));
            }
            break;
        }
    }

    // ...
}
```
此时用的就是Intent的隐式跳转。

首先判断了AbsImplicitMatcher的match方法。

AbsImplicitMatcher有两个子类实现了match方法，分别是：

1. ImplicitMatcher：

```java
public boolean match(Context context, Uri uri, @Nullable String route, RouteRequest routeRequest) {
    if (uri.toString().toLowerCase().startsWith("http://")
            || uri.toString().toLowerCase().startsWith("https://")) {
        return false;
    }
    ResolveInfo resolveInfo = context.getPackageManager().resolveActivity(
            new Intent(Intent.ACTION_VIEW, uri), PackageManager.MATCH_DEFAULT_ONLY);
    if (resolveInfo != null) {
        // bundle parser
        if (uri.getQuery() != null) {
            parseParams(uri, routeRequest);
        }
        return true;
    }
    return false;
}
```

2. BrowserMatcher：

```java
public boolean match(Context context, Uri uri, @Nullable String route, RouteRequest routeRequest) {
    return (uri.toString().toLowerCase().startsWith("http://")
            || uri.toString().toLowerCase().startsWith("https://"));
}
```

只看第一个，先判断当前的Uri是否有可跳转的Activity类。

如果有，执行parseParams方法。parseParams方法的实现在AbsMatcher中。

主要是把Uri的请求参数，都写进Bundle中，同时将Bundle传给RouteRequest。

```java
protected void parseParams(Uri uri, RouteRequest routeRequest) {
    if (uri.getQuery() != null) {
        Bundle bundle = routeRequest.getExtras();
        if (bundle == null) {
            bundle = new Bundle();
            routeRequest.setExtras(bundle);
        }

        Set<String> keys = uri.getQueryParameterNames();
        Iterator<String> keyIterator = keys.iterator();
        while (keyIterator.hasNext()) {
            String key = keyIterator.next();
            List<String> values = uri.getQueryParameters(key);
            if (values.size() > 1) {
                bundle.putStringArray(key, values.toArray(new String[0]));
            } else if (values.size() == 1) {
                bundle.putString(key, values.get(0));
            }
        }
    }

}
```

match方法结束了，假设已经返回了true，继续走IntentProcessor的intercept方法。

看到`realChain.setTargetClass(null);`，上面说了，此时相当于Intent的隐式跳转，所以没有具体的class对象。

之后会执行AbsImplicitMatcher的generate方法：

实例化了Intent对象。

```java
public Object generate(Context context, Uri uri, @Nullable Class<?> target) {
    return new Intent(Intent.ACTION_VIEW, uri);
}
```

再执行assembleIntent方法，主要是把RouterRequest的各种参数赋值给Intent。

```java
private void assembleIntent(Intent intent, RouteRequest request) {
    if (request.getExtras() != null && !request.getExtras().isEmpty()) {
        intent.putExtras(request.getExtras());
    }
    if (request.getFlags() != 0) {
        intent.addFlags(request.getFlags());
    }
    if (request.getData() != null) {
        intent.setData(request.getData());
    }
    if (request.getType() != null) {
        intent.setType(request.getType());
    }
    if (request.getAction() != null) {
        intent.setAction(request.getAction());
    }
}
```

紧接着`realChain.setTargetObject(intent);`，这里chain终于拿到了TargetObject，也就是Intent对象。

那么这一次就走完了。接着会回到RealInterceptorChain执行下一次process方法，也就是下一个Interceptor的intercept方法。

上面说了一点，这一部分走的是Intent的隐式跳转，那么显式跳转呢。

继续看：

```java
for (Map.Entry<String, Class<?>> entry : entries) {
    if (matcher.match(chain.getContext(), request.getUri(), entry.getKey(), request)) {
        RLog.i(String.format("{uri=%s, matcher=%s}",
                chain.getRequest().getUri(), matcher.getClass().getCanonicalName()));
        realChain.setTargetClass(entry.getValue());
        Object result = matcher.generate(chain.getContext(), request.getUri(), entry.getValue());
        if (result instanceof Intent) {
            intent = (Intent) result;
            assembleIntent(intent, request);
            realChain.setTargetObject(intent);
        } else {
            return RouteResponse.assemble(RouteStatus.FAILED, String.format(
                    "The matcher can't generate an intent for uri: %s",
                    request.getUri().toString()));
        }
        break MATCHER;
    }
}
```

匹配显式Intent的Matcher也有两个：

1. SchemeMatcher

```java
public boolean match(Context context, Uri uri, @Nullable String route, RouteRequest routeRequest) {
    if (isEmpty(route)) {
        return false;
    }
    Uri routeUri = Uri.parse(route);
    if (uri.isAbsolute() && routeUri.isAbsolute()) { // scheme != null
        if (!uri.getScheme().equals(routeUri.getScheme())) {
            // http != https
            return false;
        }
        if (isEmpty(uri.getAuthority()) && isEmpty(routeUri.getAuthority())) {
            // host1 == host2 == empty
            return true;
        }
        // google.com == google.com:443 (include port)
        if (!isEmpty(uri.getAuthority()) && !isEmpty(routeUri.getAuthority())
                && uri.getAuthority().equals(routeUri.getAuthority())) {
            if (!cutSlash(uri.getPath()).equals(cutSlash(routeUri.getPath()))) {
                return false;
            }

            // bundle parser
            if (uri.getQuery() != null) {
                parseParams(uri, routeRequest);
            }
            return true;
        }
    }
    return false;
}
```

2. DirectMatcher

```java
public boolean match(Context context, Uri uri, @Nullable String route, RouteRequest routeRequest) {
    return !isEmpty(route) && uri.toString().equals(route);
}
```

跟之前隐式Intent的Matcher功能大致相同，只是匹配的规则不同。

匹配到之后的方法也基本一样，此时跳转就有了具体的Class对象。

把Class对象（比如：MyTestActivity.class）丢给Chain（即：`realChain.setTargetClass(entry.getValue());`）。

RouterRequest的内容分别赋给Intent，再把Intent丢给Chain（即：`realChain.setTargetObject(intent);`）。

这次调用的流程的就到此结束了。

## Matcher以及它的子类方法主要作用

1. match方法：尝试匹配目标Activity或者Fragment。

2. parseParams方法：Uri里的参数包装成Bundle，通过RouteRequest的setExtras方法丢给RouteRequest；

3. generate方法：生成Intent实例或者Fragment实例。此时已经知道要跳转哪个Activity或者Fragment，但是还不知道要传递哪些参数。

## RouteInterceptor介绍

在RealInterceptorChain的process方法，会递归调用RouteInterceptor的intercept方法。

上面只介绍了IntentProcessor，其他还有三个。

分别是：

1. BaseValidator：判断Context对象的合法性，是不是Context、Activity、Fragment等。因为getIntent方法会暴露给外界，所以无法保证入参的类型。

2. IntentValidator：判断Matcher的列表是否为空。

3. IntentProcessor：生成需要的Intent。上面Matcher的方法主要在这里执行，生成了Intent实例之后，会从RouteRequest中拿Bundle，赋给Intent。同时把这个Intent实例丢给Chain。Chain之后会把这个Intent包装成RouteReponse。RealRouter又从RouteResponse里拿Intent，然后才真正跳到目标Activity。

4. AppInterceptorsHandler：主要是对自定义添加的RouteInterceptor做处理，包括以注解形式添加和Router的addInterceptors方法添加。

到目前为止说的都是getIntent，也就跳Acvitity的时候。

还有一种是getFragment，拿到Fragment实例对象。流程一样，RouteInterceptor如下：

1. BaseValidator：同上。

2. FragmentValidator：这里判断显示匹配的Matcher列表是否为空。

3. FragmentProcessor：跟上面IntentProcessor有点类似，但这里生成的是Fragment实例。也会从RouteRequest中拿Bundle，赋给Fragment。再把Fragment实例丢给Chain，由Chain包装为RouteResponse。RealRouter的getFragment方法就是直接从RouteResponse中取出这个Fragment而已。

4. AppInterceptorsHandler：同上。

## 最后

有个地方挺重要的，但是没说，就是写了注解之后是怎么保存成一张路由表的。

这其实是apt的内容，很多框架都会用到，ButterKnife、EventBus等等，不是Router的重点内容。
