Jockey是一套web和native的通信框架。

Jockey作为基底实现了一套基本的协议规范，同时负责拦截匹配的URL;  
向上将原生的webview抽象为tower，实现了web和native的连接,定义了一系列的bridge接口;  
再向上实现一系列具体的bridge，实现了具体的功能，比如控制原生状态栏的显示、控制原生标题栏的显示等等。

![](https://shanghai-1252949174.cos.ap-shanghai.myqcloud.com/20200502183937x62r2w.svg)

## 一、核心

整个框架最重要的核心就是web如何主动跟native通信，native又如何主动跟web通信。

### 1.1、从WEB指向NATIVE

先看web主动发起，再由native回调给web的流程。

#### 1.1.1、web主动向native发送消息

通过拦截shouldOverrideUrlLoading()方法实现：

```java
# JockeyWebViewClient
  
@Override
public boolean shouldOverrideUrlLoading(WebView view, String url) {

    if (delegate() != null
            && delegate().shouldOverrideUrlLoading(view, url))
        return true;

    try {
        if (isJockeyScheme(url)) {
            processUri(view, new URI(url));
            return true;
        }
    } catch (URISyntaxException e) {
        e.printStackTrace();
        Log.e("Jockey", "The URI error!");
    } catch (HostValidationException e) {
        e.printStackTrace();
        Log.e("Jockey", "The source of the event could not be validated!");
    }
    return false;
}

public void processUri(WebView view, URI uri) throws HostValidationException {
  String[] parts = uri.getPath().replaceAll("^\\/", "").split("/");
  String host = uri.getHost();

  JockeyWebViewPayload payload = checkPayload( _gson.fromJson(
    uri.getQuery(),JockeyWebViewPayload.class));

  if (parts.length > 0) {
    if (host.equals("event")) {
      getImplementation().triggerEventFromWebView(view, payload);
    } else if (host.equals("callback")) {
      getImplementation().triggerCallbackForMessage(
        Integer.parseInt(parts[0]), payload.payload);
    }
  }
}
```

JockeyWebViewPayload是Uri携带的参数的包装类，判断Uri的host部分是event事件还是callback事件。

event事件存在于web通知native，再由native回调web的流程；

callback事件存在于由native通知web，再由web回调native的流程。

这里只看event事件，callback事件请查看『章节1.2.2』。

```java
# JockeyImpl
  
protected void triggerEventFromWebView(final WebView webView, final JockeyWebViewPayload envelope) {
    final int messageId = envelope.id;
    String type = envelope.type;

    JockeyUtil.d("接收到-->Bridge: " + type + "\n接收到-->Data: " + envelope.payload);

    if (this.handles(type)) {
        processEvent(webView, envelope, messageId, type);
    } else {
        if (_onInterceptEventListener != null && !TextUtils.isEmpty(type)) {
            if (_onInterceptEventListener.onIntercept(type)) {
                processEvent(webView, envelope, messageId, type);
            }
        }
    }
}
```

#### native响应web的回调消息

通过webview.loadUrl()方法实现：

```java
# DefaultJockeyImpl
  
@Override
public void triggerCallbackOnWebView(WebView webView, int messageId, String data) {
    String tempData = data;
    try {
        String url = String.format("javascript:Jockey && Jockey.triggerCallback('{\"data\":%s,\"messageId\":\"%d\"}')", data, messageId);
        webView.loadUrl(url);
    } catch (Exception ignored) {
        tempData = ignored.getMessage();
    }finally {
        if(_msgObserver != null){
            _msgObserver.msgToWebview(messageId, tempData);
        }
    }
}
```

### 1.2、从NATIVE指向WEB

再看native主动发起，再由web回调给native的流程。

#### 1.2.1、native主动向web发送消息

因为其由native主动发起，必然深入业务，在整个框架的入口位于最顶层的BasicWebViewFragment.postBridge()，向下调用TowerFragment.post()，通过一层PostState包装，接着进入DefaultJockeyImpl.send()。

前面几处方法调用的代码很简单，所以只贴出最后的send()方法：

```java
# DefaultJockeyImpl

public void send(String type, WebView toWebView, Object withPayload,
                    JockeyCallback complete) {
    int messageId = messageCount;

    if (complete != null) {
        add(messageId, complete);
    }

    if (withPayload != null) {
        withPayload = gson.toJson(withPayload);
    }
    if(_msgObserver != null){
        _msgObserver.onMsgSend(type, withPayload);
    }
    String url = String.format("javascript:Jockey && Jockey.trigger(\"%s\", %d, %s)",
            type, messageId, withPayload);
    JockeyUtil.d("发送-->Bridge: " + type);
    toWebView.loadUrl(url);

    ++messageCount;
}
```

#### 1.2.2、web响应native的回调消息

就是『章节1.1』中描述的callback事件：

```java
# JockeyImpl

protected void triggerCallbackForMessage(int messageId, Map<Object, Object> payload) {
    try {
        JockeyUtil.d("发送-->Data: " + payload);
        JockeyCallback complete = _callbacks.get(messageId, _DEFAULT);
        complete.call(payload);
    } catch (Exception e) {
        e.printStackTrace();
    }
    _callbacks.remove(messageId);
}
```

## 二、传递参数给执行人

要讲的是，Jockey拦截URL之后，要把这些参数传给谁呢？

先看『章节1.1』的后续参数传递：

```java
if (this.handles(type)) {
    processEvent(webView, envelope, messageId, type);
} else {
    if (_onInterceptEventListener != null && !TextUtils.isEmpty(type)) {
        if (_onInterceptEventListener.onIntercept(type)) {
            processEvent(webView, envelope, messageId, type);
        }
    }
}
```

先看processEvent()方法：

```java
private void processEvent(final WebView webView, JockeyWebViewPayload envelope, final int messageId, final String type) {
    JockeyHandler handler = _listeners.get(type);
    if(_msgObserver != null){
        _msgObserver.jockeyHandlerFind(envelope, messageId, type, handler != null);
    }
    if (handler == null) return;

    if(_msgObserver != null){
        _msgObserver.msgFromWebview(envelope);
    }
    handler.perform(envelope.payload, new JockeyHandler.OnCompletedListener() {
        @Override
        public void onCompleted(final String data) {
            // This has to be done with a handler because a webview load
            // must be triggered
            // in the UI thread
            _handler.post(new Runnable() {
                @Override
                public void run() {
                    JockeyUtil.d("回调-->Bridge: " + type + "\n回调-->Data: " + data);
                    triggerCallbackOnWebView(webView, messageId, data);
                }
            });
        }
    });
}
```

`_listeners`的类型是Map<String, CompositeJockeyHandler>，负责维护JockeyHandler。JockeyHandler是一个抽象接口，其中就是我们的实现细节。至于`_listeners`是怎么来的，请查看『章节4.2』。

再看`_onInterceptEventListener.onIntercept()`方法，`_onInterceptEventListener`同样是一个抽象接口，那么肯定有地方去实现该拦截器接口的onIntercept()，同时也有类似于Jockey.setInterceptEventListener的方法用以注册拦截器接口。

再看『章节1.2』的后续参数传递：

```java
protected void triggerCallbackForMessage(int messageId, Map<Object, Object> payload) {
    try {
        JockeyUtil.d("发送-->Data: " + payload);
        JockeyCallback complete = _callbacks.get(messageId, _DEFAULT);
        complete.call(payload);
    } catch (Exception e) {
        e.printStackTrace();
    }
    _callbacks.remove(messageId);
}
```

`_callbacks`同样也是抽象接口，其类型是JockeyCallback。那么我们还是只需要关注`_callbacks`是怎么添加进来的。

到此为止，我们都只能看到抽象接口，对其具体实现，我们一概不知。带着三个问题继续看：

①`_listeners`的来源

② `_onInterceptEventListener`在何处实现，其onIntercept()的内容是什么

③ `_callbacks`的来源

## 三、消息处理的维度

在整个Jockey的设计上，有三个维度的消息处理机制：

Jockey的JockeyHandler；

Tower的Component和Handler；

SaasBasicWebView的Bridge。

###3.1、InterceptBridge和LogicBridge

在框架的最顶层saasBasicWebView，定义了两个维度的bridge，即：InterceptBridge和LogicBridge。

两种Bridge中定义了我们真正要去做的事情，其流转过程存在差异，但最终在JockeyImpl类的triggerEventFromWebView()方法中调用：

```java
protected void triggerEventFromWebView(final WebView webView,
                                        final JockeyWebViewPayload envelope) {
    final int messageId = envelope.id;
    String type = envelope.type;

    JockeyUtil.d("接收到-->Bridge: " + type + "\n接收到-->Data: " + envelope.payload);

    if (this.handles(type)) {
        processEvent(webView, envelope, messageId, type);
    } else {
        if (_onInterceptEventListener != null && !TextUtils.isEmpty(type)) {
            if (_onInterceptEventListener.onIntercept(type)) {
                processEvent(webView, envelope, messageId, type);
            }
        }
    }
}
```

LogicBridge在processEvent()方法中直接被执行；

InterceptBridge首先经过_onInterceptEventListener.onIntercept(type)方法，如果能找到对应的bridge则接下来在processEvent()方法中执行。

所以，LogicBridge的优先级高于InterceptBridge。

### 3.2、component和handler

handler是向下的抽象，与jockey连接，知道要去具体拦截哪个协议；

component是向上的抽象，它负责维护InterceptBridge（只有InterceptBridge，因为LogicBridge直接连接Jockey），也就是执行真正的操作。

## 四、bridge注册

上面说过Jockey负责拦截URL，那么每个Bridge肯定要连接Jockey才能被调用，所以不分LogicBridge和InterceptBridge，都需要通过Jockey.on()方法注册。

```java
# JockeyImpl
  
@Override
public void on(String type, JockeyHandler... handler) {

    if (!this.handles(type)) {
        _listeners.put(type, new CompositeJockeyHandler());
    }
    if(_msgObserver != null){
        _msgObserver.onMsgOn(type);
    }
    _listeners.get(type).add(handler);
}  
```

很简单，把handler交给`_listener`维护，解决了上面第一个问题，已经知道了`_listener`的来源。

### 4.1、注册InterceptBridge

![](https://shanghai-1252949174.cos.ap-shanghai.myqcloud.com/202005021852524yj3di.svg)

流程还缺失了一部分，也就是最重要的Jockey.on()到底在哪里呢。

在TowerFragment中实现了Jockey.setOnInterceptEventListener()方法：

```java
# TowerFragment

mJockey.setOnInterceptEventListener(new Jockey.OnInterceptEventListener() {
    @Override
    public boolean onIntercept(String bridgeName) {
        switch (bridgeName) {
            case "JockeyExistBridge":
                // 页面加载完成后 查询是否有jockey
                mJockey.on("JockeyExistBridge", new JockeyHandler() {
                    @Override
                    protected void doPerform(Map<Object, Object> map, OnCompletedListener listener) {
                        mHasJockey = true;
                        listener.onCompleted(null);
                    }
                });
                break;

            ...

            default:
                return mEventDispatcher.dispatch(bridgeName);
        }

        return true;
    }
});
```

有一部分匿名Bridge直接在拦截器中通过Jockey.on()注册，其他的InterceptBridge则流转进入mEventDispatcher.dispatch(bridgeName)。

```java
# EventDispatcher
  
public boolean dispatch(String bridgeName) {
    if (getUIHandler().interceptEvent(bridgeName)) return true;
    if (getImageHandler().interceptEvent(bridgeName)) return true;
    if (getShareHandler().interceptEvent(bridgeName)) return true;
    if (getDialogHandler().interceptEvent(bridgeName)) return true;
    if (getOtherHandler().interceptEvent(bridgeName)) return true;

    return false;
}  
```

只跟进UIHandler.interceptEvent(bridgeName)：

```java
# UIHandler
  
protected boolean interceptEvent(String bridgeName) {
    if (mComponent == null) return false;
    switch (bridgeName) {
        case BRIDGE_TITLE:
            interceptTitle();
            break;
            
        ...

        default:
            return false;
    }
    return true;
}

private void interceptTitle() {
    // 改变导航栏标题
    getJockey().on(BRIDGE_TITLE, new JockeyHandler() {
        @Override
        protected void doPerform(Map<Object, Object> payload, OnCompletedListener listener) {
            String title = MapUtil.optString(payload, "title", "");
            mComponent.onSetTitle(title);
        }
    });
}
```

到这里InterceptBridge的注册流程就完结了。

### 4.2、注册LogicBridge

LogicBridge的注册比较简单。

从BasicWebViewFragment.subscribeBridge()开始，进入TowerFragment.subscribe()，将LoginBridge定义的name和callback交给SubscribeState维护，接着SubscribeState.process(jockey)：

```java
# SubscribeState

public void process(Jockey jockey) {
    jockey.on(bridge, new JockeyHandler() {
        @Override
        protected void doPerform(Map<Object, Object> map, OnCompletedListener listener) {
            Type dataType = callback.getClassType();

            Tower bridge;
            if (map.getClass() == dataType) {
                bridge = new Tower(map, listener);
            } else {
                JSONObject jsonObject = new JSONObject(map);
                String json = jsonObject.toString();
                T data = InternalUtil.getGson().fromJson(json, dataType);
                bridge = new Tower(data, listener);
            }
            callback.call(bridge);
        }
    });
}
```

## 五、其他

这个设计非常迷离，首先作为JockeyHandler只充当分发的角色，但是向上抽象的过程，已经抽象出了对应不同事件的Handler以及各自相对应的Component，又在其上抽象出了一堆InterceptBridge和LogicBridge。LogicBridge直接插入Tower层，但是InterceptBridge却经过重重包装再插入Tower层，对于InterceptBridge而言，Tower层对其是一对多的关系，套娃？

完全可以将Jockey设计为协议的抽象，职责跟之前类似，负责WEB和NATIVE的双向通信；Tower层设计为视图的抽象，包括WebView、Fragment和Activity，定义Bridge接口，因为已经持有了页面的实例，可以实现通用的具体功能；在扩展方面可以考虑为支持bridge的优先级注册，在业务层就可以修改已有的默认实现也可以增加新实现；SaasBasicWebView完全可以丢在业务侧。

再激进一点，甚至是，Jockey从Tower中剥离，向上设计一层适配，让Jockey可以去承载RN、WEEX、FLUTTER等等跨端框架与NATIVE之间的通信任务。