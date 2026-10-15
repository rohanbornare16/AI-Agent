import React from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  Building,
  Calendar,
  MapPin,
  Tag,
  User,
  QrCode,
} from 'lucide-react';
import { ItemReport } from '../types';

interface ClaimSlipModalProps {
  report: ItemReport | null;
  onClose: () => void;
}

export const ClaimSlipModal: React.FC<ClaimSlipModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-cyan-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 block">
              CAMPUS SECURITY PROPERTY REPOSITORY
            </span>
            <h2 className="text-lg font-bold text-white">Official Claim Verification Slip</h2>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Slip</span>
          </button>
        </div>

        {/* Printable Slip Body */}
        <div className="p-6 rounded-2xl bg-white text-slate-900 space-y-4 shadow-inner font-sans border-2 border-dashed border-slate-300">
          {/* Slip Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-3">
            <div>
              <p className="font-extrabold text-xs uppercase text-indigo-950 tracking-wider">
                COLLEGE CAMPUS LOST & FOUND SERVICES
              </p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{report.title}</h3>
              <p className="text-[11px] text-slate-600">Case Record ID: #{report.id}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center">
              <QrCode className="w-8 h-8 text-slate-800" />
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Type & Category</span>
              <p className="font-bold text-slate-800 capitalize">
                {report.type} • {report.category.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Reported Date</span>
              <p className="font-bold text-slate-800">{report.date}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Campus Location</span>
              <p className="font-bold text-slate-800">{report.location}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Primary Color / Brand</span>
              <p className="font-bold text-slate-800">
                {report.color} {report.brand ? `(${report.brand})` : ''}
              </p>
            </div>
          </div>

          {/* Custody Instructions */}
          <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
            <span className="font-bold block flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-indigo-700" />
              <span>Custody Desk: {report.dropOffLocation || 'Central Security Desk (Main Gate)'}</span>
            </span>
            <p className="text-[11px] text-indigo-800">
              Present this slip along with your physical Student/Staff ID Card at Room 102. You will be required to answer confidential verification questions before handover.
            </p>
          </div>

          {/* Signatures Area */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[11px] text-slate-500">
            <div>
              <div className="h-6 border-b border-slate-300" />
              <p className="mt-1 font-semibold">Claimant Signature</p>
            </div>
            <div>
              <div className="h-6 border-b border-slate-300" />
              <p className="mt-1 font-semibold">Security Officer Signature</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Status: <strong className="text-cyan-300 uppercase">{report.status}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Close Slip
          </button>
        </div>
      </div>
    </div>
  );
};
