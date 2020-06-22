# 《Android进阶解密》第13章 热修复原理

## 热修复框架的种类和对比

|类别|成员|
|-|-|
|阿里系|AndFix、Dexposed、阿里百川、Sophix|
|腾讯系|微信的Tinker、QQ空间的超级补丁、手机QQ的QFix|
|知名公司|美团的Robust、饿了么的Amigo、美丽说蘑菇街的Aceso|
|其他|RocooFix、Nuwa、AnoleFix|

热修复框架的核心技术主要有三类，分别是代码修复、资源修复和动态链接库修复。

## 资源修复

1. 创建新的AssetManager，通过反射调用addAssetPath方法加载外部的资源，这样新创建的AssetManager就含有了外部资源。
2. 将AssetManger类型的mAssets字段的引用全部替换为新创建的AssetManager。

## 代码修复

代码修复主要有3个方案，分别是底层替换方案、类加载方案和Instant Run方案。

### 类加载方案

类加载方案基于Dex分包方案。

ClassLoader会顺序加载Dex文件。将新的Dex文件插到原有Dex队列的前面，实现替换的功能。

### 底层替换方案

在native层会有每个方法的执行入口，入参是javaMethod，在ART虚拟机中对应一个ArtMethod指针，ArtMethod结构体中包含了Java方法的所有信息，包括执行入口、访问权限、所属类和代码执行地址。

主流方案有两种，一种是替换ArtMethod结构体的字段，这样会有兼容问题，因为厂商可能会修改ArtMethod结构体；另一种是替换整个ArtMethod结构体，这样不会存在兼容问题。

### Instant Run方案

Instant Run主要利用ASM在每个方法中注入一段代码去判断是否需要对该方法做替换。

## 动态链接库的修复