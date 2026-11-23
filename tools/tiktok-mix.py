# python3 tools/tiktok-mix.py outDir [fontfile] : game sounds from cues.json + frames from tools/tiktok.js -> sand-jars-tiktok.mp4
import json, random, subprocess, sys, pathlib
out = pathlib.Path(sys.argv[1]); font = sys.argv[2] if len(sys.argv) > 2 else '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
A = str(pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'sfx') + '/'
d = json.loads((out / 'cues.json').read_text()); start = d['firstFrame']
vol = {'pick': .55, 'drop': .5, 'land': .28, 'cork': .9, 'win': .75, 'coin': .6, 'layer': .6, 'nope': .7}
fname = {'land': 'drop', 'layer': 'spark'}
inputs, filters = [], []; random.seed(4)
def add(p): inputs.append(p); return len(inputs) - 1
for k, t, *rest in d['cues']:
    a = rest[0] if rest else []
    tt = t - start
    if k == 'pour':
        dur = a[0]; at = a[1] if len(a) > 1 else 0; s = tt + at; ln = dur + 0.25; o = random.uniform(0, max(0, 3.4 - ln))
        i = add(A + 'pour.mp3'); filters.append(f'[{i}]atrim={o:.3f}:{o+ln:.3f},asetpts=N/SR/TB,afade=t=in:d=0.05,afade=t=out:st={max(0.06, ln-0.25):.3f}:d=0.25,volume=0.9,adelay={int(s*1000)}|{int(s*1000)}[a{i}]')
    elif k in vol:
        i = add(A + fname.get(k, k) + '.mp3'); filters.append(f'[{i}]volume={vol[k]},adelay={int(tt*1000)}|{int(tt*1000)}[a{i}]')
        if k in ('cork', 'win'):
            dl = .05 if k == 'cork' else .25; i = add(A + 'spark.mp3'); filters.append(f'[{i}]volume={0.28 if k == "cork" else 0.35},adelay={int((tt+dl)*1000)}|{int((tt+dl)*1000)}[a{i}]')
labels = ''.join(f'[a{i}]' for i in range(len(inputs)))
(out / 'fc.txt').write_text(';'.join(filters) + f';{labels}amix=inputs={len(inputs)}:normalize=0,alimiter=limit=0.9[out]')
args = []
for p in inputs: args += ['-i', p]
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + args + ['-filter_complex_script', str(out / 'fc.txt'), '-map', '[out]', '-ac', '2', '-ar', '44100', str(out / 'mix.wav')], check=True)
vf = f"fps=30,drawtext=fontfile={font}:text='Satisfying sand sort':fontsize=86:fontcolor=0xfff6e8:borderw=6:bordercolor=0x3a245c:x=(w-text_w)/2:y=230:enable='lt(t,3.5)'"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(out / 'frames.txt'), '-i', str(out / 'mix.wav'), '-vf', vf,
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', str(out / 'sand-jars-tiktok.mp4')], check=True, cwd=out)
print('wrote', out / 'sand-jars-tiktok.mp4', len(inputs), 'sounds')
