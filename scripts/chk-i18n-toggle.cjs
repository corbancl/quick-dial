const c = require('fs').readFileSync('M:/new/website/i18n.js', 'utf8');
// Search for qdToggleLang or toggleLang or any lang toggle function
const idx = c.indexOf('qdToggleLang');
if (idx >= 0) {
  console.log('Found qdToggleLang at ' + idx);
  console.log(c.substring(idx, idx + 200));
} else {
  console.log('NO qdToggleLang in i18n.js');
  // Check for onclick or toggle
  const toggles = c.match(/onclick|toggleLang|switchLang|setLang|lang=/g);
  if (toggles) console.log('Found: ' + [...new Set(toggles)].join(', '));
}
