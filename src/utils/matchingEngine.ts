import { ItemReport, MatchEvaluation, MatchScoreBreakdown } from '../types';

// Stop words to exclude during description keyword analysis
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about',
  'of', 'is', 'it', 'this', 'that', 'my', 'i', 'was', 'were', 'left', 'found', 'lost',
  'item', 'near', 'on', 'room', 'block', 'please', 'table', 'desk', 'campus', 'college'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function calculateJaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersectionCount = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionCount++;
    }
  }
  const unionCount = new Set([...tokensA, ...tokensB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

// Check location proximity in a campus environment
function evaluateLocationSimilarity(loc1: string, loc2: string): { score: number; label: string } {
  const l1 = loc1.toLowerCase().trim();
  const l2 = loc2.toLowerCase().trim();

  if (l1 === l2) {
    return { score: 15, label: `Exact Location Match (${loc1})` };
  }

  // Common library variations
  if ((l1.includes('library') && l2.includes('library'))) {
    return { score: 14, label: `Campus Zone Match (Library Complex: ${loc1} & ${loc2})` };
  }

  // Common classroom variations
  if (l1.includes('classroom') && l2.includes('classroom')) {
    if (l1.includes('204') && l2.includes('204')) {
      return { score: 15, label: `Exact Classroom Match (${loc1})` };
    }
    if (l1.includes('block a') && l2.includes('block a')) {
      return { score: 12, label: `Same Classroom Block (Block A)` };
    }
    return { score: 8, label: `Similar Zone (Academic Classrooms)` };
  }

  // Common cafeteria / canteen
  if ((l1.includes('canteen') || l1.includes('cafeteria')) && (l2.includes('canteen') || l2.includes('cafeteria'))) {
    return { score: 14, label: `Campus Canteen Match` };
  }

  // Science / computer labs
  if (l1.includes('lab') && l2.includes('lab')) {
    return { score: 12, label: `Lab Facilities Zone` };
  }

  // Outdoor / Sports
  if (l1.includes('sports') && l2.includes('sports')) {
    return { score: 13, label: `Sports Complex Zone` };
  }

  // Token overlap check
  const tok1 = tokenize(loc1);
  const tok2 = tokenize(loc2);
  const overlap = tok1.filter(t => tok2.includes(t));
  if (overlap.length > 0) {
    return { score: 9, label: `Shared Location Keyword: "${overlap.join(', ')}"` };
  }

  return { score: 2, label: `Different Locations (${loc1} vs ${loc2})` };
}

// Evaluate color similarity
function evaluateColorSimilarity(col1: string, col2: string): { score: number; isMatch: boolean; label: string } {
  const c1 = col1.toLowerCase().trim();
  const c2 = col2.toLowerCase().trim();

  if (c1 === c2) {
    return { score: 15, isMatch: true, label: `Identical Color (${col1})` };
  }

  if (c1.includes(c2) || c2.includes(c1) || (c1.includes('silver') && c2.includes('grey')) || (c1.includes('grey') && c2.includes('silver'))) {
    return { score: 12, isMatch: true, label: `Similar Color Tone (${col1} / ${col2})` };
  }

  if (c1 === 'multi-color' || c2 === 'multi-color') {
    return { score: 8, isMatch: true, label: `Multi-color / Pattern Variation` };
  }

  return { score: 0, isMatch: false, label: `Color Mismatch (${col1} vs ${col2})` };
}

// Evaluate date proximity
function evaluateDateProximity(lostDateStr: string, foundDateStr: string): { score: number; label: string } {
  try {
    const dLost = new Date(lostDateStr).getTime();
    const dFound = new Date(foundDateStr).getTime();
    const diffMs = dFound - dLost;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { score: 10, label: `Same-Day Event (Reported & Found on ${lostDateStr})` };
    } else if (diffDays === 1) {
      return { score: 9.5, label: `Found 1 Day Later (${foundDateStr})` };
    } else if (diffDays === 2) {
      return { score: 8.5, label: `Found 2 Days Later (${foundDateStr})` };
    } else if (diffDays >= 3 && diffDays <= 7) {
      return { score: 7, label: `Found within same week (${diffDays} days apart)` };
    } else if (diffDays > 7 && diffDays <= 14) {
      return { score: 5, label: `Found within 2 weeks (${diffDays} days apart)` };
    } else if (diffDays < 0 && diffDays >= -2) {
      // Small reporting lag or user estimated date
      return { score: 4, label: `Approximate Date Alignment (Found recorded slightly earlier)` };
    } else {
      return { score: 2, label: `Dates separated by ${Math.abs(diffDays)} days` };
    }
  } catch {
    return { score: 4, label: `Date comparison estimated` };
  }
}

/**
 * Evaluates the match between a Lost item report and a Found item report
 * Using transparent weighted criteria:
 * - Category similarity: 30%
 * - Item name & description similarity: 30%
 * - Color similarity: 15%
 * - Location similarity: 15%
 * - Date proximity: 10%
 */
export function evaluateItemMatch(lostItem: ItemReport, foundItem: ItemReport): MatchEvaluation {
  const matchingAttributes: string[] = [];
  const mismatchingAttributes: string[] = [];

  // 1. Category Similarity (max 30 pts)
  let categoryScore = 0;
  if (lostItem.category === foundItem.category) {
    categoryScore = 30;
    matchingAttributes.push(`Identical Category: ${lostItem.category.replace('_', ' ').toUpperCase()}`);
  } else {
    // Check related categories (e.g. electronics vs audio_wearables)
    const relatedPairs: [string, string][] = [
      ['electronics', 'audio_wearables'],
      ['wallets_purses', 'bags_backpacks'],
      ['books_stationery', 'other'],
    ];
    const isRelated = relatedPairs.some(
      ([a, b]) =>
        (lostItem.category === a && foundItem.category === b) ||
        (lostItem.category === b && foundItem.category === a)
    );
    if (isRelated) {
      categoryScore = 15;
      matchingAttributes.push(`Related Category overlap (${lostItem.category} & ${foundItem.category})`);
    } else {
      categoryScore = 0;
      mismatchingAttributes.push(`Different Categories (${lostItem.category} vs ${foundItem.category})`);
    }
  }

  // 2. Name & Description Similarity (max 30 pts)
  const lostTokens = [
    ...tokenize(lostItem.title),
    ...tokenize(lostItem.description),
    ...(lostItem.brand ? tokenize(lostItem.brand) : []),
  ];
  const foundTokens = [
    ...tokenize(foundItem.title),
    ...tokenize(foundItem.description),
    ...(foundItem.brand ? tokenize(foundItem.brand) : []),
  ];

  const jaccard = calculateJaccardSimilarity(lostTokens, foundTokens);
  let textScore = Math.min(25, Math.round(jaccard * 40));

  // Brand Match Bonus (up to 5 pts)
  if (lostItem.brand && foundItem.brand) {
    if (lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase()) {
      textScore += 5;
      matchingAttributes.push(`Exact Brand Match: ${lostItem.brand}`);
    } else if (
      lostItem.brand.toLowerCase().includes(foundItem.brand.toLowerCase()) ||
      foundItem.brand.toLowerCase().includes(lostItem.brand.toLowerCase())
    ) {
      textScore += 3;
      matchingAttributes.push(`Brand Variation Match: ${lostItem.brand}`);
    } else {
      mismatchingAttributes.push(`Brand difference (${lostItem.brand} vs ${foundItem.brand})`);
    }
  }

  // Key item title token overlap
  const titleOverlap = tokenize(lostItem.title).filter(t => tokenize(foundItem.title).includes(t));
  if (titleOverlap.length > 0) {
    matchingAttributes.push(`Title Keywords: "${titleOverlap.join(', ')}"`);
  } else if (textScore < 10) {
    mismatchingAttributes.push('Low keyword overlap in title and description');
  }

  const nameDescScore = Math.min(30, textScore);

  // 3. Color Similarity (max 15 pts)
  const colorEval = evaluateColorSimilarity(lostItem.color, foundItem.color);
  const colorScore = colorEval.score;
  if (colorEval.isMatch) {
    matchingAttributes.push(colorEval.label);
  } else {
    mismatchingAttributes.push(colorEval.label);
  }

  // 4. Location Similarity (max 15 pts)
  const locEval = evaluateLocationSimilarity(lostItem.location, foundItem.location);
  const locationScore = locEval.score;
  if (locEval.score >= 10) {
    matchingAttributes.push(locEval.label);
  } else {
    mismatchingAttributes.push(locEval.label);
  }

  // 5. Date Proximity (max 10 pts)
  const dateEval = evaluateDateProximity(lostItem.date, foundItem.date);
  const dateScore = dateEval.score;
  if (dateScore >= 7) {
    matchingAttributes.push(dateEval.label);
  } else {
    mismatchingAttributes.push(dateEval.label);
  }

  // Total Normalized Score (0 - 100)
  const rawTotal = categoryScore + nameDescScore + colorScore + locationScore + dateScore;
  const totalScore = Math.round(Math.min(100, Math.max(0, rawTotal)));

  const breakdown: MatchScoreBreakdown = {
    categoryScore,
    nameDescScore,
    colorScore,
    locationScore,
    dateScore,
    totalScore,
  };

  let confidence: 'High' | 'Moderate' | 'Low' = 'Low';
  let label = 'Low Potential Match';
  let recommendedAction = 'Low likelihood. Keep your report active and check back as new items arrive daily.';

  if (totalScore >= 75) {
    confidence = 'High';
    label = 'High Potential Match';
    recommendedAction = `Highly recommended: Visit ${foundItem.dropOffLocation || 'Campus Central Security Desk'} with your College ID to verify ownership and complete the return protocol.`;
  } else if (totalScore >= 50) {
    confidence = 'Moderate';
    label = 'Moderate Potential Match';
    recommendedAction = `Review detailed attributes. If details match your belongings, request an official inspection through Campus Security.`;
  }

  const summary = `Match Score: ${totalScore}% (Category: ${categoryScore}/30, Name/Desc: ${nameDescScore}/30, Color: ${colorScore}/15, Location: ${locationScore}/15, Date: ${dateScore}/10).`;

  return {
    lostItem,
    foundItem,
    score: breakdown,
    matchingAttributes,
    mismatchingAttributes,
    confidence,
    label,
    summary,
    recommendedAction,
  };
}

/**
 * Searches and ranks all found items against a specific lost item
 */
export function findMatchesForLostItem(
  lostItem: ItemReport,
  foundItems: ItemReport[],
  minimumThreshold = 40
): MatchEvaluation[] {
  const matches = foundItems
    .filter((f) => f.status !== 'resolved' && f.type === 'found')
    .map((found) => evaluateItemMatch(lostItem, found))
    .filter((evaluation) => evaluation.score.totalScore >= minimumThreshold)
    .sort((a, b) => b.score.totalScore - a.score.totalScore);

  return matches;
}

/**
 * Scans all active lost reports against all active found reports
 */
export function scanAllPotentialMatches(
  reports: ItemReport[],
  minimumThreshold = 50
): MatchEvaluation[] {
  const lostList = reports.filter((r) => r.type === 'lost' && r.status !== 'resolved');
  const foundList = reports.filter((r) => r.type === 'found' && r.status !== 'resolved');

  const allMatches: MatchEvaluation[] = [];

  for (const lost of lostList) {
    for (const found of foundList) {
      const evaluation = evaluateItemMatch(lost, found);
      if (evaluation.score.totalScore >= minimumThreshold) {
        allMatches.push(evaluation);
      }
    }
  }

  return allMatches.sort((a, b) => b.score.totalScore - a.score.totalScore);
}
