import { Question, SanitizedQuestion, SkillLevel } from "@/types";
import { QUESTION_BANK } from "./questions";

interface GenerateParams {
  skillId: string;
  difficulty: SkillLevel;
  questionCount?: number;
}

/**
 * Fisher-Yates shuffle helper for immutable array shuffling
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Strips secret answers before sending to client
 * CRITICAL SECURITY REQUIREMENT: Never send correctOptionId to client.
 */
export function sanitizeQuestion(q: Question): SanitizedQuestion {
  return {
    id: q.id,
    skillId: q.skillId,
    topic: q.topic,
    difficulty: q.difficulty,
    questionText: q.questionText,
    options: shuffle(q.options),
  };
}

/**
 * Selects questions using a blueprint algorithm across topic pools
 */
export function generateAssessmentQuestions(params: GenerateParams): {
  questions: SanitizedQuestion[];
  rawQuestions: Question[];
} {
  const { skillId, difficulty, questionCount = 5 } = params;

  // 1. Filter eligible pool by skill
  let pool = QUESTION_BANK.filter((q) => q.skillId === skillId && q.active);

  if (pool.length === 0) {
    // Fallback if specific skill has few, take any technical question for demo safety
    pool = QUESTION_BANK;
  }

  // 2. Blueprint matching: prioritize matching difficulty, then complementary
  const exactMatch = pool.filter((q) => q.difficulty === difficulty);
  const others = pool.filter((q) => q.difficulty !== difficulty);

  // Group by topic to avoid repetitive questions from a single topic
  const topicMap: Record<string, Question[]> = {};
  [...exactMatch, ...others].forEach((q) => {
    if (!topicMap[q.topic]) topicMap[q.topic] = [];
    topicMap[q.topic].push(q);
  });

  const selected: Question[] = [];
  const topics = Object.keys(topicMap);
  let topicIndex = 0;

  while (selected.length < questionCount && topics.length > 0) {
    const currentTopic = topics[topicIndex % topics.length];
    const questionsInTopic = topicMap[currentTopic];

    if (questionsInTopic && questionsInTopic.length > 0) {
      // Pick one randomly from this topic
      const randIdx = Math.floor(Math.random() * questionsInTopic.length);
      selected.push(questionsInTopic.splice(randIdx, 1)[0]);
    } else {
      // Remove exhausted topic
      topics.splice(topicIndex % topics.length, 1);
      continue;
    }
    topicIndex++;
  }

  // Shuffle selected questions
  const shuffledSelected = shuffle(selected);

  // Sanitize each question (shuffle options and strip correctOptionId)
  const sanitized = shuffledSelected.map(sanitizeQuestion);

  return {
    questions: sanitized,
    rawQuestions: shuffledSelected,
  };
}
