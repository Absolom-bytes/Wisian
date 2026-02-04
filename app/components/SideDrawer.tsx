"use client";

import React, { useEffect } from 'react';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
}

const SideDrawer = ({ isOpen, onClose, title, children }: SideDrawerProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex justify-end" 
            role="dialog" 
            aria-modal="true"
        >
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" 
                onClick={onClose}
            ></div>
            <div 
                className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-2xl font-black text-slate-900">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="bg-slate-200 hover:bg-slate-300 w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all text-xl"
                    >
                        &times;
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SideDrawer;