// generate-manifest.mjs
import { promises as fs } from "fs";
import path from "path";

const root = process.argv[2] || "./photos";
const exts = new Set([".jpg",".jpeg",".png",".gif",".webp",".avif",".bmp",".svg"]);
const out = path.join(root, "manifest.json");

async function* walk(dir, base=dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes:true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full, base);
    else yield path.relative(base, full).replaceAll("\\","/");
  }
}

const files = [];
for await (const p of walk(root)) if (exts.has(path.extname(p).toLowerCase())) files.push(p);
files.sort((a,b)=>a.localeCompare(b, undefined, {numeric:true,sensitivity:"base"}));
await fs.writeFile(out, JSON.stringify(files, null, 2));
console.log(`Wrote ${files.length} items to ${out}`);
