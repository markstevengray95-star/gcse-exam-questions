function numbers(text:string){return (text.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[]).map(Number).filter(Number.isFinite)}
function normalise(s:string){return s.toLowerCase().replace(/[²]/g,'2').replace(/[³]/g,'3').replace(/potential difference/g,'voltage').replace(/electromotive force/g,'emf').replace(/metres per second/g,'m s-1').replace(/\s+/g,' ').trim()}
const STOP=new Set(['the','and','with','from','that','this','uses','use','correct','value','answer','mark','then','therefore','into','when','where']);
function evidence(answer:string, scheme:string){
 const clean=normalise(scheme.replace(/\[[^\]]+\]/g,''));
 const words=(clean.match(/[a-z]{4,}|\d+(?:\.\d+)?/g)||[]).filter(w=>!STOP.has(w)).slice(0,8);
 const hits=words.filter(w=>answer.includes(w));
 const expected=numbers(clean.replace(/×10/g,'e'));
 const got=numbers(answer);
 const numericHit=expected.some(n=>got.some(a=>Math.abs(a-n)<=Math.max(Math.abs(n)*0.025,0.01)));
 const ratio=words.length?hits.length/words.length:0;
 return {words,hits,numericHit,strong:numericHit||ratio>=0.5};
}
export function offlineMark(body:any){
 const answer=normalise(String(body.studentAnswer||''));
 const maxMarks=Math.max(0,Math.trunc(Number(body.maxMarks)||0));
 const scheme=Array.isArray(body.markScheme)?body.markScheme:[];
 const calc=/calculate|determine|find/i.test(body.commandWord||'')||scheme.some((s:string)=>/\[(C|A)\d+\]/.test(s));
 const points=scheme.map((s:string)=>({scheme:s,...evidence(answer,s)}));
 const credited=points.filter((p:any)=>p.strong);
 const audit:any[]=[];
 if(calc){
   if(!/[=]/.test(answer))audit.push({issue:'Equation or calculation step not clearly shown.',suggestion:'Show the relevant science equation before substituting values.'});
   if(numbers(answer).length===0)audit.push({issue:'No numerical answer detected.',suggestion:'Show substitution and a final numerical answer.'});
   if(numbers(answer).length&& !/(\bkg\b|\bm\b|\bs\b|\bn\b|\bj\b|\bpa\b|\bv\b|\ba\b|\bhz\b|\bw\b|ohm|ω)/i.test(answer))audit.push({issue:'No clear unit detected.',suggestion:'State an appropriate unit for the final answer.'});
 }
 const contradictions=[['increase','decrease'],['accelerate','constant velocity'],['gain energy','lose energy']].filter(([a,b])=>answer.includes(a)&&answer.includes(b)).map(([a,b])=>`Check possible contradiction: both "${a}" and "${b}" appear.`);
 const awarded=Math.min(maxMarks,credited.length);
 const coverage=scheme.length?credited.length/scheme.length:0;
 const confidence=Math.max(25,Math.min(95,Math.round(45+coverage*45+(calc&&numbers(answer).length?5:0)-contradictions.length*15)));
 return {marksAwarded:awarded,totalMarks:maxMarks,commandWordCheck:{commandWord:body.commandWord||'None',satisfied:awarded>0,examinerNotes:'Offline evidence-based estimate; equivalent wording and numerical tolerance are supported.'},keywordAnalysis:{presentKeywords:[...new Set(credited.flatMap((p:any)=>p.hits))],missingKeywords:[...new Set(points.filter((p:any)=>!p.strong).flatMap((p:any)=>p.words))].slice(0,12),laymanTermsUsed:[]},creditedPoints:credited.map((p:any,i:number)=>({mark:p.scheme.match(/\[[^\]]+\]/)?.[0]||`Point ${i+1}`,studentEvidence:p.numericHit?'Numerical result matches an expected value within tolerance.':p.hits.join(', ')})),lostMarksAnalysis:points.filter((p:any)=>!p.strong).slice(0,Math.max(0,maxMarks-awarded)).map((p:any)=>({reason:`Missing or insufficient evidence for: ${p.words.join(', ')}`,improvementSuggestion:'Add the complete scientific relationship or calculation step, not just isolated keywords.'})),lorRubric:{levelAwarded:maxMarks>=4?(awarded>=Math.ceil(maxMarks*.8)?3:awarded>=Math.ceil(maxMarks*.45)?2:awarded?1:0):0,levelDescription:'Offline estimate',justification:'Based on explicit evidence for supplied points; extended responses should be reviewed by AI or a teacher for nuance.'},sigFigUnitAudit:audit,misconceptions:contradictions,inDepthAnalysis:{physicsPrinciples:'Rule-based marking checks explicit scheme evidence, equivalent scientific terminology and numerical agreement.',stepByStepReasoning:'Method evidence is preferred over final-answer-only evidence for calculations.',structureAndClarity:'Use linked scientific statements, equations, substitutions and a final answer.'},officialMarkScheme:scheme,modelAnswer:body.modelAnswer||'',examinerConfidence:confidence,confidenceReason:confidence>=75?'Clear evidence matched most available marking points.':confidence>=55?'Some evidence matched, but wording or missing working limits certainty.':'Limited or ambiguous evidence; review is recommended.',reviewRecommended:confidence<70};
}