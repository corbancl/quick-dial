<?php
defined('EMLOG_ROOT') || exit('access denied!');

// Emlog Pro 后台加载设置页时只 include 本文件、不会先加载主文件，
// 这里兜底定义 quickdial_web_base()，避免函数未定义 fatal。
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

/**
 * 后台设置页视图（Emlog Pro 标准）
 * 函数名【必须】为 plugin_setting_view（无插件前缀），Emlog 框架在输出后台框架后调用本函数。
 * 使用 Bootstrap4 卡片结构，切勿使用旧版 .containertitle/.line 等废弃类。
 */
function plugin_setting_view() {
    $storage     = Storage::getInstance('quickdial');
    $replaceHome = $storage->getValue('replace_home') === 'on' ? 'checked' : '';
    $baseUrl     = quickdial_web_base();
    $pluginUrl   = defined('BLOG_URL') ? rtrim(BLOG_URL, '/') . '/?plugin=quickdial' : '?plugin=quickdial';

    // 底部自定义配置（读取 Storage，无值则用默认）
    $footerLinks = json_decode($storage->getValue('footer_links'), true) ?: [
        ['text' => '关于我们', 'url' => 'about.html'],
        ['text' => '隐私政策', 'url' => 'privacy.html'],
        ['text' => '版权声明', 'url' => 'copyright.html'],
        ['text' => '联系方式', 'url' => 'contact.html'],
    ];
    $footerCopyright = $storage->getValue('footer_copyright') ?: '';
    $footerIcpText   = $storage->getValue('footer_icp_text') ?: '';
    $footerIcpUrl    = $storage->getValue('footer_icp_url') ?: '';
    $footerPsbText   = $storage->getValue('footer_psb_text') ?: '';
    $footerPsbUrl    = $storage->getValue('footer_psb_url')  ?: '';
?>
<div class="d-sm-flex align-items-center justify-content-between mb-4">
    <h1 class="h4 mb-0 text-gray-800">呲啦起始页 设置</h1>
</div>

<div class="card shadow mb-4">
    <div class="card-body">
        <div class="mb-4 text-muted" style="line-height:1.8;font-size:13px">
            <b>关于本插件</b><br>
            本插件直接复用呲啦起始页官方网页端构建产物，<b>界面与功能与网页端 / 浏览器扩展端 / 飞牛 NAS 端完全一致</b>。<br>
            主题、搜索引擎、时钟样式、导航卡片、云同步等全部设置，请直接在起始页内点击右上角「设置」图标完成，无需在此配置。
        </div>

        <form method="post" action="./plugin.php?plugin=quickdial&action=setting">
            <div class="form-group mb-3">
                <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;margin:0">
                    <input type="checkbox" name="replace_home" value="1" <?php echo $replaceHome; ?> style="width:16px;height:16px">
                    将博客首页替换为呲啦起始页（开启后访问站点根目录直接显示拨号盘，博客文章仍可通过归档/分类正常访问）
                </label>
            </div>

            <div class="text-muted mb-3" style="font-size:13px;line-height:1.7">
                独立起始页地址：<code><?php echo htmlspecialchars($baseUrl . 'index.html'); ?></code><br>
                或：<code><?php echo htmlspecialchars($pluginUrl); ?></code>
            </div>

            <input type="submit" name="save" value="保存设置" class="btn btn-primary btn-sm">
        </form>
    </div>
</div>

<div class="card shadow mb-4">
    <div class="card-header py-3"><h6 class="m-0 font-weight-bold text-primary">底部信息自定义</h6></div>
    <div class="card-body" style="font-size:13px">
        <p class="text-muted mb-3">留空则使用默认值。修改后请保存，刷新起始页即可生效。</p>
        <form method="post" action="./plugin.php?plugin=quickdial&action=setting">
        <input type="hidden" name="save_footer" value="1">

        <div class="font-weight-bold mb-2 text-gray-800" style="font-size:14px">导航链接</div>
        <?php for ($i = 0; $i < 4; $i++):
            $label = ['关于我们','隐私政策','版权声明','联系方式'][$i];
            $text  = $footerLinks[$i]['text']  ?? '';
            $url   = $footerLinks[$i]['url']   ?? '';
        ?>
        <div class="form-row mb-2">
            <div class="col-2"><label style="font-size:13px;margin:0;padding-top:6px"><?php echo $label; ?></label></div>
            <div class="col-5"><input type="text" name="ft_text[]" value="<?php echo htmlspecialchars($text); ?>" class="form-control form-control-sm" placeholder="显示文字（留空=默认）"></div>
            <div class="col-5"><input type="text" name="ft_url[]"  value="<?php echo htmlspecialchars($url); ?>"  class="form-control form-control-sm" placeholder="链接地址（留空=默认）"></div>
        </div>
        <?php endfor; ?>

        <div class="font-weight-bold mt-4 mb-2 text-gray-800" style="font-size:14px">版权与备案</div>
        <div class="form-row mb-2">
            <div class="col-2"><label style="font-size:13px;margin:0;padding-top:6px">版权文字</label></div>
            <div class="col-10"><input type="text" name="fc" value="<?php echo htmlspecialchars($footerCopyright); ?>" class="form-control form-control-sm" placeholder="例：&copy;2026 呲啦起始页 版权所有"></div>
        </div>
        <div class="form-row mb-2">
            <div class="col-2"><label style="font-size:13px;margin:0;padding-top:6px">ICP 备案号</label></div>
            <div class="col-5"><input type="text" name="ft_icp_text" value="<?php echo htmlspecialchars($footerIcpText); ?>" class="form-control form-control-sm" placeholder="例：鲁ICP备17012030号-23"></div>
            <div class="col-5"><input type="text" name="ft_icp_url"  value="<?php echo htmlspecialchars($footerIcpUrl); ?>"  class="form-control form-control-sm" placeholder="例：https://beian.miit.gov.cn"></div>
        </div>
        <div class="form-row mb-3">
            <div class="col-2"><label style="font-size:13px;margin:0;padding-top:6px">公网安备</label></div>
            <div class="col-5"><input type="text" name="ft_psb_text" value="<?php echo htmlspecialchars($footerPsbText); ?>" class="form-control form-control-sm" placeholder="例：鲁公网安备37098202000884号"></div>
            <div class="col-5"><input type="text" name="ft_psb_url"  value="<?php echo htmlspecialchars($footerPsbUrl); ?>"  class="form-control form-control-sm" placeholder="例：https://beian.mps.gov.cn/#/query/webSearch?code=xxx"></div>
        </div>

        <input type="submit" name="save" value="保存底部设置" class="btn btn-success btn-sm">
        </form>
    </div>
</div>

<div class="card shadow mb-4">
    <div class="card-header py-3"><h6 class="m-0 font-weight-bold text-primary">默认导航卡片</h6></div>
    <div class="card-body" style="font-size:13px">
        <p class="text-muted mb-3">新用户首次打开起始页时显示这些导航卡片。已自定义过的用户不受影响。留空则使用系统默认。</p>
        <form method="post" action="./plugin.php?plugin=quickdial&action=setting" id="dials-form">
        <input type="hidden" name="save_dials" value="1">
        <div id="dial-groups">
<?php
$dialJson = $storage->getValue('dial_json');
$dialData = $dialJson ? json_decode($dialJson, true) : [];
// 渲染现有数据
$renderGroups = !empty($dialData) ? $dialData : [[]];
foreach ($renderGroups as $gi => $grp):
    $gname = $grp['group'] ?? '';
    $items = $grp['items'] ?? [];
    if (empty($items)) $items = [['title'=>'','url'=>'','icon'=>'']];
?>
        <div class="dial-group card mb-3" style="background:#f8f9fc;border:1px solid #e3e6f0">
            <div class="card-body py-2 px-3">
                <div class="form-row align-items-center mb-2">
                    <div class="col-auto"><strong style="font-size:13px">分组名：</strong></div>
                    <div class="col-4"><input type="text" name="dial_groups[]" value="<?php echo htmlspecialchars($gname); ?>" class="form-control form-control-sm" placeholder="例：常用"></div>
                    <div class="col-auto ml-auto">
                        <button type="button" class="btn btn-sm btn-outline-success" onclick="addDialItem(this)" title="添加卡片">＋ 卡片</button>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeDialGroup(this)" title="删除分组">× 分组</button>
                    </div>
                </div>
                <table class="table table-sm table-borderless mb-0 dial-items" style="font-size:12px">
                    <thead><tr><th style="width:25%">标题</th><th style="width:40%">网址</th><th style="width:25%">图标URL</th><th style="width:10%"></th></tr></thead>
                    <tbody>
<?php foreach ($items as $item): ?>
                    <tr>
                        <td><input type="text" name="dial_title[<?php echo $gi; ?>][]" value="<?php echo htmlspecialchars($item['title'] ?? ''); ?>" class="form-control form-control-sm" placeholder="标题"></td>
                        <td><input type="text" name="dial_url[<?php echo $gi; ?>][]"   value="<?php echo htmlspecialchars($item['url'] ?? ''); ?>"   class="form-control form-control-sm" placeholder="https://"></td>
                        <td><input type="text" name="dial_icon[<?php echo $gi; ?>][]"  value="<?php echo htmlspecialchars($item['icon'] ?? ''); ?>"  class="form-control form-control-sm" placeholder="留空自动获取"></td>
                        <td><button type="button" class="btn btn-sm btn-outline-secondary" onclick="removeDialItem(this)">×</button></td>
                    </tr>
<?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
<?php endforeach; ?>
        </div>
        <button type="button" class="btn btn-sm btn-outline-primary mb-3" onclick="addDialGroup()">＋ 添加分组</button>
        <br>
        <input type="submit" name="save" value="保存导航卡片" class="btn btn-success btn-sm">
        </form>
    </div>
</div>

<script>
// 重新编号所有 input name 的索引
function reindexGroups() {
    document.querySelectorAll('.dial-group').forEach((grp, gi) => {
        grp.querySelectorAll('input[name^="dial_title"], input[name^="dial_url"], input[name^="dial_icon"]').forEach(inp => {
            inp.name = inp.name.replace(/\[\d+\]/, '[' + gi + ']');
        });
    });
}
function addDialGroup() {
    var tpl = document.querySelector('.dial-group').cloneNode(true);
    tpl.querySelectorAll('input').forEach(function(inp) { inp.value = ''; });
    tpl.querySelector('tbody').innerHTML = '<tr>' +
        '<td><input type="text" name="dial_title[0][]" class="form-control form-control-sm" placeholder="标题"></td>' +
        '<td><input type="text" name="dial_url[0][]"   class="form-control form-control-sm" placeholder="https://"></td>' +
        '<td><input type="text" name="dial_icon[0][]"  class="form-control form-control-sm" placeholder="留空自动获取"></td>' +
        '<td><button type="button" class="btn btn-sm btn-outline-secondary" onclick="removeDialItem(this)">×</button></td></tr>';
    document.getElementById('dial-groups').appendChild(tpl);
    reindexGroups();
}
function removeDialGroup(btn) {
    var groups = document.querySelectorAll('.dial-group');
    if (groups.length <= 1) {
        // 清空而非删除最后一个分组
        groups[0].querySelectorAll('input').forEach(function(inp) { inp.value = ''; });
        groups[0].querySelector('tbody').innerHTML = '<tr>' +
            '<td><input type="text" name="dial_title[0][]" class="form-control form-control-sm" placeholder="标题"></td>' +
            '<td><input type="text" name="dial_url[0][]"   class="form-control form-control-sm" placeholder="https://"></td>' +
            '<td><input type="text" name="dial_icon[0][]"  class="form-control form-control-sm" placeholder="留空自动获取"></td>' +
            '<td><button type="button" class="btn btn-sm btn-outline-secondary" onclick="removeDialItem(this)">×</button></td></tr>';
        return;
    }
    btn.closest('.dial-group').remove();
    reindexGroups();
}
function addDialItem(btn) {
    var tbody = btn.closest('.dial-group').querySelector('tbody');
    var tr = document.createElement('tr');
    var gi = Array.from(document.querySelectorAll('.dial-group')).indexOf(btn.closest('.dial-group'));
    tr.innerHTML = '<td><input type="text" name="dial_title[' + gi + '][]" class="form-control form-control-sm" placeholder="标题"></td>' +
        '<td><input type="text" name="dial_url[' + gi + '][]" class="form-control form-control-sm" placeholder="https://"></td>' +
        '<td><input type="text" name="dial_icon[' + gi + '][]" class="form-control form-control-sm" placeholder="留空自动获取"></td>' +
        '<td><button type="button" class="btn btn-sm btn-outline-secondary" onclick="removeDialItem(this)">×</button></td>';
    tbody.appendChild(tr);
}
function removeDialItem(btn) {
    var tbody = btn.closest('tbody');
    if (tbody.querySelectorAll('tr').length <= 1) {
        tbody.querySelectorAll('input').forEach(function(inp) { inp.value = ''; });
        return;
    }
    btn.closest('tr').remove();
}
</script>
<?php
}

/**
 * 后台设置保存（Emlog Pro 标准）
 * 函数名【必须】为 plugin_setting（无插件前缀），Emlog 框架在收到 POST 时调用本函数。
 * 返回 true 表示成功，plugin.php 会跳转回设置页并显示「保存成功」提示。
 */
function plugin_setting() {
    $storage = Storage::getInstance('quickdial');

    // 保存底部配置
    if (Input::postStrVar('save_footer', '') === '1') {
        // 注意：ft_text / ft_url 是数组型字段，必须用 postStrArray，
        // postStrVar 对数组会返回默认值（空数组），导致保存后链接空白。
        $ftTexts  = Input::postStrArray('ft_text', []);
        $ftUrls   = Input::postStrArray('ft_url',  []);
        $links    = [];
        for ($i = 0; $i < 4; $i++) {
            $links[] = [
                'text' => isset($ftTexts[$i]) ? trim($ftTexts[$i]) : '',
                'url'  => isset($ftUrls[$i])  ? trim($ftUrls[$i])  : '',
            ];
        }
        $storage->setValue('footer_links',     json_encode($links, JSON_UNESCAPED_UNICODE));
        $storage->setValue('footer_copyright', trim(Input::postStrVar('fc', '')));
        $storage->setValue('footer_icp_text',  trim(Input::postStrVar('ft_icp_text', '')));
        $storage->setValue('footer_icp_url',   trim(Input::postStrVar('ft_icp_url', '')));
        $storage->setValue('footer_psb_text',  trim(Input::postStrVar('ft_psb_text', '')));
        $storage->setValue('footer_psb_url',   trim(Input::postStrVar('ft_psb_url', '')));
        return true;
    }

    // 保存导航卡片
    if (Input::postStrVar('save_dials', '') === '1') {
        // dial_* 均为数组型字段，必须用 postStrArray（postStrVar 会拒数组返回空）
        $groups    = Input::postStrArray('dial_groups', []);
        $titlesAll = Input::postStrArray('dial_title', []);
        $urlsAll   = Input::postStrArray('dial_url',   []);
        $iconsAll  = Input::postStrArray('dial_icon',  []);

        $result = [];
        foreach ($groups as $gi => $gname) {
            $gname = trim($gname);
            $items = [];
            $titles = isset($titlesAll[$gi]) ? $titlesAll[$gi] : [];
            $urls   = isset($urlsAll[$gi])   ? $urlsAll[$gi]   : [];
            $icons  = isset($iconsAll[$gi])  ? $iconsAll[$gi]  : [];
            foreach ($titles as $ii => $t) {
                $t = trim($t);
                $u = trim(isset($urls[$ii]) ? $urls[$ii] : '');
                $ic = trim(isset($icons[$ii]) ? $icons[$ii] : '');
                if ($t !== '' && $u !== '') {
                    $items[] = ['title' => $t, 'url' => $u, 'icon' => $ic];
                }
            }
            if ($gname !== '' || !empty($items)) {
                $result[] = ['group' => $gname ?: '常用', 'items' => $items];
            }
        }

        // 如果有分组但都为空，清空；否则保存
        $json = !empty($result) ? json_encode($result, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) : '';
        $storage->setValue('dial_json', $json);
        return true;
    }

    // 保存首页替换
    $replace = Input::postStrVar('replace_home', '');
    $storage->setValue('replace_home', $replace === '1' ? 'on' : 'off');
    return true;
}
