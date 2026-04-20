import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

for (const file of [
  "AGENTS.md",
  ".agent/workflows/spec-check.md",
  ".agent/workflows/mobile-adaptation-check.md",
  ".agent/workflows/ui-consistency-check.md",
  ".agent/workflows/russian-copy-check.md",
  ".agent/agents/builder.md",
  ".agent/agents/mobile-app-adapter.md",
  ".agent/agents/spec-reviewer.md",
  ".agent/agents/release-agent.md",
  "tests/fixtures/spec-reviewer-sample.txt",
]) {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} is missing`);
}

const agents = read("AGENTS.md");
assert.match(agents, /Run the reusable `spec-check` workflow/i);
assert.match(agents, /`builder`/);
assert.match(agents, /`mobile-app-adapter`/);
assert.match(agents, /`spec-reviewer`/);
assert.match(agents, /`release-agent`/);
assert.match(agents, /`ui-consistency-check`/);
assert.match(agents, /`russian-copy-check`/);
assert.match(agents, /Changed:/);
assert.match(agents, /Checked:/);
assert.match(agents, /Risk:/);

const workflow = read(".agent/workflows/spec-check.md");
assert.match(workflow, /Restate the requested behavior/i);
assert.match(workflow, /new dependency/i);
assert.match(workflow, /Changed:/);
assert.match(workflow, /Checked:/);
assert.match(workflow, /Risk:/);

const mobileWorkflow = read(".agent/workflows/mobile-adaptation-check.md");
assert.match(mobileWorkflow, /touch ergonomics/i);
assert.match(mobileWorkflow, /viewport stability/i);
assert.match(mobileWorkflow, /spec-check/i);

const uiConsistencyWorkflow = read(".agent/workflows/ui-consistency-check.md");
assert.match(uiConsistencyWorkflow, /align existing UI across screens/i);
assert.match(uiConsistencyWorkflow, /spacing rhythm/i);
assert.match(uiConsistencyWorkflow, /icon size/i);
assert.match(uiConsistencyWorkflow, /mobile-adaptation-check/i);
assert.match(uiConsistencyWorkflow, /spec-check/i);

const russianCopyWorkflow = read(".agent/workflows/russian-copy-check.md");
assert.match(russianCopyWorkflow, /Russian text/i);
assert.match(russianCopyWorkflow, /mojibake|encoding/i);
assert.match(russianCopyWorkflow, /currency symbols/i);
assert.match(russianCopyWorkflow, /ui-consistency-check/i);
assert.match(russianCopyWorkflow, /spec-check/i);

const builder = read(".agent/agents/builder.md");
assert.match(builder, /smallest coherent patch/i);
assert.match(builder, /spec-check/i);

const mobileAdapter = read(".agent/agents/mobile-app-adapter.md");
assert.match(mobileAdapter, /mobile application/i);
assert.match(mobileAdapter, /mobile-adaptation-check/i);
assert.match(mobileAdapter, /reduce clutter/i);

const reviewer = read(".agent/agents/spec-reviewer.md");
assert.match(reviewer, /Identify only concrete mismatches/i);

const releaseAgent = read(".agent/agents/release-agent.md");
assert.match(releaseAgent, /ready to ship/i);
assert.match(releaseAgent, /Block release/i);

const sample = read("tests/fixtures/spec-reviewer-sample.txt")
  .trim()
  .split(/\r?\n/);
assert.equal(sample.length, 3, "sample response must have exactly three lines");
assert.match(sample[0], /^Changed: /);
assert.match(sample[1], /^Checked: /);
assert.match(sample[2], /^Risk: /);

console.log("AI rules test passed.");
