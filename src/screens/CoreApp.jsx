import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowRight, BookmarkPlus, Share2, AlertCircle, CheckCircle, Scale, Apple } from 'lucide-react';
import { mockData } from '../data';

export const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="content-area">
      <h1 className="mb-6">Dashboard</h1>
      
      <div className="card mb-6" style={{ cursor: 'pointer' }} onClick={() => navigate('/input')}>
        <div className="input-group">
          <div className="flex items-center gap-2 text-muted pb-2 border-b border-gray-200">
            <Search size={20} />
            <span>Enter a supplement claim or question...</span>
          </div>
        </div>
        <h3 className="text-sm text-muted mt-4">Try these examples:</h3>
        <div className="flex flex-col gap-2 mt-2">
          {mockData.recentQueries.map((q, i) => (
            <div key={i} className="chip bg-blue-50" onClick={(e) => { e.stopPropagation(); navigate('/input'); }}>
              "{q}"
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="card flex-1 flex flex-col items-center justify-center text-center cursor-pointer p-4" onClick={() => navigate('/notebook')}>
          <BookmarkPlus size={24} color="var(--primary)" className="mb-2" />
          <span className="text-sm font-semibold">Notebook</span>
        </div>
        <div className="card flex-1 flex flex-col items-center justify-center text-center cursor-pointer p-4" onClick={() => navigate('/compare')}>
          <Scale size={24} color="var(--primary)" className="mb-2" />
          <span className="text-sm font-semibold">Compare</span>
        </div>
      </div>
      
      <div className="card cursor-pointer flex items-center justify-between" onClick={() => navigate('/food-first')}>
        <div className="flex items-center gap-3">
          <Apple size={24} color="var(--success)" />
          <div>
            <h3 className="mb-0 text-sm">Food-First Guidance</h3>
            <span className="text-xs text-muted">Explore dietary alternatives</span>
          </div>
        </div>
        <ArrowRight size={16} className="text-muted" />
      </div>

      <div className="card cursor-pointer flex items-center justify-between mt-4" onClick={() => navigate('/evidence-explainer')}>
        <div className="flex items-center gap-3">
          <CheckCircle size={24} color="var(--primary)" />
          <div>
            <h3 className="mb-0 text-sm">How Evidence Works</h3>
            <span className="text-xs text-muted">Understand our labels</span>
          </div>
        </div>
        <ArrowRight size={16} className="text-muted" />
      </div>
    </div>
  );
};

export const ClaimInput = () => {
  const navigate = useNavigate();
  const [val, setVal] = useState('');
  
  return (
    <div className="content-area">
      <h2>Check a Claim</h2>
      <p className="text-sm text-muted mb-4">Paste text from a label, or type your question.</p>
      
      <textarea 
        className="input-field mb-4" 
        rows="4" 
        placeholder="e.g. Does ashwagandha really boost testosterone for lifting?"
        value={val}
        onChange={(e) => setVal(e.target.value)}
      ></textarea>
      
      <div className="mb-6">
        <h3 className="text-sm text-muted mb-2">Quick Select</h3>
        <div className="chip-container">
          {['Vitamins', "Kids' Supplements", 'Sports Supplements', 'Immune Support', 'Sleep', 'Energy'].map(c => (
            <div key={c} className="chip">{c}</div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button className="btn btn-primary flex-1" onClick={() => navigate('/processing')}>Check Evidence</button>
      </div>
    </div>
  );
};

export const Processing = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/results');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="content-area flex flex-col justify-center items-center text-center">
      <Loader2 size={64} color="var(--primary)" className="animate-pulse mb-6 mx-auto" />
      <h2>Checking against NIH sources...</h2>
      <p className="text-muted text-sm max-w-xs mx-auto mb-8">
        We are securely processing this claim using a constrained RAG architecture to fetch only verified ODS data.
      </p>
      
      <div className="card bg-gray-50 flex items-center gap-3 text-sm">
        <ShieldCheck size={24} className="text-green-600" />
        <div className="text-left">
          <strong>Trust Protocol Active</strong>
          <div className="text-xs text-muted">Scientific accuracy enforced. No hallucinations.</div>
        </div>
      </div>
    </div>
  );
};

export const ClaimResults = () => {
  const navigate = useNavigate();
  return (
    <div className="content-area">
      <h3 className="text-sm text-muted mb-1">Claim Reviewed</h3>
      <p className="font-semibold text-lg mb-4">"Does ashwagandha really boost testosterone for lifting?"</p>
      
      <div className="card border-yellow-300 bg-yellow-50 mb-4 animate-fade-in">
        <div className="flex justify-between items-start mb-2">
          <span className="badge badge-limited">Limited Evidence</span>
        </div>
        <p className="text-sm mb-2">
          Some studies show minor increases in testosterone or muscle strength, but evidence is inconsistent and long-term effects are unknown.
        </p>
        <div className="ods-trace">
          <ShieldCheck size={14} /> Source: NIH ODS Ashwagandha Fact Sheet (Updated 2024)
        </div>
      </div>
      
      <div className="card mb-4">
        <h3 className="flex items-center gap-2 text-sm text-brand"><AlertCircle size={16} /> Safety Note</h3>
        <p className="text-xs mb-2">Ashwagandha is generally safe for up to 3 months, but may cause stomach upset. Avoid if pregnant or if taking immunosuppressants.</p>
        <a href="#" className="text-xs text-blue-600 underline" onClick={(e) => {e.preventDefault(); navigate('/safety');}}>View High-Risk Warnings</a>
      </div>
      
      <div className="card mb-6">
        <h3 className="text-sm mb-2">Practical Guidance</h3>
        <p className="text-xs text-muted mb-3">Cost context: A 30-day supply costs ~$15-30. If budget is tight, prioritize adequate protein and sleep first.</p>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => navigate('/decision-card')}>
        Generate Decision Card
      </button>
    </div>
  );
};

export const DecisionCardDetail = () => {
  const navigate = useNavigate();
  const [confidenceChecked, setConfidenceChecked] = useState(false);
  
  return (
    <div className="content-area">
      <div className="decision-card mb-6 animate-fade-in">
        <div className="decision-header">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-muted max-w-[70%]">Ashwagandha for Testosterone</span>
            <span className="badge badge-limited">Limited Evidence</span>
          </div>
          <p className="font-semibold">"Some studies suggest minor benefits, but evidence is inconsistent."</p>
        </div>
        
        <div className="p-4 bg-white">
          <div className="mb-4">
            <h4 className="text-xs text-muted mb-1 uppercase tracking-wider">Safety Note</h4>
            <p className="text-sm">Generally safe short-term. May cause stomach upset. Avoid if pregnant or taking immunosuppressants.</p>
          </div>
          <div className="mb-4">
            <h4 className="text-xs text-muted mb-1 uppercase tracking-wider">Practical Guidance</h4>
            <p className="text-sm">Cost: ~$15-30/mo. Not a substitute for protein and sleep down-fundamentals.</p>
          </div>
          
          <div className="flex gap-2">
            <button className="btn btn-outline flex-1 btn-sm" onClick={() => navigate('/compare')}><Scale size={16}/> Compare</button>
            <button className="btn btn-primary flex-1 btn-sm" onClick={() => alert('Saved to Notebook')}><BookmarkPlus size={16}/> Save</button>
          </div>
        </div>
      </div>
      
      {!confidenceChecked ? (
        <div className="card bg-gray-50">
          <h3 className="mb-3">Do you feel confident making a decision?</h3>
          <div className="flex flex-col gap-2">
            <button className="btn btn-outline" onClick={() => navigate('/reflection')}>Yes, I can decide now</button>
            <button className="btn btn-outline" onClick={() => navigate('/compare')}>I want to compare options</button>
            <button className="btn btn-outline" onClick={() => navigate('/home')}>I need more context</button>
          </div>
        </div>
      ) : null}
      
      <div className="text-center mt-6">
        <p className="text-xs text-muted mb-3 italic">You've already received the core value inside the app. Sharing is optional.</p>
        <button className="btn btn-secondary text-sm" onClick={() => navigate('/share')}><Share2 size={16}/> Share Card Externally</button>
      </div>
    </div>
  );
};
