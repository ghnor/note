**Map<K, V>**：Java中存储键值对的数据类型都实现了这个接口，表示“映射表”。支持的两个核心操作是get(Object key)以及put(K key, V value)，分别用来获取键对应的值以及向映射表中插入键值对。  
  
**Set<E>**：实现了这个接口的集合类型中不允许存在重复的元素，代表数学意义上的“集合”。它所支持的核心操作有add(E e), remove(Object o), contains(Object o)，分别用于添加元素，删除元素以及判断给定元素是否存在于集中。  
  
**List<E>**：Java中集合框架中的列表类型都实现了这个接口，表示一种有序序列。支持get(int index), add(E e)等操作。  
  
**Queue<E>**：Java集合框架中的队列接口，代表了“先进先出”队列。支持add(E element), remove()等操作。  
  
**Stack<E>**：Java集合框架中表示堆栈的数据类型，堆栈是一种“后进先出”的数据结构。支持push(E item), pop()等操作。  
