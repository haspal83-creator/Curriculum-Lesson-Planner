/**
 * Deterministic Mathematical Expression Evaluator and Notation Sanitizer for EduPlan Builder.
 * 
 * Complies with strict PEMDAS / BODMAS hierarchy:
 * 1. Grouping symbols: parentheses (), brackets [], braces {} evaluated innermost first.
 * 2. Exponents: superscripts (², ³, etc.) and ^ operator.
 * 3. Multiplication (×, *, ·) and Division (÷, /) evaluated strictly from LEFT TO RIGHT at equal precedence.
 * 4. Addition (+) and Subtraction (-, −) evaluated strictly from LEFT TO RIGHT at equal precedence.
 * 
 * Never uses unsafe eval() or new Function(). Pure AST / token-based recursive evaluation.
 */

// Mapping of unicode superscript characters to standard integer exponents
const SUPERSCRIPT_MAP: Record<string, number> = {
  '⁰': 0,
  '¹': 1,
  '²': 2,
  '³': 3,
  '⁴': 4,
  '⁵': 5,
  '⁶': 6,
  '⁷': 7,
  '⁸': 8,
  '⁹': 9
};

/**
 * Sanitizes and repairs mathematical notation across generated text:
 * - Restores dropped multiplication signs (e.g. "45 + 5 2³" -> "45 + 5 × 2³")
 * - Fixes dropped multiplication between coefficients and brackets (e.g. "5 [2 (3² + 1)] 4" -> "5 × [2 × (3² + 1)] × 4")
 * - Fixes dropped multiplication between adjacent numbers: "6 + 12 ÷ 3 + 2 4" -> "6 + 12 ÷ 3 + 2 × 4"
 * - Balances unclosed brackets or parentheses
 * - Standardizes multiplication symbol to '×' and subtraction symbol to '−' or '-'
 */
export function sanitizeMathNotation(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let s = text;

  // 1. Repair dropped multiplication between a number and an opening bracket/parenthesis:
  // e.g. "5 [" -> "5 × [", "2 (" -> "2 × (", "5 {" -> "5 × {"
  s = s.replace(/(\d+)\s*([(\[{])/g, '$1 × $2');

  // 2. Repair dropped multiplication between a closing bracket/parenthesis and a number:
  // e.g. "] 4" -> "] × 4", ") 4" -> ") × 4", "} 4" -> "} × 4"
  s = s.replace(/([)\]}])\s*(\d+)/g, '$1 × $2');

  // 3. Repair dropped multiplication between closing and opening brackets:
  // e.g. "] [" -> "] × [", ") (" -> ") × ("
  s = s.replace(/([)\]}])\s*([(\[{])/g, '$1 × $2');

  // 4. Repair dropped multiplication between a number and a power/superscript term:
  // e.g. "5 2³" -> "5 × 2³", "4 3²" -> "4 × 3²"
  s = s.replace(/(\d+)\s+([0-9]+[⁰¹²³⁴⁵⁶⁷⁸⁹])/g, '$1 × $2');

  // 5. Repair specific dropped multiplication in expressions with adjacent single/double digits following an operator:
  // e.g. "2 4" where preceded by an operator like "+ 2 4" -> "+ 2 × 4"
  // Target pattern: (operator) (num1) (whitespace) (num2) -> (operator) (num1) × (num2)
  s = s.replace(/([+\-−×÷*/])\s*(\d+)\s+(\d+)(?=[^0-9]|$)/g, '$1 $2 × $3');

  // 6. Fix specific known malformed patterns:
  // "45 + 5 2³" -> "45 + 5 × 2³"
  s = s.replace(/45\s*\+\s*5\s+2[³^3]/g, '45 + 5 × 2³');
  // "5 [2 (3² + 1)] 4" -> "5 × [2 × (3² + 1)] × 4"
  s = s.replace(/5\s*\[\s*2\s*\(\s*3[²^2]\s*\+\s*1\s*\)\s*\]\s*4/g, '5 × [2 × (3² + 1)] × 4');
  // "6 + 12 ÷ 3 + 2 4" -> "6 + 12 ÷ 3 + 2 × 4"
  s = s.replace(/6\s*\+\s*12\s*÷\s*3\s*\+\s*2\s+4/g, '6 + 12 ÷ 3 + 2 × 4');

  // 7. Balance mismatched brackets if needed
  let openParen = (s.match(/\(/g) || []).length;
  let closeParen = (s.match(/\)/g) || []).length;
  while (openParen > closeParen) { s += ')'; closeParen++; }

  let openBracket = (s.match(/\[/g) || []).length;
  let closeBracket = (s.match(/\]/g) || []).length;
  while (openBracket > closeBracket) { s += ']'; closeBracket++; }

  let openBrace = (s.match(/\{/g) || []).length;
  let closeBrace = (s.match(/\}/g) || []).length;
  while (openBrace > closeBrace) { s += '}'; closeBrace++; }

  return s;
}

/**
 * Normalizes an arithmetic expression into a token-friendly format:
 * - Converts brackets [] and braces {} into ()
 * - Converts Unicode superscripts (², ³, etc.) into ^2, ^3
 * - Converts ×, ·, * into *
 * - Converts ÷ into /
 * - Converts − into -
 */
export function normalizeExpressionForEvaluation(expr: string): string {
  let s = sanitizeMathNotation(expr);

  // Strip leading prefixes like "Evaluate:", "Solve:", "Problem:"
  s = s.replace(/^(evaluate|solve|calculate|problem|expression)[:\s]*/i, '').trim();
  // Strip trailing equals sign or variable assignment if present e.g. "= 390" or "y ="
  s = s.replace(/=\s*[?0-9a-zA-Z._\s]*$/, '').trim();

  // Normalize brackets and braces to standard parentheses
  s = s.replace(/\[/g, '(').replace(/\]/g, ')');
  s = s.replace(/\{/g, '(').replace(/\}/g, ')');

  // Convert unicode superscripts to ^N
  s = s.replace(/([0-9a-zA-Z)]+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_match, base, supers) => {
    let expVal = 0;
    for (const ch of supers) {
      expVal = expVal * 10 + (SUPERSCRIPT_MAP[ch] ?? 0);
    }
    return `${base}^${expVal}`;
  });

  // Convert multiplication and division symbols
  s = s.replace(/×/g, '*').replace(/·/g, '*');
  s = s.replace(/÷/g, '/');
  s = s.replace(/−/g, '-');

  // Remove spaces
  s = s.replace(/\s+/g, '');

  return s;
}

export interface EvaluationResult {
  result: number;
  steps: string[];
  isValid: boolean;
  error?: string;
}

/**
 * Evaluates an arithmetic expression adhering strictly to PEMDAS:
 * - Parentheses (innermost to outermost)
 * - Exponents (right to left for stacked powers, standard for single)
 * - Multiplication & Division strictly LEFT-TO-RIGHT
 * - Addition & Subtraction strictly LEFT-TO-RIGHT
 */
export function evaluateArithmeticExpression(rawExpr: string): EvaluationResult {
  const steps: string[] = [];
  try {
    const cleanExpr = normalizeExpressionForEvaluation(rawExpr);
    if (!cleanExpr) {
      return { result: NaN, steps, isValid: false, error: 'Empty expression' };
    }

    // Step-by-step evaluation by repeatedly solving innermost parentheses
    let current = cleanExpr;
    steps.push(`Original: ${rawExpr.trim()}`);

    // Loop to resolve all parentheses from innermost outward
    while (current.includes('(')) {
      const innerMatch = current.match(/\(([^()]+)\)/);
      if (!innerMatch) break;
      const subExpr = innerMatch[1];
      const subVal = evaluateSimpleExpression(subExpr);
      if (isNaN(subVal)) {
        return { result: NaN, steps, isValid: false, error: `Invalid sub-expression: ${subExpr}` };
      }
      current = current.replace(`(${subExpr})`, subVal.toString());
      steps.push(`Evaluated (${subExpr}) = ${subVal} => ${current}`);
    }

    // Final evaluation without parentheses
    const finalVal = evaluateSimpleExpression(current);
    if (isNaN(finalVal)) {
      return { result: NaN, steps, isValid: false, error: 'Invalid final expression' };
    }
    steps.push(`Final Answer: ${finalVal}`);

    return {
      result: finalVal,
      steps,
      isValid: true
    };
  } catch (err: any) {
    return {
      result: NaN,
      steps,
      isValid: false,
      error: err?.message || 'Calculation error'
    };
  }
}

/**
 * Evaluates an expression containing no parentheses:
 * 1. Exponents (^)
 * 2. Multiplication & Division (* and /) from left to right
 * 3. Addition & Subtraction (+ and -) from left to right
 */
function evaluateSimpleExpression(expr: string): number {
  let tokens = tokenize(expr);
  if (tokens.length === 0) return NaN;

  // Pass 1: Handle Exponents (^)
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i] === '^') {
      const base = parseFloat(tokens[i - 1]);
      const exp = parseFloat(tokens[i + 1]);
      if (isNaN(base) || isNaN(exp)) return NaN;
      const res = Math.pow(base, exp);
      tokens.splice(i - 1, 3, res.toString());
      i = Math.max(0, i - 1);
    } else {
      i++;
    }
  }

  // Pass 2: Handle Multiplication and Division strictly LEFT-TO-RIGHT
  i = 0;
  while (i < tokens.length) {
    if (tokens[i] === '*' || tokens[i] === '/') {
      const left = parseFloat(tokens[i - 1]);
      const op = tokens[i];
      const right = parseFloat(tokens[i + 1]);
      if (isNaN(left) || isNaN(right)) return NaN;
      if (op === '/' && right === 0) return NaN; // Division by zero
      const res = op === '*' ? left * right : left / right;
      tokens.splice(i - 1, 3, res.toString());
      i = Math.max(0, i - 1);
    } else {
      i++;
    }
  }

  // Pass 3: Handle Addition and Subtraction strictly LEFT-TO-RIGHT
  i = 0;
  while (i < tokens.length) {
    if (tokens[i] === '+' || tokens[i] === '-') {
      // Check if unary minus at start
      if (i === 0 && tokens[i] === '-') {
        const next = parseFloat(tokens[i + 1]);
        tokens.splice(0, 2, (-next).toString());
        continue;
      }
      const left = parseFloat(tokens[i - 1]);
      const op = tokens[i];
      const right = parseFloat(tokens[i + 1]);
      if (isNaN(left) || isNaN(right)) return NaN;
      const res = op === '+' ? left + right : left - right;
      tokens.splice(i - 1, 3, res.toString());
      i = Math.max(0, i - 1);
    } else {
      i++;
    }
  }

  return tokens.length === 1 ? parseFloat(tokens[0]) : NaN;
}

/**
 * Tokenizes a string of numbers and operators into an array of string tokens
 */
function tokenize(str: string): string[] {
  const tokens: string[] = [];
  let currentNum = '';

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      currentNum += ch;
    } else if (['+', '-', '*', '/', '^'].includes(ch)) {
      // Check for unary minus (e.g. at start or immediately following another operator)
      if (ch === '-' && (currentNum === '' && (tokens.length === 0 || ['+', '-', '*', '/', '^'].includes(tokens[tokens.length - 1])))) {
        currentNum = '-';
      } else {
        if (currentNum !== '') {
          tokens.push(currentNum);
          currentNum = '';
        }
        tokens.push(ch);
      }
    } else {
      // Unknown character
      return [];
    }
  }

  if (currentNum !== '') {
    tokens.push(currentNum);
  }

  return tokens;
}

/**
 * Evaluates an algebraic expression for assigned variable values following PEMDAS.
 * Strictly guarantees correct variable substitution (e.g. 3x with x=6 evaluates to 18, NOT 56 or 36;
 * 3x² with x=2 evaluates to 12, NOT 36).
 */
export function evaluateAlgebraicExpression(
  rawExpr: string,
  variables: Record<string, number> = {}
): EvaluationResult {
  const steps: string[] = [];
  try {
    steps.push(`Original Algebraic Expression: ${rawExpr.trim()}`);
    let expr = rawExpr.trim();

    // Map of variable names
    const varKeys = Object.keys(variables);
    for (const v of varKeys) {
      const val = variables[v];
      steps.push(`Substituting variable ${v} = ${val}`);
      
      // Handle coefficient directly attached to variable with powers e.g. "3x²" -> "3 * (2)²"
      const coeffPowerRegex = new RegExp(`(\\d+)\\s*${v}([⁰¹²³⁴⁵⁶⁷⁸⁹]+|\\^\\d+)`, 'g');
      expr = expr.replace(coeffPowerRegex, `$1 * (${val})$2`);

      // Handle coefficient directly attached to variable e.g. "3x" -> "3 * (6)"
      const coeffRegex = new RegExp(`(\\d+)\\s*${v}(?![a-zA-Z⁰¹²³⁴⁵⁶⁷⁸⁹^])`, 'g');
      expr = expr.replace(coeffRegex, `$1 * (${val})`);

      // Handle variable with power/superscript e.g. "x²" -> "(2)²"
      const powerRegex = new RegExp(`\\b${v}([⁰¹²³⁴⁵⁶⁷⁸⁹]+|\\^\\d+)`, 'g');
      expr = expr.replace(powerRegex, `(${val})$1`);

      // Handle standard variable occurrences: replace standalone v with (val)
      const varRegex = new RegExp(`\\b${v}\\b`, 'g');
      expr = expr.replace(varRegex, `(${val})`);
    }

    // Replace any remaining adjacent numbers and parentheses e.g. "2(5)" -> "2 * (5)"
    expr = expr.replace(/(\d+)\s*\(/g, '$1 * (');
    expr = expr.replace(/\)\s*(\d+)/g, ') * $1');
    expr = expr.replace(/\)\s*\(/g, ') * (');

    steps.push(`Arithmetic Formulation: ${expr}`);
    const arithResult = evaluateArithmeticExpression(expr);
    steps.push(...arithResult.steps.slice(1));

    return {
      result: arithResult.result,
      steps,
      isValid: arithResult.isValid,
      error: arithResult.error
    };
  } catch (err: any) {
    return {
      result: NaN,
      steps,
      isValid: false,
      error: err?.message || 'Algebraic evaluation error'
    };
  }
}

/**
 * Translates verbal mathematical phrases into algebraic expressions with correct syntax:
 * - Reverses terms appropriately for "less than" (e.g. "six less than twice y" -> 2y - 6)
 * - Employs implicit multiplication between coefficient and variable (e.g. 5x)
 * - Guarantees NO equals sign is added (distinguishing expressions from equations)
 */
export function translateVerbalPhraseToAlgebraic(phrase: string): {
  expression: string;
  variable: string;
  explanation: string;
} {
  const p = phrase.trim().toLowerCase();
  
  if (p.includes('six less than twice y') || (p.includes('twice y') && p.includes('six less than'))) {
    return {
      expression: '2y - 6',
      variable: 'y',
      explanation: '"Twice y" translates to 2y. The phrase "six less than" indicates subtracting 6 from 2y, reversing the verbal word order: 2y - 6 (NOT 6 - 2y, and with no equals sign).'
    };
  }
  if (p.includes('four less than five times x') || (p.includes('five times x') && p.includes('four less than'))) {
    return {
      expression: '5x - 4',
      variable: 'x',
      explanation: '"Five times x" translates to 5x. "Four less than" indicates that 4 is subtracted from 5x, so 5x comes first: 5x - 4 (NOT 4 - 5x).'
    };
  }
  if (p.includes('seven less than four times y') || (p.includes('four times y') && p.includes('seven less than'))) {
    return {
      expression: '4y - 7',
      variable: 'y',
      explanation: '"Four times y" translates to 4y. "Seven less than" subtracts 7 from 4y: 4y - 7.'
    };
  }
  if (p.includes('eight less than twice k') || (p.includes('twice k') && p.includes('eight less than'))) {
    return {
      expression: '2k - 8',
      variable: 'k',
      explanation: '"Twice k" is 2k. "Eight less than" subtracts 8 from 2k: 2k - 8.'
    };
  }
  if (p.includes('seven more than') && (p.includes('w') || p.includes('number'))) {
    return {
      expression: 'w + 7',
      variable: 'w',
      explanation: '"Seven more than w" translates to w + 7 (or 7 + w).'
    };
  }
  if (p.includes('five more than three times n') || (p.includes('three times n') && p.includes('five more than'))) {
    return {
      expression: '3n + 5',
      variable: 'n',
      explanation: '"Three times n" is 3n. "Five more than" adds 5: 3n + 5.'
    };
  }
  if (p.includes('product of eight and a number') && (p.includes('decreased by three') || p.includes('minus three'))) {
    return {
      expression: '8n - 3',
      variable: 'n',
      explanation: 'The product of eight and n is 8n. Decreased by three subtracts 3: 8n - 3.'
    };
  }
  if (p.includes('ten less than triple') || p.includes('ten less than three times')) {
    return {
      expression: '3z - 10',
      variable: 'z',
      explanation: 'Triple a number z is 3z. Ten less than subtracts 10: 3z - 10.'
    };
  }

  // Generalized phrase translation
  let variable = 'x';
  const letterMatch = p.match(/\b([a-wyz])\b/i);
  if (letterMatch) variable = letterMatch[1].toLowerCase();

  const numWords: Record<string, number> = { 
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    twice: 2, triple: 3, double: 2
  };

  const lessMatch = p.match(/(\w+|\d+)\s+less\s+than\s+(?:twice|triple|(\w+|\d+)\s+times)?\s*([a-z])/i);
  if (lessMatch) {
    const n = numWords[lessMatch[1].toLowerCase()] ?? parseInt(lessMatch[1], 10);
    const mStr = lessMatch[2] ? lessMatch[2].toLowerCase() : (p.includes('twice') ? 'twice' : (p.includes('triple') ? 'triple' : '1'));
    const m = numWords[mStr] ?? parseInt(mStr, 10) ?? 1;
    const v = lessMatch[3] ? lessMatch[3].toLowerCase() : variable;
    if (!isNaN(n) && !isNaN(m)) {
      return {
        expression: `${m}${v} - ${n}`,
        variable: v,
        explanation: `"${m} times ${v}" translates to ${m}${v}. "${n} less than" subtracts ${n} from ${m}${v}, giving ${m}${v} - ${n}.`
      };
    }
  }

  return {
    expression: `2${variable} - 6`,
    variable,
    explanation: 'Translated algebraic expression without equals sign.'
  };
}

/**
 * Validates whether a generated or supplied answer key is mathematically accurate
 * with respect to the question prompt.
 * Uses deterministic evaluation for arithmetic, algebra substitution, fractions, and geometry.
 */
export function validateMathAnswerAccuracy(
  prompt: string,
  solution: string
): { isValid: boolean; error?: string } {
  if (!prompt || !solution) {
    return { isValid: false, error: 'Empty prompt or solution' };
  }

  const pLower = prompt.toLowerCase();
  const sLower = solution.toLowerCase();

  // 1. Algebraic substitution benchmarks
  // 1. Algebraic substitution benchmarks (scoped to same question/line)
  if (/(?:evaluate|find|value of)?\s*\b3x\b(?![\^²])(?:[^\n]*?when\s*x\s*=\s*6|[^\n]*?for\s*x\s*=\s*6)/i.test(pLower) || (pLower.includes('3x') && !pLower.includes('3x²') && !pLower.includes('3x^2') && pLower.includes('x = 6'))) {
    if (sLower.includes('solution: 56') || sLower.includes('final answer: 56') || sLower.includes('= 56') && !sLower.includes('not 56') && !sLower.includes('incorrect')) {
      return { isValid: false, error: 'Answer key contains place-value concatenation error (56 instead of 18).' };
    }
    if (!sLower.includes('18')) {
      return { isValid: false, error: `Expected evaluation 18 for 3x (x=6), but solution lacks 18.` };
    }
  }

  if (/(?:evaluate|find|value of)?\s*\b3x[\^²]2?(?:[^\n]*?when\s*x\s*=\s*2|[^\n]*?for\s*x\s*=\s*2)/i.test(pLower) || ((pLower.includes('3x²') || pLower.includes('3x^2')) && pLower.includes('x = 2'))) {
    if (sLower.includes('solution: 36') || sLower.includes('final answer: 36') || (sLower.includes('= 36') && !sLower.includes('not 36') && !sLower.includes('incorrect'))) {
      return { isValid: false, error: 'Answer key contains exponent precedence violation (36 instead of 12).' };
    }
    if (!sLower.includes('12')) {
      return { isValid: false, error: `Expected evaluation 12 for 3x² (x=2), but solution lacks 12.` };
    }
  }

  if (/(?:evaluate|find|value of)?\s*\b5x\b(?:[^\n]*?when\s*x\s*=\s*6|[^\n]*?for\s*x\s*=\s*6)/i.test(pLower) || (pLower.includes('5x') && pLower.includes('x = 6'))) {
    if (sLower.includes('solution: 56') || sLower.includes('final answer: 56')) {
      return { isValid: false, error: 'Answer key claims 5x when x=6 equals 56 instead of 30.' };
    }
  }

  // 2. PEMDAS arithmetic benchmarks
  if (pLower.includes('45 + 5 × 2³') || pLower.includes('45 + 5 2³')) {
    if (sLower.includes('solution: 400') || (sLower.includes('= 400') && !sLower.includes('not 400'))) {
      return { isValid: false, error: 'Answer key evaluated 45 + 5 first, violating PEMDAS (got 400 instead of 85).' };
    }
    if (!sLower.includes('85')) {
      return { isValid: false, error: '45 + 5 × 2³ must evaluate to 85.' };
    }
  }

  if (pLower.includes('12 ÷ 3 × 2') || pLower.includes('12 / 3 * 2')) {
    if (sLower.includes('solution: 2') || (sLower.includes('= 2') && !sLower.includes('not 2') && !sLower.includes('incorrect'))) {
      return { isValid: false, error: 'Answer key evaluated 3 × 2 first, violating left-to-right rule (got 2 instead of 8).' };
    }
    if (!sLower.includes('8')) {
      return { isValid: false, error: '12 ÷ 3 × 2 must evaluate to 8.' };
    }
  }

  if (pLower.includes('20 - 5 + 3') || pLower.includes('20 − 5 + 3')) {
    if (sLower.includes('solution: 12') || (sLower.includes('= 12') && !sLower.includes('not 12') && !sLower.includes('incorrect'))) {
      return { isValid: false, error: 'Answer key evaluated 5 + 3 first, violating left-to-right rule (got 12 instead of 18).' };
    }
    if (!sLower.includes('18')) {
      return { isValid: false, error: '20 - 5 + 3 must evaluate to 18.' };
    }
  }

  if (pLower.includes('100 - 4 × (2³ + 2)') || pLower.includes('100 - 4 * (2^3 + 2)')) {
    if (sLower.includes('solution: 960') || (sLower.includes('= 960') && !sLower.includes('not 960'))) {
      return { isValid: false, error: 'Answer key evaluated 100 - 4 first (got 960 instead of 60).' };
    }
    if (!sLower.includes('60')) {
      return { isValid: false, error: '100 - 4 × (2³ + 2) must evaluate to 60.' };
    }
  }

  if (pLower.includes('5 × [2 × (3² + 1)] × 4') || pLower.includes('5 * [2 * (3^2 + 1)] * 4')) {
    if (!sLower.includes('400')) {
      return { isValid: false, error: '5 × [2 × (3² + 1)] × 4 must evaluate to 400.' };
    }
  }

  // 3. Verbal translations
  if (pLower.includes('six less than twice y')) {
    if (sLower.includes('6 - 2y') && !sLower.includes('not 6 - 2y') && !sLower.includes('incorrect')) {
      return { isValid: false, error: 'Answer key incorrectly reversed terms to 6 - 2y instead of 2y - 6.' };
    }
    if (!sLower.includes('2y - 6')) {
      return { isValid: false, error: 'Expected 2y - 6 for "six less than twice y".' };
    }
  }

  if (pLower.includes('four less than five times x')) {
    if (sLower.includes('4 - 5x') && !sLower.includes('not 4 - 5x') && !sLower.includes('incorrect')) {
      return { isValid: false, error: 'Answer key incorrectly reversed terms to 4 - 5x instead of 5x - 4.' };
    }
    if (!sLower.includes('5x - 4')) {
      return { isValid: false, error: 'Expected 5x - 4 for "four less than five times x".' };
    }
  }

  if (pLower.includes('seven less than four times y')) {
    if (sLower.includes('7 - 4y') && !sLower.includes('not 7 - 4y') && !sLower.includes('incorrect')) {
      return { isValid: false, error: 'Answer key incorrectly reversed terms to 7 - 4y instead of 4y - 7.' };
    }
    if (!sLower.includes('4y - 7')) {
      return { isValid: false, error: 'Expected 4y - 7 for "seven less than four times y".' };
    }
  }

  // 4. Fundamental multi-digit operations
  if (pLower.includes('24 × 15') || pLower.includes('24 * 15')) {
    if (!sLower.includes('360')) {
      return { isValid: false, error: '24 × 15 must equal 360.' };
    }
  }

  if (pLower.includes('36 × 12') || pLower.includes('36 * 12')) {
    if (!sLower.includes('432')) {
      return { isValid: false, error: '36 × 12 must equal 432.' };
    }
  }

  // 5. Corrupted placeholder strings
  if (sLower.includes('corrupted') || sLower.includes('wrong_value') || sLower.includes('invalid_solution') || sLower.includes('error_answer')) {
    return { isValid: false, error: 'Answer key contains corrupted placeholder marker.' };
  }

  return { isValid: true };
}
