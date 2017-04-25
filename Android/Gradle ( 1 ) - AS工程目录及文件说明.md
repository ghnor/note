## Gradle 和 Android Studio 工程目录：

├── app········· #Android App目录  
│ ├── app.iml···············AS识别项目的配置文件  
│ ├── build··················#模块构建输出目录（代码编译后生成的文件存放的位置、生成的Apk文件等）  
│ ├── build.gradle····#module构建脚本  
│ ├── libs····················· 相关库文件目录  
│ ├── proguard-rules.pro··proguard混淆配置  
│ └── src·······················源代码，资源等  
│  
├── build··············#构建输出目录  
│ ├── generated  
│ └── intermediates  
│  
├── build.gradle·····#工程构建文件  
│  
├── gradle  
│ └── wrapper  
│  
├── gradle.properties······#gradle相关的全局属性设置  
├── gradlew ·························#Linux下的gradle wrapper可执行文件  
├── gradlew.bat ·················#windows下的gradle wrapper可执行文件  
├── local.properties···········配置Androod SDK位置文件  
└── settings.gradle··········#工程配置  

* **build.gradle #工程构建文件**

顶级构建文件，可以为所有子项目/模块添加常用的配置选项。

```gradle
//buildscript中的声明是gradle脚本自身需要使用的资源
//可以声明的资源包括依赖项、第三方插件、maven仓库地址等。
buildscript {
    repositories {
        jcenter()  //使用jcenter库
        //mavenCentral()
    }
    dependencies {
        // 配置使用gradle所需要依赖的版本库
        classpath 'com.android.tools.build:gradle:2.1.0'
        //注意：不要在这里配置项目所需要的依赖
    }
}

//项目自身所需要的一些配置
allprojects {
    repositories {
        jcenter()
    }
}
```

* **app/build.gradle #module构建文件**

模块（module）中的构建文件，对当前模块生效。开发过程中最需要注重的一个文件，应用的相关特性都在这里进行配置。

```gradle
//表示该module是一个应用（application）模块，应用了com.android.application插件；
//（如果是一个android library，那么这里的是apply plugin:'com.android.library'）
apply plugin: 'com.android.application'

//安卓项目相关的配置，后续章节将进行更为详细的介绍
android {
    //编译项目所用的SDK版本(即编译时的API版本)，com.android.support的版本需要与这个一致
    //建议（总是）采用最新版本
    compileSdkVersion 23
    //构建工具版本
    buildToolsVersion "23.0.3"

    defaultConfig {
        //安装时，依据该ID区分是否为同一个应用
        applicationId "com.wiky.supporttest"

        //最低支持的系统版本（必须>=所有依赖库所支持的最低版本）
        minSdkVersion 9

        //举例说明其作用：假设我们compileSdkVersion采用了23（6.0），但是项目暂时还未对6.0的特性（如运行时权限）做相应的处理，
        //那么可以设置targetSdkVersion的版本低于23。这样，应用仍可以正常运行在6.0的机子上（当然也就不具有运行时权限的特性）。
        targetSdkVersion 23
        versionCode 1
        versionName "1.0"
    }

    // buildTypes是构建类型，常用的有release和debug两种，可以在这里面启用混淆，启用zipAlign以及配置签名信息等。后面再具体介绍
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

//该module所需的依赖库配置
dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    testCompile 'junit:junit:4.12'
    compile 'com.android.support:appcompat-v7:23.3.0'

}
```

* **settings.gradle #工程配置**

这个文件是全局的项目配置文件，里面主要声明一些需要加入 gradle 的 module，即告诉gradle项目中有哪些模块（module）需要处理，文件内容：

```gradle
//如果有多个module的话，格式如：include ':app', ':otherModule',.....
include ':app'
```

* **gradle.properties #gradle相关的全局属性设置**

在google开源的[iosched][1]项目中，可以看到他们利用了该文件配置了一些builde.gradle中需要用到的常（变）量， 如com.android.support. 的版本号以及签名信息相关的配置。

* **gradle/wrapper/gradle-wrapper.properties**

它允许你的机器在不需要安装运行的情况下就能运行Gradle脚本（我们在下载AS后可以直接开始使用gradle、开发项目，而无需另外下载及安装gradle，主要归功于这一特性），而且更重要的是它确保了build脚本运行在指定版本的Gradle。它会从中央仓库中自动下载Gradle，解压到你的文件系统，然后用来build。

```gradle
#Mon Dec 28 10:00:20 PST 2015
distributionBase=GRADLE_USER_HOME  // 在环境变量中配置，默认：C:\Users\Administrator\
distributionPath=wrapper/dists // 如果上面的环境变量已配置，下载目录：GRADLE_USER_HOME\.gradle\wrapper\dists\
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-3.3-all.zip // 使用的gradle版本，及其仓库地址。我们也可以指定本地目录。
```
