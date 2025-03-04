
export type UserRole = 'patient' | 'expert';

export interface ExpertProfile {
  id: string;
  userId: string;
  specialization: string;
  qualifications: string[];
  yearsOfExperience: number;
  rating: number;
  totalReviews: number;
  consultationFee: number;
  availability: {
    days: string[];
    hours: string[];
  };
  bio: string;
  profileImage?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  expertId: string;
  scheduledFor: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  rating?: number;
  review?: string;
}

export interface EmbryoData {
  id: string;
  consultationId: string;
  expertId: string;
  patientId: string;
  imageUrl?: string;
  textDescription?: string;
  aiScore?: number;
  grade?: string;
  createdAt: Date;
  notes?: string;
}
