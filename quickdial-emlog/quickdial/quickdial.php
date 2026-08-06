<?php
/**
 * Plugin Name: 呲啦起始页 (Quick Dial)
 * Version: 1.0.15
 * Description: 为 Emlog 博客增加与网页端 / 扩展端 / 飞牛 NAS 端完全一致的独立起始页（导航面板）。直接复用官方网页端构建产物，四端界面与功能完全相同。
 * Author: 澄曜
 * Author URL: https://www.emlog.net/profiles/8e47bcb4
 * Plugin URL: https://www.emlog.net/plugin/detail/1211
 */

defined('EMLOG_ROOT') || exit('access denied!');

/**
 * 计算 web/ 目录的前端 URL（供 <base> 与设置页使用）
 */
function quickdial_web_base() {
    if (defined('BLOG_URL') && BLOG_URL) {
        return rtrim(BLOG_URL, '/') . '/content/plugins/quickdial/web/';
    }
    $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host  = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $proto . '://' . $host . '/content/plugins/quickdial/web/';
}

// 首页替换钩子：在设置中开启「替换博客首页」后，站点根目录将直接展示呲啦起始页
addAction('index_head', 'quickdial_replace_home');

/**
 * 首页替换：站点根目录（前台首页）输出完整 SPA 拨号盘并终止博客渲染
 */
function quickdial_replace_home() {
    $storage = Storage::getInstance('quickdial');
    if ($storage->getValue('replace_home') !== 'on') {
        return;
    }

    $script = basename($_SERVER['SCRIPT_NAME'] ?? '');
    $isHome = ($script === 'index.php' || $script === '')
        && (empty($_SERVER['QUERY_STRING']) || $_SERVER['QUERY_STRING'] === '');
    if (!$isHome) {
        return;
    }

    // 复用 SPA 渲染函数（由 quickdial_show.php 定义）
    define('QUICKDIAL_MAIN_LOADED', true);
    require_once EMLOG_ROOT . '/content/plugins/quickdial/quickdial_show.php';
    quickdial_render_app();
    exit;
}
