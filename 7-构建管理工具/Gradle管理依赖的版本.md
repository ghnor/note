# 管理依赖的版本

* 传递(transitive)
* 排除(exclude)
* 强制(force)
* 动态版本(+)

## 传递依赖

首先Gradle在3.0之后，用`api`代替之前的`compile`，多了`implementation`。

`api`和`compile`是等价的，可以无缝切换。

`implementation`与`api`的区别是`implementation`会切断依赖的传递。

即：

如果`[项目A] implementation [项目B]`、`[项目B] implementation [项目C]`，那么在`[项目A]`就无法找不到`[项目C]`的代码。如果修改为`[项目B] api [项目C]`，`[项目A]`就可以使用`[项目C]`的代码。

可以通过指定`transitive false`强制切断这种依赖的传递：

```gradle
dependencies {
    api 'groupId:artifactId:versionName' {
        transitive false
    }

    // or：

    api group: 'groupId', name: 'artifactId', version: 'versionName', transitive: false
}
```

全局切断依赖的传递：

```gradle
configurations.all {
   transitive false
}
```

## 排除依赖

有时候可能不是想简单粗暴的切断依赖的传递，只是想去掉某几个模块的依赖，就可以使用`exclude`。

```gradle
dependencies {
    api('groupId:artifactId:versionName') {
        // 排除_groupId_:_artifactId_模块
        // 也可以只写一个，比如排除全部_groupId_下的模块
        // 或者不管group是什么，只要module是_artifactId_就排除掉
        exclude group: '_groupId_', module: '_artifactId_'
    } 
}
```

全局排除依赖：

```gradle
configurations {
    // 编译期排除_artifactId_模块
    compile.exclude module: '_artifactId_'
    // 在整个构建过程中排除_groupId_:_artifactId_
    all*.exclude group: '_groupId_', module: '_artifactId_'
}
```

## 强制依赖的版本

当有连续的依赖，即A依赖B，B依赖C，C依赖D，C、D都是黑盒，无法修改其模块依赖形式，此时可以使用`force true`。

```gradle
dependencies {
    api('groupId:artifactId:versionName') {
        force true
    } 
}
```

全局强制依赖的版本：

```gradle
configurations.all {
   resolutionStrategy.force {
       'groupId:artifactId:versionName'
   }
}
```

## 使用动态依赖版本

如果想让工程始终依赖最新的版本，就可以使用`+`让Gradle每次构建的时候都去检查远程是否存在新版本，也支持依赖某个大版本下的最新小版本，如`1.+`。

```gradle
dependencies {
    api 'groupId:artifactId:+'

    // or:

    api 'groupId:artifactId:1.+'
}
```

不是很建议使用动态版本，其一在生成环境下，依赖版本的每次更新都应该经过比较谨慎的评估；其二是Gradle本身对构建工程做了一些优化，会缓存已经下载的依赖，动态版本会使缓存失效。