# 步骤：
1. WebView开启JavaScript脚本执行  
2. WebView设置供JavaScript调用的交互接口  
3. 客户端和网页端编写调用对方的代码。

# JavaScript调用Java

调用格式：`window.jsInterfaceName.methodName(parameterValues)`  
本例中，jsInterfaceName 是 control；methodName 是 toastMessage。

## Java代码
```java
mWebView.addJavascriptInterface(new JsInteration(), "control");
```
```java
public class JsInteration {
      
	@JavascriptInterface
	public void toastMessage(String message) {
		//TODO
	}
}
```

## JavaScript代码
```html
<script type="text/javascript">
    function toastMessage(message) {
        window.control.toastMessage(message)
    }
</script>
```

# Java调用JavaScript
调用格式：`webView.loadUrl("javascript:methodName(parameterValues)")`
## JavaScript代码
```html
<script type="text/javascript">
    function sayHello() {
        alert("Hello")
    }

    function alertMessage(message) {
        alert(message)
    }
	
	function getGreetings() {
		return 1;
	}
</script>
```

## Java代码
* 调用js无参无返回值函数
```java
String call = "javascript:sayHello()";
webView.loadUrl(call);
```

* 调用js有参无返回值函数  
```java
String call = "javascript:alertMessage(\"" + "content" + "\")";
webView.loadUrl(call);
```
注意对于字符串作为参数值需要进行转义双引号。

* 调用js有参数有返回值的函数  

Android在4.4之前并没有提供直接调用js函数并获取值的方法，所以在此之前，常用的思路是java调用js方法，js方法执行完毕，再次调用java代码将值返回。

Android 4.4之后可以使用evaluateJavascript调用。
```java
webView.evaluateJavascript("getGreetings()", new ValueCallback<String>() {

	@Override
	public void onReceiveValue(String value) {
		Log.i(LOGTAG, "onReceiveValue value=" + value);
	}});
```
上面限定了结果返回结果为String，对于简单的类型会尝试转换成字符串返回，对于复杂的数据类型，建议以字符串形式的json返回。  
evaluateJavascript方法必须在UI线程（主线程）调用，因此onReceiveValue也执行在主线程。  

# 安全问题
在Android API Level 17（Android 4.2），addjavascriptInterface接口引起的漏洞，可能导致恶意网页通过Js方法遍历刚刚通过addjavascriptInterface注入进来的类的所有方法从中获取到getClass方法，然后通过反射获取到Runtime对象，进而调用Runtime对象的exec方法执行一些操作，恶意的Js代码如下：
```html
function execute(args) {
	for (var obj in window) {
		if ("getClass" in window[obj]) {
			alert(obj);
			return window[obj].getClass().forName("java.lang.Runtime")
					.getMethod("getRuntime",null).invoke(null,null).exec(args);
		}
	}
}
```
在Android API Level 17（Android 4.2）之后，可以通过添加@JavascriptInterface这个注解来避免该漏洞，在4.1及之前可以使用下面的方法实现native与js之间的交互。  

1.　继承 WebChromeClient，重写 onJsPrompt() | onConfirm() | onAlert()，用到哪个方法重写哪个。
```java
class HarlanWebChromeClient extends WebChromeClient {

	/*此处覆盖的是javascript中的alert方法。
	 *当网页需要弹出alert窗口时，会执行onJsAlert中的方法
	 * 网页自身的alert方法不会被调用。
	 */
	@Override
	public boolean onJsAlert(WebView view, String url, String message,
							 JsResult result) {
		show("onJsAlert");
		result.confirm();
		return true;
	}

	/*此处覆盖的是javascript中的confirm方法。
	 *当网页需要弹出confirm窗口时，会执行onJsConfirm中的方法
	 * 网页自身的confirm方法不会被调用。
	 */
	@Override
	public boolean onJsConfirm(WebView view, String url,
							   String message, JsResult result) {
		show("onJsConfirm");
		result.confirm();
		return true;
	}

	/*此处覆盖的是javascript中的confirm方法。
	 *当网页需要弹出confirm窗口时，会执行onJsConfirm中的方法
	 * 网页自身的confirm方法不会被调用。
	 */
	@Override
	public boolean onJsPrompt(WebView view, String url,
							  String message, String defaultValue,
							  JsPromptResult result) {
		show("onJsPrompt....");
		result.confirm();
		return true;
	}
}
```

2.　给webView设置该重写的类
```java
//设置ChromeClient
mWebView.setWebChromeClient(new HarlanWebChromeClient());
```

3.　JS中的具体实现
```html
function cfm() {
	confirm("")
}

function pmt() {
   prompt("","");
}

function onAlert()
{
	alert("这是网页中的alert方法，如果重写了mWebView的onAlert方法，该方法不会执行");
}
```
实现原理就是在页面中触发的方法被webView中设置的WebChromeClient给拦截了，从而执行了WebChromeClient中重写的onXxx()方法，没有执行页面中相应的onXxx()方法，这是方式相对简单，而且安全。

# 其他
[为WebView中的Java与JavaScript提供【安全可靠】的多样互通方案](https://github.com/pedant/safe-java-js-webview-bridge)

[Android与Js交互](https://www.jianshu.com/p/77528bb680c1)

[Android Native与JS通信互调](https://www.jianshu.com/p/2a1e656e6b29)

