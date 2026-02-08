/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: { code: string; id: string };
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      totalActiveProjectsLimit: number;
      totalActivePropertiesLimit: number;
      totalActiveProjects?: number;
      totalActiveProperties?: number;
      totalActiveFeaturedPropertiesLimit?: number;
      totalActiveHighlightedProjectsLimit?: number;
      totalActiveHighlightedProjects?: number;
      totalActiveFeaturedProperties?: number;
      isMembershipActive?: boolean;
      profileVerified?: boolean;
      documentVerified?: string;
    } | null;
  }
}
