import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { ReportLostForm } from './components/ReportLostForm';
import { ReportFoundForm } from './components/ReportFoundForm';
import { MatchingEngineView } from './components/MatchingEngineView';
import { AiAssistantView } from './components/AiAssistantView';
import { ReportsManagerView } from './components/ReportsManagerView';
import { CieTestHubView } from './components/CieTestHubView';
import { ReportDetailsModal } from './components/ReportDetailsModal';
import { ResolutionModal } from './components/ResolutionModal';
import { AiExplanationModal } from './components/AiExplanationModal';
import { ClaimSlipModal } from './components/ClaimSlipModal';
import { ItemReport, MatchEvaluation } from './types';
import {
  fetchReports,
  createReport,
  deleteReport,
  resolveReport,
  resetDatabase,
} from './services/api';
import { scanAllPotentialMatches } from './utils/matchingEngine';
import { INITIAL_DEMO_REPORTS } from './utils/demoData';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [reports, setReports] = useState<ItemReport[]>(INITIAL_DEMO_REPORTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals state
  const [detailsReport, setDetailsReport] = useState<ItemReport | null>(null);
  const [explanationMatch, setExplanationMatch] = useState<MatchEvaluation | null>(null);
  const [resolutionTarget, setResolutionTarget] = useState<{
    report: ItemReport;
    matchingReport?: ItemReport | null;
  } | null>(null);
  const [slipReport, setSlipReport] = useState<ItemReport | null>(null);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Load initial reports from server
  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetchReports();
      if (data && data.length > 0) {
        setReports(data);
      } else {
        setReports(INITIAL_DEMO_REPORTS);
      }
    } catch (err: any) {
      console.warn('Backend reports fetch failed, using local demo data:', err?.message || err);
      setReports(INITIAL_DEMO_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Compute potential matches dynamically
  const potentialMatches = useMemo(() => {
    return scanAllPotentialMatches(reports, 45);
  }, [reports]);

  // Compute quick stats
  const stats = useMemo(() => {
    const totalLost = reports.filter((r) => r.type === 'lost' && r.status !== 'resolved').length;
    const totalFound = reports.filter((r) => r.type === 'found' && r.status !== 'resolved').length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    return {
      totalLost,
      totalFound,
      potentialMatches: potentialMatches.length,
      resolved,
    };
  }, [reports, potentialMatches]);

  // Handlers
  const handleCreateReport = async (reportData: Partial<ItemReport>): Promise<ItemReport> => {
    try {
      const created = await createReport(reportData);
      setReports((prev) => [created, ...prev]);
      showToast(`Report for "${created.title}" successfully submitted!`);
      return created;
    } catch (err: any) {
      // Local fallback in case server was restarting
      const localCreated: ItemReport = {
        id: `local-${Date.now()}`,
        type: reportData.type || 'lost',
        title: reportData.title || 'Untitled',
        category: reportData.category || 'other',
        color: reportData.color || 'Unknown',
        brand: reportData.brand || '',
        location: reportData.location || 'Campus',
        date: reportData.date || new Date().toISOString().split('T')[0],
        description: reportData.description || '',
        identifyingMarks: reportData.identifyingMarks || '',
        contactName: reportData.contactName || 'Student',
        contactRole: reportData.contactRole || 'student',
        status: 'active',
        isDemo: false,
        createdAt: new Date().toISOString(),
        dropOffLocation: reportData.dropOffLocation,
      };
      setReports((prev) => [localCreated, ...prev]);
      showToast(`Report registered locally.`);
      return localCreated;
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      showToast('Report deleted from database.');
    } catch (err: any) {
      setReports((prev) => prev.filter((r) => r.id !== id));
      showToast('Report removed locally.');
    }
  };

  const handleConfirmResolve = async (
    id: string,
    notes: string,
    matchedId?: string,
    verifiedBy?: string
  ) => {
    try {
      await resolveReport(id, notes, matchedId, verifiedBy);
      await loadReports();
      showToast('Case verified and officially marked resolved!');
    } catch (err: any) {
      // Local state fallback update
      setReports((prev) =>
        prev.map((r) => {
          if (r.id === id || (matchedId && r.id === matchedId)) {
            return {
              ...r,
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              resolutionNotes: notes,
            };
          }
          return r;
        })
      );
      showToast('Case resolved and logged locally.');
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const resetData = await resetDatabase();
      setReports(resetData);
      showToast('Database successfully reset to default demonstration state.');
    } catch (err: any) {
      setReports(JSON.parse(JSON.stringify(INITIAL_DEMO_REPORTS)));
      showToast('Reset to local default demonstration state.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-xs sm:text-sm animate-fadeIn">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="text-white font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            reports={reports}
            potentialMatches={potentialMatches}
            setActiveTab={setActiveTab}
            onSelectReport={(r) => setDetailsReport(r)}
            onOpenMatchDetails={(m) => setExplanationMatch(m)}
          />
        )}

        {activeTab === 'report-lost' && (
          <ReportLostForm
            onSubmit={handleCreateReport}
            onSuccessNavigate={() => setActiveTab('matches')}
          />
        )}

        {activeTab === 'report-found' && (
          <ReportFoundForm
            onSubmit={handleCreateReport}
            onSuccessNavigate={() => setActiveTab('matches')}
          />
        )}

        {activeTab === 'matches' && (
          <MatchingEngineView
            reports={reports}
            potentialMatches={potentialMatches}
            onOpenMatchDetails={(m) => setExplanationMatch(m)}
            onInitiateResolution={(lost, found) =>
              setResolutionTarget({ report: lost, matchingReport: found })
            }
          />
        )}

        {activeTab === 'chat' && (
          <AiAssistantView
            reports={reports}
            onNavigateToReport={(type) => setActiveTab(type === 'lost' ? 'report-lost' : 'report-found')}
            onNavigateToMatches={() => setActiveTab('matches')}
          />
        )}

        {activeTab === 'records' && (
          <ReportsManagerView
            reports={reports}
            onDeleteReport={handleDeleteReport}
            onSelectReport={(r) => setDetailsReport(r)}
            onInitiateResolution={(r) => setResolutionTarget({ report: r })}
            onPrintSlip={(r) => setSlipReport(r)}
          />
        )}

        {activeTab === 'cie-hub' && (
          <CieTestHubView
            reports={reports}
            potentialMatches={potentialMatches}
            onResetDemo={handleResetDemo}
            isResetting={isResetting}
            setActiveTab={setActiveTab}
            onOpenMatchDetails={(m) => setExplanationMatch(m)}
            onSelectReport={(r) => setDetailsReport(r)}
            onInitiateResolution={(lost, found) =>
              setResolutionTarget({ report: lost, matchingReport: found })
            }
          />
        )}
      </main>

      {/* Global Modals */}
      <ReportDetailsModal
        report={detailsReport}
        onClose={() => setDetailsReport(null)}
        onFindMatches={() => setActiveTab('matches')}
        onInitiateResolution={(r) => {
          setDetailsReport(null);
          setResolutionTarget({ report: r });
        }}
        onPrintSlip={(r) => {
          setDetailsReport(null);
          setSlipReport(r);
        }}
      />

      <AiExplanationModal
        match={explanationMatch}
        onClose={() => setExplanationMatch(null)}
        onInitiateResolution={(m) => {
          setExplanationMatch(null);
          setResolutionTarget({ report: m.lostItem, matchingReport: m.foundItem });
        }}
      />

      <ResolutionModal
        report={resolutionTarget?.report || null}
        matchingReport={resolutionTarget?.matchingReport || null}
        onClose={() => setResolutionTarget(null)}
        onConfirmResolve={handleConfirmResolve}
      />

      <ClaimSlipModal
        report={slipReport}
        onClose={() => setSlipReport(null)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
