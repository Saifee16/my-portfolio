import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { Linter } from "eslint";
import nextPlugin from "@next/eslint-plugin-next";

const require = createRequire(import.meta.url);
const requireFromNext = createRequire(require.resolve("@next/eslint-plugin-next"));

// Keep the directory-glob replacement covered until Next removes fast-glob.
test("Next lint uses the safe glob replacement and still checks project links", () => {
  assert.equal(requireFromNext("fast-glob/package.json").name, "tinyglobby");
  const fixture = mkdtempSync(path.join(tmpdir(), "portfolio-lint-"));
  try {
    for (const app of ["admin", "store"]) {
      const pages = path.join(fixture, "apps", app, "pages");
      mkdirSync(pages, { recursive: true });
      writeFileSync(path.join(pages, "index.jsx"), "export default function Home() { return null; }");
    }
    writeFileSync(path.join(fixture, "apps", "README.txt"), "Not a project directory.");
    const { getRootDirs } = requireFromNext("./utils/get-root-dirs.js");
    const normalize = value => path.resolve(value);
    const expected = ["admin", "store"].map(app => path.join(fixture, "apps", app)).sort();
    const rootDir = path.join(fixture, "apps", "*");
    const context = { cwd: fixture, settings: { next: { rootDir } } };
    assert.deepEqual(getRootDirs(context).map(normalize).sort(), expected);
    assert.deepEqual(getRootDirs({ ...context, settings: { next: { rootDir: path.join(fixture, "apps", "{admin,store}") } } }).map(normalize).sort(), expected);
    assert.deepEqual(getRootDirs({ cwd: fixture, settings: {} }), [fixture]);
    assert.deepEqual(getRootDirs({ ...context, settings: { next: { rootDir: expected } } }).map(normalize).sort(), expected);

    const linter = new Linter({ cwd: fixture });
    const config = [{
      files: ["**/*.jsx"],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { "@next/next": nextPlugin },
      settings: context.settings,
      rules: { "@next/next/no-html-link-for-pages": "error" },
    }];
    const messages = linter.verify('const view = <a href="/">Home</a>;', config, "example.jsx");
    assert.equal(messages.length, 1);
    assert.equal(messages[0].ruleId, "@next/next/no-html-link-for-pages");
    assert.equal(messages[0].severity, 2);
    assert.deepEqual(linter.verify('const view = <a href="https://example.com">External</a>;', config, "example.jsx"), []);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
