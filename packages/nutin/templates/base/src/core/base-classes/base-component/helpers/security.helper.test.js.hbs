import { SecurityHelper } from '#root/dist/src/core/base-classes/base-component/helpers/security.helper.js';

describe('SecurityHelper', () => {
  it('sanitizeTemplate returns an empty string for null and undefined', () => {
    expect(SecurityHelper.sanitizeTemplate(null)).toBe('');
    expect(SecurityHelper.sanitizeTemplate(undefined)).toBe('');
  });

  it('sanitizeTemplate stringifies non-string values before sanitizing', () => {
    expect(SecurityHelper.sanitizeTemplate(42)).toBe('42');
    expect(SecurityHelper.sanitizeTemplate(true)).toBe('true');
  });

  it('sanitizeTemplate defaults to the "normal" trust level', () => {
    const result = SecurityHelper.sanitizeTemplate('<div><script>alert(1)</script></div>');
    expect(result).toBe('<div></div>');
  });

  it('sanitizeTemplate "trusted" level leaves the template completely unchanged', () => {
    const template = '<script>alert(1)</script><div onclick="x()">hi</div>';
    expect(SecurityHelper.sanitizeTemplate(template, 'trusted')).toBe(template);
  });

  it('sanitizeTemplate "normal" level strips <script> tags', () => {
    const result = SecurityHelper.sanitizeTemplate('<p>hi</p><script>alert(1)</script>', 'normal');
    expect(result).toBe('<p>hi</p>');
  });

  it('sanitizeTemplate "normal" level strips inline on* event handlers', () => {
    const result = SecurityHelper.sanitizeTemplate('<button onclick="doBad()">Click</button>', 'normal');
    expect(result).toContain('<button');
    expect(result.includes('onclick')).toBe(false);
  });

  it('sanitizeTemplate "normal" level keeps iframes (only "strict" removes them)', () => {
    const result = SecurityHelper.sanitizeTemplate('<iframe src="https://example.com"></iframe>', 'normal');
    expect(result).toContain('<iframe');
  });

  it('sanitizeTemplate "strict" level also strips iframe, object and embed tags', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<iframe src="x"></iframe><object data="x"></object><embed src="x">',
      'strict'
    );
    expect(result.includes('<iframe')).toBe(false);
    expect(result.includes('<object')).toBe(false);
    expect(result.includes('<embed')).toBe(false);
  });

  it('sanitizeTemplate "strict" level strips javascript: hrefs and data: srcs', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<a href="javascript:alert(1)">link</a><img src="data:text/html,evil">',
      'strict'
    );
    expect(result.includes('javascript:')).toBe(false);
    expect(result.includes('src="data:')).toBe(false);
  });

  it('sanitizeTemplate "strict" level still strips scripts and inline handlers like normal', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<script>bad()</script><div onmouseover="bad()">hi</div>',
      'strict'
    );
    expect(result.includes('<script>')).toBe(false);
    expect(result.includes('onmouseover')).toBe(false);
  });

  it('sanitizeTemplate "normal" level strips unquoted event handler attributes', () => {
    const result = SecurityHelper.sanitizeTemplate('<img src=x onerror=alert(1)>', 'normal');
    expect(result.includes('onerror')).toBe(false);
  });

  it('sanitizeTemplate "normal" level is not fooled by nested-tag script reassembly', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<scr<script></script>ipt>alert(document.domain)</scr<script></script>ipt>',
      'normal'
    );
    // A naive substring check is misleading here: the sanitized output can still
    // contain the literal text "<script>" as part of an inert malformed tag name
    // (e.g. "SCR<SCRIPT"), which HTML parsers never re-interpret as a real <script>
    // element. Re-parse the result and assert no live <script> element exists.
    const reparsed = document.createElement('template');
    reparsed.innerHTML = result;
    expect(reparsed.content.querySelector('script')).toBe(null);
  });

  it('sanitizeTemplate "normal" level is not fooled by nested-tag event handler reassembly', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<img src=x onerr<script>x</script>or=alert(1)>',
      'normal'
    );
    expect(result.includes('onerror')).toBe(false);
  });

  it('sanitizeTemplate "strict" level strips whitespace-obfuscated javascript: URLs', () => {
    const result = SecurityHelper.sanitizeTemplate('<a href="java\tscript:alert(1)">x</a>', 'strict');
    expect(result.includes('javascript:')).toBe(false);
  });

  it('sanitizeTemplate "strict" level strips javascript: from action/formaction/poster/background too', () => {
    const result = SecurityHelper.sanitizeTemplate('<form action="javascript:alert(1)">x</form>', 'strict');
    expect(result.includes('javascript:')).toBe(false);
  });

  it('sanitizeInputElement escapes the value of an input element', () => {
    const input = document.createElement('input');
    input.value = '<script>alert(1)</script>';
    expect(SecurityHelper.sanitizeInputElement(input)).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('sanitizeInputElement escapes the value of a textarea element', () => {
    const textarea = document.createElement('textarea');
    textarea.value = '<b>bold</b>';
    expect(SecurityHelper.sanitizeInputElement(textarea)).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('sanitizeInputElement escapes innerText for contenteditable elements', () => {
    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    div.innerText = '<i>hi</i>';
    expect(SecurityHelper.sanitizeInputElement(div)).toBe('&lt;i&gt;hi&lt;/i&gt;');
  });

  it('sanitizeInputElement returns an empty string for a plain, non-editable element', () => {
    const div = document.createElement('div');
    expect(SecurityHelper.sanitizeInputElement(div)).toBe('');
  });

  it('escapeHtml escapes all special characters', () => {
    expect(SecurityHelper.escapeHtml(`<div class="a" data='b'>&</div>`))
      .toBe('&lt;div class=&quot;a&quot; data=&#039;b&#039;&gt;&amp;&lt;/div&gt;');
  });

  it('escapeHtml returns an empty string for null and undefined', () => {
    expect(SecurityHelper.escapeHtml(null)).toBe('');
    expect(SecurityHelper.escapeHtml(undefined)).toBe('');
  });

  it('escapeHtml stringifies non-string values before escaping', () => {
    expect(SecurityHelper.escapeHtml(123)).toBe('123');
  });
});
