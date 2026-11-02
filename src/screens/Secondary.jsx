import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlertTriangle, Download, Share2, NotebookPen, ArrowRight, Apple, Scale } from 'lucide-react';
import { useQuest } from '../quest-context';
import { reviewClaim } from '../decision-api';
import { CardEvidence } from './CoreApp';
import { EvidenceBadge, FamilyChecklist, JourneyProgress, PageIntro } from '../QuestUI';
import { checklistCount } from '../family-checklist';
import { buildShareContent, shareContentText, renderShareImage, downloadBlob } from '../share-card';

export const CompareBeforeBuy = () => {
  const { language, t } = useQuest();
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const activeRequest = useRef(null);
  useEffect(() => () => {
    activeRequest.current?.abort();
    activeRequest.current = null;
  }, []);
  async function compare(event) {
    event.preventDefault();
    if (!first.trim() || !second.trim()) { setError('empty'); return; }
    setBusy(true);
    setResults(null);
    setError(null);
    const controller = new AbortController();
    activeRequest.current = controller;
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const cards = await Promise.all([
        reviewClaim(first.trim(), language, controller.signal),
        reviewClaim(second.trim(), language, controller.signal),
      ]);
      if (activeRequest.current === controller) setResults({ cards, language });
    } catch {
      controller.abort();
      if (activeRequest.current === controller) setError('service');
    } finally {
      clearTimeout(timer);
      if (activeRequest.current === controller) { activeRequest.current = null; setBusy(false); }
    }
  }
  return <div className="content-area">
    <PageIntro eyebrow={t('A pause before purchasing', 'Una pausa antes de comprar')}
      title={t('Compare evidence. Not brands.', 'Compara evidencia. No marcas.')}>
      <p>{t('Two ingredient questions, checked separately. No price rankings, personal safety scores, or purchase recommendations.',
        'Dos preguntas sobre ingredientes, consultadas por separado. Sin clasificar precios, puntuar seguridad personal ni recomendar compras.')}</p>
    </PageIntro>
    <form className="card" onSubmit={compare}>
      <div className="comparison-grid">
        <div><label htmlFor="compare-first">{t('First question', 'Primera pregunta')}</label>
          <input id="compare-first" className="input-field" maxLength={1000} value={first}
            onChange={event => setFirst(event.target.value)} disabled={busy} /></div>
        <div><label htmlFor="compare-second">{t('Second question', 'Segunda pregunta')}</label>
          <input id="compare-second" className="input-field" maxLength={1000} value={second}
            onChange={event => setSecond(event.target.value)} disabled={busy} /></div>
      </div>
      <button className="btn btn-primary" disabled={busy} type="submit"><Scale size={18} />
        {busy ? t('Checking…', 'Consultando…') : t('Compare evidence', 'Comparar evidencia')}
      </button>
    </form>
    {error && <p role="alert" className="notice">{error === 'empty'
      ? t('Enter both questions.', 'Escribe ambas preguntas.')
      : t('The service could not complete this comparison. Try again.', 'El servicio no pudo completar la comparación. Inténtalo de nuevo.')}</p>}
    <div className="comparison-grid">{results?.language === language && results.cards.map((card, index) => (
      <section key={index} aria-label={index === 0 ? t('First result', 'Primer resultado') : t('Second result', 'Segundo resultado')}>
        {card.is_abstention ? <div className="card safety-alert" role="alert">
          <AlertTriangle size={24} /><h2>{card.claim_reviewed}</h2><p>{card.safety_note}</p>
        </div> : <CardEvidence card={card} />}
      </section>
    ))}</div>
  </div>;
};

export const Notebook = () => {
  const navigate = useNavigate();
  const { notebook, reopenCard, clearNotebook, t, language } = useQuest();
  return <div className="content-area narrow-content">
    <PageIntro eyebrow={t('Keep the learning', 'Conserva lo aprendido')}
      title={t('Your notebook', 'Tu cuaderno')}>
      <p>{t('A quiet place for your Decision Cards. Memory only: reloading or closing the app clears everything.',
        'Un espacio para tus tarjetas de decisión. Solo en memoria: recargar o cerrar la app borra todo.')}</p>
    </PageIntro>
    {!notebook.length && <section className="card empty-state">
      <NotebookPen size={36} /><h2>{t('Your next insight belongs here.', 'Tu próximo aprendizaje va aquí.')}</h2>
      <p>{t('Check a claim, reflect, and save your Decision Card.', 'Consulta una afirmación, reflexiona y guarda tu tarjeta.')}</p>
      <button className="btn btn-primary" onClick={() => navigate('/input')}>{t('Check my first claim', 'Consultar mi primera afirmación')}</button>
    </section>}
    {notebook.map(entry => <article className="card" key={entry.id}>
      <p className="eyebrow">{entry.language === 'English' ? 'English' : 'Español'} · {
        new Date(entry.savedAt).toLocaleDateString(language === 'English' ? 'en' : 'es')}</p>
      <h2>{entry.card.claim_reviewed}</h2><EvidenceBadge level={entry.card.evidence_level} />
      <p className="field-help">{checklistCount(entry.checklist ?? {})} / 5 {t('checklist items considered', 'elementos de la lista considerados')}</p>
      {entry.reflection && <p className="text-sm">{entry.reflection.confidence} · {entry.reflection.nextStep}</p>}
      <button className="btn btn-outline btn-block" onClick={() => {
        reopenCard(entry); navigate(entry.card.is_abstention ? '/safety' : '/decision-card');
      }}>{t('Reopen card', 'Reabrir tarjeta')} <ArrowRight size={18} /></button>
    </article>)}
    {!!notebook.length && <button className="btn btn-quiet" onClick={clearNotebook}>{t('Clear notebook', 'Borrar cuaderno')}</button>}
  </div>;
};

export const ConfidenceCheck = () => {
  const navigate = useNavigate();
  const { card, reflection, setReflection, cardViewed, t } = useQuest();
  const [confidence, setConfidence] = useState(reflection?.confidence ?? '');
  const [nextStep, setNextStep] = useState(reflection?.nextStep ?? '');
  const [error, setError] = useState(false);
  if (!card) return <Navigate to="/input" replace />;
  if (card.is_abstention) return <Navigate to="/safety" replace />;
  if (!cardViewed) return <Navigate to="/decision-card" replace />;
  const nextSteps = [
    t('Learn more before deciding', 'Aprender más antes de decidir'),
    t('Wait', 'Esperar'), t('Do not buy', 'No comprar'),
    t('Discuss with clinician/pharmacist', 'Hablar con un profesional de salud o farmacéutico'),
  ];
  return <div className="content-area narrow-content">
    <JourneyProgress step={3} />
    <PageIntro title={t('A moment to reflect.', 'Un momento para reflexionar.')}>
      <p>{t('There is no “right” response here. This is your intention, not a medical recommendation or an observed behavior.',
        'No hay una respuesta correcta. Es tu intención, no una recomendación médica ni un comportamiento observado.')}</p>
    </PageIntro>
    <form onSubmit={event => {
      event.preventDefault();
      if (!confidence || !nextStep) { setError(true); return; }
      setReflection({ confidence, nextStep }); navigate('/decision-card');
    }}>
      <fieldset className="card choice-fieldset">
        <legend>{card.confidence_check_prompt.question}</legend>
        <div className="choice-grid">{card.confidence_check_prompt.options.map(option => <label className="choice-option" key={option}>
          <input type="radio" name="confidence" value={option} checked={confidence === option}
            onChange={() => setConfidence(option)} /><span>{option}</span>
        </label>)}</div>
      </fieldset>
      <fieldset className="card choice-fieldset">
        <legend>{t('What is your next step?', '¿Cuál es tu próximo paso?')}</legend>
        <div className="choice-grid">{nextSteps.map(option => <label className="choice-option" key={option}>
          <input type="radio" name="next-step" value={option} checked={nextStep === option}
            onChange={() => setNextStep(option)} /><span>{option}</span>
        </label>)}</div>
      </fieldset>
      {error && <p role="alert" className="form-error">{t('Choose a response in both groups.', 'Elige una respuesta en ambos grupos.')}</p>}
      <button className="btn btn-primary btn-block" type="submit">{t('Save reflection', 'Guardar reflexión')} <ArrowRight size={18} /></button>
    </form>
  </div>;
};

export const ShareScreen = () => {
  const { card, reflection, cardViewed, language, t } = useQuest();
  const [status, setStatus] = useState('');
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    if (!card || card.is_abstention || !reflection || !cardViewed) return;
    let disposed = false;
    let url;
    renderShareImage(buildShareContent(card, language)).then(blob => {
      if (disposed) return;
      url = URL.createObjectURL(blob);
      setImage({ blob, url });
    }).catch(() => { if (!disposed) setImageError(true); });
    return () => { disposed = true; if (url) URL.revokeObjectURL(url); };
  }, [card, language, reflection, cardViewed]);
  if (!card) return <Navigate to="/input" replace />;
  if (card.is_abstention) return <Navigate to="/safety" replace />;
  if (!reflection || !cardViewed) return <Navigate to="/decision-card" replace />;
  const content = buildShareContent(card, language);
  const text = shareContentText(content);
  async function share() {
    try {
      await navigator.share({ title: 'SupplementQuest', text });
      setStatus(t('Shared.', 'Compartido.'));
    } catch (error) {
      setStatus(error.name === 'AbortError' ? t('Sharing cancelled.', 'Se canceló el envío.')
        : t('Sharing failed. Download the text or graphic instead.', 'No se pudo compartir. Descarga el texto o la imagen.'));
    }
  }
  return <div className="content-area narrow-content">
    <JourneyProgress step={4} />
    <PageIntro eyebrow={t('Step 4 · Optional sharing', 'Paso 4 · Compartir es opcional')}
      title={t('Let the facts travel.', 'Que los hechos lleguen más lejos.')}>
      <p>{t('Your in-app Decision Card comes first. This graphic leaves out your question, reflection, and checklist.',
        'Tu tarjeta dentro de la app va primero. La imagen no incluye tu pregunta, reflexión ni lista.')}</p>
    </PageIntro>
    {image && <div className="share-preview"><img src={image.url}
      alt={t('Educational evidence graphic. Full accessible text follows.', 'Imagen educativa de evidencia. El texto accesible completo aparece a continuación.')} /></div>}
    {!image && !imageError && <p role="status">{t('Preparing your graphic…', 'Preparando tu imagen…')}</p>}
    {imageError && <p role="alert">{t('The graphic could not be created. The text version is still available.',
      'No se pudo crear la imagen. La versión de texto sigue disponible.')}</p>}
    <details className="source-disclosure"><summary>{t('Read the share card text', 'Leer el texto de la tarjeta')}</summary>
      <pre className="source-content source-passage">{text}</pre>
    </details>
    <div className="action-bar">
      <button className="btn btn-primary btn-block" disabled={!image}
        onClick={() => { downloadBlob(image.blob, 'supplementquest-evidence.png'); setStatus(t('Graphic download requested.', 'Descarga de imagen solicitada.')); }}>
        <Download size={18} /> {t('Download graphic · PNG', 'Descargar imagen · PNG')}
      </button>
      {typeof navigator.share === 'function' && <button className="btn btn-outline btn-block" onClick={share}>
        <Share2 size={18} /> {t('Share source text', 'Compartir texto de la fuente')}
      </button>}
      <button className="btn btn-quiet" onClick={() => {
        downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), 'supplementquest-learning.txt');
        setStatus(t('Text download requested.', 'Descarga de texto solicitada.'));
      }}>{t('Download accessible text', 'Descargar texto accesible')}</button>
    </div>
    <p role="status">{status}</p>
    <p className="field-help">{t('No automatic “myth” verdict: insufficient evidence is not proof that a claim is false. Source excerpts may be shortened; the official link is included.',
      'Sin declarar automáticamente un mito: evidencia insuficiente no demuestra falsedad. Los extractos pueden acortarse; se incluye el enlace oficial.')}</p>
  </div>;
};

export const FoodFirstGuidance = () => {
  const navigate = useNavigate();
  const { card, t } = useQuest();
  return <div className="content-area">
    <PageIntro eyebrow={t('Practical choices, without pressure', 'Decisiones prácticas, sin presión')}
      title={t('Food first. Budget in mind.', 'Alimentos primero. Sin olvidar el presupuesto.')}>
      <p>{t('Explore foods mentioned by ODS, then use the checklist to plan a conversation—not diagnose a deficiency.',
        'Explora alimentos mencionados por ODS y usa la lista para planificar una conversación, no diagnosticar una deficiencia.')}</p>
    </PageIntro>
    <div className="food-layout">
      <section>
        <div className="card"><Apple size={26} /><h2>{t('Explore an official food source', 'Explora una fuente oficial de alimentos')}</h2>
          <p>{t('This app cannot tell whether your diet meets nutrient needs or whether you should buy a supplement.',
            'La app no puede determinar si tu dieta cubre tus necesidades ni si debes comprar un suplemento.')}</p>
          {[
            t('What foods provide magnesium?', '¿Qué alimentos son fuente de magnesio?'),
            t('What foods provide vitamin D?', '¿Qué alimentos contienen vitamina D?'),
          ].map(prompt => <button className="prompt-button mb-3" key={prompt}
            onClick={() => navigate('/input', { state: { prompt } })}><span>{prompt}</span><ArrowRight size={18} /></button>)}
        </div>
        {card && !card.is_abstention && card.food_first_alternative && <div className="card">
          <h2>{t('From your reviewed Decision Card', 'De tu tarjeta revisada')}</h2><p>{card.food_first_alternative}</p>
        </div>}
        <aside className="notice"><p>{t('For children, pregnancy, medications, high doses, or serious conditions: discuss supplement decisions with a clinician or pharmacist.',
          'Para niños, embarazo, medicamentos, dosis altas o enfermedades graves: consulta las decisiones con un profesional de salud o farmacéutico.')}</p></aside>
      </section>
      <FamilyChecklist />
    </div>
  </div>;
};

export const SafetyHighRisk = () => {
  const navigate = useNavigate();
  const { card, t } = useQuest();
  return <div className="content-area narrow-content">
    <PageIntro eyebrow={t('Safety comes first', 'La seguridad va primero')}
      title={t('This deserves professional guidance.', 'Esto merece orientación profesional.')} />
    <div className="card safety-alert" role="alert">
      <AlertTriangle size={30} className="safety-heading" />
      <h2>{t('Educational safety notice', 'Aviso educativo de seguridad')}</h2>
      {card?.is_abstention ? <>
        <p className="safety-verbatim">{card.safety_note}</p>
        <p className="field-help">{t('Evidence retrieval was skipped. No personal safety conclusion was made.',
          'Se omitió la búsqueda de evidencia. No se llegó a una conclusión de seguridad personal.')}</p>
      </> : <p>{t('Questions about pregnancy, medicines, children, high doses, or serious conditions need professional guidance.',
        'Las preguntas sobre embarazo, medicamentos, niños, dosis altas o enfermedades graves necesitan orientación profesional.')}</p>}
    </div>
    <p>{t('This app cannot assess urgency. If you think this is an emergency, contact local emergency services.',
      'La app no puede evaluar la urgencia. Si crees que es una emergencia, contacta los servicios de emergencia locales.')}</p>
    <button className="btn btn-outline" onClick={() => navigate('/input')}>{t('Ask a different question', 'Hacer otra pregunta')}</button>
  </div>;
};

export const EvidenceExplainer = () => {
  const { t } = useQuest();
  return <div className="content-area narrow-content">
    <PageIntro title={t('A label is a starting point.', 'Una etiqueta es un punto de partida.')}>
      <p>{t('These are app labels, not official NIH ratings. Color never replaces the source or its context.',
        'Son etiquetas de la app, no calificaciones oficiales de NIH. El color no sustituye la fuente ni su contexto.')}</p>
    </PageIntro>
    {[
      ['Supported', t('The reviewed passage supports this specific claim in its stated context. This is not a personal benefit or safety guarantee.',
        'El pasaje revisado respalda esta afirmación en su contexto. No garantiza un beneficio ni seguridad personal.')],
      ['Limited Evidence', t('The reviewed passage describes limited or uncertain evidence; more research may be needed.',
        'El pasaje revisado describe evidencia limitada o incierta; puede necesitarse más investigación.')],
      ['Not Addressed', t('The loaded sources or reviewed mappings do not establish a classification. This is not proof that a claim is false or that no research exists.',
        'Las fuentes o asignaciones revisadas no establecen una clasificación. No demuestra falsedad ni ausencia de investigaciones.')],
    ].map(([level, description]) => <section className="card" key={level}>
      <EvidenceBadge level={level} /><p className="mt-4">{description}</p>
    </section>)}
    <aside className="notice"><p>{t('Current vitamin D and magnesium passages are source-verified excerpts, not a clinically reviewed claim registry. Positive claim labels are not yet available in the bundled corpus.',
      'Los pasajes actuales de vitamina D y magnesio son extractos verificados, no un registro de afirmaciones revisado clínicamente. El corpus aún no ofrece etiquetas positivas revisadas.')}</p></aside>
  </div>;
};

export const BilingualSample = () => {
  const { t } = useQuest();
  return <div className="content-area narrow-content">
    <PageIntro title={t('Clear in both languages.', 'Claridad en ambos idiomas.')}>
      <p>{t('Use the language control above. Spanish queries retrieve ODS-published Spanish text, not machine translations. Clinical and bilingual review remain pending.',
        'Usa el control de idioma. Las consultas en español recuperan texto publicado por ODS, no traducciones automáticas. Las revisiones clínica y bilingüe siguen pendientes.')}</p>
    </PageIntro>
  </div>;
};
