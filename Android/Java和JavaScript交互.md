## 步骤：
1. WebView开启JavaScript脚本执行  
2. WebView设置供JavaScript调用的交互接口  
3. 客户端和网页端编写调用对方的代码。

## JavaScript调用Java

调用格式：`window.jsInterfaceName.methodName(parameterValues)`  
本例中，jsInterfaceName 是 control；methodName 是 toastMessage。

### Java代码
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

### JavaScript代码
```html
<script type="text/javascript">
    function toastMessage(message) {
        window.control.toastMessage(message)
    }
</script>
```

## Java调用JavaScript
调用格式：`webView.loadUrl("javascript:methodName(parameterValues)")`
### JavaScript代码
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

### Java代码
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
