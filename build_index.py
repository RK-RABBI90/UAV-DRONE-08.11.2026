#!/usr/bin/env python3
"""Build book.json (searchable text for every page of the book).

Uses OCR (Bangla + English) when Tesseract with the 'ben' language is installed,
otherwise falls back to the PDF text layer (Bangla letters may be damaged there).

Usage:  python3 build_index.py UAV_BOOK.pdf
Needs:  poppler-utils (pdftoppm, pdftotext, pdfinfo); for OCR: tesseract-ocr tesseract-ocr-ben
"""
import json, os, re, subprocess, sys, tempfile
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

pdf = Path(sys.argv[1] if len(sys.argv) > 1 else 'UAV_BOOK.pdf')
out = pdf.with_name('book.json')
LANGS = os.environ.get('OCR_LANGS', 'ben+eng')
LIMIT = int(os.environ.get('OCR_LIMIT', '0'))   # test only: OCR first N pages

def run(*a):
    return subprocess.run(a, capture_output=True, text=True).stdout

n = int(re.search(r'Pages:\s+(\d+)', run('pdfinfo', str(pdf))).group(1))
if LIMIT:
    n = min(n, LIMIT)

def tesseract_ok():
    try:
        have = run('tesseract', '--list-langs').split()
    except FileNotFoundError:
        return False
    return all(l in have for l in LANGS.split('+'))

BAD = re.compile(r"[^\u0980-\u09FF\x20-\x7E\n\u2018\u2019\u201C\u201D\u2013\u2014\u2022]")
def tidy(t):
    t = re.sub(r'[ \t]+', ' ', t)
    return re.sub(r'\n\s*\n+', '\n', t).strip()

def layer_pages():
    raw = run('pdftotext', '-layout', str(pdf), '-').split('\f')[:n]
    pages = []
    for t in raw:
        t = BAD.sub(' ', t)
        # the PDF stores i/e/ai vowel signs before the consonant; move them after it
        t = re.sub(r'([\u09BF\u09C7\u09C8])([\u0995-\u09B9\u09DC-\u09DF])', r'\2\1', t)
        pages.append(tidy(t))
    return pages

def ocr_one(path):
    r = subprocess.run(['tesseract', path, 'stdout', '-l', LANGS, '--oem', '1', '--psm', '3'],
                       capture_output=True, text=True)
    return tidy(r.stdout)

def ocr_pages():
    tmp = tempfile.mkdtemp()
    args = ['pdftoppm', '-r', '220', '-gray', '-png']
    if LIMIT:
        args += ['-f', '1', '-l', str(n)]
    subprocess.run(args + [str(pdf), os.path.join(tmp, 'p')], check=True)
    files = sorted(Path(tmp).glob('p-*.png'))
    with ProcessPoolExecutor(max_workers=os.cpu_count() or 2) as ex:
        return list(ex.map(ocr_one, [str(f) for f in files]))

if tesseract_ok():
    print('OCR with', LANGS, 'on', n, 'pages ...')
    pages, source = ocr_pages(), 'ocr'
else:
    print('Tesseract/ben not found -> using the PDF text layer')
    pages, source = layer_pages(), 'text-layer'

data = {'source': source, 'pages': [{'n': i + 1, 't': t} for i, t in enumerate(pages)]}
out.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('Wrote', out, len(pages), 'pages,', sum(len(p) for p in pages), 'characters, source =', source)
