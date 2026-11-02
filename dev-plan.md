# SupplementQuest development plan

## Direction

Reuse the Phase 1 React/Vite mobile screens as the participant-facing app.
FastAPI handles safety screening, local ODS retrieval, and structured Decision
Cards. Streamlit remains an internal dashboard.

The current implementation is a mobile-first web prototype, not a native
App Store/Play Store app. Home-screen metadata exists, but complete PWA
installation support and physical-device behavior still need verification.
Use the plain SupplementQuest name without trademark markings.

See [the pitch verification matrix](pitch-verification.md) for the baseline
audit, post-redesign coverage, exact code references and prioritized remaining
updates. The redesign implements an adaptive desktop/mobile layout rather than
a desktop phone frame.

## Current prototype flow

1. **Welcome and language:** choose English or Spanish; optionally read the
   three onboarding screens about evidence, Decision Cards, and safety.
2. **Investigate:** enter a question or choose a dashboard preset. Empty input
   produces a visible error. Do not enter identifying health details.
3. **Safety screening:** the local API checks bilingual high-risk rules before
   retrieval. A matched pregnancy, medication, pediatric, high-dose, or severe-condition
   rule returns an educational abstention and clinician/pharmacist referral.
   It does not proceed to an evidence answer or sharing flow.
4. **Evidence results:** other queries search locally stored ODS passages in
   the selected language. Results show source text, official source links,
   uncertainty, and a provisional claim reference. Unsupported queries receive
   `Not Addressed`, not an invented answer.
5. **Internal Decision Card:** view the source, evidence label, safety note,
   and practical guidance. Consider the interactive family checklist; it is a
   planning aid, not a diet-adequacy assessment. Saving is optional.
6. **Confidence and decision intention:** choose confidence and a next step:
   learn more, wait, do not buy, or discuss with a clinician/pharmacist.
   This records an intention, not an observed behavior or a recommendation.
7. **Optional sharing:** available only after viewing the Decision Card and
   completing reflection. Preview/export a cited 1080×1350 educational PNG,
   download accessible source text, or use native text sharing when supported.
   Submitted question/reflection/checklist fields are excluded. Missing evidence
   never creates an automatic “myth” judgment.
8. **Reinforcement:** reopen saved cards and reflections from the notebook.
   Reloading or closing the app clears this in-memory history.

Supporting paths:

- **Comparison:** two ingredient questions use the same API and safety rules.
  There are no brand, price, purchase, or personal-safety rankings.
- **Food-first:** opens questions about food-source passages in the current
  ODS corpus; it does not invent personalized dietary recommendations.
- **Evidence explainer:** describes the app's three evidence labels.
- **Reviewer diagrams:** retained Phase 1 concepts, explicitly labeled as
  concepts rather than validated capabilities or study results.
- **Service errors:** timeout, connection failure, or malformed responses
  produce an explicit error, never a simulated successful card.

## Ordered implementation roadmap

| Step | Status | Work |
|---|---|---|
| 1. Connect the mobile wireframes | Complete | Replace mock participant results with FastAPI Decision Cards; retain the mobile design and routes. |
| 2. Complete the in-app journey | Complete for current scope | Responsive trust hierarchy, four-step progress, bilingual UI, family checklist, source disclosures, Decision Card/reflection/notebook and cited PNG/text sharing. |
| 3. Close evidence and safety gaps | In progress | Production official-attribution/language checks, exact reviewed-claim matching and high-dose rules are implemented. Qualified review, semantic screening, numeric-dose validation and audience evidence coverage remain outstanding. |
| 4. Deploy over HTTPS | Not started; gated | Choose an authorized host after readiness review. Build/frontend and API use one origin. |
| 5. Test actual phones | Not completed | Verify iPhone Safari and Android Chrome, accessibility, touch behavior, network errors, sharing, and home-screen support. Browser emulation is not physical-device testing. |
| 6. Run a supervised pilot | Not started; gated | Prepare consent/privacy and approved tasks, run a small pilot, fix findings, then plan a broader participant study. |

Private Wi-Fi smoke tests with fictional questions can be performed before
public deployment. This is not authorization for unsupervised health decisions
or participant recruitment.

### Step 3: remaining readiness work

- Expand verified official ODS source coverage. Current material contains only
  selected English/Spanish vitamin D and magnesium excerpts, not full sheets.
- Establish a qualified, reviewed Master Claim Registry and claim-specific
  classifications, guidance, and bilingual mappings.
- Implement and validate semantic high-risk intent checks, including
  paraphrases, medication names/interactions, children, pregnancy/lactation,
  and serious or multi-condition situations. Current screening is
  keyword/phrase-based and can miss risks.
- Have qualified clinical and bilingual reviewers assess accuracy,
  uncertainty language, referral wording, and failure cases.
- Keep unreviewed passages labeled `Not Addressed`. The labels are app labels,
  not official NIH ratings, and do not imply a personal benefit or recommendation.

### Step 4: hosting decision saved for later

No hosting selection or public deployment approval has been made.
Options to consider:

1. Supervised private Wi-Fi phone testing first (recommended initial step).
2. Prepare Render HTTPS deployment configuration.
3. Prepare Railway HTTPS deployment configuration.
4. Prepare Azure HTTPS deployment configuration.
5. Use an existing authorized hosting setup.

Before publishing, review HTTPS, writable index storage, source deployment,
access controls, rate limits, hosting logs, privacy, consent, and retention.
Verify platform-specific icons and installation requirements without caching
health responses or presenting offline evidence answers.

### Steps 5-6: device testing and pilot

Use the checks and launch commands in [README.md](README.md). Verify both
languages, narrow screens, actual taps and keyboard behavior, browser back,
abstention, unsupported questions, comparison cancellation, notebook clearing,
and optional sharing. Use fictional, non-identifying questions.

After readiness approval, run a small supervised pilot before a larger study.
Measure comprehension, source-finding, confidence, and intended next steps;
do not report intentions as observed health behavior or invent participant
results. Sample sizes, recruitment, instruments, and study approval remain
decisions to be made.

## Verified engineering baseline

- 20 Python backend tests passed at the backend baseline; the current frontend
  suite has 12 passing Node experience/API-client/presentation tests.
- Frontend production build and focused lint pass.
- Python dependency consistency and changed Python syntax checks pass.
- Browser-emulated checks at 320px, 390px and 1280px cover layout/state/API behavior,
  bilingual source retrieval, abstention, service errors, comparison,
  Decision-Card-before-reflection gating, notebook reflection retention,
  family checklist retention, cited PNG dimensions and sharing gates.
  Actual download completion/native mobile sharing still need device tests.
- No public HTTPS deployment, physical phone tests, clinical validation,
  semantic-safety validation, or participant study has been completed.

### Evidence and Decision Card: progressive disclosure

- Both views share concise English/Spanish evidence snapshots with the exact
  question and green/amber/slate icon badges. Three callouts cover food-first
  options, a practical next step, and safety without personal safety verdicts.
- Short reviewed, source-linked food metadata can appear in the callout; missing
  metadata is disclosed and lengthy lists remain complete in the source details.
- Full source passages, guidance, uncertainty, source references and label
  explanations remain in one keyboard-operable, initially collapsed
  "Read Full ODS Source Details" section. A short disclaimer stays visible.
- Predefined copy differentiates no-source coverage from a pending reviewed
  classification; positive snapshots require a reviewed mapping and source.
- Four presentation regressions pass (12 Node tests total). Browser-emulated
  320px/390px and desktop 1280px checks verify no horizontal overflow, collapsed
  defaults, keyboard source disclosure and minimum 44px action targets. All three
  badge foreground/background pairs exceed 4.5:1 contrast. Positive badge states
  were checked with synthetic browser responses, not new production evidence.
- The Decision Card/reflection/sharing flow remains in place. No LLM-generated
  summaries, health recommendations or new evidence classifications were added.

The prototype retrieves deterministically from local ODS material. It does not
call an LLM or browse for health claims at query time.
