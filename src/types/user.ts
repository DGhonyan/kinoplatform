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

export type User = {
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
};
