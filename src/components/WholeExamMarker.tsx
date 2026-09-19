"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Download,
  FileCheck2,
  FileText,
  Images,
  Printer,
  SearchCheck,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import * as mammoth from 'mammoth';

type TopicBreakdown = {
  name: string;
  scorePercent: number;
  earnedMarks?: number;
  availableMarks?: number;
  attempted?: number;
};

type QuestionResult = {
  questionNumber: string;
  topic: string;
  maxMarks: number;
  score: number;
  attempted: boolean;
  confidence: number;
  reviewRecommended: boolean;
  examinerComment: string;
  studentEvidence: string;
  evidencePages?: number[];
  handwritingConfidence?: number;
  transcriptionIssue?: string;
  lostMarks: string[];
  improvements: string[];
};

type PhotoPageAnalysis = {
  pageNumber: number;
  handwritingConfidence: number;
  pageQuality: string;
  transcription: string;
  questionNumbers: string[];
  unclearSegments: string[];
  visualEvidence: string[];
  warnings: string[];
};

type WholeExamResult = {
  totalScore: number;
  maxScore: number;
  percent?: number;
  estimatedGrade: string;
  gradeNotice?: string;
  questionsAttempted: number;
  totalQuestions: number;
  examinerConfidence?: number;
  confidenceReason?: string;
  reviewRecommendedCount?: number;
  handwritingAudit?: {
    photoPagesAnalyzed: number;
    averageConfidence: number;
    unclearPages: number[];
    totalUnclearSegments: number;
  };
  topRevisionPriority?: { topic: string; avgScorePercent: number; notes: string };
  topicBreakdown?: TopicBreakdown[];
  questionResults?: QuestionResult[];
  overallStrengths?: string[];
  revisionActions?: string[];
  paperAudit?: {
    pagesDetected: number;
    questionPaperMatched: boolean;
    markSchemeMatched: boolean;
    warnings: string[];
  };
  markingBasis?: {
    questionPaperSupplied: boolean;
    markSchemeSupplied: boolean;
    photoPagesAnalyzed?: number;
    handwritingVerifiedTwice?: boolean;
    secondExaminerAudit?: boolean;
    scoreCalculatedFromQuestionRows: boolean;
  };
};

type PhotoPage = {
  id: string;
  file: File;
  previewUrl: string;
};

type UploadKind = 'exam' | 'questionPaper' | 'markScheme';

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_PHOTO_BYTES = 14 * 1024 * 1024;
const MAX_PHOTOS = 30;
const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'webp'];
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

async function optimiseExamPhoto(file: File): Promise<{ data: string; mimeType: string }> {
  const source = await readAsDataUrl(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not decode ${file.name}.`));
    img.src = source;
  });

  const maxDimension = 2200;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser image processing is unavailable.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const makeBlob = (quality: number) => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not optimise photo.')), 'image/jpeg', quality);
  });

  let quality = 0.9;
  let blob = await makeBlob(quality);
  while (blob.size > 1_350_000 && quality > 0.62) {
    quality -= 0.08;
    blob = await makeBlob(quality);
  }
  const dataUrl = await readAsDataUrl(blob);
  return { data: dataUrl.slice(dataUrl.indexOf(',') + 1), mimeType: 'image/jpeg' };
}

export function WholeExamMarker({ apiKey }: { apiKey: string }) {
  const [examFile, setExamFile] = useState<File | null>(null);
  const [scriptPhotos, setScriptPhotos] = useState<PhotoPage[]>([]);
  const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
  const [markSchemeFile, setMarkSchemeFile] = useState<File | null>(null);
  const [examText, setExamText] = useState('');
  const [paperLabel, setPaperLabel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [pageProgress, setPageProgress] = useState(0);
  const [pageAnalyses, setPageAnalyses] = useState<PhotoPageAnalysis[]>([]);
  const [results, setResults] = useState<WholeExamResult | null>(null);
  const [error, setError] = useState('');
  const [reviewOnly, setReviewOnly] = useState(false);

  const validateFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ACCEPTED_EXTENSIONS.includes(extension)) return 'Use a PDF, DOCX, TXT, JPG, PNG or WEBP file.';
    if (file.size > MAX_FILE_BYTES) return 'Please use a file smaller than 8 MB.';
    return '';
  };

  const chooseFile = (file: File | undefined, setter: (file: File | null) => void) => {
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setter(file);
  };

  const addPhotos = (files: FileList | null) => {
    if (!files?.length) return;
    const candidates = Array.from(files);
    const valid: PhotoPage[] = [];
    const rejected: string[] = [];

    for (const file of candidates) {
      if (!PHOTO_TYPES.includes(file.type)) {
        rejected.push(`${file.name}: use JPG, PNG or WEBP`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        rejected.push(`${file.name}: larger than 14 MB`);
        continue;
      }
      if (scriptPhotos.length + valid.length >= MAX_PHOTOS) {
        rejected.push(`Only ${MAX_PHOTOS} script photos can be added at once.`);
        break;
      }
      valid.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (valid.length) setScriptPhotos(previous => [...previous, ...valid]);
    setError(rejected.length ? rejected.join(' · ') : '');
  };

  const removePhoto = (id: string) => {
    setScriptPhotos(previous => {
      const target = previous.find(item => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return previous.filter(item => item.id !== id);
    });
  };

  const movePhoto = (index: number, direction: -1 | 1) => {
    setScriptPhotos(previous => {
      const target = index + direction;
      if (target < 0 || target >= previous.length) return previous;
      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = String(reader.result || '');
        const data = value.includes(',') ? value.slice(value.indexOf(',') + 1) : '';
        if (!data) reject(new Error(`Could not read ${file.name}.`));
        else resolve(data);
      };
      reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
      reader.readAsDataURL(file);
    });

  const extractTextFile = async (file: File) => {
    if (file.name.toLowerCase().endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    if (file.name.toLowerCase().endsWith('.txt')) return file.text();
    return '';
  };

  const appendFile = async (file: File, payload: Record<string, unknown>, kind: UploadKind) => {
    const extracted = await extractTextFile(file);
    const textKey = kind === 'exam' ? 'examText' : kind === 'questionPaper' ? 'questionPaperText' : 'markSchemeText';
    const dataKey = kind === 'exam' ? 'examFileData' : kind === 'questionPaper' ? 'questionPaperFileData' : 'markSchemeFileData';
    const mimeKey = kind === 'exam' ? 'examFileMimeType' : kind === 'questionPaper' ? 'questionPaperFileMimeType' : 'markSchemeFileMimeType';

    if (extracted) {
      payload[textKey] = [String(payload[textKey] || ''), extracted].filter(Boolean).join('\n\n');
      return;
    }
    payload[dataKey] = await fileToBase64(file);
    payload[mimeKey] = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
  };

  const analysePhotoPages = async () => {
    const analyses: PhotoPageAnalysis[] = [];
    for (let index = 0; index < scriptPhotos.length; index += 1) {
      setPageProgress(index + 1);
      setProcessingStage(`Reading handwriting on photo ${index + 1} of ${scriptPhotos.length}…`);
      try {
        const optimised = await optimiseExamPhoto(scriptPhotos[index].file);
        const response = await fetch('/api/analyze-exam-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: optimised.data,
            mimeType: optimised.mimeType,
            pageNumber: index + 1,
            totalPages: scriptPhotos.length,
            paperLabel: paperLabel.trim(),
            apiKey,
          }),
        });
        const data = await response.json();
        if (!response.ok || data?.error) throw new Error(data?.error || `Could not read photo ${index + 1}.`);
        analyses.push(data as PhotoPageAnalysis);
      } catch (err) {
        analyses.push({
          pageNumber: index + 1,
          handwritingConfidence: 0,
          pageQuality: 'poor',
          transcription: '',
          questionNumbers: [],
          unclearSegments: ['Entire page could not be reliably transcribed.'],
          visualEvidence: [],
          warnings: [err instanceof Error ? err.message : 'Page analysis failed.'],
        });
      }
    }
    setPageAnalyses(analyses);
    return analyses;
  };

  const handleProcess = async () => {
    if (!examFile && !scriptPhotos.length && !examText.trim()) {
      setError('Upload a completed script file, add script photos, or paste/transcribe the student answers.');
      return;
    }

    setIsProcessing(true);
    setResults(null);
    setPageAnalyses([]);
    setError('');
    setReviewOnly(false);
    setPageProgress(0);

    try {
      const scriptPages = scriptPhotos.length ? await analysePhotoPages() : [];
      setProcessingStage('Applying the mark scheme and running the second-examiner audit…');
      const payload: Record<string, unknown> = {
        examText: examText.trim(),
        paperLabel: paperLabel.trim(),
        apiKey,
        scriptPages,
      };
      if (questionPaperFile) await appendFile(questionPaperFile, payload, 'questionPaper');
      if (markSchemeFile) await appendFile(markSchemeFile, payload, 'markScheme');
      if (examFile) await appendFile(examFile, payload, 'exam');

      const response = await fetch('/api/analyze-exam-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || data?.error) throw new Error(data?.error || 'Whole-exam marking failed.');
      if (typeof data?.totalScore !== 'number' || typeof data?.maxScore !== 'number' || !Array.isArray(data?.questionResults)) {
        throw new Error('The examiner returned an incomplete audited report.');
      }
      setResults(data as WholeExamResult);
      setProcessingStage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process the exam.');
      setProcessingStage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCsv = () => {
    if (!results?.questionResults?.length) return;
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Question', 'Topic', 'Score', 'Max marks', 'Pages', 'Handwriting confidence', 'Mark confidence', 'Review', 'Student evidence', 'Transcription issue', 'Lost marks', 'Improvements'],
      ...results.questionResults.map(question => [
        question.questionNumber,
        question.topic,
        question.score,
        question.maxMarks,
        question.evidencePages?.join(' | ') || '',
        typeof question.handwritingConfidence === 'number' ? `${question.handwritingConfidence}%` : '',
        `${question.confidence}%`,
        question.reviewRecommended ? 'Yes' : 'No',
        question.studentEvidence,
        question.transcriptionIssue || '',
        question.lostMarks.join(' | '),
        question.improvements.join(' | '),
      ]),
    ];
    const csv = rows.map(row => row.map(escape).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aqa-gcse-science-audited-exam-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const visibleQuestions = useMemo(() => {
    const rows = results?.questionResults || [];
    return reviewOnly ? rows.filter(question => question.reviewRecommended) : rows;
  }, [results, reviewOnly]);

  const uploadCard = (
    title: string,
    description: string,
    file: File | null,
    setter: (file: File | null) => void,
    tone: 'green' | 'purple' | 'slate',
  ) => {
    const toneClasses = tone === 'green'
      ? 'border-green-300 bg-green-50 text-green-700'
      : tone === 'purple'
        ? 'border-purple-300 bg-purple-50 text-purple-700'
        : 'border-slate-300 bg-slate-50 text-slate-700';
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" />{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center ${file ? toneClasses : 'border-slate-300 bg-slate-50/60'}`}>
            <UploadCloud className="mb-3 h-8 w-8 text-slate-400" />
            <Input type="file" accept=".pdf,.docx,.txt,image/jpeg,image/png,image/webp" className="mb-2 max-w-[260px]" onChange={event => chooseFile(event.target.files?.[0], setter)} />
            <p className="text-xs text-slate-500">PDF/DOCX/TXT/image · max 8 MB</p>
            {file ? <button type="button" className="mt-2 text-xs font-semibold text-red-600 hover:underline" onClick={() => setter(null)}>Remove {file.name}</button> : null}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 px-6 py-7 text-white">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Accuracy-first whole script marking</div>
          <h2 className="mt-2 text-3xl font-extrabold">Upload a PDF or photograph every page</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">Photo pages are read individually, verified a second time for handwriting accuracy, then marked question-by-question and audited by a second examiner pass. Unclear writing is flagged rather than guessed.</p>
        </div>
      </div>

      {!results ? (
        <>
          <Card className="border-blue-100 bg-blue-50/50">
            <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-800">Paper name / code (optional)</label>
                <Input value={paperLabel} onChange={event => setPaperLabel(event.target.value)} placeholder="e.g. AQA 8461/1 Biology Paper 1" />
              </div>
              <div className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-xs font-semibold text-blue-900">Question paper + official scheme = strongest marking</div>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            {uploadCard('Blank question paper', 'Recommended so every sub-question and maximum mark can be mapped accurately.', questionPaperFile, setQuestionPaperFile, 'purple')}
            {uploadCard('Official mark scheme', 'Strongly recommended. It is treated as the primary authority for every marking point.', markSchemeFile, setMarkSchemeFile, 'green')}
          </div>

          <Card className="border-blue-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Images className="h-5 w-5 text-blue-700" />Completed script — multiple page photos</CardTitle>
              <CardDescription>Select many JPG/PNG/WEBP photos at once. Put them in page order using the arrows. Each page is analysed separately so a long script does not need to be squeezed into one upload.</CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/60 p-7 text-center hover:bg-blue-50">
                <UploadCloud className="h-10 w-10 text-blue-500" />
                <span className="mt-3 font-bold text-blue-950">Add script photos</span>
                <span className="mt-1 text-xs text-blue-700">Select up to {MAX_PHOTOS} pages · straight-on, well lit photos work best</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={event => { addPhotos(event.target.files); event.currentTarget.value = ''; }} />
              </label>

              {scriptPhotos.length ? (
                <div className="mt-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="font-bold">Page order</div><BadgeLike>{scriptPhotos.length} photo{scriptPhotos.length === 1 ? '' : 's'}</BadgeLike></div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {scriptPhotos.map((page, index) => (
                      <div key={page.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="relative aspect-[3/4] bg-slate-100"><img src={page.previewUrl} alt={`Script page ${index + 1}`} className="h-full w-full object-contain" /><div className="absolute left-2 top-2 rounded-lg bg-slate-950/85 px-2 py-1 text-xs font-bold text-white">Page {index + 1}</div></div>
                        <div className="flex items-center gap-1 border-t p-2">
                          <button type="button" disabled={index === 0} onClick={() => movePhoto(index, -1)} className="rounded border p-1.5 disabled:opacity-30" title="Move page earlier"><ArrowUp size={15} /></button>
                          <button type="button" disabled={index === scriptPhotos.length - 1} onClick={() => movePhoto(index, 1)} className="rounded border p-1.5 disabled:opacity-30" title="Move page later"><ArrowDown size={15} /></button>
                          <span className="min-w-0 flex-1 truncate px-1 text-xs text-slate-500" title={page.file.name}>{page.file.name}</span>
                          <button type="button" onClick={() => removePhoto(page.id)} className="rounded border border-red-200 p-1.5 text-red-600" title="Remove page"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-lg">Or upload one completed-script file</CardTitle><CardDescription>Use this for a combined PDF, DOCX or TXT script instead of page photos. You can also use it alongside photos for extra pages.</CardDescription></CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed bg-slate-50 p-4">
                <Input type="file" accept=".pdf,.docx,.txt" className="max-w-sm" onChange={event => chooseFile(event.target.files?.[0], setExamFile)} />
                {examFile ? <div className="text-sm"><strong>{examFile.name}</strong> <button type="button" className="ml-2 text-red-600 hover:underline" onClick={() => setExamFile(null)}>Remove</button></div> : <span className="text-sm text-slate-500">No combined file selected</span>}
              </div>
            </CardContent>
          </Card>

          <div>
            <label className="mb-2 block text-sm font-bold uppercase text-slate-500">Optional transcription / extra answer notes</label>
            <textarea className="min-h-[130px] w-full rounded-xl border border-slate-300 bg-white p-4 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional: add question-numbered typed/transcribed answers if a page is especially difficult to read." value={examText} onChange={event => setExamText(event.target.value)} />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex gap-2 rounded-xl border bg-white p-4 text-sm"><SearchCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /><span><strong>Two-pass handwriting:</strong> each photo is transcribed, then independently checked for digits, signs, equations, units and diagrams.</span></div>
            <div className="flex gap-2 rounded-xl border bg-white p-4 text-sm"><FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" /><span><strong>Two-pass marking:</strong> the first examiner marks the paper and a second audit looks for both over-marking and under-marking.</span></div>
            <div className="flex gap-2 rounded-xl border bg-white p-4 text-sm"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" /><span><strong>No guessing:</strong> ambiguous handwriting is linked to the affected question and sent to manual review.</span></div>
          </div>

          {!markSchemeFile || !questionPaperFile ? <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />The marker can work without both reference files, but confidence is deliberately reduced. For the most accurate result, upload the matching question paper and official mark scheme.</div> : null}
        </>
      ) : null}

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      {!results ? (
        <div className="space-y-3">
          {isProcessing ? <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><div className="flex items-center justify-between gap-3"><strong className="text-blue-950">{processingStage || 'Analysing exam…'}</strong>{scriptPhotos.length ? <span className="text-sm font-bold text-blue-800">{Math.min(pageProgress, scriptPhotos.length)}/{scriptPhotos.length} pages</span> : null}</div>{scriptPhotos.length ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full bg-blue-600 transition-all" style={{ width: `${Math.max(3, Math.round(Math.min(pageProgress, scriptPhotos.length) / scriptPhotos.length * 100))}%` }} /></div> : null}</div> : null}
          <div className="flex justify-center"><Button size="lg" className="w-full rounded-xl px-12 py-6 text-lg font-bold shadow-md md:w-auto" disabled={(!examFile && !scriptPhotos.length && !examText.trim()) || isProcessing} onClick={handleProcess}>{isProcessing ? 'Analysing and auditing…' : 'Mark full exam script'}</Button></div>
        </div>
      ) : null}

      {results ? (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-between gap-2"><Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print report</Button><Button variant="outline" onClick={downloadCsv}><Download className="mr-2 h-4 w-4" />Download audited CSV</Button></div>

          <div className="grid gap-4 md:grid-cols-6">
            <Card className="border-0 bg-slate-950 text-white shadow-lg md:col-span-2"><CardContent className="p-6"><p className="text-sm font-medium uppercase tracking-wider text-slate-400">Audited total</p><div className="mt-2 text-4xl font-bold">{results.totalScore}<span className="text-xl text-slate-500"> / {results.maxScore}</span></div><div className="mt-2 text-sm text-slate-300">{results.percent ?? (results.maxScore ? Math.round(results.totalScore / results.maxScore * 100) : 0)}%</div></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-xs font-bold uppercase text-slate-500">Practice band</p><div className="mt-2 text-4xl font-bold text-blue-700">{results.estimatedGrade}</div><p className="mt-2 text-xs text-slate-500">Indicative only</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-xs font-bold uppercase text-slate-500">Attempted</p><div className="mt-2 text-3xl font-bold">{results.questionsAttempted}<span className="text-lg text-slate-400"> / {results.totalQuestions}</span></div></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-xs font-bold uppercase text-slate-500">Examiner confidence</p><div className="mt-2 text-3xl font-bold">{results.examinerConfidence ?? 0}%</div><p className="mt-2 text-xs text-slate-500">{results.reviewRecommendedCount ?? 0} flagged</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-xs font-bold uppercase text-slate-500">Handwriting</p><div className="mt-2 text-3xl font-bold">{results.handwritingAudit?.photoPagesAnalyzed ? `${results.handwritingAudit.averageConfidence}%` : '—'}</div><p className="mt-2 text-xs text-slate-500">{results.handwritingAudit?.photoPagesAnalyzed || 0} photo page(s)</p></CardContent></Card>
          </div>

          {results.gradeNotice ? <div className="rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">{results.gradeNotice}</div> : null}

          {results.handwritingAudit?.photoPagesAnalyzed ? <Card className="border-indigo-200 bg-indigo-50/40"><CardHeader><CardTitle className="text-lg">Handwriting integrity check</CardTitle><CardDescription>Every uploaded photo was read twice before marking.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-4"><div className="rounded-xl border bg-white p-3 text-sm"><strong>Photos analysed:</strong> {results.handwritingAudit.photoPagesAnalyzed}</div><div className="rounded-xl border bg-white p-3 text-sm"><strong>Average confidence:</strong> {results.handwritingAudit.averageConfidence}%</div><div className="rounded-xl border bg-white p-3 text-sm"><strong>Unclear segments:</strong> {results.handwritingAudit.totalUnclearSegments}</div><div className="rounded-xl border bg-white p-3 text-sm"><strong>Pages needing care:</strong> {results.handwritingAudit.unclearPages.length ? results.handwritingAudit.unclearPages.join(', ') : 'None'}</div></CardContent></Card> : null}

          <Card className="border-slate-200"><CardHeader><CardTitle>Paper integrity check</CardTitle><CardDescription>{results.confidenceReason}</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><div className={`rounded-xl border p-3 text-sm ${results.paperAudit?.questionPaperMatched ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}><strong>Question paper:</strong> {results.paperAudit?.questionPaperMatched ? 'matched' : 'not fully matched'}</div><div className={`rounded-xl border p-3 text-sm ${results.paperAudit?.markSchemeMatched ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}><strong>Mark scheme:</strong> {results.paperAudit?.markSchemeMatched ? 'matched' : 'not fully matched'}</div><div className="rounded-xl border p-3 text-sm"><strong>Pages detected:</strong> {results.paperAudit?.pagesDetected || 'Not reported'}</div>{results.paperAudit?.warnings?.length ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 md:col-span-3"><div className="mb-2 font-bold text-amber-900">Review warnings</div><ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">{results.paperAudit.warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}</ul></div> : null}</CardContent></Card>

          {pageAnalyses.some(page => page.warnings.length || page.unclearSegments.length) ? <Card className="border-amber-200"><CardHeader><CardTitle className="text-lg">Photo-page reading notes</CardTitle></CardHeader><CardContent className="space-y-2">{pageAnalyses.filter(page => page.warnings.length || page.unclearSegments.length).map(page => <details key={page.pageNumber} className="rounded-xl border bg-amber-50/50 p-3"><summary className="cursor-pointer font-bold">Page {page.pageNumber} · {page.handwritingConfidence}% handwriting confidence · {page.pageQuality}</summary>{page.warnings.length ? <ul className="mt-2 list-disc pl-5 text-sm text-amber-900">{page.warnings.map((item, index) => <li key={index}>{item}</li>)}</ul> : null}{page.unclearSegments.length ? <div className="mt-2 text-sm"><strong>Unclear:</strong> {page.unclearSegments.join(' · ')}</div> : null}</details>)}</CardContent></Card> : null}

          <Card className="border-red-200 bg-red-50 shadow-sm"><CardContent className="p-6"><p className="text-sm font-bold uppercase tracking-wider text-red-800">Priority revision area</p><div className="mt-1 text-xl font-bold text-red-900">{results.topRevisionPriority?.topic || 'More evidence needed'}</div><p className="mt-1 text-sm text-red-700">Average: {results.topRevisionPriority?.avgScorePercent ?? 0}%</p><p className="mt-2 text-sm text-red-700">{results.topRevisionPriority?.notes}</p></CardContent></Card>

          <Card className="border-slate-200 shadow-sm"><CardHeader className="border-b bg-slate-50 pb-4"><CardTitle className="text-lg">Question-by-question marking</CardTitle><CardDescription>Every row contributes to the audited total. Handwriting uncertainty is shown separately from science marking confidence.</CardDescription></CardHeader><CardContent className="pt-5"><label className="mb-4 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={reviewOnly} onChange={event => setReviewOnly(event.target.checked)} />Show only review flags</label><div className="space-y-3">{visibleQuestions.map(question => <details key={question.questionNumber} className={`rounded-xl border p-4 ${question.reviewRecommended ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'}`}><summary className="cursor-pointer list-none"><div className="flex flex-wrap items-center gap-3"><span className="min-w-16 font-bold">Q{question.questionNumber}</span><span className="text-sm text-slate-600">{question.topic}</span>{question.evidencePages?.length ? <span className="text-xs text-slate-500">page {question.evidencePages.join(', ')}</span> : null}<span className="ml-auto text-lg font-extrabold">{question.score}/{question.maxMarks}</span><span className={`rounded px-2 py-1 text-xs font-bold ${question.confidence < 70 ? 'bg-red-100 text-red-800' : question.confidence < 85 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{question.confidence}% mark confidence</span>{typeof question.handwritingConfidence === 'number' && results.handwritingAudit?.photoPagesAnalyzed ? <span className={`rounded px-2 py-1 text-xs font-bold ${question.handwritingConfidence < 70 ? 'bg-red-100 text-red-800' : question.handwritingConfidence < 85 ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>{question.handwritingConfidence}% writing</span> : null}{question.reviewRecommended ? <span className="rounded bg-amber-200 px-2 py-1 text-xs font-bold text-amber-900">Review</span> : null}</div></summary><div className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-2"><div><div className="text-xs font-bold uppercase text-slate-500">Examiner comment</div><p className="mt-1 text-sm">{question.examinerComment}</p></div><div><div className="text-xs font-bold uppercase text-slate-500">Student evidence</div><p className="mt-1 whitespace-pre-wrap text-sm">{question.studentEvidence || 'No reliable evidence transcribed.'}</p></div>{question.transcriptionIssue ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 md:col-span-2"><div className="text-xs font-bold uppercase text-amber-800">Handwriting / transcription issue</div><p className="mt-1 text-sm text-amber-900">{question.transcriptionIssue}</p></div> : null}<div><div className="text-xs font-bold uppercase text-red-700">Marks lost</div>{question.lostMarks.length ? <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{question.lostMarks.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p className="mt-1 text-sm text-green-700">No lost-mark reason recorded.</p>}</div><div><div className="text-xs font-bold uppercase text-blue-700">How to improve</div>{question.improvements.length ? <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{question.improvements.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p className="mt-1 text-sm text-slate-600">No additional action recorded.</p>}</div></div></details>)}{!visibleQuestions.length ? <p className="text-sm text-slate-500">No question rows match this filter.</p> : null}</div></CardContent></Card>

          <div className="grid gap-5 md:grid-cols-2"><Card><CardHeader><CardTitle className="text-lg">Strengths</CardTitle></CardHeader><CardContent>{results.overallStrengths?.length ? <ul className="list-disc space-y-2 pl-5 text-sm">{results.overallStrengths.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p className="text-sm text-slate-500">No reliable strengths summary returned.</p>}</CardContent></Card><Card><CardHeader><CardTitle className="text-lg">Next revision actions</CardTitle></CardHeader><CardContent>{results.revisionActions?.length ? <ol className="list-decimal space-y-2 pl-5 text-sm">{results.revisionActions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol> : <p className="text-sm text-slate-500">Use the question-level lost marks above to plan revision.</p>}</CardContent></Card></div>

          <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle className="text-lg">Topic performance</CardTitle></CardHeader><CardContent>{results.topicBreakdown?.length ? <div className="space-y-4">{results.topicBreakdown.map(topic => <div key={topic.name}><div className="mb-1 flex justify-between text-sm font-bold"><span>{topic.name}</span><span>{topic.scorePercent}% {typeof topic.earnedMarks === 'number' ? `(${topic.earnedMarks}/${topic.availableMarks})` : ''}</span></div><div className="h-3 rounded-full bg-slate-100"><div className={`h-3 rounded-full ${topic.scorePercent < 50 ? 'bg-red-500' : topic.scorePercent < 80 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.max(0, Math.min(100, topic.scorePercent))}%` }} /></div></div>)}</div> : <p className="text-sm text-slate-500">No topic breakdown was available.</p>}</CardContent></Card>

          <div className="flex justify-center"><Button variant="outline" onClick={() => { setResults(null); setError(''); setReviewOnly(false); setProcessingStage(''); }}>Mark another paper</Button></div>
        </div>
      ) : null}
    </div>
  );
}

function BadgeLike({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">{children}</span>;
}
