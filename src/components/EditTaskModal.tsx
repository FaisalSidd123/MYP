/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: any;
    onSave: (task: any) => void;
}

export default function EditTaskModal({ isOpen, onClose, task, onSave }: EditTaskModalProps) {
    const [formData, setFormData] = useState({
        id: '',
        client_id: '',
        title: '',
        description: '',
        due_date: '',
        status: 'pending'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (task) {
            setFormData({
                id: task.id || '',
                client_id: task.client_id || '',
                title: task.title || '',
                description: task.description || '',
                due_date: task.due_date ? task.due_date.split('T')[0] : '',
                status: task.status || 'pending'
            });
        }
    }, [task]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0a1025] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
                <div className="sticky top-0 bg-[#0a1025] px-6 py-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-on-surface">Edit Task</h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Client ID (Optional)</label>
                        <input
                            type="text"
                            name="client_id"
                            value={formData.client_id}
                            onChange={handleChange}
                            placeholder="Link to a client by UUID"
                            className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Task details..."
                            className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Due Date</label>
                        <input
                            type="date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
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
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 border border-white/20 rounded-lg text-on-surface-variant hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dim rounded-lg text-on-primary-fixed font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}