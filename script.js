(() => {
  'use strict';

  const display = document.getElementById('display');
  const historyEl = document.getElementById('history');
  const keys = document.querySelector('.keys');
  const statusEl = document.querySelector('.status');
  const statusText = document.querySelector('.status__text');

  const operatorPattern = /[+\-*/]/;
  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const MAX_DIGITS = 15;

  let expression = '';
  let justEvaluated = false;

  const pretty = (text) =>
    text
      .replace(/([+\-*/])/g, ' $1 ')
      .replace(/[*/-]/g, (op) => symbols[op])
      .replace(/\s+/g, ' ')
      .trim();

  const formatNumber = (n) =>
    Math.abs(n) >= 1e15 || (n !== 0 && Math.abs(n) < 1e-9)
      ? n.toExponential(6)
      : n.toLocaleString('en-US', { maximumSignificantDigits: 12 });

  // Plain decimal string with no exponent, so the result can be used in the next expression.
  const toPlain = (n) =>
    (Number.parseFloat(n.toPrecision(12)) || 0).toLocaleString('en-US', {
      useGrouping: false,
      maximumFractionDigits: 20,
    });

  function setStatus(isError) {
    statusEl.classList.toggle('is-error', isError);
    statusText.textContent = isError ? 'Error' : 'Ready';
    display.classList.toggle('is-error', isError);
  }

  function fitDisplay() {
    const len = display.textContent.length;
    display.style.fontSize = len > 18 ? '1.3rem' : len > 14 ? '1.7rem' : len > 10 ? '2.1rem' : '';
    // Keep the newest characters visible when the text is wider than the screen.
    display.scrollLeft = display.scrollWidth;
  }

  function refresh() {
    setStatus(false);
    display.textContent = expression ? pretty(expression) : '0';
    fitDisplay();

    const last = expression.at(-1) ?? '';
    keys.querySelectorAll('.key--operator[data-value]').forEach((btn) => {
      btn.classList.toggle('is-active', operatorPattern.test(last) && btn.dataset.value === last);
    });
  }

  function clear() {
    expression = '';
    justEvaluated = false;
    historyEl.innerHTML = '&nbsp;';
    refresh();
  }

  function append(value) {
    const isOperator = operatorPattern.test(value);
    const last = expression.at(-1) ?? '';

    if (justEvaluated) {
      if (!isOperator) expression = '';
      historyEl.innerHTML = '&nbsp;';
    }
    justEvaluated = false;

    if (isOperator) {
      if (!expression && value !== '-') return refresh();
      if (expression === '-') return;
      if (operatorPattern.test(last)) {
        expression = expression.slice(0, -1) + value;
      } else {
        expression += value;
      }
    } else if (value === '.') {
      const currentNumber = expression.split(/[+\-*/]/).at(-1);
      if (!currentNumber.includes('.')) expression += currentNumber ? '.' : '0.';
    } else {
      const currentNumber = expression.split(/[+\-*/]/).at(-1);
      if (currentNumber.replace('.', '').length >= MAX_DIGITS) return;
      // A bare leading zero is replaced, since "03" is a syntax error in strict mode.
      if (currentNumber === '0') expression = expression.slice(0, -1) + value;
      else expression += value;
    }
    refresh();
  }

  function showError(message) {
    display.textContent = 'Error';
    display.style.fontSize = '';
    setStatus(true);
    historyEl.textContent = message;
    expression = '';
    justEvaluated = true;
  }

  function evaluate() {
    if (!expression || operatorPattern.test(expression.at(-1))) return;
    try {
      // Only digits, decimal points, and calculation operators can reach this expression.
      const result = Function(`"use strict"; return (${expression})`)();
      if (!Number.isFinite(result)) return showError('Cannot divide by 0');
      historyEl.textContent = `${pretty(expression)} =`;
      expression = toPlain(result);
      setStatus(false);
      display.textContent = formatNumber(Number(expression));
      fitDisplay();
      keys.querySelectorAll('.key--operator.is-active').forEach((b) => b.classList.remove('is-active'));
      justEvaluated = true;
    } catch {
      showError('Try another calculation');
    }
  }

  function percentage() {
    const match = expression.match(/(\d*\.?\d+)$/);
    if (!match) return;
    const start = expression.slice(0, -match[0].length);
    expression = `${start}${toPlain(Number(match[0]) / 100)}`;
    justEvaluated = false;
    refresh();
  }

  function backspace() {
    expression = expression.slice(0, -1);
    justEvaluated = false;
    refresh();
  }

  keys.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const { action, value } = button.dataset;
    if (action === 'clear') clear();
    else if (action === 'delete') backspace();
    else if (action === 'equals') evaluate();
    else if (action === 'percent') percentage();
    else append(value);
  });

  function flash(selector) {
    const btn = keys.querySelector(selector);
    if (!btn) return;
    btn.classList.add('is-pressed');
    setTimeout(() => btn.classList.remove('is-pressed'), 110);
  }

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const { key } = event;
    if (/^[0-9.]$/.test(key) || /^[+\-*/]$/.test(key)) {
      event.preventDefault();
      append(key);
      flash(`[data-value="${key}"]`);
    } else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      evaluate();
      flash('[data-action="equals"]');
    } else if (key === '%') {
      percentage();
      flash('[data-action="percent"]');
    } else if (key === 'Backspace') {
      event.preventDefault();
      backspace();
      flash('[data-action="delete"]');
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
      clear();
      flash('[data-action="clear"]');
    }
  });

  refresh();
})();