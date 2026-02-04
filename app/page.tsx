"use client";

import { GoogleGenAI } from '@google/genai';
import React, { useState, useEffect } from 'react';
import { TOOLS_CONFIG, TOOL_CATEGORIES } from '../constants';
import { ToolConfig } from '../types';
import { ThinkingIcon } from './components/Icons';
import DottedGlowBackground from './components/DottedGlowBackground';
import SideDrawer from './components/SideDrawer';
import ArtifactCard from './ArtifactCard';
import { Artifact } from '../types';
import ToolCreator from './components/ToolCreator';

interface SavedResource {
  id: string;
  toolName: string;
  categoryName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'artifact';
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState(TOOL_CATEGORIES[0].id);
  const [allTools, setAllTools] = useState<ToolConfig[]>(TOOLS_CONFIG);
  const [selectedTool, setSelectedTool] = useState<ToolConfig>(TOOLS_CONFIG[0]);
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [isToolCreatorOpen, setIsToolCreatorOpen] = useState(false);
  const [sparkStatus, setSparkStatus] = useState<'connected' | 'offline'>('offline');
  
  useEffect(() => {
    // Verify environment key presence
    const key = process.env.API_KEY;
    if (key && key !== "undefined" && key.length > 0) {
      setSparkStatus('connected');
    } else {
      setSparkStatus('offline');
    }

    const history = localStorage.getItem('everyspark_vault');
    if (history) {
      try {
        setSavedResources(JSON.parse(history));
      } catch (e) {
        console.error("Vault loading failed", e);
      }
    }

    const customToolsStore = localStorage.getItem('everyspark_custom_tools');
    if (customToolsStore) {
        try {
            const parsed = JSON.parse(customToolsStore);
            setAllTools([...TOOLS_CONFIG, ...parsed]);
        } catch (e) {
            console.error("Custom tools loading failed", e);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('everyspark_vault', JSON.stringify(savedResources));
  }, [savedResources]);

  useEffect(() => {
    const firstOfCat = allTools.find(t => t.categoryId === activeCategory);
    if (firstOfCat) setSelectedTool(firstOfCat);
  }, [activeCategory, allTools]);

  const handleAddCustomTool = (newTool: ToolConfig) => {
      const updatedTools = [...allTools, newTool];
      setAllTools(updatedTools);
      
      const customOnly = updatedTools.filter(t => t.isCustom);
      localStorage.setItem('everyspark_custom_tools', JSON.stringify(customOnly));
      
      // Auto-select the new tool's category and the tool itself
      setActiveCategory(newTool.categoryId);
      setSelectedTool(newTool);
  };

  const handleGenerate = async () => {
    if (isGenerating) return;

    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined") {
      setOutput("### Spark Signal Lost\nThe system API key (API_KEY) is missing or configured incorrectly. Please check your environment variables.");
      setSparkStatus('offline');
      return;
    }

    setIsGenerating(true);
    setOutput('');
    setCurrentArtifact(null);
    setSparkStatus('connected');
    
    const terminal = document.getElementById('engine-output');
    if (terminal) terminal.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        You are EverySpark AI, the premier Teacher's AI Toolset generator for South African public schools.
        
        STRICT RULES:
        1. ALWAYS align with CAPS (Curriculum and Assessment Policy Statement).
        2. NEVER mention API keys or system configuration.
        3. For "Rubric Architect" or "Interactive Quiz Master" (or similar custom interactive tools), output a single-file, professional HTML/CSS solution wrapped in <html> tags. 
        4. Use a clean, educational aesthetic with Slate and Gold accents in any HTML generated.
        5. For text assets, use rigorous Markdown with ### headers and bold key terms.
        6. Always address South African context (Grade levels, Terminology like "Learners" vs "Students", Assessment tasks).
      `.trim();

      const userPrompt = `
        STRATEGIC DOMAIN: ${activeCategory}
        MODULE: ${selectedTool.name}
        USER INPUT: ${promptInput || 'Standard high-fidelity implementation'}
        GUIDING LOGIC: ${selectedTool.basePrompt}
        
        Generate the educational asset now. If this tool requires an interactive component (like a quiz or table), ensure you provide the full HTML.
      `.trim();

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.65,
        }
      });

      let accumulatedText = '';
      for await (const chunk of responseStream) {
        const text = chunk.text;
        accumulatedText += text;
        setOutput(accumulatedText);

        // Interactive Artifact Detection
        if (accumulatedText.includes('<!DOCTYPE html>') || accumulatedText.includes('<html')) {
            const htmlMatch = accumulatedText.match(/<html[\s\S]*<\/html>/i);
            if (htmlMatch) {
                setCurrentArtifact({
                    id: 'asset-' + Date.now(),
                    styleName: selectedTool.name,
                    html: htmlMatch[0],
                    status: 'streaming'
                });
            }
        }
      }

      if (currentArtifact) {
          setCurrentArtifact(prev => prev ? { ...prev, status: 'complete' } : null);
      }

      const newResource: SavedResource = {
        id: Date.now().toString(),
        toolName: selectedTool.name,
        categoryName: TOOL_CATEGORIES.find(c => c.id === activeCategory)?.name || '',
        content: accumulatedText,
        timestamp: Date.now(),
        type: currentArtifact ? 'artifact' : 'text'
      };
      setSavedResources(prev => [newResource, ...prev].slice(0, 20));

    } catch (error: any) {
      console.error("Spark Execution Error:", error);
      setOutput("### Network Latency Error\nThe Spark engine timed out. Please retry the generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(output);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-200">
      <nav className="h-20 bg-white/95 backdrop-blur-lg sticky top-0 z-[60] border-b border-slate-200 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto h-full flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                <div className="bg-slate-900 p-2 rounded-lg group-hover:bg-amber-500 transition-colors shadow-lg">
                    <i className="fa-solid fa-bolt-lightning text-amber-400 group-hover:text-slate-900"></i>
                </div>
                <span className="font-black text-2xl tracking-tighter uppercase text-slate-900">Every<span className="text-amber-500">Spark</span></span>
            </div>
            <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                    <div className={`w-2 h-2 rounded-full ${sparkStatus === 'connected' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{sparkStatus === 'connected' ? 'Engine Ready' : 'Offline'}</span>
                </div>
                <button onClick={() => setShowHistory(true)} className="text-xs font-black text-slate-600 hover:text-amber-600 transition flex items-center gap-2 uppercase tracking-widest">
                    <i className="fa-solid fa-folder-open"></i> Vault
                </button>
                <div className="h-6 w-px bg-slate-200"></div>
                <a href="https://www.backabuddy.co.za" target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-black text-[10px] hover:bg-amber-500 hover:text-slate-900 transition-all uppercase tracking-widest shadow-md active:scale-95">
                    Impact Hub
                </a>
            </div>
        </div>
        <div className="sa-accent absolute bottom-0 left-0 right-0 h-[3px]"></div>
      </nav>

      <header className="premium-gradient text-white py-32 relative overflow-hidden">
        <DottedGlowBackground opacity={0.3} gap={28} speedScale={0.4} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
                <div className="inline-block bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-8 border border-amber-500/30">
                    Propelling SA Education Forward
                </div>
                <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
                    AI Toolset for <br/><span className="spark-accent italic">Elite Educators.</span>
                </h1>
                <p className="text-xl text-slate-300 mb-12 leading-relaxed font-medium max-w-2xl">
                    Experience a frictionless suite of tools powered by Gemini. Generate CAPS-ready rubrics, differentiated content, and interactive assessments in seconds.
                </p>
                <button onClick={() => document.getElementById('demo')?.scrollIntoView({behavior:'smooth'})} className="bg-amber-500 text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition shadow-2xl hover:bg-white active:scale-95 flex items-center gap-3">
                    <i className="fa-solid fa-microchip"></i> OPEN TEACHER SUITE
                </button>
            </div>
        </div>
      </header>

      <section id="demo" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-12 bg-slate-50 rounded-[3rem] p-6 lg:p-12 border border-slate-200 shadow-xl">
                
                {/* Configuration Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">1. Select Strategic Domain</label>
                        <div className="grid grid-cols-2 gap-2">
                            {TOOL_CATEGORIES.map(cat => (
                                <button 
                                    key={cat.id} 
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`p-4 rounded-2xl transition-all border-2 flex flex-col items-center gap-2 ${activeCategory === cat.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-white hover:border-amber-200'}`}
                                >
                                    <i className={`fa-solid ${cat.icon} text-lg`}></i>
                                    <span className="text-[10px] font-black uppercase tracking-tight">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">2. Select Lab Module</label>
                            <button 
                                onClick={() => setIsToolCreatorOpen(true)} 
                                className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-500 flex items-center gap-2 transition-colors px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100"
                            >
                                <i className="fa-solid fa-wand-magic-sparkles"></i> Build Custom
                            </button>
                        </div>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                            {allTools.filter(t => t.categoryId === activeCategory).map(tool => (
                                <button 
                                    key={tool.id}
                                    onClick={() => setSelectedTool(tool)}
                                    className={`w-full text-left p-4 rounded-xl text-sm font-bold border-2 transition-all flex justify-between items-center ${selectedTool.id === tool.id ? 'border-amber-500 bg-amber-50 text-slate-900 shadow-sm' : 'border-transparent bg-white text-slate-500 hover:bg-slate-100'}`}
                                >
                                    <span className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black uppercase tracking-tight">{tool.name}</span>
                                            {tool.isCustom && <span className="text-[8px] bg-slate-100 text-slate-400 px-1 rounded uppercase tracking-wider">Custom</span>}
                                        </div>
                                        <span className="text-[10px] opacity-60 font-medium leading-tight mt-1">{tool.description}</span>
                                    </span>
                                    {selectedTool.id === tool.id && <i className="fa-solid fa-circle-play text-amber-500"></i>}
                                </button>
                            ))}
                            {allTools.filter(t => t.categoryId === activeCategory).length === 0 && (
                                <div className="p-4 text-center text-xs text-slate-400 italic">
                                    No tools available. Try building one!
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">3. Contextual Data</label>
                        <div className="relative">
                            <textarea 
                                value={promptInput}
                                onChange={(e) => setPromptInput(e.target.value)}
                                placeholder={selectedTool.examplePrompt}
                                className="w-full p-5 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-amber-500/20 outline-none h-40 transition-all font-medium text-slate-700 shadow-inner resize-none text-sm leading-relaxed"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || sparkStatus === 'offline'}
                        className={`w-full py-6 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-4 ${isGenerating ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : sparkStatus === 'offline' ? 'bg-red-100 text-red-400 cursor-not-allowed' : 'bg-amber-500 text-slate-900 hover:scale-[1.02] shadow-xl hover:shadow-amber-500/20'}`}
                    >
                        {isGenerating ? <ThinkingIcon /> : <i className="fa-solid fa-atom"></i>}
                        {isGenerating ? 'GENERATING...' : 'INITIATE SPARK'}
                    </button>
                </div>

                {/* Output Window */}
                <div id="engine-output" className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-inner overflow-hidden flex flex-col min-h-[700px]">
                    <div className="bg-slate-900 px-8 py-5 text-white flex justify-between items-center border-b border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                            </div>
                            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-2">EverySpark Lab Result</span>
                        </div>
                        {output && !isGenerating && (
                            <button onClick={copyContent} title="Copy Result" className="text-[10px] font-black bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition flex items-center gap-2">
                                <i className={showCopySuccess ? "fa-solid fa-check text-green-400" : "fa-regular fa-copy"}></i>
                                {showCopySuccess ? 'COPIED' : 'COPY'}
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                        {currentArtifact ? (
                            <div className="h-full">
                                <ArtifactCard 
                                    artifact={currentArtifact} 
                                    isFocused={true} 
                                    onClick={() => {}} 
                                />
                                <details className="mt-8 group">
                                    <summary className="text-[10px] font-black uppercase text-slate-400 cursor-pointer list-none flex items-center gap-2 group-hover:text-amber-500 transition-colors">
                                        <i className="fa-solid fa-code"></i> Developer Mode: Source Code
                                    </summary>
                                    <div className="mt-4 p-4 bg-slate-900 rounded-xl text-xs overflow-x-auto text-amber-500 font-mono border border-slate-800 shadow-inner">
                                        {output}
                                    </div>
                                </details>
                            </div>
                        ) : (
                            <div className="markdown-content max-w-3xl mx-auto">
                                {!output && !isGenerating && (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-32">
                                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                                            <i className="fa-solid fa-microscope text-4xl text-slate-400"></i>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Lab Module Inactive</h3>
                                        <p className="font-medium text-slate-500 max-w-xs mx-auto">Select a Teacher Suite tool and provide topic details to synthesize a custom asset.</p>
                                    </div>
                                )}
                                {output.split('\n').map((line, i) => {
                                    if (line.startsWith('###')) return <h3 key={i} className="text-2xl font-black text-slate-900 mt-12 mb-6 border-b-4 border-amber-400 inline-block pb-1">{line.replace('###', '').trim()}</h3>;
                                    if (line.trim().startsWith('**') && line.trim().endsWith('**')) return <h4 key={i} className="text-lg font-bold text-slate-800 mt-8 mb-3 uppercase tracking-tight">{line.replace(/\*\*/g, '').trim()}</h4>;
                                    if (line.trim().startsWith('-') || line.trim().startsWith('*')) return <li key={i} className="ml-4 mb-3 text-slate-700 list-none flex items-start gap-3"><span className="text-amber-500 mt-1.5 text-[8px]"><i className="fa-solid fa-circle"></i></span><span className="text-base">{line.replace(/^[-*]/, '').trim()}</span></li>;
                                    return line.trim() ? <p key={i} className="mb-5 text-slate-600 leading-relaxed font-medium text-base">{line}</p> : <div key={i} className="h-2"></div>;
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </section>

      <ToolCreator 
        isOpen={isToolCreatorOpen} 
        onClose={() => setIsToolCreatorOpen(false)} 
        onSave={handleAddCustomTool} 
      />

      <SideDrawer isOpen={showHistory} onClose={() => setShowHistory(false)} title="The Spark Vault">
        <div className="space-y-4">
            {savedResources.length === 0 ? (
                <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                    <i className="fa-solid fa-box-open text-4xl"></i>
                    <span className="italic font-bold">No assets stored in vault.</span>
                </div>
            ) : savedResources.map(res => (
                <div key={res.id} onClick={() => { setOutput(res.content); setShowHistory(false); }} className="p-5 rounded-2xl border border-slate-100 hover:border-amber-400 cursor-pointer transition-all bg-white group shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white bg-slate-900 px-2 py-0.5 rounded-md">{res.categoryName}</span>
                        <span className="text-[9px] text-slate-400 font-bold">{new Date(res.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-amber-600 transition-colors mb-2 relative z-10">{res.toolName}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed relative z-10">{res.content.replace(/[#*]/g, '').slice(0, 100)}...</p>
                </div>
            ))}
        </div>
      </SideDrawer>

      <footer className="bg-slate-900 py-20 px-6 border-t border-slate-800 text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                      <div className="bg-white/10 p-2 rounded-lg"><i className="fa-solid fa-bolt-lightning text-amber-500"></i></div>
                      <span className="font-extrabold text-xl text-white uppercase tracking-tighter">Every<span className="text-amber-500">Spark</span></span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium max-w-sm leading-relaxed">
                      EverySpark: A National Educational Asset. Empowering South African teachers with elite AI capabilities.
                  </p>
              </div>
              <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
                  <a href="#" className="hover:text-amber-400 transition">Our Strategy</a>
                  <a href="#" className="hover:text-amber-400 transition">Terms of Use</a>
                  <a href="#" className="hover:text-amber-400 transition">Contact Support</a>
              </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} EverySpark Initiative. Cape Town, ZA.
          </div>
      </footer>
    </div>
  );
}