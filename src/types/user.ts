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
  user_id: string;
  start_date: string;
  end_date: string;
  title: string;
  color?: string;
  start_time?: string;
  end_time?: string;
}

export type User = {
  _id: string;
  password: string;
  email: string;
  type: UserType;
  active: boolean;
  first_name: string;
  last_name: string;
  bio: string;
  portfolio: string;
  projects: PersonalInfoProject[];
  profession: string[];
  avatar?: string;
};
