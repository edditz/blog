import type { Column, ColumnWithPosts } from "./types";
import { getCollection } from "astro:content";
import { calcReadTime } from "@/utils/reading-time";

// Get all .ts files except utils.ts, types.ts, and index.ts
const columnModules = import.meta.glob<Column>("./!(utils|types|index).ts", {
  eager: true,
});

const columns: Column[] = Object.values(columnModules).map((mod) => mod.default);

export function defineColumn(config: Column): Column {
  return config;
}

export function getColumns(): Column[] {
  return columns.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getAllColumnsWithPosts(): Promise<ColumnWithPosts[]> {
  const entries = await getCollection("post");
  const allPosts = entries
    .filter((entry) => !entry.data.draft)
    .map((entry) => ({
      id: entry.id,
      slug: entry.id,
      title: entry.data.title,
      date: entry.data.date,
      frontmatter: entry.data.frontmatter,
      readTime: calcReadTime(entry.body!),
      tags: entry.data.tags,
      columns: entry.data.columns,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return getColumns().map((column) => ({
    ...column,
    posts: allPosts.filter((post) => post.columns.includes(column.id)),
  }));
}

export async function getColumnWithPosts(slug: string): Promise<ColumnWithPosts | undefined> {
  const all = await getAllColumnsWithPosts();
  return all.find((col) => col.id === slug);
}
