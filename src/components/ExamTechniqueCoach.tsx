"use client";

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, CheckCircle2, CircleAlert, FlaskConical, GraduationCap, Sigma, Target } from 'lucide-react';

type CommandCard = {
  word: string;
  meaning: string;
  doThis: string;
  avoid: string;
  example: string;
};

const COMMANDS: CommandCard[] = [
  { word: 'Calculate', meaning: 'Use numbers given in the question to work out an answer.', doThis: 'Write the equation, substitute values, calculate, then give the unit.', avoid: 'A final number with no working when method marks may be available.', example: 'P = E/t → substitute → answer in W.' },
  { word: 'Compare', meaning: 'Describe similarities and/or differences between things.', doThis: 'Make direct links: “A is higher than B because…” or “Both…, whereas…”', avoid: 'Writing one paragraph about A and another unrelated paragraph about B.', example: 'Both contain DNA, whereas only the eukaryotic cell has a nucleus.' },
  { word: 'Describe', meaning: 'Give an accurate account of facts, events or a process.', doThis: 'State what happens in a clear sequence using precise scientific terms.', avoid: 'Adding unsupported reasons when only a description is asked for.', example: 'The temperature rises, reaches a maximum, then remains constant.' },
  { word: 'Determine', meaning: 'Use given data or information to obtain an answer.', doThis: 'Select the relevant data, show processing and state the conclusion.', avoid: 'Ignoring the data supplied in the stem, graph or table.', example: 'Read two values from the graph, calculate the gradient, then state the rate.' },
  { word: 'Evaluate', meaning: 'Use supplied information and scientific knowledge to consider evidence and make a judgement.', doThis: 'Give evidence for and against, discuss limitations, then finish with a justified judgement.', avoid: 'A list of advantages with no counterpoint or final judgement.', example: 'Method A is faster, but B is more precise; overall B is preferable because…' },
  { word: 'Explain', meaning: 'Make something clear or state why it happens.', doThis: 'Build linked cause → effect chains using because, therefore, so, due to or leads to.', avoid: 'Listing correct facts without showing how they are connected.', example: 'Temperature rises, so particles have more kinetic energy and collide more often; therefore rate increases.' },
  { word: 'Give / Name', meaning: 'A short answer is required.', doThis: 'Answer directly with the scientific term or short phrase.', avoid: 'Writing a long explanation that wastes time.', example: 'Name the gas: oxygen.' },
  { word: 'Justify', meaning: 'Use evidence from the information supplied to support an answer.', doThis: 'State the choice and attach a specific piece of evidence or data.', avoid: 'Giving an opinion without evidence.', example: 'Choose material B because its mean temperature drop is only 4 °C.' },
  { word: 'Plan', meaning: 'Write a method.', doThis: 'Include apparatus, independent/dependent/control variables, measurements, repeats and data processing.', avoid: 'A vague method with no variables, quantities or way to analyse results.', example: 'Change concentration, measure gas volume every 10 s, control temperature, repeat and calculate a mean.' },
  { word: 'Predict', meaning: 'Give a plausible outcome.', doThis: 'State what you expect and, when marks allow, link it to relevant science.', avoid: 'Treating a prediction as an unexplained guess.', example: 'The rate will increase because a higher concentration gives more frequent collisions.' },
  { word: 'Show', meaning: 'Provide structured evidence to reach a conclusion.', doThis: 'Set out the mathematical or logical steps clearly.', avoid: 'Writing only the final answer.', example: 'Use the equation, show substitution and arrive at the stated result.' },
  { word: 'Suggest', meaning: 'Apply knowledge and understanding to a new situation.', doThis: 'Give a scientifically plausible idea that fits the unfamiliar context.', avoid: 'Repeating the question without applying science.', example: 'Suggest why leaves are smaller: reduced surface area can reduce water loss.' },
  { word: 'Use', meaning: 'Base the answer on information supplied in the question.', doThis: 'Quote or process a relevant value, trend or observation from the data.', avoid: 'Answering only from memory and never using the supplied information.', example: 'Use the graph: rate falls from 18 to 9 units, so it halves.' },
];

const TERMS = [
  ['Accuracy', 'How close a measurement is to the true value.', 'Improve calibration, zero errors and method bias.'],
  ['Precision', 'How closely repeated measurements agree or how finely they can be recorded.', 'Use higher-resolution apparatus and consistent technique.'],
  ['Repeatability', 'Same person, method and equipment can obtain similar results.', 'Repeat measurements under the same conditions.'],
  ['Reproducibility', 'Different people or methods can obtain similar results.', 'Compare results produced independently.'],
  ['Validity', 'The method tests the intended relationship fairly.', 'Control variables so only the intended independent variable changes.'],
  ['Independent variable', 'The factor deliberately changed.', 'State the range and intervals.'],
  ['Dependent variable', 'The factor measured in response.', 'State exactly what is measured and the unit.'],
  ['Control variable', 'A factor kept constant to make the test fair.', 'Say how it is controlled, not just “keep it the same”.'],
  ['Anomaly', 'A result that does not fit the overall pattern.', 'Identify it using the data; do not automatically delete it.'],
  ['Random error', 'Unpredictable variation between measurements.', 'Reduce its effect with repeats and a mean.'],
  ['Systematic error', 'A consistent bias that shifts readings in one direction.', 'Fix calibration/zero/method bias; repeats alone do not remove it.'],
  ['Correlation', 'Two variables change together.', 'Do not claim causation unless the evidence supports a causal link.'],
  ['Directly proportional', 'The ratio y/x is constant; graph is a straight line through the origin.', 'Do not use this phrase for any straight line that misses the origin.'],
  ['Mass', 'Amount of matter, measured in kilograms.', 'Do not use N for mass.'],
  ['Weight', 'Force caused by gravity, measured in newtons.', 'Use W = mg when needed.'],
  ['Current', 'Rate of flow of charge.', 'Do not say current is “used up”.'],
  ['Potential difference', 'Energy transferred per unit charge between two points.', 'Use V, not “current”, when describing energy-per-charge differences.'],
];

const QUIZ = [
  { prompt: 'A question says: “Evaluate which insulation material should be used.” What must your answer include?', options: ['Only the best material', 'Evidence for/against and a justified judgement', 'A definition of insulation'], correct: 1, why: 'Evaluate requires weighing evidence and reaching a judgement.' },
  { prompt: 'A question says: “Compare artery A with vein B.” Which sentence is strongest?', options: ['Arteries have thick walls. Veins have valves.', 'Artery A has a thicker wall than vein B, whereas vein B has valves.', 'Arteries carry blood.'], correct: 1, why: 'Compare needs direct similarities/differences involving both items.' },
  { prompt: 'Which improves reliability most directly?', options: ['Repeat and calculate a mean', 'Use a ruler with smaller divisions', 'Add more control variables after the experiment'], correct: 0, why: 'Repeats and a mean reduce the effect of random variation.' },
  { prompt: 'A 6-mark “Explain” response contains six correct keywords but no links. What is missing?', options: ['More keywords', 'Cause-and-effect reasoning', 'A graph'], correct: 1, why: 'Extended explanations need linked scientific reasoning, not just keyword lists.' },
  { prompt: 'A question says “Use the graph to justify your answer.” What should you do?', options: ['Give your opinion', 'Quote/process graph evidence and link it to the conclusion', 'Ignore the graph if you know the topic'], correct: 1, why: '“Use” means the supplied information must feature in the answer.' },
];

export function ExamTechniqueCoach() {
  const [search, setSearch] = useState('');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);

  const visibleCommands = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return COMMANDS;
    return COMMANDS.filter(item =>
      `${item.word} ${item.meaning} ${item.doThis}`.toLowerCase().includes(query),
    );
  }, [search]);

  const quiz = QUIZ[quizIndex % QUIZ.length];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <GraduationCap className="mt-1 text-blue-700" size={24} />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Exam terminology & technique</div>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Know what the examiner is asking for</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">Command words, practical vocabulary, calculation habits and common wording traps for AQA GCSE Science.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <Sigma size={18} className="text-blue-700" />
          <div className="mt-2 font-bold">Calculations</div>
          <p className="mt-1 text-sm text-slate-600">Equation → substitution → working → final value → unit. Keep extra precision until the final step.</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <Target size={18} className="text-rose-700" />
          <div className="mt-2 font-bold">6-mark answers</div>
          <p className="mt-1 text-sm text-slate-600">Plan before writing. Cover several relevant points, link them logically, and answer the command word—not just the topic.</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <FlaskConical size={18} className="text-emerald-700" />
          <div className="mt-2 font-bold">Practicals</div>
          <p className="mt-1 text-sm text-slate-600">Name variables, apparatus, measurements, controls, repeats, data processing and a specific improvement.</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <BookOpenCheck size={18} className="text-violet-700" />
          <div className="mt-2 font-bold">Use the context</div>
          <p className="mt-1 text-sm text-slate-600">When the question says “use”, quote a number, trend, graph feature or observation from the information provided.</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-bold">AQA command-word coach</h3>
            <p className="mt-1 text-sm text-slate-600">Search a command word and see exactly how to turn it into exam-writing actions.</p>
          </div>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search: evaluate, compare, use…"
            className="w-full rounded-lg border px-3 py-2 text-sm md:w-72"
          />
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {visibleCommands.map(item => (
            <div key={item.word} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-lg font-extrabold">{item.word}</h4>
                <Badge variant="outline">Exam command</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-700">{item.meaning}</p>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-950"><strong>Do:</strong> {item.doThis}</div>
                <div className="rounded-lg bg-rose-50 p-3 text-rose-950"><strong>Avoid:</strong> {item.avoid}</div>
                <div className="rounded-lg bg-slate-50 p-3"><strong>Example:</strong> {item.example}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold">Science terminology that wins or loses marks</h3>
          <p className="mt-1 text-sm text-slate-600">Pairs students often mix up in exam answers.</p>
          <div className="mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {TERMS.map(([term, meaning, technique]) => (
              <div key={term} className="rounded-xl border p-3">
                <div className="font-bold">{term}</div>
                <div className="mt-1 text-sm text-slate-700">{meaning}</div>
                <div className="mt-1 text-xs font-medium text-blue-800">Exam move: {technique}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold">30-second answer check</h3>
            <div className="mt-4 space-y-2 text-sm">
              {[
                'Have I answered the command word rather than just the topic?',
                'For a calculation: equation, substitution, working, final answer and unit?',
                'For “use”: have I quoted or processed evidence from the question?',
                'For “compare”: have I directly linked both things?',
                'For “explain”: have I shown cause → effect?',
                'For “evaluate”: have I considered both sides and made a judgement?',
                'For a practical: have I said what changes, what is measured, what is controlled and how data is processed?',
                'Have I used precise terms rather than vague words such as “it”, “thing”, “goes up” or “better”?',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-amber-950"><CircleAlert size={18} />Quick examiner challenge</div>
            <p className="mt-3 text-sm font-semibold text-amber-950">{quiz.prompt}</p>
            <div className="mt-3 space-y-2">
              {quiz.options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setQuizChoice(index)}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                    quizChoice === null
                      ? 'bg-white hover:border-amber-400'
                      : index === quiz.correct
                        ? 'border-emerald-400 bg-emerald-50'
                        : quizChoice === index
                          ? 'border-rose-400 bg-rose-50'
                          : 'bg-white opacity-70'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {quizChoice !== null ? (
              <div className="mt-3 rounded-lg bg-white p-3 text-sm">
                <strong>{quizChoice === quiz.correct ? 'Correct.' : 'Not quite.'}</strong> {quiz.why}
              </div>
            ) : null}
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => {
                setQuizIndex(value => (value + 1) % QUIZ.length);
                setQuizChoice(null);
              }}
            >
              Next challenge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
