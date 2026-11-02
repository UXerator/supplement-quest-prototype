# Local ODS source data

Place official NIH Office of Dietary Supplements fact-sheet excerpts here as
UTF-8 Markdown files, or add reviewed JSON records in the format described
below. The application does not fetch or search the web.

Markdown files are chunked and indexed for passage retrieval. They are assigned
the conservative `Not Addressed` evidence tier until a reviewer creates a
curated JSON record. Generated `CLM-<hash>` identifiers are passage references,
not reviewed Master Claim IDs.

## Included official excerpts

| Topic | English | Official ODS Spanish |
| --- | --- | --- |
| Vitamin D | [Consumer excerpts](vitamin-d-consumer-en.md) | [Extractos para consumidores](vitamin-d-consumer-es.md) |
| Magnesium | [Consumer excerpts](magnesium-consumer-en.md) | [Extractos para consumidores](magnesium-consumer-es.md) |

Retrieved on November 2, 2026 (Pacific/Auckland) directly from the official
pages in a browser. These are selected introduction and food-source sections,
not complete fact sheets. Source wording is preserved; headings and lists are
formatted as Markdown. The Spanish text is published by ODS, not generated or
translated by this app.

Each file records its source URL, retrieval date, language, scope, and review
status. `Source updated` is recorded when available in the inspected page.
Source verification is not clinical review: all excerpts remain `Not Addressed`
with provisional passage references. No reviewer-approved practical guidance
or food-first recommendation has been added.

The production service requires a `Source URL: https://ods.od.nih.gov/...` line
and `Language: English` or `Language: Español` above the first `##` section.
It rejects missing attribution/language or non-ODS URLs instead of indexing
them as official evidence. The engine copies attribution to every chunk and
indexes the sections, excluding the attribution header. Host checking cannot
verify that arbitrary submitted text actually appears on the official page;
source verification and qualified review are still required.

Restart Streamlit after changing sources to rebuild its cached index. The app
does not automatically refresh NIH content or translate queries between
languages. Try English questions against the English text and Spanish
questions against the Spanish text.

Ashwagandha and multivitamin/gummy claims are not included in this source set.
The legacy sample-seeding method is disabled and raises an explicit error.

## Reviewed JSON format

JSON files must have a top-level `claims` array. Each entry must include:

```json
{
  "master_claim_id": "CLM-001",
  "claim": "A reviewer-defined claim",
  "evidence_level": "Limited Evidence",
  "text": "An exact passage from the official ODS source",
  "source_title": "ODS fact sheet title",
  "source_url": "https://ods.od.nih.gov/factsheets/",
  "language": "English",
  "practical_guidance": null,
  "food_first_alternative": null
}
```

Only assign `Supported` or `Limited Evidence` after qualified review against the
source. `practical_guidance` and `food_first_alternative` are optional and must
also be reviewed and supported by the cited ODS material. Do not put personal
or identifiable health information in this folder.

For the production API and Streamlit service, every JSON claim also requires an
official HTTPS ODS URL and language. Unattributed synthetic fixtures are only
supported when a test explicitly opts out of the production trust checks.
