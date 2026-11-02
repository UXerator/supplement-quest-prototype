# SupplementQuest: Truth Over Hype — verification matrix

## Scope and status definition

Audit against the four pillars supplied in this conversation, including family
decision checklists and English/Spanish support. The complete original pitch and
official Phase 2 submission rules were not provided or independently verified.
This is an engineering/UX gap analysis, not clinical validation or a security audit.

**COVERED** means implemented for the stated prototype scope; **PARTIALLY COVERED**
means a meaningful implementation exists but a material part remains;
**MISSING** means the requested capability was absent. Source verification,
clinical evidence grading, and usability testing are separate activities.

## Baseline: before this redesign

| Pillar / requirement | Status | Verified implementation and gap |
|---|---|---|
| 1. Evidence-constrained engine | PARTIALLY COVERED | `decision_service.py:18` instantiates the local `ODSRAGEngine`; `rag_engine.py:271` indexes local Markdown/JSON and `:296` retrieves without web searches. Four official excerpts are bundled. However Markdown can omit attribution; curated JSON accepts any host; metadata does not prove qualified review. The separate legacy engine also contains unverified sample health statements (`:48`). |
| 1. Hallucination prevention and citations | COVERED | For the active extractive prototype: `decision_card.py:91` copies retrieved passages into traceable output; `decision_service.py:37` only applies labels to exact reviewed-claim wording. No LLM is invoked. The legacy constrained prompt is not proof of the active flow and should not be described as a running LLM. Coverage does not mean every relevant question can be answered. |
| 1. High-risk intercept / verbatim warnings | PARTIALLY COVERED | `safety_filter.py:22` covers pregnancy, medication, children and severe conditions; `decision_service.py:23` screens before retrieval; `decision_card.py:57` copies the configured notice. High-dose/overdose triggers were absent. Rules are keyword-based, not semantically or clinically validated, and cannot cover every medication/paraphrase. |
| 1. Non-medical disclaimers | COVERED | Global participant footer in `src/App.jsx:156`; onboarding safety/privacy, source-card warnings, and returned abstention. Educational disclaimers do not substitute for validated safety screening. |
| 2. Four-step journey | PARTIALLY COVERED | Manual external-claim entry → results → Decision Card/reflection → optional text sharing works (`src/screens/CoreApp.jsx:51`, `:163`, `:178`; `Secondary.jsx:100`, `:141`). No external social-post import. The UI has no visible four-step orientation and repeats a long card. Sharing gates are implemented via `QuestProvider.jsx:11`. |
| 2. Green / yellow / white trust tiers | PARTIALLY COVERED | Three classifier labels and badge classes exist (`evidence_classifier.py:7`; `CoreApp.jsx:123`). Limited evidence uses the old orange palette, and neutral uses gray. Meaning is not consistently localized. No reviewer-approved production claim presently demonstrates a positive tier. |
| 3. Rapid fitness/social lookup | PARTIALLY COVERED | Free-text entry and presets exist (`CoreApp.jsx:10`), but no pre-workout, weight-loss, or immunity category/preset experience. Only vitamin D/magnesium introductory and food-source excerpts are loaded; the proposed audience topics lack reviewed evidence coverage. |
| 3. Myth vs. Science graphic share generator | MISSING | `Secondary.jsx:141` provides native text sharing and a `.txt` download only. No graphic generation/export. Automatically declaring a claim a myth would be unsafe when the classification is `Not Addressed`. |
| 4. Food-first / before-buying workflow | PARTIALLY COVERED | `Secondary.jsx:191` routes to food-source questions; claim-specific alternatives are supported by the card schema. No interactive food/budget planning or diet-adequacy calculation. General ODS passages cannot establish whether an individual/family diet meets needs. |
| 4. Interactive family decision checklists | MISSING | Reflection collects confidence/intention, not a checklist (`Secondary.jsx:100`). No editable family decision checklist or notebook retention of checklist responses. |
| 4. English/Spanish localization | PARTIALLY COVERED | `quest-context.js` exposes paired text; `QuestProvider.jsx:12` changes document language; source retrieval filters language (`rag_engine.py:341`). Raw tier names and some notebook/share content remain English. No translation-key completeness tooling or qualified bilingual review. Untagged curated sources can mix languages. |

Baseline references refer to the pre-redesign line positions. Final implementation
references and validation results below supersede positions changed during edits.

## Submission-priority gaps

### P0 — must resolve before public health-decision use

1. **Qualified evidence registry and audience coverage:** add reviewer-approved
   ODS records for pre-workout, weight loss, immunity and relevant family questions.
   Include exact passage, official URL, source language, review provenance and
   claim context. Do not manufacture a positive label to make a demo look complete.
2. **Safety validation:** add high-dose screening, then validate pregnancy,
   lactation, medicines, children and severe/multiple conditions against a
   clinician-approved English/Spanish adversarial matrix. Semantic intent and
   full medication coverage remain a separate implementation/validation task.
3. **Trusted ingestion:** enforce official attribution in the app's ingestion
   path; reject unknown hosts and missing source languages. Eliminate sample
   health statements from the legacy seeding path. Host checking is not proof
   that submitted text actually appears in the source.

### P1 — demonstrable product/UX requirements

4. Four-step visible journey and accessible mobile/desktop trust hierarchy.
5. Cited educational graphic export with readable uncertainty and no personal
   question/reflection included; only reviewed content can be labelled supported.
6. Interactive, bilingual family checklist saved with a session Decision Card.
   No “diet sufficient” verdict, dosage recommendation, savings estimate or
   purchasing recommendation without an appropriate validated evidence workflow.
7. Bilingual label/state consistency, accessible navigation and empty/error states.

### P2 — delivery readiness

8. Choose an authorized HTTPS host; validate actual iPhone/Android behavior,
   consent/privacy/logging/retention and supervised pilot tasks.
9. Verify submission-specific required deliverables against the actual challenge
   rules. Engineering coverage alone does not establish submission eligibility.

## Exact update plan

| File | Update |
|---|---|
| `src/App.jsx`, `src/mobile.css` | Adaptive app shell instead of a simulated desktop phone; branded header, stable four-item navigation, skip link, route focus/title management, 44px+ touch targets, reduced motion and green/amber/slate tiers. |
| `src/QuestUI.jsx`, `src/claim-topics.js` | Reusable localized evidence badge, four-step progress and page headings; fast fitness, weight-loss, immunity and food-source discovery with honest corpus-coverage notices. |
| `src/screens/CoreApp.jsx`, `prototype-phase2/decision_card.py` | Four-step oriented input/results; short verdict and uncertainty first, structured cited passages behind accessible disclosures; explicit reviewed vs. provisional mapping. Preserve full trace for the Streamlit/API contract. |
| `src/screens/Secondary.jsx`, `src/QuestProvider.jsx`, `src/family-checklist.js` | Food-first planning checklist with context, no medical scoring, session-only retention/reset; reflection and notebook integration. |
| `src/share-card.js`, `src/screens/Secondary.jsx` | Deterministic 1080×1350 educational PNG export/preview plus existing text fallback. Include literal source excerpt, URL, reference, tier and disclaimer. No LLM/image service. |
| `prototype-phase2/safety_filter.py`, related tests | High-dose/overdose/dose-escalation intercepts in both languages; exact unchanged warning and retrieval-bypass tests. |
| `prototype-phase2/rag_engine.py`, `decision_service.py`, source guide/tests | Production trust flag, official URL/language checks for both source formats; disable unsafe legacy sample seeding; reject invalid data explicitly. Test-only unattributed fixtures remain opt-in outside the production service. |
| `tests/`, `prototype-phase2/tests/`, `README.md`, `dev-plan.md` | Contract, share-content, checklist, source-trust and safety regressions; document actual coverage, persistent server usage and remaining gates. |

## Final verification

### Post-redesign matrix

| Pillar / requirement | Current status | Files / lines and exact remaining work |
|---|---|---|
| 1. Evidence-constrained engine | PARTIALLY COVERED | [Production service](prototype-phase2/decision_service.py#L15) enables trusted-source checks; [JSON official-host validation](prototype-phase2/rag_engine.py#L147) and [ingestion validation](prototype-phase2/rag_engine.py#L320) require official URL/language. Legacy sample seeding is disabled. Remaining: reviewed source/claim provenance, freshness checks and target-topic coverage. Host attribution alone cannot prove source-text accuracy or qualified review. |
| 1. Hallucination prevention / citations | COVERED | [Extractive builder](prototype-phase2/decision_card.py#L54) returns verbatim [structured citations](prototype-phase2/decision_card.py#L17) and the original trace. [Service](prototype-phase2/decision_service.py#L23) has no LLM call; exact curated wording gates labels/guidance. No web health answers. If an LLM is introduced later, add output citation-entailment validation and fail-closed generation tests before enabling it. |
| 1. High-risk safety intercept | PARTIALLY COVERED | [High-dose rules](prototype-phase2/safety_filter.py#L95) now join pregnancy, medication, pediatric and severe-condition screening. [Verbatim notice](prototype-phase2/safety_filter.py#L107), retrieval-bypass tests and [UI notice](src/screens/Secondary.jsx#L246) preserve warning text. Remaining: clinically validated semantic intent, medication-name/paraphrase coverage and nutrient-specific numeric dose/urgency validation. Do not infer safety from an unmatched rule. |
| 1. Non-medical disclaimers | COVERED | [App shell](src/App.jsx#L111), entry notice, evidence cards, checklist, [safety page](src/screens/Secondary.jsx#L246) and [graphic content](src/share-card.js#L1) enforce educational boundaries. Source-cited prototype is explicitly not NIH-endorsed. |
| 2. Four-step core flow | COVERED | [Step progress](src/QuestUI.jsx#L13); [manual external-claim entry](src/screens/CoreApp.jsx#L74) → [evidence](src/screens/CoreApp.jsx#L214) → [Decision Card](src/screens/CoreApp.jsx#L230) and [reflection](src/screens/Secondary.jsx#L106) → [optional sharing](src/screens/Secondary.jsx#L151). Decision-Card/reflection gates survive direct navigation and notebook reopening. External post ingestion is not implemented or claimed. |
| 2. Visual trust tiers | COVERED | [Localized badge with icons](src/QuestUI.jsx#L26), green/amber/slate CSS, and [explainer](src/screens/Secondary.jsx#L268). Labels and text supplement color. Green means reviewed support in context, not guaranteed personal benefit or independently certified “strong evidence.” Reviewer-approved benefit classifications remain a corpus gap. |
| 3. Fast fitness / social claim lookup | PARTIALLY COVERED | [Topic catalogue](src/claim-topics.js) and [discovery UI](src/screens/CoreApp.jsx#L9) add fitness/pre-workout, weight-loss and immunity presets with explicit “coverage pending” notices. Remaining: verified ODS sources and qualified claim mappings for these topics; benchmark retrieval relevance/latency on realistic wording. Presets alone are not evidence coverage. |
| 3. Myth vs. Science graphic sharing | PARTIALLY COVERED | [PNG renderer](src/share-card.js#L80) and [share screen](src/screens/Secondary.jsx#L151) generate/export 1080×1350 cited educational graphics in both languages, with text fallback. This is a neutral “hype vs. evidence” format: no automatic claim-specific “myth” judgment. Remaining: clinically reviewed claim-specific myth/science templates and contextual qualifiers; any opt-in display of a user's external claim needs a clear privacy choice. |
| 4. Food-first / whole-food comparison | PARTIALLY COVERED | [Food-first workflow](src/screens/Secondary.jsx#L215) connects official food passages and [planning checklist](src/QuestUI.jsx#L38) to a Decision Card. Remaining: reviewed nutrient/food comparison records and validated adequacy workflow if required by the pitch. No individual diet-adequacy scoring, dosage, price/savings claims or “buy/don't buy” recommendation is generated. General ODS passages cannot establish a family's nutrient sufficiency. |
| 4. Family decision checklists | COVERED | [Interactive checklist](src/QuestUI.jsx#L38), [bilingual item definitions/state helpers](src/family-checklist.js), and [session notebook state](src/QuestProvider.jsx#L5). Saved cards keep subsequent checklist/reflection updates; new claims reset context. The count tracks considered items, not safety, health or nutritional adequacy. |
| 4. English/Spanish UI | COVERED | Existing paired localization in `quest-context.js` is used throughout new participant components, badges, checklist, topics and graphics. [Provider](src/QuestProvider.jsx#L5) updates `html lang`; production ingestion requires explicit source language. Official passages remain verbatim. Qualified bilingual/clinical review and broader translation-completeness tooling remain readiness tasks; reviewer-only conceptual diagrams are not localized participant content. |

### Validation performed

- 20 backend tests and 8 Node experience/API-client tests pass; production build,
  focused lint and Python dependency consistency pass.
- Changed Python files pass Pylance syntax checks.
- Browser checks against the real local API verify English/Spanish source
  retrieval, source links, four-step progress, direct-route gating, reflection,
  checklist/notebook retention, high-dose unchanged warning, unsupported immunity
  query rejection and visible network failure without a fabricated evidence card.
- Layout and 44px+ button/select checks pass at 320px, 390px and 1280px on the home
  screen. Additional safety, results and share screens have no horizontal overflow
  in the tested mobile viewports. This is not a full WCAG audit.
- Real browser canvas output is a valid `image/png` with PNG signature and
  **1080×1350** dimensions. Generated image previews work in English and Spanish.
  The download action creates the correctly named PNG blob/link. The integrated
  browser did not emit a file-download completion event, so saving to disk and
  native mobile sharing still require physical-device checks.
- A multiline excerpt initially exceeded the image's text area. The renderer now
  measures line widths, bounds source lines, marks shortening and directs readers
  to the complete official source. Regression tests cover that failure.

### Remaining code updates, ranked

1. **Reviewed evidence pipeline:** extend `ODSClaimRecord` with structured
   non-personal review references, source revision dates and context/limitations;
   reject unsupported/expired approvals in production ingestion. Add the actual
   qualified-reviewed audience records, source verification checks, and contextual
   matching regressions. No approval should be self-invented by this prototype.
2. **Semantic safety:** extend `SafetyFilterEngine.evaluate_query` with a validated
   local intent layer before retrieval. Add bilingual clinician-approved positives,
   paraphrases, ambiguous cases, false positives, medicine names and nutrient/dose
   thresholds; require exact static warning output for intercepted cases.
3. **Claim-specific social templates:** populate reviewed myth/science data from
   the claim registry; extend `buildShareContent` only when contextual qualifiers
   fit. Preserve neutral output for `Not Addressed` and all sharing gates.
4. **Food adequacy, only if genuinely required:** add a separate clinician-approved
   nutrient/food comparison schema and educational intake workflow with units,
   population/context rules and uncertainty tests. Do not derive sufficiency from
   the current five planning checkboxes. Until validated, show “cannot assess.”
5. **Localization completeness and device delivery:** extract paired participant
   copy into translation-key resources with parity tests if expansion warrants it;
   complete qualified Spanish review, HTTPS hosting, actual iOS/Android PNG/native
   share tests and supervised study/privacy preparation.

No public HTTPS deployment, physical-phone testing, qualified clinical validation,
validated semantic safety classifier or participant study was completed by this
engineering redesign.
