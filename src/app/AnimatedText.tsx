'use client';

import React, { useState, useEffect } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function AnimatedText({ text, className = '', delay = 150 }: AnimatedTextProps) {
  const [visibleWords, setVisibleWords] = useState<string[]>([]);
  const words = text.split(' ');

  useEffect(() => {
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < words.length) {
        setVisibleWords(prev => [...prev, words[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(timer);
      }
    }, delay);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <h1 className={className}>
      {visibleWords.map((word, index) => (
        <span key={index} className="inline-block opacity-0 animate-fade-in-word">
          {word}{' '}
        </span>
      ))}
    </h1>
  );
}
