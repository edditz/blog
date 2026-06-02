export interface Column {
  id: string;
  title: string;
  description: string;
  cover?: string;
}

export interface ColumnWithPosts extends Column {
  posts: {
    id: string;
    slug: string;
    title: string;
    date: string;
    frontmatter: string;
    readTime: number;
    tags: string[];
  }[];
}
