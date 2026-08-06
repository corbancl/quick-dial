const fs = require('fs');
const path = require('path');

// Fix privacy.html footer
let p = fs.readFileSync(path.join('M:/new/website', 'privacy.html'), 'utf8');

// Check if it has proper footer CSS
const hasFlinksCSS = p.includes('footer-links');
const oldFooter = '<div class="footer">© 2026 Quick Dial · cilacila.cn</div>';
const newFooter = `<div class="footer">
  <div class="footer-links">
    <a href="about.html">关于我们</a>
    <a href="privacy.html">隐私政策</a>
    <a href="copyright.html">版权声明</a>
    <a href="contact.html">联系方式</a>
    <a href="guide.html">使用指南</a>
  </div>
  <div class="footer-filings">
    &copy;2026 cilacila.cn 呲啦起始页 版权所有<br>
    <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener">鲁ICP701203023</a>
    <span class="footer-sep">|</span>
    <img src="beian.png" alt="" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;"><a href="https://beian.mps.gov.cn/#/query/webSearch?code=37098202000884" target="_blank" rel="noopener">鲁公网安7098202000884</a>
  </div>
</div>`;

if (p.includes(oldFooter)) {
  p = p.replace(oldFooter, newFooter);
  
  // Add footer CSS if missing
  if (!hasFlinksCSS) {
    p = p.replace(
      '.footer { text-align: center; padding: 40px 24px; font-size: 13px; color: var(--text2); border-top: 1px solid var(--border); }\n  .footer a { color: var(--accent); text-decoration: none; }',
      `.footer {
    text-align: center;
    padding: 48px 24px 32px;
    font-size: 13px;
    color: var(--text2);
    border-top: 1px solid var(--border);
  }
  .footer .footer-links {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px 20px;
    margin-bottom: 14px;
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
    color: var(--text2);
    opacity: 0.75;
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
    margin: 0 10px;
    color: var(--border);
  }`
    );
  }
  
  // Add responsive
  const mediaEnd = p.indexOf('</style>');
  if (mediaEnd >= 0 && !p.includes('@media (max-width: 640px)')) {
    const mediaCSS = `
  @media (max-width: 640px) {
    .footer { padding: 32px 16px 24px; font-size: 12px; }
    .footer .footer-links { gap: 2px 14px; }
  }`;
    p = p.substring(0, mediaEnd) + mediaCSS + '\n' + p.substring(mediaEnd);
  }
  
  fs.writeFileSync(path.join('M:/new/website', 'privacy.html'), p, 'utf8');
  console.log('privacy.html: footer fixed');
} else {
  console.log('privacy.html: footer already OK or not found');
}

// Check index.html footer
const idx = fs.readFileSync(path.join('M:/new/website', 'index.html'), 'utf8');
const fi = idx.lastIndexOf('<div class="footer"');
if (fi >= 0) {
  console.log('\nindex.html footer: ' + idx.substring(fi, fi + 300));
} else {
  console.log('\nindex.html: NO footer');
}
