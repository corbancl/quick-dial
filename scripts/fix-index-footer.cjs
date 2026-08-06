const fs = require('fs');

const file = 'M:/new/website/index.html';
let c = fs.readFileSync(file, 'utf8');

const oldFooter = `<div class="footer">
  © 2026 Quick Dial · <a href="https://cilacila.cn">cilacila.cn</a> · <a href="privacy.html">隐私政策</a> · <a href="account.html">账户管理</a> · <a href="https://gitee.com/corbancc/quick-dial" target="_blank">开源代码</a>
</div>`;

const newFooter = `<div class="footer">
  <div class="footer-links">
    <a href="about.html">关于我们</a>
    <a href="privacy.html">隐私政策</a>
    <a href="copyright.html">版权声明</a>
    <a href="contact.html">联系方式</a>
    <a href="guide.html">使用指南</a>
    <span style="opacity:0.4">|</span>
    <a href="account.html">账户管理</a>
    <a href="https://gitee.com/corbancc/quick-dial" target="_blank">开源代码</a>
  </div>
  <div class="footer-filings">
    &copy;2026 cilacila.cn 呲啦起始页 版权所有<br>
    <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener">鲁ICP701203023</a>
    <span class="footer-sep">|</span>
    <img src="beian.png" alt="" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;"><a href="https://beian.mps.gov.cn/#/query/webSearch?code=37098202000884" target="_blank" rel="noopener">鲁公网安7098202000884</a>
  </div>
</div>`;

c = c.replace(oldFooter, newFooter);

// Check if footer-links CSS exists in index.html
if (!c.includes('.footer-links')) {
  // index.html has its own footer CSS, need to add/update
  // Let me find the footer CSS
  const footerCSS = c.indexOf('.footer {');
  if (footerCSS >= 0) {
    // Replace existing footer CSS block
    const cssEnd = c.indexOf('}', footerCSS);
    // Find the closing } of .footer block (might be multi-line)
    // Actually let me just add the needed classes after the existing footer style
    const addAfter = c.indexOf('.footer a {');
    const addAfterEnd = c.indexOf('}', addAfter) + 1;
    if (addAfter >= 0) {
      const insertFooterCSS = `
  .footer .footer-links {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 2px 14px;
    margin-bottom: 10px;
  }
  .footer .footer-links a {
    color: var(--accent);
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .footer .footer-links a:hover {
    opacity: 0.75;
    text-decoration: underline;
  }
  .footer .footer-filings {
    font-size: 12px;
    line-height: 2;
    opacity: 0.6;
    margin-top: 6px;
  }
  .footer .footer-filings a {
    color: var(--text2);
    text-decoration: none;
  }
  .footer .footer-filings a:hover {
    color: var(--accent);
  }
  .footer .footer-sep {
    display: inline-block;
    margin: 0 6px;
    opacity: 0.3;
  }`;
      c = c.substring(0, addAfterEnd) + insertFooterCSS + c.substring(addAfterEnd);
    }
  }
}

fs.writeFileSync(file, c, 'utf8');
console.log('index.html updated. Size: ' + c.length + ' bytes');
