## 安装启动

需要的工具：  
1. [jenkins.war](http://mirrors.jenkins-ci.org/war/latest/jenkins.war)  
2. Gradle  
3. JDK   

环境部署自行百度。

### 启动服务

这里可以选择两种方式：

#### 一、

打开命令行，cd到jenkins.war文件所在的目录，执行`java -jar jenkins.war`。

在浏览器中输入`http://localhost:8080/`

#### 二、

将jenkins.war文件复制到tomcat的根目录下的webapps目录下。

启动tomcat（/bin/startup.bar），会自动解压并启用jenkins服务。

在浏览器输入`http://localhost:8080/jenkins/`

### 首次打开

首次进入jenkins页面，会提示需要创建一个账号并建议你安装一些常用的插件，建议直接全部装上。基本满足大部分的需求。

### 插件管理

系统管理 --> 管理插件 --> 可选插件，可以直接搜索自己想要的插件在线安装。

或者你本地已经下载好了需要的插件：  
系统管理 --> 管理插件 --> 高级，选择本地插件上传，然后重启服务。

## 全局工具配置

系统管理 --> Global Tool Configuration，配置我们自己的JDK和Gradle的路径。

## 开始构建

新建 --> 输入项目名 --> 选择<构建一个自由风格的软件项目> --> 点击ok

源码管理 --> 选择各位自己的CVS（这里我用的是SVN，所以选择Subversion）。

