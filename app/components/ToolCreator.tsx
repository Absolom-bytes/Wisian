"use client";

import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ToolConfig } from '../../types';
import { ThinkingIcon } from './Icons';
import DottedGlowBackground from './DottedGlowBackground';

interface ToolCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tool: ToolConfig) => void;
}

export default function ToolCreator({ isOpen, onClose, onSave }: ToolCreatorProps) {
    const [description, setDescription] = useState('');
    const [isBuilding, setIsBuilding] = useState(false);
    const [generatedTool, setGeneratedTool] = useState<ToolConfig | null>(null);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleBuild = async () => {
        if (!description.trim()) return;
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            setError("System Error: API Key missing.");
            return;
        }

        setIsBuilding(true);
        setError('');
        setGeneratedTool(null);

        try {
            const ai = new GoogleGenAI({ apiKey });
            
            const prompt = `
                User Request: "${description}"
                
                Task: Create a configuration for a new educational AI tool based on the user's request.
                Categories available: 'teacher', 'leadership', 'admin', 'learner'.
                
                Requirements:
                - Name: Short, punchy, professional (max 25 chars).
                - Description: Clear value proposition (max 80 chars).
                - Base Prompt: The system instruction that tells the AI how to behave when this tool is used. It should be rigorous, professional, and specific.
                - Example Prompt: A realistic example input a user would give this tool.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    systemInstruction: "You are an expert AI Architect for an EdTech platform. You design high-utility AI tools.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            basePrompt: { type: Type.STRING },
                            examplePrompt: { type: Type.STRING },
                            categoryId: { type: Type.STRING }
                        },
                        required: ["name", "description", "basePrompt", "examplePrompt", "categoryId"]
                    }
                }
            });

            if (response.text) {
                const data = JSON.parse(response.text);
                const newTool: ToolConfig = {
                    id: `custom-${Date.now()}`,
                    ...data,
                    isCustom: true
                };
                setGeneratedTool(newTool);
            }
        } catch (e) {
            console.error(e);
            setError("Failed to engineer tool. Please try again.");
        } finally {
            setIsBuilding(false);
        }
    };

    const handleConfirm = () => {
        if (generatedTool) {
            onSave(generatedTool);
            setGeneratedTool(null);
            setDescription('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-in-up">
                <div className="bg-slate-900 p-6 relative overflow-hidden">
                    <DottedGlowBackground opacity={0.4} />
                    <div className="relative z-10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500 p-2 rounded-lg text-slate-900">
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Tool Architect</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by Gemini</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {!generatedTool ? (
                        <>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">
                                What do you want to build?
                            </label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. A tool that generates debate topics for Grade 11 History students based on current events..."
                                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-amber-500/20 outline-none h-32 transition-all font-medium text-slate-700 text-sm mb-6 resize-none"
                            />
                            
                            {error && <p className="text-xs text-red-500 font-bold mb-4">{error}</p>}

                            <button 
                                onClick={handleBuild}
                                disabled={isBuilding || !description.trim()}
                                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isBuilding ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900'}`}
                            >
                                {isBuilding ? <ThinkingIcon /> : <i className="fa-solid fa-compass-drafting"></i>}
                                {isBuilding ? 'Engineering...' : 'Design Tool'}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-black text-lg text-slate-900">{generatedTool.name}</h3>
                                    <span className="text-[9px] font-black uppercase bg-slate-900 text-white px-2 py-1 rounded tracking-widest">{generatedTool.categoryId}</span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">{generatedTool.description}</p>
                                <div className="bg-white p-3 rounded-lg border border-amber-100">
                                    <p className="text-[10px] font-mono text-slate-400 uppercase mb-1">Base Logic:</p>
                                    <p className="text-[10px] text-slate-500 italic line-clamp-3">{generatedTool.basePrompt}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setGeneratedTool(null)}
                                    className="py-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-500 hover:bg-slate-50 transition uppercase tracking-wider"
                                >
                                    Discard
                                </button>
                                <button 
                                    onClick={handleConfirm}
                                    className="py-3 rounded-xl bg-green-500 text-white font-black text-xs hover:bg-green-600 transition uppercase tracking-wider shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-check"></i> Install Tool
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}