/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';

interface EditContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: any;
    onSave: (contact: any) => void;
}

export default function EditContactModal({ isOpen, onClose, contact, onSave }: EditContactModalProps) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        source: '',
        status: 'new',
        pitch: [] as string[],
        pitch_notes: '',
        avatar_url: ''
    });
    const [pitchInput, setPitchInput] = useState('');

    useEffect(() => {
        if (contact) {
            setFormData({
                id: contact.id || '',
                name: contact.name || '',
                email: contact.email || '',
                phone: contact.phone || '',
                company: contact.company || '',
                source: contact.source || '',
                status: contact.status || 'new',
                pitch: contact.pitch || [],
                pitch_notes: contact.pitch_notes || '',
                avatar_url: contact.avatar_url || ''
            });
        }
    }, [contact]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddPitch = () => {
        if (pitchInput.trim() && !formData.pitch.includes(pitchInput.trim())) {
            setFormData({
                ...formData,
                pitch: [...formData.pitch, pitchInput.trim()]
            });
            setPitchInput('');
        }
    };

    const handleRemovePitch = (service: string) => {
        setFormData({
            ...formData,
            pitch: formData.pitch.filter(p => p !== service)
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0a1025] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
                <div className="sticky top-0 bg-[#0a1025] px-6 py-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-on-surface">Edit Contact</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Company</label>
                        <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Source</label>
                        <input
                            type="text"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            placeholder="Referral, Cold Call, Website, etc."
                            className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Services to Pitch</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={pitchInput}
                                onChange={(e) => setPitchInput(e.target.value)}
                                placeholder="e.g., Web Development"
                                className="flex-1 bg-[#111827] border border-white/10 rounded-lg px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPitch())}
                            />
                            <button
                                type="button"
                                onClick={handleAddPitch}
                                className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-primary text-sm font-medium transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.pitch.map((service, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-lg text-primary text-xs">
                                    {service}
                                    <button type="button" onClick={() => handleRemovePitch(service)} className="hover:text-red-400">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Pitch Notes</label>
                        <textarea
                            name="pitch_notes"
                            value={formData.pitch_notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Strategy notes, talking points, objections..."
                            className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-white/20 rounded-lg text-on-surface-variant hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dim rounded-lg text-on-primary-fixed font-medium transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}