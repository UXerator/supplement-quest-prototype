# SupplementQuest™ Phase 2 Promised Deliverables & System Context

**Project Title:** SupplementQuest™: Smarter Supplement Decisions  
**Challenge:** NIH / ODS "Supplements, Facts First" Challenge — Phase 2  
**Source Baseline:** Phase 1 Final Submission Package (`SupplementQuest_Submission_Package_with_CharCounts.docx`)  

---

## 1. Executive Summary & Product Mandate

SupplementQuest™ transforms NIH Office of Dietary Supplements (ODS) fact sheets into an interactive, evidence-based digital decision-support experience. 

### Core Product Directive
- **In-App Value First:** All primary educational and decision-support value **MUST** occur inside the app via an internal **Decision Card** before any optional social media sharing.
- **Secondary Reinforcement:** Social sharing functions strictly as secondary reinforcement after the user receives direct personal benefit within the app.
- **Educational Framing:** SupplementQuest™ is an educational decision-support tool, not medical advice.

### Behavioral Pathway (COM-B Alignment)
`Exposure → Investigation → Personal Benefit → Confidence → Decision → Optional Sharing → Reinforcement`

- **Capability:** ODS traceability, explicit evidence classification, and plain-language explanations.
- **Motivation:** Practical personal benefit, saved Decision Cards, and interactive confidence checks.
- **Opportunity:** Mobile-friendly UX, cost-aware guidance, and bilingual (English/Spanish) support.

---

## 2. Target Audiences & Features

1. **Young Adults (Ages 18–35):**
   - *Needs:* Rapid claim checking for fitness, energy, anxiety, and social media wellness marketing claims.
   - *Features:* Quick search, clear evidence labels, purchase comparison mode, and fast confidence checks.

2. **Food-Insecure Families:**
   - *Needs:* Protection from costly/unnecessary supplement marketing; budget-aware decision support.
   - *Features:* Cost-aware practical guidance, "Food-First" dietary alternatives grounded in ODS (e.g., dietary nutrient sources vs. expensive gummies), and pre-purchase necessity checks.

3. **Culturally Diverse / Bilingual Users:**
   - *Needs:* Plain-language accessibility across diverse cultural and language contexts.
   - *Features:* Seamless English and Spanish bilingual toggle across claims, safety notes, and Decision Cards.

---

## 3. Core Technical Architecture & Required Components

### 1. Constrained RAG Retrieval Layer (`rag_engine.py`)
- Restrict all LLM generation exclusively to retrieved NIH ODS fact sheets and approved in-scope federal resources.
- Zero hallucination or external web searching for unverified health claims.
- Include full ODS passage traceability and Master Claim IDs (`CLM-xxx`) for 100% of claims.

### 2. Evidence Classification Engine
Categorize all user query results into three standardized NIH evidence tiers:
- `Supported`
- `Limited Evidence`
- `Not Addressed`
Attach explicit uncertainty language where clinical trial data is limited or preliminary.

### 3. High-Risk Safety & Abstention Guardrails (`safety_filter.py`)
- Detect high-risk topics prior to AI generation:
  - Pregnancy / Lactation
  - Prescription Medication Interactions (e.g., Warfarin, Statins)
  - Pediatric / Infant Usage
  - Severe Multi-Condition Symptoms
- **Abstention Logic:** Instantly override AI generation and output a clinician/pharmacist referral notice with standard educational disclaimers.

### 4. Internal Decision Card Generator (`decision_card.py`)
Every query must produce a structured JSON payload for rendering an internal Decision Card containing:
- `claim_reviewed` (string)
- `master_claim_id` (string)
- `evidence_level` (`Supported` | `Limited Evidence` | `Not Addressed`)
- `ods_traceability_snippet` (string)
- `ods_source_url` (string)
- `safety_note` (string)
- `practical_guidance` (string)
- `food_first_alternative` (Optional[string])
- `confidence_check_prompt` (1–5 scale)
- `secondary_share_card_data` (Optional Shareable Summary)

### 5. Personal Notebook & History Layer
- Allow users to save, organize, and revisit past Decision Cards to compare supplements before purchase and reinforce long-term learning.

### 6. Secondary Optional Social Sharing Engine
- Convert validated in-app Decision Cards into optional shareable assets (myth-vs-fact graphics, checklists, short summary cards) only after internal card review.

---

## 4. Phase 2 Evaluation Metrics & Targets ($N=20–40$)

The prototype will be evaluated in Phase 2 user testing against these key performance targets:

- **Claim Classification Accuracy:** $\ge 25\%$ improvement in pre/post claim evaluation accuracy.
- **Decision Confidence:** $\ge 30\%$ improvement on self-reported decision confidence scales.
- **Evidence-Aligned Choices:** $\ge 70\%$ evidence-aligned decisions in pre-purchase simulation tasks.
- **Repeat Educational Use:** $60\%$ of users save $\ge 1$ card to notebook; $50\%$ return for repeat claim checks.
- **System Usability Scale (SUS):** Target score $\ge 70$ with favorable trust ratings.