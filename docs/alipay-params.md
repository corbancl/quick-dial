# 官网支付 · 支付宝参数清单

> 来源文件：`api/pay.php`（线上部署版，部署账号 `syncruseocn` → `sync.ruseo.cn/api/`）
> 整理时间：2026-07-22
> 接口模式：`alipay.trade.page.pay`（电脑网站支付，新窗口跳转支付宝完成付款）

---

## 一、全局配置（pay.php:42–51）

| 参数名 | 值 / 说明 | 位置 |
|--------|-----------|------|
| `ALI_APPID` | `2019011563052070` | 支付宝开放平台应用 APPID |
| `ALI_GATEWAY` | `https://openapi.alipay.com/gateway.do` | 支付宝网关 |
| `ALI_NOTIFY` | `https://sync.ruseo.cn/api/pay.php?action=notify_alipay` | 异步通知地址（支付宝主动 POST） |
| `ALI_PRIVATE_KEY` | 商户应用私钥（RSA2 / 2048 位） | pay.php:45–47（**完整值见源码，本文件不粘贴**） |
| `ALI_PUBLIC_KEY` | 支付宝公钥（RSA2） | pay.php:49–51（**完整值见源码，本文件不粘贴**） |

---

## 二、下单请求参数（`alipay.trade.page.pay`，函数 `createAlipayOrder`）

拼接为 `ALI_GATEWAY + '?' + httpBuildAlipayQuery($params)`，前端打开该 URL 跳转支付。

| 字段 | 值 | 说明 |
|------|----|------|
| `app_id` | `ALI_APPID` | 应用 ID |
| `method` | `alipay.trade.page.pay` | 接口名 |
| `format` | `JSON` | 格式 |
| `charset` | `utf-8` | 编码 |
| `sign_type` | `RSA2` | 签名算法 |
| `timestamp` | `date('Y-m-d H:i:s')` | 当前时间 |
| `version` | `1.0` | 接口版本 |
| `notify_url` | `ALI_NOTIFY` | 异步通知 |
| `return_url` | `https://www.cilacila.cn/pro-success.html?plan={套餐}` | 支付完成回跳（默认 `monthly`） |
| `biz_content` | JSON 字符串（见下） | 业务参数 |
| `sign` | `makeAlipaySign($params)` | 见第四节 |

### `biz_content` 业务参数

| 字段 | 值 | 说明 |
|------|----|------|
| `out_trade_no` | 订单号 | 商户订单号 |
| `total_amount` | `number_format($amount,2,'.','')` | 金额，2 位小数 |
| `subject` | `Quick Dial Pro - {desc}` | 订单标题 |
| `product_code` | `FAST_INSTANT_TRADE_PAY` | 即时到账产品码 |

---

## 三、对账查询参数（`alipay.trade.query`，函数 `queryAlipayPaid`）

支付结果轮询 / 对账时调用，校验响应用 `ALI_PUBLIC_KEY`。

| 字段 | 值 |
|------|----|
| `app_id` | `ALI_APPID` |
| `method` | `alipay.trade.query` |
| `format` | `JSON` |
| `charset` | `utf-8` |
| `sign_type` | `RSA2` |
| `timestamp` | `date('Y-m-d H:i:s')` |
| `version` | `1.0` |
| `biz_content` | `{"out_trade_no":"{订单号}"}` |
| `sign` | `makeAlipaySign($params)` |

**支付成功判定**：响应 `trade_status` ∈ `TRADE_SUCCESS` / `TRADE_FINISHED`，且响应签名用 `ALI_PUBLIC_KEY` 验签通过。

---

## 四、签名 / 验签机制

- **请求签名** `makeAlipaySign($params)`：
  1. `ksort($params)` 按 key 字典序排序
  2. 拼接 `key=value&`（跳过空值、`null`、`sign` 字段）
  3. `openssl_sign($str, $sign, ALI_PRIVATE_KEY, OPENSSL_ALGO_SHA256)`
  4. `base64_encode($sign)`
- **回调验签** `verifyAlipaySign($data)`：
  1. 取出 `sign`，移除 `sign` / `sign_type`
  2. `ksort` 后同规则拼接
  3. `openssl_verify($str, base64_decode($sign), ALI_PUBLIC_KEY, OPENSSL_ALGO_SHA256)`

---

## 五、异步回调

- 入口：`POST ?action=notify_alipay`
- 流程：`verifyAlipaySign($_POST)` 验签 → 更新订单状态 / 开通 Pro

---

## 六、⚠️ 历史遗留：两份 pay.php 的 APPID 不一致

项目内曾存在两份 `pay.php`，APPID 不同：

| 文件 | `ALI_APPID` | `return_url` | 状态 |
|------|-------------|--------------|------|
| `api/pay.php` | `2019011563052070` | `www.cilacila.cn/pro-success.html` | ✅ 线上真实生效 |
| `packages/tmp_source/api/pay.php`（已清理） | `2019011563042146` | `https://sync.ruseo.cn/` | ❌ 旧版重复快照，已于 2026-07-22 删除 |

**以 `api/pay.php` 为准。** 改参数（换 APPID、改回调域名等）只需改 `api/pay.php`，再用 `syncruseocn` 账号重新 FTP 部署即可。

---

## 七、部署边界（铁律）

- 后端 `api/*` 只通过 FTP 部署到 `sync.ruseo.cn`，**不进 Git**（开源策略仅前端免费版入库）。
- 三个 FTP 同指 `116.62.179.194`，靠用户名区分站点，绝不混用：
  - API 服务器：`syncruseocn`
  - 官网 `www.cilacila.cn`：`wwwcilacilacn`
  - web 端 `cilacila.cn`：`cilacila`
  - 插件端：`chenliangxyz`
