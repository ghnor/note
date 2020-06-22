## Gradle Wrapper

是对Gradle的一层包装，封装了统一的Gradle版本和配置。

利用`gradle wrapper`命令，自动生成如下的文件：

```yml
├──gradle
│   └──wrapper
│       ├──gradle-wrapper.jar
│       └──gradle-wrapper.properties  # Gradle配置文件
├──gradlew  # Linux下可执行脚本
└──gradlew.bat  # Windows下可执行脚本
```
