import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface KeywordTrackerProps {
  answer: string;
  requiredKeywords: string[];
}

export function KeywordTracker({ answer, requiredKeywords }: KeywordTrackerProps) {
  const [isHidden, setIsHidden] = useState(false);
  const lowerAnswer = answer.toLowerCase();

  const isFound = (kw: string) => {
    // Basic checking, ignores complex punctuation for now
    return lowerAnswer.includes(kw.toLowerCase());
  };

  const foundCount = requiredKeywords.filter(kw => isFound(kw)).length;
  const totalCount = requiredKeywords.length;

  return (
    <Card className="p-4 bg-white shadow-sm border-gray-200">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-gray-800">
          Required Keywords
          <span className="ml-2 text-sm font-normal text-gray-500">({foundCount}/{totalCount})</span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs flex gap-1"
          onClick={() => setIsHidden(!isHidden)}
        >
          {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
          {isHidden ? 'Show' : 'Hide/Test Memory'}
        </Button>
      </div>

      <div className={`flex flex-wrap gap-2 transition-opacity duration-300 ${isHidden ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        {requiredKeywords.map((kw, i) => {
          const found = isFound(kw);
          return (
            <span
              key={i}
              className={`px-2 py-1 rounded text-xs font-semibold border transition-colors duration-300 ${
                found
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}
            >
              {kw}
            </span>
          );
        })}
        {requiredKeywords.length === 0 && (
          <span className="text-xs text-gray-400 italic">No specific keywords required.</span>
        )}
      </div>
    </Card>
  );
}
