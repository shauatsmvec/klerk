from pathlib import Path
import pypdf

pdf_path = Path('Klerk_6Day_Sprint_Plan.pdf')
reader = pypdf.PdfReader(str(pdf_path))
print('pages', len(reader.pages))
for i, page in enumerate(reader.pages, 1):
    text = page.extract_text() or ''
    print(f'===== PAGE {i} =====')
    print(text)
    print()
