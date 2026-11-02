import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, NotebookPen, Search, Apple, ShieldCheck, Languages } from 'lucide-react';
import { Splash, Onboarding1, Onboarding2, Onboarding3 } from './screens/Onboarding';
import { Home as Dashboard, ClaimInput, Processing, ClaimResults, DecisionCardDetail } from './screens/CoreApp';
import { CompareBeforeBuy, Notebook, ConfidenceCheck, ShareScreen, FoodFirstGuidance, SafetyHighRisk, EvidenceExplainer, BilingualSample } from './screens/Secondary';
import { UserJourneyDiagram, ArchitectureDiagram, AIDatabaseDiagram, ConversionFunnel, DemoScenarios } from './screens/Diagrams';
import QuestProvider from './QuestProvider';
import { useQuest } from './quest-context';

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useQuest();

  return (
    <div className="top-nav">
      <button className="brand plain-button" onClick={() => navigate('/home')}>
        <span className="brand-mark"><ShieldCheck size={22} /></span>
        <span>SupplementQuest<small>{t('Truth over hype', 'La verdad primero')}</small></span>
      </button>
      <label className="language-control">
        <Languages size={18} aria-hidden="true" /><span className="sr-only">Language / Idioma</span>
        <select aria-label="Language / Idioma" value={language} onChange={event => {
          setLanguage(event.target.value);
          if (['/results', '/decision-card', '/reflection', '/share', '/processing', '/safety'].includes(location.pathname)) {
            navigate('/input', { replace: true });
          }
        }}>
          <option value="English">English</option>
          <option value="Español">Español</option>
        </select>
      </label>
    </div>
  );
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useQuest();
  return (
    <nav className="bottom-nav" aria-label={t('Main navigation', 'Navegación principal')}>
      <button className={`bottom-nav-item plain-button ${['/', '/home'].includes(location.pathname) ? 'active' : ''}`} aria-current={['/', '/home'].includes(location.pathname) ? 'page' : undefined} onClick={() => navigate('/home')}>
        <HomeIcon size={20} />
        {t('Home', 'Inicio')}
      </button>
      <button className={`bottom-nav-item plain-button ${location.pathname === '/input' ? 'active' : ''}`} aria-current={location.pathname === '/input' ? 'page' : undefined} onClick={() => navigate('/input')}>
        <Search size={20} />
        {t('Check', 'Consultar')}
      </button>
      <button className={`bottom-nav-item plain-button ${location.pathname === '/food-first' ? 'active' : ''}`}
        aria-current={location.pathname === '/food-first' ? 'page' : undefined} onClick={() => navigate('/food-first')}>
        <Apple size={20} /> {t('Food first', 'Alimentos')}
      </button>
      <button className={`bottom-nav-item plain-button ${location.pathname === '/notebook' ? 'active' : ''}`} aria-current={location.pathname === '/notebook' ? 'page' : undefined} onClick={() => navigate('/notebook')}>
        <NotebookPen size={20} />
        {t('Notebook', 'Cuaderno')}
      </button>
    </nav>
  );
};

const ReviewerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const links = [
    { path: '/', label: '1. Splash' },
    { path: '/onboarding/1', label: '2. Onboarding 1' },
    { path: '/onboarding/2', label: '3. Onboarding 2' },
    { path: '/onboarding/3', label: '4. Onboarding 3' },
    { path: '/home', label: '5. Home / Dashboard' },
    { path: '/input', label: '6. Claim Input' },
    { path: '/processing', label: '7. Processing' },
    { path: '/results', label: '8. Claim Results' },
    { path: '/decision-card', label: '9. Decision Card' },
    { path: '/compare', label: '10. Compare Before Buy' },
    { path: '/notebook', label: '11. Notebook' },
    { path: '/reflection', label: '12. Confidence Check' },
    { path: '/share', label: '13. Optional Share' },
    { path: '/food-first', label: '14. Food-First Guidance' },
    { path: '/safety', label: '15. Safety / High-Risk' },
    { path: '/evidence-explainer', label: '16. Evidence Explainer' },
    { path: '/bilingual', label: '17. Bilingual Sample' },
    { path: '/diagrams/journey', label: '18. User Journey' },
    { path: '/diagrams/architecture', label: '19. Architecture' },
    { path: '/diagrams/ai', label: '20. AI / DB' },
    { path: '/diagrams/funnel', label: '21. Conversion Funnel' },
    { path: '/diagrams/scenarios', label: '22. Demo Scenarios' },
  ];

  return (
    <div className="sidebar-nav desktop-only">
      <div className="sidebar-logo">Reviewer Mode</div>
      <div className="sidebar-links">
        {links.map(link => (
          <button
            key={link.path} 
            className={`sidebar-link cursor-pointer ${location.pathname === link.path ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
};

function AppShell() {
  const location = useLocation();
  const { t, language } = useQuest();
  useEffect(() => {
    const heading = document.querySelector('.route-content h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      document.title = `${heading.textContent} | SupplementQuest`;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, language]);
  const reviewing = new URLSearchParams(location.search).get('reviewer') === '1'
    || location.pathname.startsWith('/diagrams');
  return (
      <div className="app-container">
        <a className="skip-link" href="#route-content">{t('Skip to content', 'Ir al contenido')}</a>
        {reviewing && <ReviewerSidebar />}
        <main className="main-content" id="main-content">
          <div className="prototype-frame">
            <TopNav />
            {!reviewing && <BottomNav />}
            {location.pathname.startsWith('/diagrams') && <p className="reviewer-notice" role="note">
              Phase 1 conceptual wireframe diagrams. Not validated capabilities or participant results.
            </p>}
            <div className="route-content" id="route-content" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/onboarding/1" element={<Onboarding1 />} />
              <Route path="/onboarding/2" element={<Onboarding2 />} />
              <Route path="/onboarding/3" element={<Onboarding3 />} />
              <Route path="/home" element={<Dashboard />} />
              <Route path="/input" element={<ClaimInput />} />
              <Route path="/processing" element={<Processing />} />
              <Route path="/results" element={<ClaimResults />} />
              <Route path="/decision-card" element={<DecisionCardDetail />} />
              <Route path="/reflection" element={<ConfidenceCheck />} />
              <Route path="/share" element={<ShareScreen />} />
              <Route path="/compare" element={<CompareBeforeBuy key={language} />} />
              <Route path="/notebook" element={<Notebook />} />
              <Route path="/food-first" element={<FoodFirstGuidance />} />
              <Route path="/safety" element={<SafetyHighRisk />} />
              <Route path="/evidence-explainer" element={<EvidenceExplainer />} />
              <Route path="/bilingual" element={<BilingualSample />} />
              <Route path="/diagrams" element={<DemoScenarios />} />
              <Route path="/diagrams/journey" element={<UserJourneyDiagram />} />
              <Route path="/diagrams/architecture" element={<ArchitectureDiagram />} />
              <Route path="/diagrams/ai" element={<AIDatabaseDiagram />} />
              <Route path="/diagrams/funnel" element={<ConversionFunnel />} />
              <Route path="/diagrams/scenarios" element={<DemoScenarios />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
            </div>
            <p className="educational-footer">{t('Educational prototype, not medical advice. No names or identifying health details.',
              'Prototipo educativo; no es consejo médico. No ingreses nombres ni datos de salud que te identifiquen.')}</p>
            <div className="prototype-status">{t('Research prototype · Review pending · Not NIH-endorsed',
              'Prototipo de investigación · Revisión pendiente · Sin aval de NIH')}</div>
          </div>
        </main>
      </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QuestProvider><AppShell /></QuestProvider>
    </BrowserRouter>
  );
}
