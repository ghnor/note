# Gradle插件打包上传到远程仓库

类似的远程仓库有JCenter、mavenCenter、JitPack等。

* JCenter：由JFrog公司提供，JFrog首先为你提供Bintray网站，Bintray允许你创建私有的maven、rpm、deb等仓库。然后可以在Bintray上提交审核，把已经上传到Bintray上的库发布到JCenter；
* mavenCenter：由Sonatype公司提供，也是一个常用的中央仓库；
* JitPack：同上。

## 上传JCenter

**插件的选择：**

* [gradle-bintray-plugin](https://github.com/bintray/gradle-bintray-plugin)
* [bintray-release](https://github.com/novoda/bintray-release)

## 上传MavenCenter或者Maven私服

**插件的选择：**

* maven-publish
* maven