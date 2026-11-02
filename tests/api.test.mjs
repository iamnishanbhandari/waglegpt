import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

const port = Number(process.env.TEST_PORT || 3217);
const base = `http://127.0.0.1:${port}`;
let serial = 0;
async function startServer(extra = {}) {
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'], {
    env: { ...process.env, OPENAI_API_KEY: '', LLM_API_KEY: '', ...extra }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  child.stdout.on('data', c => { logs += c; }); child.stderr.on('data', c => { logs += c; });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`Server failed: ${logs}`);
    try { if ((await fetch(`${base}/api/translate`)).ok) return child; } catch {}
    await delay(150);
  }
  child.kill(); throw new Error(`Server readiness timed out: ${logs}`);
}
async function stopServer(child) {
  if (child.exitCode !== null) return;
  await new Promise(resolve => { child.once('exit', resolve); child.kill('SIGTERM'); });
}
async function post(body, ip = `test-${serial++}`) {
  return fetch(`${base}/api/translate`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(body) });
}

test('production demo API and input contract', async t => {
  const child = await startServer();
  t.after(() => stopServer(child));
  await t.test('serves page, demo status and real PNG metadata', async () => {
    assert.equal((await fetch(base)).status, 200);
    assert.equal((await (await fetch(`${base}/api/translate`)).json()).demo, true);
    const image = await fetch(`${base}/opengraph-image`);
    assert.equal(image.status, 200); assert.match(image.headers.get('content-type'), /image\/png/);
  });
  await t.test('both modes preserve matched original and never assert a verified source', async () => {
    for (const [mode, text] of [['parody', 'मसँग पैसा छैन।'], ['simplify', 'Schadenfreude']]) {
      const response = await post({ mode, text }); assert.equal(response.status, 200);
      const data = await response.json(); assert.equal(data.original, text); assert.equal(data.mode, mode);
      assert.equal(data.demo, true); assert.equal(data.isVerifiedQuote, false); assert.equal(data.sourceUrl, null);
      assert.ok(data.translation.length > 5);
      if (mode === 'simplify') assert.equal(data.translation, 'अरूको दुःखमा खुसी हुनु।');
    }
  });
  await t.test('unknown input is rejected rather than translated as an unrelated demo', async () => {
    assert.equal((await post({ mode: 'parody', text: 'a completely unknown sentence' })).status, 422);
    assert.equal((await post({ mode: 'parody', text: '  मसँग पैसा छैन  ' })).status, 200);
  });
  await t.test('regeneration and complexity produce actual curated variants', async () => {
    const translations = [];
    for (const complexity of [1, 2, 3]) translations.push((await (await post({ mode: 'parody', text: 'मलाई भोक लाग्यो।', complexity })).json()).translation);
    assert.equal(new Set(translations).size, 3);
    const regen = await (await post({ mode: 'parody', text: 'मलाई भोक लाग्यो।', variant: 1 })).json();
    assert.notEqual(regen.translation, translations[0]);
  });
  await t.test('rejects malformed JSON, null, arrays, invalid fields and excessive input', async () => {
    for (const body of [null, [], {}, { mode: 'other', text: 'a' }, { mode: 'parody', text: 123 }, { mode: 'parody', text: {} }, { mode: 'parody', text: '' }, { mode: 'parody', text: 'a'.repeat(801) }, { mode: 'parody', text: 'a', complexity: '2' }, { mode: 'parody', text: 'a', complexity: 4 }]) assert.equal((await post(body)).status, 400);
    const invalid = await fetch(`${base}/api/translate`, { method: 'POST', body: '{bad', headers: { 'x-forwarded-for': 'bad-json' } }); assert.equal(invalid.status, 400);
  });
  await t.test('rate limits a client after 20 requests and includes Retry-After', async () => {
    for (let i = 0; i < 20; i++) assert.equal((await post({ mode: 'simplify', text: 'Schadenfreude' }, 'rate-test')).status, 200);
    const limited = await post({ mode: 'simplify', text: 'Schadenfreude' }, 'rate-test');
    assert.equal(limited.status, 429); assert.equal(limited.headers.get('retry-after'), '60');
  });
});

test('live-provider contract using a local stub, without paid calls', async t => {
  let captured;
  let upstream = { translation: 'परीक्षण अनुवाद।', shortExplanation: 'सजिलो अर्थ।', isVerifiedQuote: true, sourceUrl: 'https://invented.invalid' };
  const stub = createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk;
    captured = JSON.parse(raw);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(upstream) } }] }));
  });
  await new Promise(resolve => stub.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => stub.close(resolve)));
  const child = await startServer({ LLM_API_KEY: 'local-test-key', LLM_BASE_URL: `http://127.0.0.1:${stub.address().port}/v1`, LLM_MODEL: 'test-model' });
  t.after(() => stopServer(child));
  await t.test('uses separate prompts and strips forged source claims', async () => {
    for (const mode of ['simplify', 'parody']) {
      const response = await post({ mode, text: 'arbitrary input' }); assert.equal(response.status, 200);
      const data = await response.json(); assert.equal(data.demo, false); assert.equal(data.sourceUrl, null); assert.equal(data.isVerifiedQuote, false);
      assert.equal(captured.model, 'test-model'); assert.equal(captured.response_format.type, 'json_object');
      assert.match(captured.messages[0].content, mode === 'simplify' ? /everyday Nepali/ : /fictional vocabulary satire/);
    }
  });
  await t.test('invalid provider JSON fields produce a recoverable 502', async () => {
    for (const value of [{ translation: {} }, { translation: '' }, { translation: 'a'.repeat(901) }, { translation: 'test', shortExplanation: 42 }]) {
      upstream = value; assert.equal((await post({ mode: 'parody', text: 'test' })).status, 502);
    }
  });
});
