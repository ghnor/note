```java
public class BaseLazyFragment extends Fragment {

    private static final String TAG = BaseLazyFragment.class.getSimpleName();

    private boolean isViewPrepared; //界面是否已经完成初始化

    private boolean hasVisible; //是否显示过
    private boolean hasInvisible; //是否隐藏过
    private boolean isFirstVisible = true; //是否是第一次显示
    private boolean isFirstInvisible = true; //是否是第一次隐藏

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        isViewPrepared = true;
        if (getUserVisibleHint()) {
            onUserVisibleFirst();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (getUserVisibleHint()) {
            onUserVisible();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (!getUserVisibleHint() && hasVisible && !hasInvisible) {
            onUserInvisible();
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        isViewPrepared = false;
    }

    @Override
    public void setUserVisibleHint(boolean isVisibleToUser) {
        super.setUserVisibleHint(isVisibleToUser);
        if (isVisibleToUser) {
            if (isFirstVisible) {
                isFirstVisible = false;
                if (isViewPrepared) {
                    onUserVisibleFirst();
                    onUserVisible();
                }
            } else {
                if (isViewPrepared) {
                    onUserVisible();
                }
            }
        } else {
            if (isViewPrepared && hasVisible && !hasInvisible) {
                if (isFirstInvisible) {
                    isFirstInvisible = false;
                    onUserInvisibleFirst();
                }
                onUserInvisible();
            }
        }
    }

    /**************************************protected method************************************/
    /**
     * 第一次fragment可见（进行初始化工作）
     */
    public void onUserVisibleFirst() {}

    /**
     * fragment可见（切换回来或者onResume）
     */
    public void onUserVisible() {
        hasVisible = true;
        hasInvisible = false;
    }

    /**
     * 第一次fragment不可见（不建议在此处理事件）
     */
    public void onUserInvisibleFirst() {}

    /**
     * fragment不可见（切换掉或者onPause）
     */
    public void onUserInvisible() {
        hasInvisible = true;
        hasVisible = false;
    }
}
```
