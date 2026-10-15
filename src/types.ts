export type ItemCategory =
  | 'electronics'
  | 'id_cards'
  | 'wallets_purses'
  | 'bags_backpacks'
  | 'books_stationery'
  | 'keys'
  | 'audio_wearables'
  | 'bottles_containers'
  | 'clothing_accessories'
  | 'other';

export type ReportType = 'lost' | 'found';

export type ReportStatus = 'active' | 'potential_match' | 'claim_in_progress' | 'resolved';

export type ContactRole = 'student' | 'faculty' | 'staff' | 'visitor';

export interface ItemReport {
  id: string;
  type: ReportType;
  title: string;
  category: ItemCategory;
  color: string;
  brand: string;
  location: string;
  date: string; // YYYY-MM-DD
  description: string;
  identifyingMarks: string; // Kept private for verification
  imageUri?: string;
  contactName: string;
  contactRole: ContactRole;
  contactEmail?: string;
  contactPhone?: string;
  status: ReportStatus;
  isDemo: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  matchedWithId?: string;
  dropOffLocation?: string; // Where the found item is physically stored (e.g., Campus Security Desk)
}

export interface MatchScoreBreakdown {
  categoryScore: number;     // max 30
  nameDescScore: number;     // max 30
  colorScore: number;        // max 15
  locationScore: number;     // max 15
  dateScore: number;         // max 10
  totalScore: number;        // 0 - 100
}

export interface MatchEvaluation {
  lostItem: ItemReport;
  foundItem: ItemReport;
  score: MatchScoreBreakdown;
  matchingAttributes: string[];
  mismatchingAttributes: string[];
  confidence: 'High' | 'Moderate' | 'Low';
  label: string;
  summary: string;
  recommendedAction: string;
  aiExplanation?: string;
}

export type AgentWorkflowStage =
  | 'INTENT_DETECTION'
  | 'INFORMATION_GATHERING'
  | 'RECORD_SEARCH'
  | 'MATCH_EVALUATION'
  | 'RESPONSE_GENERATION'
  | 'NEXT_ACTION';

export type AgentIntent =
  | 'REPORT_LOST'
  | 'REPORT_FOUND'
  | 'SEARCH_ITEMS'
  | 'FIND_MATCH'
  | 'CHECK_REPORT'
  | 'RESOLVE_CASE'
  | 'GENERAL_HELP';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intent?: AgentIntent;
  stage?: AgentWorkflowStage;
  extractedEntities?: {
    item?: string;
    category?: ItemCategory;
    color?: string;
    location?: string;
    date?: string;
    brand?: string;
  };
  matchedReports?: ItemReport[];
  potentialMatches?: {
    foundItem: ItemReport;
    matchScore: number;
    reason: string;
  }[];
  suggestedActions?: {
    label: string;
    action: string;
    payload?: any;
  }[];
  isThinking?: boolean;
  isAiGenerated?: boolean;
}

export interface CampusLocation {
  id: string;
  name: string;
  zone: 'Academic' | 'Services' | 'Recreation' | 'Outdoor';
  commonItems: string[];
}
