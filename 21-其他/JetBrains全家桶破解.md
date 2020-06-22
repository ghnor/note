首先打开[IntelliJ IDEA 注册码](http://idea.lanyus.com/)，下载破解补丁。

补丁其实对其他例如Pycharm，Clion都有效，并不仅仅破解IDEA。

![](https://user-images.githubusercontent.com/16182206/43384806-ae2e3fc2-9411-11e8-9474-d21b64032b34.png)

把下过来的补丁放到IDEA安装目录下的bin文件夹中。

讲道理的话，放其他位置也是可以的，你记得位置就可以，后面会用到。

修改**idea.vmoptions**和**idea64.vmoptions**（如果是windows平台，就修改**idea.exe.vmoptions**和**idea64.exe.vmoptions**）。

![](https://user-images.githubusercontent.com/16182206/43384810-b1cd1f22-9411-11e8-8ad4-5cb812bc7139.png)

分别修改这两个文件，在末尾加上：

```
// --javaagent:[这里填之前下载的补丁的绝对路径]
-javaagent:/opt/idea-IU-181.5281.24/bin/JetbrainsCrack-2.8-release-enc.jar
```
![](https://user-images.githubusercontent.com/16182206/43384814-b3bb69c4-9411-11e8-9e56-27f79f59abc8.png)

再打开IDEA，会提示我们验证注册，选择Activation code，再把上面这句话输入。

![](https://user-images.githubusercontent.com/16182206/43384818-b5882fda-9411-11e8-983c-3edd1a408fd8.png)

OK!
