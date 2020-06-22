# Volley

### Volley的磁盘缓存
在面试的时候，聊到 Volley 请求到网络的数据缓存。当时说到是 Volley 会将每次通过网络请求到的数据，采用FileOutputStream，写入到本地的文件中。  
那么问题来了：这个缓存文件，是声明在一个SD卡文件夹中的(也可以是getCacheFile())。如果不停的请求网络数据，这个缓存文件夹将无限制的增大，最终达到SD卡容量时，会发生无法写入的异常(因为存储空间满了)。  
这个问题的确以前没有想到，当时也没说出怎么回事。回家了赶紧又看了看代码才知道，原来 Volley 考虑过这个问题(汗!想想也是)  
翻看代码DiskBasedCache#pruneIfNeeded()  
```java
private void pruneIfNeeded(int neededSpace) {
    if ((mTotalSize + neededSpace) < mMaxCacheSizeInBytes) {
        return;
    }
    
    long before = mTotalSize;
    int prunedFiles = 0;
    long startTime = SystemClock.elapsedRealtime();

    Iterator<Map.Entry<String, CacheHeader>> iterator = mEntries.entrySet().iterator();
    while (iterator.hasNext()) {
        Map.Entry<String, CacheHeader> entry = iterator.next();
        CacheHeader e = entry.getValue();
        boolean deleted = getFileForKey(e.key).delete();
        if (deleted) {
            mTotalSize -= e.size;
        } else {
		//print log
        }
        iterator.remove();
        prunedFiles++;
        if ((mTotalSize + neededSpace) < mMaxCacheSizeInBytes * HYSTERESIS_FACTOR) {
            break;
        }
    }
}
```	
其中mMaxCacheSizeInBytes是构造方法传入的一个缓存文件夹的大小，如果不传默认是5M的大小。  
通过这个方法可以发现，每当被调用时会传入一个neededSpace，也就是需要申请的磁盘大小(即要新缓存的那个文件所需大小)。首先会判断如果这个neededSpace申请成功以后是否会超过最大可用容量，如果会超过，则通过遍历本地已经保存的缓存文件的header(header中包含了缓存文件的缓存有效期、占用大小等信息)去删除文件，直到可用容量不大于声明的缓存文件夹的大小。  
其中HYSTERESIS_FACTOR是一个值为0.9的常量，应该是为了防止误差的存在吧(我猜的)。  

### Volley缓存命中率的优化
如果让你去设计Volley的缓存功能，你要如何增大它的命中率。  
可惜了，如果上面的缓存功能是昨天看的，今天的面试这个问题就能说出来了。  
还是上面的代码，在缓存内容可能超过缓存文件夹的大小时，删除的逻辑是直接遍历header删除。这个时候删除的文件有可能是我们上一次请求时刚刚保存下来的，屁股都还没坐稳呢，现在立即删掉，有点舍不得啊。  
如果遍历的时候，判断一下，首先删除超过缓存有效期的(过期缓存)，其次按照LRU算法，删除最久未使用的，岂不是更合适？  

### Volley缓存文件名的计算
```java
private String getFilenameForKey(String key) {
    int firstHalfLength = key.length() / 2;
    String localFilename = String.valueOf(key.substring(0, firstHalfLength).hashCode());
    localFilename += String.valueOf(key.substring(firstHalfLength).hashCode());
    return localFilename;
}
```
为什么会要把一个key分成两部分，分别求hashCode，最后又做拼接。  
这个问题之前在stackoverflow上问过 [#链接](http://stackoverflow.com/questions/34984302/why-volley-diskbasedcache-splicing-without-direct-access-to-the-cache-file-name/34987423#34987423)  
原谅我，别人的回答我最初并没有看懂。直到最近被问到，如果让你设计一个HashMap，如何避免value被覆盖，我才想到原因。  
先来看一下 String#hashCode() 的实现：  
```java
@Override 
public int hashCode() {
    int hash = hashCode;
    if (hash == 0) {
        if (count == 0) {
            return 0;
        }
        final int end = count + offset;
        final char[] chars = value;
        for (int i = offset; i < end; ++i) {
            hash = 31*hash + chars[i];
        }
        hashCode = hash;
    }
    return hash;
}
```
从上面的实现可以看到，String的hashcode是根据字符数组中每个位置的字母的int值再加上上次hash值乘以31，这种算法求出来的，至于为什么是31，我也不清楚。  
但是可以肯定一点，hashcode并不是唯一的。不信你运行下面这两个输出：  
```java
System.out.print("======" + "vFrKiaNHfF7t[9::E[XsX?L7xPp3DZSteIZvdRT8CX:w6d;v<_KZnhsM_^dqoppe".hashCode());
System.out.print("======" + "hI4pFxGOfS@suhVUd:mTo_begImJPB@Fl[6WJ?ai=RXfIx^=Aix@9M;;?Vdj_Zsi".hashCode());
```
这两个字符串是根据hashcode的算法逆向出来的，他们的hashcode都是12345。逆向算法请见[这里](https://my.oschina.net/backtract/blog/169310)  
再回到我们的问题，为什么会要把一个key分成两部分。现在可以肯定的答出，目的是为了尽可能避免hashcode重复造成的文件名重复(求两次hash两次都与另一个url重复的概率总要比一次重复的概率小吧)。  
顺带再提一点，就像上面说的，概率小并不代表不存在。但是Java计算hashcode的速度是很快的，应该是在效率和安全性上取舍的结果吧。  
