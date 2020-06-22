> 摘自stackoverflow，[Android CollapsingToolbarLayout collapse Listener](http://stackoverflow.com/questions/31682310/android-collapsingtoolbarlayout-collapse-listener)

当AppBarLayout垂直方向上的偏移量发生改变时，调用`AppBarLayout.OnOffsetChangedListener`接口。

```java
public abstract class AppBarStateChangeListener implements AppBarLayout.OnOffsetChangedListener {

    public enum State {
        EXPANDED,
        COLLAPSED,
        IDLE
    }

    private State mCurrentState = State.IDLE;

    @Override
    public final void onOffsetChanged(AppBarLayout appBarLayout, int i) {
        if (i == 0) {
            if (mCurrentState != State.EXPANDED) {
                onStateChanged(appBarLayout, State.EXPANDED);
            }
            mCurrentState = State.EXPANDED;
        } else if (Math.abs(i) >= appBarLayout.getTotalScrollRange()) {
            if (mCurrentState != State.COLLAPSED) {
                onStateChanged(appBarLayout, State.COLLAPSED);
            }
            mCurrentState = State.COLLAPSED;
        } else {
            if (mCurrentState != State.IDLE) {
                onStateChanged(appBarLayout, State.IDLE);
            }
            mCurrentState = State.IDLE;
        }
    }

    public abstract void onStateChanged(AppBarLayout appBarLayout, State state);
}
```

use it:

```java
mAppBarLayout.addOnOffsetChangedListener(new AppBarStateChangeListener() {

	@Override
	public void onStateChanged(AppBarLayout appBarLayout, State state) {
		if( state == State.EXPANDED ) {
			//展开状态
			
		}else if(state == State.COLLAPSED){
			//折叠状态
			
		}else {
			//中间状态
			
		}
	}
});
```
