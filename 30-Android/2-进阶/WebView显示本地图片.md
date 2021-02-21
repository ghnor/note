Webview要显示本地的图片，大致常见有如下三种方式：

1. 可以通过拦截WebViewClient的`shouldInterceptRequest`方式，以字节流的方式返回图片数据。相当于是js请求了一次远程图片资源，只不过正常的远程图片资源是放在其他服务器上的，现在是放在android手机本地。

2. html的img标签，加载base64编码的图片，图片大的话，这个数据量会比较可怕，经过base64编码后，内存中占用的大小会远比本地文件大。

3. html的img标签的src属性使用content协议，android通过ContentProvider提供图片资源。

   > 参考：https://stackoverflow.com/questions/11303118/android-set-a-local-image-to-an-img-element-in-webview

## 拦截资源请求实现

1. 将要显示的本地图片模拟成一次http请求，也就是原始的本地路径，例如`/storage/emulated/0/DCIM/xxxx.jpg`，需要包装成`https://com.ghnor.dev?assets=/storage/emulated/0/DCIM/xxxx.jpg`。

   * `com.ghnor.dev`是host，任意名字都可以，但是要能识别，避免跟正常的http资源请求混淆；

   * `assets=/storage/emulated/0/DCIM/xxxx.jpg`是为了将原始本地路径带回，可以用你想用的任何方式，只要可以在webview中重新获取到即可。

2. 一般在html中是通过img标签的src属性去显示图片：

   ```html
   <img src="xxxx"/>
   ```

   如果src的内容是一个http请求，那么webview的shouldInterceptRequest就会被执行。

3. 重写shouldInterceptRequest方法

   先介绍一下该方法，js任何的资源请求都会执行该方法，该方法有两个重载：

   `public WebResourceResponse shouldInterceptRequest(WebView view, String url)`

   `public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request)`

   WebResourceRequest也就是对String的包装，区别不大，重写第一个就可以。

   ```java
   // 判断该资源请求是否是本地图片资源的请求
   String packageName = view.getContext().getApplicationInfo().packageName; // packgeName就是com.ghnor.dev
   Uri uri = Uri.parse(url);
   if (uri == null) return null; // 尝试解析该URI，失败直接跳出
   if (uri.getHost() == null || !uri.getHost().contains(packageName)) return null; // 判断host
   if (uri.getQuery() == null || !uri.getQuery().contains("assets")) return null; // 判断query
   
   File imagefile = new File(uri.getQueryParameter("assets"));
   FileInputStream fis = null;
   try {
       fis = new FileInputStream(imagefile);
   } catch (FileNotFoundException e) {
       e.printStackTrace();
   }
   Bitmap bi = BitmapFactory.decodeStream(fis);
   ByteArrayOutputStream baos = new ByteArrayOutputStream();
   //PNG OR THE FORMAT YOU WANT
   bi.compress(Bitmap.CompressFormat.JPEG, 75, baos);
   
   byte[] data = baos.toByteArray();
   InputStream is = new ByteArrayInputStream(data);
   return new WebResourceResponse("text/html", "UTF-8", is);
   ```

## 其他网络上常见的方案

然后看下网络上常见的其他方案，有些就是新手在学习写的demo不适用实际生产环境，有的是已经过时的方法不再支持。

* 在本地路径前添加`file://`前缀

  这种方式除了需要几个webview操作本地文件的权限之外，还要求打开的html页面是放在应用的assets中，也就是加载的是本地页面。

  1. 需要设置的权限如下：

     ```java
     WebSettings webSettings=webView.getSettings();
     //允许webview对文件的操作
     webSettings.setAllowUniversalAccessFromFileURLs(true);
     webSettings.setAllowFileAccess(true);
     webSettings.setAllowFileAccessFromFileURLs(true);
     ```

  2. 拼凑`file://`前缀，查看最后拼凑完的完整路径应该是类似`file:///storage/emulated/0/xxx/yyy.jpg`。

* `loadData`&`loadDataWithBaseURL`

  加载的是html资源，例如这样：

  ```java
  WebView.loadDataWithBaseURL("file:///android_asset/", html, "text/html","utf-8", null); 
  ```

  `file:///android_asset/`表示assets资源的路径。

  常见问题：

  * 注意设置文本的默认编码格式；

    ```java
    webView.getSettings().setDefaultTextEncodingName("UTF-8");
    ```

  * `loadData`不能加载图片，需要使用`loadDataWithBaseURL`；

  * ```java
    webView.loadData(htmlData, "text/html", "UTF -8");//API提供的标准用法，无法解决乱码问题
    webView.loadData(htmlData, "text/html; charset=UTF-8", null);//这种写法可以正确解码
    ```

