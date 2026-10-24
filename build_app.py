#!/usr/bin/env python3
"""Build the single-file study app from src/, the minified dataset and the language files.
Usage: python3 build_app.py            (writes dist/hub-app.html, dist/hub-app.test.html, dist/app.js and dist/csp-header.txt)
"""
import base64, hashlib, json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
DATA = ROOT / 'data' / 'security-hub-data.min.json'
UI_DIR = SRC / 'i18n' / 'ui'            # interface catalogue: {"English text": {"uk": ..., "pl": ..., "es": ..., "de": ...}}
LANG_DIR = ROOT / 'data' / 'i18n'       # dataset overlays: one file per language, text only
OUT = ROOT / 'dist'
OUT.mkdir(exist_ok=True)


def embed(obj):
    """JSON text that is safe inside a <script> element."""
    blob = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    blob = blob.replace('</', '<\\/').replace('<!--', '\\u003c!--').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    assert '</script' not in blob.lower() and '<!--' not in blob
    assert json.loads(blob) == obj, 'embedded data changed during escaping'    # it must round-trip exactly
    return blob


head = (SRC / 'head.html').read_text(encoding='utf-8').strip()
css = (SRC / 'style.css').read_text(encoding='utf-8').strip()
body = (SRC / 'body.html').read_text(encoding='utf-8').strip()
js_parts = sorted((SRC / 'js').glob('*.js'))
js = '\n\n'.join(p.read_text(encoding='utf-8').rstrip() for p in js_parts)

data = json.loads(DATA.read_text(encoding='utf-8'))
blob = embed(data)

# interface catalogue: merge the chunk files, refusing duplicate keys
catalog = {}
for p in sorted(UI_DIR.glob('*.json')) if UI_DIR.is_dir() else []:
    for key, value in json.loads(p.read_text(encoding='utf-8')).items():
        if key in catalog:
            sys.exit('Duplicate catalogue key %r in %s' % (key, p.name))
        catalog[key] = value
catalog_blob = embed(catalog)

def load_overlay(lang):
    """One language is a folder of part files (data/i18n/<lang>/*.json), merged section by section; an id may appear only once."""
    merged = {}
    for p in sorted((LANG_DIR / lang).glob('*.json')):
        part = json.loads(p.read_text(encoding='utf-8'))
        for section, value in part.items():
            if isinstance(value, dict) and section not in ('meta',):
                target = merged.setdefault(section, {})
                for rid, rec in value.items():
                    if rid in target:
                        sys.exit('Duplicate id %r in section %r of %s/%s' % (rid, section, lang, p.name))
                    target[rid] = rec
            else:
                merged[section] = value
    return merged


# dataset overlays, one script element per language
overlays = {}
for d in sorted(LANG_DIR.iterdir()) if LANG_DIR.is_dir() else []:
    if d.is_dir():
        overlays[d.name] = load_overlay(d.name)
overlay_tags = ''.join('<script type="application/json" id="hub-lang-%s">%s</script>\n' % (k, embed(v)) for k, v in sorted(overlays.items()))

# source hygiene: the app teaches security, so it must not teach by bad example
problems = []
for pat, why in [
    (r'\binnerHTML\b', 'innerHTML'), (r'\bouterHTML\b', 'outerHTML'), (r'insertAdjacentHTML', 'insertAdjacentHTML'),
    (r'document\.write', 'document.write'), (r'\beval\s*\(', 'eval'), (r'new\s+Function\s*\(', 'new Function'),
    (r'setTimeout\s*\(\s*[\'"]', 'string timer'), (r'\bon[a-z]+\s*=\s*["\']', 'inline handler'),
    (r'<script[^>]+src=', 'remote script'),
    (r'setAttribute\(\s*[\'"]style[\'"]', 'style attribute (blocked by the content security policy)'),
]:
    if re.search(pat, js):
        problems.append(why)
# The only URLs allowed in code: the SVG namespace, and the search address used for labs that have no stored link.
ALLOWED_URLS = {'http://www.w3.org/2000/svg', 'https://duckduckgo.com/?q='}
for m in re.finditer(r'https?://[^\s\'")]+', js):
    if m.group(0) not in ALLOWED_URLS:
        problems.append('URL in code: ' + m.group(0))
if problems:
    sys.exit('Source hygiene failed: ' + ', '.join(problems))

style_text = '\n' + css + '\n'
script_text = "\n(function () {\n'use strict';\n" + js + "\n}());\n"

fragment = (head + '\n<style>' + style_text + '</style>\n' + body + '\n'
            + '<script type="application/json" id="hub-data">' + blob + '</script>\n'
            + '<script type="application/json" id="hub-ui">' + catalog_blob + '</script>\n'
            + overlay_tags
            + '<script>' + script_text + '</script>\n')
(OUT / 'hub-app.html').write_text(fragment, encoding='utf-8')


def sha256_source(text):
    return "'sha256-" + base64.b64encode(hashlib.sha256(text.encode('utf-8')).digest()).decode('ascii') + "'"


# Content security policy for the complete page. Only the two inline blocks (by hash) and the font stylesheet are allowed;
# nothing can connect anywhere, and no form or base address can be set. frame-ancestors cannot be set in a meta tag, so it is
# added only in the header form that is written to dist/csp-header.txt for hosts that can send headers.
def make_csp(style_texts):
    return '; '.join([
        "default-src 'none'",
        'script-src ' + sha256_source(script_text),
        'style-src ' + ' '.join(sha256_source(t) for t in style_texts) + ' https://fonts.googleapis.com',
        'font-src https://fonts.gstatic.com',
        "connect-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
    ])


skeleton_style = (':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
                  'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}')
(OUT / 'csp-header.txt').write_text('Content-Security-Policy: ' + make_csp([style_text]) + "; frame-ancestors 'none'\n", encoding='utf-8')
page_csp = make_csp([skeleton_style, style_text])

skeleton = ('<!doctype html><html><head><meta charset=utf8>'
            '<meta http-equiv="Content-Security-Policy" content="' + page_csp + '">'
            '<meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>'
            + skeleton_style +
            '</style></head><body>')
(OUT / 'hub-app.test.html').write_text(skeleton + fragment + '</body></html>', encoding='utf-8')
(OUT / 'app.js').write_text(script_text.lstrip('\n'), encoding='utf-8')
print('built', len(fragment) // 1024, 'KB fragment;', len(js) // 1024, 'KB js;', len(css) // 1024, 'KB css;', len(blob) // 1024, 'KB data;',
      len(catalog), 'interface strings;', len(overlays), 'language overlays;', len(js_parts), 'js parts')
