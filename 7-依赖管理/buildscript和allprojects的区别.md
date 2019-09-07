# buildscript和allprojects的区别

一个新工程，根目录下的`build.gradle`一般是这样的：

```gradle
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    repositories {
        google()
        jcenter()
        
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:3.4.0'
        
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        google()
        jcenter()
        
    }
}
```

`buildscript`是gradle脚本自身运行所需要依赖的插件，`repositories`下是插件所在的Maven库的地址，`dependencies`下是插件对应的名字和版本。举个例子，因为是Android的工程，需要Android Gradle插件，所以工程一建立，在`dependencies`默认就会有`classpath 'com.android.tools.build:gradle:3.4.0'`,这个就是Android Gradle插件，相应的，如果是纯Java工程也会有Java Gradle插件。

`allprojects`是项目运行所依赖的内容，比如：公共的三方库、公司私有的二方库。同样地，`repositories`下是依赖库所在的Maven库的地址，也可以手动添加`dependencies`，添加在`dependencies`下的依赖库会被子工程和模块共享。

在每个module的`build.gradle`中，都可以添加上述两个内容。唯一的区别就是module中添加就只有当前module生效。比如添加依赖的gradle脚本，当前module能够使用，其他模块就不能使用。