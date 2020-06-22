# gradle本地依赖碰到的问题

依赖本地module的方式：

```gradle
# 根目录settings.gradle

include ':mainmodulelib'
project(':mainmodulelib').projectDir = file("../MainModule/mainmodulelib")
```

```gradle
# module目录build.gradle（比如：app/build.gradle）

implementation(project(':mainmodulelib')) {
    exclude group: 'com.souche.android.sdk', module: 'wallet'
    exclude group: 'com.souche.android.sdk', module: 'wallet-dev'
}
```

**首先第一个问题：**

`Unable to resolve dependency for ':App@fengchePreview/compileClasspath'`

就修改`build.grale`为：

```gradle
implementation(project(path: ':mainmodulelib', configuration: 'default')) {
    exclude group: 'com.souche.android.sdk', module: 'wallet'
    exclude group: 'com.souche.android.sdk', module: 'wallet-dev'
}
```

**然后碰到了第二个问题：**

`ERROR: Unable to resolve dependency for ':App@fengchePreview/compileClasspath': Failed to transform file 'mainmodulelib-release.aar' to match attributes {artifactType=android-exploded-aar} using transform ExtractAarTransform`

那就把`build.grale`改回去。

后来发现，本地依赖的module需要跟主工程有一样的buildTypes，就是说主工程有
```gradle
buildTypes{
    debug{ ... }
    release{ ... }
}
```
那么被依赖的本地module也要有
```gradle
buildTypes{
    debug{ ... }
    release{ ... }
}
```

**改完还有问题：**

`Android dependency 'com.bugtags.library:bugtags-lib:3.0.0' is set to compileOnly/provided which is not supported`

clean一下，终于好了。