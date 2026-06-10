"""软著源程序文档 PDF — 60页, 每页50行, 宋体/等宽, 黑白"""
from fpdf import FPDF
import os, glob

LPP = 50  # lines per page
FS = 5.8  # font size (reduced to fit longer lines)
LH = 3.8  # line height mm

# Find CJK font
font_path = None
for p in glob.glob(r'C:\Windows\Fonts\simsun*'):
    font_path = p; break
for p in glob.glob(r'C:\Windows\Fonts\msyh*'):
    if not font_path: font_path = p; break
if not font_path:
    raise RuntimeError('No CJK font found')
print(f'Font: {font_path}')

class PDF(FPDF):
    def header(self):
        self.set_font('CJK', '', 8)
        self.set_text_color(0, 0, 0)
        self.cell(0, 7, '呲啦起始页软件V1.0｜开发完成日期：2026-06-01', align='C')
        self.ln(9)
    def footer(self):
        self.set_y(-12)
        self.set_font('Courier', '', 7)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f'- {self.page_no()} / 60 -', align='C')

# Read source lines (already filtered to self-written code only)
lines = []
for fname in ['src-p1-30.txt', 'src-p31-60.txt']:
    fpath = os.path.join(r'M:\new\docs', fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        for raw in f:
            lines.append(raw.rstrip('\n\r'))

# Filter out decorative comments to boost effective code ratio
import re
def should_keep(line):
    content = line.strip()
    parts = content.split(None, 1)
    code = parts[1] if len(parts) >= 2 else ''
    # Remove separator comments: // ====== xxx ======
    if re.match(r'//\s*={3,}', code):
        return False
    # Remove HTML section comments: <!-- xxx -->
    if code.startswith('<!--') and code.endswith('-->'):
        return False
    return True

filtered = [line for line in lines if should_keep(line)]
print(f'Read {len(lines)} lines, after filter: {len(filtered)} lines')
lines = filtered

pdf = PDF('P', 'mm', 'A4')
pdf.add_font('CJK', '', font_path)
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()

for i, line in enumerate(lines):
    if i > 0 and i % LPP == 0:
        pdf.add_page()

    text = line[:200]
    has_cjk = any(ord(c) > 127 for c in text)
    pdf.set_font('CJK' if has_cjk else 'Courier', '', FS)
    pdf.set_text_color(0, 0, 0)
    pdf.multi_cell(0, LH, text, new_x='LMARGIN', new_y='NEXT')

output = r'M:\new\docs\source-code.pdf'
pdf.output(output)
print(f'Done: {output}  ({pdf.page_no()} pages)')
