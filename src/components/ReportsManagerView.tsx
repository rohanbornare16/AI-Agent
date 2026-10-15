import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  Eye,
  FileText,
  Printer,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { ItemReport, ReportType, ReportStatus, ItemCategory } from '../types';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../utils/constants';

interface ReportsManagerViewProps {
  reports: ItemReport[];
  onDeleteReport: (id: string) => Promise<void>;
  onSelectReport: (report: ItemReport) => void;
  onInitiateResolution: (report: ItemReport) => void;
  onPrintSlip: (report: ItemReport) => void;
}

export const ReportsManagerView: React.FC<ReportsManagerViewProps> = ({
  reports,
  onDeleteReport,
  onSelectReport,
  onInitiateResolution,
  onPrintSlip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter computation
  const filteredReports = reports.filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (locationFilter !== 'all' && !r.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.color.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete report "${title}"?`)) {
      setDeletingId(id);
      try {
        await onDeleteReport(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Campus Records Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Reports & Case Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Browse, filter, audit, print claim verification slips, or initiate safe case resolution.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by item title, brand, color, location or Case ID (e.g. 'wallet', 'milton', 'library')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Report Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Types (Lost & Found)</option>
              <option value="lost">Lost Reports Only</option>
              <option value="found">Found Reports Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Pending)</option>
              <option value="potential_match">Potential Match</option>
              <option value="resolved">Resolved / Returned</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Campus Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Campus Locations</option>
              <option value="Library">Library Buildings</option>
              <option value="Canteen">Main Canteen</option>
              <option value="Classroom">Classroom Blocks</option>
              <option value="Lab">Science Labs</option>
              <option value="Sports">Sports Complex</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white">{filteredReports.length}</strong> of{' '}
          <strong className="text-white">{reports.length}</strong> total records
        </span>
        {(searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setCategoryFilter('all');
              setStatusFilter('all');
              setLocationFilter('all');
            }}
            className="text-cyan-400 hover:text-cyan-300 underline text-xs"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-slate-500" />
          <h3 className="text-base font-bold text-white">No Matching Reports Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing selected filters, or filing a new report.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const isLost = report.type === 'lost';
            const isResolved = report.status === 'resolved';
            const isPotential = report.status === 'potential_match';

            return (
              <div
                key={report.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 space-y-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isLost
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {isResolved ? 'CASE RESOLVED' : isLost ? 'LOST REPORT' : 'FOUND REPORT'}
                    </span>

                    <div className="flex items-center gap-1">
                      {isPotential && !isResolved && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
                          Match Detected
                        </span>
                      )}
                      {report.isDemo && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          Demo Data
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-sm text-white line-clamp-1">{report.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{report.description}</p>
                  </div>

                  {/* Key metadata grid */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-400">Category:</span>{' '}
                      <span className="text-slate-200 capitalize">{report.category.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Color:</span>{' '}
                      <span className="text-slate-200">{report.color}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-300">{report.location}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-slate-300">{report.date}</span>
                    </div>
                  </div>

                  {report.dropOffLocation && (
                    <div className="text-[11px] text-cyan-300 bg-cyan-950/30 px-2.5 py-1 rounded-lg border border-cyan-800/20">
                      Custody: {report.dropOffLocation}
                    </div>
                  )}

                  {report.resolutionNotes && (
                    <div className="text-[11px] text-emerald-300 bg-emerald-950/30 px-2.5 py-1.5 rounded-lg border border-emerald-800/20">
                      Resolution Log: {report.resolutionNotes}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectReport(report)}
                      title="View Details"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onPrintSlip(report)}
                      title="Print Campus Claim Verification Slip"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id, report.title)}
                      disabled={deletingId === report.id}
                      title="Delete Report"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!isResolved && (
                    <button
                      onClick={() => onInitiateResolution(report)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>Resolve Case</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
