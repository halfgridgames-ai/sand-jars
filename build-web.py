# Builds the installable web version into web/ from the built single-file game (index.html, made by tools/build.js).
# The Android and iPhone apps copy web/ in (android-app/sync-web.sh).
import hashlib, pathlib, shutil, subprocess
root = pathlib.Path(__file__).parent
subprocess.run(['node', str(root / 'tools' / 'build.js')], check=True)
src = (root / 'index.html').read_text()
head = '''<meta name="theme-color" content="#3a2450">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Sand Jars">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
'''
i = src.index('</head>')
out = src[:i] + head + src[i:]
out = out.replace('</body>', '''<script>if ('serviceWorker' in navigator && !window.Capacitor && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js'));</script>
</body>''', 1)
web = root / 'web'; web.mkdir(exist_ok=True)
(web / 'index.html').write_text(out)
shutil.copy(root / 'privacy.html', web / 'privacy.html')
shutil.copy(root / 'terms.html', web / 'terms.html')
ver = hashlib.sha1((out + (web / 'manifest.webmanifest').read_text()).encode()).hexdigest()[:10]
(web / 'sw.js').write_text((root / 'sw-template.js').read_text().replace('__VERSION__', ver))
print('built web/ version', ver)
