import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Database, GitMerge, TrendingDown, Users } from 'lucide-react';

export const UserJourneyDiagram = () => {
  return (
    <div className="content-area pt-10">
      <h2 className="mb-2 text-primary-dark">User Behavior Pathway</h2>
      <p className="text-sm text-muted mb-6">COM-B integrated product logic emphasizing internal value over external sharing.</p>
      
      <div className="flex flex-col gap-2">
        {['Exposure', 'Investigation', 'Personal Benefit', 'Confidence', 'Decision', 'Optional Sharing', 'Reinforcement'].map((step, i) => (
          <div key={step} className="flex flex-col items-center">
            <div className="card w-full text-center py-3 border-l-4 border-blue-500 font-semibold mb-0">
              {i + 1}. {step}
            </div>
            {i < 6 && <div className="h-4 w-1 bg-blue-300"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ArchitectureDiagram = () => {
  return (
    <div className="content-area pt-10">
      <h2 className="mb-6 flex items-center gap-2"><Network /> Core Architecture</h2>
      
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-xs font-semibold text-center pb-2 border-b border-gray-300 mb-4">Flow</div>
        <ul className="space-y-4 font-mono text-sm">
          <li className="flex gap-2"><span>1.</span> <span className="bg-white p-1 rounded border">User Input</span></li>
          <li className="ml-4 flex gap-2">↓</li>
          <li className="flex gap-2"><span>2.</span> <span className="bg-blue-100 p-1 rounded border border-blue-300">Constrained RAG Layer</span></li>
          <li className="ml-4 flex gap-2">↓</li>
          <li className="flex gap-2"><span>3.</span> <span className="bg-blue-100 p-1 rounded border border-blue-300">Evidence Processing</span></li>
          <li className="ml-4 flex gap-2">↓</li>
          <li className="flex gap-2"><span>4.</span> <span className="bg-green-100 p-1 rounded border border-green-300">Decision Card Generation</span></li>
          <li className="ml-4 flex gap-2">↓</li>
          <li className="flex gap-2"><span>5.</span> <span className="bg-purple-100 p-1 rounded border border-purple-300">Notebook History</span> <span className="text-muted">+ Op. Social Output</span></li>
        </ul>
      </div>
    </div>
  );
};

export const AIDatabaseDiagram = () => {
  return (
    <div className="content-area pt-10">
      <h2 className="mb-6 flex items-center gap-2"><Database /> Tech Stack Explainer</h2>
      <div className="grid gap-3 grid-cols-1">
        <div className="card text-center bg-gray-100">User Interface Web App</div>
        <div className="text-center text-gray-400">↓ API Request ↓</div>
        <div className="card text-center bg-blue-100 border-blue-400">AI Orchestrator (Router)</div>
        <div className="flex gap-2 justify-center">
          <div className="w-1/2 p-2 bg-yellow-50 text-xs border border-yellow-200 rounded text-center">Retrieval Layer</div>
          <div className="w-1/2 p-2 bg-yellow-50 text-xs border border-yellow-200 rounded text-center">Response Builder</div>
        </div>
        <div className="card text-center bg-green-100 border-green-400">ODS Source Store (Vector DB)</div>
        <div className="text-center text-gray-400">↓ Final Payload ↓</div>
        <div className="card text-center bg-purple-100 border-purple-400">Decision Card DB</div>
      </div>
    </div>
  );
};

export const ConversionFunnel = () => {
  return (
    <div className="content-area pt-10">
      <h2 className="mb-2 flex items-center gap-2"><TrendingDown /> Illustrative Funnel</h2>
      <p className="text-xs text-muted mb-6">"Illustrative behavior funnel for prototype only"</p>
      
      <div className="space-y-2">
        <div className="bg-blue-900 text-white p-2 rounded text-xs text-center" style={{width: '100%'}}>100% Exposed to claim</div>
        <div className="bg-blue-800 text-white p-2 rounded text-xs text-center mx-auto" style={{width: '70%'}}>70% Start investigation</div>
        <div className="bg-blue-700 text-white p-2 rounded text-xs text-center mx-auto" style={{width: '60%'}}>60% Review Decision Card</div>
        <div className="bg-blue-600 text-white p-2 rounded text-xs text-center mx-auto" style={{width: '50%'}}>50% Save card</div>
        <div className="bg-blue-500 text-white p-2 rounded text-xs text-center mx-auto" style={{width: '40%'}}>40% Complete confidence check</div>
        <div className="bg-blue-400 text-white p-2 rounded text-xs text-center mx-auto" style={{width: '30%'}}>30% Make evidence-informed decision</div>
        <div className="bg-blue-300 text-blue-900 p-2 rounded text-xs text-center mx-auto font-bold" style={{width: '15%'}}>15% Share</div>
      </div>
      <p className="text-xs text-center mt-4">Reinforces that value is delivered BEFORE sharing.</p>
    </div>
  );
};

export const DemoScenarios = () => {
  const navigate = useNavigate();
  return (
    <div className="content-area pt-10">
      <h2 className="mb-4 flex items-center gap-2"><Users /> Guided Prototype Demos</h2>
      
      <div className="space-y-4">
        <div className="card border-l-4 border-blue-500 cursor-pointer" onClick={() => navigate('/home')}>
          <h3 className="text-sm">A. Young Adult Flow</h3>
          <p className="text-xs text-muted italic mb-2">"Does ashwagandha boost testosterone for lifting?"</p>
          <div className="text-xs text-blue-600">Start Flow →</div>
        </div>
        
        <div className="card border-l-4 border-green-500 cursor-pointer" onClick={() => navigate('/home')}>
          <h3 className="text-sm">B. Food-Insecure Family Flow</h3>
          <p className="text-xs text-muted italic mb-2">"Should I buy expensive gummy vitamins for my kids?"</p>
          <div className="text-xs text-green-600">Start Flow →</div>
        </div>
        
        <div className="card border-l-4 border-purple-500 cursor-pointer" onClick={() => navigate('/bilingual')}>
          <h3 className="text-sm">C. Bilingual User Flow</h3>
          <p className="text-xs text-muted italic mb-2">Toggle language on a single cohesive Decision Card</p>
          <div className="text-xs text-purple-600">View Screen →</div>
        </div>
      </div>
    </div>
  );
};
