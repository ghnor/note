# Gradle更新SNAPSHOT

在开发的时候发现尽管远程依赖的库已经SNAPSHOT版本了，但是每次build的时候都不会去拉取新代码，导致每次都要更新依赖库的版本。

google了一下，找到个类似的提问：

> https://stackoverflow.com/questions/42058626/how-to-get-newest-snapshot-of-a-dependency-without-changing-version-in-gradle

首先确认依赖库的版本是SNAPSHOT版本：

```
dependencies {
    compile group: "groupId", name: "artifactId", version: "1.0-SNAPSHOT"
}
```

如果没有使用后缀为`-SNAPSHOT`的快照版本（或者使用的不是Maven仓库），那么需要显式地指定依赖库是动态更新的：

```
dependencies {
    compile group: "groupId", name: "artifactId", version: "1.0", changing: true
}
```

更常见的写法可能是：

```
dependencies {
    compile ('groupId:artifactId:1.0') {
        changing true
    }
}
```

之后指定Gradle缓存的时间（Gradle为了更快地构建工程，默认会缓存24小时），直接改成0，不再缓存：

```
configurations.all {
    resolutionStrategy.cacheChangingModulesFor 0, 'seconds'
}
```

还有，如果使用的是动态版本：

```
dependencies {
    compile group: "groupId", name: "artifactId", version: "1+", changing: true
}
```

那么就还需要额外增加：

```
configurations.all {
    resolutionStrategy.cacheChangingModulesFor 0, 'seconds'
    resolutionStrategy.cacheDynamicVersionsFor 0, 'seconds'
}
```

**其他**

如果上面还不奏效，尝试将如下代码：

```
configurations.all {  
	// check for updates every build   
	resolutionStrategy.cacheChangingModulesFor  0,'seconds'  
}
```

修改为：

> https://github.com/spring-gradle-plugins/dependency-management-plugin/issues/38

```
dependencyManagement {
    resolutionStrategy.cacheChangingModulesFor 0, 'seconds'
}
```

**刷新依赖库**

这个没什么用...regresh一次要半年

```
./gradlew build --refresh-dependencies
```