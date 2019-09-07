# RecycleView相关

[【Android进阶】RecyclerView之ItemDecoration（一）](https://juejin.im/post/5c806d9de51d457cd75bc680)  
[【Android进阶】RecyclerView之缓存（二）](https://juejin.im/post/5c876633e51d4510a06d4868)  
[【Android进阶】RecyclerView之绘制流程（三）](https://juejin.im/post/5cad57f7e51d456e651b644a)

[看完感觉我RecyclerView白学了！](https://mp.weixin.qq.com/s/Qey-3JDdKYG04mo9WeBZ2g)

## 对 RecycleView 的了解
## Recycleview 和 ListView 的区别

* 动画区别：
  * 在RecyclerView中，内置有许多动画API，例如：notifyItemChanged(), notifyDataInserted(), notifyItemMoved()等等；如果需要自定义动画效果，可以通过实现（RecyclerView.ItemAnimator类）完成自定义动画效果，然后调用RecyclerView.setItemAnimator()；
  * 但是ListView并没有实现动画效果，但我们可以在Adapter自己实现item的动画效果；

* 刷新区别：
  * ListView中通常刷新数据是用全局刷新notifyDataSetChanged()，这样一来就会非常消耗资源；本身无法实现局部刷新，但是如果要在ListView实现局部刷新，依然是可以实现的，当一个item数据刷新时，我们可以在Adapter中，实现一个onItemChanged()方法，在方法里面获取到这个item的position（可以通过getFirstVisiblePosition()），然后调用getView()方法来刷新这个item的数据；
  * RecyclerView中可以实现局部刷新，例如：notifyItemChanged()；

* 缓存区别：
  * RecyclerView比ListView多两级缓存，支持多个离ItemView缓存，支持开发者自定义缓存处理逻辑，支持所有RecyclerView共用同一个RecyclerViewPool(缓存池)。
  * ListView和RecyclerView缓存机制基本一致，但缓存使用不同。

[【腾讯Bugly干货分享】Android ListView 与 RecyclerView 对比浅析—缓存机制](https://zhuanlan.zhihu.com/p/23339185)  
[ListView 与 RecyclerView 简单对比](https://blog.csdn.net/shu_lance/article/details/79566189)  
[Android开发：ListView、AdapterView、RecyclerView全面解析](https://www.jianshu.com/p/4e8e4fd13cf7)

## RecycleView 实现原理