import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  UserCheck,
  Building,
} from 'lucide-react';
import { ItemReport } from '../types';

interface ResolutionModalProps {
  report: ItemReport | null;
  matchingReport?: ItemReport | null;
  onClose: () => void;
  onConfirmResolve: (
    id: string,
    notes: string,
    matchedId?: string,
    verifiedBy?: string
  ) => Promise<void>;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  report,
  matchingReport,
  onClose,
  onConfirmResolve,
}) => {
  if (!report) return null;

  const [verifiedBy, setVerifiedBy] = useState('Security Officer Victor (Admin Block)');
  const [idConfirmed, setIdConfirmed] = useState(false);
  const [verificationPassed, setVerificationPassed] = useState(false);
  const [notes, setNotes] = useState(
    matchingReport
      ? `Verified ownership via secret test questions against ${matchingReport.title} (#${matchingReport.id}). Student ID checked and logged in property registry.`
      : 'Claimant identity verified with official College ID card. Item handed over successfully.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idConfirmed) {
      setError('You must confirm that physical College Student/Staff ID was inspected.');
      return;
    }
    if (!verificationPassed) {
      setError('You must confirm that ownership questions (secret marks) were satisfactorily answered.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onConfirmResolve(
        report.id,
        notes,
        matchingReport ? matchingReport.id : undefined,
        verifiedBy
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Resolution failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Campus Handover Protocol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Resolve Case & Authorize Handover
          </h2>
          <p className="text-xs text-slate-400">
            Step 5 of the Campus Retrieval Workflow. Mark item returned only after official verification.
          </p>
        </div>

        {/* Selected Item Summary */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300">Target Item: {report.title}</span>
            <span className="text-slate-400">ID: {report.id}</span>
          </div>
          <p className="text-slate-400">{report.description}</p>
          {matchingReport && (
            <div className="pt-2 border-t border-slate-800 text-emerald-300">
              Matched counterpart: <strong>{matchingReport.title}</strong> (#{matchingReport.id}) will also be marked as resolved simultaneously.
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Authorizing Campus Official
            </label>
            <input
              type="text"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Verification Checkboxes */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={idConfirmed}
                onChange={(e) => setIdConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span className="text-slate-300">
                <strong>Physical Identity Check:</strong> I have physically inspected the claimant's official College Student ID / Staff badge.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={verificationPassed}
                onChange={(e) => setVerificationPassed(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span className="text-slate-300">
                <strong>Secret Ownership Question Check:</strong> Claimant accurately identified confidential verification markers (e.g. stickers, wallet contents, engravings) without viewing the item beforehand.
              </span>
            </label>
          </div>

          {/* Resolution Log Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Audit Handover Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-700/20 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Finalizing Handover...' : 'Confirm Official Return & Close Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
