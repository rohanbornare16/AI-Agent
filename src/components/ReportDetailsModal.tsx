import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Tag,
  Palette,
  ShieldAlert,
  ShieldCheck,
  Building,
  User,
  GitCompare,
  Printer,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ItemReport } from '../types';

interface ReportDetailsModalProps {
  report: ItemReport | null;
  onClose: () => void;
  onFindMatches: (report: ItemReport) => void;
  onInitiateResolution: (report: ItemReport) => void;
  onPrintSlip: (report: ItemReport) => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  onClose,
  onFindMatches,
  onInitiateResolution,
  onPrintSlip,
}) => {
  if (!report) return null;

  const [showSecretMarks, setShowSecretMarks] = useState(false);
  const isLost = report.type === 'lost';
  const isResolved = report.status === 'resolved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isResolved
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : isLost
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {isResolved ? 'CASE RESOLVED' : isLost ? 'LOST REPORT' : 'FOUND REPORT'}
            </span>

            {report.isDemo && (
              <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                DEMO TEST RECORD
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white">{report.title}</h2>
          <p className="text-xs text-slate-400 font-mono">Reference ID: #{report.id}</p>
        </div>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Category</span>
            <span className="font-semibold text-slate-200 capitalize">{report.category.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Color & Brand</span>
            <span className="font-semibold text-slate-200">
              {report.color} {report.brand ? `• ${report.brand}` : ''}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Date</span>
            <span className="font-semibold text-slate-200">{report.date}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Campus Location</span>
            <span className="font-semibold text-slate-200">{report.location}</span>
          </div>
        </div>

        {/* Public Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Public Item Description
          </label>
          <p className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {report.description || 'No additional public description provided.'}
          </p>
        </div>

        {/* Drop off custody point */}
        {report.dropOffLocation && (
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/30 text-xs text-cyan-200 flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="font-semibold">Held at Physical Drop-off Point:</span> {report.dropOffLocation}
            </div>
          </div>
        )}

        {/* Confidential Verification Question (Hidden by default to protect privacy) */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Confidential Verification Markers</span>
            </span>
            <button
              onClick={() => setShowSecretMarks(!showSecretMarks)}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline"
            >
              {showSecretMarks ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showSecretMarks ? 'Hide Details' : 'Authorized Staff Reveal'}</span>
            </button>
          </div>

          {showSecretMarks ? (
            <p className="text-xs text-amber-200 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40 font-mono">
              {report.identifyingMarks || 'No secret identifying markers recorded.'}
            </p>
          ) : (
            <p className="text-[11px] text-amber-300/80 italic">
              Encrypted for claimant security. Hidden from public display until authorized campus staff verification.
            </p>
          )}
        </div>

        {/* Submitter Masked Info */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>
            Reported by: <strong className="text-slate-200">{report.contactName}</strong> ({report.contactRole})
          </span>
          <span className="text-[11px] text-slate-400">Created: {new Date(report.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Resolution Notes if Resolved */}
        {report.resolutionNotes && (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200 space-y-1">
            <span className="font-bold flex items-center gap-1 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Handover Resolution Record</span>
            </span>
            <p>{report.resolutionNotes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => onPrintSlip(report)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Claim Slip</span>
          </button>

          <div className="flex items-center gap-2">
            {isLost && !isResolved && (
              <button
                onClick={() => {
                  onClose();
                  onFindMatches(report);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1.5"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Search Matches</span>
              </button>
            )}

            {!isResolved && (
              <button
                onClick={() => {
                  onClose();
                  onInitiateResolution(report);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-700/20 transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Resolve Case</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
