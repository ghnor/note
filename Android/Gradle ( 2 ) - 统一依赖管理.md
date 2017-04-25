避免在依赖包出新版本时，需要对每个module中的build.gradle文件都进行修改（如appcompat-v7包），使用这种方式即只需一次修改。

## 方法一：添加 config.gradle

在项目的根目录创建一个gradle配置文件config.gradle，格式如下(内容根据需要进行修改)：

项目中所有的依赖只要在这个文件中统一做一次修改即可。

```grale
ext {
    supportVersion = '25.3.1'

    android = [ compileSdkVersion: 25 ,
                buildToolsVersion: "25.0.2",
                applicationId    : "com.gradle.test",
                minSdkVersion    : 15,
                targetSdkVersion : 25,
                versionCode      : 1,
                versionName      : "1.0" ]

    dependencies = [
            //android.support
            "appcompat-v7"      : "com.android.support:appcompat-v7:${supportVersion}",
            "design"            : "com.android.support:design:${supportVersion}",
            "recyclerview-v7"   : "com.android.support:recyclerview-v7:${supportVersion}",
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

再修改app\build.gradle文件：

```gradle
apply plugin: 'com.android.application'

android {
    compileSdkVersion rootProject.ext.android.compileSdkVersion
    buildToolsVersion rootProject.ext.android.buildToolsVersion
    defaultConfig {
        applicationId rootProject.ext.android.applicationId
        minSdkVersion rootProject.ext.android.minSdkVersion
        targetSdkVersion rootProject.ext.android.targetSdkVersion
        versionCode rootProject.ext.android.versionCode
        versionName rootProject.ext.android.versionName
        testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    androidTestCompile('com.android.support.test.espresso:espresso-core:2.2.2', {
        exclude group: 'com.android.support', module: 'support-annotations'
    })
    compile rootProject.ext.dependencies["appcompat-v7"]
	// or: compile "com.android.support:appcompat-v7:${supportVersion}"
    compile 'com.android.support.constraint:constraint-layout:1.0.2'
    testCompile 'junit:junit:4.12'
}
```

## 方法二：不同格式的config.gradle

同样需要现在根目录下新建config.gradle文件，格式如下：

```gradle
ext {
    // Version of compile sdk
    COMPILE_SDK_VERSION = 23
    // Version of Android build tool
    BUILD_TOOLS_VERSION = "23.0.3"
    // Min version of Android sdk
    MIN_SDK_VERSION = 9
    // Version of target Android sdk
    TARGET_SDK_VERSION = 23
    // Use progurad or not
    MINIFY_ENABLED = true
    MINIFY_DISABLED = false
    // Version of "com.android.support:appcompat-v7", refer it as folow:
    //  compile "com.android.support:appcompat-v7:${APPCOMPAT_VERSION}"
    APPCOMPAT_VERSION = '23.2.0'
    // Version of "junit", refer it as folow:
    //  compile "junit:junit:${JUNIT_VERSION}"
    JUNIT_VERSION= '4.12'
}
```

在根目录的build.gradle中引入：`apply from: "config.gradle"`。

修改app\build.gradle文件：

```gradle
apply plugin : 'com.android.library'
android {
    compileSdkVersion COMPILE_SDK_VERSION
    buildToolsVersion BUILD_TOOLS_VERSION
    defaultConfig {
        minSdkVersion MIN_SDK_VERSION
        targetSdkVersion TARGET_SDK_VERSION
        versionCode 1
        versionName "1.0.0"
    }
    buildTypes {
        release {
            minifyEnabled MINIFY_DISABLED
            proguardFiles getDefaultProguardFile('proguard-android.txt' ), 'proguard-rules.pro'
        }
    }
}
dependencies {
    compile fileTree(dir : 'libs', include: ['*.jar' ])
    testCompile "junit:junit: ${JUNIT_VERSION} "
    compile "com.android.support:appcompat-v7: ${APPCOMPAT_VERSION} "
}
```

### 不新建config.gradle

方法一、二中，都可以采用不新建config.gradle文件，直接将ext中的内容添加到根目录的build.gradle文件中，也不需要添加`apply from: "config.gradle"`。

在app\build.gradle文件中使用方法同上。

## 方法三：配置gradle.properties

在gradle.properties中添加：

```properties
support_version = 25.3.1

compile_sdk_version = 25
build_tools_version = 25.0.2
min_sdk_version = 15
target_sdk_version = 25
```

修改app\build.gradle：

```gradle
...
buildToolsVersion build_tools_version
...
compile "com.android.support:appcompat-v7:${supportVersion}"
...
```

这种方法有一个问题就是，比如说build.gradle中compileSdkVersion的数值本身应该是int类型的，但是如果从gradle.properties中读取的话，默认是string类型，所以build.gradle文件中原先值类型为int的参数都不能用这种方法去设置。
