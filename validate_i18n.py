#!/usr/bin/env python3
"""Check the translations of the study app (standard library only).

  python3 validate_i18n.py            full check; exit code 1 on any error
  python3 validate_i18n.py --list     every interface string found in the source, with the files that use it
  python3 validate_i18n.py --missing  a JSON skeleton of the interface strings that have no catalogue entry yet

Interface strings: every __('...'), _N('...') and plural(n, '...') in src/js must have an entry in src/i18n/ui/*.json with a
non-empty text for each language, the same {0} {1} placeholders as the English text, and the plural forms the language needs.
Dataset overlays (a folder data/i18n/<lang>/ of part files): text only, keyed by record id, with the shape applyOverlay() in the app accepts. Every
number in the English text of a question, option or explanation must appear in the translation, so a slip in a figure cannot
change what an answer says. Coverage per collection is reported; incomplete coverage is a warning, a malformed record is an error.
"""
import collections, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent
JS_DIR = ROOT / 'src' / 'js'
UI_DIR = ROOT / 'src' / 'i18n' / 'ui'
LANG_DIR = ROOT / 'data' / 'i18n'
DATA = ROOT / 'data' / 'security-hub-data.min.json'
LANGS = ['uk', 'pl', 'es', 'de']
PLURAL_FORMS = {'uk': ['one', 'few', 'many', 'other'], 'pl': ['one', 'few', 'many', 'other'], 'es': ['one', 'other'], 'de': ['one', 'other']}
CYRILLIC = re.compile('[Ѐ-ӿ]')
PLACEHOLDER = re.compile(r'\{(\d+)\}')
NUMBER = re.compile(r'\d+(?:[.,]\d+)?')

errors, warnings = [], []
def err(msg): errors.append(msg)
def warn(msg): warnings.append(msg)

WORD = re.compile(r'[A-Za-zЀ-ӿ’\']+')
def mixed_script(text):
    """Words that mix Latin and Cyrillic letters, usually a Latin look-alike typed inside a Ukrainian word."""
    out = []
    for w in WORD.findall(text):
        if re.search('[A-Za-z]', w) and re.search('[Ѐ-ӿ]', w): out.append(w)
    return out


# ---------- reading the JavaScript source ----------
def strip_comments(code):
    """Remove comments while keeping strings, template literals and regular-expression literals intact."""
    out, i, n = [], 0, len(code)
    prev = ''                                   # last significant character, to tell a regex from a division
    while i < n:
        c = code[i]
        two = code[i:i + 2]
        if two == '//':
            while i < n and code[i] != '\n': i += 1
            continue
        if two == '/*':
            j = code.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        if c in '\'"`':
            j = i + 1
            while j < n and code[j] != c:
                j += 2 if code[j] == '\\' else 1
            out.append(code[i:j + 1]); i = j + 1; prev = c
            continue
        if c == '/' and (prev == '' or prev in '(,=:[!&|?{};' or re.search(r'\breturn\s*$', ''.join(out[-12:]))):
            j, in_class = i + 1, False
            while j < n and (code[j] != '/' or in_class):
                if code[j] == '\\': j += 1
                elif code[j] == '[': in_class = True
                elif code[j] == ']': in_class = False
                j += 1
            out.append(code[i:j + 1]); i = j + 1; prev = '/'
            continue
        out.append(c)
        if not c.isspace(): prev = c
        i += 1
    return ''.join(out)


def split_args(code, start):
    """Arguments (raw text) of the call whose '(' is at code[start]. Returns (args, end)."""
    args, depth, i, cur, n = [], 0, start, [], len(code)
    while i < n:
        c = code[i]
        if c in '\'"`':
            j = i + 1
            while j < n and code[j] != c:
                j += 2 if code[j] == '\\' else 1
            cur.append(code[i:j + 1]); i = j + 1
            continue
        if c in '([{':
            depth += 1
            if depth > 1: cur.append(c)
        elif c in ')]}':
            depth -= 1
            if depth == 0:
                args.append(''.join(cur).strip())
                return args, i
            cur.append(c)
        elif c == ',' and depth == 1:
            args.append(''.join(cur).strip()); cur = []
        else:
            cur.append(c)
        i += 1
    return args, n


def literal(raw):
    """The text of a plain string literal, or None when the argument is anything else."""
    raw = raw.strip()
    if len(raw) < 2 or raw[0] not in '\'"' or raw[-1] != raw[0]:
        return None
    body, out, i = raw[1:-1], [], 0
    while i < len(body):
        c = body[i]
        if c == '\\':
            nxt = body[i + 1]
            if nxt == 'n': out.append('\n')
            elif nxt == 't': out.append('\t')
            elif nxt == 'u': out.append(chr(int(body[i + 2:i + 6], 16))); i += 4
            else: out.append(nxt)
            i += 2
        else:
            if c == raw[0]: return None            # a quote inside means this was several literals joined with +
            out.append(c); i += 1
    return ''.join(out)


CALL = re.compile(r'(?<![\w$.])(__|_N|plural|pluralWord)\(')

def extract_keys():
    """{key: set(files)}, plus the calls whose key is not a plain literal."""
    keys, dynamic = collections.defaultdict(set), []
    for path in sorted(JS_DIR.glob('*.js')):
        code = strip_comments(path.read_text(encoding='utf-8'))
        for m in CALL.finditer(code):
            fn = m.group(1)
            args, _ = split_args(code, m.end() - 1)
            if fn in ('__', '_N'):
                lit = literal(args[0]) if args else None
                if lit is None: dynamic.append((path.name, fn + '(' + (args[0] if args else '') + ')'))
                else: keys[lit].add(path.name)
            else:
                lit = literal(args[1]) if len(args) > 1 else None
                if lit is None: dynamic.append((path.name, fn + '(' + ', '.join(args) + ')'))
                else: keys['plural:' + lit].add(path.name)
    return keys, dynamic


# ---------- interface catalogue ----------
def load_catalog():
    cat = {}
    for p in sorted(UI_DIR.glob('*.json')) if UI_DIR.is_dir() else []:
        try:
            part = json.loads(p.read_text(encoding='utf-8'))
        except ValueError as e:
            err('%s is not valid JSON: %s' % (p.name, e)); continue
        for k, v in part.items():
            if k in cat: err('duplicate catalogue key %r (also in %s)' % (k, p.name))
            cat[k] = v
    return cat


def check_catalog(keys, cat, data):
    dataset_enums = set()                       # dataset words shown through the catalogue (cost and level labels)
    for lab in data['labs']: dataset_enums.update([lab['cost'], lab['level']])
    for tool in data['tools']: dataset_enums.add(tool['cost'])
    needed = set(keys) | dataset_enums
    for k in sorted(needed):
        entry = cat.get(k)
        if entry is None:
            err('no catalogue entry for %r%s' % (k, '' if k in keys else ' (a dataset value)')); continue
        plural = k.startswith('plural:')
        scan_mixed('uk', entry.get('uk') if isinstance(entry, dict) else None, 'catalogue ' + k[:40])
        for lang in LANGS:
            v = entry.get(lang) if isinstance(entry, dict) else None
            if plural:
                if not isinstance(v, dict): err('%r: %s needs a dict of plural forms' % (k, lang)); continue
                for form in PLURAL_FORMS[lang]:
                    if not isinstance(v.get(form), str) or not v[form].strip(): err('%r: %s is missing the plural form %r' % (k, lang, form))
                if lang == 'uk' and any(isinstance(x, str) and x and not CYRILLIC.search(x) for x in v.values()): err('%r: uk has a form without Cyrillic letters' % k)
                continue
            if not isinstance(v, str) or not v.strip():
                err('%r: no %s text' % (k, lang)); continue
            if sorted(PLACEHOLDER.findall(v)) != sorted(PLACEHOLDER.findall(k)):
                err('%r: %s placeholders differ: %r' % (k, lang, v))
            if lang == 'uk' and v != k and re.search('[A-Za-z]{4,}', re.sub(r'\{\d+\}', '', v)) and not CYRILLIC.search(v):
                warn('%r: uk text has no Cyrillic letters: %r' % (k, v))
    for k in sorted(set(cat) - needed):
        warn('catalogue entry not used by the source: %r' % k)


# ---------- dataset overlays ----------
def numbers(text):
    return collections.Counter(n.replace(',', '.') for n in NUMBER.findall(text))

def same_numbers(en, tr):
    """Every number of the English text is present in the translation (extra numbers are tolerated: "one" can become "1")."""
    return not (numbers(en) - numbers(tr))


def scan_mixed(lang, node, where):
    if lang != 'uk': return
    if isinstance(node, str):
        for w in mixed_script(node): err('uk: mixed Latin and Cyrillic letters in %r (%s)' % (w, where))
    elif isinstance(node, list):
        for i, x in enumerate(node): scan_mixed(lang, x, where)
    elif isinstance(node, dict):
        for k, v in node.items(): scan_mixed(lang, v, where + '/' + str(k))


def check_overlay(lang, ov, data):
    cover = {}
    scan_mixed(lang, ov, lang)
    def rec(coll, key, fields, strict=()):
        src = ov.get(key, {})
        if not isinstance(src, dict): err('%s: "%s" must be an object' % (lang, key)); return
        base = {r['id']: r for r in data[coll]}
        done = 0
        for rid, o in src.items():
            if rid not in base: err('%s: %s has an unknown id %r' % (lang, key, rid)); continue
            if not isinstance(o, dict): err('%s: %s/%s must be an object' % (lang, key, rid)); continue
            extra = set(o) - set(fields)
            if extra: err('%s: %s/%s has fields that may not be translated: %s' % (lang, key, rid, sorted(extra)))
            if not all(isinstance(o.get(f), str) and o[f].strip() for f in fields):
                err('%s: %s/%s needs non-empty text for %s' % (lang, key, rid, fields)); continue
            for f in fields:
                if lang == 'uk' and not CYRILLIC.search(o[f]) and len(base[rid].get(f, '')) > 25: warn('uk: %s/%s.%s has no Cyrillic letters' % (key, rid, f))
                if not same_numbers(base[rid][f], o[f]):
                    (err if f in strict else warn)('%s: %s/%s.%s changes a number: %r -> %r' % (lang, key, rid, f, base[rid][f][:80], o[f][:80]))
            done += 1
        cover[key] = (done, len(base))

    rec('tracks', 'tracks', ['name', 'description'])
    rec('topics', 'topics', ['name', 'scope'])
    rec('glossary', 'glossary', ['term', 'definition'])
    rec('flashcards', 'flashcards', ['q', 'a'], strict=('q', 'a'))
    rec('testcases', 'testcases', ['group', 'feature', 'test', 'expected'])
    rec('certifications', 'certifications', ['fits', 'notes'])
    rec('tools', 'tools', ['purpose', 'use'])
    rec('labs', 'labs', ['focus'])
    rec('resources', 'resources', ['note'])

    # questions: stem, four options in the stored order, explanation. Numbers are strict because they decide which option is right.
    qs = ov.get('questions', {})
    base = {r['id']: r for r in data['questions']}
    done = 0
    for qid, o in qs.items():
        if qid not in base: err('%s: questions has an unknown id %r' % (lang, qid)); continue
        extra = set(o) - {'stem', 'options', 'explanation'}
        if extra: err('%s: questions/%s has fields that may not be translated: %s (the answer key is never part of an overlay)' % (lang, qid, sorted(extra)))
        b = base[qid]
        if not (isinstance(o.get('stem'), str) and isinstance(o.get('explanation'), str) and isinstance(o.get('options'), list)
                and len(o['options']) == len(b['options']) and all(isinstance(x, str) and x.strip() for x in o['options'])
                and o['stem'].strip() and o['explanation'].strip()):
            err('%s: questions/%s needs stem, explanation and exactly %d options' % (lang, qid, len(b['options']))); continue
        if len(set(o['options'])) != len(o['options']): err('%s: questions/%s has two identical options' % (lang, qid))
        for label, en, tr in [('stem', b['stem'], o['stem']), ('explanation', b['explanation'], o['explanation'])] + \
                [('option %d' % (i + 1), b['options'][i], o['options'][i]) for i in range(len(b['options']))]:
            if not same_numbers(en, tr): err('%s: questions/%s %s changes a number: %r -> %r' % (lang, qid, label, en[:80], tr[:80]))
            if lang == 'uk' and not CYRILLIC.search(tr) and len(en) > 25: warn('uk: questions/%s %s has no Cyrillic letters' % (qid, label))
        done += 1
    cover['questions'] = (done, len(base))

    # modules
    mo = ov.get('modules', {})
    base = {r['id']: r for r in data['modules']}
    done = 0
    for mid, o in mo.items():
        if mid not in base: err('%s: modules has an unknown id %r' % (lang, mid)); continue
        b = base[mid]
        ok = isinstance(o.get('title'), str) and isinstance(o.get('summary'), str)
        for f, want in (('objectives', len(b['objectives'])), ('keyPoints', len(b['keyPoints'])), ('practice', len(b['practice']))):
            ok = ok and isinstance(o.get(f), list) and len(o[f]) == want and all(isinstance(x, str) and x.strip() for x in o[f])
        if not ok: err('%s: modules/%s needs title, summary and objectives, keyPoints, practice with the same counts as English' % (lang, mid)); continue
        for f in ('summary',):
            if not same_numbers(b[f], o[f]): warn('%s: modules/%s.%s changes a number' % (lang, mid, f))
        for i, t in enumerate(o['objectives']):
            if not same_numbers(b['objectives'][i]['text'], t): warn('%s: modules/%s objective %d changes a number' % (lang, mid, i + 1))
        done += 1
    cover['modules'] = (done, len(base))

    # roadmap
    rm = ov.get('roadmap', {})
    stages = rm.get('stages', {}) if isinstance(rm, dict) else {}
    done = 0
    for s in data['roadmap']['stages']:
        o = stages.get(str(s['id']))
        if isinstance(o, dict) and all(isinstance(o.get(f), str) and o[f].strip() for f in ('name', 'focus', 'gate')): done += 1
    for sid in stages:
        if sid not in {str(s['id']) for s in data['roadmap']['stages']}: err('%s: roadmap has an unknown stage %r' % (lang, sid))
    cover['roadmap'] = (done, len(data['roadmap']['stages']))
    specs = rm.get('specialisations', {}) if isinstance(rm, dict) else {}
    for sid in specs:
        if sid not in {s['id'] for s in data['roadmap']['specialisations']}: err('%s: roadmap has an unknown specialisation %r' % (lang, sid))

    # reference tables: columns and rows with the same shape as English
    refs = ov.get('reference', {})
    done = 0
    for key, o in refs.items():
        if key not in data['reference']: err('%s: reference has an unknown table %r' % (lang, key)); continue
        T = data['reference'][key]
        ok = isinstance(o, dict) and isinstance(o.get('columns'), dict) and isinstance(o.get('rows'), list) and len(o['rows']) == len(T['rows'])
        ok = ok and all(isinstance(o['columns'].get(c['key']), str) and o['columns'][c['key']].strip() for c in T['columns'])
        if ok:
            for i, row in enumerate(T['rows']):
                orow = o['rows'][i]
                if not isinstance(orow, dict): ok = False; break
                for k, v in row.items():
                    if isinstance(v, str) and not (isinstance(orow.get(k), str) and orow[k].strip()): ok = False
                    if isinstance(v, list) and not (isinstance(orow.get(k), list) and len(orow[k]) == len(v) and all(isinstance(x, str) and x.strip() for x in orow[k])): ok = False
        if not ok: err('%s: reference/%s does not match the shape of the English table (same rows, same columns, same list lengths)' % (lang, key)); continue
        done += 1
    cover['reference'] = (done, len(data['reference']))

    for key in ov:
        if key not in ('lang', 'status', 'meta', 'tracks', 'topics', 'glossary', 'flashcards', 'testcases', 'certifications', 'tools', 'labs',
                       'resources', 'questions', 'modules', 'roadmap', 'reference', 'exams'):
            err('%s: unknown overlay section %r' % (lang, key))
    if ov.get('lang') != lang: err('%s: the "lang" field must be %r' % (lang, lang))
    return cover


def load_overlay(lang):
    """data/i18n/<lang>/*.json merged section by section, exactly as build_app.py does; a record id may appear only once."""
    merged = {}
    for p in sorted((LANG_DIR / lang).glob('*.json')):
        try:
            part = json.loads(p.read_text(encoding='utf-8'))
        except ValueError as e:
            err('%s/%s is not valid JSON: %s' % (lang, p.name, e)); return None
        for section, value in part.items():
            if isinstance(value, dict) and section != 'meta':
                target = merged.setdefault(section, {})
                for rid, rec in value.items():
                    if rid in target: err('%s: id %r is defined twice in section %r (%s)' % (lang, rid, section, p.name))
                    target[rid] = rec
            else:
                merged[section] = value
    return merged


def main():
    data = json.loads(DATA.read_text(encoding='utf-8'))
    keys, dynamic = extract_keys()
    if '--list' in sys.argv:
        for k in sorted(keys): print('%-60s %s' % (k[:60], ', '.join(sorted(keys[k]))))
        print('\n%d keys' % len(keys)); return 0
    cat = load_catalog()
    if '--missing' in sys.argv:
        out = {}
        for k in sorted(keys):
            if k not in cat:
                out[k] = ({l: {f: '' for f in PLURAL_FORMS[l]} for l in LANGS} if k.startswith('plural:') else {l: '' for l in LANGS})
        print(json.dumps(out, ensure_ascii=False, indent=1)); return 0
    check_catalog(keys, cat, data)
    print('interface: %d strings in the source, %d catalogue entries, %d calls with a non-literal key (they pass _N-marked or dataset text)' % (len(keys), len(cat), len(dynamic)))
    for lang in LANGS:
        folder = LANG_DIR / lang
        if not folder.is_dir():
            warn('no dataset overlay for %s' % lang); continue
        ov = load_overlay(lang)
        if ov is None: continue
        cover = check_overlay(lang, ov, data)
        short = {k: v for k, v in cover.items() if v[0] != v[1]}
        print('%s: %s' % (lang, ', '.join('%s %d/%d' % (k, v[0], v[1]) for k, v in cover.items())))
        for k, v in short.items(): warn('%s: %s is translated for %d of %d records; the rest shows in English' % (lang, k, v[0], v[1]))
    for w in warnings[:60]: print('warning:', w)
    if len(warnings) > 60: print('... and %d more warnings' % (len(warnings) - 60))
    for e in errors[:100]: print('ERROR:', e)
    if len(errors) > 100: print('... and %d more errors' % (len(errors) - 100))
    print('%d error(s), %d warning(s)' % (len(errors), len(warnings)))
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
