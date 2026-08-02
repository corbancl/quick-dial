<?php
defined('EMLOG_ROOT') || exit('access denied!');

/**
 * 渲染真实的 Quick Dial 网页端 SPA（与 web / 扩展 / 飞牛 NAS 三端 100% 一致）
 *
 * 原理：把官方网页构建产物放在 web/ 目录，本文件读取 web/index.html，
 * 注入 <base href=".../web/"> 让其中相对资源（./assets/...、./js.png 等）
 * 正确指向插件目录下的静态文件，从而实现与官方网页端完全一样的界面与功能。
 */

if (!function_exists('quickdial_web_base')) {
    function quickdial_web_base() {
        if (defined('BLOG_URL') && BLOG_URL) {
            return rtrim(BLOG_URL, '/') . '/content/plugins/quickdial/web/';
        }
        $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host  = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return $proto . '://' . $host . '/content/plugins/quickdial/web/';
    }
}

function quickdial_render_app() {
    $indexPath = EMLOG_ROOT . '/content/plugins/quickdial/web/index.html';
    if (!file_exists($indexPath)) {
        header('Content-Type: text/html; charset=utf-8');
        echo '<p style="font-family:sans-serif;padding:2rem;color:#334155">'
           . '未找到 Quick Dial 静态资源，请确认插件的 <code>web/</code> 目录已随插件一起上传。</p>';
        return;
    }

    $html = file_get_contents($indexPath);
    $baseTag = '<base href="' . htmlspecialchars(quickdial_web_base(), ENT_QUOTES) . '">' . "\n";

    // 注入底部自定义配置（仅在插件端生效）
    $storage = Storage::getInstance('quickdial');
    $footerLinks    = $storage->getValue('footer_links')     ?: '';
    $footerCopyright= $storage->getValue('footer_copyright') ?: '';
    $footerIcpText  = $storage->getValue('footer_icp_text')  ?: '';
    $footerIcpUrl   = $storage->getValue('footer_icp_url')   ?: '';
    $footerPsbText  = $storage->getValue('footer_psb_text')  ?: '';
    $footerPsbUrl   = $storage->getValue('footer_psb_url')   ?: '';
    $dialJson       = $storage->getValue('dial_json')        ?: '';

    $configScript = '';
    $scripts = [];

    // 底部自定义
    $hasFooter = $footerLinks || $footerCopyright || $footerIcpText || $footerPsbText;
    if ($hasFooter) {
        $scripts[] = 'window.PLUGIN_FOOTER=' . json_encode([
            'links'    => $footerLinks ? json_decode($footerLinks, true) : null,
            'copyright'=> $footerCopyright,
            'icpText'  => $footerIcpText,
            'icpUrl'   => $footerIcpUrl,
            'psbText'  => $footerPsbText,
            'psbUrl'   => $footerPsbUrl,
        ], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) . ';';
    }

    // 默认导航卡片
    if ($dialJson) {
        $scripts[] = 'window.PLUGIN_DEFAULTS={dials:' . $dialJson . '};';
    }

    $configScript = $scripts ? '<script>' . implode('', $scripts) . '</script>' . "\n" : '';

    if (stripos($html, '<head>') !== false) {
        $html = preg_replace('/<head>/i', '<head>' . $baseTag . $configScript, $html, 1);
    } elseif (stripos($html, '<head ') !== false) {
        $html = preg_replace('/<head\b/i', '<head>' . $baseTag . $configScript, $html, 1);
    } else {
        $html = $baseTag . $configScript . $html;
    }

    echo $html;
}

// 被主文件 require 用于「替换首页」时，QUICKDIAL_MAIN_LOADED 已定义，不要自动渲染；
// Emlog 以插件页（?plugin=quickdial）加载本文件时，直接渲染 SPA。
if (!defined('QUICKDIAL_MAIN_LOADED')) {
    quickdial_render_app();
}
