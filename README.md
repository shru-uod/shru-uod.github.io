# SHRU website

Website of the **Seismic Hazard Resilience Unit (SHRU)**, College of Engineering, University of Duhok.
Plain static site (HTML, CSS, JavaScript) — no build step, free hosting on GitHub Pages.
Languages: English, Arabic and Kurdish (Badini). The damage simulator is English-only.

```
index.html                         home page (photo gallery, about, research, activities, simulator, news, publications, team, contact)
simulator.html                     simulator page (embeds the tool below)
tools/earthquake-simulator.html    stand-alone 3D earthquake damage simulator (single file)
assets/css/style.css               design (colours at the top)
assets/js/main.js                  loads content, gallery, language switch
assets/img/                        logo, favicon, photos (activities/, news/, team/)
content/                           ← everything you update
```

---

## 1. Publish on GitHub Pages (one time)

1. Create a GitHub account and a **new public repository**, e.g. `shru` (or `<name>.github.io` for a shorter address).
2. **Add file → Upload files**, drag in **everything in this folder** (keep the folders) and **Commit**.
3. **Settings → Pages** → *Deploy from a branch* → branch **main**, folder **/ (root)** → **Save**.
4. After 1–2 minutes the site is live at `https://<your-username>.github.io/<repo-name>/`.
5. Optional custom domain (e.g. `shru.uod.ac`): *Settings → Pages → Custom domain*, and ask university IT for a CNAME record.

> Double-clicking `index.html` on your computer will not load the content (browsers block reading local JSON files).
> Use GitHub Pages, or run `python -m http.server` in this folder and open http://localhost:8000.

---

## 2. Everyday updates — edit only `content/`

On github.com: open the file → ✏️ pencil → edit → **Commit changes**. The site updates in about a minute.

| What | File |
|---|---|
| Seminars, workshops, field work, events (+ the photo gallery at the top) | `content/activities.json` |
| News | `content/news.json` |
| Papers | `content/publications.json` |
| Team members | `content/team.json` |
| Research areas | `content/research.json` |
| Contact email | `content/site.json` |
| Fixed page text (menus, headings, about text) | `content/i18n/en.json`, `ar.json`, `ku.json` |

Items are sorted by date automatically (newest first).

### The photo gallery (top of the home page)
The gallery shows the newest items from **activities.json and news.json that have `"highlight": true`** (up to 6).
If nothing is highlighted, it shows the newest items that have a photo.

1. Upload your photo to `assets/img/activities/` (**Add file → Upload files**). Landscape, about **1600×900 px**, under ~400 KB works best.
2. Add the activity at the top of `content/activities.json`:

```json
{
  "date": "2026-12-10",
  "type": "seminar",
  "highlight": true,
  "image": "assets/img/activities/seminar-dec-2026.jpg",
  "link": "https://… (optional: full article or Facebook post)",
  "place":   { "en": "College of Engineering", "ar": "كلية الهندسة", "ku": "کولیژا ئەندازیاریێ" },
  "title":   { "en": "English title", "ar": "العنوان بالعربية", "ku": "ناڤونیشان ب بادینی" },
  "summary": { "en": "Short text", "ar": "نص قصير", "ku": "دەقەکێ کورت" }
}
```

* `type` can be `seminar`, `workshop`, `conference`, `fieldwork` or `training`.
* Set `"highlight": false` (or remove it) to keep an item out of the top gallery.
* If you only have English, `"title": "English title"` is fine — missing languages fall back to English.
* **Delete the three example items** (titles in `[square brackets]`) and the files `assets/img/activities/example-1.jpg … example-3.jpg` before going public.

### News, publications, team
News items use the same fields as activities (without `type`/`place`). Publications:
```json
{ "year": 2026, "authors": "Surname, A., Surname, B.", "title": "Paper title", "venue": "Journal, 12(3), 45–60", "doi": "10.xxxx/xxxxx", "link": "" }
```
Team (square photo ~400×400 px in `assets/img/team/`):
```json
{ "name": { "en": "Dr. …", "ar": "د. …", "ku": "د. …" }, "role": { "en": "Researcher", "ar": "باحث", "ku": "ڤەکۆلەر" }, "photo": "assets/img/team/name.jpg", "email": "name@uod.ac", "link": "" }
```

### Check your JSON
A missing comma or quote stops that section from loading. If something disappears, paste the file into https://jsonlint.com to find the error.

---

## 3. Earthquake building damage simulator

* `tools/earthquake-simulator.html` is one self-contained file (Three.js loads from the jsDelivr CDN, so visitors need internet).
* `simulator.html` shows it inside the SHRU site; on phones the frame grows automatically to fit the stacked layout.
* The tool is **English only**; the site menus around it still follow the chosen language.
* Embed on another website:
  ```html
  <iframe src="https://<your-site>/tools/earthquake-simulator.html?embed=1" width="100%" height="860"
          style="border:0;border-radius:12px" title="Earthquake building damage simulator"></iframe>
  ```
  (`?embed=1` hides the tool's own title bar.)
* The home-page picture `assets/img/simulator-preview.jpg` is a real screenshot of the tool.

**How it calculates — keep this honest when presenting it. It is an educational model, not an engineering assessment.**
1. A synthetic ground-motion record (filtered random vibration, Kanai–Tajimi type, shaped in time) is scaled to the chosen PGA × the ASCE 7-16 site coefficient F<sub>PGA</sub> (Table 11.8-1).
2. The building is one equivalent single-degree-of-freedom oscillator (5 % damping, bilinear yielding). Period T = 1.4·C<sub>t</sub>·h<sup>x</sup> (ASCE 7 approximate period with the C<sub>u</sub> limit). Yield strengths per building type are **assumed values**.
3. Peak inter-story drift is compared with damage-state limits: Hazus C1L thresholds for RC frames (High-Code for modern RC, Pre-Code for older and soft-story RC — FEMA Hazus-MH 2.1 AEBM, Table 2.8). Unreinforced masonry uses **assumed** limits of 0.10 / 0.25 / 0.40 / 0.60 %, at or below published masonry drift limits.
4. Historic presets only set the PGA to a recorded value; they do not reproduce the real records:
   * 2017 Sarpol-e Zahab M7.3 — ≈684 cm/s² (≈0.70 g), Sarpol-e Zahab station (EMSC preliminary report)
   * 2023 Pazarcık M7.8 — 0.75 g at station TK3137 (preliminary report, arXiv:2302.13088)
   * 1995 Kobe M6.9 — up to ≈0.8 g on near-fault alluvial sites (GEER report)
   * 1994 Northridge M6.7 — 0.8–0.9 g at Sylmar and Simi Valley soil sites (USGS OFR 96-263)

Model values (`SYSTEMS`, `FPGA`, `KT`, `EVENTS`) and all texts (`window.SIM_TEXT`) are near the top of the scripts in `tools/earthquake-simulator.html`.

---

## 4. Before going public
* Replace every text in `[square brackets]` and the example photos.
* Put the real unit email in `content/site.json`.
* Ask a native speaker to review the Arabic and Badini wording, especially the unit's official Arabic name.
