import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowRight, BookmarkPlus, Scale, Apple, ExternalLink, ShieldCheck, Lightbulb, AlertTriangle } from 'lucide-react';
import { reviewClaim } from '../decision-api';
import { useQuest } from '../quest-context';
import { claimTopics } from '../claim-topics';
import { EvidenceBadge, FamilyChecklist, JourneyProgress, PageIntro } from '../QuestUI';
import { decisionHighlights, evidenceSummary } from '../evidence-summary';

export const Home = () => {
  const navigate = useNavigate();
  const { t } = useQuest();
  const [topicId, setTopicId] = useState('food');
  const topic = claimTopics.find(item => item.id === topicId);
  return <div className="content-area">
    <section className="home-hero">
      <p className="eyebrow">{t('Truth over hype', 'La verdad por encima del ruido')}</p>
      <h1>{t('A little clarity.\nA more informed choice.', 'Más claridad.\nUna decisión informada.')}</h1>
      <p>{t('Saw a supplement claim? Explore the evidence, consider your next step, and keep the facts that matter.',
        '¿Viste una afirmación sobre suplementos? Explora la evidencia, piensa en tu próximo paso y conserva los hechos importantes.')}</p>
      <button className="btn btn-primary" onClick={() => navigate('/input')}>
        <Search size={20} /> {t('Check a claim', 'Consultar una afirmación')} <ArrowRight size={18} />
      </button>
      <p className="hero-boundary">{t('Education, not medical advice. No account needed.',
        'Educación, no consejo médico. Sin necesidad de crear una cuenta.')}</p>
    </section>
    <JourneyProgress step={1} />
    <div className="home-grid">
      <section className="card discovery-panel">
        <div className="section-heading"><h2>{t('Start with what matters to you', 'Empieza por lo que te importa')}</h2></div>
        <div className="topic-filters" role="group" aria-label={t('Claim topics', 'Temas de afirmaciones')}>
          {claimTopics.map(item => <button key={item.id} className="topic-filter" aria-pressed={item.id === topicId}
            onClick={() => setTopicId(item.id)}>{t(...item.label)}</button>)}
        </div>
        <p className="coverage-note">{topic.available
          ? t('Local ODS food-source excerpts available. Claim classifications await qualified review.',
            'Hay extractos ODS locales de alimentos. Las clasificaciones esperan revisión profesional.')
          : t('Evidence coverage pending. You can check a claim, but this prototype will not invent an answer.',
            'Cobertura de evidencia pendiente. Puedes consultar, pero el prototipo no inventará una respuesta.')}</p>
        <div className="prompt-list">{topic.prompts.map(prompt => <button className="prompt-button" key={prompt[0]}
          onClick={() => navigate('/input', { state: { prompt: t(...prompt) } })}>
          <span>{t(...prompt)}</span><ArrowRight size={18} />
        </button>)}</div>
      </section>
      <section className="card trust-panel">
        <ShieldCheck size={28} />
        <h2>{t('Sources first. Always.', 'Las fuentes primero. Siempre.')}</h2>
        <p>{t('Health passages come from local NIH ODS material—not internet search or generated advice.',
          'Los pasajes de salud provienen de material NIH ODS local, no de búsquedas web ni consejos generados.')}</p>
        <p className="text-sm">{t('Currently: vitamin D and magnesium excerpts in English and Spanish. This prototype is not NIH-endorsed.',
          'Actualmente: extractos de vitamina D y magnesio en inglés y español. Este prototipo no cuenta con aval de NIH.')}</p>
        <button className="btn btn-quiet" onClick={() => navigate('/evidence-explainer')}>
          {t('Understand the evidence labels', 'Entender las etiquetas de evidencia')} <ArrowRight size={16} />
        </button>
      </section>
    </div>
    <div className="tool-grid">
      {[
        { path: '/food-first', Icon: Apple, title: t('Food before shopping', 'Alimentos antes de comprar'),
          text: t('Explore sources and a family checklist.', 'Explora fuentes y una lista para la familia.') },
        { path: '/compare', Icon: Scale, title: t('Compare the evidence', 'Compara la evidencia'),
          text: t('Two questions. No brand rankings.', 'Dos preguntas. Sin clasificar marcas.') },
        { path: '/notebook', Icon: BookmarkPlus, title: t('Your learning notebook', 'Tu cuaderno de aprendizaje'),
          text: t('Keep Decision Cards for this session.', 'Conserva tarjetas durante esta sesión.') },
      ].map(tool => <button className="tool-card" key={tool.path} onClick={() => navigate(tool.path)}>
        <tool.Icon size={24} /><strong>{tool.title}</strong><span>{tool.text}</span><ArrowRight size={18} />
      </button>)}
    </div>
    <button className="btn btn-quiet" onClick={() => navigate('/onboarding/1')}>
      {t('New here? See how it works', '¿Primera vez? Mira cómo funciona')}
    </button>
  </div>;
};

export const ClaimInput = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, query, prepareReview } = useQuest();
  const [value, setValue] = useState(location.state?.prompt ?? query);
  const [error, setError] = useState(false);
  return <div className="content-area narrow-content">
    <JourneyProgress step={1} />
    <PageIntro eyebrow={t('Step 1 · Encounter a claim', 'Paso 1 · Encuentra una afirmación')}
      title={t('What did you hear?', '¿Qué escuchaste?')}>
      <p>{t('Paste the claim or ask a question. We check local ODS evidence—not the popularity of a post.',
        'Pega la afirmación o haz una pregunta. Consultamos evidencia ODS local, no la popularidad de una publicación.')}</p>
    </PageIntro>
    <form className="card query-form" onSubmit={event => {
      event.preventDefault();
      if (!value.trim()) { setError(true); return; }
      prepareReview(value);
      navigate('/processing');
    }}>
      <label htmlFor="claim-query">{t('Claim or question', 'Afirmación o pregunta')}</label>
      <textarea id="claim-query" className="input-field" rows={5} maxLength={1000} value={value}
        placeholder={t('For example: What foods provide magnesium?', 'Por ejemplo: ¿Qué alimentos son fuente de magnesio?')}
        onChange={event => { setValue(event.target.value); setError(false); }}
        aria-invalid={error} aria-describedby="query-help claim-error" />
      <p id="query-help" className="field-help">{t('No names, identifying health details, or social-post URLs. Plain text only.',
        'Sin nombres, datos de salud que te identifiquen ni enlaces a publicaciones. Solo texto.')}</p>
      <p id="claim-error" role={error ? 'alert' : undefined} className="form-error">
        {error ? t('Enter a claim or question first.', 'Primero escribe una afirmación o pregunta.') : ''}
      </p>
      <button className="btn btn-primary btn-block" type="submit">
        {t('Explore the evidence', 'Explorar la evidencia')} <ArrowRight size={18} />
      </button>
    </form>
    <aside className="notice"><ShieldCheck size={22} /><p>{t(
      'Pregnancy, medicines, children, high doses, and serious conditions need professional guidance. Safety screening comes first.',
      'Embarazo, medicamentos, niños, dosis altas y enfermedades graves requieren orientación profesional. La seguridad va primero.',
    )}</p></aside>
  </div>;
};

export const Processing = () => {
  const navigate = useNavigate();
  const { query, language, setCard, t } = useQuest();
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    let disposed = false;
    const timeout = setTimeout(() => controller.abort(), 30000);
    reviewClaim(query, language, controller.signal).then(result => {
      if (disposed) return;
      setCard(result);
      navigate(result.is_abstention ? '/safety' : '/results', { replace: true });
    }).catch(() => {
      if (!disposed) setError(true);
    }).finally(() => clearTimeout(timeout));
    return () => { disposed = true; controller.abort(); clearTimeout(timeout); };
  }, [query, language, setCard, navigate]);
  useEffect(() => {
    if (!error) return;
    const heading = document.querySelector('.processing-panel h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      document.title = `${heading.textContent} | SupplementQuest`;
    }
  }, [error]);
  if (!query) return <Navigate to="/input" replace />;
  return <div className="content-area narrow-content">
    <JourneyProgress step={2} />
    <section className="card processing-panel">
      {error ? <>
        <PageIntro title={t('Unable to check this claim', 'No se pudo consultar esta afirmación')} />
        <p role="alert">{t(
          'The evidence service did not return a valid response. Check your connection and try again. No evidence conclusion was made.',
          'El servicio no devolvió una respuesta válida. Revisa tu conexión e inténtalo de nuevo. No se llegó a ninguna conclusión.',
        )}</p>
        <button className="btn btn-primary" onClick={() => navigate('/input', { replace: true })}>
          {t('Edit and try again', 'Editar e intentar de nuevo')}
        </button>
      </> : <div role="status" aria-live="polite">
        <Loader2 size={40} className="loading-icon" />
        <h1>{t('Checking local ODS sources…', 'Consultando fuentes ODS locales…')}</h1>
        <p>{t('Safety first. Then relevant passages and source references.',
          'Primero la seguridad. Después los pasajes y sus referencias.')}</p>
      </div>}
    </section>
  </div>;
};

export function CardEvidence({ card, compact = false }) {
  const { t } = useQuest();
  const sources = card.sources ?? [];
  const hasSources = sources.length > 0 || card.master_claim_id !== 'CLM-000';
  const sourceCount = sources.length || (hasSources ? 1 : 0);
  return <article className="decision-card">
    <div className="decision-header">
      <p className="eyebrow">{t('Your claim', 'Tu afirmación')}</p>
      <h2 className="claim-title">{card.claim_reviewed}</h2>
      <EvidenceBadge level={card.evidence_level} />
      <p className="tier-explanation">{card.evidence_level === 'Not Addressed'
        ? t('No reviewed conclusion for this claim. That is not the same as “false.”',
          'No hay una conclusión revisada para esta afirmación. No significa que sea falsa.')
        : t('Applies only to the reviewed claim and its context—not a personal recommendation.',
          'Solo se aplica a la afirmación revisada y su contexto, no es una recomendación personal.')}</p>
    </div>
    <div className="evidence-body">
      <section className="evidence-section">
        <h3>{t('What this means for you', 'Qué significa para ti')}</h3>
        <p>{card.practical_guidance}</p>
        <p className="uncertainty-note">{card.safety_note}</p>
      </section>
      {!compact && <section className="evidence-section">
        <div className="section-heading"><h3>{t('Go to the source', 'Consulta la fuente')}</h3>
          <span className="source-count">{sourceCount} {sourceCount === 1 ? t('passage', 'pasaje') : t('passages', 'pasajes')}</span></div>
        {sources.length ? sources.map((source, index) => <details className="source-disclosure"
          key={`${source.master_claim_id}-${index}`} open={index === 0}>
          <summary><span>{source.title}</span><small>{source.master_claim_id}</small></summary>
          <div className="source-content">
            <blockquote className="source-passage">{source.text}</blockquote>
            {source.url && /^https:\/\/ods\.od\.nih\.gov\//.test(source.url) && <a className="source-link"
              href={source.url} target="_blank" rel="noopener noreferrer">
              {t('Read on the official ODS site', 'Leer en el sitio oficial ODS')} <ExternalLink size={16} />
            </a>}
          </div>
        </details>) : <p className="source-passage">{card.ods_traceability_snippet}</p>}
        <p className="field-help">{card.claim_mapping_reviewed
          ? t('Reviewed claim mapping', 'Asignación de afirmación revisada')
          : hasSources ? t('Provisional source reference · claim review pending', 'Referencia provisional · revisión pendiente')
            : t('No local source match', 'Sin coincidencia con una fuente local')}: {card.master_claim_id}</p>
      </section>}
      {card.food_first_alternative && <section className="evidence-section">
        <h3>{t('Food-first alternative', 'Alternativa basada en alimentos')}</h3><p>{card.food_first_alternative}</p>
      </section>}
      <p className="field-help">{t('SupplementQuest labels—not official NIH ratings.',
        'Etiquetas de SupplementQuest, no calificaciones oficiales de NIH.')}</p>
    </div>
  </article>;
}

function EvidenceDecisionView({ card }) {
  const navigate = useNavigate();
  const { t, language } = useQuest();
  const summary = evidenceSummary(card, language);
  const highlights = decisionHighlights(card, language);
  const sources = card.sources ?? [];
  return <>
    <section className={`evidence-snapshot snapshot-${summary.level === 'Supported' ? 'supported' : summary.level === 'Limited Evidence' ? 'limited' : 'neutral'}`}
      aria-label={t('Evidence snapshot', 'Resumen de evidencia')}>
      <p className="eyebrow">{t('You asked', 'Tu pregunta')}</p>
      <h2 className="claim-title">{card.claim_reviewed}</h2>
      <EvidenceBadge level={summary.level} />
      <p className="snapshot-context">{summary.level === 'Supported'
        ? t('Reviewed support in context', 'Respaldo revisado en su contexto')
        : summary.level === 'Limited Evidence' ? t('Limited / uncertain evidence', 'Evidencia limitada / incierta')
          : t('No reviewed ODS conclusion', 'Sin conclusión ODS revisada')}</p>
      <p className="snapshot-takeaway">{summary.takeaway}</p>
      <p className="snapshot-uncertainty">{summary.uncertainty}</p>
    </section>
    <section className="quick-guidance" aria-labelledby="quick-guidance-title">
      <h2 id="quick-guidance-title">{t('Your quick guide', 'Tu guía rápida')}</h2>
      <ul className="highlight-list">
        <li className="guidance-row food-highlight"><Apple size={22} aria-hidden="true" />
          <div><h3>{t('Food-first options', 'Opciones alimentarias')}</h3><p>{highlights.food}</p>
            <button className="btn btn-quiet" onClick={() => navigate('/food-first')}>
              {t('Explore Food first', 'Explorar Alimentos')} <ArrowRight size={16} />
            </button></div></li>
        <li className="guidance-row"><Lightbulb size={22} aria-hidden="true" />
          <div><h3>{t('Practical next step', 'Próximo paso práctico')}</h3><p>{highlights.practical}</p></div></li>
        <li className="guidance-row safety-highlight"><AlertTriangle size={22} aria-hidden="true" />
          <div><h3>{t('Safety quick-check', 'Revisión rápida de seguridad')}</h3><p>{highlights.safety}</p></div></li>
      </ul>
    </section>
    <p className="snapshot-disclaimer"><ShieldCheck size={16} aria-hidden="true" />
      {t('Educational information—not medical advice.', 'Información educativa, no consejo médico.')}</p>
    <section className="evidence-details" aria-label={t('Explore the details', 'Explorar los detalles')}>
      <details className="source-disclosure">
        <summary>{t('Read Full ODS Source Details', 'Leer los detalles completos de las fuentes ODS')}
          <small>{t('Scientific passages, claim references & limitations', 'Pasajes científicos, referencias y limitaciones')}</small>
        </summary>
        <div className="source-content">
          <h3>{t('Detailed evidence & ODS traceability', 'Evidencia detallada y trazabilidad ODS')}</h3>
          <p>{card.claim_mapping_reviewed ? t('Reviewed claim mapping', 'Asignación de afirmación revisada')
            : card.master_claim_id === 'CLM-000' ? t('No local source match', 'Sin coincidencia con una fuente local')
              : t('Provisional source reference · claim review pending', 'Referencia provisional · revisión pendiente')}: <code>{card.master_claim_id}</code></p>
          {sources.length ? sources.map((source, index) => <section key={`${source.master_claim_id}-${index}`}>
            <h3>{source.title}</h3>
            <p className="field-help">{source.master_claim_id}</p>
            <blockquote className="source-passage">{source.text}</blockquote>
            {source.url && /^https:\/\/ods\.od\.nih\.gov\//.test(source.url) && <a className="source-link"
              href={source.url} target="_blank" rel="noopener noreferrer">
              {t('Read on Official NIH ODS Site', 'Leer en el sitio oficial NIH ODS')} <ExternalLink size={16} />
            </a>}
          </section>) : <p className="source-passage">{card.ods_traceability_snippet}</p>}
          <section><h3>{t('Full guidance, disclaimer & limitations', 'Orientación, aviso y limitaciones completas')}</h3>
          <p>{card.practical_guidance}</p><p>{card.safety_note}</p>
          {card.food_first_alternative && <p>{card.food_first_alternative}</p>}
          <p>{t('For individual supplement decisions, consult a qualified healthcare professional or pharmacist.',
            'Para decisiones individuales sobre suplementos, consulta con un profesional de la salud o farmacéutico.')}</p></section>
          <section><h3>{t('How evidence labels work', 'Cómo funcionan las etiquetas')}</h3>
          <p>{t('These are app labels, not official NIH ratings. They do not establish personal benefit or safety.',
            'Son etiquetas de la app, no calificaciones oficiales de NIH. No establecen un beneficio ni seguridad personal.')}</p>
          <p>{t('Supported: reviewed support in context. Limited evidence: uncertain evidence. Not addressed: no reviewed conclusion in our current library.',
            'Respaldado: apoyo revisado en su contexto. Evidencia limitada: evidencia incierta. No abordado: sin conclusión revisada en nuestra biblioteca actual.')}</p>
          <button className="btn btn-quiet" onClick={() => navigate('/evidence-explainer')}>
            {t('Explore all evidence labels', 'Explorar todas las etiquetas')}
          </button>
          </section>
        </div>
      </details>
    </section>
  </>;
}

export const ClaimResults = () => {
  const navigate = useNavigate();
  const { card, t } = useQuest();
  if (!card) return <Navigate to="/input" replace />;
  if (card.is_abstention) return <Navigate to="/safety" replace />;
  return <div className="content-area narrow-content">
    <JourneyProgress step={2} />
    <PageIntro eyebrow={t('Step 2 · Explore verified sources', 'Paso 2 · Explora fuentes verificadas')}
      title={t('The evidence at a glance', 'La evidencia de un vistazo')} />
    <EvidenceDecisionView card={card} />
    <div className="action-bar"><button className="btn btn-primary btn-block" onClick={() => navigate('/decision-card')}>
      {t('Consider my next step', 'Considerar mi próximo paso')} <ArrowRight size={18} />
    </button><button className="btn btn-quiet" onClick={() => navigate('/input')}>{t('Edit my question', 'Editar mi pregunta')}</button></div>
  </div>;
};

export const DecisionCardDetail = () => {
  const navigate = useNavigate();
  const { card, saveCard, saved, reflection, setCardViewed, t } = useQuest();
  useEffect(() => {
    if (card && !card.is_abstention) setCardViewed(true);
  }, [card, setCardViewed]);
  if (!card) return <Navigate to="/input" replace />;
  if (card.is_abstention) return <Navigate to="/safety" replace />;
  return <div className="content-area narrow-content">
    <JourneyProgress step={3} />
    <PageIntro eyebrow={t('Step 3 · Understand and decide', 'Paso 3 · Comprende y decide')}
      title={t('Your next step. Your choice.', 'Tu próximo paso. Tu decisión.')}>
      <p>{t('Keep what you learned, consider food and budget, then reflect. No purchase recommendation.',
        'Conserva lo aprendido, considera alimentos y presupuesto, y reflexiona. Sin recomendar compras.')}</p>
    </PageIntro>
    <EvidenceDecisionView card={card} />
    <FamilyChecklist />
    {reflection && <div className="notice reflection-summary"><ShieldCheck size={22} aria-hidden="true" />
      <p><strong>{t('Your reflection', 'Tu reflexión')}</strong><br />{reflection.confidence} · {reflection.nextStep}</p>
    </div>}
    <div className="action-bar">
      <button className="btn btn-primary btn-block" onClick={() => navigate('/reflection')}>
        {reflection ? t('Update my reflection', 'Actualizar mi reflexión') : t('Choose my next step', 'Elegir mi próximo paso')} <ArrowRight size={18} />
      </button>
      <button className="btn btn-outline btn-block" onClick={saveCard} disabled={saved}>
        <BookmarkPlus size={18} /> {saved ? t('Saved in this session', 'Guardada en esta sesión') : t('Save to notebook', 'Guardar en el cuaderno')}
      </button>
      {reflection && <button className="btn btn-quiet" onClick={() => navigate('/share')}>
        {t('Optional: share the facts', 'Opcional: compartir los hechos')} <ArrowRight size={18} />
      </button>}
    </div>
  </div>;
};
