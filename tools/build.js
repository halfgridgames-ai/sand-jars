// node tools/build.js -> index.html (core + checked level seeds inlined, studio splash added)
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const root = path.resolve(__dirname, '..');
let s = fs.readFileSync(root + '/src/sand-jars.src.html', 'utf8');
s = s.replace('/*@CORE*/', () => fs.readFileSync(root + '/src/core.js', 'utf8').replace("if (typeof module !== 'undefined') module.exports = SJ;", ''));
const sfxDir = process.env.SFX || root + '/assets/sfx';
const sfx = {}; for (const n of ['pour', 'pick', 'drop', 'cork', 'win', 'coin', 'tap', 'nope', 'spark']) { const f = sfxDir + '/' + n + '.mp3'; if (fs.existsSync(f)) sfx[n] = 'data:audio/mpeg;base64,' + fs.readFileSync(f).toString('base64'); }
s = s.replace('/*@SFX*/', () => JSON.stringify(sfx));
const bgFile = process.env.BG || root + '/assets/backdrop-portrait.webp';
s = s.replace('/*@BG*/', () => fs.existsSync(bgFile) ? 'data:image/webp;base64,' + fs.readFileSync(bgFile).toString('base64') : '');
s = s.replace('/*@SEEDS*/', () => fs.readFileSync(__dirname + '/seeds.json', 'utf8'));
fs.writeFileSync(root + '/index.html', s);
const splash = process.env.SPLASH || root + '/tools/splash/install.py';
if (fs.existsSync(splash)) execSync(`python3 ${splash} ${root}/index.html`, { stdio: 'inherit' });
console.log('built', (s.length / 1024).toFixed(0) + ' KB');
