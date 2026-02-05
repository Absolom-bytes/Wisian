
"use client";

import { GoogleGenAI } from '@google/genai';
import React, { useState, useEffect } from 'react';
import { TOOLS_CONFIG, TOOL_CATEGORIES } from '../constants';
import { ToolConfig, Artifact, LabAsset, GroundingSource } from '../types';
import { ThinkingIcon } from './components/Icons';
import SideDrawer from './components/SideDrawer';
import ArtifactCard from './components/ArtifactCard';
import ToolCreator from './components/ToolCreator';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'resources' | 'visuals'>('resources');
  const [activeCategory, setActiveCategory] = useState(TOOL_CATEGORIES[0].id);
  const [allTools, setAllTools] = useState<ToolConfig[]>(TOOLS_CONFIG);
  const [selectedTool, setSelectedTool] = useState<ToolConfig>(TOOLS_CONFIG[0]);
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const [labAssets, setLabAssets] = useState<LabAsset[]>([]);
  
  // Image Settings
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('16:9');
  
  const [showHistory, setShowHistory] = useState(false);
  const [isToolCreatorOpen, setIsToolCreatorOpen] = useState(false);

  useEffect(() => {
    const savedAssets = localStorage.getItem('everyspark_lab_assets');
    if (savedAssets) setLabAssets(JSON.parse(savedAssets));
  }, []);

  useEffect(() => {
    localStorage.setItem('everyspark_lab_assets', JSON.stringify(labAssets));
  }, [labAssets]);

  const handleApiKeyPrompt = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      return true;
    }
    return false;
  };

  const handleGenerateResource = async () => {
    setIsGenerating(true);
    setOutput('');
    setSources([]);
    
    // Create immediate placeholder artifact to trigger card UI
    const tempId = Date.now().toString();
    const draftArtifact: Artifact = { 
        id: tempId, 
        styleName: selectedTool.name, 
        html: '', 
        status: 'streaming' 
    };
    setCurrentArtifact(draftArtifact);

    try {
      const apiKey = process.env.API_KEY;
      const isGeography = selectedTool.id === 'geography-explorer' || promptInput.toLowerCase().includes('location') || promptInput.toLowerCase().includes('near');
      
      // Initialize GoogleGenAI right before use to ensure the latest API key is used
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      
      const config: any = {
        tools: isGeography ? [{ googleSearch: {} }, { googleMaps: {} }] : [{ googleSearch: {} }],
        systemInstruction: "Align with SA CAPS standards. Use professional Markdown. For geography queries, use Google Maps grounding to provide specific place URLs and review snippets. If the output involves interactive components, wrap them in valid, self-contained HTML/CSS/JS."
      };

      if (isGeography && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => 
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          config.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              }
            }
          };
        } catch (e) {
          console.warn("Geolocation access omitted:", e);
        }
      }

      const response = await ai.models.generateContent({
        // Fix: Use 'gemini-2.5-flash' for maps grounding as per library requirements
        model: isGeography ? 'gemini-2.5-flash' : 'gemini-3-flash-preview',
        contents: `Domain: ${activeCategory}. Tool: ${selectedTool.name}. Request: ${promptInput || selectedTool.examplePrompt}. Logic: ${selectedTool.basePrompt}`,
        config
      });

      const text = response.text || '';
      setOutput(text);
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extracted = chunks.map((c: any) => {
          if (c.web) return { title: c.web.title || 'Web Source', uri: c.web.uri };
          if (c.maps) return { title: c.maps.title || 'Place Detail', uri: c.maps.uri };
          return null;
        }).filter(Boolean);
        setSources(extracted);
      }

      const match = text.match(/<html[\s\S]*<\/html>/i);
      if (match) {
        setCurrentArtifact({ 
            id: tempId, 
            styleName: selectedTool.name, 
            html: match[0], 
            status: 'complete' 
        });
      } else {
        // If no HTML was generated, we can either clear it or wrap the text in a basic HTML shell
        const textToHtml = `<html><body style="font-family: sans-serif; padding: 2rem; color: #334155; line-height: 1.6;">${text.replace(/\n/g, '<br>')}</body></html>`;
        setCurrentArtifact({ 
            id: tempId, 
            styleName: selectedTool.name, 
            html: textToHtml, 
            status: 'complete' 
        });
      }
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found")) {
        await handleApiKeyPrompt();
      }
      setCurrentArtifact({ ...draftArtifact, status: 'error' });
      setOutput("### Spark Latency Error\nGeneration failed. Ensure your API key is configured correctly.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      const apiKey = process.env.API_KEY;
      // Initialize GoogleGenAI right before use to ensure the latest API key is used
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: promptInput }] },
        config: { 
          imageConfig: { aspectRatio: aspectRatio as any, imageSize },
          tools: [{ googleSearch: {} }]
        }
      });

      for (const part of response.candidates?.[0].content.parts || []) {
        if (part.inlineData) {
          const newAsset: LabAsset = {
            id: Date.now().toString(),
            type: 'image',
            url: `data:image/png;base64,${part.inlineData.data}`,
            prompt: promptInput,
            timestamp: Date.now()
          };
          setLabAssets([newAsset, ...labAssets]);
        }
      }
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found")) {
        await handleApiKeyPrompt();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-200">
      <nav className="h-20 bg-white/95 backdrop-blur-lg sticky top-0 z-[60] border-b border-slate-200 px-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="bg-slate-900 p-2 rounded-lg group-hover:bg-amber-500 transition-colors shadow-lg">
            <i className="fa-solid fa-bolt-lightning text-amber-400 group-hover:text-slate-900"></i>
          </div>
          <span className="font-black text-2xl uppercase tracking-tighter">Every<span className="text-amber-500">Spark</span></span>
        </div>
        
        <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button onClick={() => setActiveTab('resources')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'resources' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Resource Engine</button>
          <button onClick={() => setActiveTab('visuals')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'visuals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Visual Lab</button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleApiKeyPrompt} className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-4 py-2 rounded-full hover:bg-slate-200 transition-all border border-slate-200">
            <i className="fa-solid fa-cog mr-2"></i> System Key
          </button>
          <button onClick={() => setShowHistory(true)} className="text-xs font-black text-slate-600 hover:text-amber-600 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-layer-group"></i> Vault
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8">
            {activeTab === 'resources' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <section>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">Target Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TOOL_CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`p-4 rounded-2xl border-2 transition ${activeCategory === cat.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-transparent text-slate-400 hover:border-amber-200'}`}>
                        <i className={`fa-solid ${cat.icon} mb-2 block text-lg`}></i>
                        <span className="text-[9px] font-black uppercase tracking-tight">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </section>
                <section>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">Module Selection</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {allTools.filter(t => t.categoryId === activeCategory).map(tool => (
                      <button key={tool.id} onClick={() => setSelectedTool(tool)} className={`w-full text-left p-4 rounded-xl border-2 transition ${selectedTool.id === tool.id ? 'bg-amber-50 border-amber-500 text-slate-900 shadow-sm' : 'bg-white border-transparent text-slate-500 hover:bg-slate-50'}`}>
                        <div className="text-[10px] font-black uppercase">{tool.name}</div>
                        <p className="text-[9px] font-medium opacity-60 mt-1 line-clamp-1">{tool.description}</p>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'visuals' && (
              <div className="space-y-8 animate-in slide-in-from-left duration-300">
                <section>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">Fidelity & Aspect</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['1K', '2K', '4K'].map(s => (
                      <button key={s} onClick={() => setImageSize(s as any)} className={`py-3 rounded-xl font-black text-[10px] border-2 transition ${imageSize === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400'}`}>{s}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['1:1', '16:9', '9:16'].map(r => (
                      <button key={r} onClick={() => setAspectRatio(r as any)} className={`py-3 rounded-xl font-black text-[10px] border-2 transition ${aspectRatio === r ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400'}`}>{r}</button>
                    ))}
                  </div>
                </section>
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                   <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                     <i className="fa-solid fa-circle-info mr-2"></i>
                     Generating diagrams for lesson plans improves retention by up to 60%.
                   </p>
                </div>
              </div>
            )}

            <section>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">Instructional Context</label>
              <textarea value={promptInput} onChange={e => setPromptInput(e.target.value)} placeholder={activeTab === 'resources' ? selectedTool.examplePrompt : "e.g. A cross-section diagram of the human heart for Grade 12 Biology..."} className="w-full h-40 p-5 rounded-2xl bg-white border border-slate-200 shadow-inner resize-none text-sm font-medium focus:ring-4 focus:ring-amber-500/20 outline-none transition" />
            </section>

            <button onClick={activeTab === 'resources' ? handleGenerateResource : handleGenerateImage} disabled={isGenerating} className={`w-full py-6 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-4 ${isGenerating ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900 hover:scale-[1.02] shadow-xl active:scale-95'}`}>
              {isGenerating ? <ThinkingIcon /> : <i className="fa-solid fa-atom"></i>}
              {isGenerating ? 'SYNTHESIZING...' : 'GENERATE ASSET'}
            </button>
          </div>

          <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[700px]">
             <div className="bg-slate-900 px-8 py-5 text-white flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Educational Terminal: {activeTab.toUpperCase()}</span>
                </div>
                <div className="text-[10px] font-black uppercase text-amber-500 animate-pulse tracking-widest">Pipeline Ready</div>
             </div>

             <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar">
                {activeTab === 'resources' ? (
                  currentArtifact ? (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <ArtifactCard artifact={currentArtifact} isFocused={true} onClick={() => {}} />
                        {sources.length > 0 && !isGenerating && (
                            <div className="mt-16 pt-10 border-t border-slate-100 bg-slate-50/50 -mx-12 px-12 pb-12">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest">Grounding Citations</h4>
                                <div className="flex flex-wrap gap-3">
                                    {sources.map((s, i) => (
                                    <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] font-bold bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50 px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm">
                                        <i className={`fa-solid ${s.uri?.includes('google.com/maps') ? 'fa-location-dot text-red-500' : 'fa-globe text-blue-500'}`}></i>
                                        {s.title}
                                    </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        {isGenerating && (
                            <div className="mt-8 text-center animate-pulse">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Optimizing Metadata...</p>
                            </div>
                        )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-10 grayscale pointer-events-none py-40">
                      <i className="fa-solid fa-graduation-cap text-8xl mb-8"></i>
                      <p className="font-black uppercase tracking-[0.3em] text-sm">Select a module to begin</p>
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {isGenerating && labAssets.length === 0 && (
                        <div className="col-span-full h-full flex flex-col items-center justify-center text-center py-40">
                            <div className="text-amber-500 text-7xl mb-8 animate-pulse"><ThinkingIcon /></div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Rendering High-Fidelity Visual</h3>
                            <p className="text-slate-500 font-medium max-w-sm">Generating instructional diagrams with 4K resolution standards...</p>
                        </div>
                    )}
                    {labAssets.map(asset => (
                      <div key={asset.id} className="group relative rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl bg-slate-100 aspect-square transition hover:shadow-amber-500/10 hover:border-amber-200">
                        <img src={asset.url} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt={asset.prompt} />
                        <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition duration-300 p-8 flex flex-col justify-end backdrop-blur-sm">
                          <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">Visual Prompt</div>
                          <p className="text-xs text-slate-300 font-medium line-clamp-4 mb-6 leading-relaxed italic">"{asset.prompt}"</p>
                          <a href={asset.url} download className="bg-amber-500 text-slate-900 py-3 rounded-2xl text-[10px] font-black uppercase text-center hover:bg-amber-400 transition transform hover:-translate-y-1 shadow-lg">Download 4K Asset</a>
                        </div>
                      </div>
                    ))}
                    {!isGenerating && labAssets.length === 0 && (
                       <div className="col-span-full py-40 text-center opacity-10 grayscale pointer-events-none">
                          <i className="fa-solid fa-palette text-8xl mb-8"></i>
                          <p className="font-black uppercase tracking-[0.3em] text-sm">Visual lab is empty</p>
                       </div>
                    )}
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>

      <SideDrawer isOpen={showHistory} onClose={() => setShowHistory(false)} title="Resource Vault">
         <div className="space-y-4">
           {labAssets.length > 0 ? labAssets.map(asset => (
             <div key={asset.id} className="group flex gap-5 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-amber-400 hover:bg-white transition cursor-pointer shadow-sm">
                <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 shadow-inner">
                  <img src={asset.url} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Image • {new Date(asset.timestamp).toLocaleDateString()}</div>
                  <p className="text-sm font-bold text-slate-700 truncate group-hover:text-slate-900">{asset.prompt}</p>
                </div>
             </div>
           )) : (
             <div className="py-20 text-center text-slate-300">
               <i className="fa-solid fa-box-open text-4xl mb-4"></i>
               <p className="text-xs font-black uppercase tracking-widest">Vault is Empty</p>
             </div>
           )}
         </div>
      </SideDrawer>

      <ToolCreator isOpen={isToolCreatorOpen} onClose={() => setIsToolCreatorOpen(false)} onSave={t => setAllTools([...allTools, t])} />
      
      <footer className="bg-slate-900 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest gap-8">
          <div className="flex items-center gap-3">
            <span className="text-white bg-slate-800 px-3 py-1 rounded">EverySpark AI</span>
            <span className="text-slate-700">|</span>
            <span>SA CAPS Aligned Education</span>
          </div>
          <div className="flex gap-10">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-amber-500 transition underline decoration-amber-500/50 underline-offset-4">Cloud Billing</a>
            <span className="text-slate-700">|</span>
            <span>v1.3 Educational Build</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
