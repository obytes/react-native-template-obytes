export type Course = {
  _id?: string;
  id?: string;
  slug?: string | null;
  title: string;
  title_vi?: string | null;
  code?: string | null;
  sort?: number | null;
  desc?: string | null;
  level?: string | null;
  grade?: number | null;
  video_intro?: string | null;
  icon_url?: string | null;
  thumbnail_url?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
  [key: string]: unknown;
};
