homebrew的配置分成三个目录，分别是
1、brew（`brew --repo`）
2、homebrew/core（`brew --repo homebrew/core`）
3、homebrew/cask（`brew --repo homebrew/cask`）

在目录中可以通过`git remote get-url origin`来查看当前的源的URL，可以通过以下三个命令设置为默认值，最后不要忘记了更新哦~

```bash
git -C "$(brew --repo)" remote set-url origin 'https://github.com/Homebrew/brew.git'

git -C "$(brew --repo homebrew/core)" remote set-url origin 'https://github.com/Homebrew/homebrew-core.git'

git -C "$(brew --repo homebrew/cask)" remote set-url origin 'https://github.com/Homebrew/homebrew-cask.git'

brew update
```