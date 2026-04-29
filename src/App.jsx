import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, Home as HomeIcon, LayoutDashboard, ChevronLeft } from 'lucide-react';
import { Splash, Onboarding1, Onboarding2, Onboarding3 } from './screens/Onboarding';
import { Home as Dashboard, ClaimInput, Processing, ClaimResults, DecisionCardDetail } from './screens/CoreApp';
import { CompareBeforeBuy, Notebook, ConfidenceCheck, ShareScreen, FoodFirstGuidance, SafetyHighRisk, EvidenceExplainer, BilingualSample } from './screens/Secondary';
import { UserJourneyDiagram, ArchitectureDiagram, AIDatabaseDiagram, ConversionFunnel, DemoScenarios } from './screens/Diagrams';

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSplash = location.pathname === '/';
  
  if (isSplash) return null;

  return (
    <div className="top-nav">
      <div className="brand cursor-pointer" onClick={() => navigate('/home')}>
        SupplementQuest™
      </div>
      {location.pathname !== '/home' && !location.pathname.startsWith('/onboarding') && (
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} /> Back
        </button>
      )}
    </div>
  );
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hiddenOn = ['/', '/onboarding/1', '/onboarding/2', '/onboarding/3', '/processing', '/results'];
  
  if (hiddenOn.includes(location.pathname)) return null;

  return (
    <div className="bottom-nav">
      <div className={`bottom-nav-item ${location.pathname === '/home' ? 'active' : ''}`} onClick={() => navigate('/home')}>
        <HomeIcon size={20} />
        Home
      </div>
      <div className={`bottom-nav-item ${location.pathname === '/input' ? 'active' : ''}`} onClick={() => navigate('/input')}>
        <div className="bg-blue-600 text-white rounded-full p-2 -mt-4 shadow-lg border-4 border-white">
          <span className="text-xl font-bold">+</span>
        </div>
        Check
      </div>
      <div className={`bottom-nav-item ${location.pathname === '/notebook' ? 'active' : ''}`} onClick={() => navigate('/notebook')}>
        <LayoutDashboard size={20} />
        Notebook
      </div>
    </div>
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
          <div 
            key={link.path} 
            className={`sidebar-link cursor-pointer ${location.pathname === link.path ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <ReviewerSidebar />
        <div className="main-content">
          <div className="prototype-frame">
            <TopNav />
            <Routes>
              {/* Onboarding */}
              <Route path="/" element={<Splash />} />
              <Route path="/onboarding/1" element={<Onboarding1 />} />
              <Route path="/onboarding/2" element={<Onboarding2 />} />
              <Route path="/onboarding/3" element={<Onboarding3 />} />
              
              {/* Core Journey */}
              <Route path="/home" element={<Dashboard />} />
              <Route path="/input" element={<ClaimInput />} />
              <Route path="/processing" element={<Processing />} />
              <Route path="/results" element={<ClaimResults />} />
              <Route path="/decision-card" element={<DecisionCardDetail />} />
              <Route path="/reflection" element={<ConfidenceCheck />} />
              <Route path="/share" element={<ShareScreen />} />
              
              {/* Secondary Tools */}
              <Route path="/compare" element={<CompareBeforeBuy />} />
              <Route path="/notebook" element={<Notebook />} />
              <Route path="/food-first" element={<FoodFirstGuidance />} />
              <Route path="/safety" element={<SafetyHighRisk />} />
              <Route path="/evidence-explainer" element={<EvidenceExplainer />} />
              <Route path="/bilingual" element={<BilingualSample />} />
              
              {/* Diagrams & Demo Wrapper */}
              <Route path="/diagrams" element={<DemoScenarios />} />
              <Route path="/diagrams/journey" element={<UserJourneyDiagram />} />
              <Route path="/diagrams/architecture" element={<ArchitectureDiagram />} />
              <Route path="/diagrams/ai" element={<AIDatabaseDiagram />} />
              <Route path="/diagrams/funnel" element={<ConversionFunnel />} />
              <Route path="/diagrams/scenarios" element={<DemoScenarios />} />
            </Routes>
            <BottomNav />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
