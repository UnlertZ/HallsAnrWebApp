export interface Profile {
  id: string;
  fullName: string;
  nickName: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string;
  heroBannerUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  resumePdfUrl?: string;
  yearsOfExperience: number;
  highlightStats: {
    label: string;
    value: string;
    description?: string;
  }[];
  skills: {
    category: string;
    items: {
      name: string;
      level?: number; // 1-100
      badgeColor?: string;
    }[];
  }[];
  updatedAt: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  faculty?: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  isCurrent?: boolean;
  gpa?: string;
  honors?: string;
  description?: string;
  orderIndex: number;
}

export interface Experience {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies: string[];
  orderIndex: number;
}

export interface TrainingCertification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl?: string;
  description?: string;
  orderIndex: number;
}

export interface VisitorLog {
  id: string;
  visitorName: string;
  companyName: string;
  email?: string;
  phone?: string;
  purpose?: string;
  ipAddress?: string;
  userAgent?: string;
  visitedAt: string;
}

export interface SessionUser {
  role: 'owner' | 'visitor';
  username?: string;
  visitorId?: string;
  visitorName?: string;
  companyName?: string;
  loginAt: string;
}
