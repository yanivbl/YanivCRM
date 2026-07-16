// Emits a GitHub Actions ::error:: annotation per failed Playwright test.
// Raw job logs and artifacts both require an authenticated GitHub token to
// fetch back out via the API - annotations don't, so this is what actually
// makes a CI-only e2e failure diagnosable from outside a browser session.
const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '..', 'playwright-report', 'results.json');
if (!fs.existsSync(resultsPath)) {
  console.log('No playwright-report/results.json found, nothing to report.');
  process.exit(0);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

function stripAnsi(s) {
  return s.replace(/\[[0-9;]*m/g, '');
}

// GitHub workflow command escaping: order matters (% first).
function escapeForAnnotation(s) {
  return s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

function walkSuites(suites, specPath = []) {
  for (const suite of suites || []) {
    const nextPath = [...specPath, suite.title].filter(Boolean);
    for (const spec of suite.specs || []) {
      if (spec.ok) continue;
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          if (result.status === 'passed') continue;
          const message = result.error?.message ? stripAnsi(result.error.message) : 'Unknown failure (no error message captured)';
          const title = [...nextPath, spec.title].join(' › ');
          console.log(`::error title=${escapeForAnnotation(title)}::${escapeForAnnotation(message)}`);
        }
      }
    }
    if (suite.suites) walkSuites(suite.suites, nextPath);
  }
}

walkSuites(results.suites);
console.log(`Reported failures for ${results.stats?.unexpected ?? '?'} unexpected result(s).`);
