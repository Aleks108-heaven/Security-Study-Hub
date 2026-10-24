#!/usr/bin/env python3
"""Negative tests for the dataset checks: each mutation must be rejected by validate_dataset.py
and, where jsonschema is installed, by the JSON Schema as well.

Usage: python3 test_validator.py [security-hub-data.json] [security-hub-data.schema.json]
"""
import copy, json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
data_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'security-hub-data.json')
schema_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'security-hub-data.schema.json')
base = json.load(open(data_path, encoding='utf-8'))
try:
    import jsonschema
    from jsonschema import Draft202012Validator
    schema = json.load(open(schema_path, encoding='utf-8'))
    SV = Draft202012Validator(schema, format_checker=Draft202012Validator.FORMAT_CHECKER)
except Exception:
    SV = None

def m_answer_range(d): d['questions'][0]['answer'] = 4
def m_answer_negative(d): d['questions'][1]['answer'] = -1
def m_three_options(d): d['questions'][2]['options'] = d['questions'][2]['options'][:3]
def m_dup_options(d): d['questions'][3]['options'][1] = d['questions'][3]['options'][0]
def m_unknown_topic(d): d['glossary'][0]['topic'] = 'nope'
def m_bad_difficulty(d): d['flashcards'][0]['difficulty'] = 4
def m_dup_glossary_id(d): d['glossary'][1]['id'] = d['glossary'][0]['id']
def m_no_explanation(d): del d['questions'][4]['explanation']
def m_short_explanation(d): d['questions'][5]['explanation'] = 'Too short.'
def m_bad_testcase_type(d): d['testcases'][0]['type'] = 'weird'
def m_http_resource(d): d['resources'][0]['url'] = 'http://example.com/x'
def m_exam_points(d): d['exams']['ct-ste']['passPoints'] = 99
def m_missing_module(d): d['modules'].pop()
def m_bad_klevel(d): d['questions'][6]['k'] = 'K5'
def m_placeholder(d): d['glossary'][2]['definition'] = 'TODO write this definition later'
def m_empty_refs(d): d['testcases'][1]['refs'] = []
def m_extra_key(d): d['surprise'] = 1
def m_roadmap_hours(d): d['roadmap']['totalHours'] += 1
def m_dup_stem(d): d['questions'][8]['stem'] = d['questions'][7]['stem']
def m_core_count(d): d['flashcards'][0]['core'] = False

MUTATIONS = [v for k, v in sorted(globals().items()) if k.startswith('m_')]
# mutations the JSON Schema cannot express (cross-record rules) are marked
VALIDATOR_ONLY = {'m_dup_options', 'm_dup_glossary_id', 'm_exam_points', 'm_missing_module', 'm_placeholder', 'm_roadmap_hours', 'm_dup_stem',
                  'm_core_count', 'm_short_explanation_ok'}

failures = []
for fn in MUTATIONS:
    d = copy.deepcopy(base)
    fn(d)
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False)
        tmp = f.name
    r = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'validate_dataset.py'), tmp], capture_output=True, text=True)
    os.unlink(tmp)
    caught_val = r.returncode != 0
    caught_schema = None
    if SV is not None:
        caught_schema = any(True for _ in SV.iter_errors(d))
    ok = caught_val and (caught_schema or fn.__name__ in VALIDATOR_ONLY or caught_schema is None)
    print('%-22s validator=%-5s schema=%-5s %s' % (fn.__name__, caught_val, caught_schema, 'ok' if ok else 'MISSED'))
    if not ok: failures.append(fn.__name__)

# the unmutated dataset must pass
r = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'validate_dataset.py'), data_path], capture_output=True, text=True)
print('baseline dataset passes:', r.returncode == 0)
if r.returncode != 0 or failures:
    print('FAILED:', failures); sys.exit(1)
print('all %d negative tests behaved as expected' % len(MUTATIONS))
