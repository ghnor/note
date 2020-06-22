> [拥抱 Android Studio 之五：Gradle 插件开发](http://kvh.io/cn/embrace-android-studio-gradle-plugin.html)

## 插件之于 Gradle

根据[官方文档](https://docs.gradle.org/current/userguide/custom_plugins.html)定义，插件打包了可重用的构建逻辑，可以适用于不同的项目和构建过程。

Gradle 提供了很多官方插件，用于支持 Java、Groovy 等工程的构建和打包。同时也提供了自定义插件的机制，让每个人都可以通过插件来实现特定的构建逻辑，并可以把这些逻辑打包起来，分享给其他人。

插件的源码可以使用 Groovy、Scala、Java 三种语言，笔者不会 Scala，所以平时只是使用 Groovy 和 Java。前者用于实现与 Gradle 构建生命周期（如 task 的依赖）有关的逻辑，后者用于核心逻辑，表现为 Groovy 调用 Java 的代码。

另外，还有很多项目使用 Eclipse 或者 Maven 进行开发构建，用 Java 实现核心业务代码，将有利于实现快速迁移。

## 插件打包方式

Gradle 的插件有三种打包方式，主要是按照复杂程度和可见性来划分：

### Build script

把插件写在 build.gradle 文件中，一般用于简单的逻辑，只在该 build.gradle 文件中可见，笔者常用来做原型调试，本文将简要介绍此类。

### buildSrc 项目

将插件源代码放在 rootProjectDir/buildSrc/src/main/groovy 中，只对该项目中可见，适用于逻辑较为复杂，但又不需要外部可见的插件，本文不介绍，有兴趣可以参考[此处](https://docs.gradle.org/current/userguide/organizing_gradle_projects.html#sec:build_sources)。

### 独立项目

一个独立的 Groovy 和 Java 项目，可以把这个项目打包成 Jar 文件包，一个 Jar 文件包还可以包含多个插件入口，将文件包发布到托管平台上，供其他人使用。本文将着重介绍此类。

## 独立项目插件

本来是准备用IDEA开发的，但是尝试了半天没成。索性回到Android Studio上，反正我们需要的只是Groovy工程的目录结构。

### 目录结构

新建一个Project或者已经有了的话，添加一个Module，Module选择Android Library或者Java Library都可以。目录结构如下，该删删该建建。

```
.
├── build
├── libs
├── .gitignore
├── build.gradle
├── plugin.iml
├── proguard-rules.pro
└── src
    ├── main
    │   ├── groovy
    │   │   └── [package name]
    │   │       └── xxx.groovy
    │   └── resources
    │       └── META-INF
    │          └── gradle-plugins
    │               └── [package name].properties
    └── test
        └── groovy
            └── [package name]
                └── xxx.groovy
```

**注意：**

* groovy 文件夹中的类，一定要修改成 .groovy 后缀，IDE 才会正常识别。
* resources/META-INF/gradle-plugins 这个文件夹结构是强制要求的，否则不能识别成插件。

### build.gradle

修改新添加的Module下的build.gradle文件：

```
apply plugin: 'groovy'

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])

    implementation gradleApi()
    implementation localGroovy()
}
```

## 代码

https://www.jianshu.com/p/cff4684803f3
https://juejin.im/entry/577b03438ac2470061afb130
https://blog.csdn.net/tscyds/article/details/78082861
https://www.jianshu.com/p/1e3577fe358c
https://www.jianshu.com/p/c202853059b4