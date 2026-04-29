import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'src', 'posts');

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

const title = process.argv.slice(2).join(' ').trim();

if (!title) {
  console.error("Please provide a title for the post.");
  console.error("Usage: pnpm run new-post \"Post Title\"");
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphens
  .replace(/(^-|-$)+/g, ''); // remove leading/trailing hyphens

const postDir = path.join(postsDir, slug);
const filePath = path.join(postDir, 'index.mdx');
const imagesDir = path.join(postDir, 'images');

if (fs.existsSync(postDir)) {
  console.error(`Post already exists at: ${postDir}`);
  process.exit(1);
}

const today = new Date();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const year = today.getFullYear();
const formattedDate = `${month}/${day}/${year}`;

const content = `---
title: "${title}"
date: "${formattedDate}"
updatedDate: ""
frontmatter: "Write a short summary here..."
tags: ["general"]
draft: false
image: ""
---

Write your post content here!
`;

fs.mkdirSync(imagesDir, { recursive: true });
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\nCreated new post: "${title}"`);
console.log(`File:   ${path.relative(rootDir, filePath)}`);
console.log(`Images: ${path.relative(rootDir, imagesDir)}/\n`);
