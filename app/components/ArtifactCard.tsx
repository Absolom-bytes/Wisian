
"use client";

import React from 'react';
import { Artifact } from '../../types';
import { ThinkingIcon } from './Icons';

interface ArtifactCardProps {
    artifact: Artifact;
    isFocused: boolean;
    onClick: () => void;
}

const ArtifactCard = React.memo(({ 
    artifact, 
    isFocused, 
    onClick 
}: ArtifactCardProps) => {
    const isStreaming = artifact.status === 'streaming';
    const isError = artifact.status === 'error';

    return (
        <div 
            className={`w-full h-[600px] rounded-3xl overflow-hidden border border-slate-200 bg-white relative shadow-xl transition-all duration-500 ${isFocused ? 'ring-8 ring-amber-500/10 scale-[1.01]' : 'opacity-90 hover:opacity-100'}`}
            onClick={onClick}
        >
            {/* Header / Tab Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex justify-between items-center z-30 relative">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-l border-slate-200 pl-3 ml-1">
                        {artifact.styleName} Pipeline
                    </span>
                </div>
                {isStreaming && (
                    <div className="flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                        <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                        Live Synthesis
                    </div>
                )}
            </div>

            <div className="relative h-full w-full bg-slate-50">
                {/* Robust Loading Overlay */}
                {isStreaming && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-40 flex flex-col items-center justify-center transition-all duration-700 animate-in fade-in">
                        <div className="relative mb-8">
                            <div className="text-amber-500 text-7xl animate-pulse">
                                <ThinkingIcon />
                            </div>
                            <div className="absolute -inset-4 bg-amber-400/20 blur-2xl rounded-full -z-10 animate-pulse"></div>
                        </div>
                        
                        <div className="text-center space-y-4 px-12">
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Synthesizing Asset</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] max-w-xs leading-loose">
                                Aligning with CAPS curriculum • Engineering interactive elements • Optimizing for classroom display
                            </p>
                            
                            {/* Shimmering Progress Bar */}
                            <div className="w-48 h-1 bg-slate-200 rounded-full mx-auto overflow-hidden mt-6">
                                <div className="h-full bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State Overlay */}
                {isError && (
                    <div className="absolute inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-12 text-center animate-in fade-in">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-3xl mb-6">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 uppercase mb-2">Synthesis Failed</h4>
                        <p className="text-sm text-slate-500 font-medium mb-8">
                            The EverySpark pipeline encountered an upstream connectivity issue. Please check your system key or try a different configuration.
                        </p>
                        <button 
                            onClick={(e) => { e.stopPropagation(); window.location.reload(); }}
                            className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-colors"
                        >
                            Reset Pipeline
                        </button>
                    </div>
                )}

                {/* Main Content Iframe */}
                <iframe 
                    srcDoc={artifact.html} 
                    title={artifact.id} 
                    sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
                    className={`w-full h-full border-none transition-opacity duration-1000 ${isStreaming ? 'opacity-0' : 'opacity-100'}`}
                />
            </div>
            
            {/* Fix: Replaced 'jsx' attribute with dangerouslySetInnerHTML for standard React/TypeScript compatibility */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            ` }} />
        </div>
    );
});

ArtifactCard.displayName = 'ArtifactCard';

export default ArtifactCard;
