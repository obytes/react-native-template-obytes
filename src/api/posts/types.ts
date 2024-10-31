export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type Comment = {
  id: number;
  body: string;
  postId: number;
  likes: number;
  user: {
    id: number;
    username: string;
    fullName: string;
  };
};
