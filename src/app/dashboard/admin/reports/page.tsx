"use client";

import { useState, useEffect } from "react";
import { BarChart3, Download, TrendingUp, Users, Building2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminReportsPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleExport = async (type: 'users' | 'businesses' | 'all') => {
        try {
            const toastId = toast.loading(`Generating ${type} report...`);
            let endpoints = [];

            if (type === 'all') {
                endpoints = ['/api/admin/export/users', '/api/admin/export/businesses'];
            } else {
                endpoints = [`/api/admin/export/${type}`];
            }

            for (const url of endpoints) {
                const res = await fetch(url);
                if (!res.ok) throw new Error("Export failed");
                const blob = await res.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                // Get filename from response header if possible, else fallback
                const disposition = res.headers.get('content-disposition');
                let filename = `liveq_${type}_export.csv`;
                if (disposition && disposition.includes('filename="')) {
                    filename = disposition.split('filename="')[1].split('"')[0];
                }
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(downloadUrl);
            }

            toast.success("Export downloaded successfully!", { id: toastId });
        } catch (err: any) {
            toast.error(err.message || "Failed to download report");
        }
    }

    const ReportCard = ({ title, description, icon, color, exportType }: any) => (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-50 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                {exportType ? (
                    <button
                        onClick={() => handleExport(exportType)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl text-xs font-bold transition-colors border border-gray-100"
                    >
                        <Download className="w-3 h-3" /> Export
                    </button>
                ) : (
                    <div className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold border border-gray-100 italic">
                        In Progress
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">{title}</h3>
                <p className="text-xs text-gray-500 font-medium line-clamp-2">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">SYSTEM REPORTS</h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Analytics & Exports</p>
                </div>
                <button
                    onClick={() => handleExport('all')}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-sm"
                >
                    <Download className="w-4 h-4" /> Download All Data Data
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-44 bg-white rounded-3xl border border-gray-100" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ReportCard
                        title="User Growth Report"
                        description="Detailed breakdown of new user registrations, active sessions, and retention rates."
                        icon={<Users className="w-6 h-6" />}
                        color="bg-red-600"
                        exportType="users"
                    />
                    <ReportCard
                        title="Business Directory"
                        description="Export the full directory of registered businesses including current verification statuses and categories."
                        icon={<Building2 className="w-6 h-6" />}
                        color="bg-gray-900"
                        exportType="businesses"
                    />
                    <ReportCard
                        title="Platform Operations"
                        description="Analytics covering daily queue processing volumes, average wait times, and appointment completions."
                        icon={<TrendingUp className="w-6 h-6" />}
                        color="bg-red-600"
                    />
                    <ReportCard
                        title="Monthly Summaries"
                        description="End-of-month aggregated reports containing high-level platform health metrics."
                        icon={<Calendar className="w-6 h-6" />}
                        color="bg-gray-900"
                    />
                </div>
            )}

            {!loading && (
                <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl shadow-gray-200 mt-10">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-6 h-6 text-red-500" />
                        <h3 className="text-lg font-black uppercase tracking-widest text-white">Live Reporting Engine (Coming Soon)</h3>
                    </div>
                    <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
                        Dynamic chart generation and customizable pivot tables are currently in development. For now, use the export buttons above to download raw CSV data for offline analysis in Excel or Google Sheets.
                    </p>
                </div>
            )}
        </div>
    );
}
