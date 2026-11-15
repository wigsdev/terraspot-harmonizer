# Data Model & Slide Deck Schema: T-12 Presentation & Submission

**Feature**: `011-presentation-submission`  
**Date**: 2026-11-15  

---

## 1. Slide Deck Structure & Content Schema

```typescript
export interface SlideDefinition {
  /** 1-based index (strictly 1 to 7) */
  index: number;
  /** Numerical string e.g. "01" */
  number: string;
  /** Slide category header e.g. "MISSION BRIEFING" */
  badge: string;
  /** Primary slide title */
  title: string;
  /** Subtitle or takeaway statement */
  subtitle: string;
  /** Partner offers featured on this slide */
  partnerOffers?: string[];
  /** Detailed slide panels or bullet blocks */
  sections: Array<{
    heading: string;
    description: string;
    iconSvg: string;
    statValue?: string;
    statLabel?: string;
  }>;
}

export interface SlideDeckState {
  currentSlideIndex: number; // 0 to 6
  totalSlides: 7;
  isFullscreen: boolean;
}
```

## 2. NASA Submission Portal Field Mapping

```typescript
export interface NASASubmissionPackage {
  field1_ProjectTitle: string;
  field2_HighLevelSummary: string; // Max ~250 words
  field3_DetailedDescription: string;
  field4_UseOfSuperIntelligence: string;
  field5_NASADataResources: string[];
  field6_PartnerDataAndGlobalOffers: string[];
  field7_ProjectLinks: {
    liveApplicationUrl: string;
    codeRepositoryUrl: string;
    interactiveSlideDeckUrl: string;
  };
}
```
