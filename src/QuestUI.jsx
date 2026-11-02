import { CheckCircle2, Info, AlertTriangle, BookOpen } from 'lucide-react';
import { useQuest } from './quest-context';
import { familyChecklistItems, checklistCount } from './family-checklist';

export function PageIntro({ eyebrow, title, children }) {
  return <header className="page-intro">
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h1>{title}</h1>
    {children && <div className="page-description">{children}</div>}
  </header>;
}

export function JourneyProgress({ step }) {
  const { t } = useQuest();
  const labels = [t('Claim', 'Afirmación'), t('Evidence', 'Evidencia'),
    t('Decision', 'Decisión'), t('Share', 'Compartir')];
  return <ol className="journey-progress" aria-label={t('Your four-step journey', 'Tu recorrido de cuatro pasos')}>
    {labels.map((label, index) => <li key={index} aria-current={step === index + 1 ? 'step' : undefined}
      className={step > index + 1 ? 'complete' : step === index + 1 ? 'current' : ''}>
      <span className="step-number">{step > index + 1 ? <CheckCircle2 size={16} /> : index + 1}</span>
      <span>{label}</span>
    </li>)}
  </ol>;
}

export function EvidenceBadge({ level }) {
  const { t } = useQuest();
  const supported = level === 'Supported';
  const limited = level === 'Limited Evidence';
  const Icon = supported ? CheckCircle2 : limited ? AlertTriangle : Info;
  return <span className={`evidence-badge ${supported ? 'supported' : limited ? 'limited' : 'unaddressed'}`}>
    <Icon size={17} aria-hidden="true" />
    {supported ? t('Supported', 'Respaldado') : limited ? t('Limited evidence', 'Evidencia limitada')
      : t('Not addressed', 'No abordado')}
  </span>;
}

export function FamilyChecklist() {
  const { checklist, toggleChecklist, resetChecklist, t } = useQuest();
  return <section className="card family-checklist" aria-labelledby="checklist-title">
    <div className="section-heading"><BookOpen size={22} /><h2 id="checklist-title">
      {t('Before buying: your checklist', 'Antes de comprar: tu lista')}
    </h2></div>
    <p>{t('A planning aid, not a nutrition assessment. Checking every box does not mean a supplement is needed or safe.',
      'Una ayuda para planificar, no una evaluación nutricional. Marcar todo no significa que un suplemento sea necesario o seguro.')}</p>
    <fieldset>
      <legend className="sr-only">{t('Family decision checklist', 'Lista para decisiones familiares')}</legend>
      {familyChecklistItems.map(item => <label className="checklist-item" key={item.id}>
        <input type="checkbox" checked={checklist[item.id] === true}
          onChange={() => toggleChecklist(item.id)} />
        <span>{t(...item.label)}</span>
      </label>)}
    </fieldset>
    <div className="checklist-footer">
      <p role="status">{checklistCount(checklist)} / {familyChecklistItems.length} {t('considered', 'considerados')}</p>
      <button className="btn btn-quiet" onClick={resetChecklist}>{t('Reset', 'Reiniciar')}</button>
    </div>
    <p className="text-sm text-muted">{t('Stored only in this session. Save a Decision Card to keep this checklist with it. Starting a new claim resets the checklist.',
      'Solo se guarda en esta sesión. Guarda una tarjeta de decisión para conservar su lista. Una nueva afirmación reinicia la lista.')}</p>
  </section>;
}
