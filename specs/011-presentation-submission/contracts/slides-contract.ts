/**
 * T-12 Slide Deck & Submission Manifest Contracts
 * TerraSpot Harmonizer - NASA Space Apps Challenge 2026
 */

export interface SlideDeckManifest {
  /** Maximum slides allowed by NASA Global Judging */
  maxSlides: 7;
  /** Slide deck language */
  language: 'en';
  /** Presentation title */
  title: string;
  /** Challenge code and title */
  challenge: string;
  /** Author and location */
  author: {
    name: string;
    handle: string;
    location: string;
  };
  /** Slide metadata list (length must be exactly 7) */
  slides: Array<{
    id: number;
    title: string;
    focusArea: string;
    globalOffersUsed: string[];
  }>;
}

export interface SubmissionAuditReport {
  isSlideLimitCompliant: boolean; // Must be true (count === 7)
  isEnglishVerified: boolean;
  isSIDisclosed: boolean;
  areNASADataSourcesDeclared: boolean;
  areGlobalOffersDeclared: boolean;
  isVersionTagged1_0_0: boolean;
}
