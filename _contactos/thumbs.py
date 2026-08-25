import os, sys, glob
from PIL import Image

S      = '/sessions/rcw-01gqbfhzfahcezsroyebmuih'
ASSETS = S + '/mnt/04_Assets'
CACHE  = S + '/mnt/ae-mcp/_contactos/_thumbs'
BOX    = (540, 405)   # doble de la celda final, para reescalar con calidad

def thumb(src, dst):
    if os.path.exists(dst): return 'skip'
    im = Image.open(src)
    try: im.draft('RGB', BOX)          # decodificado rapido en JPEG
    except Exception: pass
    im = im.convert('RGB')
    im.thumbnail(BOX, Image.LANCZOS)
    im.save(dst, 'PNG', optimize=True)
    return '%dx%d' % im.size

which = sys.argv[1]
if which == 'ilu':
    files = sorted(glob.glob(ASSETS + '/Ilustraciones/*_RGB.png'))
else:
    files = sorted(glob.glob(ASSETS + '/Fotografía/*/*.jpg'))

done = 0
for f in files:
    key = os.path.splitext(os.path.basename(f))[0]
    r = thumb(f, os.path.join(CACHE, key + '.png'))
    done += 1
print(which, 'archivos:', len(files), 'procesados:', done)
