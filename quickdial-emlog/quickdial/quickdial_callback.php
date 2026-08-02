<?php
defined('EMLOG_ROOT') || exit('access denied!');

/**
 * 插件激活：初始化默认配置
 */
function callback_activate() {
    $storage = Storage::getInstance('quickdial');
    if ($storage->getValue('replace_home') === null) {
        $storage->setValue('replace_home', 'off');
    }
}

/**
 * 插件停用：保留用户配置，不做清理
 */
function callback_inactivate() {
    // 停用不删除配置，方便再次启用时恢复
}

/**
 * 插件卸载：清理全部配置
 */
function callback_uninstall() {
    $storage = Storage::getInstance('quickdial');
    $storage->delValue('replace_home');
}
