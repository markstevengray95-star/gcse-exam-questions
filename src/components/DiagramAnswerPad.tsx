"use client";

import { useEffect, useRef, useState } from 'react';
import type { AnswerImage } from '@/components/PracticeEnhancements';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eraser, Grid3X3, LineChart, Pencil, Trash2 } from 'lucide-react';

type Tool = 'pen' | 'eraser';

export function DiagramAnswerPad({ image, onImage, disabled = false }: {
  image: AnswerImage | null;
  onImage: (image: AnswerImage | null) => void;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [status, setStatus] = useState('');

  const fillWhite = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  useEffect(() => { fillWhite(); }, []);

  const canvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const resetCanvas = () => {
    fillWhite();
    if (image?.name === 'graph-or-diagram.png') onImage(null);
    setStatus('Canvas cleared.');
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = canvasPoint(event);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const previous = lastPointRef.current;
    if (!canvas || !ctx || !previous) return;
    const next = canvasPoint(event);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : '#111827';
    ctx.lineWidth = tool === 'eraser' ? 18 : 3;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    ctx.restore();
    lastPointRef.current = next;
  };

  const stopDrawing = () => { drawingRef.current = false; lastPointRef.current = null; };

  const addGrid = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let x = 50; x < canvas.width; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 50; y < canvas.height; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    ctx.restore();
    setStatus('Graph grid added.');
  };

  const addAxes = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const left = 90;
    const bottom = canvas.height - 70;
    ctx.save();
    ctx.strokeStyle = '#111827';
    ctx.fillStyle = '#111827';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(left, bottom); ctx.lineTo(canvas.width - 45, bottom); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(left, bottom); ctx.lineTo(left, 40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvas.width - 45, bottom); ctx.lineTo(canvas.width - 60, bottom - 8); ctx.lineTo(canvas.width - 60, bottom + 8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(left, 40); ctx.lineTo(left - 8, 55); ctx.lineTo(left + 8, 55); ctx.closePath(); ctx.fill();
    ctx.font = '22px sans-serif';
    ctx.fillText('x', canvas.width - 35, bottom + 8);
    ctx.fillText('y', left - 8, 28);
    ctx.restore();
    setStatus('Graph axes added. Add variable labels and units with the pen.');
  };

  const attachDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const previewUrl = canvas.toDataURL('image/png');
    const data = previewUrl.split(',')[1];
    if (!data) return;
    onImage({ inlineData: { data, mimeType: 'image/png' }, previewUrl, name: 'graph-or-diagram.png' });
    setStatus('Drawing attached. It will replace any previously attached answer image and be inspected by the AI examiner.');
  };

  const drawingAttached = image?.name === 'graph-or-diagram.png';

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="font-semibold">Graph & diagram answer pad</div><div className="text-xs text-gray-500">Draw graphs, field lines, force diagrams, ray diagrams, circuits or working. Attach the canvas before marking.</div></div>
        {drawingAttached ? <Badge className="bg-green-600">Drawing attached</Badge> : <Badge variant="outline">Canvas not attached</Badge>}
      </div>
      {image && !drawingAttached ? <div className="mt-2 text-xs text-amber-700">A handwritten image is currently attached. Attaching this canvas will replace that image.</div> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={tool === 'pen' ? 'default' : 'outline'} onClick={() => setTool('pen')} disabled={disabled}><Pencil size={14} className="mr-1" /> Pen</Button>
        <Button type="button" size="sm" variant={tool === 'eraser' ? 'default' : 'outline'} onClick={() => setTool('eraser')} disabled={disabled}><Eraser size={14} className="mr-1" /> Eraser</Button>
        <Button type="button" size="sm" variant="outline" onClick={addGrid} disabled={disabled}><Grid3X3 size={14} className="mr-1" /> Grid</Button>
        <Button type="button" size="sm" variant="outline" onClick={addAxes} disabled={disabled}><LineChart size={14} className="mr-1" /> Axes</Button>
        <Button type="button" size="sm" variant="outline" onClick={resetCanvas} disabled={disabled}><Trash2 size={14} className="mr-1" /> Clear</Button>
      </div>
      <div className="mt-3 overflow-hidden rounded border bg-white">
        <canvas ref={canvasRef} width={900} height={500} className="block h-auto w-full touch-none cursor-crosshair" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} onPointerLeave={stopDrawing} aria-label="Physics graph and diagram drawing canvas" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-gray-500">Include axis labels, units, arrow directions and key annotations where required.</span>
        <div className="flex gap-2">{drawingAttached ? <Button type="button" variant="outline" size="sm" onClick={() => onImage(null)}>Detach</Button> : null}<Button type="button" size="sm" onClick={attachDrawing} disabled={disabled}>Attach drawing to answer</Button></div>
      </div>
      {status ? <div className="mt-2 text-xs text-blue-700">{status}</div> : null}
    </div>
  );
}
