import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Guards the defect class where a hand-edited JSON-LD block escapes its <script>
// element and renders as visible body text, taking the whole Product/Offer graph
// with it. Structured data is a revenue asset: it fails silently in the browser,
// so it has to fail loudly here.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const htmlFiles = [];
(function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === '.git' || entry.name === 'node_modules') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.html')) htmlFiles.push(path.relative(root, full));
    }
})(root);

assert.ok(htmlFiles.length > 0, 'Found no HTML files to check');

const OPENING = /<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>/gi;
const BLOCK = /<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi;
const ANY_SCRIPT = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
const LOOKS_LIKE_JSON_LD = /"@type"|"@context"|"offers"\s*:/;

for (const file of htmlFiles) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');

    // 1. Every ld+json opener has a matching closer.
    const openers = html.match(OPENING) ?? [];
    const blocks = [...html.matchAll(BLOCK)];
    assert.equal(
        blocks.length,
        openers.length,
        `${file}: ${openers.length} ld+json opening tag(s) but ${blocks.length} matched closing tag(s)`
    );

    // 2. Every ld+json block parses as JSON.
    blocks.forEach(([, body], index) => {
        assert.doesNotThrow(
            () => JSON.parse(body),
            `${file}: ld+json block #${index + 1} is not valid JSON`
        );
    });

    // 3. No JSON-LD-looking text leaks outside a script element.
    const outside = html.replace(ANY_SCRIPT, '');
    outside.split(/\r?\n/).forEach((line, index) => {
        assert.ok(
            !LOOKS_LIKE_JSON_LD.test(line),
            `${file}:${index + 1}: JSON-LD text outside a script element: ${line.trim().slice(0, 120)}`
        );
    });
}

console.log(`structured-data: ${htmlFiles.length} HTML files checked, all JSON-LD well-formed`);
