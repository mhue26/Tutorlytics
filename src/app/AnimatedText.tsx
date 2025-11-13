'use client';

import React, { useMemo } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function AnimatedText({ text, className = '', delay = 150 }: AnimatedTextProps) {
  const words = useMemo(() => text.split(' '), [text]);

  return (
    <h1 className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className="block opacity-0 animate-fade-in-word"
          style={{ animationDelay: `${index * delay}ms` }}
        >
          {word}
        </span>
      ))}
    </h1>
  );
}
