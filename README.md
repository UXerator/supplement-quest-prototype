# SupplementQuest mobile prototype

The Phase 1 React/Vite mobile wireframes now use a local FastAPI decision service.
The participant journey is **question -> safety screening -> ODS passage ->
Decision Card -> confidence/next-step reflection -> optional sharing**.
Streamlit remains an internal dashboard, not the primary phone interface.

See [the development plan](dev-plan.md) for the current journey, ordered
roadmap, saved hosting choices, and readiness gates.
See [the pitch verification matrix](pitch-verification.md) for the before/after
audit, exact implementation changes, and remaining submission-priority gaps.

The redesigned interface adapts to mobile and desktop instead of simulating
a phone on desktop. It provides a visible four-step journey, accessible
source disclosures, green/amber/slate evidence indicators, audience topic
presets, a bilingual family checklist, and a cited 1080×1350 PNG export.
No generated “myth” verdict is inferred from missing evidence.

Evidence and Decision Card views share a summary-first layout: the exact question,
a color/icon evidence snapshot, and three callouts for food-first options,
practical next steps, and safety. One initially collapsed **Read Full ODS Source
Details** section holds verbatim passages, claim references, official links,
full guidance/disclaimers, and label explanations. A brief educational disclaimer
remains visible. Snapshots use predefined bilingual copy, not AI-generated benefit
summaries; no-source coverage and pending claim review are explicitly distinguished.
Food lists appear only from reviewed, source-linked metadata; missing or lengthy
lists are disclosed rather than invented or truncated. No blanket safety,
supplement-necessity, or independently certified evidence-strength verdict is made.
The badges use green `#2E7D32`, amber `#F57F17` (dark text), and slate `#546E7A`.

## Run locally

From the repository root, with Node.js and the Python environment installed:

```powershell
npm run build
Set-Location prototype-phase2
.\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8000
```

Open <http://localhost:8000>. The backend serves both the built React app and
`/api/decision` on the same origin; no separate frontend server or CORS setup
is needed. Rebuild after frontend changes and restart after source/backend
changes. Health check: <http://localhost:8000/api/health>.

Keep the API process running while using the app. An already-open page can still
display its interface after the server stops, but claim checks will fail.
After rebuilding, reload the browser to load the updated branding and code.
The API serves the app page with `Cache-Control: no-store`.
If using port 8010 instead, use `--port 8010` and open
<http://127.0.0.1:8010>; Vite development still expects its API on port 8000.

For a fresh Python setup, see [the backend README](prototype-phase2/README.md).
If frontend dependencies are missing, run `npm install` from this root.
On this Windows computer, `python` may resolve to the Microsoft Store alias;
use the environment's explicit executable above instead.

For frontend development, run the API as above and, in a second terminal at
the repository root:

```powershell
npm run dev
```

Open the Vite URL printed in the terminal. Vite proxies `/api` to port 8000.

## Test on phones over your private Wi-Fi

Only use fictional, non-identifying queries during prototype tests. On a trusted
private network, build as above and start the API with:

```powershell
Set-Location prototype-phase2
.\.venv\Scripts\python.exe -m uvicorn api:app --host 0.0.0.0 --port 8000
```

Find your computer's private Wi-Fi IPv4 address in Windows network settings.
Connect the phone to the same network, then open `http://COMPUTER-IP:8000`
in Safari or Chrome. **Phone localhost refers to the phone, not the computer.**
If blocked, allow the specific Python application/port through Windows Firewall
on the private network only; do not disable the firewall. Stop the server with
Ctrl+C after testing. Do not expose this development server to the internet.

The manifest provides standalone/home-screen metadata. Browser installation
support varies; native sharing and installation features may require HTTPS.
There is no service worker, no offline evidence mode, and no API response cache.
This is a mobile-first web prototype, not an App Store/Play Store native app.

## Functional checks

```powershell
npm test
npm run build
npx eslint src\App.jsx src\QuestProvider.jsx src\QuestUI.jsx src\quest-context.js src\decision-api.js src\claim-topics.js src\family-checklist.js src\share-card.js src\screens\CoreApp.jsx src\screens\Secondary.jsx src\screens\Onboarding.jsx tests\*.js vite.config.js
Set-Location prototype-phase2
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

On both an iPhone and an Android phone, check:

- Blank input shows an error; an unavailable API never creates a fake result.
- Magnesium/vitamin D food questions show local ODS citations and provisional
  IDs. Ashwagandha/testosterone and unrelated vitamin C questions do not inherit
  those passages or a positive classification.
- Pediatric, pregnancy, prescription-interaction, and severe-condition examples
  display clinician-referral abstention rather than an evidence answer.
- English/Spanish switching changes the interface and selects source language.
- The Decision Card comes before reflection; sharing is unavailable until then.
- Save, reflect, reopen, and clear the notebook; reload clears all session data.
- Comparison returns ingredient-question evidence, never brand/price rankings.
- Text is readable without sideways scrolling at 320px and 390px widths;
  navigation, keyboard focus, and browser back work throughout the journey.
- Optional downloaded/shared text excludes the submitted question and reflection.
- Family checklist changes follow the current Decision Card into the notebook;
  a new claim resets the checklist. The checklist does not assess diet adequacy.
- Graphic download produces a cited 1080×1350 PNG with uncertainty and educational
  disclaimer; inspect both languages and use the accessible text fallback.

## Evidence, privacy, and deployment boundaries

Only selected official English/Spanish vitamin D and magnesium excerpts are
included. See [the ODS source guide](prototype-phase2/data/ods/README.md).
They are **not full fact sheets or clinically reviewed claim mappings**. Raw
passages receive `Not Addressed`; this is not proof that a supplement works or
does not work. The three evidence labels are app labels, not official NIH ratings.
Curated claim-specific classifications and guidance require an exact claim match.
Retrieval is conservative lexical/vector matching, not a semantic understanding
of a user's health situation. No LLM or query-time web browsing is used.

Production ingestion requires official HTTPS ODS attribution and a source language
for Markdown and JSON. These checks do not replace source-text or clinical review.
The API also returns structured verbatim `sources` alongside the original trace.

Safety screening (including high-dose/overdose phrases) is currently bilingual keyword/phrase matching, **not a
clinically validated semantic safety classifier**. It can miss paraphrases,
medication names, or serious situations. Do not use this prototype to decide
personal supplement use.

Submitted questions are sent to the local API for review. Reflections remain in
React memory only, as do family checklists. None are written to a notebook database or browser storage.
Chroma stores source passages, not query history. Shared/downloaded
educational text leaves the app only when the user chooses that action.

Before public/participant deployment: obtain qualified clinical and bilingual
review, expand official source coverage, validate semantic/high-risk guardrails,
choose an authorized HTTPS host, review hosting logs/privacy/consent/retention,
and perform physical-device usability testing. Do not treat wireframe diagrams
or browser emulation as completed clinical validation or participant study data.

The API uses one process and a local writable index. For an alternate index path,
set `SUPPLEMENTQUEST_DATABASE_DIR` before startup. Deploy the frontend build,
Python dependencies, and local source directory together; bind the server to the
host's assigned port behind its HTTPS proxy. No public deployment is configured.
