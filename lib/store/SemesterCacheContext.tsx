"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SemesterCourses } from '@/lib/types';

interface SemesterCacheContextType {
  semesterCache: Record<string, SemesterCourses>;
  setSemesterData: (semester: string, data: SemesterCourses) => void;
  getSemesterData: (semester: string) => SemesterCourses | undefined;
}

const SemesterCacheContext = createContext<SemesterCacheContextType | undefined>(undefined);

export function SemesterCacheProvider({ children }: { children: React.ReactNode }) {
  const [semesterCache, setSemesterCache] = useState<Record<string, SemesterCourses>>({});

  const setSemesterData = useCallback((semester: string, data: SemesterCourses) => {
    setSemesterCache(prev => ({
      ...prev,
      [semester]: data
    }));
  }, []);

  const getSemesterData = useCallback((semester: string) => {
    return semesterCache[semester];
  }, [semesterCache]);

  return (
    <SemesterCacheContext.Provider value={{ semesterCache, setSemesterData, getSemesterData }}>
      {children}
    </SemesterCacheContext.Provider>
  );
}

export function useSemesterCache() {
  const context = useContext(SemesterCacheContext);
  if (context === undefined) {
    throw new Error('useSemesterCache must be used within a SemesterCacheProvider');
  }
  return context;
}