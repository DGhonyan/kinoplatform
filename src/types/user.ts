export enum UserType {
  ADMIN = 'admin',
  USER = 'user',
}

export type Project = {
  name: string;
  description: string;
}

export type PersonalInfoProject = {
  name: string;
  year: number;
  link: string;
}

export type Event = {
  _id?: string;
  userId: string;
  startDate: string;
  endDate: string;
  title: string;
  color?: string;
  startTime?: string;
  endTime?: string;
}

export type User = {
  _id: string;
  email: string;
  type: UserType;
  active: boolean;
  firstName: string;
  lastName: string;
  bio: string;
  portfolio: string;
  projects: PersonalInfoProject[];
  profession: string[];
  avatar?: string;
};
