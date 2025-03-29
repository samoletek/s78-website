"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils/utils';
import { useDeviceDetection } from '@/lib/utils/device-detection';
import { storage } from '@/lib/utils/common';

export interface CaseCardProps {
  id?: string;
  title: string;
  description?: string;
  industry?: string;
  company: string;
  location?: string;
  results?: string[];
  image?: string;
  tags: string[];
  href: string;
  className?: string;
  isCompact?: boolean;
  priority?: boolean;
  onClick?: () => void;
}

const warmPalette = ['#FF4500', '#FF0000', '#FF5E13', '#FF1493', '#FFA500', '#FF4C00', '#FF2400'];

const getHash = (str: string) =>
  str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

const getTwoColors = (key: string) => {
  const hash = getHash(key);
  const index1 = hash % warmPalette.length;
  const index2 = (hash * 7) % warmPalette.length;
  return [
    warmPalette[index1],
    warmPalette[index2 === index1 ? (index2 + 1) % warmPalette.length : index2]
  ];
};

const getTwoOffsets = (key: string) => {
  const hash = getHash(key);
  const left1 = 10 + (hash % 30);
  const left2 = 60 + ((hash * 3) % 30);
  return [left1, left2];
};

export function CaseCard({
  id,
  title,
  description,
  industry,
  company,
  location,
  results,
  tags,
  href,
  className,
  isCompact = false,
  onClick
}: CaseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isMobile } = useDeviceDetection();

  const gradientKey = company + title;
  const [color1, color2] = getTwoColors(gradientKey);
  const [left1, left2] = getTwoOffsets(gradientKey);

  useEffect(() => {
    if (id && typeof window !== 'undefined') {
      const handleSaveToHistory = () => {
        const recentlyViewed = storage.get<string[]>('recentlyViewedCases', []);
        const filteredHistory = recentlyViewed.filter(caseId => caseId !== id);
        const updatedHistory = [id, ...filteredHistory].slice(0, 10);
        storage.set('recentlyViewedCases', updatedHistory);
      };

      const linkElement = document.querySelector(`a[href="${href}"]`);
      if (linkElement) {
        linkElement.addEventListener('click', handleSaveToHistory);
        return () => {
          linkElement.removeEventListener('click', handleSaveToHistory);
        };
      }
    }
  }, [id, href]);

  const cardHeight = isCompact ? 'auto' : 'min-h-[420px]';

  const cardContent = (
    <motion.div
      className={cn(
        'bg-dark-gray rounded-xl overflow-hidden border border-transparent',
        'transition-all duration-300 flex flex-col relative',
        isHovered ? 'border-primary/30 shadow-neon-glow' : 'shadow-sm',
        cardHeight,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Суперяркие пятна снизу */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        {[{ color: color1, left: left1 }, { color: color2, left: left2 }].map((spot, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: `${spot.left}%`,
              width: `220px`,
              height: `220px`,
              transform: 'translate(-50%, 50%)',
              borderRadius: '9999px',
              filter: 'blur(100px)',
              mixBlendMode: 'screen',
              background: `
                radial-gradient(circle, ${spot.color}FF 0%, transparent 60%),
                radial-gradient(circle, ${spot.color}FF 0%, transparent 50%),
                radial-gradient(circle, ${spot.color}CC 0%, transparent 70%),
                radial-gradient(circle, ${spot.color}AA 0%, transparent 80%),
                radial-gradient(circle, ${spot.color}88 0%, transparent 90%)
              `
            }}
          />
        ))}
      </div>

      {/* Теги */}
      <div className="relative pt-3 px-3 pb-3 z-10">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className="px-4 py-5 flex-grow z-10">
        <h3 className="text-xl font-semibold text-white leading-tight mb-2">
          {title}
        </h3>

        {description && !isCompact && (
          <p className="text-light-gray text-sm mb-4 line-clamp-3">
            {description}
          </p>
        )}

        {results && results.length > 0 && !isCompact && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-2 text-primary">Key results:</h4>
            <ul className="text-light-gray text-sm space-y-1">
              {results.slice(0, 4).map((result, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="line-clamp-1">{result}</span>
                </li>
              ))}
              {results.length > 4 && (
                <li className="text-primary text-xs mt-1">+ more</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 border-t border-medium-gray/40 pt-3 mt-auto z-10">
        <p className="text-white text-sm flex items-center mb-1">
          <span className="text-light-gray mr-2">Company:</span>
          <span className="font-medium truncate">{company}</span>
        </p>

        {(location || industry) && (
          <p className="text-white/80 text-sm flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-primary flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {location ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              )}
            </svg>
            <span className="truncate">{location || industry}</span>
          </p>
        )}
      </div>
    </motion.div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link href={href} className="block">
      {cardContent}
    </Link>
  );
}

export function CompactCaseCard(props: Omit<CaseCardProps, 'isCompact'>) {
  return <CaseCard {...props} isCompact={true} />;
}
