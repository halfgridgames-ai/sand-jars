# Adds (or refreshes) the studio splash in a single-file game: right after <body> if the file has one,
# otherwise right after its first </style>.
# Usage: python3 install.py path/to/game.html ...   Re-run after editing hg-splash.js to update every game.
import pathlib, re, sys
js = (pathlib.Path(__file__).parent / 'hg-splash.js').read_text()
block = '<!-- hg-splash -->\n<script>\n' + js + 'HGSplash.show();\n</script>\n<!-- /hg-splash -->'
for f in sys.argv[1:]:
    p = pathlib.Path(f); s = p.read_text()
    if '<!-- hg-splash -->' in s:
        s = re.sub(r'<!-- hg-splash -->.*?<!-- /hg-splash -->', lambda m: block, s, flags=re.S)
    else:
        m = re.search(r'<body[^>]*>', s)
        i = m.end() if m else s.index('</style>') + len('</style>')
        s = s[:i] + '\n' + block + s[i:]
    p.write_text(s); print('splash in', f)
