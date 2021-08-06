> [分享一波 Android 性能优化的总结！#APK瘦身](https://mp.weixin.qq.com/s?__biz=MzAxMTI4MTkwNQ==&mid=2650836937&idx=1&sn=6b595cc3c3e5f74850d6b1f5e7ac40f2&chksm=80b75b57b7c0d241c8ca0c6c6f3586bcb01aabdd9e84c97311bd800fdd1610b08151d1853b42&scene=21#wechat_redirect)
>
> * 减少res资源大小
>
> 	1. 删除冗余的资源
> 	2. 优化重复的资源
> 	3. 图片压缩
> 	4. 资源混淆
> 	5. 指定的编译的语言
> * 减少so库资源大小
>   1. 移出so中的调试符号
>   2. 动态下发so
>   3. 只编译指定平台的so
> * 减少代码资源大小
>   1. 一个功能尽量用一个库
>   2. 混淆
>   3. R文件内联

> [Android App包瘦身优化实践](https://tech.meituan.com/2017/04/07/android-shrink-overall-solution.html)
>
> - Zip格式优化
>
> - classes.dex的优化
>
>   - 时刻保持良好的编程习惯和对包体积敏锐的嗅觉，去除重复或者不用的代码，慎用第三方库，选用体积小的第三方SDK等等。
>
>   - 压缩代码：开启ProGuard来进行代码压缩，通过使用ProGuard来对代码进行混淆、优化、压缩等工作。
>
>   - R Field的优化
>
>     笔者在[《美团Android DEX自动拆包及动态加载简介》](https://tech.meituan.com/2015/06/15/mt-android-auto-split-dex.html)这篇文章中提到了通过内联R Field来解决R Field过多导致MultiDex 65536的问题，而这一步骤对代码瘦身能够起到明显的效果。
>
> - 资源优化
>
>   - 图片优化
>
>     - 使用矢量图
>
>     - 使用WebP
>
>     - 选择更优的压缩工具
>
>       在Android构建流程中AAPT会使用内置的压缩算法来优化`res/drawable/`目录下的PNG图片，但也可能会导致本来已经优化过的图片体积变大，可以通过在`build.gradle`中设置`cruncherEnabled`来禁止AAPT来优化PNG图片。
>
>   - 开启资源压缩
>
>     Android的编译工具链中提供了一款资源压缩的工具，可以通过该工具来压缩资源，如果要启用资源压缩，可以在build.gradle文件中将`shrinkResources true`
>
>     Android构建工具是通过[ResourceUsageAnalyzer](https://android.googlesource.com/platform/tools/base/+/gradle_2.0.0/build-system/gradle-core/src/main/groovy/com/android/build/gradle/tasks/ResourceUsageAnalyzer.java)来检查哪些资源是无用的，当检查到无用的资源时会把该资源替换成预定义的版本。
>
>     如果想知道哪些资源是无用的，可以通过资源压缩工具的输出日志文件`${project.buildDir}/outputs/mapping/release/resources.txt`来查看。
>
>     资源压缩工具只是把无用资源替换成预定义较小的版本，那我们如何删除这些无用资源呢？通常的做法是结合资源压缩工具的输出日志，找到这些资源并把它们进行删除。但在笔者的项目中很多无用资源是被其它组件或第三方SDK所引入的，如果采用这种优化方式会带来这些SDK后期维护成本的增加，针对这种情况笔者是通过采用在resources.arsc中做优化来解决的，详情看下面“resources.arsc的优化”一节的介绍。
>
>   - 语言资源优化
>
>     根据App自身支持的语言版本选用合适的语言资源，例如使用了AppCompat，如果不做任何配置的话，最终APK包中会包含AppCompat中消息的所有已翻译语言字符串，无论应用的其余部分是否翻译为同一语言，可以通过`resConfig`来配置使用哪些语言，从而让构建工具移除指定语言之外的所有资源。`resConfigs "zh", "zh-rCN"`
>
>   - resources.arsc的优化
>
>     - 资源混淆
>
>       在笔者另一篇[《美团Android资源混淆保护实践》](http://tech.meituan.com/mt-android-resource-obfuscation.html)文章中介绍了采用对资源混淆的方式来保护资源的安全，同时也提到了这种方式有显著的瘦身效果。笔者当时是采用修改AAPT的相关源码的方式，这种方式的痛点是每次升级`Build Tools`都要修改一次AAPT源码，维护性较差。目前笔者采用了微信开源的资源混淆库[AndResGuard](https://github.com/shwenzhang/AndResGuard)，具体的原理和使用帮助可以参考[安装包立减1M–微信Android资源混淆打包工具](http://mp.weixin.qq.com/s?__biz=MzAwNDY1ODY2OQ==&mid=208135658&idx=1&sn=ac9bd6b4927e9e82f9fa14e396183a8f#rd)。
>
>     - 无用资源优化
>
>       在上一节中介绍了可以通过`shrinkResources true`来开启资源压缩，资源压缩工具会把无用的资源替换成预定义的版本而不是移除，如果采用人工移除的方式会带来后期的维护成本，这里笔者采用了一种比较取巧的方式，在Android构建工具执行`package${flavorName}`Task之前通过修改`Compiled Resources`来实现自动去除无用资源。
>
>       具体流程如下：
>
>       1. 收集资源包（`Compiled Resources`的简称）中被替换的预定义版本的资源名称，通过查看资源包（Zip格式）中每个`ZipEntry`的`CRC-32 checksum`来寻找被替换的预定义资源，预定义资源的`CRC-32`定义在[ResourceUsageAnalyzer](https://android.googlesource.com/platform/tools/base/+/gradle_2.0.0/build-system/gradle-core/src/main/groovy/com/android/build/gradle/tasks/ResourceUsageAnalyzer.java)，下面是它们的定义。
>       2. 通过[android-chunk-utils](https://github.com/madisp/android-chunk-utils)把`resources.arsc`中对应的定义移除；
>       3. 删除资源包中对应的资源文件。
>
>     - 重复资源优化
>
>       资源文件虽然内容相同，但因为名称的不同而不能被覆盖，最终都会被集成到APK包中，针对这种问题笔者采用了和前面“无用资源优化”一节中描述类似的策略。
>
>       1. 通过资源包中的每个`ZipEntry`的`CRC-32 checksum`来筛选出重复的资源；
>       2. 通过[android-chunk-utils](https://github.com/madisp/android-chunk-utils)修改`resources.arsc`，把这些重复的资源都`重定向`到同一个文件上；
>       3. 把其它重复的资源文件从资源包中删除。

