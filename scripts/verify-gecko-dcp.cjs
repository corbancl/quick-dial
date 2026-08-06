const AdmZip = require('M:/new/node_modules/adm-zip');
const zip = new AdmZip('M:/new/packages/quick-dial-v1.0.9-firefox.zip');
const manifestEntry = zip.getEntry('manifest.json');
const manifest = JSON.parse(manifestEntry.getData().toString('utf8'));

const gecko = manifest.browser_specific_settings?.gecko;
console.log('gecko object:');
console.log(JSON.stringify(gecko, null, 2));
console.log('\nTop-level data_collection_permissions:', manifest.data_collection_permissions ?? 'NOT FOUND (correct!)');
