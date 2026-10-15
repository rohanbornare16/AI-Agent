import { ItemReport, MatchEvaluation, AgentIntent, AgentWorkflowStage } from '../types';

export interface AgentApiResponse {
  success: boolean;
  text: string;
  intent: AgentIntent;
  stage: AgentWorkflowStage;
  matchedReports?: ItemReport[];
  potentialMatches?: {
    foundItem: ItemReport;
    matchScore: number;
    reason: string;
  }[];
  isAiGenerated?: boolean;
}

export async function fetchReports(params?: {
  type?: 'lost' | 'found';
  category?: string;
  status?: string;
  search?: string;
}): Promise<ItemReport[]> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.category) query.set('category', params.category);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`/api/reports?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reports from server');
  const json = await res.json();
  return json.data || [];
}

export async function createReport(data: Partial<ItemReport>): Promise<ItemReport> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to submit report');
  }
  return json.data;
}

export async function updateReport(id: string, data: Partial<ItemReport>): Promise<ItemReport> {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to update report');
  }
  return json.data;
}

export async function deleteReport(id: string): Promise<void> {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete report');
  }
}

export async function resolveReport(
  id: string,
  resolutionNotes: string,
  matchedItemId?: string,
  verifiedBy?: string
): Promise<ItemReport> {
  const res = await fetch(`/api/reports/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolutionNotes, matchedItemId, verifiedBy }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to resolve case');
  }
  return json.data;
}

export async function resetDatabase(): Promise<ItemReport[]> {
  const res = await fetch('/api/seed/reset', {
    method: 'POST',
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to reset demonstration database');
  }
  return json.data;
}

export async function sendAgentMessage(
  message: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<AgentApiResponse> {
  const res = await fetch('/api/gemini/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationHistory }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'AI agent communication error');
  }
  return json;
}

export async function getAiMatchExplanation(
  lostItemId: string,
  foundItemId: string
): Promise<{ evaluation: MatchEvaluation; aiExplanation: string; isAiGenerated: boolean }> {
  const res = await fetch('/api/gemini/match-explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lostItemId, foundItemId }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to generate AI match explanation');
  }
  return {
    evaluation: json.evaluation,
    aiExplanation: json.aiExplanation,
    isAiGenerated: json.isAiGenerated,
  };
}
