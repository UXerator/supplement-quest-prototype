# SupplementQuest Phase 2 Requirements, Panel Considerations & Recommendations

**Project Name:** SupplementQuest (Team INGREXA)  
**Challenge:** NIH / ODS "Supplements, Facts First" Challenge — Phase 2  
**Baseline Version:** Production v1.6  
**Final Submission Deadline:** May 18, 2027 (5:00 PM ET)  
**Interim Deadline:** December 11, 2026 (Lead-Partner Signed Confirmation)  

---

## 1. Executive Summary & Core Rules

Phase 2 requires building and validating a focused, functional prototype grounded strictly in National Institutes of Health (NIH) Office of Dietary Supplements (ODS) fact sheets. 

### Core Product Rule
- All primary educational and decision-support value **MUST** occur inside the app via an internal **Decision Card** before any optional social sharing.
- Social sharing functions purely as secondary reinforcement.

### Core Behavioral Pathway (COM-B)
`Exposure → Investigation → Personal Benefit → Confidence → Decision → Optional Sharing → Reinforcement`

---

## 2. Universal Submission Packages (The 10 Gates / Must-Haves)

To maintain eligibility, the submission must clear 10 official Must-Haves across 10 packages:

| Package | Title & Topic | Eligibility Gate (Must-Have) | Format & Character Limits |
| :--- | :--- | :--- | :--- |
| **Package 1** | Prototype Documentation | **Must-Have 4, 5, 6:** 2 Operational Modalities, 2 Required Audiences, Cross-Modal Architecture. | ~12,000 characters + Architecture Diagram |
| **Package 2** | ODS Traceability Table | **Must-Have 1:** Master Claim IDs (`CLM-xxx`) linking 100% of claims to exact ODS passages. | Searchable XLSX / PDF |
| **Package 3** | User Study & Behavioral Evidence | **Must-Have 2:** Real-user testing ($N=20–40$) measuring SUS usability and proximal outcomes. | ~7,500 characters |
| **Package 4** | Community Engagement & Verification | **Must-Have 9:** Signed lead-partner agreement + documented visible prototype change. | ~6,000 characters + Signed Part B (Due Dec 11, 2026) |
| **Package 5** | Accessibility & Plain Language | **Must-Have 7:** No critical accessibility blockers in core journey; WCAG/bilingual check. | DOCX/XLSX Checklist |
| **Package 6** | Technical Readiness & TRL 6 | **Must-Have 8:** Prototype operating in realistic environment; load testing & defect log. | Evidence + 0.5-page TRL discussion + ~3,000 chars |
| **Package 7** | Screen Recording Demo | **Must-Have 6:** Full end-to-end user journey showing both modalities without manual intervention. | $\le 10$-minute video (YouTube/Vimeo) |
| **Package 8** | Participant Protection & Privacy | **Must-Have 3:** Data inventory, consent pathway, retention/deletion lifecycle, no PII. | ~1.5 pages + Data Inventory |
| **Package 9** | Scope, Safety & Boundaries | Scope-of-Tool Statement, user-facing boundaries, high-risk referral/abstention triggers. | ~4,500 characters + Visuals |
| **Package 10** | AI Governance & Safety Testing | **Must-Have 10 (Conditional):** Reviewer model, error taxonomy, safety test/retest log. | ~6,000 characters |

---

## 3. Mandatory Requirements by System Area

### Target Audiences & Access Pathways
1. **Young Adults (Ages 18–35):** Focused on fitness, energy, anxiety, and navigating social media claims.
2. **Food-Insecure Families:** Focused on budget-aware guidance, cost comparison, and food-first alternatives (e.g., dietary sources vs. expensive gummy supplements).
3. **Bilingual Support:** English and Spanish plain-language capability reviewed by native/qualified reviewers.

### Technical & AI Architecture
- **Constrained RAG:** Restrict LLM generation exclusively to retrieved NIH ODS passages. Zero external health claim searching.
- **Evidence Classification Engine:** Standardize all output into exact ODS tiers:
  - `Supported`
  - `Limited Evidence`
  - `Not Addressed`
- **Safety Filter (`safety_filter.py`):** Pre-execution keyword and semantic intent checking for:
  - Pregnancy / Lactation
  - Prescription Medication Interactions (e.g., Warfarin, Statins)
  - Pediatric / Infant Safety
  - Severe Multi-Condition Symptoms
- **Abstention Response:** Automatic override returning clinician referral notices when safety triggers fire.

---

## 4. Judging Panel Considerations & Strategic Recommendations

Based on the Phase 2 Team Coaching Packet and Guidelines, address these key areas to maximize scoring:

### 1. Make Target Audiences Visible in the UI
- **Panel Priority:** Need, fit, confirmed access, and cultural/language adaptations must be explicit in the product design.
- **Recommendation:** Include preset quick-filter chips for *Food-Insecure Families* (e.g., "Food-First Options") and *Young Adults* (e.g., "Sports & Recovery"). Show the Spanish toggle prominently on key screens.

### 2. Complete Card-Level Traceability & Reviewer Oversight
- **Panel Priority:** Ensure every single Decision Card output maps to an ODS fact sheet passage, supported by clear human reviewer credentials and escalation paths.
- **Recommendation:** Maintain an explicit `master_claim_id` field in all backend payloads. Document human-in-the-loop audit cadences (e.g., sampling 10% of dynamic queries weekly).

### 3. Establish Clear Boundaries (Education vs. Medical Advice)
- **Panel Priority:** Protect users from oversimplified or harmful health recommendations.
- **Recommendation:** Display persistent "Educational, Not Medical Advice" footers across onboarding and Decision Cards. Trigger instant abstention for high-risk topics.

### 4. Prove Behavioral Outcomes in User Testing ($N=20–40$)
- **Panel Priority:** Demonstrate proximal outcomes (confidence, claim accuracy, behaviorally specific intention) without mislabeling intention as observed long-term behavior.
- **Recommendation:** Use standard System Usability Scale (SUS $\ge 70$) targets alongside pre/post decision accuracy tasks.

---

## 5. Immediate Action Timeline

1. **Dec 11, 2026:** Secure signed Lead-Partner Confirmation (Package 4 Part B) documenting at least 1 visible prototype change.
2. **Jan 8, 2027:** (Optional) Submit Midpoint Review to HeroX for formal written feedback.
3. **Jan – Mar 2027:** Execute user testing ($N=20–40$) and run accessibility/load tests.
4. **Apr – May 2027:** Record $\le 10$-minute demo video and assemble final HeroX submission package.