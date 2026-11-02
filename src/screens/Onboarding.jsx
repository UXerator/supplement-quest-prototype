import { useNavigate } from 'react-router-dom';
import { BookOpen, Share2, ClipboardList, AlertTriangle } from 'lucide-react';
import { useQuest } from '../quest-context';
import { Home } from './CoreApp';
import { EvidenceBadge } from '../QuestUI';

export const Splash = () => {
  return <Home />;
};

export const Onboarding1 = () => {
  const navigate = useNavigate();
  const { t } = useQuest();
  return (
    <div className="content-area">
      <BookOpen size={48} color="var(--primary)" />
      <h1>{t('Check Claims Against ODS Sources', 'Consultar afirmaciones con fuentes ODS')}</h1>
      <p>{t('This prototype retrieves local NIH Office of Dietary Supplements excerpts. It does not generate new health claims.',
        'Este prototipo recupera extractos locales de NIH ODS. No genera nuevas afirmaciones de salud.')}</p>
      <div className="card">
        <h2>{t('Evidence labels', 'Etiquetas de evidencia')}</h2>
        <div className="topic-filters">
          {['Supported', 'Limited Evidence', 'Not Addressed'].map(level => <EvidenceBadge key={level} level={level} />)}
        </div>
        <p>{t('These are app labels, not official NIH ratings. The current source excerpts await qualified claim review.',
          'Son etiquetas de la app, no calificaciones oficiales de NIH. Los extractos actuales esperan revisión profesional.')}</p>
      </div>
      <button className="btn btn-primary btn-block" onClick={() => navigate('/onboarding/2')}>
        {t('Next', 'Siguiente')}
      </button>
    </div>
  );
};

export const Onboarding2 = () => {
  const navigate = useNavigate();
  const { t } = useQuest();
  return (
    <div className="content-area">
      <ClipboardList size={48} color="var(--primary)" />
      <h1>{t('The Decision Card', 'La tarjeta de decisión')}</h1>
      <p>{t('Read the source, uncertainty, and practical guidance inside the app. Then reflect on your next step.',
        'Lee la fuente, la incertidumbre y la orientación en la app. Después reflexiona sobre tu próximo paso.')}</p>
      <div className="card">
        <h2>{t('Your Notebook', 'Tu cuaderno')}</h2>
        <p>{t('Save and reopen cards during this session. Reloading or closing the app clears them.',
          'Guarda y reabre tarjetas durante esta sesión. Recargar o cerrar la app las borra.')}</p>
      </div>
      <p><Share2 size={16} /> {t('Sharing is optional and comes after your Decision Card.',
        'Compartir es opcional y viene después de tu tarjeta de decisión.')}</p>
      <button className="btn btn-primary btn-block" onClick={() => navigate('/onboarding/3')}>
        {t('Next', 'Siguiente')}
      </button>
    </div>
  );
};

export const Onboarding3 = () => {
  const navigate = useNavigate();
  const { t } = useQuest();
  return (
    <div className="content-area">
      <AlertTriangle size={48} color="var(--warning)" />
      <h1>{t('Education, Not Medical Advice', 'Educación, no consejo médico')}</h1>
      <p>{t('Do not enter names or identifying health details. No account or purchase is required.',
        'No ingreses nombres ni datos de salud que te identifiquen. No necesitas una cuenta ni comprar.')}</p>
      <div className="card">
        <h2>{t('Safety Escalation', 'Derivación por seguridad')}</h2>
        <p>{t('Questions involving pregnancy, medications, children, or serious conditions are referred to a healthcare professional.',
          'Las preguntas sobre embarazo, medicamentos, niños o enfermedades graves se remiten a un profesional de salud.')}</p>
      </div>
      <button className="btn btn-primary btn-block" onClick={() => navigate('/home')}>
        {t('Get Started', 'Comenzar')}
      </button>
    </div>
  );
};
