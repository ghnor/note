## apk包中都有哪些内容？

> [android apk编译打包过程](https://blog.csdn.net/brycegao321/article/details/79127159)

有AndroidManifest.xml、assets目录、classes.dex(还可能有 classes2.dex,classes3.dex...classesN.dex)、lib目录、META-INF目录、res目录和resources.arsc。

* AndroidManifest.xml对应源代码中的AndroidManifest.xml, 但这里是编译过的，文件内容已经不同了。

* assets对应源代码的assets目录， 是直接复制过来的。

* classes.dex是包含所有Java文件对应的字节码。

* lib目录对应源代码中的libs目录，包含so文件。

* META-INF目录包含CERT.RSA、CERT.SF、MANIFEST.MF等， 保存了各个资源文件的SHA1值，用于校验资源文件是否被篡改，从而防止二次打包时资源文件被替换。

* res目录对应源码的res目录， 包含各种图片、xml等。

* resources.arsc包含了各个资源文件的映射， 可以理解为索引， 通过该文件能找到对应的资源文件信息。

## 点击Android Studio的build按钮后发生了什么？apk编译的流程

> [Android官方文档-构建流程](https://developer.android.google.cn/studio/build#build-process)  

典型 Android 应用模块的构建流程（如图 1 所示）按照以下常规步骤执行：

1. 编译器将您的源代码转换成 DEX 文件（Dalvik 可执行文件，其中包括在 Android 设备上运行的字节码），并将其他所有内容转换成编译后的资源。

2. APK 打包器将 DEX 文件和编译后的资源组合成单个 APK。不过，必须先为 APK 签名，然后才能将应用安装并部署到 Android 设备上。

3. APK 打包器使用调试或发布密钥库为 APK 签名：

    * 如果您构建的是调试版应用（即专用于测试和分析的应用），则打包器会使用调试密钥库为应用签名。Android Studio 会自动使用调试密钥库配置新项目。

    * 如果您构建的是打算对外发布的发布版应用，则打包器会使用发布密钥库为应用签名。如需创建发布密钥库，请参阅在 Android Studio 中为应用签名。

4. 在生成最终 APK 之前，打包器会使用 zipalign 工具对应用进行优化，以减少其在设备上运行时所占用的内存。

构建流程结束时，您将获得应用的调试版 APK 或发布版 APK，以用于部署、测试或发布给外部用户。

> 编译流程的补充说明：

1. 将源代码（包括Application Module和Library Module）编译成class文件，其中aapt和aidl会参与，aapt负责生成R.java和资源文件的索引文件resources.arsc，aidl负责处理.aidl文件生成相应的.java文件。
2. 将所有的class文件（包括第三方库）打包生成dex文件。
3. 自身项目中的资源文件和其他aar包中的资源文件合并到一个目录，通过aapt编译。
4. 将AndroidManifest.xml、resources.arsc、assets目录、编译后的资源文件和所有的dex文件，打包成.apk文件。
5. 再经过签名，生成一个签名过的.apk文件。
6. 最后是通过zipAlign工具对应用进行优化，减少其在设备上运行时所占用的内存。

> [ APK 的前世今生：从 Android 源码到 apk 的编译打包流程](https://www.cnblogs.com/yazhidev/p/11245545.html)

1. 生成仅包含资源文件的 apk 包和 R.java 文件
    
    根据资源文件和 AndroidManifest.xml 由工具 AAPT 生成 R.java 文件。Android Gradle Plugin 3.0.0 以后默认使用 AAPT2。

    1. 预编译

    编译所有 Android 支持的资源文件。可以通过编译语句将单个资源文件编译成 .flat 后缀的过渡二进制文件。

    2. 链接（link）

    将预编译生成的过渡二进制文件合并并打包成单独的 APK 包，R 文件和 ProGuard 规则文件也是在这个时期生成的，生成的 APK 包不包含 DEX 字节码并且是未签名的（后续可使用 D8 编译工具将 Java 字节码编译成 DEX 字节码，使用 apksigner 对 APK 签名）

2. 处理aidl，生成对应的java文件

3. 编译 .java 文件为 .class 文件

    编译项目 src 目录下所有 .java 文件还有之前生成的 R.java 、aidl 生成的 java 文件为相应的的 class 文件。

4. class 文件编译为 dex 文件

    dex 文件是 Android 虚拟机所能识别、解析并运行的文件。Java 源文件被编译为 class 文件后，需要通过 dex 编译器将多个 class 文件整合为一个 dex 文件，从 Android Studio 3.1 开始，已经使用 D8 替代原先的 DX 作为默认的 dex 编译器。

5.  将 dex 文件添加进 apk 包

    原本这步是通过 apkbuilder 脚本来做的，现在改成用 aapt 命令来做。

6. 优化对齐 apk 文件

    apksigner 文档中提到，如果使用 apksigner 对 apk 签名，则需要在签名之前使用 zipalign 优化对齐。

7. 签名

    签名需要私钥，可以通过 Android Studio 生成，也可通过 JDK bin 目录下的 keytool 工具生成。

> [APK编译流程-详解AAPT：aapt2 产物解析](https://juejin.cn/post/6844903933769433095#heading-7)

aapt编译后的apk文件应该包含以下资源：

1. res文件夹内的图片及xml资源(只包含图片、布局) 
2. assets文件夹
3. 二进制AndroidManifest.xml
4. 资源索引表 resources.arsc
5. R类文件

## aapt是什么？参与APP编译的哪些流程？

aapt完整是叫Android Asset Packaging Tool，也就是Android资源打包工具。

编译流程主要负责一是从.java编译为字节码.class的过程，生成R.java文件，二是合并资源文件并编译成二进制文件的过程。

## aapt2和aapt的区别有哪些？

aapt2区分了预编译和链接两个，优化了编译速度。

## zipAlign是什么？

> [Anroid官方文档-zipalign](https://developer.android.com/studio/command-line/zipalign?hl=zh-cn)

zipalign 是一种 zip 归档文件对齐工具。它可确保归档中的所有未压缩文件相对于文件开头都是对齐的。

主要做的就是数据结构对齐。

> 理解数据结构对齐

数据结构对齐使得cpu每次读写的地址都从world_size的整数倍开始，world_size就是cpu一次读取的长度，通常是32位或者64位。

假设cpu一次读取的数据就是32位，未做数据结构对齐前，可能存在读取一份数据，横跨了两个32位数据的片区；在数据结构对齐之后，不会出现一份数据横跨两个32位数据的片区。

> [带你深入理解内存对齐最底层原理](https://zhuanlan.zhihu.com/p/83449008)

## apkSigner是什么？和jarSigner有什么区别？

> [Android中APK签名工具之jarsigner和apksigner详解](https://www.zhangshengrong.com/p/7B1LjpVRNw/)

apkSigner是Google官方提供的Android apk的签名和校验工具。

jarSigner是JDK提供的针对jar包的签名工具。

> android的v1和v2签名

从Android 7.0开始, 谷歌增加新签名方案 V2 Scheme (APK Signature);

但Android 7.0以下版本, 只能用旧签名方案 V1 scheme (JAR signing)。

V1签名:

* 来自JDK(jarsigner), 对zip压缩包的每个文件进行验证, 签名后还能对压缩包修改(移动/重新压缩文件)
* 对V1签名的apk/jar解压,在META-INF存放签名文件(MANIFEST.MF, CERT.SF, CERT.RSA),
* 其中MANIFEST.MF文件保存所有文件的SHA1指纹(除了META-INF文件), 由此可知: V1签名是对压缩包中单个文件签名验证

V2签名:

* 来自Google(apksigner), 对zip压缩包的整个文件验证, 签名后不能修改压缩包(包括zipalign),
* 对V2签名的apk解压,没有发现签名文件,重新压缩后V2签名就失效, 由此可知: V2签名是对整个APK签名验证

V2签名优点很明显:

签名更安全(不能修改压缩包)
签名验证时间更短(不需要解压验证),因而安装速度加快

注意: apksigner工具默认同时使用V1和V2签名,以兼容Android 7.0以下版本
 