# Quick Dial 部署指南

## 产物说明

`npm run build` 后 `dist/` 目录如下：

```
dist/
├── index.html          # 入口页面
├── manifest.json       # Chrome/Edge 扩展清单
├── background.js       # 扩展后台脚本
├── js.png              # 扩展图标
├── icons/              # 扩展图标资源
└── assets/
    ├── index-xxx.js    # 编译后的 JS（约 100KB）
    └── index-xxx.css   # 编译后的 CSS（约 25KB）
```

这是一个纯静态站点，部署到任意静态托管即可。

---

## 方式一：Gitee Pages（推荐，免费，国内快）

Gitee Pages 直接用你的仓库，零配置。

### 步骤

1. 打开你的仓库页面：https://gitee.com/corbancc/quick-dial
2. 点击顶部菜单 **服务** → **Gitee Pages**
3. 选择部署分支：`master`
4. 部署目录填：`dist`
5. 点击 **启动** → 等待 1-2 分钟
6. 部署完成后访问：`https://corbancc.gitee.io/quick-dial`

### 自动更新

```bash
# 以后每次改动推送后，去 Gitee Pages 页面点「更新」即可
npm run build                              # 本地构建
git add src/ dist/ && git commit -m "xxx"  # 提交（dist 需要 Git 追踪）
git push origin master
# 然后去 Gitee Pages 手动点更新
```

或者用 `vite.config.ts` 让构建自动把 dist 推到 gh-pages 分支（见文末"CI/CD 自动部署"）。

### 注意事项

- Gitee Pages 免费版**不绑定自定义域名**（需要付费）
- 访问 URL 固定为 `https://用户名.gitee.io/仓库名`
- 首次部署需要**实名认证** Gitee 账号

---

## 方式二：部署到自有服务器（ruseo.cn）

你已有阿里云服务器（宝塔面板），可以直接挂上去。

### 步骤

#### 2.1 创建站点

1. 登录宝塔面板 → **网站** → **添加站点**
2. 域名填：`dial.ruseo.cn`（或你想要的子域名）
3. 根目录设为：`/www/wwwroot/dial.ruseo.cn`
4. PHP 版本选：**纯静态**（不需要 PHP）
5. 点击提交

#### 2.2 配置 DNS

1. 登录你的域名 DNS 管理（阿里云/腾讯云控制台）
2. 添加 A 记录：
   - 主机记录：`dial`
   - 记录值：你阿里云服务器的公网 IP
   - TTL：600

#### 2.3 上传文件

```bash
# 1. 本地构建
npm run build

# 2. 压缩 dist 目录
tar -czf dist.tar.gz -C M:/new dist/

# 3. 上传到服务器（需要准备 SSH 登录信息）
scp M:/new/dist.tar.gz root@你的服务器IP:/tmp/

# 4. SSH 登录服务器解压
ssh root@你的服务器IP
cd /tmp
mkdir -p /www/wwwroot/dial.ruseo.cn
tar -xzf dist.tar.gz -C /www/wwwroot/dial.ruseo.cn --strip-components=1

# 5. 设置权限
chown -R www:www /www/wwwroot/dial.ruseo.cn
chmod -R 755 /www/wwwroot/dial.ruseo.cn
```

#### 2.4 配置 HTTPS（宝塔面板）

1. 宝塔 → 网站 → dial.ruseo.cn → **SSL**
2. 选择 **Let's Encrypt** → 申请证书
3. 勾选"强制 HTTPS"

---

## 方式三：EdgeOne Pages（免费，腾讯云，可绑域名）

WorkBuddy 内置支持，一键部署。

```bash
# 在 WorkBuddy 中运行
cd M:/new && npm run build
```

然后告诉我"部署到 EdgeOne Pages"，我帮你一键完成。绑定自定义域名后，访问地址就是你自己的域名。

---

## 方式四：CloudStudio 部署

同样是 WorkBuddy 内置支持。

```bash
cd M:/new && npm run build
```

然后告诉我"部署到 CloudStudio"，我帮你完成。适合快速生成一个临时预览链接分享出去。

---

## CI/CD 自动部署（进阶）

不想每次手动点「更新」，可以配置自动部署。

### Gitee Pages 自动更新

在项目根目录创建 `.gitee/workflows/deploy.yml`：

```yaml
# 注：Gitee 需要开通 Gitee Pages Pro 才能用 CI/CD 自动更新
# 免费版只能手动点「更新」按钮
```

### GitHub Actions 部署到自有服务器

如果用 GitHub，可以这样写：

```yaml
name: Deploy
on:
  push:
    branches: [master]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: easingthemes/ssh-deploy@main
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_KEY }}
          SOURCE: "dist/"
          REMOTE_HOST: ${{ secrets.HOST }}
          REMOTE_USER: ${{ secrets.USER }}
          TARGET: "/www/wwwroot/dial.ruseo.cn"
```

---

## 百度联盟 + 部署的配合流程

```
1. npm run build → 部署到线上 → 拿到可访问的 URL
2. 用这个 URL 去百度联盟填写「网站推广」
3. 审核通过后拿到 tn 参数
4. 改搜索 URL 加上 tn → 重新构建 → 重新部署
```

---

## 推荐路线

| 优先级 | 做什么 | 目的 |
|--------|--------|------|
| 现在 | Gitee Pages 部署 | 5分钟拿到线上地址 |
| 然后 | 拿 Gitee Pages URL 去百度联盟申请 | 开始搜索分成 |
| 以后 | 部署到 dial.ruseo.cn | 绑自己的域名，品牌化 |
