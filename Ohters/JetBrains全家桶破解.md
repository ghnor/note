首先打开[IntelliJ IDEA 注册码](http://idea.lanyus.com/)，下载破解补丁。

补丁其实对其他例如Pycharm，Clion都有效，并不仅仅破解IDEA。

![](https://github.com/ghnor/TechNote/blob/master/asstes/Others/JetBrains%E5%85%A8%E5%AE%B6%E6%A1%B6%E7%A0%B4%E8%A7%A3_1.png?raw=true)

把下过来的补丁放到IDEA安装目录下的bin文件夹中。

讲道理的话，放其他位置也是可以的，你记得位置就可以，后面会用到。

修改**idea.vmoptions**和**idea64.vmoptions**（如果是windows平台，就修改**idea.exe.vmoptions**和**idea64.exe.vmoptions**）。

![](https://github.com/ghnor/TechNote/blob/master/asstes/Others/JetBrains%E5%85%A8%E5%AE%B6%E6%A1%B6%E7%A0%B4%E8%A7%A3_2.png?raw=true)

分别修改这两个文件，在末尾加上：

```
// --javaagent:[这里填之前下载的补丁的绝对路径]
-javaagent:/opt/idea-IU-181.5281.24/bin/JetbrainsCrack-2.8-release-enc.jar
```
![](https://github.com/ghnor/TechNote/blob/master/asstes/Others/JetBrains%E5%85%A8%E5%AE%B6%E6%A1%B6%E7%A0%B4%E8%A7%A3_3.png?raw=true)

再打开IDEA，会提示我们验证注册，选择Activation code，再把上面这句话输入。

![](https://github.com/ghnor/TechNote/blob/master/asstes/Others/JetBrains%E5%85%A8%E5%AE%B6%E6%A1%B6%E7%A0%B4%E8%A7%A3_4.png?raw=true)

OK!
