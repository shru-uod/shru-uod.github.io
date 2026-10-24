# SHRU website

Website of the **Seismic Hazard Resilience Unit (SHRU)**, College of Engineering, University of Duhok.
Static site (HTML, CSS, JavaScript) — no build step, free hosting on GitHub Pages.
Languages: English, Arabic and Kurdish (Badini). The damage simulator is English-only.

```
index.html                        home page
simulator.html                    simulator page (embeds the tool below)
tools/earthquake-simulator.html   stand-alone 3D earthquake damage simulator
assets/css/style.css              design (colours at the top)
assets/js/main.js                 loads content, gallery, language switch, visitor counter
assets/img/                       logo, photos, thesis figures, maps
papers/                           open-access paper PDFs (downloadable)
theses/                           thesis PDFs that may be shared (only the 2015 PhD thesis)
resources/                        other downloads (Iraqi Seismic Code 2017)
content/                          ← everything you update
```

---

## 1. Publish on GitHub Pages
1. Create a **public** repository named `<your-username>.github.io` (or any name).
2. **Add file → Upload files** → drag in everything inside this folder (not the folder itself, not the zip) → **Commit**.
   GitHub's web upload accepts files up to 25 MB; the largest file here (Iraqi code PDF) is 18 MB.
3. **Settings → Pages** → *Deploy from a branch* → `main` / `(root)` → **Save**. The site is live after 1–3 minutes.

## 2. Turn on the visitor counter (one time, 2 minutes)
The "website visits" number uses **GoatCounter** (free for non-commercial sites, no cookies).
1. Sign up at https://www.goatcounter.com/signup and choose the code **`shru-uod`**
   (if you choose a different code, put it in `content/site.json` → `"goatcounter"`).
2. In GoatCounter → *Settings*, tick **"Allow adding visitor counts on your website"** and save.
3. Visits start counting immediately; the number on the site is refreshed by GoatCounter every few hours.
Until this is done the tile shows "—".

## 3. Updating content (edit files in `content/` on github.com → ✏️ → Commit)

| What | File |
|---|---|
| Photo gallery at the top (slides) | `content/highlights.json` |
| News & activities (vivas, seminars, workshops, papers) | `content/news.json` |
| Theses & studies (cards, findings, summary images) | `content/studies.json` |
| Publications (PDF + DOI) | `content/publications.json` |
| Downloads (codes, theses, maps) | `content/resources.json` |
| Numbers band, email, address, counter code | `content/site.json` |
| 2026 earthquakes section | `content/earthquakes-2026.json` |
| Building-type photos | `content/buildings.json` |
| Research areas / People | `content/research.json`, `content/team.json` |
| Fixed page text in 3 languages | `content/i18n/en.json`, `ar.json`, `ku.json` |

**Add news with photos** — upload photos to `assets/img/news/`, then add at the top of `news.json`:
```json
{
  "date": "2026-12-10", "type": "defense",
  "image": "assets/img/news/photo1.jpg",
  "images": ["assets/img/news/photo1.jpg", "assets/img/news/photo2.jpg"],
  "link": "",
  "place":   { "en": "College of Engineering, University of Duhok" },
  "title":   { "en": "English title", "ar": "العنوان", "ku": "ناڤونیشان" },
  "summary": { "en": "Short text", "ar": "نص قصير", "ku": "دەقەکێ کورت" }
}
```
`type`: `defense`, `seminar`, `workshop`, `conference`, `fieldwork`, `training`, `publication` or `news`.
Missing Arabic/Badini text falls back to English. To show it in the top gallery, add a similar item to `highlights.json`.

**Add a publication** — put the PDF in `papers/` (only if the journal licence allows sharing, e.g. open access/CC BY) and add an item to `publications.json` with `"pdf": "papers/<file>.pdf"`. For publisher-copyright papers leave `"pdf": ""` — readers get the DOI link.

## 4. Files and permissions — please note
* Uploaded papers: the four open-access papers (AJNU 2018, EAJSE 2020, JUOD 2021, Journal of Engineering 2021).
  The 2025 Springer paper (*Innovative Infrastructure Solutions*) is linked by DOI only, because the publisher PDF is normally not allowed to be re-posted; you can add your accepted manuscript later if Springer's self-archiving policy allows it.
* Theses: only the 2015 PhD thesis is downloadable. The other theses are presented by title, summary, key findings and a summary image (`assets/img/studies/cards/`) — their PDFs are **not** included.
* The Sarhan & Yaseen manuscript is listed as "in preparation" without a PDF.
* `resources/Iraqi-Seismic-Code-2017.pdf` — Iraqi seismic code (Arabic, 212 pages), Ministry of Construction, Housing, Municipalities and Public Works.

## 5. Maps (made by SHRU for this site)
* `assets/img/maps/kri-active-faults.png` / `.svg` — active faults from the **GEM Global Active Faults Database** (Styron & Pagani 2020; EMME model, Danciu et al. 2018; licence CC BY-SA 4.0 — keep the credit line), base map Natural Earth (public domain), epicentres from USGS. Regional scale only; many Zagros fold-and-thrust structures are not in the database.
* `assets/img/maps/earthquakes-2026-m6.png` — USGS ComCat M6.0+ events, 1 Jan – 23 Oct 2026, plate boundaries Bird (2003).

## 6. 2026 earthquakes section
Figures come from the USGS catalogue (retrieved 24 Oct 2026) and casualty summaries (USGS/NOAA via DisasterAware, Wikipedia). Values can be revised; to update, edit `content/earthquakes-2026.json` and regenerate or replace the map image. Videos are YouTube embeds (they load only when the visitor presses play); change them in the `videos` list (YouTube video IDs).

## 7. Damage simulator
`tools/earthquake-simulator.html` is a single self-contained file (Three.js from the jsDelivr CDN). Embed elsewhere with:
```html
<iframe src="https://<your-site>/tools/earthquake-simulator.html?embed=1" width="100%" height="860" style="border:0"></iframe>
```
It is an **educational** model (single-degree-of-freedom response to synthetic ground motion; Hazus C1L drift limits for RC; assumed limits for masonry) — not an engineering assessment. Model values and texts are at the top of its scripts.
