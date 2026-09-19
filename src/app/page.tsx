"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { questions, type Question } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RealTimeAnalysis } from '@/components/RealTimeAnalysis';
import { KeywordTracker } from '@/components/KeywordTracker';
import { AnswerToolbar } from '@/components/AnswerToolbar';
import { FeedbackDisplay, type AnalysisResult } from '@/components/FeedbackDisplay';
import { CustomMarker } from '@/components/CustomMarker';
import { WholeExamMarker } from '@/components/WholeExamMarker';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { PracticeStats } from '@/components/PracticeStats';
import { QuestionGenerator, type GeneratedQuestion } from '@/components/QuestionGenerator';
import { PerformanceInsights } from '@/components/PerformanceInsights';
import { DataSheetDrawer } from '@/components/DataSheetDrawer';
import { StudyTools } from '@/components/StudyTools';
import { LearningHub } from '@/components/LearningHub';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
import { DiagramAnswerPad } from '@/components/DiagramAnswerPad';
import { MarkReviewTools } from '@/components/MarkReviewTools';
import {
  AttemptHistoryPanel,
  ConfidenceCalibration,
  ConfidenceSelector,
  FollowUpCard,
  ImageAnswerUpload,
  type AnswerImage,
  type AttemptHistory,
  type AttemptRecord,
  type FollowUpQuestion,
  type StudentConfidence,
} from '@/components/PracticeEnhancements';
import { BookOpen, Clock3, KeyRound, RotateCcw, ShieldCheck } from 'lucide-react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

type PracticeResult = { marks: number; total: number };
type PracticeResults = Record<string, PracticeResult>;
type ActiveTab = 'practice' | 'learn' | 'custom' | 'whole' | 'dashboard' | 'teacher';

function topicScores(allQuestions: Question[], results: PracticeResults) {
  return Array.from(new Set(allQuestions.map(question => question.topic)))
    .map(topic => {
      const marked = allQuestions
        .filter(question => question.topic === topic)
        .map(question => results[question.id])
        .filter(Boolean) as PracticeResult[];
      const earned = marked.reduce((sum, result) => sum + result.marks, 0);
      const total = marked.reduce((sum, result) => sum + result.total, 0);
      return { topic, attempted: marked.length, percent: total ? Math.round((earned / total) * 100) : 0 };
    })
    .filter(item => item.attempted > 0);
}

function commandScores(allQuestions: Question[], results: PracticeResults) {
  return Array.from(new Set(allQuestions.map(question => question.commandWord)))
    .map(label => {
      const marked = allQuestions
        .filter(question => question.commandWord === label)
        .map(question => results[question.id])
        .filter(Boolean) as PracticeResult[];
      const earned = marked.reduce((sum, result) => sum + result.marks, 0);
      const total = marked.reduce((sum, result) => sum + result.total, 0);
      return { label, attempted: marked.length, percent: total ? Math.round((earned / total) * 100) : 0 };
    })
    .filter(item => item.attempted > 0);
}

function safeStoredResults(value: string | null): PracticeResults {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, result]) => {
        if (!result || typeof result !== 'object') return false;
        const item = result as Partial<PracticeResult>;
        return Number.isFinite(item.marks) && Number.isFinite(item.total) && Number(item.total) > 0;
      }),
    ) as PracticeResults;
  } catch {
    return {};
  }
}

function safeStoredAttempts(value: string | null): AttemptHistory {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const entries = Object.entries(parsed).map(([questionId, records]) => {
      if (!Array.isArray(records)) return [questionId, []] as const;
      const safeRecords = records.filter(record => {
        if (!record || typeof record !== 'object') return false;
        const item = record as Partial<AttemptRecord>;
        return typeof item.id === 'string' && typeof item.createdAt === 'string' && Number.isFinite(item.marks) && Number.isFinite(item.total);
      }).slice(-20) as AttemptRecord[];
      return [questionId, safeRecords] as const;
    });
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

export default function Home() {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(questions[0].id);
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [answerImage, setAnswerImage] = useState<AnswerImage | null>(null);
  const [studentConfidence, setStudentConfidence] = useState<StudentConfidence>(3);
  const [attemptHistory, setAttemptHistory] = useState<AttemptHistory>({});
  const [followUpQuestion, setFollowUpQuestion] = useState<FollowUpQuestion | null>(null);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState('');
  const [isExamMode, setIsExamMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<AnalysisResult | null>(null);
  const [markingError, setMarkingError] = useState('');
  const [strictness, setStrictness] = useState('standard');
  const [provider, setProvider] = useState('online');
  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('practice');
  const [isDataSheetOpen, setIsDataSheetOpen] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [paperFilter, setPaperFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [assignmentNotice, setAssignmentNotice] = useState('');
  const [practiceResults, setPracticeResults] = useState<PracticeResults>({});
  const [isRewriteMode, setIsRewriteMode] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const uniqueTopics = useMemo(() => Array.from(new Set(questions.map(question => question.topic))).sort(), []);
  const filteredQuestions = useMemo(
    () => questions.filter(question =>
      (subjectFilter === 'all' || question.subject === subjectFilter || question.subject === 'Science') &&
      (courseFilter !== 'combined' || question.course !== 'Separate only') &&
      (tierFilter !== 'foundation' || question.tier !== 'Higher only') &&
      (paperFilter === 'all' || question.paper === paperFilter || question.paper === 'Across papers') &&
      (topicFilter === 'all' || question.topic === topicFilter) &&
      (difficultyFilter === 'all' || question.difficulty === difficultyFilter),
    ),
    [subjectFilter, courseFilter, tierFilter, paperFilter, topicFilter, difficultyFilter],
  );

  const currentBankQuestion = questions.find(question => question.id === selectedQuestionId) || questions[0];
  const isGeneratedQuestion = Boolean(generatedQuestion && generatedQuestion.id === selectedQuestionId);
  const currentQuestion: Question = isGeneratedQuestion && generatedQuestion ? generatedQuestion : currentBankQuestion;
  const currentAttempts = attemptHistory[currentQuestion.id] || [];
  const latestAttempt = currentAttempts.length ? currentAttempts[currentAttempts.length - 1] : null;

  const attemptedIds = Object.keys(practiceResults);
  const earnedMarks = Object.values(practiceResults).reduce((sum, result) => sum + result.marks, 0);
  const availableMarks = Object.values(practiceResults).reduce((sum, result) => sum + result.total, 0);
  const averagePercent = availableMarks ? Math.round((earnedMarks / availableMarks) * 100) : 0;
  const allTopicScores = topicScores(questions, practiceResults);
  const allCommandScores = commandScores(questions, practiceResults);
  const weakestTopic = allTopicScores.length ? [...allTopicScores].sort((a, b) => a.percent - b.percent)[0] : null;

  const filteredMarked = filteredQuestions
    .map(question => practiceResults[question.id])
    .filter(Boolean) as PracticeResult[];
  const filteredEarnedMarks = filteredMarked.reduce((sum, result) => sum + result.marks, 0);
  const filteredAvailableMarks = filteredMarked.reduce((sum, result) => sum + result.total, 0);
  const filteredAveragePercent = filteredAvailableMarks ? Math.round((filteredEarnedMarks / filteredAvailableMarks) * 100) : 0;

  useEffect(() => {
    const savedResults = safeStoredResults(localStorage.getItem('aqaGcseSciencePracticeResults'));
    const savedAttempts = safeStoredAttempts(localStorage.getItem('aqaGcseScienceAttemptHistory'));
    const savedAnswer = localStorage.getItem('aqaGcseScienceDraftAnswer');
    const savedQuestion = localStorage.getItem('aqaGcseScienceSelectedQuestion');

    setPracticeResults(savedResults);
    setAttemptHistory(savedAttempts);
    if (savedAnswer) setAnswer(savedAnswer);
    if (savedQuestion && questions.some(question => question.id === savedQuestion)) setSelectedQuestionId(savedQuestion);
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('assignment');
      if (code) {
        const normalised = code.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalised + '='.repeat((4 - normalised.length % 4) % 4);
        const binary = atob(padded);
        const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
        const assignment = JSON.parse(new TextDecoder().decode(bytes)) as { subject?: string; topic?: string; paper?: string; tier?: string; questionCount?: number };
        if (assignment.subject && assignment.subject !== 'All') setSubjectFilter(assignment.subject);
        if (assignment.topic && assignment.topic !== 'All') setTopicFilter(assignment.topic);
        if (assignment.paper && assignment.paper !== 'All') setPaperFilter(assignment.paper);
        if (assignment.tier === 'Foundation') setTierFilter('foundation');
        if (assignment.tier === 'Higher') setTierFilter('higher');
        setAssignmentNotice(`Assignment loaded${assignment.questionCount ? ` · target ${assignment.questionCount} questions` : ''}.`);
        setActiveTab('practice');
      }
    } catch {
      setAssignmentNotice('This assignment link could not be read. You can still practise normally.');
    }
    setHistoryLoaded(true);
  }, []);

  useEffect(() => {
    if (!historyLoaded) return;
    try {
      localStorage.setItem('aqaGcseSciencePracticeResults', JSON.stringify(practiceResults));
    } catch {
      // Storage can be unavailable in private browsing or locked-down browsers.
    }
  }, [practiceResults, historyLoaded]);

  useEffect(() => {
    if (!historyLoaded) return;
    try {
      localStorage.setItem('aqaGcseScienceAttemptHistory', JSON.stringify(attemptHistory));
    } catch {
      // Attempt summaries are optional; the app still works if storage is unavailable.
    }
  }, [attemptHistory, historyLoaded]);

  useEffect(() => {
    if (!historyLoaded || isGeneratedQuestion) return;
    try {
      localStorage.setItem('aqaGcseScienceDraftAnswer', answer);
      localStorage.setItem('aqaGcseScienceSelectedQuestion', selectedQuestionId);
    } catch {
      // Keep the app usable even when storage is unavailable.
    }
  }, [answer, selectedQuestionId, historyLoaded, isGeneratedQuestion]);

  useEffect(() => {
    try {
      const sessionKey = sessionStorage.getItem('aqaGcseScienceApiKey');
      if (sessionKey) setApiKey(sessionKey);
      localStorage.removeItem('aqaGcseScienceApiKey');
    } catch {
      // Session storage is optional; the server environment key can still be used.
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTimerRunning) interval = setInterval(() => setTimer(previous => previous + 1), 1000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainder = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  const resetQuestionState = () => {
    setAnswer('');
    setAnswerImage(null);
    setStudentConfidence(3);
    setFeedback(null);
    setMarkingError('');
    setFollowUpQuestion(null);
    setFollowUpError('');
    setIsGeneratingFollowUp(false);
    setIsRewriteMode(false);
    setTimer(0);
    setIsTimerRunning(false);
  };

  const selectBankQuestion = (id: string) => {
    setGeneratedQuestion(null);
    setSelectedQuestionId(id);
    resetQuestionState();
  };

  const selectGeneratedQuestion = (question: GeneratedQuestion) => {
    setGeneratedQuestion(question);
    setSelectedQuestionId(question.id);
    resetQuestionState();
  };

  const clearPracticeHistory = () => {
    if (!window.confirm('Clear saved marks, attempts, draft answer and practice history?')) return;
    setPracticeResults({});
    setAttemptHistory({});
    setAnswer('');
    setAnswerImage(null);
    setFeedback(null);
    setMarkingError('');
    setFollowUpQuestion(null);
    localStorage.removeItem('aqaGcseSciencePracticeResults');
    localStorage.removeItem('aqaGcseScienceAttemptHistory');
    localStorage.removeItem('aqaGcseScienceDraftAnswer');
    localStorage.removeItem('aqaGcseScienceSelectedQuestion');
  };

  const handleRandomQuestion = () => {
    const pool = filteredQuestions.length ? filteredQuestions : questions;
    selectBankQuestion(pool[Math.floor(Math.random() * pool.length)].id);
  };

  const handleWeakTopicQuestion = () => {
    const topicPool = weakestTopic ? questions.filter(question => question.topic === weakestTopic.topic) : filteredQuestions;
    const pool = topicPool.length ? topicPool : questions;
    const weakOrUnattempted = pool.filter(question => {
      const result = practiceResults[question.id];
      return !result || result.marks / result.total < 0.7;
    });
    const targetPool = weakOrUnattempted.length ? weakOrUnattempted : pool;
    selectBankQuestion(targetPool[Math.floor(Math.random() * targetPool.length)].id);
  };

  const handleExamModeChange = (checked: boolean) => {
    setIsExamMode(checked);
    setFeedback(null);
    setMarkingError('');
    setFollowUpQuestion(null);
    setFollowUpError('');
    setIsRewriteMode(false);
    setTimer(0);
    setIsTimerRunning(checked);
  };

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    if (value.trim() && !isTimerRunning && !isExamMode) setIsTimerRunning(true);
  };

  const handleAnswerImage = (image: AnswerImage | null) => {
    setAnswerImage(image);
    setMarkingError('');
    if (image) {
      setProvider('online');
      if (!isTimerRunning && !isExamMode) setIsTimerRunning(true);
    }
  };

  const requestFollowUp = async (result: AnalysisResult) => {
    if (result.marksAwarded >= result.totalMarks) {
      setFollowUpQuestion(null);
      setFollowUpError('');
      return;
    }

    setIsGeneratingFollowUp(true);
    setFollowUpQuestion(null);
    setFollowUpError('');
    try {
      const response = await fetch('/api/generate-follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, feedback: result, apiKey }),
      });
      const data = await response.json();
      if (!response.ok || data?.error || !data?.question) throw new Error(data?.error || 'Could not build a follow-up question.');
      setFollowUpQuestion(data.question as FollowUpQuestion);
    } catch (error) {
      setFollowUpError(error instanceof Error ? error.message : 'Could not build a follow-up question.');
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const handleAutoMark = async () => {
    if (!answer.trim() && !answerImage) return;
    if (answerImage && provider === 'offline') {
      setMarkingError('Handwritten image marking needs AI mode because the offline marker cannot read images.');
      return;
    }

    setIsAnalyzing(true);
    setFeedback(null);
    setMarkingError('');
    setFollowUpQuestion(null);
    setFollowUpError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnswer: answer,
          studentInlineData: answerImage?.inlineData,
          questionPrompt: currentQuestion.prompt,
          commandWord: currentQuestion.commandWord,
          maxMarks: currentQuestion.maxMarks,
          markScheme: currentQuestion.markScheme,
          modelAnswer: currentQuestion.modelAnswer,
          strictness,
          provider,
          apiKey,
        }),
      });
      const data = await response.json();
      if (!response.ok || data?.error) throw new Error(data?.error || 'The marker could not grade this answer.');
      if (typeof data?.marksAwarded !== 'number' || typeof data?.totalMarks !== 'number') {
        throw new Error('The marker returned an incomplete result. Please try again.');
      }
      if (answerImage && data?.fallbackUsed) {
        throw new Error('The AI service was unavailable, so the image could not be read. Add a Gemini key or try again when AI marking is available.');
      }

      const result = data as AnalysisResult;
      setFeedback(result);
      setIsRewriteMode(false);
      setIsTimerRunning(false);

      const answerMode: AttemptRecord['answerMode'] = answerImage ? (answer.trim() ? 'mixed' : 'image') : 'typed';
      const answerPreview = answer.trim()
        ? answer.trim().slice(0, 1200)
        : `[Handwritten image: ${answerImage?.name || 'uploaded answer'}]`;
      const attempt: AttemptRecord = {
        id: `${currentQuestion.id}-${Date.now()}`,
        questionId: currentQuestion.id,
        createdAt: new Date().toISOString(),
        marks: result.marksAwarded,
        total: result.totalMarks,
        studentConfidence,
        examinerConfidence: result.examinerConfidence,
        answerPreview,
        answerMode,
        misconceptions: Array.isArray(result.misconceptions) ? result.misconceptions.slice(0, 10) : [],
        lostMarks: Array.isArray(result.lostMarksAnalysis) ? result.lostMarksAnalysis.length : Math.max(0, result.totalMarks - result.marksAwarded),
      };
      setAttemptHistory(previous => ({
        ...previous,
        [currentQuestion.id]: [...(previous[currentQuestion.id] || []), attempt].slice(-20),
      }));

      if (!isGeneratedQuestion && questions.some(question => question.id === currentQuestion.id)) {
        setPracticeResults(previous => ({
          ...previous,
          [currentQuestion.id]: { marks: result.marksAwarded, total: currentQuestion.maxMarks },
        }));
      }

      if (result.marksAwarded < result.totalMarks) void requestFollowUp(result);
    } catch (error) {
      setMarkingError(error instanceof Error ? error.message : 'Failed to analyse the answer.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTeacherOverride = (marks: number, note: string) => {
    setFeedback(previous => previous ? {
      ...previous,
      marksAwarded: marks,
      examinerConfidence: 100,
      confidenceReason: note ? `Teacher override: ${note}` : 'Teacher-reviewed final mark.',
      reviewRecommended: false,
    } : previous);
    if (!isGeneratedQuestion && questions.some(question => question.id === currentQuestion.id)) {
      setPracticeResults(previous => ({ ...previous, [currentQuestion.id]: { marks, total: currentQuestion.maxMarks } }));
    }
  };

  const handleRewrite = () => {
    setFeedback(null);
    setAnswerImage(null);
    setStudentConfidence(3);
    setMarkingError('');
    setFollowUpQuestion(null);
    setFollowUpError('');
    setIsRewriteMode(true);
    setActiveTab('practice');
    setTimer(0);
    setIsTimerRunning(false);
  };

  const practiceFollowUp = (question: FollowUpQuestion) => {
    setActiveTab('practice');
    selectGeneratedQuestion(question);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPrompt = (text: string) =>
    text.split(/(\$.*?\$)/g).map((part, index) =>
      part.startsWith('$') && part.endsWith('$') ? (
        <span key={index} className="mx-1 inline-block"><InlineMath math={part.slice(1, -1)} /></span>
      ) : (
        <span key={index}>{part}</span>
      ),
    );

  const difficultyColour = (difficulty: string) =>
    difficulty === 'Easy' ? 'bg-green-500' : difficulty === 'Medium' ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xl font-bold">AQA GCSE Science Exam Marker</div>
            <div className="text-xs text-gray-400">Biology, Chemistry & Physics practice, marking and targeted revision</div>
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-2 rounded-md border border-gray-700 bg-gray-900 px-2 py-1" title="The key is stored only for this browser session.">
              <KeyRound size={14} className="text-gray-400" />
              <input
                type="password"
                placeholder="Optional Gemini key"
                className="w-36 bg-transparent text-xs text-white outline-none placeholder:text-gray-500 md:w-44"
                value={apiKey}
                onChange={event => {
                  const value = event.target.value;
                  setApiKey(value);
                  try {
                    if (value) sessionStorage.setItem('aqaGcseScienceApiKey', value);
                    else sessionStorage.removeItem('aqaGcseScienceApiKey');
                  } catch {
                    // Optional convenience only.
                  }
                }}
                aria-label="Gemini API key for this session"
              />
            </div>

            <div className="flex rounded-md bg-gray-900 p-1 text-xs font-semibold">
              <button onClick={() => setProvider('online')} className={`rounded px-2 py-1 ${provider === 'online' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>AI</button>
              <button onClick={() => setProvider('offline')} className={`rounded px-2 py-1 ${provider === 'offline' ? 'bg-amber-600 text-white' : 'text-gray-400'}`}>Offline</button>
            </div>

            {(['practice', 'learn', 'custom', 'whole', 'dashboard', 'teacher'] as const).map(tab => (
              <button
                key={tab}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => {
                  setActiveTab(tab);
                  setMarkingError('');
                }}
              >
                {tab === 'practice' ? 'Practice' : tab === 'learn' ? 'Learning Hub' : tab === 'custom' ? 'Custom Marker' : tab === 'whole' ? 'Whole Exam' : tab === 'teacher' ? 'Teacher' : 'Dashboard'}
              </button>
            ))}

            <button onClick={() => setIsDataSheetOpen(true)} className="flex items-center gap-1 rounded-md px-2 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
              <BookOpen size={16} /> Data sheet
            </button>
            <AccessibilityMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl flex-grow px-4 py-8">
        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <QuestionGenerator onUse={selectGeneratedQuestion} />

              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={clearPracticeHistory}>Reset saved progress</Button>
              </div>

              <PerformanceInsights
                averagePercent={averagePercent}
                topicScores={allTopicScores}
                attempted={attemptedIds.length}
                earnedMarks={earnedMarks}
                availableMarks={availableMarks}
              />

              {weakestTopic ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                  <strong>Current revision priority:</strong> {weakestTopic.topic} — {weakestTopic.percent}% across {weakestTopic.attempted} marked question{weakestTopic.attempted === 1 ? '' : 's'}.
                </div>
              ) : null}

              <PracticeStats
                totalQuestions={filteredQuestions.length}
                attempted={filteredQuestions.filter(question => attemptedIds.includes(question.id)).length}
                earnedMarks={filteredEarnedMarks}
                availableMarks={filteredAvailableMarks}
                averagePercent={filteredAveragePercent}
                topicFilter={topicFilter}
              />

              {assignmentNotice ? <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900"><strong>Teacher assignment:</strong> {assignmentNotice}</div> : null}

              <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                <label className="flex items-center gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={isExamMode}
                    onChange={event => handleExamModeChange(event.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  Exam mode
                </label>
                <Button variant="outline" size="sm" onClick={handleRandomQuestion}>Random question</Button>
                <Button variant="outline" size="sm" onClick={handleWeakTopicQuestion}>Target weak topic</Button>

                <select value={subjectFilter} onChange={event => { setSubjectFilter(event.target.value); setTopicFilter('all'); }} className="rounded border p-2 text-sm" aria-label="Filter by science">
                  <option value="all">All sciences</option><option value="Biology">Biology</option><option value="Chemistry">Chemistry</option><option value="Physics">Physics</option>
                </select>
                <select value={courseFilter} onChange={event => setCourseFilter(event.target.value)} className="rounded border p-2 text-sm" aria-label="Filter by course">
                  <option value="all">Combined + Separate</option><option value="combined">Combined Science</option><option value="separate">Separate Science</option>
                </select>
                <select value={tierFilter} onChange={event => setTierFilter(event.target.value)} className="rounded border p-2 text-sm" aria-label="Filter by tier">
                  <option value="all">All tiers</option><option value="foundation">Foundation</option><option value="higher">Higher</option>
                </select>
                <select value={paperFilter} onChange={event => setPaperFilter(event.target.value)} className="rounded border p-2 text-sm" aria-label="Filter by paper">
                  <option value="all">Both papers</option><option value="Paper 1">Paper 1</option><option value="Paper 2">Paper 2</option>
                </select>

                <select
                  value={topicFilter}
                  onChange={event => {
                    const value = event.target.value;
                    setTopicFilter(value);
                    const pool = questions.filter(question =>
                      (subjectFilter === 'all' || question.subject === subjectFilter || question.subject === 'Science') &&
                      (courseFilter !== 'combined' || question.course !== 'Separate only') &&
                      (tierFilter !== 'foundation' || question.tier !== 'Higher only') &&
                      (paperFilter === 'all' || question.paper === paperFilter || question.paper === 'Across papers') &&
                      (value === 'all' || question.topic === value) &&
                      (difficultyFilter === 'all' || question.difficulty === difficultyFilter));
                    if (pool.length) selectBankQuestion(pool[0].id);
                  }}
                  className="rounded border p-2 text-sm"
                  aria-label="Filter by topic"
                >
                  <option value="all">All topics</option>
                  {uniqueTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                </select>

                <select
                  value={difficultyFilter}
                  onChange={event => {
                    const value = event.target.value;
                    setDifficultyFilter(value);
                    const pool = questions.filter(question =>
                      (subjectFilter === 'all' || question.subject === subjectFilter || question.subject === 'Science') &&
                      (courseFilter !== 'combined' || question.course !== 'Separate only') &&
                      (tierFilter !== 'foundation' || question.tier !== 'Higher only') &&
                      (paperFilter === 'all' || question.paper === paperFilter || question.paper === 'Across papers') &&
                      (topicFilter === 'all' || question.topic === topicFilter) &&
                      (value === 'all' || question.difficulty === value));
                    if (pool.length) selectBankQuestion(pool[0].id);
                  }}
                  className="rounded border p-2 text-sm"
                  aria-label="Filter by difficulty"
                >
                  <option value="all">All difficulties</option>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>

                <select value={strictness} onChange={event => setStrictness(event.target.value)} className="rounded border p-2 text-sm" aria-label="Marking strictness">
                  <option value="lenient">Lenient</option>
                  <option value="standard">Standard</option>
                  <option value="strict">Strict</option>
                </select>
              </div>

              {isExamMode ? (
                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  <ShieldCheck size={18} /> Exam mode hides hints, keyword tracking and live answer analysis until you submit.
                </div>
              ) : null}

              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <select
                  className="w-full rounded border p-2 text-sm"
                  value={selectedQuestionId}
                  onChange={event => {
                    if (generatedQuestion && event.target.value === generatedQuestion.id) {
                      setSelectedQuestionId(generatedQuestion.id);
                      return;
                    }
                    selectBankQuestion(event.target.value);
                  }}
                  aria-label="Select practice question"
                >
                  {isGeneratedQuestion && generatedQuestion ? (
                    <option value={generatedQuestion.id}>[Generated · {generatedQuestion.maxMarks}m] {generatedQuestion.topic} — {generatedQuestion.prompt.slice(0, 65)}...</option>
                  ) : null}
                  {filteredQuestions.map(question => (
                    <option key={question.id} value={question.id}>[{question.maxMarks}m] {question.topic} — {question.prompt.slice(0, 70)}...</option>
                  ))}
                </select>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                  {isGeneratedQuestion ? <Badge className="bg-purple-600">Generated question</Badge> : <Badge variant="secondary">Question bank</Badge>}
                  <Badge variant="outline">{currentQuestion.commandWord}</Badge>
                  <Badge variant="outline">{currentQuestion.maxMarks} marks</Badge>
                  <Badge variant="outline">{currentQuestion.subject}</Badge>
                  <Badge variant="outline">{currentQuestion.paper}</Badge>
                  <Badge variant="outline">{currentQuestion.tier === 'Higher only' ? 'Higher only' : 'Foundation + Higher'}</Badge>
                </div>

                <div className="mt-4 text-xl font-semibold leading-relaxed">{renderPrompt(currentQuestion.prompt)}</div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${difficultyColour(currentQuestion.difficulty)}`} />{currentQuestion.difficulty}</span>
                  <span>{currentQuestion.year}</span>
                  <span>{currentQuestion.subTopic}</span>
                  <span className="ml-auto flex items-center gap-1 font-mono text-base text-gray-900"><Clock3 size={16} /> {formatTime(timer)}</span>
                  <Button variant="outline" size="sm" onClick={() => setIsTimerRunning(running => !running)}>{isTimerRunning ? 'Pause' : 'Start'}</Button>
                  <Button variant="outline" size="sm" onClick={() => { setTimer(0); setIsTimerRunning(false); }}><RotateCcw size={14} /></Button>
                </div>
                {isGeneratedQuestion ? <p className="mt-3 text-xs text-purple-700">Generated attempts are fully markable but are not added to the saved bank-progress dashboard.</p> : null}
              </div>

              <div id="answer-editor" className="rounded-lg border bg-white p-4 shadow-sm">
                {isRewriteMode ? (
                  <div className="mb-4 rounded border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
                    <strong>Rewrite mode:</strong> improve your existing answer using the feedback you just received, then submit it again to compare the mark.
                  </div>
                ) : null}

                {!isExamMode ? (
                  <AnswerToolbar answer={answer} setAnswer={setAnswer} hint={currentQuestion.hint} template={currentQuestion.template} />
                ) : null}

                <textarea
                  className="mt-4 min-h-[260px] w-full rounded-md border p-4 text-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your answer here, upload handwritten working below, or use both..."
                  value={answer}
                  onChange={event => handleAnswerChange(event.target.value)}
                  aria-label="Student answer"
                />

                <div className="mt-4">
                  <ImageAnswerUpload image={answerImage} onImage={handleAnswerImage} disabled={isAnalyzing} />
                </div>
                <div className="mt-4">
                  <DiagramAnswerPad image={answerImage} onImage={handleAnswerImage} disabled={isAnalyzing} />
                </div>

                <div className="mt-4">
                  <ConfidenceSelector value={studentConfidence} onChange={setStudentConfidence} disabled={isAnalyzing} />
                </div>

                <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-gray-500">
                  <span>{answer.trim() ? answer.trim().split(/\s+/).length : 0} words{answerImage ? ' + image' : ''}</span>
                  <span>{provider === 'online' ? 'AI marking with automatic offline fallback for typed answers' : 'Deterministic offline marking'}</span>
                </div>

                {answerImage && provider === 'offline' ? (
                  <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Image answers require AI mode. Switch back to AI before marking.</div>
                ) : null}
                {markingError ? <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{markingError}</div> : null}

                <Button size="lg" className="mt-4 w-full" onClick={handleAutoMark} disabled={isAnalyzing || (!answer.trim() && !answerImage)}>
                  {isAnalyzing ? 'Analysing answer…' : isRewriteMode ? 'Mark rewritten answer' : answerImage ? 'Mark my typed + handwritten answer' : 'Auto-mark my answer'}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {!isExamMode ? (
                <>
                  <RealTimeAnalysis answer={answer} />
                  <KeywordTracker answer={answer} requiredKeywords={currentQuestion.requiredKeywords} />
                </>
              ) : (
                <Card className="p-4">
                  <h3 className="font-bold">Exam conditions</h3>
                  <p className="mt-2 text-sm text-gray-600">Hints and live keyword guidance are hidden. Use the data sheet only where the real exam would provide it.</p>
                </Card>
              )}

              <Card className="p-4">
                <h3 className="font-bold">Command word</h3>
                <div className="mt-2 flex items-center gap-2"><Badge>{currentQuestion.commandWord}</Badge></div>
                <p className="mt-2 text-sm text-gray-600">{currentQuestion.commandWordDefinition}</p>
              </Card>

              <AttemptHistoryPanel attempts={currentAttempts} />
            </div>
          </div>
        )}

        {activeTab === 'learn' ? <LearningHub apiKey={apiKey} onPracticeQuestion={id => { setActiveTab('practice'); selectBankQuestion(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /> : null}
        {activeTab === 'custom' ? <CustomMarker onFeedbackReceived={setFeedback} apiKey={apiKey} /> : null}
        {activeTab === 'whole' ? <WholeExamMarker apiKey={apiKey} /> : null}
        {activeTab === 'teacher' ? <TeacherDashboard /> : null}
        {activeTab === 'dashboard' ? (
          <ProgressDashboard
            averagePercent={averagePercent}
            earnedMarks={earnedMarks}
            availableMarks={availableMarks}
            attempted={attemptedIds.length}
            totalQuestions={questions.length}
            topicScores={allTopicScores.map(item => ({ label: item.topic, percent: item.percent, attempted: item.attempted }))}
            commandScores={allCommandScores}
          />
        ) : null}
      </main>

      {feedback && activeTab !== 'whole' && activeTab !== 'dashboard' ? (
        <section className="border-t bg-white px-4 py-12">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b pb-4">
              <div>
                <div className="text-sm font-semibold uppercase text-blue-700">Marked response</div>
                <h2 className="text-3xl font-extrabold">Examiner report</h2>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.print()}>Print report</Button>
            </div>
            <FeedbackDisplay result={feedback} onRewrite={activeTab === 'practice' ? handleRewrite : undefined} />
            {activeTab === 'practice' ? <div className="mt-6"><MarkReviewTools question={currentQuestion} result={feedback} studentAnswer={answer} onOverride={handleTeacherOverride} /></div> : null}
            {activeTab === 'practice' ? (
              <div className="mt-6 space-y-6">
                {latestAttempt ? <ConfidenceCalibration studentConfidence={latestAttempt.studentConfidence} result={feedback} /> : null}
                <AttemptHistoryPanel attempts={currentAttempts} />
                <FollowUpCard
                  question={followUpQuestion}
                  loading={isGeneratingFollowUp}
                  error={followUpError}
                  onPractice={practiceFollowUp}
                  onRetry={() => void requestFollowUp(feedback)}
                />
                <StudyTools marks={feedback.marksAwarded} total={feedback.totalMarks} topic={currentQuestion.topic} />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <DataSheetDrawer isOpen={isDataSheetOpen} onClose={() => setIsDataSheetOpen(false)} />
    </div>
  );
}
