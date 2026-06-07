export type UserRole = 'seeker' | 'office';

export type SessionUser = {
  id?: number;
  name?: string | null;
  role: UserRole;
  apiUserType: '1' | '2';
  isProfileComplete: boolean;
};

export type Session = {
  token: string;
  user: SessionUser;
};
