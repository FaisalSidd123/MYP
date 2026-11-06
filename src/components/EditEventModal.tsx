/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: any;
    onSave: (event: any) => void;
}

export default function EditEventModal({ isOpen, onClose, event, onSave }: EditEventModalProps) {
    const [formData, setFormData] = useState({
        id: '',
        client_id: '',
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        type: 'follow_up',
        status: 'pending'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (event) {
            setFormData({
                id: event.id || '',
                client_id: event.client_id || '',
                title: event.title || '',
                description: event.description || '',
                start_time: event.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '',
                end_time: event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
                type: event.type || 'follow_up',
                status: event.status || 'pending'
            });
        }
    }, [event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={onClose}
            ></div>
            <div className="relative z-10 bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>Edit Event</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Modify appointment or meeting schedule.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">Client ID (Optional)</label>
                        <input
                            type="text"
                            name="client_id"
                            value={formData.client_id}
                            onChange={handleChange}
                            placeholder="Link to a client UUID"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 font-mono"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">Start Date & Time *</label>
                            <input
                                type="datetime-local"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                required
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">End Date & Time</label>
                            <input
                                type="datetime-local"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Event details..."
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                            >
                                <option value="call">Call</option>
                                <option value="meeting">Meeting</option>
                                <option value="follow_up">Follow Up</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
