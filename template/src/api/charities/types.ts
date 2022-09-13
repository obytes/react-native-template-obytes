export type Charity = {
  id: number;
  slug: string;
  name: string;
  description: string;
  logo_url: string;
  active_projects: number;
  categories?: Category[];
};

export interface Category {
  id: number;
  title: string;
  projects: CharityProject[];
}

export interface CharityProject {
  id: number;
  title: string;
  slug: string;
  description: string;
  main_photo: string;
  countries: Country[];
  project_url: null;
  charity_logo: string;
  charity_name: string;
  target_amount: string;
  funded: number;
  minimum_amount: string;
  funded_percentage: number;
  category_title: string;
  category_icon: null;
  category_slug: string;
  project_updates: ProjectUpdates;
  project_updates_count: number;
  similar_projects: SimilarProject[];
  is_past: boolean;
  charity_slug: string;
  web_url: string;
  end_date: null;
  variants: Variants;
  is_adahi: boolean;
}

export interface Country {
  id: number;
  name: string;
}

export interface ProjectUpdates {
  images: any[];
  reports: any[];
}

export interface SimilarProject {
  id: number;
  title: string;
  slug: string;
  main_photo: string;
  countries: Country[];
  project_url: null;
  charity_logo: string;
  target_amount: string;
  funded_percentage: number | null;
  charity_slug: string;
}

export interface Variants {}
