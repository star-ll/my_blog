"""Validate built SEO output: python scripts/check-seo.py [output directory]."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import json
import sys
import xml.etree.ElementTree as ET

class Head(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.inside = self.in_title = self.in_schema = False
        self.title = self.schema = ""
        self.meta, self.canonical, self.schemas = {}, [], []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'head': self.inside = True
        if not self.inside: return
        if tag == 'title': self.in_title = True
        if tag == 'meta': self.meta[a.get('name', a.get('property'))] = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a['href'])
        if tag == 'script' and a.get('type') == 'application/ld+json': self.in_schema = True
    def handle_endtag(self, tag):
        if tag == 'head': self.inside = False
        if tag == 'title': self.in_title = False
        if tag == 'script' and self.in_schema:
            self.schemas.append(json.loads(self.schema))
            self.schema = ''; self.in_schema = False
    def handle_data(self, data):
        if self.in_title: self.title += data
        if self.in_schema: self.schema += data

root = Path(sys.argv[1] if len(sys.argv) > 1 else 'public')
pages = {}
for file in root.rglob('*.html'):
    h = Head(file.read_text())
    if 'noindex' in h.meta.get('robots', ''): continue
    assert h.title and h.title.lower() != 'index', file
    assert h.meta.get('description', '').strip(), file
    assert len(h.canonical) == 1, file
    url = h.canonical[0]
    assert url.startswith('https://'), (file, url)
    assert h.meta.get('og:url') == url, file
    assert h.meta.get('og:title') == h.title, file
    assert h.schemas, file
    image = h.meta.get('og:image')
    assert image, file
    assert not h.meta.get('og:image:type', '').startswith('image/.'), file
    if urlparse(image).netloc == urlparse(url).netloc:
        assert (root / unquote(urlparse(image).path).lstrip('/')).is_file(), (file, image)
    pages[url] = h
home = Head((root / 'index.html').read_text())
assert urlparse(home.canonical[0]).path == '/'
assert 'noindex' in Head((root / '404.html').read_text()).meta['robots']
sitemap = ET.parse(root / 'sitemap.xml')
for loc in sitemap.findall('.//{*}loc'):
    assert loc.text in pages, loc.text
rss = ET.parse(root / 'index.xml')
assert all('/site/' not in x.text for x in rss.findall('.//item/link'))
assert 'Sitemap:' in (root / 'robots.txt').read_text()
print(f'PASS: {len(pages)} indexable pages; titles, descriptions, canonicals, JSON-LD, OG assets, sitemap, RSS and 404.')
