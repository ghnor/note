# 除了notify还有什么方式可以唤醒线程

* 当一个拥有Object锁的线程调用 wait()方法时，就会使当前线程加入object.wait 等待队列中，并且释放当前占用的Object锁，这样其他线程就有机会获取这个Object锁，获得Object锁的线程调用notify()方法，就能在Object.wait 等待队列中随机唤醒一个线程（该唤醒是随机的与加入的顺序无关，优先级高的被唤醒概率会高）
* 如果调用notifyAll（）方法就唤醒全部的线程。注意:调用notify()方法后并不会立即释放object锁，会等待该线程执行完毕后释放Object锁。