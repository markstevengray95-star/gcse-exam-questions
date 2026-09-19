"use client";

import { useEffect, useMemo, useState } from 'react';
import { questions } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  ClipboardCopy,
  Download,
  GraduationCap,
  Link2,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';

type StudentSnapshot = {
  id: string;
  name: string;
  biology: number;
  chemistry: number;
  physics: number;
  completed: number;
  weakTopic: string;
};

type Assignment = {
  id: string;
  title: string;
  subject: string;
  topic: string;
  paper: string;
  tier: string;
  questionCount: number;
  deadline: string;
  createdAt: string;
};

const STUDENTS_KEY = 'aqaGcseScienceTeacherStudents';
const ASSIGNMENTS_KEY = 'aqaGcseScienceTeacherAssignments';

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null') as T | null;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function average(student: StudentSnapshot) {
  return Math.round((student.biology + student.chemistry + student.physics) / 3);
}

function exportCsv(rows: StudentSnapshot[]) {
  const header = ['Student', 'Biology %', 'Chemistry %', 'Physics %', 'Overall %', 'Questions completed', 'Weak topic'];
  const lines = rows.map(student => [
    student.name,
    student.biology,
    student.chemistry,
    student.physics,
    average(student),
    student.completed,
    student.weakTopic,
  ]);
  const csv = [header, ...lines].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'gcse-science-class-progress.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

function encodeAssignment(assignment: Pick<Assignment, 'subject' | 'topic' | 'paper' | 'tier' | 'questionCount'>) {
  const text = JSON.stringify(assignment);
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function TeacherDashboard() {
  const [students, setStudents] = useState<StudentSnapshot[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentName, setStudentName] = useState('');
  const [biology, setBiology] = useState(0);
  const [chemistry, setChemistry] = useState(0);
  const [physics, setPhysics] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [weakTopic, setWeakTopic] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('GCSE Science practice');
  const [subject, setSubject] = useState('All');
  const [topic, setTopic] = useState('All');
  const [paper, setPaper] = useState('All');
  const [tier, setTier] = useState('Higher');
  const [questionCount, setQuestionCount] = useState(10);
  const [deadline, setDeadline] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [snapshotCode, setSnapshotCode] = useState('');

  useEffect(() => {
    setStudents(safeLoad(STUDENTS_KEY, []));
    setAssignments(safeLoad(ASSIGNMENTS_KEY, []));
  }, []);

  const saveStudents = (next: StudentSnapshot[]) => {
    setStudents(next);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(next));
  };
  const saveAssignments = (next: Assignment[]) => {
    setAssignments(next);
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(next));
  };

  const topics = useMemo(() => {
    const pool = subject === 'All' ? questions : questions.filter(q => q.subject === subject);
    return Array.from(new Set(pool.map(q => q.topic))).sort();
  }, [subject]);

  useEffect(() => {
    if (topic !== 'All' && !topics.includes(topic)) setTopic('All');
  }, [topic, topics]);

  const decodePayload = (code: string) => {
    const normalised = code.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalised + '='.repeat((4 - normalised.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  };

  const importSnapshot = () => {
    try {
      const payload = decodePayload(snapshotCode.trim()) as Partial<StudentSnapshot> & { type?: string };
      if (payload.type !== 'gcse-progress-v1' || !payload.name) throw new Error('Not a GCSE Science progress snapshot');
      const student: StudentSnapshot = {
        id: `student-${Date.now()}`,
        name: String(payload.name),
        biology: Math.min(100, Math.max(0, Number(payload.biology) || 0)),
        chemistry: Math.min(100, Math.max(0, Number(payload.chemistry) || 0)),
        physics: Math.min(100, Math.max(0, Number(payload.physics) || 0)),
        completed: Math.max(0, Number(payload.completed) || 0),
        weakTopic: String(payload.weakTopic || 'Not recorded'),
      };
      saveStudents([...students.filter(item => item.name.toLowerCase() !== student.name.toLowerCase()), student]);
      setSnapshotCode('');
      setCopyStatus(`${student.name}'s progress imported`);
      window.setTimeout(() => setCopyStatus(''), 1800);
    } catch {
      setCopyStatus('That progress snapshot could not be read.');
    }
  };

  const addStudent = () => {
    if (!studentName.trim()) return;
    const next: StudentSnapshot = {
      id: `student-${Date.now()}`,
      name: studentName.trim(),
      biology: Math.min(100, Math.max(0, biology)),
      chemistry: Math.min(100, Math.max(0, chemistry)),
      physics: Math.min(100, Math.max(0, physics)),
      completed: Math.max(0, completed),
      weakTopic: weakTopic.trim() || 'Not recorded',
    };
    saveStudents([...students, next]);
    setStudentName('');
    setWeakTopic('');
    setBiology(0);
    setChemistry(0);
    setPhysics(0);
    setCompleted(0);
  };

  const assignmentPayload = { subject, topic, paper, tier, questionCount };
  const assignmentCode = encodeAssignment(assignmentPayload);

  const shareUrl = typeof window === 'undefined' ? '' : (() => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('assignment', assignmentCode);
    return url.toString();
  })();

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${label} copied`);
      window.setTimeout(() => setCopyStatus(''), 1800);
    } catch {
      setCopyStatus('Copy unavailable — select the text manually.');
    }
  };

  const saveAssignment = () => {
    const item: Assignment = {
      id: `assignment-${Date.now()}`,
      title: assignmentTitle.trim() || 'GCSE Science practice',
      ...assignmentPayload,
      deadline,
      createdAt: new Date().toISOString(),
    };
    saveAssignments([item, ...assignments].slice(0, 50));
  };

  const overallClassAverage = students.length ? Math.round(students.reduce((sum, student) => sum + average(student), 0) / students.length) : 0;
  const weakestSubject = students.length ? [
    ['Biology', students.reduce((sum, s) => sum + s.biology, 0) / students.length],
    ['Chemistry', students.reduce((sum, s) => sum + s.chemistry, 0) / students.length],
    ['Physics', students.reduce((sum, s) => sum + s.physics, 0) / students.length],
  ].sort((a, b) => Number(a[1]) - Number(b[1]))[0] : null;

  const interventions = useMemo(() => {
    const groups = {
      'Priority support (<50%)': students.filter(student => average(student) < 50),
      'Developing (50–69%)': students.filter(student => average(student) >= 50 && average(student) < 70),
      'Secure / stretch (70%+)': students.filter(student => average(student) >= 70),
    };
    return Object.entries(groups);
  }, [students]);

  const weakTopicCounts = useMemo(() => {
    const counts = new Map<string, number>();
    students.forEach(student => counts.set(student.weakTopic, (counts.get(student.weakTopic) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [students]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><GraduationCap size={22} /><div><div className="text-xs font-bold uppercase tracking-wide text-blue-700">Teacher workspace</div><h2 className="text-2xl font-extrabold">Class assignments & intervention dashboard</h2></div></div>
        <p className="mt-2 text-sm text-gray-600">Create targeted assignment links/codes, record class snapshots, identify intervention groups and export progress. Data is stored on this browser unless you export it.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4"><div className="text-xs font-bold uppercase text-gray-500">Students</div><div className="mt-1 text-3xl font-black">{students.length}</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-xs font-bold uppercase text-gray-500">Class average</div><div className="mt-1 text-3xl font-black">{students.length ? `${overallClassAverage}%` : '—'}</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-xs font-bold uppercase text-gray-500">Weakest science</div><div className="mt-1 text-xl font-black">{weakestSubject?.[0] || '—'}</div><div className="text-xs text-gray-500">{weakestSubject ? `${Math.round(Number(weakestSubject[1]))}% class mean` : 'Add class snapshots'}</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-xs font-bold uppercase text-gray-500">Saved assignments</div><div className="mt-1 text-3xl font-black">{assignments.length}</div></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><Link2 size={19} /><h3 className="text-lg font-bold">Set targeted homework</h3></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">Assignment title<input value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
            <label className="text-sm font-medium">Subject<select value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 w-full rounded border p-2"><option>All</option><option>Biology</option><option>Chemistry</option><option>Physics</option></select></label>
            <label className="text-sm font-medium">Topic<select value={topic} onChange={e => setTopic(e.target.value)} className="mt-1 w-full rounded border p-2"><option>All</option>{topics.map(item => <option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-medium">Paper<select value={paper} onChange={e => setPaper(e.target.value)} className="mt-1 w-full rounded border p-2"><option>All</option><option>Paper 1</option><option>Paper 2</option></select></label>
            <label className="text-sm font-medium">Tier<select value={tier} onChange={e => setTier(e.target.value)} className="mt-1 w-full rounded border p-2"><option>Foundation</option><option>Higher</option></select></label>
            <label className="text-sm font-medium">Questions<input type="number" min={1} max={50} value={questionCount} onChange={e => setQuestionCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} className="mt-1 w-full rounded border p-2" /></label>
            <label className="text-sm font-medium">Deadline<input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          </div>
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-bold uppercase text-gray-500">Student assignment code</div>
            <div className="mt-1 break-all font-mono text-xs">{assignmentCode}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => copy(assignmentCode, 'Code')}><ClipboardCopy size={14} /> Copy code</Button>
              <Button size="sm" variant="outline" onClick={() => copy(shareUrl, 'Link')}><Link2 size={14} /> Copy assignment link</Button>
              <Button size="sm" variant="outline" onClick={saveAssignment}>Save assignment</Button>
              <Button size="sm" variant="outline" onClick={() => window.open(`https://classroom.google.com/share?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer')}>Google Classroom</Button>
            </div>
            {copyStatus ? <div className="mt-2 text-xs text-emerald-700">{copyStatus}</div> : null}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><Users size={19} /><h3 className="text-lg font-bold">Add student progress snapshot</h3></div>
          <p className="mt-1 text-xs text-gray-500">Useful for a quick class overview without requiring student accounts. Enter exported/latest percentages from each student.</p>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="text-sm font-semibold text-blue-950">Import directly from a student&apos;s Learning Hub</div>
            <div className="mt-2 flex gap-2">
              <input value={snapshotCode} onChange={event => setSnapshotCode(event.target.value)} placeholder="Paste progress snapshot" className="min-w-0 flex-1 rounded border bg-white p-2 text-xs" />
              <Button size="sm" onClick={importSnapshot} disabled={!snapshotCode.trim()}>Import</Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">Student name<input value={studentName} onChange={e => setStudentName(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
            <label className="text-sm font-medium">Biology %<input type="number" min={0} max={100} value={biology} onChange={e => setBiology(Number(e.target.value) || 0)} className="mt-1 w-full rounded border p-2" /></label>
            <label className="text-sm font-medium">Chemistry %<input type="number" min={0} max={100} value={chemistry} onChange={e => setChemistry(Number(e.target.value) || 0)} className="mt-1 w-full rounded border p-2" /></label>
            <label className="text-sm font-medium">Physics %<input type="number" min={0} max={100} value={physics} onChange={e => setPhysics(Number(e.target.value) || 0)} className="mt-1 w-full rounded border p-2" /></label>
            <label className="text-sm font-medium">Questions completed<input type="number" min={0} value={completed} onChange={e => setCompleted(Number(e.target.value) || 0)} className="mt-1 w-full rounded border p-2" /></label>
            <label className="text-sm font-medium sm:col-span-2">Main weak topic<input value={weakTopic} onChange={e => setWeakTopic(e.target.value)} placeholder="e.g. Electrolysis" className="mt-1 w-full rounded border p-2" /></label>
          </div>
          <Button className="mt-4" onClick={addStudent}><Plus size={15} /> Add snapshot</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><BarChart3 size={19} /><h3 className="text-lg font-bold">Class overview & homework analysis</h3></div><Button variant="outline" size="sm" onClick={() => exportCsv(students)} disabled={!students.length}><Download size={14} /> Export CSV</Button></div>
        {students.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase text-gray-500"><th className="p-2">Student</th><th className="p-2">Biology</th><th className="p-2">Chemistry</th><th className="p-2">Physics</th><th className="p-2">Overall</th><th className="p-2">Completed</th><th className="p-2">Weak topic</th><th className="p-2"></th></tr></thead>
              <tbody>{students.map(student => <tr key={student.id} className="border-b"><td className="p-2 font-semibold">{student.name}</td><td className="p-2">{student.biology}%</td><td className="p-2">{student.chemistry}%</td><td className="p-2">{student.physics}%</td><td className="p-2"><Badge variant="outline">{average(student)}%</Badge></td><td className="p-2">{student.completed}</td><td className="p-2">{student.weakTopic}</td><td className="p-2"><button type="button" onClick={() => saveStudents(students.filter(item => item.id !== student.id))} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></td></tr>)}</tbody>
            </table>
          </div>
        ) : <div className="mt-4 rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">Add student snapshots to build class analytics and intervention groups.</div>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold">Automatic intervention groups</h3>
          <div className="mt-4 space-y-4">{interventions.map(([label, group]) => <div key={label}><div className="mb-2 flex items-center justify-between"><strong className="text-sm">{label}</strong><Badge variant="outline">{group.length}</Badge></div><div className="flex flex-wrap gap-2">{group.length ? group.map(student => <span key={student.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs">{student.name} · {average(student)}%</span>) : <span className="text-xs text-gray-400">No students in this group</span>}</div></div>)}</div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold">Common weak topics</h3>
          <div className="mt-4 space-y-3">{weakTopicCounts.length ? weakTopicCounts.map(([name, count]) => <div key={name} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">{name}</span><span>{count} student{count === 1 ? '' : 's'}</span></div>) : <div className="text-sm text-gray-500">Weak-topic patterns will appear as snapshots are added.</div>}</div>
        </div>
      </div>

      {assignments.length ? (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold">Recent assignments</h3>
          <div className="mt-4 space-y-2">{assignments.slice(0, 10).map(item => <div key={item.id} className="flex flex-col justify-between gap-2 rounded-lg border p-3 sm:flex-row sm:items-center"><div><div className="font-semibold">{item.title}</div><div className="text-xs text-gray-500">{item.subject} · {item.topic} · {item.paper} · {item.tier} · {item.questionCount} questions{item.deadline ? ` · due ${item.deadline}` : ''}</div></div><button type="button" onClick={() => saveAssignments(assignments.filter(a => a.id !== item.id))} className="self-start rounded p-2 text-red-600 hover:bg-red-50 sm:self-auto"><Trash2 size={15} /></button></div>)}</div>
        </div>
      ) : null}
    </div>
  );
}
