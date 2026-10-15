import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { ItemReport, AgentIntent, AgentWorkflowStage } from './src/types';
import { INITIAL_DEMO_REPORTS } from './src/utils/demoData';
import { evaluateItemMatch, findMatchesForLostItem } from './src/utils/matchingEngine';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// In-memory reports storage with demo dataset initialization
let reportsDatabase: ItemReport[] = JSON.parse(JSON.stringify(INITIAL_DEMO_REPORTS));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// GET /api/reports - Fetch reports with optional filtering
app.get('/api/reports', (req: Request, res: Response) => {
  const { type, category, status, search } = req.query;
  let results = [...reportsDatabase];

  if (type && typeof type === 'string') {
    results = results.filter((r) => r.type === type);
  }
  if (category && typeof category === 'string') {
    results = results.filter((r) => r.category === category);
  }
  if (status && typeof status === 'string') {
    results = results.filter((r) => r.status === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.color.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: results.length, data: results });
});

// GET /api/reports/:id - Fetch single report
app.get('/api/reports/:id', (req: Request, res: Response) => {
  const item = reportsDatabase.find((r) => r.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }
  res.json({ success: true, data: item });
});

// POST /api/reports - Create new report with validation
app.post('/api/reports', (req: Request, res: Response) => {
  const {
    type,
    title,
    category,
    color,
    brand,
    location,
    date,
    description,
    identifyingMarks,
    imageUri,
    contactName,
    contactRole,
    contactEmail,
    contactPhone,
    dropOffLocation,
  } = req.body;

  // Strict required fields validation
  if (!type || !title || !category || !location || !date) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: Type, title, category, location, and date are required fields.',
    });
  }

  const newReport: ItemReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: type === 'found' ? 'found' : 'lost',
    title: String(title).trim(),
    category: category,
    color: color ? String(color).trim() : 'Unknown',
    brand: brand ? String(brand).trim() : '',
    location: String(location).trim(),
    date: String(date).trim(),
    description: description ? String(description).trim() : '',
    identifyingMarks: identifyingMarks ? String(identifyingMarks).trim() : '',
    imageUri: imageUri || undefined,
    contactName: contactName ? String(contactName).trim() : 'Campus Member',
    contactRole: contactRole || 'student',
    contactEmail: contactEmail || undefined,
    contactPhone: contactPhone || undefined,
    status: 'active',
    isDemo: false,
    createdAt: new Date().toISOString(),
    dropOffLocation: dropOffLocation || (type === 'found' ? 'Central Security Desk' : undefined),
  };

  reportsDatabase.unshift(newReport);
  res.status(201).json({ success: true, data: newReport, message: 'Report submitted successfully!' });
});

// PUT /api/reports/:id - Update report
app.put('/api/reports/:id', (req: Request, res: Response) => {
  const index = reportsDatabase.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  const existing = reportsDatabase[index];
  const updated: ItemReport = {
    ...existing,
    ...req.body,
    id: existing.id, // prevent overwriting ID
    createdAt: existing.createdAt,
  };

  reportsDatabase[index] = updated;
  res.json({ success: true, data: updated, message: 'Report updated successfully.' });
});

// DELETE /api/reports/:id - Delete report
app.delete('/api/reports/:id', (req: Request, res: Response) => {
  const index = reportsDatabase.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  const removed = reportsDatabase.splice(index, 1)[0];
  res.json({ success: true, message: `Report "${removed.title}" deleted.`, id: req.params.id });
});

// POST /api/reports/:id/resolve - Official Case Resolution Workflow
app.post('/api/reports/:id/resolve', (req: Request, res: Response) => {
  const { resolutionNotes, matchedItemId, verifiedBy } = req.body;
  const index = reportsDatabase.findIndex((r) => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  const item = reportsDatabase[index];
  const timestamp = new Date().toISOString();

  item.status = 'resolved';
  item.resolvedAt = timestamp;
  item.resolutionNotes = resolutionNotes || `Case verified & closed by ${verifiedBy || 'Campus Administrator'}`;
  if (matchedItemId) {
    item.matchedWithId = matchedItemId;

    // Also mark the counterpart item as resolved
    const counterIndex = reportsDatabase.findIndex((r) => r.id === matchedItemId);
    if (counterIndex !== -1) {
      reportsDatabase[counterIndex].status = 'resolved';
      reportsDatabase[counterIndex].resolvedAt = timestamp;
      reportsDatabase[counterIndex].matchedWithId = item.id;
      reportsDatabase[counterIndex].resolutionNotes = `Matched and resolved with ${item.title} (${item.id})`;
    }
  }

  res.json({
    success: true,
    data: item,
    message: 'Case successfully resolved and official handover logged.',
  });
});

// POST /api/seed/reset - Reset to standard demonstration dataset
app.post('/api/seed/reset', (_req: Request, res: Response) => {
  reportsDatabase = JSON.parse(JSON.stringify(INITIAL_DEMO_REPORTS));
  res.json({
    success: true,
    message: 'Database reset to default college demonstration records.',
    count: reportsDatabase.length,
    data: reportsDatabase,
  });
});

// ==========================================
// AI AGENT & GEMINI INTEGRATION
// ==========================================

// Helper to determine intent deterministically
function detectIntentLocal(message: string): { intent: AgentIntent; stage: AgentWorkflowStage } {
  const lower = message.toLowerCase();
  if (lower.includes('lost') || lower.includes('misplaced') || lower.includes('missing') || lower.includes('forgot')) {
    return { intent: 'REPORT_LOST', stage: 'INTENT_DETECTION' };
  }
  if (lower.includes('found') || lower.includes('picked up') || lower.includes('turned in')) {
    return { intent: 'REPORT_FOUND', stage: 'INTENT_DETECTION' };
  }
  if (lower.includes('match') || lower.includes('compare') || lower.includes('pair')) {
    return { intent: 'FIND_MATCH', stage: 'MATCH_EVALUATION' };
  }
  if (lower.includes('search') || lower.includes('look for') || lower.includes('where is')) {
    return { intent: 'SEARCH_ITEMS', stage: 'RECORD_SEARCH' };
  }
  if (lower.includes('resolve') || lower.includes('claim') || lower.includes('handover') || lower.includes('verify')) {
    return { intent: 'RESOLVE_CASE', stage: 'NEXT_ACTION' };
  }
  if (lower.includes('status') || lower.includes('check') || lower.includes('my report')) {
    return { intent: 'CHECK_REPORT', stage: 'RECORD_SEARCH' };
  }
  return { intent: 'GENERAL_HELP', stage: 'RESPONSE_GENERATION' };
}

// POST /api/gemini/agent - Conversational campus assistant with real reasoning
app.post('/api/gemini/agent', async (req: Request, res: Response) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const { intent, stage } = detectIntentLocal(message);

  // Search actual database records
  const activeLost = reportsDatabase.filter((r) => r.type === 'lost' && r.status !== 'resolved');
  const activeFound = reportsDatabase.filter((r) => r.type === 'found' && r.status !== 'resolved');

  // Perform deterministic keyword matching on database
  const keywords = message.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const relevantFound = activeFound.filter((item) => {
    const text = `${item.title} ${item.description} ${item.location} ${item.color} ${item.brand}`.toLowerCase();
    return keywords.some((k) => text.includes(k));
  });

  const relevantLost = activeLost.filter((item) => {
    const text = `${item.title} ${item.description} ${item.location} ${item.color} ${item.brand}`.toLowerCase();
    return keywords.some((k) => text.includes(k));
  });

  // Calculate potential matches if user is describing an item
  let potentialMatchesList: { foundItem: ItemReport; matchScore: number; reason: string }[] = [];
  if (intent === 'REPORT_LOST' || intent === 'SEARCH_ITEMS' || intent === 'FIND_MATCH') {
    // Construct a pseudo lost item to evaluate against found items
    const dummyLost: ItemReport = {
      id: 'temp-query',
      type: 'lost',
      title: message.slice(0, 50),
      category: 'other',
      color: message.toLowerCase().includes('black') ? 'Black' : message.toLowerCase().includes('blue') ? 'Blue' : 'Unknown',
      brand: message.toLowerCase().includes('tommy') ? 'Tommy Hilfiger' : message.toLowerCase().includes('milton') ? 'Milton' : '',
      location: message.toLowerCase().includes('library') ? 'Central Library' : message.toLowerCase().includes('canteen') ? 'Main Canteen' : 'Campus',
      date: new Date().toISOString().split('T')[0],
      description: message,
      identifyingMarks: '',
      contactName: 'User',
      contactRole: 'student',
      status: 'active',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    // Auto-detect category
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('wallet') || lowerMsg.includes('purse')) dummyLost.category = 'wallets_purses';
    else if (lowerMsg.includes('bottle') || lowerMsg.includes('flask')) dummyLost.category = 'bottles_containers';
    else if (lowerMsg.includes('id') || lowerMsg.includes('card')) dummyLost.category = 'id_cards';
    else if (lowerMsg.includes('phone') || lowerMsg.includes('earphone') || lowerMsg.includes('airpod')) dummyLost.category = 'audio_wearables';
    else if (lowerMsg.includes('laptop') || lowerMsg.includes('macbook')) dummyLost.category = 'electronics';
    else if (lowerMsg.includes('book') || lowerMsg.includes('calculator') || lowerMsg.includes('notebook')) dummyLost.category = 'books_stationery';
    else if (lowerMsg.includes('key')) dummyLost.category = 'keys';
    else if (lowerMsg.includes('bag') || lowerMsg.includes('backpack')) dummyLost.category = 'bags_backpacks';

    const ranked = findMatchesForLostItem(dummyLost, activeFound, 45);
    potentialMatchesList = ranked.slice(0, 3).map((m) => ({
      foundItem: m.foundItem,
      matchScore: m.score.totalScore,
      reason: m.summary,
    }));
  }

  // Use Gemini API if available
  if (ai) {
    try {
      const dbSummary = reportsDatabase.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        category: r.category,
        color: r.color,
        brand: r.brand,
        location: r.location,
        date: r.date,
        status: r.status,
        dropOffLocation: r.dropOffLocation,
        isDemo: r.isDemo,
      }));

      const systemInstruction = `You are the "Lost & Found Assistant" smart AI agent for a college campus (CIE AI Agent Design Challenge).
Your primary role is to assist students, teachers, and staff with lost and found items with extreme honesty, professional empathy, and campus safety.

Current Database State:
${JSON.stringify(dbSummary, null, 2)}

Strict Operational Rules:
1. NEVER claim an item was found unless an exact or strong matching record exists in the Current Database State.
2. If records exist (e.g. Black wallet found at Central Library, Blue water bottle at Classroom 204, College ID at Main Canteen), state clearly that a potential match is registered, provide the estimated match score, location, and instruction to verify at Campus Security.
3. If no matching record exists (e.g. Silver MacBook Pro, or other non-existent item), clearly and honestly state: "No suitable match is available in the current records. You can save your report and check again later."
4. If essential details are missing (e.g. approximate date, color, location, brand), politely ask targeted follow-up questions to gather necessary information.
5. Emphasize that match percentages are estimates, never proof of ownership, and physical verification with College ID is required at the security desk before handover.
6. Keep the tone friendly, helpful, concise, and academic-professional.`;

      const prompt = `User Message: "${message}"
Conversation History: ${JSON.stringify(conversationHistory.slice(-4))}

Analyze the request, identify the intent (${intent}), check the records, and provide an empathetic, accurate, and actionable response.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2, // low temperature for high accuracy & reliability
        },
      });

      const responseText = response.text || 'I checked the campus database for your request.';

      return res.json({
        success: true,
        text: responseText,
        intent,
        stage: potentialMatchesList.length > 0 ? 'MATCH_EVALUATION' : stage,
        matchedReports: relevantFound.length > 0 ? relevantFound : relevantLost,
        potentialMatches: potentialMatchesList,
        isAiGenerated: true,
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local reasoning agent:', err?.message || err);
      // Fall through to deterministic response generator
    }
  }

  // Deterministic Fallback Response Generator (ensures 100% offline & presentation reliability)
  let fallbackText = '';
  let fallbackStage: AgentWorkflowStage = stage;

  if (intent === 'REPORT_LOST') {
    if (potentialMatchesList.length > 0) {
      const top = potentialMatchesList[0];
      fallbackText = `I'm sorry you lost your item. I immediately cross-referenced our campus database and identified a potential match (${top.matchScore}% match score):\n\n• **${top.foundItem.title}** found at **${top.foundItem.location}** on **${top.foundItem.date}**.\n\nIt is currently securely held at **${top.foundItem.dropOffLocation || 'Central Security Desk'}**. Would you like to proceed with the verification procedure, or formally file your lost report?`;
      fallbackStage = 'MATCH_EVALUATION';
    } else {
      fallbackText = `I'm sorry you lost your item. I checked our current database, and **no suitable match is available in the current records yet**. You can save your official report in the "Report Lost" tab so the agent alerts you the moment someone turns it in. Do you remember approximately when you last had it?`;
      fallbackStage = 'INFORMATION_GATHERING';
    }
  } else if (intent === 'REPORT_FOUND') {
    fallbackText = `Thank you for turning in a found belonging! To protect student privacy, please do not disclose confidential verification markers (like lockscreen passcodes or wallet contents). You can complete the "Report Found" form and deposit the physical item at the nearest campus desk (e.g., Central Security Desk or Library Counter).`;
    fallbackStage = 'NEXT_ACTION';
  } else if (intent === 'FIND_MATCH' || intent === 'SEARCH_ITEMS') {
    if (potentialMatchesList.length > 0) {
      fallbackText = `I found ${potentialMatchesList.length} potential record(s) matching your description in the campus database. Remember that match percentages are probabilistic estimates, not definitive proof of ownership.`;
      fallbackStage = 'MATCH_EVALUATION';
    } else {
      fallbackText = `No suitable match is available in the current records. You can save your report and check again later, or broaden your search criteria.`;
      fallbackStage = 'RECORD_SEARCH';
    }
  } else if (intent === 'RESOLVE_CASE') {
    fallbackText = `To officially resolve a case, the claimant must visit the designated drop-off station (e.g. Central Security Desk) with their College Student/Staff ID. The officer will ask confidential verification questions before logging the handover.`;
    fallbackStage = 'NEXT_ACTION';
  } else {
    fallbackText = `Welcome to the Campus Lost & Found AI Assistant! I can help you report a lost belonging, register a found item, evaluate potential matches with transparent weighted scoring, and guide you through the official campus verification process. What item are you inquiring about today?`;
    fallbackStage = 'RESPONSE_GENERATION';
  }

  return res.json({
    success: true,
    text: fallbackText,
    intent,
    stage: fallbackStage,
    matchedReports: relevantFound.length > 0 ? relevantFound : relevantLost,
    potentialMatches: potentialMatchesList,
    isAiGenerated: false,
  });
});

// POST /api/gemini/match-explain - AI Deep Reasoning on specific match
app.post('/api/gemini/match-explain', async (req: Request, res: Response) => {
  const { lostItemId, foundItemId } = req.body;

  const lost = reportsDatabase.find((r) => r.id === lostItemId);
  const found = reportsDatabase.find((r) => r.id === foundItemId);

  if (!lost || !found) {
    return res.status(404).json({ success: false, message: 'Reports not found' });
  }

  const evaluation = evaluateItemMatch(lost, found);

  if (ai) {
    try {
      const prompt = `Compare these two campus lost-and-found reports:
Lost Report:
- Title: ${lost.title}
- Category: ${lost.category}
- Color: ${lost.color}
- Brand: ${lost.brand}
- Location: ${lost.location}
- Date Lost: ${lost.date}
- Description: ${lost.description}
- Identifying Marks: ${lost.identifyingMarks}

Found Report:
- Title: ${found.title}
- Category: ${found.category}
- Color: ${found.color}
- Brand: ${found.brand}
- Location: ${found.location}
- Date Found: ${found.date}
- Description: ${found.description}
- Storage: ${found.dropOffLocation || 'Security Desk'}

Algorithm Score: ${evaluation.score.totalScore}%
Breakdown: Category ${evaluation.score.categoryScore}/30, Name/Desc ${evaluation.score.nameDescScore}/30, Color ${evaluation.score.colorScore}/15, Location ${evaluation.score.locationScore}/15, Date ${evaluation.score.dateScore}/10.

Provide a concise, professional analysis:
1. Why this is or isn't a likely match.
2. 2-3 specific non-public questions campus security should ask the claimant to verify genuine ownership without revealing item contents.
3. Recommended next step for the student.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a senior campus security and AI verification analyst. Write clearly, practically, and objectively.',
        },
      });

      return res.json({
        success: true,
        evaluation,
        aiExplanation: response.text,
        isAiGenerated: true,
      });
    } catch (err: any) {
      console.warn('Gemini match explanation failed:', err?.message || err);
    }
  }

  // Deterministic explanation fallback
  const fallbackExplanation = `### Algorithmic Evaluation Summary
- **Overall Confidence**: ${evaluation.label} (${evaluation.score.totalScore}%)
- **Key Corroborating Factors**: ${evaluation.matchingAttributes.join('; ')}
- **Discrepancies / Unknowns**: ${evaluation.mismatchingAttributes.length > 0 ? evaluation.mismatchingAttributes.join('; ') : 'None identified'}

### Recommended Verification Protocol
1. Verify Student/Staff Identity Card matching the claimant.
2. Ask claimant to specify unique unmentioned markers (e.g. stickers, specific cards, contents).
3. Record handover signature in the campus property log book.`;

  return res.json({
    success: true,
    evaluation,
    aiExplanation: fallbackExplanation,
    isAiGenerated: false,
  });
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC
// ==========================================
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lost & Found Assistant server running on port ${PORT}`);
  });
}

startServer();
