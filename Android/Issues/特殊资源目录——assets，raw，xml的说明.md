## assets和res/raw
* 两者目录下的文件在打包后会原封不动的保存在apk包中，不会被编译成二进制。

* assets中的文件不会被映射到R.java文件中，访问的时候需要AssetManager类；  
res/raw中的文件会被映射到R.java文件中，访问的时候直接使用资源ID即R.raw.filename。


* assets可以有目录结构；  
res/raw不可以有目录结构。

* 读取assets：
```java
InputStream is = getResources().openRawResource(R.raw.filename);
```
* 读取res/raw：
```java
AssetManager am = getAssets();
InputStream is = am.open("filename");
```

## res/xml
* 会被编译成二进制格式放到最终的安装包里，通过R类来访问这里的文件。

* 这里的文件还是原始XML文件，需要对它进行解析。
