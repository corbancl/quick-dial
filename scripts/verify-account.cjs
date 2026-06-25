const c = require('fs').readFileSync('M:/new/website/account.html', 'utf8');
console.log('Size:', c.length, 'bytes');
['handleLogin','handleRegister','handleResetPassword','sendBindCode',
 'changePassword','openPro','lang.js'].forEach(f => {
  console.log(f + ': ' + c.includes(f));
});
