以前都是在Eclipse上开发NDK，这次换了在Android Studio上开发。

# 安装NDK

打开Tools->Android->SDK Manager->SDK Tools选中CMake、LLDB和NDK，点击确认。

* CMake：外部的编译工具，就是个交叉编译器。

* LLDB：代码调试工具。

* NDK：不解释，靠它跑C/C++代码。

这一步就把自己给坑了，以前因为‘墙’关系，SDK都是要翻‘墙’才能更新的。但是现在是能够直连更新的，但是由于之前电脑中hosts文件的关系，导致SDK manager一直不能拉取到最新的内容。

表现为：以前已经下载好的内容，例如Android Support Library，会正常提示有更新，但是NDK需要的新内容，包括上述的CMake、LLDB以及NDK等就不会显示...╮(╯_╰)╭一开始真是不明所以。

解决方法也很简单，将电脑中的hosts文件还原到最初始的状态即可。  
打开`C:\Windows\System32\drivers\etc`，删除hosts中的全部内容即可，hosts文件原本就只有几行`#`开头的注释文件。

# 开始一个新项目
与创建一个普通的工程有些许的区别：

1. 在**Configure your new project**页面，记得勾选**Include C++ Support**。
