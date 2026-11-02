# SupplementQuest Phase 2 prototype

This prototype uses local NIH Office of Dietary Supplements (ODS) text only.
It performs deterministic local passage retrieval and renders extractive
Decision Cards; it does not call an LLM or browse the web. Without local ODS
sources, it explicitly reports that no evidence conclusion can be made.
The interface and safety/uncertainty messages support English and Spanish.
Retrieved source passages are shown verbatim in their source language; they are
not machine-translated.

## Run the Streamlit app

```powershell
cd prototype-phase2
```

Use Python 3.11 or newer, then:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
streamlit run app.py
```

Add official ODS Markdown or reviewer-curated JSON files under `data/ods/`.
See [data/ods/README.md](data/ods/README.md) for the supported JSON format.
The first launch creates a local `.chroma/` index. The UI notebook is held in
the browser session only and is not sent to an external service.

## FastAPI backend and mobile interface

With the same virtual environment and working directory:

```powershell
.\.venv\Scripts\python.exe -m uvicorn api:app --reload
```

The backend exposes `GET /api/health` and `POST /api/decision` (JSON body:
`{"query": "...", "language": "English"}`). Original `/health` and `/decision`
routes remain available. The Streamlit app uses the same service layer directly.
Responses include structured verbatim `sources` in addition to the original
traceability snippet. The mobile UI uses these for accessible source disclosures.

For the participant-facing mobile app, run `npm run build` in the repository root
before starting the API. It serves the built Vite frontend and client-side
routes on port 8000. See [the mobile setup guide](../README.md) for private Wi-Fi
phone testing, validation commands, and deployment boundaries. The API initializes
its source index at startup and releases it at shutdown. ChromaDB 1.5.9 or newer
is required for the verified client lifecycle API. An alternate writable index
directory can be configured through `SUPPLEMENTQUEST_DATABASE_DIR`.

## Safety and evidence boundaries

Pregnancy/lactation, medication interaction, pediatric, and severe-condition
queries trigger abstention before retrieval. Evidence levels are accepted only
from explicitly reviewed JSON metadata and only for queries matching the reviewed
claim wording; raw Markdown defaults to `Not Addressed`. Claim-specific guidance
and food alternatives are also gated by that match. Source-language metadata
filters retrieval, and conservative lexical relevance checks reject unrelated
questions rather than extrapolating benefits. Untagged sources remain visible in
their original language. Generated numeric `CLM-<digits>` IDs are passage references pending human
review and are not represented as an approved Master Claim Registry.
Safety screening currently uses bilingual keyword/phrase rules rather than a
semantic classifier; these rules require clinical and bilingual review before
deployment.

High-dose, overdose and dose-escalation phrases in English/Spanish also trigger
the unchanged referral notice. Numeric-dose thresholds and semantic intent remain
unvalidated. Production ingestion requires official ODS HTTPS attribution and
source language for Markdown and JSON; legacy sample seeding is disabled.
