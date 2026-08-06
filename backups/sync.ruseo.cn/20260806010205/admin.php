<?php
/**
 * Quick Dial 管理员后台
 * 首次访问自动创建 qd_admins 表和管理员账号
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mail.php';
session_start();

// 首次部署：自动建表 + 插入管理员
$db->exec("CREATE TABLE IF NOT EXISTS qd_admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$cnt = $db->query('SELECT COUNT(*) as n FROM qd_admins')->fetch(PDO::FETCH_ASSOC)['n'] ?? 0;
if ($cnt == 0) {
    $db->prepare('INSERT INTO qd_admins (username, password) VALUES (?, ?)')
       ->execute(['corban', password_hash('7832518ycx', PASSWORD_DEFAULT)]);
}

// 自动迁移：给 qd_users 加 banned 字段
try { $db->exec("ALTER TABLE qd_users ADD COLUMN banned TINYINT NOT NULL DEFAULT 0"); } catch (Exception $e) {}
// 自动迁移：给 qd_orders 加备注字段（手动续费 / 手动确认收款）
try { $db->exec("ALTER TABLE qd_orders ADD COLUMN note_type VARCHAR(20) DEFAULT NULL COMMENT 'gift/compensation/other/confirm'"); } catch (Exception $e) {}
try { $db->exec("ALTER TABLE qd_orders ADD COLUMN note TEXT DEFAULT NULL"); } catch (Exception $e) {}
// 自动迁移：同步记录日志表（管理后台「同步记录」页数据源）
try { $db->exec("CREATE TABLE IF NOT EXISTS `qd_sync_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `action` VARCHAR(20) NOT NULL COMMENT 'upload/download',
    `source` VARCHAR(10) NOT NULL DEFAULT 'manual' COMMENT 'manual/auto',
    `version` INT NOT NULL DEFAULT 0,
    `size_bytes` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (`user_id`),
    INDEX idx_created (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"); } catch (Exception $e) {}

// 同步记录新增「端(platform)」与「IP」两列（幂等迁移，重复执行安全）
try { $db->exec("ALTER TABLE qd_sync_log ADD COLUMN platform VARCHAR(16) NOT NULL DEFAULT 'web' COMMENT 'web/extension/plugin/fnos'"); } catch (Exception $e) {}
try { $db->exec("ALTER TABLE qd_sync_log ADD COLUMN ip VARCHAR(45) NOT NULL DEFAULT '' COMMENT '客户端IP'"); } catch (Exception $e) {}

// 自动迁移：管理员操作审计日志表
try { $db->exec("CREATE TABLE IF NOT EXISTS `qd_admin_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `admin` VARCHAR(50) NOT NULL COMMENT '操作人',
    `action` VARCHAR(40) NOT NULL COMMENT '操作类型',
    `detail` TEXT DEFAULT NULL COMMENT '操作详情',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"); } catch (Exception $e) {}

// 记录管理员操作（谁在何时做了什么）
function logAdmin(PDO $db, string $action, string $detail = '') {
    $admin = $_SESSION['qd_admin'] ?? 'system';
    $stmt = $db->prepare('INSERT INTO qd_admin_log (admin, action, detail) VALUES (?, ?, ?)');
    $stmt->execute([$admin, $action, $detail]);
}

$action = $_GET['_a'] ?? '';

// ====== 登录 ======
if (isset($_POST['logout'])) { session_destroy(); header('Location: ' . $_SERVER['PHP_SELF']); exit; }
$loggedIn = isset($_SESSION['qd_admin']);
$_SESSION['qd_login_fails'] = $_SESSION['qd_login_fails'] ?? 0;
$_SESSION['qd_login_lock']  = $_SESSION['qd_login_lock']  ?? 0;

// 失败次数达阈值时确保已生成验证码算式（供登录页渲染）
if ($_SESSION['qd_login_fails'] >= 3 && empty($_SESSION['qd_captcha_q'])) {
    $ca = mt_rand(1, 9); $cb = mt_rand(1, 9);
    $_SESSION['qd_captcha'] = $ca + $cb;
    $_SESSION['qd_captcha_q'] = $ca . ' + ' . $cb;
}

if (!$loggedIn && isset($_POST['username']) && isset($_POST['password'])) {
    $lockUntil = $_SESSION['qd_login_lock'];
    if ($lockUntil > time()) {
        $error = '登录尝试过于频繁，请于 ' . ceil(($lockUntil - time()) / 60) . ' 分钟后重试';
    } else {
        $needCaptcha = $_SESSION['qd_login_fails'] >= 3;
        $captchaOk = true;
        if ($needCaptcha) {
            $cap = $_POST['captcha'] ?? null;
            $captchaOk = $cap !== null && intval($cap) === intval($_SESSION['qd_captcha'] ?? -1);
            if (!$captchaOk) {
                $error = '验证码错误，请重新输入';
                $_SESSION['qd_login_fails']++;
                if ($_SESSION['qd_login_fails'] >= 6) $_SESSION['qd_login_lock'] = time() + 900;
                $ca = mt_rand(1, 9); $cb = mt_rand(1, 9);
                $_SESSION['qd_captcha'] = $ca + $cb;
                $_SESSION['qd_captcha_q'] = $ca . ' + ' . $cb;
            }
        }
        if ($captchaOk) {
            $stmt = $db->prepare('SELECT id, username, password FROM qd_admins WHERE username = ?');
            $stmt->execute([$_POST['username']]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($admin && password_verify($_POST['password'], $admin['password'])) {
                $_SESSION['qd_admin'] = $admin['username'];
                $_SESSION['qd_admin_id'] = $admin['id'];
                $_SESSION['qd_login_fails'] = 0;
                $_SESSION['qd_login_lock'] = 0;
                unset($_SESSION['qd_captcha'], $_SESSION['qd_captcha_q']);
                $loggedIn = true;
            } else {
                $error = '账号或密码错误';
                $_SESSION['qd_login_fails']++;
                if ($_SESSION['qd_login_fails'] >= 6) $_SESSION['qd_login_lock'] = time() + 900;
                if ($_SESSION['qd_login_fails'] >= 3) {
                    $ca = mt_rand(1, 9); $cb = mt_rand(1, 9);
                    $_SESSION['qd_captcha'] = $ca + $cb;
                    $_SESSION['qd_captcha_q'] = $ca . ' + ' . $cb;
                }
            }
        }
    }
}

// ====== 操作 ======
$msg = '';
if ($loggedIn && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (($input = json_decode(file_get_contents('php://input'), true)) || $_POST['action'] ?? '') {
        $act = $input['action'] ?? $_POST['action'] ?? '';
        if ($act === 'activate') {
            $uid = intval($input['user_id'] ?? $_POST['user_id'] ?? 0);
            $plan = $input['plan'] ?? $_POST['plan'] ?? 'lifetime';
            $daysMap = ['monthly' => 30, 'yearly' => 365, 'lifetime' => null];
            if (!array_key_exists($plan, $daysMap)) { echo json_encode(['code' => 400, 'msg' => '套餐无效']); exit; }
            $days = $daysMap[$plan];
            if ($days === null) {
                $expire = null;
            } else {
                // 关键：已拥有有效 Pro 时，在现有到期时间上累加，绝不从“现在”覆盖
                $stmt = $db->prepare('SELECT expire_at FROM qd_subscriptions WHERE user_id = ?');
                $stmt->execute([$uid]);
                $sub = $stmt->fetch(PDO::FETCH_ASSOC);
                $base = ($sub && $sub['expire_at'] && strtotime($sub['expire_at']) > time())
                    ? $sub['expire_at'] : date('Y-m-d H:i:s');
                $expire = date('Y-m-d H:i:s', strtotime($base . " +{$days} days"));
            }
            $noteType = $input['note_type'] ?? 'other';
            $note = trim($input['note'] ?? '');
            $sendEmail = !empty($input['send_email']);
            // 创建 manual 订单（开通记录，用户端可见）
            $orderNo = 'MANUAL' . date('YmdHis') . mt_rand(1000, 9999);
            $stmt = $db->prepare('INSERT INTO qd_orders (order_no, user_id, plan, amount, pay_method, status, pay_time, note_type, note) VALUES (?,?,?,0,"manual",1,NOW(),?,?)');
            $stmt->execute([$orderNo, $uid, $plan, $noteType, $note]);
            $orderId = $db->lastInsertId();
            // 累加式开通：已拥有有效 Pro 时在其到期时间上续接，避免覆盖已有时长
            $stmt = $db->prepare('INSERT INTO qd_subscriptions (user_id, plan, start_at, expire_at, order_id) VALUES (?, ?, NOW(), ?, ?) ON DUPLICATE KEY UPDATE plan=?, expire_at=?, order_id=?, updated_at=NOW()');
            $stmt->execute([$uid, $plan, $expire, $orderId, $plan, $expire, $orderId]);
            // 邮件通知
            $emailMsg = '';
            if ($sendEmail) {
                $u = q1($db, 'SELECT email, username FROM qd_users WHERE id = ?', [$uid]);
                if ($u && !empty($u['email'])) {
                    [$sent, $err] = sendProMail($u['email'], 'activate', [
                        'username' => $u['username'], 'start' => date('Y-m-d H:i:s'), 'expire' => $expire,
                        'note_type' => $noteType, 'note' => $note,
                    ]);
                    $emailMsg = $sent ? '；邮件已发送' : '；邮件发送失败：' . $err;
                } else {
                    $emailMsg = '；用户未绑定邮箱，未发送';
                }
            }
            logAdmin($db, 'activate', "开通/续费 用户#{$uid} {$plan}" . ($note ? " 备注:{$note}" : '') . $emailMsg);
            echo json_encode(['code' => 200, 'msg' => "用户 #{$uid} 已开通 " . planName($plan) . ($note ? "（备注：{$note}）" : '') . $emailMsg]);
            exit;
        }
        if ($act === 'reset_user_password') {
            $uid = intval($input['user_id'] ?? $_POST['user_id'] ?? 0);
            $newPwd = $input['new_password'] ?? '';
            if ($uid && strlen($newPwd) >= 6) {
                $db->prepare('UPDATE qd_users SET password = ? WHERE id = ?')
                   ->execute([password_hash($newPwd, PASSWORD_DEFAULT), $uid]);
                $msg = "用户 #{$uid} 密码已重置";
                logAdmin($db, 'reset_pwd', "用户#{$uid}");
            } else $msg = '密码至少6位';
        }
        if ($act === 'ban') {
            $uid = intval($input['user_id'] ?? $_POST['user_id'] ?? 0);
            if ($uid) { $db->prepare('UPDATE qd_users SET banned = 1 WHERE id = ?')->execute([$uid]); $msg = "用户 #{$uid} 已封禁"; logAdmin($db, 'ban', "用户#{$uid}"); }
        }
        if ($act === 'unban') {
            $uid = intval($input['user_id'] ?? $_POST['user_id'] ?? 0);
            if ($uid) { $db->prepare('UPDATE qd_users SET banned = 0 WHERE id = ?')->execute([$uid]); $msg = "用户 #{$uid} 已解封"; logAdmin($db, 'unban', "用户#{$uid}"); }
        }
        if ($act === 'cancel_pro') {
            $uid = intval($input['user_id'] ?? $_POST['user_id'] ?? 0);
            if ($uid) { $db->prepare('UPDATE qd_subscriptions SET plan = "free", expire_at = NOW() WHERE user_id = ?')->execute([$uid]); $msg = "用户 #{$uid} Pro 已取消"; logAdmin($db, 'cancel_pro', "用户#{$uid}"); }
        }
        if ($act === 'change_password') {
            $new = $input['new_password'] ?? '';
            if (strlen($new) >= 6) {
                $hash = password_hash($new, PASSWORD_DEFAULT);
                $db->prepare('UPDATE qd_admins SET password = ? WHERE id = ?')->execute([$hash, $_SESSION['qd_admin_id']]);
                $msg = '密码已修改';
                logAdmin($db, 'change_pwd');
            } else $msg = '密码至少6位';
        }
        // ====== 删除订单 ======
        if ($act === 'delete_order') {
            $oid = intval($input['order_id'] ?? $_POST['order_id'] ?? 0);
            if (!$oid) { echo json_encode(['code' => 400, 'msg' => '参数错误']); exit; }
            $db->prepare('DELETE FROM qd_orders WHERE id = ?')->execute([$oid]);
            logAdmin($db, 'delete_order', "订单#{$oid}");
            echo json_encode(['code' => 200, 'msg' => "订单 #{$oid} 已删除"]);
            exit;
        }
        // ====== 手动续费（自定义时长 + 备注 + 邮件） ======
        if ($act === 'manual_renew') {
            $uid = intval($input['user_id'] ?? $_POST['user_id'] ?? 0);
            if ($uid === 0) {
                $uname = trim($input['username'] ?? $_POST['username'] ?? '');
                if ($uname) {
                    $stmt = $db->prepare('SELECT id FROM qd_users WHERE username = ?');
                    $stmt->execute([$uname]);
                    $urow = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($urow) $uid = (int)$urow['id'];
                }
            }
            if (!$uid) { echo json_encode(['code' => 400, 'msg' => '用户不存在']); exit; }
            $lifetime = !empty($input['lifetime']);
            $duration = intval($input['duration'] ?? 0);
            $unit = $input['unit'] ?? 'month';
            $amount = floatval($input['amount'] ?? 0);
            $noteType = $input['note_type'] ?? 'other';
            $note = trim($input['note'] ?? '');
            $sendEmail = !empty($input['send_email']);
            if ($lifetime) {
                $days = null; $planLabel = '终身';
            } else {
                if ($duration < 1) { echo json_encode(['code' => 400, 'msg' => '续费时长至少为 1']); exit; }
                $factor = $unit === 'day' ? 1 : ($unit === 'year' ? 365 : 30);
                $days = $duration * $factor;
                $unitCn = $unit === 'day' ? '天' : ($unit === 'year' ? '年' : '个月');
                $planLabel = $duration . $unitCn;
            }
            $stmt = $db->prepare('SELECT plan, expire_at FROM qd_subscriptions WHERE user_id = ?');
            $stmt->execute([$uid]);
            $sub = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($days === null) {
                $expire = null;
            } else {
                $base = ($sub && $sub['expire_at'] && strtotime($sub['expire_at']) > time())
                    ? $sub['expire_at'] : date('Y-m-d H:i:s');
                $expire = date('Y-m-d H:i:s', strtotime($base . " +{$days} days"));
            }
            // 续费只延长到期时间，保留用户原有套餐类型（月度/年度/终身）；
            // 仅当用户原本为免费时，才用本次续费时长作为套餐名。
            $subPlan = $lifetime ? 'lifetime'
                : (($sub && !empty($sub['plan']) && $sub['plan'] !== 'free') ? $sub['plan'] : $planLabel);
            $orderNo = 'MANUAL' . date('YmdHis') . mt_rand(1000, 9999);
            $stmt = $db->prepare('INSERT INTO qd_orders (order_no, user_id, plan, amount, pay_method, status, pay_time, note_type, note) VALUES (?,?,?,?,"manual",1,NOW(),?,?)');
            $stmt->execute([$orderNo, $uid, $planLabel, $amount, $noteType, $note]);
            $orderId = $db->lastInsertId();
            $stmt = $db->prepare('INSERT INTO qd_subscriptions (user_id, plan, start_at, expire_at, order_id) VALUES (?,?,NOW(),?,?) ON DUPLICATE KEY UPDATE plan=?, expire_at=?, order_id=?, updated_at=NOW()');
            $stmt->execute([$uid, $subPlan, $expire, $orderId, $subPlan, $expire, $orderId]);
            $emailMsg = '';
            if ($sendEmail) {
                $u = q1($db, 'SELECT email, username FROM qd_users WHERE id = ?', [$uid]);
                if ($u && !empty($u['email'])) {
                    [$sent, $err] = sendProMail($u['email'], 'renew', [
                        'username' => $u['username'], 'start' => date('Y-m-d H:i:s'), 'expire' => $expire,
                        'note_type' => $noteType, 'note' => $note,
                    ]);
                    $emailMsg = $sent ? '；邮件已发送' : '；邮件发送失败：' . $err;
                } else {
                    $emailMsg = '；用户未绑定邮箱，未发送';
                }
            }
            echo json_encode(['code' => 200, 'msg' => "用户 #{$uid} 已续费 {$planLabel}" . ($note ? "（备注：{$note}）" : '') . $emailMsg]);
            exit;
        }
        // ====== 手动确认支付（可选是否同步开通） ======
        if ($act === 'confirm_payment') {
            $oid = intval($input['order_id'] ?? $_POST['order_id'] ?? 0);
            $activate = !empty($input['activate']);   // 管理员选择：是否同步开通
            if (!$oid) { echo json_encode(['code' => 400, 'msg' => '参数错误']); exit; }
            $stmt = $db->prepare('SELECT id, user_id, plan FROM qd_orders WHERE id = ? AND status = 0');
            $stmt->execute([$oid]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$order) { echo json_encode(['code' => 400, 'msg' => '订单不存在或已支付']); exit; }
            // 是否已拥有有效订阅（避免管理员先手动开通、再补确认支付时重复开通）
            $stmt = $db->prepare('SELECT expire_at FROM qd_subscriptions WHERE user_id = ?');
            $stmt->execute([$order['user_id']]);
            $sub = $stmt->fetch(PDO::FETCH_ASSOC);
            $alreadyActive = $sub && ($sub['expire_at'] === null || strtotime($sub['expire_at']) > time());
            // 标记订单为已支付
            $stmt = $db->prepare('UPDATE qd_orders SET status = 1, pay_time = NOW(), note_type="confirm", note="管理员手动确认收款" WHERE id = ?');
            $stmt->execute([$oid]);
            if (!$activate) {
                logAdmin($db, 'confirm_payment', "订单#{$oid} 仅标记收款");
                echo json_encode(['code' => 200, 'msg' => "订单 #{$oid} 已确认收款（仅标记，未开通订阅）"]);
                exit;
            }
            if ($alreadyActive) {
                logAdmin($db, 'confirm_payment', "订单#{$oid} 已激活未重复开通");
                echo json_encode(['code' => 200, 'msg' => "订单 #{$oid} 已确认收款；该用户已拥有有效 Pro 订阅，未重复开通"]);
                exit;
            }
            $cfg = ['monthly'=>['days'=>30],'yearly'=>['days'=>365],'annual'=>['days'=>365],'lifetime'=>['days'=>null]][$order['plan']] ?? ['days'=>null];
            $expireAt = $cfg['days'] ? date('Y-m-d H:i:s', strtotime("+{$cfg['days']} days")) : null;
            $stmt = $db->prepare('INSERT INTO qd_subscriptions (user_id, plan, start_at, expire_at, order_id) VALUES (?, ?, NOW(), ?, ?) ON DUPLICATE KEY UPDATE plan=?, expire_at=?, order_id=?, updated_at=NOW()');
            $stmt->execute([$order['user_id'], $order['plan'], $expireAt, $oid, $order['plan'], $expireAt, $oid]);
            logAdmin($db, 'confirm_payment', "订单#{$oid} 开通Pro" . ($expireAt ? " 至{$expireAt}" : ' 终身'));
            echo json_encode(['code' => 200, 'msg' => "订单 #{$oid} 已确认收款，已为用户开通 Pro（" . ($expireAt ? '到期 ' . $expireAt : '终身') . "）"]);
            exit;
        }
    }
}

// ====== 查询 ======
function q(PDO $db, string $sql, array $p = []): array {
    $s = $db->prepare($sql); $s->execute($p); return $s->fetchAll(PDO::FETCH_ASSOC);
}
function q1(PDO $db, string $sql, array $p = []): array {
    $s = $db->prepare($sql); $s->execute($p); return $s->fetch(PDO::FETCH_ASSOC) ?: [];
}

$stats = $users = $orders = [];
if ($loggedIn) {
    $stats = [
        'users' => q1($db, 'SELECT COUNT(*) as n FROM qd_users')['n'] ?? 0,
        'todayOrders' => q1($db, 'SELECT COUNT(*) as n, COALESCE(SUM(amount),0) as r FROM qd_orders WHERE DATE(created_at)=CURDATE() AND status=1'),
        'monthRevenue' => q1($db, 'SELECT COALESCE(SUM(amount),0) as r FROM qd_orders WHERE YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE()) AND status=1')['r'] ?? 0,
        'proUsers' => q1($db, "SELECT COUNT(*) as n FROM qd_subscriptions WHERE expire_at IS NULL OR expire_at > NOW()")['n'] ?? 0,
    ];
    $search = trim($_GET['s'] ?? '');
    $stFilter = $_GET['st'] ?? 'all';
    $subFilter = $_GET['sub'] ?? 'all';
    $page = max(1, intval($_GET['p'] ?? 1));
    $limit = 20;
    $offset = ($page - 1) * $limit;
    $conds = []; $params = [];
    if ($search !== '') { $conds[] = '(u.username LIKE ? OR u.email LIKE ?)'; $params[] = "%{$search}%"; $params[] = "%{$search}%"; }
    if ($stFilter === 'banned') { $conds[] = 'u.banned = 1'; }
    elseif ($stFilter === 'normal') { $conds[] = 'u.banned = 0'; }
    if ($subFilter === 'pro') { $conds[] = "(s.plan IS NOT NULL AND s.plan <> 'free' AND (s.expire_at IS NULL OR s.expire_at > NOW()))"; }
    elseif ($subFilter === 'free') { $conds[] = "(s.plan IS NULL OR s.plan = 'free' OR s.expire_at <= NOW())"; }
    $where = $conds ? ('WHERE ' . implode(' AND ', $conds)) : '';
    $users = q($db, "SELECT u.id, u.username, u.email, u.email_verified, u.banned, u.created_at, s.plan, s.expire_at FROM qd_users u LEFT JOIN qd_subscriptions s ON u.id=s.user_id {$where} ORDER BY u.id DESC LIMIT {$limit} OFFSET {$offset}", $params);
    $userTotal = q1($db, "SELECT COUNT(*) as n FROM qd_users u LEFT JOIN qd_subscriptions s ON u.id=s.user_id {$where}", $params)['n'] ?? 0;
    $orderFilter = $_GET['of'] ?? 'all';
    $orderPlan = $_GET['opl'] ?? '';
    $orderConds = [];
    $orderParams = [];
    if ($orderFilter === 'pending') { $orderConds[] = 'o.status = 0'; }
    elseif ($orderFilter === 'paid') { $orderConds[] = 'o.status = 1'; }
    if ($orderPlan) { $orderConds[] = 'o.plan = ?'; $orderParams[] = $orderPlan; }
    $ofWhere = $orderConds ? ('WHERE ' . implode(' AND ', $orderConds)) : '';
    $orderPage = max(1, intval($_GET['op'] ?? 1));
    $orderLimit = 30;
    $orderOffset = ($orderPage - 1) * $orderLimit;
    $orderTotal = q1($db, "SELECT COUNT(*) as n FROM qd_orders o {$ofWhere}", $orderParams)['n'] ?? 0;
    $orders = q($db, "SELECT o.*, u.username, s.plan AS sub_plan, s.expire_at AS sub_expire FROM qd_orders o LEFT JOIN qd_users u ON o.user_id=u.id LEFT JOIN qd_subscriptions s ON o.user_id=s.user_id {$ofWhere} ORDER BY o.id DESC LIMIT {$orderLimit} OFFSET {$orderOffset}", $orderParams);

    // 同步记录（30/页）
    $syncPage = max(1, intval($_GET['sp'] ?? 1));
    $syncLimit = 30;
    $syncOffset = ($syncPage - 1) * $syncLimit;
    $syncTotal = q1($db, "SELECT COUNT(*) as n FROM qd_sync_log")['n'] ?? 0;
    $syncLog = q($db, "SELECT l.*, u.username FROM qd_sync_log l LEFT JOIN qd_users u ON l.user_id = u.id ORDER BY l.id DESC LIMIT {$syncLimit} OFFSET {$syncOffset}");

    // ===== 审计日志（管理操作追溯，数据来自 logAdmin 写入的 qd_admin_log）=====
    $logPage = max(1, intval($_GET['lp'] ?? 1));
    $logLimit = 30;
    $logOffset = ($logPage - 1) * $logLimit;
    $logAct = trim($_GET['la'] ?? '');
    $logAdmin = trim($_GET['lad'] ?? '');
    $logFrom = trim($_GET['lf'] ?? '');
    $logTo = trim($_GET['lt'] ?? '');
    $logConds = [];
    $logParams = [];
    if ($logAct) { $logConds[] = 'action = ?'; $logParams[] = $logAct; }
    if ($logAdmin) { $logConds[] = 'admin LIKE ?'; $logParams[] = "%{$logAdmin}%"; }
    if ($logFrom) { $logConds[] = 'DATE(created_at) >= ?'; $logParams[] = $logFrom; }
    if ($logTo) { $logConds[] = 'DATE(created_at) <= ?'; $logParams[] = $logTo; }
    $logWhere = $logConds ? 'WHERE ' . implode(' AND ', $logConds) : '';
    $logTotal = q1($db, "SELECT COUNT(*) as n FROM qd_admin_log {$logWhere}", $logParams)['n'] ?? 0;
    $adminLogs = q($db, "SELECT * FROM qd_admin_log {$logWhere} ORDER BY id DESC LIMIT {$logLimit} OFFSET {$logOffset}", $logParams);
    $logQs = ($logAct ? '&la='.urlencode($logAct) : '') . ($logAdmin ? '&lad='.urlencode($logAdmin) : '') . ($logFrom ? '&lf='.urlencode($logFrom) : '') . ($logTo ? '&lt='.urlencode($logTo) : '');

    // ===== 访问统计（基于 qd_users + qd_sync_log 派生，零新增埋点）=====
    $vTodayNew = q1($db, "SELECT COUNT(*) as n FROM qd_users WHERE DATE(created_at)=CURDATE()")['n'] ?? 0;
    $vDau7     = q1($db, "SELECT COALESCE(AVG(c),0) v FROM (SELECT COUNT(DISTINCT user_id) c FROM qd_sync_log WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(created_at)) t")['v'] ?? 0;
    $vTotal    = $stats['users'];
    $vProPct   = $vTotal ? round($stats['proUsers'] / $vTotal * 100, 1) : 0;
    // 近30天序列（新增用户 / 活跃用户=当日去重同步用户）
    $vNewMap = []; foreach (q($db, "SELECT DATE(created_at) d, COUNT(*) c FROM qd_users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) GROUP BY DATE(created_at)") as $r) $vNewMap[$r['d']] = (int)$r['c'];
    $vActMap = []; foreach (q($db, "SELECT DATE(created_at) d, COUNT(DISTINCT user_id) c FROM qd_sync_log WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) GROUP BY DATE(created_at)") as $r) $vActMap[$r['d']] = (int)$r['c'];
    $vDays = []; for ($i = 29; $i >= 0; $i--) { $d = date('Y-m-d', strtotime("-{$i} days")); $vDays[] = ['d' => $d, 'new' => $vNewMap[$d] ?? 0, 'act' => $vActMap[$d] ?? 0]; }
    // 趋势图 SVG 几何
    $vCw = 760; $vCh = 220; $vPadL = 40; $vPadR = 16; $vPadT = 16; $vPadB = 28;
    $vMax = 1; foreach ($vDays as $p) $vMax = max($vMax, $p['new'], $p['act']);
    $vPlotW = $vCw - $vPadL - $vPadR; $vPlotH = $vCh - $vPadT - $vPadB;
    $vNewPts = []; $vActPts = [];
    foreach ($vDays as $i => $p) {
      $x = $vPadL + ($i * $vPlotW / 29);
      $vNewPts[] = round($x, 1) . ',' . round($vPadT + $vPlotH * (1 - $p['new'] / $vMax), 1);
      $vActPts[] = round($x, 1) . ',' . round($vPadT + $vPlotH * (1 - $p['act'] / $vMax), 1);
    }
    $vNewPoly = implode(' ', $vNewPts); $vActPoly = implode(' ', $vActPts);
    // 各端分布（按同步次数）
    $vPlatRows = q($db, "SELECT platform, COUNT(*) c FROM qd_sync_log GROUP BY platform");
    $vPlatTotal = 0; foreach ($vPlatRows as $r) $vPlatTotal += (int)$r['c'];
    $vPlatTotal = $vPlatTotal ?: 1;
    $vPlatLabel = ['web' => 'Web端', 'extension' => '扩展端', 'plugin' => '插件端', 'fnos' => '飞牛端'];
    // Top 活跃用户
    $vTop = q($db, "SELECT l.user_id, u.username, COUNT(*) c FROM qd_sync_log l LEFT JOIN qd_users u ON l.user_id=u.id GROUP BY l.user_id ORDER BY c DESC LIMIT 10");
}

function e($s) { echo htmlspecialchars((string)$s, ENT_QUOTES); }
function isPro($u): bool { return $u['plan'] && $u['plan'] !== 'free' && ($u['expire_at'] === null || strtotime($u['expire_at']) > time()); }
function planName($p) { return ['monthly'=>'月度','yearly'=>'年度','lifetime'=>'终身','manual'=>'手动','free'=>'免费'][$p] ?? $p; }
function statusBadge($s) { return $s ? '<span class="badge badge-green">已支付</span>' : '<span class="badge badge-gray">待支付</span>'; }
?><!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/png" href="/js.png">
<title>Quick Dial 管理后台</title>
<style>
  :root {
    --bg: #0b1020;
    --panel: rgba(255,255,255,0.045);
    --panel2: rgba(255,255,255,0.025);
    --border: rgba(255,255,255,0.09);
    --border2: rgba(255,255,255,0.06);
    --text: #e7ecf5;
    --text2: rgba(231,236,245,0.55);
    --text3: rgba(231,236,245,0.38);
    --accent: #4f8fff;        /* 呲啦蓝 */
    --accent2: #38bdf8;       /* 青蓝 */
    --green: #22c55e;
    --red: #ef4444;
    --amber: #f59e0b;
    --purple: #a855f7;
    --radius: 16px;
    --shadow: 0 10px 30px rgba(0,0,0,0.35);
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text); display: flex; min-height: 100vh;
    background:
      radial-gradient(1200px 600px at 82% -12%, rgba(79,143,255,0.12), transparent 60%),
      radial-gradient(900px 520px at -8% 112%, rgba(56,189,248,0.09), transparent 55%),
      var(--bg);
  }

  /* ===== Sidebar ===== */
  .sidebar { width: 244px; background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015)); border-right: 1px solid var(--border); padding: 26px 0; flex-shrink: 0; display: flex; flex-direction: column; }
  .sidebar-logo { padding: 0 24px 24px; font-weight: 800; font-size: 18px; letter-spacing: .2px; background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; background-clip: text; color: transparent; border-bottom: 1px solid var(--border); margin-bottom: 14px; }
  .sidebar-logo span { font-size: 10px; display: block; color: var(--text3); font-weight: 600; letter-spacing: 2px; -webkit-text-fill-color: var(--text3); }
  .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 0 14px; }
  .sidebar-nav a { display: flex; align-items: center; gap: 12px; padding: 11px 16px; font-size: 13px; font-weight: 600; color: var(--text2); text-decoration: none; border-radius: 11px; transition: all .15s; }
  .sidebar-nav a:hover { color: var(--text); background: rgba(255,255,255,0.04); }
  .sidebar-nav a.active { color: #fff; background: linear-gradient(135deg, rgba(79,143,255,0.22), rgba(56,189,248,0.14)); box-shadow: inset 0 0 0 1px rgba(79,143,255,0.35); }
  .sidebar-nav .icon { font-size: 16px; width: 22px; text-align: center; }
  .sidebar-footer { padding: 16px 20px 0; border-top: 1px solid var(--border); margin-top: 8px; }
  .sidebar-user { font-size: 12px; color: var(--text2); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .sidebar-user::before { content: '👤'; }
  .btn-logout { display: block; width: 100%; padding: 9px 0; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: linear-gradient(135deg, rgba(239,68,68,0.18), rgba(220,38,38,0.1)); color: var(--red); transition: all .2s; }
  .btn-logout:hover { background: linear-gradient(135deg, rgba(239,68,68,0.3), rgba(220,38,38,0.16)); }

  /* ===== Main ===== */
  .main { flex: 1; overflow-y: auto; padding: 30px 36px 48px; }
  .page-title { font-size: 25px; font-weight: 800; margin-bottom: 6px; letter-spacing: -.3px; }
  .page-sub { font-size: 13px; color: var(--text2); margin-bottom: 28px; }

  /* ===== Stats ===== */
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 34px; }
  .stat { position: relative; background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 22px 22px 20px; overflow: hidden; transition: transform .2s, border-color .2s, box-shadow .2s; }
  .stat:hover { transform: translateY(-3px); border-color: rgba(79,143,255,0.45); box-shadow: var(--shadow); }
  .stat::before { content:''; position:absolute; left:0; top:0; width:100%; height:3px; background: linear-gradient(90deg, var(--accent), var(--accent2)); opacity:.9; }
  .stat-icon { width: 44px; height: 44px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 21px; background: rgba(79,143,255,0.16); margin-bottom: 14px; }
  .stat:nth-child(2) .stat-icon { background: rgba(168,85,247,0.16); }
  .stat:nth-child(3) .stat-icon { background: rgba(245,158,11,0.16); }
  .stat:nth-child(4) .stat-icon { background: rgba(34,197,94,0.16); }
  .stat-label { font-size: 12px; color: var(--text2); letter-spacing: .3px; }
  .stat-value { font-size: 31px; font-weight: 800; letter-spacing: -1px; margin-top: 2px; }
  .stat-sub { font-size: 12px; color: var(--text2); margin-top: 4px; }

  /* ===== Card ===== */
  .card { background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 22px; box-shadow: var(--shadow); }
  .card-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; }

  /* ===== Table ===== */
  .search-row { display: flex; gap: 8px; margin-bottom: 18px; }
  .search-input { flex: 1; padding: 11px 15px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 11px; color: var(--text); font-size: 13px; outline: none; transition: border-color .15s, box-shadow .15s; color-scheme: dark; }
  .search-input option { background: #1f2937; color: #e7ecf5; }
  .search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,143,255,0.16); }
  .table-wrap { overflow-x: auto; border-radius: 12px; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; min-width: 760px; }
  thead th { text-align: left; padding: 13px 15px; color: var(--text3); font-weight: 600; font-size: 11px; letter-spacing: .7px; text-transform: uppercase; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.02); }
  tbody td { padding: 14px 15px; border-bottom: 1px solid var(--border2); vertical-align: middle; }
  tbody tr { transition: background .15s; }
  tbody tr:hover td { background: rgba(79,143,255,0.06); }
  tbody tr:hover td:first-child { box-shadow: inset 3px 0 0 var(--accent); }
  .mono { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; color: var(--text2); }
  .break { word-break: break-all; }

  /* ===== Badges / Pills ===== */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 11px; border-radius: 999px; font-size: 11px; font-weight: 600; white-space: nowrap; }
  .badge-green { background: rgba(34,197,94,0.14); color: var(--green); }
  .badge-purple { background: rgba(168,85,247,0.14); color: var(--purple); }
  .badge-blue { background: rgba(79,143,255,0.16); color: var(--accent); }
  .badge-gray { background: rgba(255,255,255,0.06); color: var(--text2); }
  .badge-red { background: rgba(239,68,68,0.14); color: var(--red); }

  /* ===== Buttons ===== */
  .btn { display: inline-flex; align-items: center; gap: 5px; padding: 9px 15px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; transition: all .15s; white-space: nowrap; }
  .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; box-shadow: 0 6px 16px rgba(79,143,255,0.3); }
  .btn-primary:hover { filter: brightness(1.06); transform: translateY(-1px); }
  .btn-outline { background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--text); }
  .btn-outline:hover { background: rgba(255,255,255,0.07); border-color: rgba(79,143,255,0.4); }
  .btn-green { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; box-shadow: 0 6px 16px rgba(34,197,94,0.25); }
  .btn-green:hover { filter: brightness(1.06); transform: translateY(-1px); }
  .btn-xs { padding: 5px 10px; font-size: 11px; border-radius: 8px; }

  .act-group { display: flex; gap: 6px; flex-wrap: wrap; }

  /* ===== Avatar ===== */
  .avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; margin-right: 9px; vertical-align: middle; }

  /* ===== Pagination ===== */
  .pagination { display: flex; gap: 8px; justify-content: center; margin-top: 20px; flex-wrap: wrap; }
  .pagination a { min-width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none; border: 1px solid var(--border); color: var(--text2); background: rgba(255,255,255,0.02); transition: .15s; }
  .pagination a:hover:not(.active) { background: rgba(79,143,255,0.1); color: var(--text); border-color: rgba(79,143,255,0.35); }
  .pagination a.active { background: linear-gradient(135deg, var(--accent), var(--accent2)); border-color: transparent; color: #fff; box-shadow: 0 6px 16px rgba(79,143,255,0.3); }
  .pagination .page-nav { font-size: 16px; }

  .msg { background: rgba(34,197,94,0.1); color: var(--green); padding: 11px 16px; border-radius: 11px; margin-bottom: 18px; font-size: 13px; }

  /* ===== Forms ===== */
  .form-group { margin-bottom: 15px; }
  .form-label { font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--text2); display: block; }
  .form-input { width: 100%; padding: 11px 15px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 12px; color: var(--text); font-size: 13px; outline: none; transition: border-color .15s, box-shadow .15s; color-scheme: dark; }
  .form-input option { background: #1f2937; color: #e7ecf5; }
  .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,143,255,0.18); }

  /* ===== Filter tabs ===== */
  .filter-tabs { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
  .filter-tab { padding: 8px 18px; border-radius: 999px; font-size: 12px; font-weight: 600; text-decoration: none; border: 1px solid var(--border); color: var(--text2); transition: all .15s; }
  .filter-tab:hover { background: rgba(255,255,255,0.05); color: var(--text); }
  .filter-tab.active { background: linear-gradient(135deg, var(--accent), var(--accent2)); border-color: transparent; color: #fff; box-shadow: 0 6px 16px rgba(79,143,255,0.25); }

  /* ===== Note chip ===== */
  .note-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 11px; border-radius: 999px; font-size: 11px; font-weight: 600; margin-bottom: 4px; }
  .note-chip.gift { background: rgba(168,85,247,0.16); color: var(--purple); }
  .note-chip.compensation { background: rgba(245,158,11,0.16); color: var(--amber); }
  .note-chip.confirm { background: rgba(34,197,94,0.16); color: var(--green); }
  .note-chip.other { background: rgba(255,255,255,0.07); color: var(--text2); }
  .note-text { font-size: 12px; color: var(--text2); white-space: pre-wrap; line-height: 1.5; }

  /* ===== Modal ===== */
  .modal-mask { position: fixed; inset: 0; background: rgba(4,8,18,0.66); backdrop-filter: blur(6px); display: none; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
  .modal-mask.show { display: flex; }
  .modal { width: 100%; max-width: 460px; background: linear-gradient(180deg, #111829, #0c1322); border: 1px solid var(--border); border-radius: 20px; padding: 28px; box-shadow: 0 30px 80px rgba(0,0,0,0.6); animation: pop .2s ease; }
  @keyframes pop { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal h3 { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
  .modal .modal-sub { font-size: 13px; color: var(--text2); margin-bottom: 20px; line-height: 1.5; }
  .modal textarea.form-input { resize: vertical; min-height: 74px; font-family: inherit; }
  .modal-actions { display: flex; gap: 10px; margin-top: 22px; }
  .modal-actions .btn { flex: 1; justify-content: center; padding: 12px; }

  /* ===== Toast ===== */
  .toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); padding: 13px 24px; border-radius: 14px; font-size: 13px; font-weight: 600; color: #fff; z-index: 200; display: none; box-shadow: 0 12px 30px rgba(0,0,0,0.45); }
  .toast.success { background: linear-gradient(135deg,#22c55e,#16a34a); }
  .toast.error { background: linear-gradient(135deg,#ef4444,#dc2626); }
  .toast.info { background: linear-gradient(135deg,#4f8fff,#38bdf8); }

  /* ===== Login ===== */
  .login-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; width: 100%; }
  .login-card { background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border: 1px solid var(--border); border-radius: 24px; padding: 50px 40px; width: 100%; max-width: 384px; text-align: center; box-shadow: var(--shadow); }
  .login-card h1 { font-size: 26px; font-weight: 800; margin-bottom: 4px; background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .login-card .sub { font-size: 13px; color: var(--text2); margin-bottom: 28px; }
  .login-card .form-input { margin-bottom: 13px; }
  .login-card .btn-primary { width: 100%; padding: 13px; }

  @media (max-width: 768px) {
    .sidebar { width: 64px; padding: 16px 0; }
    .sidebar-logo { font-size: 0; padding: 0 0 12px; text-align: center; }
    .sidebar-logo span { display: none; }
    .sidebar-nav { padding: 0 8px; }
    .sidebar-nav a { padding: 11px; justify-content: center; font-size: 0; }
    .sidebar-nav a .icon { margin: 0; font-size: 18px; }
    .sidebar-footer { display: none; }
    .main { padding: 20px 16px; }
    .stats { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>

<?php if (!$loggedIn): ?>
<div class="login-page">
  <div class="login-card">
    <h1>Quick Dial</h1>
    <div class="sub">管理后台</div>
    <form method="post">
      <input class="form-input" name="username" placeholder="管理员账号" autofocus />
      <input class="form-input" name="password" type="password" placeholder="管理员密码" />
      <?php if (($_SESSION['qd_login_fails'] ?? 0) >= 3): ?>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:13px;">
        <input class="form-input" style="margin-bottom:0;flex:1" name="captcha" placeholder="验证：<?= e($_SESSION['qd_captcha_q'] ?? '') ?> = ?" inputmode="numeric" autocomplete="off" />
      </div>
      <?php endif; ?>
      <button class="btn btn-primary">登录</button>
    </form>
    <?php if (isset($error)): ?><p style="color:var(--red);font-size:13px;margin-top:12px;"><?= e($error) ?></p><?php endif; ?>
  </div>
</div>

<?php else:
$tab = $_GET['tab'] ?? 'dashboard';
?>
<div class="sidebar">
  <div class="sidebar-logo">Quick Dial<span>管理后台</span></div>
  <div class="sidebar-nav">
    <a href="?tab=dashboard" class="<?= $tab==='dashboard'?'active':'' ?>"><span class="icon">📊</span> 仪表盘</a>
    <a href="?tab=users" class="<?= $tab==='users'?'active':'' ?>"><span class="icon">👥</span> 用户管理</a>
    <a href="?tab=orders" class="<?= $tab==='orders'?'active':'' ?>"><span class="icon">💰</span> 订单记录</a>
    <a href="?tab=sync" class="<?= $tab==='sync'?'active':'' ?>"><span class="icon">🔄</span> 同步记录</a>
    <a href="?tab=stats" class="<?= $tab==='stats'?'active':'' ?>"><span class="icon">📈</span> 访问统计</a>
    <a href="?tab=audit" class="<?= $tab==='audit'?'active':'' ?>"><span class="icon">🛡️</span> 审计日志</a>
    <a href="?tab=settings" class="<?= $tab==='settings'?'active':'' ?>"><span class="icon">⚙️</span> 设置</a>
  </div>
  <div class="sidebar-footer">
    <div class="sidebar-user"><?= e($_SESSION['qd_admin']) ?></div>
    <form method="post"><button name="logout" value="1" class="btn-logout">退出登录</button></form>
  </div>
</div>
<div class="main">
  <?php if ($msg): ?><div class="msg"><?= e($msg) ?></div><?php endif; ?>

  <?php if ($tab === 'dashboard'): ?>
    <div class="page-title">仪表盘</div>
    <div class="page-sub">Quick Dial 运行概览</div>
    <div class="stats">
      <div class="stat"><div class="stat-icon">👥</div><div class="stat-label">注册用户</div><div class="stat-value"><?= $stats['users'] ?></div></div>
      <div class="stat"><div class="stat-icon">⭐</div><div class="stat-label">Pro 用户</div><div class="stat-value"><?= $stats['proUsers'] ?></div></div>
      <div class="stat"><div class="stat-icon">💰</div><div class="stat-label">今日订单</div><div class="stat-value"><?= $stats['todayOrders']['n'] ?? 0 ?></div><div class="stat-sub">¥<?= number_format($stats['todayOrders']['r'] ?? 0, 2) ?></div></div>
      <div class="stat"><div class="stat-icon">📈</div><div class="stat-label">本月收入</div><div class="stat-value" style="color:var(--green)">¥<?= number_format($stats['monthRevenue'], 2) ?></div></div>
    </div>

  <?php elseif ($tab === 'users'): ?>
    <div class="page-title">用户管理</div>
    <div class="page-sub">共 <?= $userTotal ?> 位用户</div>
    <div class="card">
      <form class="search-row" method="get">
        <input type="hidden" name="tab" value="users">
        <input class="search-input" name="s" value="<?= e($search) ?>" placeholder="搜索用户名 / 邮箱..." />
        <select class="search-input" name="st" style="flex:0 0 auto;width:auto">
          <option value="all"<?= $stFilter==='all'?' selected':'' ?>>全部状态</option>
          <option value="normal"<?= $stFilter==='normal'?' selected':'' ?>>正常</option>
          <option value="banned"<?= $stFilter==='banned'?' selected':'' ?>>已封禁</option>
        </select>
        <select class="search-input" name="sub" style="flex:0 0 auto;width:auto">
          <option value="all"<?= $subFilter==='all'?' selected':'' ?>>全部订阅</option>
          <option value="pro"<?= $subFilter==='pro'?' selected':'' ?>>Pro 用户</option>
          <option value="free"<?= $subFilter==='free'?' selected':'' ?>>免费用户</option>
        </select>
        <button class="btn btn-primary">筛选</button>
        <?php if ($search !== '' || $stFilter !== 'all' || $subFilter !== 'all'): ?><a href="?tab=users" class="btn btn-outline">清除</a><?php endif; ?>
      </form>
      <table>
        <thead><tr><th>ID</th><th>用户名</th><th>状态</th><th>邮箱</th><th>注册</th><th>订阅</th><th>到期</th><th>操作</th></tr></thead>
        <tbody>
          <?php foreach ($users as $u): ?>
          <tr>
            <td><?= $u['id'] ?></td>
            <td><span class="avatar"><?= e(substr($u['username'], 0, 1)) ?></span><?= e($u['username']) ?> <?= $u['banned'] ? '<span class="badge badge-red">封禁</span>' : '' ?></td>
            <td>
              <form method="post" onsubmit="return handleQuickAct(event)" class="act-group" style="margin-bottom:4px;">
                <input type="hidden" name="action" value="<?= $u['banned'] ? 'unban' : 'ban' ?>">
                <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                <button class="btn btn-xs <?= $u['banned'] ? 'btn-green' : 'btn-outline' ?>"><?= $u['banned'] ? '解封' : '封禁' ?></button>
              </form>
            </td>
            <td style="font-size:12px;opacity:0.5;"><?= $u['email'] ? e($u['email']).($u['email_verified']?' ✅':'') : '-' ?></td>
            <td style="font-size:12px;opacity:0.5;"><?= substr($u['created_at'] ?? '', 0, 10) ?></td>
            <td><?php if (isPro($u)): ?><span class="badge <?= $u['plan']==='lifetime'?'badge-purple':'badge-blue' ?>"><?= planName($u['plan']) ?></span><?php else: ?><span class="badge badge-gray">免费</span><?php endif; ?></td>
            <td style="font-size:11px;opacity:0.5;">
              <?php $remain = (!empty($u['expire_at']) && $u['expire_at'] !== '0000-00-00 00:00:00') ? (int)ceil((strtotime($u['expire_at']) - time()) / 86400) : null; ?>
              <?= $u['expire_at'] ? substr($u['expire_at'],0,10) : ($u['plan']==='lifetime'?'永久':'-') ?><?php if ($remain !== null && $remain >= 0): ?> <span style="color:var(--accent);font-weight:600;">剩<?= $remain ?>天</span><?php endif; ?>
            </td>
            <td>
              <div class="act-group">
                <button type="button" class="btn btn-green btn-xs" onclick="openProModal('activate', <?= $u['id'] ?>, '<?= e($u['username']) ?>')">开通Pro</button>
                <button type="button" class="btn btn-outline btn-xs" onclick="openProModal('renew', <?= $u['id'] ?>, '<?= e($u['username']) ?>')">续费</button>
                <button type="button" class="btn btn-outline btn-xs" onclick="resetPwd(<?= $u['id'] ?>)">密码</button>
                <?php if (isPro($u)): ?>
                <button type="button" class="btn btn-outline btn-xs" style="color:var(--red);" onclick="if(confirm('确认取消用户 #<?= $u['id'] ?> <?= e($u['username']) ?> 的 Pro?')){cancelPro(<?= $u['id'] ?>)}">取消Pro</button>
                <?php endif; ?>
              </div>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
      <?php if ($userTotal > $limit): ?>
      <div class="pagination">
        <?php for ($i = 1; $i <= ceil($userTotal / $limit); $i++): ?>
          <a href="?tab=users&p=<?= $i ?><?= $search !== '' ? '&s='.urlencode($search) : '' ?><?= $stFilter!=='all' ? '&st='.urlencode($stFilter) : '' ?><?= $subFilter!=='all' ? '&sub='.urlencode($subFilter) : '' ?>" class="<?= $i === $page ? 'active' : '' ?>"><?= $i ?></a>
        <?php endfor; ?>
      </div>
      <?php endif; ?>
    </div>

  <?php elseif ($tab === 'orders'): ?>
    <div class="page-title">订单记录</div>
    <div class="page-sub">共 <?= $orderTotal ?> 笔<?= $orderTotal > $orderLimit ? '，第 ' . $orderPage . ' / ' . ceil($orderTotal / $orderLimit) . ' 页' : '' ?></div>
    <div class="filter-tabs">
      <a href="?tab=orders&of=all" class="filter-tab <?= $orderFilter==='all'?'active':'' ?>">全部</a>
      <a href="?tab=orders&of=pending" class="filter-tab <?= $orderFilter==='pending'?'active':'' ?>">待支付</a>
      <a href="?tab=orders&of=paid" class="filter-tab <?= $orderFilter==='paid'?'active':'' ?>">已支付</a>
    </div>
    <form method="get" class="search-row" style="margin-top:12px;">
      <input type="hidden" name="tab" value="orders">
      <input type="hidden" name="of" value="<?= e($orderFilter) ?>">
      <select name="opl" class="search-input" style="max-width:200px;" onchange="this.form.submit()">
        <option value="">全部套餐</option>
        <option value="monthly" <?= $orderPlan==='monthly'?'selected':'' ?>>月度</option>
        <option value="yearly" <?= $orderPlan==='yearly'?'selected':'' ?>>年度</option>
        <option value="lifetime" <?= $orderPlan==='lifetime'?'selected':'' ?>>终身</option>
        <option value="manual" <?= $orderPlan==='manual'?'selected':'' ?>>手动</option>
      </select>
      <?php if ($orderPlan): ?><a href="?tab=orders&of=<?= e($orderFilter) ?>" class="btn btn-outline">清除</a><?php endif; ?>
    </form>
    <div class="card">
      <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>订单号</th><th>用户</th><th>套餐</th><th>金额</th><th>方式</th><th>状态</th><th>备注</th><th>时间</th><th>操作</th></tr></thead>
        <tbody>
          <?php foreach ($orders as $o): ?>
          <tr>
            <td><?= $o['id'] ?></td>
            <td class="mono break"><?= e($o['order_no']) ?></td>
            <td><?= e($o['username'] ?? '-') ?></td>
            <td><span class="badge <?= $o['plan']==='lifetime'?'badge-purple':'badge-blue' ?>"><?= planName($o['plan']) ?></span></td>
            <td style="font-weight:600;">¥<?= number_format($o['amount'], 2) ?></td>
            <td><?= $o['pay_method'] === 'wechat' ? '💚' : ($o['pay_method'] === 'alipay' ? '💙' : (($o['pay_method']==='manual')?'🔧':'-')) ?></td>
            <td><?= statusBadge($o['status']) ?></td>
            <td style="max-width:200px;">
              <?php if (!empty($o['note_type']) || !empty($o['note'])): ?>
                <?php if (!empty($o['note_type'])): ?>
                  <?php $ntLabels = ['gift'=>'🎁 赠送','compensation'=>'🛠 补偿','confirm'=>'✅ 人工确认','other'=>'📝 其他']; ?>
                  <span class="note-chip <?= e($o['note_type']) ?>"><?= $ntLabels[$o['note_type']] ?? e($o['note_type']) ?></span><br>
                <?php endif; ?>
                <?php if (!empty($o['note'])): ?><span class="note-text"><?= e($o['note']) ?></span><?php endif; ?>
              <?php else: ?><span style="opacity:0.3;font-size:12px;">-</span><?php endif; ?>
            </td>
            <td style="font-size:11px;opacity:0.5;"><?= substr($o['created_at'] ?? '', 0, 16) ?></td>
            <td>
              <div class="act-group">
                <?php if ($o['status'] == 0): ?>
                <button class="btn btn-green btn-xs" onclick="confirmPay(<?= $o['id'] ?>, '<?= $o['sub_plan'] ?? '' ?>', '<?= $o['sub_expire'] ?? '' ?>')">确认支付</button>
                <?php endif; ?>
                <button class="btn btn-outline btn-xs" style="color:var(--red);border-color:rgba(239,68,68,0.25)" onclick="delOrder(<?= $o['id'] ?>)">删除</button>
              </div>
            </td>
          </tr>
          <?php endforeach; ?>
          <?php if (empty($orders)): ?><tr><td colspan="10" style="text-align:center;opacity:0.3;padding:40px;">暂无订单</td></tr><?php endif; ?>
        </tbody>
      </table>
      </div>
    </div>

      <?php if ($orderTotal > $orderLimit):
        $opPages = ceil($orderTotal / $orderLimit);
        $w = 5;
        $s = max(1, $orderPage - 2);
        $e = min($opPages, $s + $w - 1);
        $s = max(1, $e - $w + 1);
      ?>
      <div class="pagination">
        <?php if ($orderPage > 1): ?><a href="?tab=orders&of=<?= $orderFilter ?>&opl=<?= e($orderPlan) ?>&op=<?= $orderPage-1 ?>" class="page-nav">‹</a><?php endif; ?>
        <?php for ($i = $s; $i <= $e; $i++): ?>
        <a href="?tab=orders&of=<?= $orderFilter ?>&opl=<?= e($orderPlan) ?>&op=<?= $i ?>" class="<?= $i === $orderPage ? 'active' : '' ?>"><?= $i ?></a>
        <?php endfor; ?>
        <?php if ($orderPage < $opPages): ?><a href="?tab=orders&of=<?= $orderFilter ?>&opl=<?= e($orderPlan) ?>&op=<?= $orderPage+1 ?>" class="page-nav">›</a><?php endif; ?>
      </div>
      <?php endif; ?>

  <?php elseif ($tab === 'sync'): ?>
    <div class="page-title">同步记录</div>
    <div class="page-sub">共 <?= $syncTotal ?> 条<?= $syncTotal > $syncLimit ? '，第 ' . $syncPage . ' / ' . ceil($syncTotal / $syncLimit) . ' 页（每页 30 条）' : '' ?></div>
    <div class="card">
      <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>用户</th><th>类型</th><th>来源</th><th>端</th><th>IP</th><th>版本</th><th>大小</th><th>时间</th></tr></thead>
        <tbody>
          <?php foreach ($syncLog as $l): ?>
          <tr>
            <td><?= $l['id'] ?></td>
            <td><?= $l['username'] ? e($l['username']) : '用户#' . $l['user_id'] ?></td>
            <td>
              <?php if ($l['action'] === 'upload'): ?><span class="badge badge-blue">↑ 上传</span>
              <?php else: ?><span class="badge badge-purple">↓ 下载</span><?php endif; ?>
            </td>
            <td>
              <?php if ($l['source'] === 'auto'): ?><span class="badge badge-green">自动</span>
              <?php else: ?><span class="badge badge-gray">手动</span><?php endif; ?>
            </td>
            <td>
              <?php
                $pn = ['web' => 'Web端', 'extension' => '扩展端', 'plugin' => '插件端', 'fnos' => '飞牛端'][$l['platform'] ?? 'web'] ?? 'Web端';
                $pc = ['web' => 'badge-blue', 'extension' => 'badge-purple', 'plugin' => 'badge-orange', 'fnos' => 'badge-green'][$l['platform'] ?? 'web'] ?? 'badge-blue';
              ?>
              <span class="badge <?= $pc ?>"><?= $pn ?></span>
            </td>
            <td class="mono" style="font-size:11px;opacity:0.75;white-space:nowrap;"><?= e($l['ip'] ?: '-') ?></td>
            <td class="mono">v<?= $l['version'] ?></td>
            <td style="font-size:12px;opacity:0.6;"><?= number_format($l['size_bytes']) ?> B</td>
            <td style="font-size:11px;opacity:0.5;"><?= substr($l['created_at'] ?? '', 0, 19) ?></td>
          </tr>
          <?php endforeach; ?>
          <?php if (empty($syncLog)): ?><tr><td colspan="9" style="text-align:center;opacity:0.3;padding:40px;">暂无同步记录</td></tr><?php endif; ?>
        </tbody>
      </table>
      </div>
    </div>

      <?php if ($syncTotal > $syncLimit):
        $spPages = ceil($syncTotal / $syncLimit);
        $w = 5;
        $s = max(1, $syncPage - 2);
        $e = min($spPages, $s + $w - 1);
        $s = max(1, $e - $w + 1);
      ?>
      <div class="pagination">
        <?php if ($syncPage > 1): ?><a href="?tab=sync&sp=<?= $syncPage-1 ?>" class="page-nav">‹</a><?php endif; ?>
        <?php for ($i = $s; $i <= $e; $i++): ?>
        <a href="?tab=sync&sp=<?= $i ?>" class="<?= $i === $syncPage ? 'active' : '' ?>"><?= $i ?></a>
        <?php endfor; ?>
        <?php if ($syncPage < $spPages): ?><a href="?tab=sync&sp=<?= $syncPage+1 ?>" class="page-nav">›</a><?php endif; ?>
      </div>
      <?php endif; ?>

  <?php elseif ($tab === 'audit'): ?>
    <div class="page-title">审计日志</div>
    <div class="page-sub">共 <?= $logTotal ?> 条<?= $logTotal > $logLimit ? '，第 ' . $logPage . ' / ' . ceil($logTotal / $logLimit) . ' 页（每页 30 条）' : '' ?></div>
    <form class="search-row" method="get" style="margin-bottom:16px;">
      <input type="hidden" name="tab" value="audit">
      <select class="search-input" name="la" style="flex:0 0 160px;">
        <option value="">全部操作</option>
        <option value="activate" <?= $logAct==='activate'?'selected':'' ?>>开通/续费</option>
        <option value="reset_pwd" <?= $logAct==='reset_pwd'?'selected':'' ?>>重置密码</option>
        <option value="ban" <?= $logAct==='ban'?'selected':'' ?>>封禁用户</option>
        <option value="unban" <?= $logAct==='unban'?'selected':'' ?>>解封用户</option>
        <option value="cancel_pro" <?= $logAct==='cancel_pro'?'selected':'' ?>>取消Pro</option>
        <option value="change_pwd" <?= $logAct==='change_pwd'?'selected':'' ?>>修改密码</option>
        <option value="delete_order" <?= $logAct==='delete_order'?'selected':'' ?>>删除订单</option>
        <option value="confirm_payment" <?= $logAct==='confirm_payment'?'selected':'' ?>>确认收款</option>
      </select>
      <input class="search-input" name="lad" value="<?= e($logAdmin) ?>" placeholder="操作人..." style="flex:0 0 140px;" />
      <input class="search-input" type="date" name="lf" value="<?= e($logFrom) ?>" style="flex:0 0 150px;" title="起始日期" />
      <span style="align-self:center;opacity:0.5;">~</span>
      <input class="search-input" type="date" name="lt" value="<?= e($logTo) ?>" style="flex:0 0 150px;" title="结束日期" />
      <button class="btn btn-primary">筛选</button>
      <?php if ($logAct || $logAdmin || $logFrom || $logTo): ?><a href="?tab=audit" class="btn btn-outline">清除</a><?php endif; ?>
    </form>
    <div class="card">
      <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>操作人</th><th>操作类型</th><th>详情</th><th>时间</th></tr></thead>
        <tbody>
          <?php foreach ($adminLogs as $a): ?>
          <tr>
            <td><?= $a['id'] ?></td>
            <td><?= e($a['admin']) ?></td>
            <td>
              <?php
                $amap = [
                  'activate' => ['t' => '开通/续费', 'c' => 'badge-blue'],
                  'reset_pwd' => ['t' => '重置密码', 'c' => 'badge-gray'],
                  'ban' => ['t' => '封禁用户', 'c' => 'badge-red'],
                  'unban' => ['t' => '解封用户', 'c' => 'badge-green'],
                  'cancel_pro' => ['t' => '取消Pro', 'c' => 'badge-orange'],
                  'change_pwd' => ['t' => '修改密码', 'c' => 'badge-gray'],
                  'delete_order' => ['t' => '删除订单', 'c' => 'badge-red'],
                  'confirm_payment' => ['t' => '确认收款', 'c' => 'badge-purple'],
                ];
                $ai = $amap[$a['action']] ?? ['t' => e($a['action']), 'c' => 'badge-gray'];
              ?>
              <span class="badge <?= $ai['c'] ?>"><?= $ai['t'] ?></span>
            </td>
            <td style="font-size:12px;opacity:0.8;max-width:460px;"><?= e($a['detail']) ?></td>
            <td style="font-size:11px;opacity:0.5;white-space:nowrap;"><?= substr($a['created_at'] ?? '', 0, 19) ?></td>
          </tr>
          <?php endforeach; ?>
          <?php if (empty($adminLogs)): ?><tr><td colspan="5" style="text-align:center;opacity:0.3;padding:40px;">暂无操作日志</td></tr><?php endif; ?>
        </tbody>
      </table>
      </div>
    </div>

      <?php if ($logTotal > $logLimit):
        $apPages = ceil($logTotal / $logLimit);
        $w = 5;
        $s = max(1, $logPage - 2);
        $e = min($apPages, $s + $w - 1);
        $s = max(1, $e - $w + 1);
      ?>
      <div class="pagination">
        <?php if ($logPage > 1): ?><a href="?tab=audit&lp=<?= $logPage-1 ?><?= $logQs ?>" class="page-nav">‹</a><?php endif; ?>
        <?php for ($i = $s; $i <= $e; $i++): ?>
        <a href="?tab=audit&lp=<?= $i ?><?= $logQs ?>" class="<?= $i === $logPage ? 'active' : '' ?>"><?= $i ?></a>
        <?php endfor; ?>
        <?php if ($logPage < $apPages): ?><a href="?tab=audit&lp=<?= $logPage+1 ?><?= $logQs ?>" class="page-nav">›</a><?php endif; ?>
      </div>
      <?php endif; ?>

  <?php elseif ($tab === 'stats'): ?>
    <div class="page-title">访问统计</div>
    <div class="page-sub">基于云同步行为数据派生（仅含已登录并同步过的用户）</div>
    <div class="stats">
      <div class="stat"><div class="stat-icon">👥</div><div class="stat-label">累计用户</div><div class="stat-value"><?= $vTotal ?></div></div>
      <div class="stat"><div class="stat-icon">✨</div><div class="stat-label">今日新增</div><div class="stat-value"><?= $vTodayNew ?></div></div>
      <div class="stat"><div class="stat-icon">📅</div><div class="stat-label">近7日日均活跃</div><div class="stat-value"><?= round($vDau7, 1) ?></div></div>
      <div class="stat"><div class="stat-icon">⭐</div><div class="stat-label">Pro 占比</div><div class="stat-value" style="color:var(--green)"><?= $vProPct ?>%</div></div>
    </div>

    <div class="card">
      <div class="card-title">近 30 天趋势 · 新增用户 / 活跃用户（日活跃 = 当日去重同步用户）</div>
      <div id="trend-wrap" style="position:relative">
      <svg viewBox="0 0 <?= $vCw ?> <?= $vCh ?>" width="100%" style="display:block">
        <line x1="<?= $vPadL ?>" y1="<?= $vPadT + $vPlotH ?>" x2="<?= $vCw - $vPadR ?>" y2="<?= $vPadT + $vPlotH ?>" stroke="rgba(255,255,255,0.12)"/>
        <line id="trend-vline" x1="0" y1="<?= $vPadT ?>" x2="0" y2="<?= $vPadT + $vPlotH ?>" stroke="rgba(255,255,255,0.35)" stroke-dasharray="3 3" style="display:none"/>
<?php $vColW = $vPlotW / 29; foreach ($vDays as $i => $p): $x = $vPadL + ($i * $vPlotW / 29); $yN = $vPadT + $vPlotH * (1 - $p['new'] / $vMax); $yA = $vPadT + $vPlotH * (1 - $p['act'] / $vMax); ?>
        <circle cx="<?= round($x,1) ?>" cy="<?= round($yN,1) ?>" r="3" fill="#4f8fff"/>
        <circle cx="<?= round($x,1) ?>" cy="<?= round($yA,1) ?>" r="3" fill="#22c55e"/>
        <rect x="<?= round($x - $vColW/2,1) ?>" y="<?= $vPadT ?>" width="<?= round($vColW,1) ?>" height="<?= $vPlotH ?>" fill="rgba(0,0,0,0)" data-date="<?= $p['d'] ?>" data-new="<?= $p['new'] ?>" data-act="<?= $p['act'] ?>" data-x="<?= round($x,1) ?>" class="trend-hit"/>
<?php endforeach; ?>
        <polyline fill="none" stroke="#4f8fff" stroke-width="2.5" points="<?= $vNewPoly ?>"/>
        <polyline fill="none" stroke="#22c55e" stroke-width="2.5" points="<?= $vActPoly ?>"/>
      </svg>
        <div id="trend-tooltip" style="display:none;position:absolute;pointer-events:none;background:rgba(17,24,39,0.95);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:8px 10px;font-size:12px;color:#e5e7eb;box-shadow:0 6px 20px rgba(0,0,0,0.4);z-index:50;white-space:nowrap">
          <div style="font-weight:600;margin-bottom:4px" class="tt-date"></div>
          <div style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:2px;background:#4f8fff;display:inline-block"></span>新增：<b class="tt-new"></b></div>
          <div style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:2px;background:#22c55e;display:inline-block"></span>活跃：<b class="tt-act"></b></div>
        </div>
      </div>
      <script>
      (function(){
        var hits = document.querySelectorAll('#trend-wrap .trend-hit');
        if(!hits.length) return;
        var wrap = document.getElementById('trend-wrap');
        var tip = document.getElementById('trend-tooltip');
        var vline = document.getElementById('trend-vline');
        function fmt(d){ return d.substr(5).replace('-','/'); }
        hits.forEach(function(rect){
          rect.addEventListener('mouseenter', function(){
            tip.querySelector('.tt-date').textContent = fmt(rect.dataset.date);
            tip.querySelector('.tt-new').textContent = rect.dataset.new;
            tip.querySelector('.tt-act').textContent = rect.dataset.act;
            tip.style.display = 'block';
            vline.setAttribute('x1', rect.dataset.x);
            vline.setAttribute('x2', rect.dataset.x);
            vline.style.display = 'block';
          });
          rect.addEventListener('mousemove', function(e){
            var r = wrap.getBoundingClientRect();
            var x = e.clientX - r.left + 14;
            var y = e.clientY - r.top + 12;
            if (x + tip.offsetWidth > r.width) x = r.width - tip.offsetWidth - 4;
            if (y + tip.offsetHeight > r.height) y = r.height - tip.offsetHeight - 4;
            tip.style.left = x + 'px';
            tip.style.top = y + 'px';
          });
          rect.addEventListener('mouseleave', function(){
            tip.style.display = 'none';
            vline.style.display = 'none';
          });
        });
      })();
      </script>
      <div style="display:flex;gap:18px;margin-top:8px;font-size:12px;color:var(--text2)">
        <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#4f8fff;margin-right:6px;"></span>新增用户（峰值 <?= $vMax ?>）</span>
        <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#22c55e;margin-right:6px;"></span>活跃用户</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">各端分布（按同步次数）</div>
      <?php foreach ($vPlatRows as $r): $pct = round((int)$r['c'] / $vPlatTotal * 100, 1); ?>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;font-size:13px;">
        <div style="width:64px;color:var(--text2)"><?= $vPlatLabel[$r['platform']] ?? $r['platform'] ?></div>
        <div style="flex:1;height:10px;background:rgba(255,255,255,0.06);border-radius:6px;overflow:hidden;">
          <div style="width:<?= $pct ?>%;height:100%;background:linear-gradient(135deg,#4f8fff,#38bdf8);border-radius:6px;"></div>
        </div>
        <div style="width:110px;text-align:right;color:var(--text2)"><?= (int)$r['c'] ?> 次 · <?= $pct ?>%</div>
      </div>
      <?php endforeach; ?>
    </div>

    <div class="card">
      <div class="card-title">Top 活跃用户（按同步次数）</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>用户</th><th>同步次数</th></tr></thead>
          <tbody>
          <?php if (empty($vTop)): ?><tr><td colspan="3" style="text-align:center;opacity:.3;padding:30px">暂无数据</td></tr>
          <?php else: foreach ($vTop as $i => $r): ?>
            <tr><td><?= $i + 1 ?></td><td><?= e($r['username'] ?? '用户#'.$r['user_id']) ?></td><td><?= (int)$r['c'] ?></td></tr>
          <?php endforeach; endif; ?>
          </tbody>
        </table>
      </div>
    </div>

  <?php elseif ($tab === 'settings'): ?>
    <div class="page-title">设置</div>
    <div class="page-sub">管理员账户</div>
    <div class="card">
      <div class="card-title">修改密码</div>
      <form onsubmit="changePwd(event)">
        <div class="form-group"><label class="form-label">新密码</label><input class="form-input" id="new-pwd" type="password" placeholder="至少6位" /></div>
        <button class="btn btn-primary">保存</button>
      </form>
    </div>
    <div class="card">
      <div class="card-title">数据库初始化</div>
      <p style="font-size:12px;opacity:0.5;margin-bottom:12px;">如果首次部署，请手动执行以下 SQL：</p>
      <pre style="background:rgba(255,255,255,0.03);padding:16px;border-radius:10px;font-size:11px;overflow-x:auto;color:var(--text2);">CREATE TABLE IF NOT EXISTS qd_admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT IGNORE INTO qd_admins (username, password) VALUES ('corban', '$2y$10$HASH_PLACEHOLDER');</pre>
    </div>

  <?php endif; ?>
</div>

<script>
function handleActivate(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  if (e.submitter && e.submitter.name === 'plan') {
    fd.append('plan', e.submitter.value);
  }
  fetch(location.href, { method: 'POST', body: fd }).then(() => location.reload());
  return false;
}
function handleQuickAct(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  fetch(location.href, { method: 'POST', body: fd }).then(() => location.reload());
  return false;
}
function cancelPro(id) {
  fetch(location.href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel_pro', user_id: id }) })
    .then(r => r.text()).then(() => location.reload());
}
function resetPwd(id) {
  const pwd = prompt('为用户 #' + id + ' 设置新密码（至少6位）：');
  if (!pwd || pwd.length < 6) { alert('密码至少6位'); return; }
  fetch(location.href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset_user_password', user_id: id, new_password: pwd }) })
    .then(r => r.text()).then(() => location.reload());
}
function changePwd(e) {
  e.preventDefault();
  const pwd = document.getElementById('new-pwd').value;
  if (pwd.length < 6) { alert('密码至少6位'); return; }
  fetch(location.href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'change_password', new_password: pwd }) })
    .then(r => r.text())
    .then(() => location.reload());
}

function toast(msg, type) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast ' + (type || 'info');
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 2500);
}

// ====== 删除订单 ======
function delOrder(id) {
  if (!confirm('确认删除订单 #' + id + '？\n（已支付的订单删除后不影响用户已有的 Pro 权限）')) return;
  fetch(location.href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_order', order_id: id }) })
    .then(r => r.json()).then(d => { toast(d.msg || ('订单 #' + id + ' 已删除'), d.code === 200 ? 'success' : 'error'); if (d.code === 200) location.reload(); })
    .catch(() => { toast('订单 #' + id + ' 已删除', 'success'); location.reload(); });
}

// ====== 手动确认支付（可选是否同步开通） ======
let cpOrderId = 0;
function confirmPay(id, subPlan, subExpire) {
  cpOrderId = id;
  const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const active = !!subPlan && subPlan !== ''
    && (subPlan === 'lifetime' || (subExpire && subExpire > nowStr));
  document.getElementById('confirm-sub').textContent = active
    ? '该用户当前已拥有有效的 Pro 订阅。如勾选开通，将不会重复开通（沿用现有到期时间）。'
    : '请确认该笔订单已收款，并选择是否同步开通 Pro。';
  document.getElementById('confirm-activate').checked = !active; // 已激活默认不重复开通
  document.getElementById('confirm-modal').classList.add('show');
}
function closeConfirm() { document.getElementById('confirm-modal').classList.remove('show'); }
function submitConfirm() {
  const activate = document.getElementById('confirm-activate').checked;
  fetch(location.href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'confirm_payment', order_id: cpOrderId, activate }) })
    .then(r => r.json()).then(d => { closeConfirm(); toast(d.msg || '已确认收款', d.code === 200 ? 'success' : 'error'); if (d.code === 200) location.reload(); })
    .catch(() => { closeConfirm(); toast('订单 #' + cpOrderId + ' 已确认收款', 'success'); location.reload(); });
}

// ====== 统一「开通 / 续费」弹窗 ======
let proUid = 0, proMode = 'activate';
function openProModal(mode, uid, username) {
  proMode = mode; proUid = uid;
  const isAct = mode === 'activate';
  document.getElementById('pro-user').textContent = username + ' (#' + uid + ')';
  document.getElementById('pro-modal-title').textContent = isAct ? '手动开通 Pro' : '手动续费 Pro';
  document.getElementById('pro-plan-group').style.display = isAct ? '' : 'none';
  document.getElementById('pro-duration-group').style.display = isAct ? 'none' : '';
  document.getElementById('pro-amount-group').style.display = isAct ? 'none' : '';
  document.getElementById('pro-plan').value = 'monthly';
  document.getElementById('pro-duration').value = 1;
  document.getElementById('pro-unit').value = 'month';
  document.getElementById('pro-lifetime').checked = false;
  document.getElementById('pro-amount').value = 0;
  document.getElementById('pro-note-type').value = 'other';
  document.getElementById('pro-note').value = '';
  document.getElementById('pro-send-email').checked = true;
  document.getElementById('pro-modal').classList.add('show');
}
function closeProModal() { document.getElementById('pro-modal').classList.remove('show'); }
function submitProModal() {
  const noteType = document.getElementById('pro-note-type').value;
  const note = document.getElementById('pro-note').value.trim();
  const sendEmail = document.getElementById('pro-send-email').checked;
  let body;
  if (proMode === 'activate') {
    body = { action: 'activate', user_id: proUid, plan: document.getElementById('pro-plan').value, note_type: noteType, note, send_email: sendEmail };
  } else {
    body = {
      action: 'manual_renew', user_id: proUid,
      lifetime: document.getElementById('pro-lifetime').checked,
      duration: parseInt(document.getElementById('pro-duration').value, 10) || 1,
      unit: document.getElementById('pro-unit').value,
      amount: parseFloat(document.getElementById('pro-amount').value || '0'),
      note_type: noteType, note, send_email: sendEmail
    };
  }
  fetch(location.href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json()).then(d => {
      closeProModal();
      toast(d.msg || '操作完成', d.code === 200 ? 'success' : 'error');
      if (d.code === 200) location.reload();
    });
}
</script>
<?php endif; ?>

<!-- 统一「开通 / 续费」弹窗 -->
<div class="modal-mask" id="pro-modal">
  <div class="modal">
    <h3 id="pro-modal-title">开通 / 续费 Pro</h3>
    <div class="modal-sub">为用户 <span id="pro-user"></span></div>

    <!-- 开通模式：选套餐 -->
    <div class="form-group" id="pro-plan-group">
      <label class="form-label">套餐</label>
      <select class="form-input" id="pro-plan">
        <option value="monthly">月度（¥9.90 / 30天）</option>
        <option value="yearly">年度（¥68.00 / 365天）</option>
        <option value="lifetime">终身（¥198.00）</option>
      </select>
    </div>

    <!-- 续费模式：自定义时长 + 金额 -->
    <div class="form-group" id="pro-duration-group" style="display:none;">
      <label class="form-label">续费时长</label>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input type="number" class="form-input" id="pro-duration" value="1" min="1" style="max-width:90px;">
        <select class="form-input" id="pro-unit" style="max-width:110px;">
          <option value="day">天</option>
          <option value="month" selected>个月</option>
          <option value="year">年</option>
        </select>
        <label style="display:flex;align-items:center;gap:4px;font-size:13px;white-space:nowrap;">
          <input type="checkbox" id="pro-lifetime"> 终身
        </label>
      </div>
    </div>
    <div class="form-group" id="pro-amount-group" style="display:none;">
      <label class="form-label">收款金额（¥，可手填）</label>
      <input type="number" class="form-input" id="pro-amount" value="0" min="0" step="0.01">
    </div>

    <!-- 通用：备注 -->
    <div class="form-group">
      <label class="form-label">备注类型</label>
      <select class="form-input" id="pro-note-type">
        <option value="gift">🎁 赠送</option>
        <option value="compensation">🛠 补偿</option>
        <option value="other" selected>📝 其他</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">备注说明（用户可见）</label>
      <textarea class="form-input" id="pro-note" placeholder="例如：活动赠送、Bug 补偿、节日福利……"></textarea>
    </div>

    <!-- 通用：邮件通知 -->
    <div class="form-group" style="display:flex;align-items:flex-start;gap:8px;">
      <input type="checkbox" id="pro-send-email" checked style="margin-top:3px;">
      <label for="pro-send-email" style="font-size:13px;line-height:1.5;">发送邮件通知用户<br><span style="color:#6b7280;font-size:12px;">邮件内含开通时间、到期时间，有备注则一并显示</span></label>
    </div>

    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeProModal()">取消</button>
      <button class="btn btn-primary" onclick="submitProModal()">确认</button>
    </div>
  </div>
</div>

<!-- 确认支付弹窗（可选是否开通） -->
<div class="modal-mask" id="confirm-modal">
  <div class="modal">
    <h3>确认支付</h3>
    <div class="modal-sub" id="confirm-sub"></div>
    <div class="form-group" style="display:flex;gap:10px;align-items:flex-start;background:rgba(79,143,255,0.06);border:1px solid var(--border);border-radius:12px;padding:14px;">
      <input type="checkbox" id="confirm-activate" checked style="margin-top:3px;width:16px;height:16px;accent-color:var(--accent);">
      <label for="confirm-activate" style="font-size:13px;line-height:1.5;cursor:pointer;">同步为用户开通 Pro 订阅
        <br><span style="color:var(--text2);font-size:12px;">取消勾选则仅把订单标记为「已支付」，不开通订阅</span></label>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeConfirm()">取消</button>
      <button class="btn btn-primary" onclick="submitConfirm()">确认收款</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>
</body>
</html>
