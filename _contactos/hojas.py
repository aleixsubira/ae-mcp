# -*- coding: utf-8 -*-
import os, glob, textwrap, unicodedata
from PIL import Image, ImageDraw, ImageFont

S     = '/sessions/rcw-01gqbfhzfahcezsroyebmuih'
CACHE = S + '/mnt/ae-mcp/_contactos/_thumbs'
OUT   = S + '/mnt/ae-mcp/_contactos'

# --- colores muestreados del render real de M01_Branding_16x9, no inventados ---
NARANJA = (255, 151, 13)
ROJO    = (218,  36, 54)
GRIS    = (239, 241, 243)     # el mismo #EFF1F3 del fondo de placeholder
TINTA   = ( 26,  30,  35)
SUAVE   = (110, 118, 128)

def fuente(nombre, size):
    for p in ['/usr/share/fonts/truetype/lato/Lato-%s.ttf' % nombre,
              '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if nombre!='Regular' else '')]:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

F_TIT  = fuente('Black',   58)
F_SUB  = fuente('Regular', 26)
F_NUM  = fuente('Bold',    24)
F_NOM  = fuente('Bold',    20)
F_PIE  = fuente('Regular', 21)

ILU = ["ALMACENAJE-BIOCOMBUSTIBLE","ALMACENAJE-H2","ANCIANA","ANCIANO","BARBACOA",
"BODEGON-BOMBONAS-PORTUGAL","BODEGON-BOMBONAS","CAJA-TIENDA","CALEFACCION-RADIADOR","CAMPUS",
"CICLO-COMBINADO","CLIENTE-GAS-RESIDENCIAL","CLIENTE-HORECA-GAS","CLIENTE-HORECA-SINGAS",
"CLIENTE-VALORANDO","COCINA-GAS","COCINA","DISCAPACITADOS","DISFRUTE-OCIO","EDIFICIO",
"EES-SURTIDORES","ENERGIA-EN-EL-HOGAR","ESTACION-SERVICIO","FABRICA","GRANJA-SOLAR",
"HOMBRE-AVERAGE","HOMBRE-REPSOL","KLIN","MADRE","MEDIO-AMBIENTE","MUJER-AVERAGE","MUJER-REPSOL",
u"NIÑA",u"NIÑO","PAGO-BOMBONAS-WAYLET","PARKING","PARQUE-EOLICO","PLANTA-PIROLISIS",
"PRESA","PRODUCCION-PETRONOR","PUNTO-RECARGA","RECARGA-ELECTRICA","RECOGER-BOMBONA-EES",
"RESERVAR-BOMBONA-EES","SOLMATCH","TECH-LAB","TECNICO","TRABAJO-OFICINA"]

FOTO = (["LIFESTYLE-EXTERIOR_%02d" % i for i in range(1,8)] +
        ["LIFESTYLE-HOGAR_%02d"    % i for i in range(1,10)] +
        ["TECNOLOGIA_%02d"         % i for i in range(1,6)] +
        ["VEHICULOS_%02d"          % i for i in range(1,3)])

def norm(x):
    return unicodedata.normalize('NFC', x).replace('_','-').upper()

# indice de miniaturas tolerante a - vs _ y a NFC/NFD
_cache = {}
for p in glob.glob(CACHE + '/*.png'):
    k = os.path.splitext(os.path.basename(p))[0]
    _cache[norm(k)] = p

FALTAN = []

def mini(nombre, sufijo):
    for cand in [nombre + sufijo, nombre]:
        p = _cache.get(norm(cand))
        if p: return p
    FALTAN.append(nombre)
    return None

COLS, MARG, GUT = 6, 60, 24
ANCHO = 2400
CW = (ANCHO - 2*MARG - (COLS-1)*GUT) // COLS      # 360
TH, TW = 270, CW
CH = TH + 68

def ajusta(draw, txto, font, maxw):
    if draw.textlength(txto, font=font) <= maxw: return [txto]
    partes, linea, out = txto.replace('_','_​').split('-'), '', []
    for i,pz in enumerate(partes):
        cand = (linea + '-' + pz) if linea else pz
        if draw.textlength(cand, font=font) <= maxw: linea = cand
        else:
            if linea: out.append(linea + '-')
            linea = pz
    if linea: out.append(linea)
    return out[:2]

def hoja(items, sufijo, titulo, subtitulo, destino):
    filas = (len(items) + COLS - 1)//COLS
    HEAD, FOOT = 200, 110
    alto = HEAD + filas*CH + (filas-1)*GUT + FOOT + MARG
    im = Image.new('RGB', (ANCHO, alto), (255,255,255))
    d  = ImageDraw.Draw(im)

    for y in range(HEAD):                                   # banda degradada
        t = y/float(HEAD-1)
        d.line([(0,y),(ANCHO,y)], fill=tuple(int(NARANJA[i]+(ROJO[i]-NARANJA[i])*t) for i in range(3)))
    d.text((MARG, 46), titulo, font=F_TIT, fill=(255,255,255))
    d.text((MARG, 126), subtitulo, font=F_SUB, fill=(255,255,255))

    for i, nombre in enumerate(items):
        c, f = i % COLS, i // COLS
        x = MARG + c*(CW+GUT)
        y = HEAD + 40 + f*(CH+GUT)
        d.rectangle([x, y, x+TW, y+TH], fill=GRIS)
        p = mini(nombre, sufijo)
        if p:
            t = Image.open(p); t.thumbnail((TW-2, TH-2), Image.LANCZOS)
            im.paste(t, (x + (TW-t.size[0])//2, y + (TH-t.size[1])//2))
        else:
            d.text((x+16, y+TH//2), 'FALTA', font=F_NOM, fill=ROJO)
        d.rounded_rectangle([x, y, x+68, y+40], radius=6, fill=ROJO)   # chapa de numero
        n = '%02d' % (i+1)
        d.text((x + 34 - d.textlength(n, font=F_NUM)/2, y+8), n, font=F_NUM, fill=(255,255,255))
        for j, ln in enumerate(ajusta(d, nombre, F_NOM, TW)):
            d.text((x, y+TH+10+j*24), ln, font=F_NOM, fill=TINTA)

    py = alto - FOOT
    d.line([(MARG,py),(ANCHO-MARG,py)], fill=GRIS, width=3)
    d.text((MARG, py+20), u'El número es el valor del desplegable en la capa CONTROL. El orden está CONGELADO.',
           font=F_PIE, fill=TINTA)
    d.text((MARG, py+52), u'Se añade siempre por el final: insertar o reordenar cambiaría en silencio la imagen de todas las combinaciones ya montadas.',
           font=F_PIE, fill=SUAVE)

    im.save(destino + '.png', 'PNG', optimize=True)
    im.convert('RGB').save(destino + '.pdf', 'PDF', resolution=150)
    print(os.path.basename(destino), im.size, 'items:', len(items))

hoja(ILU, '_RGB', u'Catálogo de ILUSTRACIONES',
     u'PH_M01_Branding_Ilustracion  ·  48 items  ·  desplegable «Ilustración»  ·  04_Assets/Ilustraciones',
     OUT + '/Hoja-de-contactos_ILUSTRACIONES')

hoja(FOTO, '', u'Catálogo de FOTOGRAFÍA',
     u'PH_M01_Branding_Foto  ·  23 items  ·  desplegable «Foto»  ·  04_Assets/Fotografía',
     OUT + '/Hoja-de-contactos_FOTOGRAFIA')

print('SIN MINIATURA:', FALTAN if FALTAN else 'ninguno')
