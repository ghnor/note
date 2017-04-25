## 引入jar包

#### 方式一：

```gradle
dependencies {
  compile fileTree(dir: 'libs', include: ['*.jar']) // 即添加所有在libs文件夹中的jar
}
```

#### 方式二：

```gradle
dependencies {
  compile files('xxx.jar') // 添加某个jar包作为依赖
}
```

除此之外，`compile fileTree(dir: 'libs', include: ['*.jar'])`能够将dir表示的路径下符合include表示的后缀名的文件全部作为依赖：

```gradle
compile fileTree(dir: ['libs', 'xxx'], include: ['*.jar', '.xxx'])
```

## 引入其他远程仓库

```gradle
repositories {
	// 远程仓库地址
	maven { url = 'https://dl.bintray.com/yuancloud/maven/' }
}

dependencies {
	// 远程仓库
	compile 'cn.yuancloud.app:superadapter:1.1'
}
```

## 引入so库

默认包路径：app\src\main\jniLibs\

放在这个里面的话，系统编译时自动为我们打包。

也可以更改这个默认路径，修改app\build.gradle：

```gradle
sourceSets {
	main {
		jniLibs.srcDirs = ['libs']
	}
}
```
设置其路径跟jar包一样，放在app\libs\下。

## 引入module

```gradle
dependencies {
	compile project(':library name')
}
```

## 引入aar包

#### 方式一：

首先将需要的arr包放在app\libs\下。

修改app\build.gradle，分别添加：

```gradle
android {
	...
	repositories {
		...
		flatDir {
			dirs 'libs'
		}
	}
}
```

```gradle
dependencies {
	...
	compile(name: 'arr name', ext: 'aar')
}
```

#### 方式二：

选择Android Studio的File -> New -> New Module...，再选择Import .JAR/.AAR Package，导入后再在依赖中添加该module
