import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, BookOpen, Share2, ClipboardList, AlertTriangle } from 'lucide-react';

export const Splash = () => {
  const navigate = useNavigate();
  return (
    <div className="content-area flex flex-col justify-center items-center text-center">
      <div className="mb-6">
        <ShieldCheck size={80} color="var(--primary)" />
      </div>
      <h1 className="mb-2">SupplementQuest™</h1>
      <p className="text-muted mb-6">Facts First. Evidence-based supplement decisions.</p>
      
      <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
        <button className="btn btn-primary btn-block" onClick={() => navigate('/input')}>
          Check a supplement claim
        </button>
        <button className="btn btn-outline btn-block" onClick={() => navigate('/onboarding/1')}>
          See how it works
        </button>
        <button className="btn btn-secondary btn-block mt-4" onClick={() => navigate('/diagrams')}>
          Reviewer Mode (All Screens)
        </button>
      </div>
    </div>
  );
};

export const Onboarding1 = () => {
  const navigate = useNavigate();
  return (
    <div className="content-area flex flex-col justify-center">
      <div className="text-center mb-6">
        <BookOpen size={64} color="var(--primary)" className="mx-auto mb-4" />
        <h2>Check Claims Against NIH Evidence</h2>
        <p>We help you check supplement claims instantly against NIH Office of Dietary Supplements (ODS) evidence.</p>
      </div>
      
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-supported">Supported</span>
        </div>
        <p className="text-sm">Strong evidence supports this use.</p>
      </div>
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-limited">Limited Evidence</span>
        </div>
        <p className="text-sm">Some research exists, but it's not conclusive.</p>
      </div>
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-none">Not Addressed</span>
        </div>
        <p className="text-sm">No significant evidence in ODS databases.</p>
      </div>
      
      <button className="btn btn-primary btn-block mt-4" onClick={() => navigate('/onboarding/2')}>Next</button>
    </div>
  );
};

export const Onboarding2 = () => {
  const navigate = useNavigate();
  return (
    <div className="content-area flex flex-col justify-center text-center">
      <ClipboardList size={64} color="var(--primary)" className="mx-auto mb-4" />
      <h2>The Decision Card</h2>
      <p className="mb-6">Every search generates a personal Decision Card. It contains your claim, the evidence level, safety notes, and practical guidance.</p>
      
      <div className="card text-left mb-6 bg-blue-50 border-blue-200">
        <h3 className="mb-2">Your Notebook</h3>
        <p className="text-sm">Save cards to revisit later. Your primary value and learning happen right here in the app.</p>
      </div>
      
      <div className="flex items-center gap-2 justify-center text-sm text-muted">
        <Share2 size={16} /> Optional sharing is secondary
      </div>
      
      <button className="btn btn-primary btn-block mt-6" onClick={() => navigate('/onboarding/3')}>Next</button>
    </div>
  );
};

export const Onboarding3 = () => {
  const navigate = useNavigate();
  return (
    <div className="content-area flex flex-col justify-center text-center">
      <AlertTriangle size={64} color="var(--warning)" className="mx-auto mb-4" />
      <h2>Education, Not Medical Advice</h2>
      <p className="mb-4">SupplementQuest™ is an educational tool. We provide evidence summaries, not medical advice or diagnoses.</p>
      
      <div className="card text-left mb-6 border-l-4" style={{borderLeftColor: 'var(--warning)'}}>
        <h3 className="mb-2">Safety Escalation</h3>
        <p className="text-sm">For questions involving medications, pregnancy, or serious conditions, we will direct you to consult a clinical professional.</p>
      </div>
      
      <button className="btn btn-primary btn-block" onClick={() => navigate('/home')}>Get Started</button>
    </div>
  );
};
