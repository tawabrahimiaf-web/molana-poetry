# Molana-Poetry — نسخه آماده GitHub Pages

## مشکل نسخه فعلی سایت
اگر پیام `HTTP 404` در بخش «آثار مولانا» دیده می‌شود، معمولاً یعنی پوشه `data` همراه سایت روی GitHub آپلود نشده است. فایل‌های `catalog.json`، `search-index.json`، `shams.json`، `masnavi.json`، `fihi.json` و `majales.json` باید در مسیر زیر قرار داشته باشند:

```text
molana-poetry/
├── index.html
├── style.css
├── script.js
└── data/
    ├── catalog.json
    ├── search-index.json
    ├── shams.json
    ├── masnavi.json
    ├── fihi.json
    └── majales.json
```

## روش انتشار
1. وارد repository گیت‌هاب سایت شوید.
2. همه فایل‌های این بسته را در ریشه repository آپلود کنید.
3. پوشه `data` را نیز کامل آپلود کنید؛ فقط فایل‌های ریشه کافی نیستند.
4. اگر فایل قدیمی `index.html` وجود دارد، نسخه این بسته را جایگزین کنید.
5. GitHub Pages را از Branch اصلی و پوشه `/ (root)` فعال کنید.
6. چند لحظه صبر کنید و سایت را با `Ctrl+F5` بازخوانی کنید.

## نکته
این نسخه برای GitHub Pages به Backend نیاز ندارد و متن‌ها از فایل‌های JSON محلی خوانده می‌شوند.
