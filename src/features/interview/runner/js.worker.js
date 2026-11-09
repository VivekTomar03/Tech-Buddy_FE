/* Runs candidate JavaScript / TypeScript in a dedicated worker (no DOM, no page state).
 * The main thread terminates the worker on timeout, so infinite loops can't freeze the tab. */
import { transform } from 'sucrase';

const fmt = (a) => {
  if (typeof a === 'string') return a;
  try {
    return JSON.stringify(a);
  } catch {
    return String(a);
  }
};

function makeConsole(sink) {
  const push = (...args) => sink.push(args.map(fmt).join(' '));
  return { log: push, info: push, warn: push, error: push, debug: push, table: push };
}

function serialise(value) {
  if (value === undefined) return { undef: true };
  try {
    return { value: JSON.parse(JSON.stringify(value)) };
  } catch {
    return { error: 'The return value could not be converted to JSON (circular or unsupported type).' };
  }
}

self.onmessage = async (event) => {
  const { id, code, language, functionName, tests } = event.data;
  let source = code;
  if (language === 'typescript') {
    try {
      source = transform(code, { transforms: ['typescript'] }).code;
    } catch (err) {
      self.postMessage({ id, type: 'compile_error', error: `TypeScript: ${err.message}` });
      return;
    }
  }

  const logs = [];
  const sandboxConsole = makeConsole(logs);

  // Script mode (machine coding): just run it and return console output.
  if (!functionName) {
    try {
      const run = new Function('console', `"use strict";\n${source}`);
      const ret = run(sandboxConsole);
      if (ret && typeof ret.then === 'function') await ret;
      self.postMessage({ id, type: 'script', logs });
    } catch (err) {
      self.postMessage({ id, type: 'script', logs, error: String((err && err.message) || err) });
    }
    return;
  }

  let fn;
  try {
    fn = new Function('console', `"use strict";\n${source}\n;return typeof ${functionName} === 'function' ? ${functionName} : undefined;`)(sandboxConsole);
  } catch (err) {
    self.postMessage({ id, type: 'compile_error', error: String((err && err.message) || err), logs });
    return;
  }
  if (typeof fn !== 'function') {
    self.postMessage({ id, type: 'compile_error', error: `Function "${functionName}" was not found. Keep the function name from the starter code.`, logs });
    return;
  }

  for (let i = 0; i < tests.length; i++) {
    logs.length = 0;
    const started = performance.now();
    try {
      let got = fn(...structuredClone(tests[i].input));
      if (got && typeof got.then === 'function') got = await got;
      self.postMessage({ id, type: 'test', index: i, ms: performance.now() - started, logs: logs.slice(-20), ...serialise(got) });
    } catch (err) {
      self.postMessage({ id, type: 'test', index: i, ms: performance.now() - started, logs: logs.slice(-20), error: String((err && err.message) || err) });
    }
  }
  self.postMessage({ id, type: 'done' });
};
