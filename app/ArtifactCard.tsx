"use client";

import React from 'react';
import { Artifact } from '../types';
import { ThinkingIcon } from './components/Icons';

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

    return (
        <div 
            className={`w-full h-[600px] rounded-2xl overflow-hidden border border-slate-200 bg-white relative shadow-lg transition-all ${isFocused ? 'ring-4 ring-amber-500/20' : ''}`}
            onClick={onClick}
        >
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white px-2 py-1 rounded shadow-sm">{artifact.styleName}</span>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
            </div>
            <div className="relative h-full w-full bg-slate-50">
                {isStreaming && (
                    <div className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col items-center justify-center transition-all">
                        <div className="text-amber-500 text-6xl mb-6">
                            <ThinkingIcon />
                        </div>
                        <div className="text-white font-black uppercase tracking-[0.2em] text-xs animate-pulse">
                            Synthesizing Asset...
                        </div>
                    </div>
                )}
                <iframe 
                    srcDoc={artifact.html} 
                    title={artifact.id} 
                    sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
                    className="w-full h-full border-none"
                />
            </div>
        </div>
    );
});

ArtifactCard.displayName = 'ArtifactCard';

export default ArtifactCard;