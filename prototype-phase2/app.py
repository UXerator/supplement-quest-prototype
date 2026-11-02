"""Streamlit dashboard for SupplementQuest's local, ODS-grounded prototype."""

from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any

import streamlit as st

from decision_card import DecisionCard
from decision_service import SupplementQuestService

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "ods"
DATABASE_DIR = BASE_DIR / ".chroma"

TEXT: dict[str, dict[str, str]] = {
    "English": {
        "title": "SupplementQuest",
        "tagline": "Explore supplement claims. See the evidence. Decide with confidence.",
        "boundary": "Educational information only — not medical advice.",
        "audience": "Explore as",
        "young": "Young adults (18–35)",
        "family": "Food-insecure families",
        "ask": "Ask about a claim",
        "compare": "Compare ingredients",
        "notebook": "My notebook",
        "question": "What would you like to check?",
        "preset": "Try a sample question",
        "custom": "Or enter your own question",
        "submit": "Review this claim",
        "evidence": "Evidence level",
        "trace": "ODS source passage",
        "claim_id": "Master Claim ID",
        "provisional_reference": "Provisional passage reference (not reviewer-approved)",
        "unmapped_claim": "No Master Claim mapping is available.",
        "guidance": "Practical guidance",
        "food": "Food-first alternative",
        "confidence": "Confidence check",
        "share": "Create optional share-card preview",
        "share_title": "Share-card preview",
        "share_note": "Sharing is optional. Your decision card is the primary result.",
        "abstention": "For your safety, this question was not searched or sent for generation.",
        "no_sources": "No local ODS fact sheets are loaded yet. Add official ODS Markdown or reviewed JSON files under `data/ods/`.",
        "compare_note": "This compares retrieved ingredient evidence only. It does not evaluate brands, product quality, or personal safety.",
        "first": "First ingredient or claim",
        "second": "Second ingredient or claim",
        "compare_button": "Compare evidence",
        "empty_notebook": "Your notebook is empty. Reviewed questions stay only in this browser session.",
        "clear": "Clear notebook",
        "privacy": "Do not enter names or other identifying health information.",
    },
    "Español": {
        "title": "SupplementQuest",
        "tagline": "Explora afirmaciones sobre suplementos. Revisa la evidencia. Decide con confianza.",
        "boundary": "Información educativa únicamente; no es consejo médico.",
        "audience": "Explorar como",
        "young": "Adultos jóvenes (18–35)",
        "family": "Familias con inseguridad alimentaria",
        "ask": "Consulta una afirmación",
        "compare": "Compara ingredientes",
        "notebook": "Mi cuaderno",
        "question": "¿Qué te gustaría revisar?",
        "preset": "Prueba una pregunta",
        "custom": "O escribe tu propia pregunta",
        "submit": "Revisar esta afirmación",
        "evidence": "Nivel de evidencia",
        "trace": "Pasaje de la fuente ODS",
        "claim_id": "ID de afirmación maestra",
        "provisional_reference": "Referencia provisional del pasaje (sin revisión humana)",
        "unmapped_claim": "No hay una asignación de afirmación maestra disponible.",
        "guidance": "Orientación práctica",
        "food": "Alternativa basada en alimentos",
        "confidence": "Revisa tu confianza",
        "share": "Crear vista previa opcional para compartir",
        "share_title": "Vista previa para compartir",
        "share_note": "Compartir es opcional. La tarjeta de decisión es el resultado principal.",
        "abstention": "Por seguridad, esta pregunta no se buscó ni se envió para generar una respuesta.",
        "no_sources": "Aún no hay hojas informativas ODS locales. Agrega archivos oficiales Markdown o JSON revisados en `data/ods/`.",
        "compare_note": "Esta comparación solo revisa la evidencia recuperada sobre ingredientes. No evalúa marcas, calidad ni seguridad personal.",
        "first": "Primer ingrediente o afirmación",
        "second": "Segundo ingrediente o afirmación",
        "compare_button": "Comparar evidencia",
        "empty_notebook": "Tu cuaderno está vacío. Las consultas revisadas solo se guardan en esta sesión del navegador.",
        "clear": "Borrar cuaderno",
        "privacy": "No ingreses nombres ni otra información de salud que te identifique.",
    },
}

SAMPLE_QUESTIONS = [
    "Does Ashwagandha boost testosterone?",
    "Are gummy vitamins worth it for kids?",
    "What does ODS say about vitamin D?",
]


@lru_cache(maxsize=1)
def get_service() -> SupplementQuestService:
    """Reuse the local vector index across Streamlit reruns."""
    return SupplementQuestService(DATA_DIR, DATABASE_DIR)


def _update_query_from_preset() -> None:
    """Copy the selected preset into the editable query field."""
    st.session_state["claim_query"] = st.session_state["preset_prompt"]


def _render_card(card: DecisionCard, labels: dict[str, str], key: str) -> None:
    """Render the complete primary card before exposing its optional share preview."""
    st.subheader(card.claim_reviewed)
    if card.is_abstention:
        st.error(labels["abstention"])
        st.warning(card.safety_note)
        if card.matched_safety_categories:
            st.caption("Safety categories: " + ", ".join(card.matched_safety_categories))
        return

    st.markdown(f"**{labels['evidence']}:** {card.evidence_level}")
    st.info(card.safety_note)
    with st.expander(labels["trace"], expanded=True):
        st.text(card.ods_traceability_snippet)
        if card.claim_mapping_reviewed:
            st.caption(f"{labels['claim_id']}: {card.master_claim_id}")
        elif card.master_claim_id == "CLM-000":
            st.caption(labels["unmapped_claim"])
        else:
            st.caption(f"{labels['provisional_reference']}: {card.master_claim_id}")
    st.markdown(f"**{labels['guidance']}**\n\n{card.practical_guidance}")
    if card.food_first_alternative:
        st.markdown(f"**{labels['food']}**\n\n{card.food_first_alternative}")
    st.markdown(f"**{labels['confidence']}**")
    st.write(card.confidence_check_prompt.get("question", ""))
    st.radio(
        " ",
        card.confidence_check_prompt.get("options", []),
        key=f"confidence_{key}",
        horizontal=True,
        label_visibility="collapsed",
    )

    if st.button(labels["share"], key=f"share_{key}"):
        card.secondary_share_card_data = {
            "claim_reviewed": card.claim_reviewed,
            "master_claim_id": card.master_claim_id,
            "evidence_level": str(card.evidence_level),
        }
    if card.secondary_share_card_data:
        st.markdown(f"**{labels['share_title']}**")
        st.json(card.secondary_share_card_data)
        st.caption(labels["share_note"])


def _review_and_store(query: str, language: str) -> DecisionCard:
    """Review a query and add its summary to the session-only notebook."""
    card = get_service().review(query, language)
    history: list[dict[str, Any]] = st.session_state.setdefault("history", [])
    history.insert(
        0,
        {
            "query": query,
            "master_claim_id": card.master_claim_id,
            "evidence_level": str(card.evidence_level),
            "time": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        },
    )
    return card


def main() -> None:
    """Render the Q&A, comparison, and session-notebook experiences."""
    st.set_page_config(page_title="SupplementQuest", page_icon="🌿", layout="wide")
    language = st.selectbox("Language / Idioma", list(TEXT), label_visibility="collapsed")
    labels = TEXT[language]
    st.title(labels["title"])
    st.write(labels["tagline"])
    st.caption(labels["boundary"])
    st.caption(labels["privacy"])

    audience = st.radio(
        labels["audience"],
        [labels["young"], labels["family"]],
        horizontal=True,
    )
    if audience == labels["family"]:
        st.caption(
            "Food-first options and affordability are emphasized; no purchases are required."
            if language == "English"
            else "Se destacan opciones basadas en alimentos y asequibles; no es necesario comprar."
        )
    else:
        st.caption(
            "Explore common fitness, energy, and social-media supplement claims."
            if language == "English"
            else "Explora afirmaciones comunes sobre ejercicio, energía y suplementos en redes."
        )

    indexed_count = get_service().rag_engine.collection.count()
    if indexed_count == 0:
        st.info(labels["no_sources"])

    ask_tab, compare_tab, notebook_tab = st.tabs(
        [labels["ask"], labels["compare"], labels["notebook"]]
    )
    with ask_tab:
        preset = st.selectbox(
            labels["preset"],
            [""] + SAMPLE_QUESTIONS,
            key="preset_prompt",
            on_change=_update_query_from_preset,
        )
        with st.form("claim_form"):
            st.session_state.setdefault("claim_query", preset)
            query = st.text_input(labels["custom"], key="claim_query", max_chars=1000)
            submitted = st.form_submit_button(labels["submit"], type="primary")
        if submitted:
            if not query.strip():
                st.warning(labels["question"])
            else:
                st.session_state["current_card"] = _review_and_store(
                    query.strip(), language
                )
        current_card = st.session_state.get("current_card")
        if current_card:
            _render_card(current_card, labels, "main")

    with compare_tab:
        st.caption(labels["compare_note"])
        with st.form("comparison_form"):
            left, right = st.columns(2)
            first = left.text_input(labels["first"], max_chars=150)
            second = right.text_input(labels["second"], max_chars=150)
            compare_submitted = st.form_submit_button(labels["compare_button"])
        if compare_submitted:
            if not first.strip() or not second.strip():
                st.warning(labels["question"])
            else:
                st.session_state["comparison_cards"] = [
                    _review_and_store(first.strip(), language),
                    _review_and_store(second.strip(), language),
                ]
        comparison_cards = st.session_state.get("comparison_cards", [])
        if comparison_cards:
            left, right = st.columns(2)
            for column, card, key in zip((left, right), comparison_cards, ("left", "right")):
                with column:
                    _render_card(card, labels, f"compare_{key}")

    with notebook_tab:
        history = st.session_state.get("history", [])
        if not history:
            st.info(labels["empty_notebook"])
        else:
            st.dataframe(history, hide_index=True)
            if st.button(labels["clear"]):
                st.session_state["history"] = []
                st.rerun()


if __name__ == "__main__":
    main()
