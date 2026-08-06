const AdmZip = require('M:/new/node_modules/adm-zip');
const zip = new AdmZip('M:/new/packages/quick-dial-v1.0.9-firefox.zip');
const entry = zip.getEntry('manifest.json');
const m = JSON.parse(entry.getData().toString('utf8'));
const dcp = m.browser_specific_settings?.gecko?.data_collection_permissions;
console.log('data_collection_permissions:', JSON.stringify(dcp, null, 2));

if (Array.isArray(dcp?.required) && dcp.required[0] === 'none') {
  console.log('✅ required is ["none"] — CORRECT!');
} else {
  console.log('❌ required is NOT ["none"]');
}

console.log('\nicons:', JSON.stringify(m.icons));
console.log('default_icon:', JSON.stringify(m.action?.default_icon));
