#!/usr/bin/env python3
"""Validate security-hub-data.json (stdlib only).

Usage:  python3 validate_dataset.py [path-to-json]

Exit code 0 = no errors (warnings may remain); 1 = at least one error.
Errors are hard defects (broken references, bad answer keys, duplicates).
Warnings are quality smells (answer-position bias, long correct options, thin topics).
"""
import json, re, sys, collections

path = sys.argv[1] if len(sys.argv) > 1 else 'security-hub-data.json'
d = json.load(open(path, encoding='utf-8'))
errors, warnings = [], []
E = errors.append
W = warnings.append

REQUIRED = ['meta', 'tracks', 'topics', 'roadmap', 'certifications', 'modules', 'glossary', 'flashcards',
            'questions', 'testcases', 'tools', 'labs', 'resources', 'reference', 'exams', 'app']
for k in REQUIRED:
    if k not in d:
        E('missing top-level key: ' + k)
for k in d:
    if k not in REQUIRED:
        E('unexpected top-level key: ' + k)
if errors:
    print('\n'.join('ERROR ' + e for e in errors)); sys.exit(1)

topic_ids = [t['id'] for t in d['topics']]
topic_set = set(topic_ids)
if len(topic_ids) != len(topic_set): E('duplicate topic ids')

def unique(coll, name, key='id'):
    seen = collections.Counter(x[key] for x in d[coll])
    for k, n in seen.items():
        if n > 1: E('%s: duplicate %s %r (x%d)' % (name, key, k, n))

for c in ['glossary', 'flashcards', 'questions', 'testcases', 'tools', 'labs', 'resources', 'modules', 'certifications']:
    unique(c, c)

# --- tracks, roadmap, modules reference only known topics
for t in d['tracks']:
    for x in t['topics']:
        if x not in topic_set: E('track %s: unknown topic %r' % (t['id'], x))
for s in d['roadmap']['stages']:
    for x in s['topics']:
        if x not in topic_set: E('roadmap stage %s: unknown topic %r' % (s['id'], x))
for s in d['roadmap']['specialisations']:
    for x in s['topics']:
        if x not in topic_set: E('specialisation %s: unknown topic %r' % (s['id'], x))
if sum(s['hours'] for s in d['roadmap']['stages'] if s['hours']) != d['roadmap']['totalHours']:
    E('roadmap totalHours does not equal the sum of stage hours')
mod_by_topic = collections.Counter(m['topic'] for m in d['modules'])
for t in topic_ids:
    if mod_by_topic[t] != 1: E('topic %s has %d modules (expected 1)' % (t, mod_by_topic[t]))
for t in d['topics']:
    if t['module'] not in {m['id'] for m in d['modules']}: E('topic %s points at missing module %s' % (t['id'], t['module']))
for m in d['modules']:
    if not m['objectives']: E('module %s has no objectives' % m['id'])
    for o in m['objectives']:
        if o['k'] not in ('K1', 'K2', 'K3', 'K4'): E('module %s: bad K level %r' % (m['id'], o['k']))
    if not (30 <= m['estimatedMinutes'] <= 600): W('module %s: estimatedMinutes %s outside 30..600' % (m['id'], m['estimatedMinutes']))
    if len(m['keyPoints']) < 4: W('module %s: fewer than 4 key points' % m['id'])

# --- glossary
terms = collections.Counter(g['term'].strip().lower() for g in d['glossary'])
for k, n in terms.items():
    if n > 1: E('glossary: duplicate term %r' % k)
for g in d['glossary']:
    if g['topic'] not in topic_set: E('glossary %s: unknown topic %r' % (g['id'], g['topic']))
    L = len(g['definition'])
    if L < 20: E('glossary %s: definition too short (%d)' % (g['id'], L))
    if L > 420: W('glossary %s: definition long (%d chars)' % (g['id'], L))
    if g['definition'].strip().lower().startswith(g['term'].strip().lower() + ' is'):
        W('glossary %s: definition starts by repeating the term' % g['id'])
per = collections.Counter(g['topic'] for g in d['glossary'])
for t in topic_ids:
    if per[t] < 8: W('glossary: topic %s has only %d terms' % (t, per[t]))

# --- flashcards
qs = collections.Counter(re.sub(r'\W+', ' ', f['q'].lower()).strip() for f in d['flashcards'])
for k, n in qs.items():
    if n > 1: E('flashcards: duplicate question text %r' % k)
for f in d['flashcards']:
    if f['topic'] not in topic_set: E('flashcard %s: unknown topic' % f['id'])
    if f['difficulty'] not in (1, 2, 3): E('flashcard %s: difficulty %r' % (f['id'], f['difficulty']))
    if not f['q'].strip() or not f['a'].strip(): E('flashcard %s: empty side' % f['id'])
    if len(f['a']) > 420: W('flashcard %s: long answer (%d chars)' % (f['id'], len(f['a'])))
per = collections.Counter(f['topic'] for f in d['flashcards'])
core = collections.Counter(f['topic'] for f in d['flashcards'] if f['core'])
for t in topic_ids:
    if per[t] < 8: W('flashcards: topic %s has only %d cards' % (t, per[t]))
    if core[t] != 4: E('flashcards: topic %s has %d core cards (expected 4)' % (t, core[t]))

# --- questions
stems = collections.Counter(re.sub(r'\W+', ' ', q['stem'].lower()).strip() for q in d['questions'])
for k, n in stems.items():
    if n > 1: E('questions: duplicate stem %r' % k)
longest_correct = 0
pos = collections.Counter()
for q in d['questions']:
    i = q['id']
    if q['topic'] not in topic_set: E('%s: unknown topic' % i)
    if q['k'] not in ('K1', 'K2', 'K3', 'K4'): E('%s: bad K level %r' % (i, q['k']))
    o = q['options']
    if len(o) != 4: E('%s: expected 4 options, found %d' % (i, len(o)))
    if len({x.strip().lower() for x in o}) != len(o): E('%s: duplicate options' % i)
    if not isinstance(q['answer'], int) or not (0 <= q['answer'] < len(o)): E('%s: answer index out of range' % i); continue
    pos[q['answer']] += 1
    if len(q['explanation']) < 30: E('%s: explanation too short' % i)
    elif len(q['explanation']) < 70: W('%s: explanation is only %d chars (aim for 70+ so it teaches)' % (i, len(q['explanation'])))
    for x in o:
        if re.search(r'\b(all|none) of the above\b', x, re.I): E('%s: uses all/none of the above' % i)
        if not x.strip(): E('%s: empty option' % i)
    lens = [len(x) for x in o]
    if lens[q['answer']] == max(lens) and lens.count(max(lens)) == 1: longest_correct += 1
    if max(lens) > 3 * max(1, min(lens)) and max(lens) > 60: W('%s: option lengths very uneven (%s)' % (i, lens))
    if not (q['stem'].rstrip().endswith('?') or q['stem'].rstrip().endswith(':') or q['stem'].rstrip().endswith('.')):
        W('%s: stem does not end with ? : or .' % i)
NQ = len(d["questions"])
for p in range(4):
    share = pos[p] / NQ
    if share < 0.15 or share > 0.35: W('questions: correct answer sits at position %d in %.0f%% of questions' % (p + 1, 100 * share))
if longest_correct / NQ > 0.40:
    W('questions: the correct option is the unique longest in %.0f%% of questions (test-wiseness bias)' % (100 * longest_correct / NQ))
per = collections.Counter(q['topic'] for q in d['questions'])
for t in topic_ids:
    if per[t] < 6: W('questions: topic %s has only %d questions' % (t, per[t]))
    qc = sum(1 for q in d['questions'] if q['topic'] == t and q['core'])
    if qc != 2: E('questions: topic %s has %d core questions (expected 2)' % (t, qc))

# --- test cases
types = {'positive', 'negative', 'boundary', 'exploratory'}
for t in d['testcases']:
    if t['type'] not in types: E('testcase %s: bad type %r' % (t['id'], t['type']))
    if not t['refs']: E('testcase %s: no refs' % t['id'])
    if not t['test'] or not t['expected']: E('testcase %s: empty test or expected' % t['id'])
if len(d['testcases']) != 46: W('testcases: expected 46, found %d' % len(d['testcases']))
tc = collections.Counter(t['type'] for t in d['testcases'])
if tc['negative'] < tc['positive']: W('testcases: fewer negative than positive tests (%s)' % dict(tc))

# --- labs, resources, tools
for l in d['labs']:
    if l['url'] and not l['url'].startswith('https://'): E('lab %s: non-https URL %r' % (l['id'], l['url']))
    for s in l['sections']:
        if not (1 <= s <= 24): E('lab %s: section %r out of range' % (l['id'], s))
for r in d['resources']:
    if not r['url'].startswith('https://'): E('resource %s: non-https URL %r' % (r['id'], r['url']))
urls = collections.Counter(r['url'] for r in d['resources'])
for u, k in urls.items():
    if k > 1: W('resources: duplicate url %s' % u)
for t in d['tools']:
    if not t['tools']: E('tool row %s: empty tool list' % t['id'])

# --- reference tables
expect = {'owaspTop10_2025': 10, 'owaspApiTop10_2023': 10, 'owaspLlmTop10_2025': 10, 'wstgCategories': 12, 'testProcessStages': 5}
for k, n in expect.items():
    got = len(d['reference'][k]['rows'])
    if got != n: E('reference %s: expected %d rows, found %d' % (k, n, got))
for k, v in d['reference'].items():
    keys = [c['key'] for c in v['columns']]
    for ri, row in enumerate(v['rows']):
        for kk in keys:
            if not str(row.get(kk, '')).strip(): W('reference %s row %d: empty cell %s' % (k, ri + 1, kk))

# --- exams
for k, e in d['exams'].items():
    if not (0 < e['passPoints'] <= e['points']): E('exam %s: bad point values' % k)
    if e['questions'] <= 0 or e['minutes'] <= 0: E('exam %s: bad size' % k)

# --- text hygiene and safety scan over every string
def walk(x, p=''):
    if isinstance(x, str): yield p, x
    elif isinstance(x, list):
        for i, y in enumerate(x): yield from walk(y, '%s[%d]' % (p, i))
    elif isinstance(x, dict):
        for k, y in x.items(): yield from walk(y, p + '.' + k)
RISKY = [r'<script', r'union\s+select', r"'\s*or\s+1\s*=\s*1", r';\s*drop\s+table', r'rm\s+-rf', r'nc\s+-e', r'meterpreter',
         r'msfvenom', r'reverse shell', r'javascript:', r'onerror\s*=', r'\.\./\.\./']
for p, s in walk(d):
    if s != s.strip(): W('whitespace at edge: %s' % p)
    if '  ' in s: W('double space: %s' % p)
    if re.search(r'\b(TODO|FIXME|XXX|lorem ipsum)\b', s, re.I): E('placeholder text at %s' % p)
    if re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', s): E('control character at %s' % p)
    for rx in RISKY:
        if re.search(rx, s, re.I): W('payload-like text %r at %s (review: must be educational, not weaponised)' % (rx, p))
    if re.search(r'—|–', s) and False: pass

print('dataset: %s' % path)
print('counts :', json.dumps(d['meta']['counts']))
print('question answer positions:', dict(sorted(pos.items())), '| unique-longest-correct: %.0f%%' % (100 * longest_correct / NQ))
for e in errors: print('ERROR  ' + e)
for w in warnings: print('WARN   ' + w)
print('%d error(s), %d warning(s)' % (len(errors), len(warnings)))
sys.exit(1 if errors else 0)
