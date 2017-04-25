避免在依赖包出新版本时，需要对每个module中的build.gradle文件都进行修改（如appcompat-v7包），使用这种方式即只需一次修改。

## 方法一：添加 config.gradle

在项目的根目录创建一个gradle配置文件config.gradle，格式如下(内容根据需要进行修改)：

项目中所有的依赖只要在这个文件中统一做一次修改即可。

```grale
ext {
    android_support_version = '25.3.1'

    android = [ compileSdkVersion: 25 ,
                buildToolsVersion: "25.0.2",
                applicationId    : "com.gradle.test",
                minSdkVersion    : 15,
                targetSdkVersion : 25,
                versionCode      : 1,
                versionName      : "1.0" ]

    dependencies = [
            //android.support
            "appcompat-v7"      : "com.android.support:appcompat-v7: ${android_support_version}",
            "design"            : "com.android.support:design: ${android_support_version}",
            "recyclerview-v7"   : "com.android.support:recyclerview-v7: ${android_support_version}",
    ]
}
```

其次在根目录的build.gradle文件中添加内容`apply from: "config.gradle"`

```gradle
// Top-level build file where you can add configuration options common to all sub-projects/modules.
apply from: "config.gradle" // 添加到此处

buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:2.3.1'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        jcenter()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

## 
