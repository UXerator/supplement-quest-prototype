import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Share2, ClipboardList, AlertTriangle, ArrowLeft, Download, BookmarkPlus, Scale } from 'lucide-react';

export const CompareBeforeBuy = () => {
  const navigate = useNavigate();
  return (
    <div className="content-area">
      <h2 className="mb-4">Compare Before You Buy</h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4">
        <div className="card min-w-[240px] flex-shrink-0">
          <h3 className="text-sm mb-2">Gummy Multivitamins</h3>
          <span className="badge badge-supported mb-3">Supported</span>
          <div className="text-xs space-y-2">
            <p><strong>Safety:</strong> Safe in recommended doses. Watch sugar content.</p>
            <p><strong>Practical:</strong> ~$20/mo</p>
            <p><strong>Food-First:</strong> Often redundant if diet is balanced.</p>
          </div>
        </div>
        
        <div className="card min-w-[240px] flex-shrink-0">
          <h3 className="text-sm mb-2">Basic Chewable Multivitamin</h3>
          <span className="badge badge-supported mb-3">Supported</span>
          <div className="text-xs space-y-2">
            <p><strong>Safety:</strong> Very safe.</p>
            <p><strong>Practical:</strong> ~$5-8/mo. Better value.</p>
            <p><strong>Food-First:</strong> Same principles apply.</p>
          </div>
        </div>
      </div>
      
      <button className="btn btn-primary btn-block mt-4" onClick={() => alert('Saved comparison')}>
        <BookmarkPlus size={18} /> Save Comparison
      </button>
    </div>
  );
};

export const Notebook = () => {
  const navigate = useNavigate();
  return (
    <div className="content-area">
      <h2 className="mb-4">Your Notebook</h2>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <span className="chip bg-blue-100 border-blue-300">All</span>
        <span className="chip">Supported</span>
        <span className="chip">Kids</span>
      </div>
      
      <div className="card cursor-pointer border-l-4 border-l-yellow-400" onClick={() => navigate('/decision-card')}>
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm">Ashwagandha for Lifting</h3>
          <span className="text-xs text-muted">Today</span>
        </div>
        <p className="text-xs text-muted mb-2">Limited Evidence</p>
        <span className="text-xs text-blue-600">Reopen Card →</span>
      </div>
      
      <div className="card cursor-pointer border-l-4 border-l-green-500">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm">Folic Acid in Pregnancy</h3>
          <span className="text-xs text-muted">Oct 12</span>
        </div>
        <p className="text-xs text-muted mb-2">Supported</p>
        <span className="text-xs text-blue-600">Reopen Card →</span>
      </div>
    </div>
  );
};

export const ConfidenceCheck = () => {
  const navigate = useNavigate();
  return (
    <div className="content-area flex flex-col justify-center">
      <h2>Reflection</h2>
      <p className="text-muted mb-6">Based on the evidence reviewed, what will you do next?</p>
      
      <div className="flex flex-col gap-3">
        <button className="btn btn-outline justify-start text-left" onClick={() => navigate('/home')}>Buy</button>
        <button className="btn btn-outline justify-start text-left" onClick={() => navigate('/home')}>Wait</button>
        <button className="btn btn-outline justify-start text-left" onClick={() => navigate('/home')}>Do not buy</button>
        <button className="btn btn-outline justify-start text-left" onClick={() => navigate('/home')}>Discuss with clinician/pharmacist</button>
      </div>
      
      <p className="text-xs text-muted mt-8 text-center italic">
        * Taking a moment to reflect helps build confidence and supports lasting health choices.
      </p>
    </div>
  );
};

export const ShareScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="content-area text-center">
      <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-left border border-blue-200 text-blue-800">
        <strong>Secondary Reinforcement:</strong> Social sharing functions as secondary reinforcement after you first obtain direct educational and decision-support value within the app.
      </div>
      
      <h2 className="mb-4">Share Your Learning</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card flex flex-col items-center justify-center p-4 cursor-pointer">
          <div className="w-16 h-24 bg-gray-200 rounded mb-2 border-2 border-gray-300"></div>
          <span className="text-xs font-semibold">Story Format</span>
        </div>
        <div className="card flex flex-col items-center justify-center p-4 cursor-pointer">
          <div className="w-20 h-16 bg-gray-200 rounded mb-2 border-2 border-gray-300 flex items-center justify-center"><span className="text-[10px]">T/F</span></div>
          <span className="text-xs font-semibold">Myth vs Fact</span>
        </div>
      </div>
      
      <button className="btn btn-primary btn-block"><Download size={18} /> Download Asset</button>
    </div>
  );
};

export const FoodFirstGuidance = () => {
  return (
    <div className="content-area">
      <h2 className="mb-2">Food-First Alternative</h2>
      <p className="text-sm text-muted mb-4">When supported by ODS, practical dietary suggestions can often replace or complement supplements.</p>
      
      <div className="card">
        <h3 className="text-md mb-2">Looking for a Calcium boost?</h3>
        <p className="text-sm mb-3">Before buying a supplement, consider these food sources which are highly bioavailable:</p>
        <ul className="text-sm pl-5 space-y-1 text-muted">
          <li>Dairy products (milk, yogurt, cheese)</li>
          <li>Fortified plant-based milks</li>
          <li>Dark leafy greens (spinach, kale)</li>
          <li>Tofu set with calcium</li>
        </ul>
        <div className="mt-4 p-3 bg-blue-50 rounded text-xs border border-blue-100">
          Food delivers complex nutrient matrices that supplements cannot perfectly replicate.
        </div>
      </div>
    </div>
  );
};

export const SafetyHighRisk = () => {
  return (
    <div className="content-area bg-red-50">
      <AlertTriangle size={48} color="var(--danger)" className="mb-4 mx-auto" />
      <h2 className="text-center text-red-800 mb-2">High-Risk Query Detected</h2>
      <p className="text-sm text-red-700 mb-6 text-center">
        Your question involves medications, pregnancy, breastfeeding, or serious medical conditions.
      </p>
      
      <div className="card border-red-200">
        <h3 className="text-sm text-red-800 mb-2">Educational Boundary</h3>
        <p className="text-xs text-muted mb-4">
          SupplementQuest™ provides only general educational insights from ODS. We cannot ensure safety for complex personal health histories. Supplements can have dangerous interactions with prescriptions.
        </p>
        <p className="text-sm font-semibold mb-4 text-center">
          Consult your clinician or pharmacist before use.
        </p>
        <button className="btn btn-outline btn-block text-red-800 border-red-800" onClick={() => window.history.back()}>Go Back</button>
      </div>
    </div>
  );
};

export const EvidenceExplainer = () => {
  return (
    <div className="content-area">
      <h2 className="mb-4">How We Classify Evidence</h2>
      <p className="text-sm text-muted mb-6">Our labels directly map to certainty language found in NIH ODS documentation. We do not overclaim.</p>
      
      <div className="space-y-4">
        <div className="card border-l-4 border-l-green-500">
          <span className="badge badge-supported mb-2">Supported</span>
          <p className="text-xs">Robust, repeated clinical trials confirm the benefit. The scientific consensus is clear and documented by ODS.</p>
        </div>
        <div className="card border-l-4 border-l-yellow-400">
          <span className="badge badge-limited mb-2">Limited Evidence</span>
          <p className="text-xs">Studies exist but are small, contradictory, or conducted in animals. The science remains uncertain.</p>
        </div>
        <div className="card border-l-4 border-l-gray-400">
          <span className="badge badge-none mb-2">Not Addressed</span>
          <p className="text-xs">The claim lacks significant documentation or clinical trials within ODS databases.</p>
        </div>
      </div>
    </div>
  );
};

export const BilingualSample = () => {
  return (
    <div className="content-area">
      <div className="flex justify-between items-center mb-4">
        <h2>Demo: Bilingual Toggle</h2>
        <div className="bg-gray-200 p-1 rounded flex text-xs font-semibold cursor-pointer">
          <span className="px-2 py-1 rounded bg-white shadow-sm">EN</span>
          <span className="px-2 py-1 text-muted">ES</span>
        </div>
      </div>
      
      <p className="text-sm text-muted mb-4">
        (Simulated toggle for reviewer context)
      </p>

      <div className="decision-card mb-4">
        <div className="decision-header">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-muted">Zinc for Colds</span>
            <span className="badge badge-limited">Lim. Evidence</span>
          </div>
          <p className="font-semibold text-sm">"May reduce duration of cold if taken early."</p>
        </div>
      </div>
      
      <div className="decision-card border-purple-200">
        <div className="decision-header bg-purple-50">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-muted">Zinc para Resfriados</span>
            <span className="badge bg-yellow-100 text-yellow-800">Evidencia Limitada</span>
          </div>
          <p className="font-semibold text-sm">"Puede reducir la duración del resfriado si se toma pronto."</p>
        </div>
      </div>
      
    </div>
  );
};
