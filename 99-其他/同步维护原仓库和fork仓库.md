1. 在fork出来的仓库中添加原仓库的远程地址

    ```
    git remote add <远程仓库名> <远程仓库地址>

    # git remote add upstream git@github.com:facebook/react-native.git
    ```

    原仓库的名字叫做upstream，这个是规定的。

2. 更新远程仓库的git信息

    ```
    git fetch <远程仓库名> <远程分支名[可选]>

    # git fetch upstream
    ```

3. 从远程仓库中切换出一条分支

    ```
    git checkout -b <本地分支名> <远程仓库名>/<远程分支名>

    # git checkout -b master-local upstream/master
    ```

4. 更新分支内容

    ```
    git pull <远程仓库名> <远程分支名>:<本地分支名>

    # git pull upstream master:master-local
    ```

5. cherry pick

    有时候，fork出来的仓库并不需要原仓库的全部提交，可以利用cherry-pick挑拣需要的commit

    首先切换到目标commit，也就是要把挑拣出来的commit提交到该分支上。

    ```
    git cherry-pick <commit id>
    git cherry-pick -x <commit id>  # 保留原提交者信息

    批量：

    git cherry-pick <start commit id>..<end commit id> # 左开右闭区间，不包含start commit
    git cherry-pick <start commit id>^..<end commit id> # 左闭右闭区间，包含start commit
    ```

    批量cherry-pick很容易冲突，冲突之后需要先解决当前commit的冲突，之后执行以下命令继续操作：

    ```
    git cherry-pick --continue
    git cherry-pick --quit
    git cherry-pick --abort
    ```
