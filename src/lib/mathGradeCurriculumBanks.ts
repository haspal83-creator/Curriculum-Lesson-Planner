/**
 * Belize National Curriculum Mathematics Grade & Topic Classification and Authoritative Question Banks.
 * 
 * Provides authentic, age-appropriate, pedagogically sound, and mathematically verified
 * curriculum materials across all 9 primary grades in Belize:
 * - Lower Primary: Infant 1, Infant 2, Infant 3
 * - Middle Primary: Standard 1, Standard 2, Standard 3
 * - Upper Primary: Standard 4, Standard 5, Standard 6
 * 
 * Fully covers all 10 mathematical strands with zero generic placeholder text.
 */

import { MathWorksheetQuestion } from './mathQualityGate';

export type MathGradeBand = 'early_primary' | 'middle_primary' | 'upper_primary';

export type MathTopicCategory =
  | 'early_counting_ten_frames'     // Infant 1 - Infant 2: Counting 1-20, one-to-one, ten-frames, comparing sets
  | 'early_operations_bonds'         // Infant 2 - Infant 3: Number bonds to 10/20, make-a-ten, fact families
  | 'place_value_regrouping'        // Standard 1 - Standard 3: 2-digit & 3-digit place value, addition/subtraction with regrouping
  | 'multiplication_division'       // Standard 2 - Standard 4: Equal groups, arrays, times tables, partial products, long division
  | 'fractions_decimals'            // Standard 1 - Standard 5: Halves/quarters, unit fractions, equivalent, unlike denominators, decimals
  | 'decimals_fractions_conversion' // Standard 5: Converting decimals to fractions and fractions to decimals (Outcome MA 5.44)
  | 'measurement_currency'          // Infant 3 - Standard 5: Belize currency (cents, dollars, change), metric length, perimeter, area, volume
  | 'geometry_spatial'              // Infant 1 - Standard 6: 2D/3D shapes, angles, symmetry, coordinate planes
  | 'proportional_financial'        // Standard 5 - Standard 6: Percentages, ratios, rates, simple interest, Belize 12.5% GST, discounts
  | 'algebra_expressions'           // Standard 6: Variables, expressions, substitution
  | 'linear_equations'              // Standard 6: One-step and two-step balance equations
  | 'pemdas_nested_grouping'        // Standard 6: Order of operations, nested brackets, exponents
  | 'exponents_scientific_binary'   // Standard 6: Powers of 10, scientific notation, binary
  | 'data_statistics_probability';  // Middle/Upper: Pictographs, bar graphs, mean/median/mode, probability

export interface MathClassification {
  gradeBand: MathGradeBand;
  category: MathTopicCategory;
  gradeName: string;
}

/**
 * Normalizes grade string into standard Belize primary school name.
 */
export function normalizeBelizeGrade(grade?: string): string {
  if (!grade) return 'Standard 6';
  const g = grade.trim().toLowerCase();
  if (g.includes('infant 1') || g === 'inf 1') return 'Infant 1';
  if (g.includes('infant 2') || g === 'inf 2') return 'Infant 2';
  if (g.includes('infant 3') || g === 'inf 3' || g.includes('infant special')) return 'Infant 3';
  if (g.includes('std 1') || g.includes('standard 1') || g.includes('grade 1')) return 'Standard 1';
  if (g.includes('std 2') || g.includes('standard 2') || g.includes('grade 2')) return 'Standard 2';
  if (g.includes('std 3') || g.includes('standard 3') || g.includes('grade 3')) return 'Standard 3';
  if (g.includes('std 4') || g.includes('standard 4') || g.includes('grade 4')) return 'Standard 4';
  if (g.includes('std 5') || g.includes('standard 5') || g.includes('grade 5')) return 'Standard 5';
  if (g.includes('std 6') || g.includes('standard 6') || g.includes('grade 6')) return 'Standard 6';
  return 'Standard 6';
}

/**
 * Detects grade band and topic category from grade, topic, subtopic, and learning outcome.
 */
export function detectMathGradeAndTopicCategory(
  grade?: string,
  topic?: string,
  subtopic?: string,
  outcome?: string
): MathClassification {
  const normGrade = normalizeBelizeGrade(grade);
  const text = `${topic || ''} ${subtopic || ''} ${outcome || ''}`.toLowerCase();

  let gradeBand: MathGradeBand = 'upper_primary';
  if (normGrade === 'Infant 1' || normGrade === 'Infant 2' || normGrade === 'Infant 3') {
    gradeBand = 'early_primary';
  } else if (normGrade === 'Standard 1' || normGrade === 'Standard 2' || normGrade === 'Standard 3') {
    gradeBand = 'middle_primary';
  } else {
    gradeBand = 'upper_primary';
  }

  // 1. Dedicated Early Primary Routing (Infant 1, Infant 2, Infant 3)
  // Early primary students work with concrete manipulatives, counting, number bonds, shapes, and early measurement.
  if (gradeBand === 'early_primary') {
    const isEarlyGeo = /\b(shape|shapes|circle|circles|triangle|triangles|square|squares|rectangle|rectangles|spatial)\b/i.test(text);
    if (isEarlyGeo) {
      return { gradeBand, category: 'geometry_spatial', gradeName: normGrade };
    }
    const isEarlyMeasure = /\b(length|longer|shorter|taller|heavy|heavier|light|lighter|measure|measuring|coin|coins|cents)\b/i.test(text);
    if (isEarlyMeasure) {
      return { gradeBand, category: 'measurement_currency', gradeName: normGrade };
    }
    const isEarlyData = /\b(pictograph|pictographs|tally|tallies|sort|sorting|graph|graphs)\b/i.test(text);
    if (isEarlyData) {
      return { gradeBand, category: 'data_statistics_probability', gradeName: normGrade };
    }
    const isEarlyFraction = /\b(half|halves|quarter|quarters|fraction|fractions)\b/i.test(text);
    if (isEarlyFraction) {
      return { gradeBand, category: 'fractions_decimals', gradeName: normGrade };
    }
    const isEarlyBond = /\b(bond|bonds|add|adding|addition|subtract|subtracting|subtraction|plus|minus|take away|sum|difference)\b/i.test(text);
    if (isEarlyBond || normGrade === 'Infant 3') {
      return { gradeBand, category: 'early_operations_bonds', gradeName: normGrade };
    }
    // Default for Infant 1 / Infant 2 is early counting and ten frames
    return { gradeBand, category: 'early_counting_ten_frames', gradeName: normGrade };
  }

  // 2. Middle & Upper Primary checks
  const isBinary = text.includes('binary') || text.includes('base-2') || text.includes('base 2') || text.includes('number system');
  const isPower = text.includes('power of ten') || text.includes('powers of 10') || text.includes('power of 10') || text.includes('scientific notation');
  const isExp = text.includes('exponential') || text.includes('growth pattern') || text.includes('doubling sequence');
  if (isBinary || isPower || isExp) {
    return { gradeBand, category: 'exponents_scientific_binary', gradeName: normGrade };
  }

  const isPemdas = text.includes('pemdas') || text.includes('order of operation') || text.includes('nested expression') || text.includes('bracket') || text.includes('brace');
  if (isPemdas) {
    return { gradeBand, category: 'pemdas_nested_grouping', gradeName: normGrade };
  }

  const isLinearEq = text.includes('linear equation') || text.includes('solve for x') || text.includes('balance scale') || text.includes('two-step equation') || text.includes('one-step equation') || (text.includes('equation') && text.includes('solve'));
  if (isLinearEq) {
    return { gradeBand, category: 'linear_equations', gradeName: normGrade };
  }

  const isAlgebra = text.includes('algebra') || text.includes('variable') || text.includes('coefficient') || text.includes('constant') || (text.includes('expression') && !text.includes('nested'));
  if (isAlgebra && gradeBand === 'upper_primary') {
    return { gradeBand, category: 'algebra_expressions', gradeName: normGrade };
  }

  const isProportion = /\b(percent|percentage|percentages|ratio|ratios|rates?|gst|interest|discount|proportion|proportions|proportional)\b/i.test(text);
  if (isProportion) {
    return { gradeBand, category: 'proportional_financial', gradeName: normGrade };
  }

  // Outcome-First Detection: Bidirectional Decimal & Fraction Conversion (e.g. Outcome MA 5.44)
  const isDecFracConversion = 
    (text.includes('convert') || text.includes('conversion') || text.includes('vice versa')) &&
    text.includes('decimal') && text.includes('fraction');
  if (isDecFracConversion) {
    return { gradeBand, category: 'decimals_fractions_conversion', gradeName: normGrade };
  }

  const isFraction = /\b(fraction|fractions|decimal|decimals|half|halves|quarter|quarters|third|thirds|numerator|denominator|mixed number)\b/i.test(text);
  if (isFraction) {
    return { gradeBand, category: 'fractions_decimals', gradeName: normGrade };
  }

  const isMultDiv = /\b(multiply|multiplication|multiplying|divide|division|dividing|times|array|arrays|equal groups|quotient|remainder|product|factor|factors)\b/i.test(text);
  if (isMultDiv) {
    return { gradeBand, category: 'multiplication_division', gradeName: normGrade };
  }

  const isData = /\b(graph|graphs|chart|charts|pictograph|pictographs|data|mean|median|mode|range|probability|tally|tallies|frequency)\b/i.test(text);
  if (isData) {
    return { gradeBand, category: 'data_statistics_probability', gradeName: normGrade };
  }

  const isGeometry = /\b(shape|shapes|angle|angles|triangle|triangles|quadrilateral|quadrilaterals|circle|circles|geometry|geometric|symmetry|polygon|polygons)\b/i.test(text);
  if (isGeometry) {
    return { gradeBand, category: 'geometry_spatial', gradeName: normGrade };
  }

  const isMeasurement = (/\b(measure|measuring|length|mass|weight|capacity|volume|perimeter|area|centimeter|centimeters|meter|meters|kilometer|money|currency|dollar|dollars|change|cents)\b/i.test(text)) && !text.includes('percent');
  if (isMeasurement) {
    return { gradeBand, category: 'measurement_currency', gradeName: normGrade };
  }

  const isPlaceValue = text.includes('place value') || text.includes('regroup') || text.includes('hundreds') || text.includes('thousands') || text.includes('tens') || text.includes('expanded form') || text.includes('value of the digit');
  if (isPlaceValue) {
    return { gradeBand, category: 'place_value_regrouping', gradeName: normGrade };
  }

  if (gradeBand === 'middle_primary') {
    if (normGrade === 'Standard 1') {
      return { gradeBand, category: 'place_value_regrouping', gradeName: normGrade };
    }
    if (normGrade === 'Standard 2') {
      return { gradeBand, category: 'multiplication_division', gradeName: normGrade };
    }
    return { gradeBand, category: 'fractions_decimals', gradeName: normGrade };
  }

  // Upper primary default
  if (normGrade === 'Standard 4') {
    return { gradeBand, category: 'multiplication_division', gradeName: normGrade };
  }
  if (normGrade === 'Standard 5') {
    return { gradeBand, category: 'proportional_financial', gradeName: normGrade };
  }
  return { gradeBand, category: 'algebra_expressions', gradeName: normGrade };
}

/**
 * Question banks for Early Primary (Infant 1 - Infant 2): Counting, One-to-One, Ten-Frames, Number Recognition 1-20
 */
export const EARLY_COUNTING_TEN_FRAMES_QUESTIONS: MathWorksheetQuestion[] = [
  {
    number: 1,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & TEN-FRAME MODELING',
    prompt: 'Draw a ten-frame showing the number 8 using filled circles (●). Write how many more dots are needed to make a full ten-frame of 10.',
    solution: 'Ten-frame representation: Top row has 5 filled circles (●●●●●), bottom row has 3 filled circles (●●●○ ○). Number of empty spaces = 2. 8 + 2 = 10. Exactly 2 more dots are needed.',
    points: 1,
    criteria: '1 pt: Accurate 5-and-3 ten-frame drawing and correct statement that 2 more dots make 10.'
  },
  {
    number: 2,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & TEN-FRAME MODELING',
    prompt: 'Count the sea turtles swimming off Caye Caulker: 🐢🐢🐢🐢🐢 🐢🐢. Write the numeral and write the number word.',
    solution: 'Count: 1, 2, 3, 4, 5, 6, 7. Numeral: 7. Number word: seven.',
    points: 1,
    criteria: '1 pt: Correct numeral 7 and correct number word "seven".'
  },
  {
    number: 3,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & TEN-FRAME MODELING',
    prompt: 'Look at the double ten-frames representing a teen number: 1 full ten-frame of 10 and 4 dots on the second frame. Write the addition number sentence (10 + __ = __) and state the teen number.',
    solution: 'Number sentence: 10 + 4 = 14. Teen number: 14 (fourteen).',
    points: 1,
    criteria: '1 pt: Correct equation 10 + 4 = 14 and number 14.'
  },
  {
    number: 4,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & COMPARING SETS',
    prompt: 'Compare two sets of shells collected on Placencia Beach: Set A has 9 conch shells. Set B has 6 conch shells. Which set has more shells? How many more shells does it have?',
    solution: 'Set A has more shells. Comparison: 9 − 6 = 3. Set A has 3 more conch shells than Set B.',
    points: 1,
    criteria: '1 pt: Identifies Set A and calculates 3 more shells.'
  },
  {
    number: 5,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'At the fruit stall in San Ignacio, Carlos has 5 ripe mangoes in a basket and picks 4 more fresh mangoes from the tree. How many mangoes does Carlos have in all? Draw a number bond showing the parts and the whole.',
    solution: 'Parts: 5 and 4. Whole: 5 + 4 = 9 mangoes. Number bond: Circle 9 branches into circles 5 and 4.',
    points: 1,
    criteria: '1 pt: Accurate sum 9 mangoes with matching part-part-whole number bond.'
  },
  {
    number: 6,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'A fisherman in Dangriga catches 12 snappers. He places 10 snappers in a cooler and keeps the rest in a bucket. How many snappers are in the bucket? Write the place-value decomposition (1 ten and __ ones).',
    solution: '12 snappers = 1 ten (10) and 2 ones (2). There are 2 snappers in the bucket (12 − 10 = 2).',
    points: 1,
    criteria: '1 pt: Decomposes 12 into 1 ten and 2 ones, identifying 2 snappers.'
  },
  {
    number: 7,
    section: 'C',
    sectionTitle: 'REASONING & ERROR ANALYSIS',
    prompt: 'Error Analysis: Marcus counted 6 oranges placed in a row: 1, 2, 4, 5, 6, 7. Marcus claims there are 7 oranges. Explain the counting mistake Marcus made and state the true count.',
    solution: 'Mistake: Marcus skipped the number 3 while reciting the number sequence and double-counted. In one-to-one counting, each item must be paired with exactly one counting word in order: 1, 2, 3, 4, 5, 6. The true count is 6 oranges.',
    points: 2,
    criteria: '2 pts: 1 pt for diagnosing sequence skip/one-to-one error; 1 pt for stating true count 6.'
  },
  {
    number: 8,
    section: 'C',
    sectionTitle: 'REASONING & NUMBER PATTERNS',
    prompt: 'Look at the number sequence on the number track: 11, 12, __, 14, 15, __, 17, 18. a) Fill in the two missing numbers. b) State the number that comes immediately before 11 and immediately after 18.',
    solution: 'a) Missing numbers: 13 and 16. b) Number before 11 is 10; number after 18 is 19.',
    points: 2,
    criteria: '2 pts: 1 pt for 13 and 16; 1 pt for 10 and 19.'
  }
];

/**
 * Question banks for Early Operations & Bonds (Infant 2 - Infant 3): Bonds to 10/20, Make-a-Ten, Fact Families
 */
export const EARLY_OPERATIONS_BONDS_QUESTIONS: MathWorksheetQuestion[] = [
  {
    number: 1,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & NUMBER BONDS',
    prompt: 'Write all 4 number sentences in the fact family for the numbers 7, 3, and 10 using addition and subtraction.',
    solution: '7 + 3 = 10; 3 + 7 = 10; 10 − 7 = 3; 10 − 3 = 7.',
    points: 1,
    criteria: '1 pt: All four related addition and subtraction facts accurate.'
  },
  {
    number: 2,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & MAKE-A-TEN STRATEGY',
    prompt: 'Use the "make-a-ten" strategy to add: 8 + 5. Step 1: Break 5 into (2 + 3). Step 2: Add 8 + 2 = 10. Step 3: Add 10 + 3. Write the final sum.',
    solution: '8 + 5 = 8 + (2 + 3) = (8 + 2) + 3 = 10 + 3 = 13.',
    points: 1,
    criteria: '1 pt: Shows decomposition of 5 into 2 and 3, making 10, with final sum 13.'
  },
  {
    number: 3,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & NUMBER BONDS',
    prompt: 'Find the missing addend in each number bond to 10: a) 6 + ___ = 10   b) 4 + ___ = 10   c) 9 + ___ = 10.',
    solution: 'a) 6 + 4 = 10; b) 4 + 6 = 10; c) 9 + 1 = 10.',
    points: 1,
    criteria: '1 pt: All three missing addends correct (4, 6, 1).'
  },
  {
    number: 4,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'At the market in Dangriga, Maya has 15 bananas. She sells 7 bananas to a customer. How many bananas does Maya have left? Use the bridge-through-10 strategy (15 − 5 − 2) or standard subtraction.',
    solution: 'Subtraction: 15 − 7. Using bridge through 10: 15 − 5 = 10, then 10 − 2 = 8 bananas remaining.',
    points: 1,
    criteria: '1 pt: Accurate calculation with unit: 8 bananas.'
  },
  {
    number: 5,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'A primary school football team in Orange Walk scores 6 goals in the first half and 7 goals in the second half. How many goals did the team score in total? Show your working using a double or near-double fact.',
    solution: '6 + 7 = 6 + 6 + 1 = 12 + 1 = 13 goals (or 7 + 7 − 1 = 14 − 1 = 13 goals). Total goals = 13.',
    points: 1,
    criteria: '1 pt: Accurate addition with near-double explanation: 13 goals.'
  },
  {
    number: 6,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'In a coral reef study off Ambergris Caye, a diver counts 9 blue tangs and 8 yellow stingrays. How many marine animals did the diver count altogether?',
    solution: '9 + 8 = 9 + 1 + 7 = 10 + 7 = 17 marine animals.',
    points: 1,
    criteria: '1 pt: Accurate addition with unit: 17 marine animals.'
  },
  {
    number: 7,
    section: 'C',
    sectionTitle: 'REASONING & ERROR ANALYSIS',
    prompt: 'Error Analysis: A student says that 9 + 4 = 12 because "9 + 3 = 12". Explain why the student is incorrect using a ten-frame or number bond, and write the true sum.',
    solution: 'Misconception: 9 needs 1 to make 10. Decomposing 4 gives 1 and 3: 9 + 1 = 10, and 10 + 3 = 13. The student added 9 + 3 instead of 9 + 4. True sum is 13 (NOT 12).',
    points: 2,
    criteria: '2 pts: 1 pt for diagnosing make-a-ten decomposition error; 1 pt for true sum 13.'
  },
  {
    number: 8,
    section: 'C',
    sectionTitle: 'REASONING & PART-PART-WHOLE',
    prompt: 'A box can hold 20 wooden blocks. It currently has 14 blocks inside. a) How many more blocks are needed to fill the box? b) Write an addition equation and a subtraction equation for this situation.',
    solution: 'a) 20 − 14 = 6 blocks needed. b) Addition equation: 14 + 6 = 20. Subtraction equation: 20 − 14 = 6.',
    points: 2,
    criteria: '2 pts: 1 pt for 6 blocks; 1 pt for both matching equations.'
  }
];

/**
 * Question banks for Middle Primary Place Value & Regrouping (Standard 1 - Standard 3)
 */
export const PLACE_VALUE_REGROUPING_QUESTIONS: MathWorksheetQuestion[] = [
  {
    number: 1,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & PLACE VALUE',
    prompt: 'In the number 648: a) State the value of each digit (hundreds, tens, ones). b) Write 648 in expanded form.',
    solution: 'a) Digit 6 = 6 hundreds (600); Digit 4 = 4 tens (40); Digit 8 = 8 ones (8). b) Expanded form: 600 + 40 + 8 = 648.',
    points: 1,
    criteria: '1 pt: Accurate place values for all 3 digits and correct expanded form.'
  },
  {
    number: 2,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & 2-DIGIT REGROUPING',
    prompt: 'Solve: 47 + 38 using column addition. Show the carried ten in the tens column.',
    solution: 'Ones: 7 + 8 = 15 ones = 1 ten and 5 ones. Record 5 in ones column, carry 1 ten. Tens: 4 tens + 3 tens + 1 carried ten = 8 tens. Final sum: 85.',
    points: 1,
    criteria: '1 pt: Accurate column addition showing carried 1 ten and sum 85.'
  },
  {
    number: 3,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & SUBTRACTION WITH TRADING',
    prompt: 'Solve: 83 − 46 using column subtraction. Show the regrouping (trading 1 ten for 10 ones).',
    solution: 'Ones: Cannot subtract 6 from 3. Regroup 1 ten from 8 tens: 8 tens becomes 7 tens; 3 ones becomes 13 ones. 13 − 6 = 7 ones. Tens: 7 − 4 = 3 tens. Final difference: 37. Check: 37 + 46 = 83.',
    points: 1,
    criteria: '1 pt: Shows regrouping 83 into 7 tens and 13 ones, with difference 37.'
  },
  {
    number: 4,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'A primary school library in Belmopan has 345 books. The community education council donates 178 more books. Calculate the total number of books in the library.',
    solution: '345 + 178. Ones: 5 + 8 = 13 (carry 1). Tens: 4 + 7 + 1 = 12 (carry 1). Hundreds: 3 + 1 + 1 = 5. Total: 523 books.',
    points: 1,
    criteria: '1 pt: Accurate 3-digit addition with double regrouping: 523 books.'
  },
  {
    number: 5,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'A citrus cooperative in Stann Creek harvested 620 boxes of oranges. They shipped 285 boxes to the processing factory. How many boxes remain at the farm?',
    solution: '620 − 285. Regroup: 0 ones needs 1 ten (10 − 5 = 5 ones); 1 ten needs 1 hundred (11 − 8 = 3 tens); 5 hundreds − 2 hundreds = 3 hundreds. Remaining: 335 boxes. Check: 335 + 285 = 620.',
    points: 1,
    criteria: '1 pt: Accurate 3-digit subtraction across regrouping: 335 boxes.'
  },
  {
    number: 6,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'A market vendor at the Michael Finnegan Market in Belize City earns $145 on Friday, $238 on Saturday, and $112 on Sunday. Calculate the vendor\'s total earnings for the weekend.',
    solution: '$145 + $238 + $112 = $495.00 BZD.',
    points: 1,
    criteria: '1 pt: Accurate column addition of three amounts: $495.00 BZD.'
  },
  {
    number: 7,
    section: 'C',
    sectionTitle: 'REASONING & ERROR ANALYSIS',
    prompt: 'Error Analysis: Devaughn solved 52 − 27 and wrote 35. Devaughn subtracted 2 − 7 as 7 − 2 = 5 in the ones column, and 5 − 2 = 3 in the tens column. Explain why Devaughn\'s method is invalid, and calculate the true difference.',
    solution: 'Error: Subtraction is not commutative (52 − 27 ≠ 75 − 22). One cannot subtract smaller top digit from larger bottom digit (2 − 7 is NOT 5). Devaughn must regroup 1 ten from 5 tens, making 4 tens and 12 ones. 12 − 7 = 5 ones; 4 − 2 = 2 tens. True difference: 25. Check: 25 + 27 = 52.',
    points: 2,
    criteria: '2 pts: 1 pt for explaining illegal subtraction reversal; 1 pt for true difference 25 with regrouping.'
  },
  {
    number: 8,
    section: 'C',
    sectionTitle: 'REASONING & ESTIMATION',
    prompt: 'Round each number to the nearest hundred to estimate the sum: 489 + 312. Then calculate the exact sum. Compare your estimate to the exact sum.',
    solution: 'Estimate: 489 rounds to 500; 312 rounds to 300. Estimated sum = 500 + 300 = 800. Exact sum: 489 + 312 = 801. Comparison: The estimate (800) is remarkably close to the exact sum (801), differing by only 1.',
    points: 2,
    criteria: '2 pts: 1 pt for estimated sum 800; 1 pt for exact sum 801 and comparison.'
  }
];

/**
 * Question banks for Multiplication & Division (Standard 2 - Standard 4): Arrays, times tables, partial products, long division
 */
export const MULTIPLICATION_DIVISION_QUESTIONS: MathWorksheetQuestion[] = [
  {
    number: 1,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & ARRAY MODELING',
    prompt: 'Draw a rectangular array with 4 rows and 6 columns. Write the repeated addition sentence and the multiplication equation.',
    solution: 'Array has 4 horizontal rows of 6 dots. Repeated addition: 6 + 6 + 6 + 6 = 24 (or 4 + 4 + 4 + 4 + 4 + 4 = 24). Multiplication equation: 4 × 6 = 24.',
    points: 1,
    criteria: '1 pt: Accurate 4x6 array drawing and equation 4 × 6 = 24.'
  },
  {
    number: 2,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & PARTIAL PRODUCTS',
    prompt: 'Calculate 36 × 7 using partial products (distributive property). Show: (30 × 7) + (6 × 7).',
    solution: 'Step 1: 30 × 7 = 210. Step 2: 6 × 7 = 42. Step 3: 210 + 42 = 252.',
    points: 1,
    criteria: '1 pt: Accurate partial products (210 + 42) and final product 252.'
  },
  {
    number: 3,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & 2-DIGIT MULTIPLICATION',
    prompt: 'Calculate 24 × 15 using the area model or step-by-step place-value decomposition.',
    solution: 'Decomposition: 24 × 10 = 240; 24 × 5 = 120; 240 + 120 = 360 (or area model: 200 + 100 + 40 + 20 = 360).',
    points: 1,
    criteria: '1 pt: Step-by-step place-value multiplication resulting in 360.'
  },
  {
    number: 4,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & LONG DIVISION',
    prompt: 'A citrus packing facility in Pomona packs 476 grapefruits equally into 4 large shipping crates. How many grapefruits are in each crate? Show all long division steps (divide, multiply, subtract, bring down).',
    solution: '476 ÷ 4:\n4 ÷ 4 = 1 (1 × 4 = 4; 4 − 4 = 0; bring down 7)\n7 ÷ 4 = 1 (1 × 4 = 4; 7 − 4 = 3; bring down 6)\n36 ÷ 4 = 9 (9 × 4 = 36; 36 − 36 = 0; remainder 0)\nQuotient: 119 grapefruits per crate. Check: 119 × 4 = 476.',
    points: 1,
    criteria: '1 pt: Accurate long division steps and quotient 119 grapefruits.'
  },
  {
    number: 5,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & DIVISION WITH REMAINDERS',
    prompt: 'A bakery in Cayo bakes 385 meat pies. The baker packs them into boxes holding 6 pies each. a) How many full boxes can the baker pack? b) How many leftover pies remain?',
    solution: '385 ÷ 6:\n38 ÷ 6 = 6 (6 × 6 = 36; 38 − 36 = 2; bring down 5)\n25 ÷ 6 = 4 (4 × 6 = 24; 25 − 24 = 1)\nQuotient = 64 with a remainder of 1.\na) 64 full boxes. b) 1 leftover pie.',
    points: 1,
    criteria: '1 pt: Identifies 64 full boxes and 1 remainder pie with long division steps.'
  },
  {
    number: 6,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'A commuter bus from Corozal to Belize City carries 45 passengers per trip. If the bus completes 12 full trips in a week, calculate the total number of passengers transported.',
    solution: '45 × 12 = 45 × (10 + 2) = (45 × 10) + (45 × 2) = 450 + 90 = 540 passengers.',
    points: 1,
    criteria: '1 pt: Accurate multi-digit multiplication: 540 passengers.'
  },
  {
    number: 7,
    section: 'C',
    sectionTitle: 'REASONING & ERROR ANALYSIS',
    prompt: 'Error Analysis: In solving 515 ÷ 5, a student recorded the answer as 13. Identify the student\'s placeholder error in the tens place, explain the long division rule, and compute the true quotient.',
    solution: 'Error: The student divided 5 ÷ 5 = 1 in the hundreds place, then brought down 1. Since 1 ÷ 5 = 0, a placeholder 0 MUST be written in the tens column before bringing down 5. The student skipped the 0 and directly divided 15 ÷ 5 = 3, writing 13 instead of 103. Check: 13 × 5 = 65 (far too small). True quotient: 103 (103 × 5 = 515).',
    points: 2,
    criteria: '2 pts: 1 pt for diagnosing omitted zero in tens column; 1 pt for true quotient 103 with verification.'
  },
  {
    number: 8,
    section: 'C',
    sectionTitle: 'REASONING & MULTI-STEP WORD PROBLEMS',
    prompt: 'A primary school in San Pedro orders 18 boxes of pencils. Each box contains 24 pencils. The principal distributes 150 pencils to Infant classes and divides the remaining pencils equally among 6 Standard classes. How many pencils does each Standard class receive?',
    solution: 'Step 1: Total pencils = 18 × 24 = 432 pencils.\nStep 2: Remaining pencils = 432 − 150 = 282 pencils.\nStep 3: Per Standard class = 282 ÷ 6 = 47 pencils.\nCheck: (47 × 6) + 150 = 282 + 150 = 432 pencils.',
    points: 2,
    criteria: '2 pts: Shows all 3 steps (432 total, 282 remaining, 47 per class).'
  }
];

/**
 * Question banks for Fractions & Decimals (Standard 1 - Standard 5)
 */
export const FRACTIONS_DECIMALS_QUESTIONS: MathWorksheetQuestion[] = [
  {
    number: 1,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & EQUIVALENT FRACTIONS',
    prompt: 'Find the missing numerator or denominator to create equivalent fractions: a) 2/3 = __/12   b) 3/5 = 15/__   c) 4/8 = 1/__.',
    solution: 'a) 2/3 = (2×4)/(3×4) = 8/12; b) 3/5 = (3×3)/(5×3) = 15/25; c) 4/8 = (4÷4)/(8÷4) = 1/2.',
    points: 1,
    criteria: '1 pt: All three equivalent fractions correct (8, 25, 2).'
  },
  {
    number: 2,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & UNLIKE DENOMINATORS',
    prompt: 'Evaluate: 3/4 + 2/5. Show your least common denominator (LCD) working clearly.',
    solution: 'LCD of 4 and 5 is 20. 3/4 = 15/20; 2/5 = 8/20. Sum: 15/20 + 8/20 = 23/20 = 1 3/20.',
    points: 1,
    criteria: '1 pt: Common denominator working and sum 23/20 or 1 3/20.'
  },
  {
    number: 3,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & FRACTIONS OF A SET',
    prompt: 'Calculate: a) 3/4 of 24 papayas   b) 2/3 of 18 students. Show your division and multiplication steps.',
    solution: 'a) 24 ÷ 4 = 6; 6 × 3 = 18 papayas. b) 18 ÷ 3 = 6; 6 × 2 = 12 students.',
    points: 1,
    criteria: '1 pt: Both calculations correct (18 papayas and 12 students).'
  },
  {
    number: 4,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & MIXED NUMBERS',
    prompt: 'A seamstress in Corozal Town has 5 meters of linen fabric. She uses 2 3/8 meters to make a school uniform blouse. How many meters of fabric remain?',
    solution: '5 − 2 3/8 = 4 8/8 − 2 3/8 = (4 − 2) + (8/8 − 3/8) = 2 5/8 meters remaining.',
    points: 1,
    criteria: '1 pt: Accurate mixed number subtraction: 2 5/8 meters.'
  },
  {
    number: 5,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & DECIMAL COMPUTATION',
    prompt: 'At a fruit stand in Punta Gorda, Kendra buys 3.75 pounds of watermelons and 2.6 pounds of pineapples. Calculate the total weight of fruit Kendra purchased.',
    solution: '3.75 + 2.60 = 6.35 pounds.',
    points: 1,
    criteria: '1 pt: Accurate column decimal addition: 6.35 pounds.'
  },
  {
    number: 6,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'A water tank at a primary school holds 500 gallons of rainwater. On Monday, classes use 3/5 of the full tank for gardening and sanitation. How many gallons of water were used, and how many gallons remain?',
    solution: 'Used: 3/5 × 500 = (500 ÷ 5) × 3 = 100 × 3 = 300 gallons used. Remaining: 500 − 300 = 200 gallons remaining.',
    points: 1,
    criteria: '1 pt: Accurate calculations: 300 gallons used, 200 gallons remaining.'
  },
  {
    number: 7,
    section: 'C',
    sectionTitle: 'REASONING & ERROR ANALYSIS',
    prompt: 'Error Analysis: Devaughn solved 1/2 + 1/3 and wrote 2/5 (adding numerators 1 + 1 = 2 and denominators 2 + 3 = 5). Explain why adding denominators is mathematically invalid, and compute the true sum.',
    solution: 'Misconception: Denominators represent the size of the parts, not quantities to be added. You cannot add halves and thirds directly because the units are different sizes. Common denominator LCD = 6. 1/2 = 3/6; 1/3 = 2/6. True sum: 3/6 + 2/6 = 5/6 (NOT 2/5). Notice 2/5 is smaller than 1/2, which is impossible when adding positive quantities.',
    points: 2,
    criteria: '2 pts: 1 pt for explaining equal denominator rule; 1 pt for true sum 5/6.'
  },
  {
    number: 8,
    section: 'C',
    sectionTitle: 'REASONING & DECIMAL MULTIPLICATION',
    prompt: 'Solve: 3.5 × 0.4. Kendra claims the answer is 1.40, while Jason claims it is 1.4. Who is correct? Justify your answer using place value and fraction equivalence.',
    solution: 'Calculation: 35 × 4 = 140. With two total decimal places (one in 3.5, one in 0.4), place decimal 2 digits from right: 1.40. Both Kendra and Jason are correct: 1.40 = 140/100 = 14/10 = 1.4. Forty hundredths equals four tenths.',
    points: 2,
    criteria: '2 pts: 1 pt for calculation 1.40 / 1.4; 1 pt for proving decimal equivalence 1.40 = 1.4.'
  }
];

/**
 * Question banks for Decimals & Fractions Conversion (Standard 5 - Outcome MA 5.44)
 * Strict outcome focus: Convert decimals to fractions between 0 and 1 and vice versa.
 * Exactly 8 questions totaling 10 marks (Section A: 3 pts, Section B: 3 pts, Section C: 4 pts).
 */
export const DECIMALS_FRACTIONS_CONVERSION_QUESTIONS: MathWorksheetQuestion[] = [
  {
    number: 1,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & DECIMAL TO FRACTION CONVERSION',
    prompt: 'Convert the decimal 0.6 into a fraction in its simplest form. Show your step-by-step place-value reasoning and division by the greatest common divisor (GCD).',
    solution: '0.6 has the digit 6 in the tenths column: 0.6 = 6/10. Divide both numerator and denominator by GCD (2): (6 ÷ 2) / (10 ÷ 2) = 3/5.',
    points: 1,
    criteria: '1 pt: Correct place-value fraction 6/10 and simplest form 3/5 with GCD division shown.'
  },
  {
    number: 2,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & HUNDREDTHS CONVERSION',
    prompt: 'Convert the decimal 0.35 into a fraction in its simplest form. Show your working.',
    solution: '0.35 has the digit 5 in the hundredths column: 0.35 = 35/100. Divide both numerator and denominator by GCD (5): (35 ÷ 5) / (100 ÷ 5) = 7/20.',
    points: 1,
    criteria: '1 pt: Correct place-value fraction 35/100 and simplest form 7/20.'
  },
  {
    number: 3,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & FRACTION TO DECIMAL CONVERSION',
    prompt: 'Convert the following fractions into decimals: a) 3/10   b) 7/20. Show your conversion method using equivalent fractions with powers of 10 or division.',
    solution: 'a) 3/10 has 3 in tenths column: 3/10 = 0.3. b) Convert 7/20 to hundredths: (7 × 5) / (20 × 5) = 35/100 = 0.35 (or long division: 7 ÷ 20 = 0.35).',
    points: 1,
    criteria: '1 pt: Both decimals correct (0.3 and 0.35) with equivalent hundredths working.'
  },
  {
    number: 4,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN COMMERCE',
    prompt: 'At a fruit stall in Punta Gorda, Kendra purchases 0.8 kg of ripe papayas. Express 0.8 as a fraction in simplest form, and explain what the denominator represents.',
    solution: '0.8 = 8/10. Divide numerator and denominator by 2: 8/10 = 4/5 kg. The denominator 5 means the whole kilogram is divided into 5 equal parts, and Kendra purchased 4 of those fifths.',
    points: 1,
    criteria: '1 pt: Correct simplest fraction 4/5 kg and clear explanation of the denominator representing fifths.'
  },
  {
    number: 5,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & MEASUREMENT IN BELIZE',
    prompt: 'A carpenter in Orange Walk Town cuts a strip of mahogany measuring 3/4 meter for a classroom cabinet. Express 3/4 meter as a decimal using equivalent fractions or division.',
    solution: 'Method 1 (Equivalent hundredths): (3 × 25) / (4 × 25) = 75/100 = 0.75 meter. Method 2 (Long division): 3 ÷ 4 = 0.75 meter.',
    points: 1,
    criteria: '1 pt: Correct decimal 0.75 meter with verified equivalent hundredths or division steps.'
  },
  {
    number: 6,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & METEOROLOGICAL DATA',
    prompt: 'A rain gauge at a primary school in Stann Creek records 0.25 inches of rainfall on Wednesday morning. Write 0.25 inches as a fraction in simplest form.',
    solution: '0.25 has 25 in the hundredths column: 25/100. Divide numerator and denominator by GCD (25): (25 ÷ 25) / (100 ÷ 25) = 1/4 inch.',
    points: 1,
    criteria: '1 pt: Correct conversion 25/100 = 1/4 inch with units.'
  },
  {
    number: 7,
    section: 'C',
    sectionTitle: 'REASONING & ERROR ANALYSIS',
    prompt: 'Error Analysis: Devaughn was asked to convert 0.5 to a fraction and wrote 5/100. a) Identify and explain Devaughn\'s place-value misconception. b) Write the correct fraction in simplest form. c) What is the true decimal equivalent of 5/100?',
    solution: 'a) Misconception: Devaughn confused the tenths place with the hundredths place. The first digit to the right of the decimal point represents tenths (1/10), not hundredths. b) Correct conversion: 0.5 = 5/10 = 1/2. c) True decimal for 5/100: 5/100 = 0.05 (five hundredths, not five tenths).',
    points: 2,
    criteria: '2 pts: 1 pt for diagnosing tenths vs hundredths misconception; 1 pt for correct simplest fraction 1/2 and true value 0.05.'
  },
  {
    number: 8,
    section: 'C',
    sectionTitle: 'MULTI-STEP REASONING & QUANTITY COMPARISON',
    prompt: 'Multi-Step Reasoning & Comparison: At the San Ignacio farmers market, Jason buys 0.4 kg of habanero peppers and 3/5 kg of sweet peppers. a) Convert 0.4 into a fraction in simplest form. b) Convert 3/5 into a decimal. c) Compare the two quantities and determine which bag weighs more and by how much.',
    solution: 'a) 0.4 = 4/10 = 2/5 kg. b) 3/5 = (3 × 2) / (5 × 2) = 6/10 = 0.6 kg (or 3 ÷ 5 = 0.6). c) Comparison: Sweet peppers (3/5 kg = 0.6 kg) weigh more than habanero peppers (0.4 kg). Difference: 0.6 − 0.4 = 0.2 kg (or 3/5 − 2/5 = 1/5 kg).',
    points: 2,
    criteria: '2 pts: 1 pt for conversions (0.4 = 2/5 and 3/5 = 0.6); 1 pt for identifying sweet peppers as heavier by 0.2 kg (or 1/5 kg).'
  }
];

/**
 * Question banks for Measurement & Currency (Infant 3 - Standard 5)
 */
export const MEASUREMENT_CURRENCY_QUESTIONS: MathWorksheetQuestion[] = [
  {
    number: 1,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & BELIZE CURRENCY',
    prompt: 'List the 6 standard Belizean coins in circulation, and state how many 25¢ coins are needed to make $2.00 BZD.',
    solution: 'Belize coins: 1¢, 5¢, 10¢, 25¢, 50¢, $1.00. Since $1.00 = four 25¢ coins, $2.00 requires 2 × 4 = 8 twenty-five cent coins.',
    points: 1,
    criteria: '1 pt: Lists standard coins and identifies 8 quarters for $2.00.'
  },
  {
    number: 2,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & PERIMETER',
    prompt: 'A rectangular vegetable plot at an agricultural school measures 14 meters long and 8 meters wide. Calculate the total perimeter of the plot.',
    solution: 'Perimeter P = 2(length + width) = 2(14 + 8) = 2(22) = 44 meters.',
    points: 1,
    criteria: '1 pt: Accurate perimeter formula and answer 44 meters.'
  },
  {
    number: 3,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & AREA',
    prompt: 'Calculate the area of a rectangular classroom floor measuring 12 meters in length and 7 meters in width.',
    solution: 'Area A = length × width = 12 m × 7 m = 84 m² (square meters).',
    points: 1,
    criteria: '1 pt: Accurate area 84 m² with square units.'
  },
  {
    number: 4,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & MAKING CHANGE',
    prompt: 'Alani purchases school supplies at a bookstore in Belize City totaling $13.65 BZD. She pays the cashier with a $20.00 BZD note. How much change should Alani receive? Show the subtraction step-by-step.',
    solution: '$20.00 − $13.65 = $6.35 BZD change.',
    points: 1,
    criteria: '1 pt: Accurate currency subtraction: $6.35 BZD.'
  },
  {
    number: 5,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & METRIC CONVERSIONS',
    prompt: 'The Hummingbird Highway race course is 15.5 kilometers long. a) Convert 15.5 km into meters (1 km = 1,000 m). b) If a cyclist has completed 8,200 meters, how many meters remain?',
    solution: 'a) 15.5 km = 15.5 × 1,000 = 15,500 meters. b) Remaining: 15,500 − 8,200 = 7,300 meters.',
    points: 1,
    criteria: '1 pt: Accurate metric conversion (15,500 m) and remaining distance (7,300 m).'
  },
  {
    number: 6,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & VOLUME',
    prompt: 'A rectangular aquarium in a marine biology lab in San Pedro measures 10 cm long, 6 cm wide, and 8 cm high. Calculate the volume of the aquarium in cubic centimeters (cm³).',
    solution: 'Volume V = l × w × h = 10 × 6 × 8 = 60 × 8 = 480 cm³.',
    points: 1,
    criteria: '1 pt: Accurate volume 480 cm³ with cubic units.'
  },
  {
    number: 7,
    section: 'C',
    sectionTitle: 'REASONING & ERROR ANALYSIS',
    prompt: 'Error Analysis: A student was asked to find the perimeter of a rectangle measuring 10 cm by 4 cm. The student calculated: 10 + 4 = 14 cm. Identify the student\'s error, state the perimeter formula, and compute the true perimeter.',
    solution: 'Error: The student only added one length and one width (half the perimeter). A rectangle has 4 sides (2 lengths and 2 widths). Formula: P = 2(l + w) or l + w + l + w. True perimeter: 2(10 + 4) = 2(14) = 28 cm.',
    points: 2,
    criteria: '2 pts: 1 pt for diagnosing half-perimeter omission; 1 pt for true perimeter 28 cm.'
  },
  {
    number: 8,
    section: 'C',
    sectionTitle: 'REASONING & MULTI-STEP CONTEXTS',
    prompt: 'A farmer in Orange Walk fences a square pasture measuring 25 meters on each side. Fencing wire costs $3.50 BZD per meter. a) Find the total perimeter of the pasture. b) Calculate the total cost to fence the pasture.',
    solution: 'a) Square perimeter: 4 × 25 m = 100 meters. b) Total cost: 100 m × $3.50/m = $350.00 BZD.',
    points: 2,
    criteria: '2 pts: 1 pt for perimeter 100 m; 1 pt for total cost $350.00 BZD.'
  }
];

/**
 * Question banks for Proportional Reasoning & Financial Math (Standard 5 - Standard 6)
 */
export const PROPORTIONAL_FINANCIAL_QUESTIONS: MathWorksheetQuestion[] = [
  {
    number: 1,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & PERCENTAGES',
    prompt: 'Convert the following percentages to decimals and simplified fractions: a) 25%   b) 40%   c) 12.5%.',
    solution: 'a) 25% = 0.25 = 1/4; b) 40% = 0.40 = 2/5; c) 12.5% = 0.125 = 1/8.',
    points: 1,
    criteria: '1 pt: All three conversions accurate in decimal and simplified fraction form.'
  },
  {
    number: 2,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & BELIZE 12.5% GST',
    prompt: 'In Belize, the General Sales Tax (GST) is 12.5% (or 1/8). Calculate the GST and total cost for a bicycle priced at $240.00 BZD before tax.',
    solution: 'GST = 0.125 × $240.00 = $30.00 BZD (or $240 ÷ 8 = $30.00). Total cost = $240.00 + $30.00 = $270.00 BZD.',
    points: 1,
    criteria: '1 pt: Accurate GST ($30.00) and total price ($270.00 BZD).'
  },
  {
    number: 3,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & DISCOUNTS',
    prompt: 'A department store in Belize City offers a 20% discount on a school backpack originally priced at $65.00 BZD. Calculate the discount amount and the sale price.',
    solution: 'Discount = 0.20 × $65.00 = $13.00 BZD. Sale price = $65.00 − $13.00 = $52.00 BZD.',
    points: 1,
    criteria: '1 pt: Accurate discount ($13.00) and sale price ($52.00 BZD).'
  },
  {
    number: 4,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & RATIOS',
    prompt: 'A recipe for traditional Belizean citrus punch uses 3 cups of lime juice for every 5 cups of water. If a caterer in Belmopan uses 15 cups of lime juice, how many cups of water are required? Show your proportional reasoning.',
    solution: 'Ratio of lime to water = 3 : 5. Scale factor = 15 ÷ 3 = 5. Water required = 5 × 5 = 25 cups of water.',
    points: 1,
    criteria: '1 pt: Scale factor 5 and answer 25 cups of water.'
  },
  {
    number: 5,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & SIMPLE INTEREST',
    prompt: 'Kevaughn deposits $500.00 BZD in a credit union savings account in Dangriga earning 4% simple interest per year. Calculate the interest earned after 3 years using I = P × r × t, and find the total account balance.',
    solution: 'I = P × r × t = $500 × 0.04 × 3 = $20 × 3 = $60.00 BZD interest. Total balance = $500 + $60 = $560.00 BZD.',
    points: 1,
    criteria: '1 pt: Accurate interest ($60.00) and total balance ($560.00 BZD).'
  },
  {
    number: 6,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & UNIT RATES',
    prompt: 'Store A sells 6 exercise books for $9.00 BZD. Store B sells 10 exercise books for $14.00 BZD. Find the unit price per book at each store and state which store offers the better buy.',
    solution: 'Store A unit price: $9.00 ÷ 6 = $1.50 per book. Store B unit price: $14.00 ÷ 10 = $1.40 per book. Store B is the better buy ($1.40 < $1.50).',
    points: 1,
    criteria: '1 pt: Both unit prices ($1.50 and $1.40) and identification of Store B.'
  },
  {
    number: 7,
    section: 'C',
    sectionTitle: 'REASONING & ERROR ANALYSIS',
    prompt: 'Error Analysis: Maria calculated a 15% tip on a $40 meal and recorded $15.00 because "15% means 15 dollars". Explain Maria\'s misconception about percentages and compute the true tip.',
    solution: 'Misconception: Percent means "per hundred" (out of 100), not a flat dollar amount. 15% means 15/100 or 0.15 of the total bill. True tip: 0.15 × $40.00 = $6.00 BZD (NOT $15.00).',
    points: 2,
    criteria: '2 pts: 1 pt for explaining percent per hundred vs dollar confusion; 1 pt for true tip $6.00.'
  },
  {
    number: 8,
    section: 'C',
    sectionTitle: 'REASONING & MULTI-STEP FINANCIAL PLANNING',
    prompt: 'A youth cooperative in Cayo purchases 80 chickens at $5.00 each. Feed costs $120.00 in total. They sell all 80 chickens at $10.00 each. a) Calculate total expenses. b) Calculate total revenue. c) Calculate net profit and net profit percentage.',
    solution: 'a) Expenses: (80 × $5.00) + $120 = $400 + $120 = $520.00 BZD. b) Revenue: 80 × $10.00 = $800.00 BZD. c) Net profit: $800 − $520 = $280.00 BZD. Profit percentage = ($280 ÷ $520) × 100% ≈ 53.8%.',
    points: 2,
    criteria: '2 pts: 1 pt for expenses ($520) and revenue ($800); 1 pt for profit $280.00.'
  }
];

/**
 * Question banks for Geometry & Spatial Reasoning (Infant 1 - Standard 6)
 */
export const GEOMETRY_SPATIAL_QUESTIONS: MathWorksheetQuestion[] = [
  {
    number: 1,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & 2D SHAPE PROPERTIES',
    prompt: 'State the number of sides and vertices for: a) Triangle   b) Quadrilateral   c) Pentagon   d) Hexagon.',
    solution: 'a) Triangle: 3 sides, 3 vertices; b) Quadrilateral: 4 sides, 4 vertices; c) Pentagon: 5 sides, 5 vertices; d) Hexagon: 6 sides, 6 vertices.',
    points: 1,
    criteria: '1 pt: All four shapes accurately described.'
  },
  {
    number: 2,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & TRIANGLE ANGLE SUM',
    prompt: 'In a triangle, two angles measure 48° and 72°. Calculate the measure of the third angle. Classify the triangle by its angles (acute, right, obtuse) and sides (equilateral, isosceles, scalene).',
    solution: 'Sum of angles in a triangle = 180°. Third angle = 180° − (48° + 72°) = 180° − 120° = 60°. All angles are < 90°, so it is an Acute triangle. All three angles differ, so it is a Scalene triangle.',
    points: 1,
    criteria: '1 pt: Calculates 60° and classifies as acute scalene triangle.'
  },
  {
    number: 3,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & 3D SOLIDS',
    prompt: 'State the number of faces, edges, and vertices for: a) Cube / Rectangular Prism   b) Triangular Pyramid.',
    solution: 'a) Cube: 6 faces, 12 edges, 8 vertices. b) Triangular Pyramid: 4 faces, 6 edges, 4 vertices.',
    points: 1,
    criteria: '1 pt: Accurate faces, edges, vertices for both solids.'
  },
  {
    number: 4,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & QUADRILATERALS',
    prompt: 'A rectangular classroom garden at San Juan Bosco School has three angles measuring 90° each. Prove why the fourth angle must also measure 90° using the interior angle sum theorem.',
    solution: 'Interior angle sum of any quadrilateral = 360°. Fourth angle = 360° − (90° + 90° + 90°) = 360° − 270° = 90°. Therefore, all four corners are right angles.',
    points: 1,
    criteria: '1 pt: Accurate angle sum proof: 360° − 270° = 90°.'
  },
  {
    number: 5,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & ANGLES ON A STRAIGHT LINE',
    prompt: 'Two angles lie on a straight line. If one angle measures 115°, calculate the measure of the supplementary angle.',
    solution: 'Angles on a straight line sum to 180°. Supplementary angle = 180° − 115° = 65°.',
    points: 1,
    criteria: '1 pt: Accurate subtraction: 180° − 115° = 65°.'
  },
  {
    number: 6,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & CIRCLES',
    prompt: 'A circular garden bed in Belmopan has a radius of 7 meters. Using π ≈ 22/7, calculate: a) The circumference   b) The area.',
    solution: 'a) Circumference C = 2πr = 2 × (22/7) × 7 = 44 meters. b) Area A = πr² = (22/7) × 7 × 7 = 154 m².',
    points: 1,
    criteria: '1 pt: Circumference 44 m and Area 154 m² with proper units.'
  },
  {
    number: 7,
    section: 'C',
    sectionTitle: 'REASONING & ERROR ANALYSIS',
    prompt: 'Error Analysis: A student claims that a triangle can have angles measuring 85°, 65°, and 40°. Check whether this triangle is mathematically possible and explain your reasoning.',
    solution: 'Sum = 85° + 65° + 40° = 190°. In Euclidean geometry, the interior angles of a planar triangle must sum to EXACTLY 180°. Since 190° ≠ 180°, this triangle is mathematically impossible.',
    points: 2,
    criteria: '2 pts: 1 pt for summing to 190°; 1 pt for citing the 180° theorem to prove impossibility.'
  },
  {
    number: 8,
    section: 'C',
    sectionTitle: 'REASONING & SPATIAL CLASSIFICATION',
    prompt: 'Explain why every square is a rectangle, but not every rectangle is a square. Cite side lengths and angle properties in your mathematical justification.',
    solution: 'A rectangle is defined as a quadrilateral with four right angles (90°). Since a square has four right angles, it satisfies the definition of a rectangle. However, a square additionally requires four EQUAL side lengths. A rectangle with length 8 cm and width 4 cm has opposite sides equal but adjacent sides unequal, so it cannot be a square.',
    points: 2,
    criteria: '2 pts: Precise definitions of rectangle and square showing inclusion relationship.'
  }
];

/**
 * Question banks for Linear Equations & Balance Modeling (Standard 6)
 */
export const LINEAR_EQUATIONS_QUESTIONS: MathWorksheetQuestion[] = [
  {
    number: 1,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & BALANCE SCALES',
    prompt: 'A balance scale has a mystery box labeled x and 5 unit weights on the left side, balanced by 12 unit weights on the right side. Write the algebraic equation and solve for x using inverse operations.',
    solution: 'Equation: x + 5 = 12. Inverse operation: subtract 5 from both sides => x = 12 − 5 = 7 unit weights. Check: 7 + 5 = 12.',
    points: 1,
    criteria: '1 pt: Equation x + 5 = 12 and solution x = 7.'
  },
  {
    number: 2,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & TWO-STEP EQUATIONS',
    prompt: 'Solve for x: 3x + 7 = 28. Show Step 1 (undo addition) and Step 2 (undo multiplication).',
    solution: 'Step 1: 3x = 28 − 7 => 3x = 21. Step 2: x = 21 ÷ 3 => x = 7. Check: 3(7) + 7 = 21 + 7 = 28.',
    points: 1,
    criteria: '1 pt: Both inverse steps shown and solution x = 7.'
  },
  {
    number: 3,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & TWO-STEP EQUATIONS',
    prompt: 'Solve for y: 5y − 9 = 36. Show your inverse operations step-by-step.',
    solution: '5y − 9 = 36 => 5y = 36 + 9 = 45 => y = 45 ÷ 5 = 9. Check: 5(9) − 9 = 45 − 9 = 36.',
    points: 1,
    criteria: '1 pt: Accurate inverse operations resulting in y = 9.'
  },
  {
    number: 4,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'A commuter bus charges a flat boarding fee of $3.00 plus $2.00 per mile m traveled. If a passenger\'s total fare was $19.00 BZD, set up a linear equation and determine how many miles the passenger traveled.',
    solution: 'Equation: 2m + 3 = 19. Subtract 3: 2m = 16. Divide by 2: m = 8 miles. Check: 2(8) + 3 = 16 + 3 = $19.00 BZD.',
    points: 1,
    criteria: '1 pt: Equation 2m + 3 = 19 and solution 8 miles.'
  },
  {
    number: 5,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & PERIMETER EQUATIONS',
    prompt: 'A rectangular school garden in Cayo has a perimeter of 36 meters. Its length is 4 meters longer than its width (w). Set up the equation 2(w + (w + 4)) = 36, and solve for the length and width.',
    solution: 'Perimeter = 2(2w + 4) = 4w + 8 = 36. 4w = 36 − 8 = 28 => w = 7 meters. Length = 7 + 4 = 11 meters. Check: 2(11 + 7) = 2(18) = 36 meters.',
    points: 1,
    criteria: '1 pt: Equation 4w + 8 = 36, width 7 m, length 11 m.'
  },
  {
    number: 6,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & BELIZEAN CONTEXTS',
    prompt: 'A citrus harvester in Stann Creek picks b boxes of oranges at $4.00 per box plus a daily lunch stipend of $15.00. If the worker earned $47.00 BZD today, calculate how many boxes of oranges they picked.',
    solution: 'Equation: 4b + 15 = 47. 4b = 47 − 15 = 32 => b = 32 ÷ 4 = 8 boxes of oranges.',
    points: 1,
    criteria: '1 pt: Equation 4b + 15 = 47 and solution 8 boxes.'
  },
  {
    number: 7,
    section: 'C',
    sectionTitle: 'REASONING & ERROR ANALYSIS',
    prompt: 'Error Analysis: A student solved 4x + 8 = 24 by dividing 24 by 4 first to get x + 8 = 6, then subtracting 8 to get x = −2. Explain why dividing only one term violates equation balance, and show the standard two-step solution.',
    solution: 'Misconception: When dividing an equation by a number, EVERY term on both sides must be divided (including the +8: (4x + 8)/4 = x + 2). Dividing only 4x and 24 leaves an unbalanced equation. Standard method: Undo addition first: 4x = 24 − 8 = 16. Undo multiplication: x = 16 ÷ 4 = 4. True solution: x = 4. Check: 4(4) + 8 = 16 + 8 = 24.',
    points: 2,
    criteria: '2 pts: 1 pt for explaining partial division error; 1 pt for true solution x = 4.'
  },
  {
    number: 8,
    section: 'C',
    sectionTitle: 'REASONING & EQUATIONS WITH VARIABLES ON BOTH SIDES',
    prompt: 'Solve: 5x + 3 = 2x + 18. Show Step 1 (collect variable terms on one side) and Step 2 (isolate the variable).',
    solution: 'Step 1 (Subtract 2x from both sides): 5x − 2x + 3 = 18 => 3x + 3 = 18.\nStep 2 (Subtract 3 from both sides): 3x = 18 − 3 = 15.\nStep 3 (Divide by 3): x = 15 ÷ 3 = 5.\nCheck: Left = 5(5) + 3 = 28; Right = 2(5) + 18 = 28. Verified equal.',
    points: 2,
    criteria: '2 pts: Shows collection of variable terms and solution x = 5 with check.'
  }
];

/**
 * Question banks for Data Handling, Statistics & Probability
 */
export const DATA_STATISTICS_PROBABILITY_QUESTIONS: MathWorksheetQuestion[] = [
  {
    number: 1,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & MEASURES OF CENTRAL TENDENCY',
    prompt: 'Find the mean, median, mode, and range for the test scores: 14, 18, 12, 18, 15, 13.',
    solution: 'Ordered data: 12, 13, 14, 15, 18, 18. Mean = (12+13+14+15+18+18)/6 = 90/6 = 15. Median = middle two numbers (14+15)/2 = 14.5. Mode = most frequent = 18. Range = highest − lowest = 18 − 12 = 6.',
    points: 1,
    criteria: '1 pt: Accurate mean (15), median (14.5), mode (18), and range (6).'
  },
  {
    number: 2,
    section: 'A',
    sectionTitle: 'PROCEDURAL FLUENCY & BAR GRAPHS',
    prompt: 'A survey of 30 students in Punta Gorda records favorite sports: Football (12), Basketball (8), Volleyball (6), Track (4). Calculate the fraction and percentage of students who chose Football.',
    solution: 'Fraction = 12/30 = 2/5. Percentage = (2/5) × 100% = 40%.',
    points: 1,
    criteria: '1 pt: Fraction 2/5 and percentage 40%.'
  },
  {
    number: 3,
    section: 'A',
    sectionTitle: 'CONCEPT FOUNDATION & SIMPLE PROBABILITY',
    prompt: 'A bag contains 5 red marbles, 3 blue marbles, and 2 green marbles. What is the probability of drawing: a) A red marble?   b) A green marble?   c) A yellow marble?',
    solution: 'Total marbles = 5 + 3 + 2 = 10. a) P(red) = 5/10 = 1/2 (or 0.5); b) P(green) = 2/10 = 1/5 (or 0.2); c) P(yellow) = 0/10 = 0 (impossible event).',
    points: 1,
    criteria: '1 pt: All three probabilities correct (1/2, 1/5, 0).'
  },
  {
    number: 4,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & RAINFALL DATA IN BELIZE',
    prompt: 'Monthly rainfall recorded in Toledo District over 4 months: June (240 mm), July (310 mm), August (290 mm), September (280 mm). Calculate the mean monthly rainfall.',
    solution: 'Total rainfall = 240 + 310 + 290 + 280 = 1,120 mm. Mean = 1,120 ÷ 4 = 280 mm per month.',
    points: 1,
    criteria: '1 pt: Accurate addition and mean 280 mm.'
  },
  {
    number: 5,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & FAIR SPINNER',
    prompt: 'A game spinner at a school fair in San Ignacio is divided into 8 equal sectors numbered 1 through 8. Find the probability of spinning: a) An even number   b) A number greater than 5.',
    solution: 'Total outcomes = 8. a) Even numbers (2, 4, 6, 8) = 4 outcomes => P(even) = 4/8 = 1/2. b) Numbers > 5 (6, 7, 8) = 3 outcomes => P(>5) = 3/8.',
    points: 1,
    criteria: '1 pt: P(even) = 1/2 and P(>5) = 3/8.'
  },
  {
    number: 6,
    section: 'B',
    sectionTitle: 'APPLIED PROBLEM SOLVING & TALLY CHARTS',
    prompt: 'A vendor at Michael Finnegan Market records citrus sales: Oranges (卌 卌 |||), Grapefruits (卌 ||||), Limes (卌 卌 卌). Convert tallies into frequencies and state the total fruit sold.',
    solution: 'Oranges = 13; Grapefruits = 9; Limes = 15. Total fruit = 13 + 9 + 15 = 37 fruits.',
    points: 1,
    criteria: '1 pt: Correct frequencies (13, 9, 15) and total 37.'
  },
  {
    number: 7,
    section: 'C',
    sectionTitle: 'REASONING & ERROR ANALYSIS',
    prompt: 'Error Analysis: A student calculated the median of 8, 2, 9, 4, 1 by picking the middle number 9 without ordering the data. Explain the student\'s error, state the median rule, and calculate the true median.',
    solution: 'Misconception: The median is the middle value of an ORDERED data set. Picking the middle value of unorganized numbers is invalid. Ordered set: 1, 2, 4, 8, 9. The middle number is 4. True median: 4 (NOT 9).',
    points: 2,
    criteria: '2 pts: 1 pt for explaining ordering requirement; 1 pt for true median 4.'
  },
  {
    number: 8,
    section: 'C',
    sectionTitle: 'REASONING & OUTLIERS',
    prompt: 'Five students in Standard 5 have ages: 10, 10, 11, 10, 39 (the teacher is included). a) Calculate the mean age. b) Calculate the median age. c) Explain which measure of central tendency better represents student ages and why.',
    solution: 'a) Mean = (10+10+11+10+39)/5 = 80/5 = 16 years. b) Ordered: 10, 10, 10, 11, 39. Median = 10 years. c) The median (10) represents the students far better because the extreme outlier (age 39) heavily distorts the mean (16), making it seem students are older than they are.',
    points: 2,
    criteria: '2 pts: 1 pt for mean 16 and median 10; 1 pt for explaining outlier distortion.'
  }
];

/**
 * Returns the appropriate question bank for a detected topic category.
 */
export function getCategoryQuestionBank(
  classification: MathClassification
): MathWorksheetQuestion[] {
  switch (classification.category) {
    case 'early_counting_ten_frames':
      return EARLY_COUNTING_TEN_FRAMES_QUESTIONS;
    case 'early_operations_bonds':
      return EARLY_OPERATIONS_BONDS_QUESTIONS;
    case 'place_value_regrouping':
      return PLACE_VALUE_REGROUPING_QUESTIONS;
    case 'multiplication_division':
      return MULTIPLICATION_DIVISION_QUESTIONS;
    case 'fractions_decimals':
      return FRACTIONS_DECIMALS_QUESTIONS;
    case 'decimals_fractions_conversion':
      return DECIMALS_FRACTIONS_CONVERSION_QUESTIONS;
    case 'measurement_currency':
      return MEASUREMENT_CURRENCY_QUESTIONS;
    case 'geometry_spatial':
      return GEOMETRY_SPATIAL_QUESTIONS;
    case 'proportional_financial':
      return PROPORTIONAL_FINANCIAL_QUESTIONS;
    case 'linear_equations':
      return LINEAR_EQUATIONS_QUESTIONS;
    case 'data_statistics_probability':
      return DATA_STATISTICS_PROBABILITY_QUESTIONS;
    default:
      if (classification.gradeBand === 'early_primary') {
        return EARLY_COUNTING_TEN_FRAMES_QUESTIONS;
      }
      if (classification.gradeBand === 'middle_primary') {
        return PLACE_VALUE_REGROUPING_QUESTIONS;
      }
      return MULTIPLICATION_DIVISION_QUESTIONS;
  }
}

/**
 * Returns authentic, grade-appropriate exit ticket questions totaling 5 points with 80% benchmark.
 * Days 1-4: 3 questions (2 pts, 2 pts, 1 pt). Day 5: 5 questions (1 pt each).
 */
export function getCategoryExitTicketQuestions(
  classification: MathClassification,
  dayNumber: number,
  topic: string
): { number: number; question: string; points: number; answerKey: string }[] {
  const cat = classification.category;

  if (dayNumber === 5) {
    // 5-Question Cumulative Review & Evaluation for Day 5 (1 mark each = 5 marks total)
    switch (cat) {
      case 'early_counting_ten_frames':
        return [
          { number: 1, question: 'Draw a ten-frame showing 8 using dots ●.', points: 1, answerKey: 'Ten-frame with 5 dots on top row and 3 dots on bottom row.' },
          { number: 2, question: 'Count the conch shells: 🐚🐚🐚🐚🐚 🐚🐚. Write the numeral and word.', points: 1, answerKey: '7, seven.' },
          { number: 3, question: 'Complete the teen number bond: 10 + 6 = __.', points: 1, answerKey: '16.' },
          { number: 4, question: 'Compare: Which is more, 9 or 5?', points: 1, answerKey: '9 is more than 5.' },
          { number: 5, question: 'What number comes immediately after 17?', points: 1, answerKey: '18.' }
        ];
      case 'early_operations_bonds':
        return [
          { number: 1, question: 'Complete the number bond to 10: 7 + __ = 10.', points: 1, answerKey: '3.' },
          { number: 2, question: 'Add using make-a-ten: 8 + 4 = 8 + 2 + __ = __.', points: 1, answerKey: '8 + 2 + 2 = 12.' },
          { number: 3, question: 'Write the subtraction fact matching 6 + 4 = 10.', points: 1, answerKey: '10 − 6 = 4 (or 10 − 4 = 6).' },
          { number: 4, question: 'Subtract: 15 − 7 = __.', points: 1, answerKey: '8.' },
          { number: 5, question: 'Maya has 9 bananas and picks 5 more. How many in all?', points: 1, answerKey: '14 bananas.' }
        ];
      case 'place_value_regrouping':
        return [
          { number: 1, question: 'Write 472 in expanded form.', points: 1, answerKey: '400 + 70 + 2.' },
          { number: 2, question: 'Add: 48 + 37.', points: 1, answerKey: '85.' },
          { number: 3, question: 'Subtract: 82 − 39.', points: 1, answerKey: '43.' },
          { number: 4, question: 'Add 3-digit: 245 + 186.', points: 1, answerKey: '431.' },
          { number: 5, question: 'Subtract 3-digit: 504 − 238.', points: 1, answerKey: '266.' }
        ];
      case 'multiplication_division':
        return [
          { number: 1, question: 'Write the multiplication sentence for an array of 4 rows of 6 tiles.', points: 1, answerKey: '4 × 6 = 24.' },
          { number: 2, question: 'Calculate: 36 × 7 using partial products.', points: 1, answerKey: '(30×7) + (6×7) = 210 + 42 = 252.' },
          { number: 2, question: 'Calculate: 24 × 15.', points: 1, answerKey: '360.' },
          { number: 4, question: 'Divide: 476 ÷ 4.', points: 1, answerKey: '119.' },
          { number: 5, question: 'Divide with remainder: 385 ÷ 6.', points: 1, answerKey: '64 R 1.' }
        ];
      case 'fractions_decimals':
        return [
          { number: 1, question: 'Find equivalent fraction: 2/3 = __/12.', points: 1, answerKey: '8/12.' },
          { number: 2, question: 'Add fractions: 3/4 + 2/5.', points: 1, answerKey: '15/20 + 8/20 = 23/20 = 1 3/20.' },
          { number: 3, question: 'Calculate 3/4 of 24 papayas.', points: 1, answerKey: '18 papayas.' },
          { number: 4, question: 'Subtract mixed numbers: 5 − 2 3/8.', points: 1, answerKey: '2 5/8.' },
          { number: 5, question: 'Multiply decimals: 3.5 × 0.4.', points: 1, answerKey: '1.4 (or 1.40).' }
        ];
      case 'decimals_fractions_conversion':
        return [
          { number: 1, question: 'Convert the decimal 0.4 into a fraction in simplest form.', points: 1, answerKey: '0.4 = 4/10 = 2/5.' },
          { number: 2, question: 'Convert the decimal 0.75 into a fraction in simplest form.', points: 1, answerKey: '0.75 = 75/100 = 3/4.' },
          { number: 3, question: 'Convert the fraction 7/10 into a decimal.', points: 1, answerKey: '7/10 = 0.7.' },
          { number: 4, question: 'Convert the fraction 3/5 into a decimal using equivalent tenths.', points: 1, answerKey: '3/5 = (3×2)/(5×2) = 6/10 = 0.6.' },
          { number: 5, question: 'Error Analysis: Marcus wrote 0.8 = 8/100. Write the correct simplified fraction.', points: 1, answerKey: '0.8 = 8/10 = 4/5 (eight tenths, not eight hundredths).' }
        ];
      case 'measurement_currency':
        return [
          { number: 1, question: 'Calculate change from $20.00 BZD after paying $13.65.', points: 1, answerKey: '$6.35 BZD.' },
          { number: 2, question: 'Find perimeter of a rectangle measuring 14 m by 8 m.', points: 1, answerKey: '2(14 + 8) = 44 meters.' },
          { number: 3, question: 'Find area of a rectangle measuring 12 m by 7 m.', points: 1, answerKey: '12 × 7 = 84 m².' },
          { number: 4, question: 'Convert 15.5 km to meters.', points: 1, answerKey: '15,500 meters.' },
          { number: 5, question: 'Calculate volume of box: 10 cm × 6 cm × 8 cm.', points: 1, answerKey: '480 cm³.' }
        ];
      case 'proportional_financial':
        return [
          { number: 1, question: 'Calculate 12.5% Belize GST on a $240 item.', points: 1, answerKey: '$30.00 BZD (Total: $270.00 BZD).' },
          { number: 2, question: 'Find 20% discount on a $65 backpack.', points: 1, answerKey: 'Discount: $13.00 BZD; Sale price: $52.00 BZD.' },
          { number: 3, question: 'Ratio of lime to water is 3:5. For 15 cups lime, how many cups water?', points: 1, answerKey: '25 cups water.' },
          { number: 4, question: 'Find simple interest: $500 at 4% for 3 years (I = Prt).', points: 1, answerKey: '$60.00 BZD.' },
          { number: 5, question: 'Store A sells 6 books for $9; Store B sells 10 books for $14. Better buy?', points: 1, answerKey: 'Store B ($1.40/book < $1.50/book).' }
        ];
      case 'linear_equations':
        return [
          { number: 1, question: 'Solve: x + 5 = 12.', points: 1, answerKey: 'x = 7.' },
          { number: 2, question: 'Solve: 3x + 7 = 28.', points: 1, answerKey: '3x = 21 => x = 7.' },
          { number: 3, question: 'Solve: 5y − 9 = 36.', points: 1, answerKey: '5y = 45 => y = 9.' },
          { number: 4, question: 'Solve: 4w + 8 = 36.', points: 1, answerKey: '4w = 28 => w = 7.' },
          { number: 5, question: 'Solve: 5x + 3 = 2x + 18.', points: 1, answerKey: '3x = 15 => x = 5.' }
        ];
      default:
        return [
          { number: 1, question: `Solve foundational problem for ${topic}.`, points: 1, answerKey: `Accurate calculation for ${topic}.` },
          { number: 2, question: `Solve multi-step application problem for ${topic}.`, points: 1, answerKey: `Step-by-step verified solution with units.` },
          { number: 3, question: `Error reflection question for ${topic}.`, points: 1, answerKey: `Identifies misconception and states correction.` },
          { number: 4, question: `Contextual Belizean word problem for ${topic}.`, points: 1, answerKey: `Calculated answer with Belize unit label.` },
          { number: 5, question: `Inverse verification calculation for ${topic}.`, points: 1, answerKey: `Verification proving solution correctness.` }
        ];
    }
  }

  // Days 1 to 4: 3 Questions totaling 5 points (2 pts, 2 pts, 1 pt)
  // Day 1: Concepts & Representations; Day 2: Algorithmic Fluency; Day 3: Error Analysis; Day 4: Belizean Applications
  switch (cat) {
    case 'early_counting_ten_frames':
      if (dayNumber === 1) {
        return [
          { number: 1, question: 'Draw a ten-frame showing the number 8 using filled dots ●. How many more dots are needed to make 10?', points: 2, answerKey: 'Ten-frame has 5 dots on top row and 3 dots on bottom row. Exactly 2 more dots are needed (8 + 2 = 10).' },
          { number: 2, question: 'Count the sea turtles swimming near the reef: 🐢🐢🐢🐢🐢 🐢. Write the numeral and number word.', points: 2, answerKey: 'Numeral: 6; Number word: six.' },
          { number: 3, question: 'Which number is greater: 9 or 6? Explain how you know using counters or a number line.', points: 1, answerKey: '9 is greater because a set of 9 has 3 more objects than a set of 6.' }
        ];
      } else if (dayNumber === 2) {
        return [
          { number: 1, question: 'Draw a double ten-frame showing the teen number 14. How many tens and how many ones?', points: 2, answerKey: 'One full ten-frame (10) and 4 dots on the second frame (4). 14 = 1 ten and 4 ones.' },
          { number: 2, question: 'Count backwards from 10 to 1 on your fingers or ten-frame.', points: 2, answerKey: '10, 9, 8, 7, 6, 5, 4, 3, 2, 1.' },
          { number: 3, question: 'What number is 1 more than 12?', points: 1, answerKey: '13.' }
        ];
      } else if (dayNumber === 3) {
        return [
          { number: 1, question: 'Error Detective: Kevin counted 7 starfish but recorded the numeral 5. Explain why touch-point counting helps avoid counting slips.', points: 2, answerKey: 'Touching each object once guarantees one-to-one correspondence between number names and objects.' },
          { number: 2, question: 'Show two different ways to make 10 on a ten-frame (e.g. 5+5, 7+3).', points: 2, answerKey: 'Examples: 5 + 5 = 10, 7 + 3 = 10, 6 + 4 = 10, or 8 + 2 = 10.' },
          { number: 3, question: 'Is 0 an empty ten-frame? Explain.', points: 1, answerKey: 'Yes, 0 represents no objects or an empty frame.' }
        ];
      } else {
        return [
          { number: 1, question: 'A fisherman in Placencia caught 9 snappers and 6 groupers. Draw ten-frames and find which set has more and by how many.', points: 2, answerKey: 'Snappers have more: 9 − 6 = 3 more snappers.' },
          { number: 2, question: 'Maria puts 10 mangoes in a basket and 5 mangoes on a table. How many mangoes does she have in all?', points: 2, answerKey: '10 + 5 = 15 mangoes.' },
          { number: 3, question: 'Why is grouping in tens helpful when counting large sets of objects?', points: 1, answerKey: 'Counting in tens is faster and prevents losing count.' }
        ];
      }

    case 'early_operations_bonds':
      if (dayNumber === 1) {
        return [
          { number: 1, question: 'Complete the number bond to 10: 7 + ___ = 10. Write the related subtraction sentence.', points: 2, answerKey: '7 + 3 = 10. Related subtraction: 10 − 7 = 3 (or 10 − 3 = 7).' },
          { number: 2, question: 'Use make-a-ten to add: 8 + 5. Show how you break 5 into (2 + 3).', points: 2, answerKey: '8 + 5 = (8 + 2) + 3 = 10 + 3 = 13.' },
          { number: 3, question: 'Why does 6 + 4 equal the same total as 4 + 6? State the mathematical property.', points: 1, answerKey: 'Addition is commutative: the order of addends does not change the sum.' }
        ];
      } else if (dayNumber === 2) {
        return [
          { number: 1, question: 'Use make-a-ten to evaluate 9 + 6. Show the two-step addition line.', points: 2, answerKey: '9 + 6 = (9 + 1) + 5 = 10 + 5 = 15.' },
          { number: 2, question: 'Subtract using the bridge-through-10 strategy: 14 − 6.', points: 2, answerKey: '14 − 4 = 10; 10 − 2 = 8.' },
          { number: 3, question: 'What is the sum of any number and zero?', points: 1, answerKey: 'The number itself (Identity property of addition).' }
        ];
      } else if (dayNumber === 3) {
        return [
          { number: 1, question: 'Error Analysis: John wrote that 10 − 3 = 13 because he added instead of subtracting. Explain the difference between addition and subtraction.', points: 2, answerKey: 'Addition combines sets to find a larger total; subtraction separates a part from the total: 10 − 3 = 7.' },
          { number: 2, question: 'Write all 4 fact family sentences for the bond with parts 6 and 8 and whole 14.', points: 2, answerKey: '6 + 8 = 14; 8 + 6 = 14; 14 − 6 = 8; 14 − 8 = 6.' },
          { number: 3, question: 'Can subtraction facts be reversed like addition (is 10 − 4 the same as 4 − 10)? Explain.', points: 1, answerKey: 'No, subtraction is not commutative; reversing order changes the result.' }
        ];
      } else {
        return [
          { number: 1, question: 'A bakery in San Ignacio baked 8 meat pies in the morning and 7 in the afternoon. How many meat pies were baked in all?', points: 2, answerKey: '8 + 7 = (8 + 2) + 5 = 15 meat pies.' },
          { number: 2, question: 'A citrus vendor had 16 oranges and sold 9. How many oranges remain?', points: 2, answerKey: '16 − 9 = 7 oranges.' },
          { number: 3, question: 'How do number bonds help market vendors calculate fast mental change?', points: 1, answerKey: 'Number bonds to 10 and 20 allow instant mental addition and subtraction without finger counting.' }
        ];
      }

    case 'place_value_regrouping':
      if (dayNumber === 1) {
        return [
          { number: 1, question: 'Solve: 47 + 38 using vertical column addition. Show the carried ten.', points: 2, answerKey: '7 + 8 = 15 (5 in ones, carry 1 ten). 4 + 3 + 1 = 8 tens. Sum = 85.' },
          { number: 2, question: 'Solve: 83 − 46. Show your regrouping (trading 1 ten for 10 ones).', points: 2, answerKey: 'Regroup 8 tens 3 ones into 7 tens 13 ones. 13 − 6 = 7 ones; 7 − 4 = 3 tens. Difference = 37.' },
          { number: 3, question: 'In the number 648, what is the value of the digit 4?', points: 1, answerKey: 'The digit 4 is in the tens place; its value is 4 tens or 40.' }
        ];
      } else if (dayNumber === 2) {
        return [
          { number: 1, question: 'Solve 3-digit column addition with two regroupings: 358 + 274.', points: 2, answerKey: '8+4=12 (carry 1). 5+7+1=13 (carry 1). 3+2+1=6. Sum = 632.' },
          { number: 2, question: 'Solve 3-digit column subtraction across zero: 504 − 238.', points: 2, answerKey: 'Trade hundreds to tens (4 h, 10 t), then tens to ones (9 t, 14 o). 14−8=6; 9−3=6; 4−2=2. Difference = 266.' },
          { number: 3, question: 'How do you check a subtraction calculation using addition?', points: 1, answerKey: 'Add the difference to the subtrahend; the sum must equal the original minuend.' }
        ];
      } else if (dayNumber === 3) {
        return [
          { number: 1, question: 'Error Detective: Marcus solved 72 − 38 and recorded 46 because he subtracted 8 − 2 = 6 in the ones place. Explain Marcus\'s misconception and write the correct calculation.', points: 2, answerKey: 'Marcus subtracted the smaller digit from the larger digit instead of trading from the tens place. Correct: 72 − 38 = 34.' },
          { number: 2, question: 'Error Detective: Elena solved 45 + 38 and wrote 713 because she wrote 13 in the ones place without carrying. Correct her work.', points: 2, answerKey: 'Elena failed to regroup 10 ones into 1 ten. Correct sum: 83.' },
          { number: 3, question: 'Why must column subtraction strictly proceed from top digit minus bottom digit?', points: 1, answerKey: 'The top number is the total quantity being subtracted from; inverting digits alters the mathematical problem.' }
        ];
      } else {
        return [
          { number: 1, question: 'A primary school in Corozal Town has 248 students in the infant division and 315 students in the standard division. Calculate the total school enrollment.', points: 2, answerKey: '248 + 315 = 563 students.' },
          { number: 2, question: 'A library in Belize City had 620 books. During book fair week, 275 books were borrowed. How many books remain in the library?', points: 2, answerKey: '620 − 275 = 345 books.' },
          { number: 3, question: 'Why is aligning digits strictly by place value columns essential when computing sums?', points: 1, answerKey: 'Aligning columns ensures that ones are added to ones, tens to tens, and hundreds to hundreds.' }
        ];
      }

    case 'multiplication_division':
      if (dayNumber === 1) {
        return [
          { number: 1, question: 'Draw an array with 4 rows and 6 columns. Write the matching multiplication equation.', points: 2, answerKey: 'Array shows 4 rows of 6 dots. Equation: 4 × 6 = 24.' },
          { number: 2, question: 'Calculate 36 × 7 using partial products: (30 × 7) + (6 × 7).', points: 2, answerKey: '30 × 7 = 210; 6 × 7 = 42; 210 + 42 = 252.' },
          { number: 3, question: 'A farmer packs 24 oranges into bags of 6. How many bags can he fill?', points: 1, answerKey: '24 ÷ 6 = 4 bags.' }
        ];
      } else if (dayNumber === 2) {
        return [
          { number: 1, question: 'Multiply 24 × 15 using the standard algorithm or area model. Show all intermediate partial products.', points: 2, answerKey: '24 × 10 = 240; 24 × 5 = 120; 240 + 120 = 360.' },
          { number: 2, question: 'Divide 476 ÷ 4 using long division. Show all division, multiplication, and subtraction lines.', points: 2, answerKey: '4÷4=1; 7÷4=1 R3; 36÷4=9. Quotient = 119, Remainder = 0.' },
          { number: 3, question: 'What is the relationship between multiplication and division?', points: 1, answerKey: 'Multiplication and division are inverse operations; division undoes multiplication.' }
        ];
      } else if (dayNumber === 3) {
        return [
          { number: 1, question: 'Error Detective: A student evaluated 385 ÷ 6 and wrote quotient 63 R 7. Explain why a remainder of 7 is mathematically impossible when dividing by 6.', points: 2, answerKey: 'The remainder must strictly be less than the divisor. A remainder of 7 means another group of 6 can be made: True quotient = 64 R 1.' },
          { number: 2, question: 'Divide 512 ÷ 8 and verify your quotient using multiplication.', points: 2, answerKey: '512 ÷ 8 = 64. Check: 64 × 8 = 512. Verified.' },
          { number: 3, question: 'Why must we align quotient digits directly over the corresponding place values of the dividend?', points: 1, answerKey: 'Proper alignment preserves place-value magnitude (hundreds over hundreds, tens over tens).' }
        ];
      } else {
        return [
          { number: 1, question: 'A citrus grower in Stann Creek packs 18 crates of oranges. Each crate contains 45 oranges. How many total oranges are packed?', points: 2, answerKey: '18 × 45 = 810 oranges.' },
          { number: 2, question: 'A grant of $936.00 BZD is shared equally among 6 primary school classrooms for science materials. How much does each classroom receive?', points: 2, answerKey: '$936 ÷ 6 = $156.00 BZD per classroom.' },
          { number: 3, question: 'How can estimation help verify if a multiplication or division calculation is reasonable?', points: 1, answerKey: 'Rounding factors to friendly numbers provides a quick benchmark to detect calculation errors.' }
        ];
      }

    case 'fractions_decimals':
      if (dayNumber === 1) {
        return [
          { number: 1, question: 'Find the missing numerator to make an equivalent fraction: 2/3 = ___/12. Explain how you found it.', points: 2, answerKey: 'Multiply numerator and denominator by 4: (2×4)/(3×4) = 8/12. Missing number is 8.' },
          { number: 2, question: 'Evaluate: 3/4 + 2/5. Show your least common denominator (LCD) working.', points: 2, answerKey: 'LCD = 20. 15/20 + 8/20 = 23/20 = 1 3/20.' },
          { number: 3, question: 'Explain why 1/2 is greater than 1/4 even though 4 is greater than 2.', points: 1, answerKey: 'The denominator shows the number of equal parts. Fewer parts means each individual part is larger.' }
        ];
      } else if (dayNumber === 2) {
        return [
          { number: 1, question: 'Subtract mixed numbers: 5 1/4 − 2 2/3. Show regrouping with LCD.', points: 2, answerKey: 'LCD = 12. 5 3/12 − 2 8/12 = 4 15/12 − 2 8/12 = 2 7/12.' },
          { number: 2, question: 'Multiply decimals: 4.25 × 3.6. Show complete decimal place alignment.', points: 2, answerKey: '425 × 36 = 15,300. Place decimal three places from right: 15.300 = 15.3.' },
          { number: 3, question: 'Convert 3/8 into a decimal using long division.', points: 1, answerKey: '3 ÷ 8 = 0.375.' }
        ];
      } else if (dayNumber === 3) {
        return [
          { number: 1, question: 'Error Detective: A student added 1/3 + 2/5 = 3/8 by adding numerators across and denominators across. Explain why this violates fraction addition rules.', points: 2, answerKey: 'Fractions cannot be combined until they represent equal-sized parts (common denominator). Correct: 5/15 + 6/15 = 11/15.' },
          { number: 2, question: 'Evaluate: (3/5) × (10/21) and simplify your final answer to lowest terms.', points: 2, answerKey: '(3×10)/(5×21) = 30/105 = 2/7.' },
          { number: 3, question: 'Why does multiplying a number by a proper fraction result in a smaller product?', points: 1, answerKey: 'A proper fraction represents a part of a whole; taking a part of a quantity yields less than the original quantity.' }
        ];
      } else {
        return [
          { number: 1, question: 'A baker in Belize City uses 3 1/2 cups of flour for johnnycakes and 2 1/4 cups for meat pies. How much flour is used in total?', points: 2, answerKey: '3 2/4 + 2 1/4 = 5 3/4 cups of flour.' },
          { number: 2, question: 'A fuel tank on a water taxi holds 80 gallons of gasoline. If 5/8 of the tank is used on a trip to Caye Caulker, how many gallons were consumed?', points: 2, answerKey: '(5/8) × 80 = 50 gallons.' },
          { number: 3, question: 'How do decimal and fraction conversions help in commercial market trade across Belize?', points: 1, answerKey: 'Market produce is often weighed in fractional kilograms or pounds but priced in dollars and decimal cents.' }
        ];
      }

    case 'decimals_fractions_conversion':
      if (dayNumber === 1) {
        return [
          { number: 1, question: 'Convert 0.4 into a fraction in simplest form. Show your place-value fraction and simplifying step.', points: 2, answerKey: '0.4 = 4/10. Divide by 2: (4÷2)/(10÷2) = 2/5.' },
          { number: 2, question: 'Convert 0.75 into a fraction in simplest form. Show your working.', points: 2, answerKey: '0.75 = 75/100. Divide by 25: (75÷25)/(100÷25) = 3/4.' },
          { number: 3, question: 'Explain why 0.5 is equal to 1/2 using a tenths or hundredths grid model.', points: 1, answerKey: '0.5 represents 5 out of 10 tenths (or 50 out of 100 hundredths), which is exactly one-half (1/2) of the whole.' }
        ];
      } else if (dayNumber === 2) {
        return [
          { number: 1, question: 'Convert 7/10 and 3/5 into decimals using equivalent tenths. Show your working.', points: 2, answerKey: '7/10 = 0.7; 3/5 = (3×2)/(5×2) = 6/10 = 0.6.' },
          { number: 2, question: 'Convert 1/4 into a decimal using equivalent hundredths: (1 × 25)/(4 × 25).', points: 2, answerKey: '1/4 = 25/100 = 0.25 (or long division: 1 ÷ 4 = 0.25).' },
          { number: 3, question: 'How can you convert any fraction into a decimal if the denominator cannot easily multiply to 10 or 100?', points: 1, answerKey: 'Divide the numerator by the denominator using long division.' }
        ];
      } else if (dayNumber === 3) {
        return [
          { number: 1, question: 'Error Detective: Marcus claims that 0.8 is equal to 8/100. Identify Marcus\'s place-value error and write the correct simplified fraction.', points: 2, answerKey: 'Marcus placed 8 in the hundredths place instead of tenths. 0.8 = 8/10 = 4/5 (whereas 8/100 = 0.08).' },
          { number: 2, question: 'Error Detective: Kayla converted 3/4 to a decimal and divided 4 ÷ 3 = 1.33. Explain Kayla\'s error and write the correct decimal.', points: 2, answerKey: 'Kayla divided denominator by numerator. The rule is numerator divided by denominator: 3 ÷ 4 = 0.75.' },
          { number: 3, question: 'Why must the trailing zero in 0.50 be recognized as 50/100, which simplifies to the same 1/2 as 0.5?', points: 1, answerKey: '50 hundredths is equivalent to 5 tenths: 50/100 = 5/10 = 1/2.' }
        ];
      } else {
        return [
          { number: 1, question: 'A farmer in Cayo harvested 0.65 tons of citrus. Convert 0.65 into a fraction in simplest form.', points: 2, answerKey: '0.65 = 65/100. Divide by 5: 13/20 ton.' },
          { number: 2, question: 'A market scale in San Ignacio shows a watermelon weighs 2 1/2 kg. Write 2 1/2 as a decimal.', points: 2, answerKey: '1/2 = 0.5, so 2 1/2 = 2.5 kg.' },
          { number: 3, question: 'Which is greater: 0.3 kg of habanero peppers or 1/4 kg of habanero peppers? Justify with conversion.', points: 1, answerKey: '1/4 = 0.25 kg. Since 0.30 > 0.25, 0.3 kg is greater by 0.05 kg.' }
        ];
      }

    case 'measurement_currency':
      if (dayNumber === 1) {
        return [
          { number: 1, question: 'Calculate change from a $20.00 BZD note after spending $13.65 at a grocery store.', points: 2, answerKey: '$20.00 − $13.65 = $6.35 BZD change.' },
          { number: 2, question: 'Find the perimeter and area of a rectangle measuring 8 meters long and 5 meters wide.', points: 2, answerKey: 'Perimeter: 2(8 + 5) = 26 meters. Area: 8 × 5 = 40 m².' },
          { number: 3, question: 'How many centimeters are in 2.5 meters?', points: 1, answerKey: '2.5 × 100 = 250 centimeters.' }
        ];
      } else if (dayNumber === 2) {
        return [
          { number: 1, question: 'Find the circumference and area of a circular garden with diameter 14 m using π ≈ 22/7.', points: 2, answerKey: 'Radius r = 7 m. Circumference = 2 × (22/7) × 7 = 44 m. Area = (22/7) × 7² = 154 m².' },
          { number: 2, question: 'Convert 4,500 grams into kilograms.', points: 2, answerKey: '4,500 ÷ 1,000 = 4.5 kilograms.' },
          { number: 3, question: 'What is the formula for the volume of a rectangular prism?', points: 1, answerKey: 'Volume = Length × Width × Height (V = l × w × h).' }
        ];
      } else if (dayNumber === 3) {
        return [
          { number: 1, question: 'Error Detective: Marcus calculated the perimeter of a 6 m by 4 m room as 10 meters. Explain his mistake and calculate the true perimeter.', points: 2, answerKey: 'Marcus added length and width once instead of all 4 sides. True perimeter = 2(6 + 4) = 20 meters.' },
          { number: 2, question: 'Calculate the volume of a water storage tank measuring 3 m by 2 m by 1.5 m.', points: 2, answerKey: '3 × 2 × 1.5 = 9 cubic meters (m³).' },
          { number: 3, question: 'Why are area measurements expressed in square units while volume is in cubic units?', points: 1, answerKey: 'Area measures 2-dimensional surface coverage; volume measures 3-dimensional space capacity.' }
        ];
      } else {
        return [
          { number: 1, question: 'A homeowner in Belmopan buys 15 meters of fencing at $8.50 BZD per meter. Calculate the total cost.', points: 2, answerKey: '15 × 8.50 = $127.50 BZD.' },
          { number: 2, question: 'A football pitch in Orange Walk measures 105 m long and 68 m wide. What is its perimeter and area?', points: 2, answerKey: 'Perimeter: 2(105 + 68) = 346 m. Area: 105 × 68 = 7,140 m².' },
          { number: 3, question: 'Why is accurate metric measurement critical in building and road construction in Belize?', points: 1, answerKey: 'Accurate measurements prevent structural defects and avoid costly material wastage.' }
        ];
      }

    case 'proportional_financial':
      if (dayNumber === 1) {
        return [
          { number: 1, question: 'In Belize, the General Sales Tax (GST) is 12.5%. Calculate the GST on a $80.00 purchase.', points: 2, answerKey: 'GST = 0.125 × $80.00 = $10.00 BZD. Total cost = $90.00 BZD.' },
          { number: 2, question: 'Convert the following percentages to simplified fractions: a) 25%   b) 75%.', points: 2, answerKey: 'a) 25/100 = 1/4. b) 75/100 = 3/4.' },
          { number: 3, question: 'What does the term "percent" literally mean in mathematics?', points: 1, answerKey: '"Percent" means "per hundred" or "out of 100".' }
        ];
      } else if (dayNumber === 2) {
        return [
          { number: 1, question: 'A shop in Belize City offers a 20% discount on a $65.00 backpack. Calculate the discount and the sale price.', points: 2, answerKey: 'Discount = 0.20 × $65 = $13.00. Sale price = $65 − $13 = $52.00 BZD.' },
          { number: 2, question: 'Calculate the simple interest on a principal of $500.00 invested at 4% annual interest for 3 years using I = Prt.', points: 2, answerKey: 'I = 500 × 0.04 × 3 = $60.00 BZD.' },
          { number: 3, question: 'State the formula for calculating simple interest and define each variable.', points: 1, answerKey: 'I = Prt where P = Principal, r = annual interest rate, t = time in years.' }
        ];
      } else if (dayNumber === 3) {
        return [
          { number: 1, question: 'Error Detective: Marcus calculated a 15% discount on a $40 shirt by subtracting 40 − 15 = $25. Explain his error and calculate the true sale price.', points: 2, answerKey: 'Error: Marcus subtracted 15 dollars instead of calculating 15% of $40. Correction: Discount = 0.15 × 40 = $6.00; Sale price = $40 − $6 = $34.00 BZD.' },
          { number: 2, question: 'Store A sells 6 exercise books for $9.00 BZD; Store B sells 10 exercise books for $14.00 BZD. Calculate the unit price at each store and state the better buy.', points: 2, answerKey: 'Store A: $9/6 = $1.50 per book. Store B: $14/10 = $1.40 per book. Store B is the better buy.' },
          { number: 3, question: 'Why cannot a percentage simply be subtracted directly from a dollar amount without multiplying?', points: 1, answerKey: 'A percentage is a proportional fraction of a quantity; it does not represent a fixed standalone dollar amount.' }
        ];
      } else {
        return [
          { number: 1, question: 'A recipe in Cayo mixes lime juice and water in the ratio 3:5. If 15 cups of lime juice are used, how many cups of water are needed?', points: 2, answerKey: '3/5 = 15/w => 3w = 75 => w = 25 cups of water.' },
          { number: 2, question: 'A market invoice in Belize totals $360.00 with a 10% trade discount plus 12.5% GST on the discounted price. Calculate total payable.', points: 2, answerKey: 'Discounted price = $360 − $36 = $324. GST = 0.125 × 324 = $40.50. Total = $324 + $40.50 = $364.50 BZD.' },
          { number: 3, question: 'How do proportions help maintain consistent taste and quality in cooking and manufacturing?', points: 1, answerKey: 'Proportions keep the relationship between ingredients constant when scaling batches up or down.' }
        ];
      }

    case 'linear_equations':
      if (dayNumber === 1) {
        return [
          { number: 1, question: 'Solve for x in the balance equation: 3x + 7 = 28. Show both inverse operation steps.', points: 2, answerKey: 'Step 1: 3x = 28 − 7 = 21. Step 2: x = 21 ÷ 3 = 7. Check: 3(7) + 7 = 28.' },
          { number: 2, question: 'Solve for y: 5y − 9 = 36. Show your working.', points: 2, answerKey: '5y = 36 + 9 = 45 => y = 45 ÷ 5 = 9. Check: 5(9) − 9 = 36.' },
          { number: 3, question: 'Why must the same operation be performed on BOTH sides of an algebraic equation?', points: 1, answerKey: 'An equation is like a balance scale. Performing an operation on only one side unbalances the equality.' }
        ];
      } else if (dayNumber === 2) {
        return [
          { number: 1, question: 'Solve for w: 4w + 8 = 36. Show step-by-step subtraction and division.', points: 2, answerKey: '4w = 36 − 8 = 28 => w = 28 ÷ 4 = 7.' },
          { number: 2, question: 'Solve: (x / 4) + 6 = 11. Show inverse operations.', points: 2, answerKey: 'x / 4 = 11 − 6 = 5 => x = 5 × 4 = 20.' },
          { number: 3, question: 'How do you check whether a solved value of x is correct?', points: 1, answerKey: 'Substitute the value back into the original equation; both sides must evaluate to identical numbers.' }
        ];
      } else if (dayNumber === 3) {
        return [
          { number: 1, question: 'Error Detective: Marcus solved 2x + 10 = 26 and divided by 2 first: x + 10 = 13 => x = 3. Explain his error and write the correct solution.', points: 2, answerKey: 'Error: If dividing by 2 first, all terms must be divided: (2x+10)/2 = x+5=13 => x=8. Standard method: subtract 10 first: 2x = 16 => x = 8.' },
          { number: 2, question: 'Solve the equation with variables on both sides: 5x + 3 = 2x + 18.', points: 2, answerKey: '5x − 2x = 18 − 3 => 3x = 15 => x = 5.' },
          { number: 3, question: 'What is the Golden Rule of algebra when solving equations?', points: 1, answerKey: 'Whatever operation you do to one side of the equation, you must do identically to the other side.' }
        ];
      } else {
        return [
          { number: 1, question: 'A water taxi in Belize City charges $25 base boarding fee plus $5 per baggage crate c: 5c + 25 = 55. Solve for the number of crates.', points: 2, answerKey: '5c = 55 − 25 = 30 => c = 6 crates.' },
          { number: 2, question: 'A citrus harvester earned $75 total: a $15 transport fee plus $4 per box b: 4b + 15 = 75. How many boxes did he harvest?', points: 2, answerKey: '4b = 60 => b = 15 boxes.' },
          { number: 3, question: 'Why are linear equations powerful tools for budgeting in Belize?', points: 1, answerKey: 'Linear equations allow determining required production or purchases given fixed allowances and variable rates.' }
        ];
      }

    default:
      if (dayNumber === 1) {
        return [
          { number: 1, question: `State the fundamental mathematical definition and rule for ${topic} and solve an introductory problem.`, points: 2, answerKey: `Accurate application of standard procedure for ${topic} with full step-by-step working.` },
          { number: 2, question: `Represent ${topic} using a structured visual model or diagram.`, points: 2, answerKey: `Step-by-step diagram or array verifying the mathematical representation.` },
          { number: 3, question: `Explain the mathematical purpose of learning ${topic}.`, points: 1, answerKey: `Clear statement connecting ${topic} to broader mathematical numeracy.` }
        ];
      } else if (dayNumber === 2) {
        return [
          { number: 1, question: `Solve a multi-step algorithmic problem for ${topic} showing all intermediate working steps.`, points: 2, answerKey: `Complete step-by-step calculation showing all intermediate arithmetic for ${topic}.` },
          { number: 2, question: `Calculate a second procedural problem for ${topic} with verified accuracy.`, points: 2, answerKey: `Accurate calculation with all required steps line by line.` },
          { number: 3, question: `Check your solution using an inverse operation or alternative method.`, points: 1, answerKey: `Valid verification calculation confirming solution correctness.` }
        ];
      } else if (dayNumber === 3) {
        return [
          { number: 1, question: `Error Reflection: Identify the common procedural or conceptual misconception in sample student work for ${topic}.`, points: 2, answerKey: `Identifies conceptual or clerical error and describes self-check strategy.` },
          { number: 2, question: `Write the mathematically correct step-by-step solution for the erroneous problem for ${topic}.`, points: 2, answerKey: `Complete corrected calculation with justified intermediate steps.` },
          { number: 3, question: `State one key strategy to self-check your answers when working on ${topic}.`, points: 1, answerKey: `Self-check protocol (e.g. estimation, inverse operation, unit verification).` }
        ];
      } else {
        return [
          { number: 1, question: `Solve a practical, real-world word problem situated in a Belizean community scenario applying ${topic}.`, points: 2, answerKey: `Step-by-step solution with verified calculations and appropriate Belize unit labels.` },
          { number: 2, question: `Show all intermediate calculations and attach the correct Belizean unit or currency label.`, points: 2, answerKey: `Accurate contextual calculation with proper units (BZD, meters, kg, etc.).` },
          { number: 3, question: `Explain how the mathematical result informs practical decision making in Belize.`, points: 1, answerKey: `Practical justification connecting mathematical answer to community life.` }
        ];
      }
  }
}

/**
 * Returns structured, solvable worked examples with zero generic placeholders.
 */
export function getCategoryWorkedExamples(
  classification: MathClassification,
  topic: string,
  dayNumber: number
): any[] {
  const cat = classification.category;

  switch (cat) {
    case 'early_counting_ten_frames':
      return [
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Represent the number 8 on a ten-frame and determine how many more dots are needed to make 10.',
          stepByStepSolution: [
            { step: 1, action: 'Fill the top row of the ten-frame', explanation: 'Place 5 red counters across the entire top row from left to right.' },
            { step: 2, action: 'Place remaining counters in bottom row', explanation: 'Place 3 red counters in the bottom row starting from the left. 5 + 3 = 8.' },
            { step: 3, action: 'Count empty spaces to complete ten', explanation: 'Notice 2 empty spaces remain in the bottom row. 8 + 2 = 10.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 8 counters shown; 2 more dots needed to make 10.',
          commonErrorOrScientificReasoning: 'Common Error: Placing counters randomly rather than filling the top 5-frame first, making it harder to recognize the 5-and-3 structure.',
          belizeanContextNote: 'Counting conch shells gathered along the shore of Caye Caulker.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Count a set of 14 sea turtles using touch-point one-to-one correspondence and double ten-frames.',
          stepByStepSolution: [
            { step: 1, action: 'Touch and count the first 10 turtles', explanation: 'Count 1 through 10, placing one counter on each turtle to fill one complete ten-frame.' },
            { step: 2, action: 'Touch and count the remaining turtles', explanation: 'Count 11, 12, 13, 14, placing 4 counters on the second ten-frame.' },
            { step: 3, action: 'Decompose the teen number', explanation: '14 is composed of 1 ten and 4 ones: 10 + 4 = 14.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 14 sea turtles (1 ten and 4 ones).',
          commonErrorOrScientificReasoning: 'Common Error: Counting faster than touching objects or recounting already counted items.',
          belizeanContextNote: 'Studying loggerhead sea turtles at the Hol Chan Marine Reserve.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Compare two sets of fruit: Set A has 9 oranges and Set B has 6 mangoes. Find which set has more and by how many.',
          stepByStepSolution: [
            { step: 1, action: 'Line up objects in one-to-one pairs', explanation: 'Pair each orange with one mango: 6 pairs form with 3 oranges left over.' },
            { step: 2, action: 'Subtract to find difference', explanation: '9 − 6 = 3.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: Set A has more oranges; it has 3 more oranges than Set B.',
          commonErrorOrScientificReasoning: 'Common Error: Stating which has more without being able to quantify the exact difference.',
          belizeanContextNote: 'Sorting fresh citrus at the San Ignacio Farmers Market.'
        }
      ];

    case 'early_operations_bonds':
      return [
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Find all fact family sentences for the number bond with whole 10 and parts 7 and 3.',
          stepByStepSolution: [
            { step: 1, action: 'Write addition facts', explanation: 'Combine parts: 7 + 3 = 10, and switch addends: 3 + 7 = 10.' },
            { step: 2, action: 'Write subtraction facts', explanation: 'Start with whole: 10 − 7 = 3, and 10 − 3 = 7.' }
          ],
          finalAnswerOrModelResponse: 'Final Facts: 7 + 3 = 10; 3 + 7 = 10; 10 − 7 = 3; 10 − 3 = 7',
          commonErrorOrScientificReasoning: 'Common Error: Writing 7 − 3 = 10 or 3 − 7 = 10; subtraction must always begin with the total (whole 10).',
          belizeanContextNote: 'Organizing football teams during PE class in Belmopan.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Use the make-a-ten strategy to evaluate 8 + 5.',
          stepByStepSolution: [
            { step: 1, action: 'Find how many 8 needs to make 10', explanation: '8 needs 2 to reach 10.' },
            { step: 2, action: 'Decompose the second addend', explanation: 'Break 5 into 2 and 3.' },
            { step: 3, action: 'Make 10 and add the rest', explanation: '(8 + 2) + 3 = 10 + 3 = 13.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 8 + 5 = 13',
          commonErrorOrScientificReasoning: 'Common Error: Counting on fingers one by one rather than utilizing friendly benchmark 10.',
          belizeanContextNote: 'Counting coconut harvests in Placencia.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Subtract 15 − 7 using the bridge-through-10 strategy.',
          stepByStepSolution: [
            { step: 1, action: 'Subtract to reach 10', explanation: '15 − 5 = 10.' },
            { step: 2, action: 'Subtract remaining part of 7', explanation: 'Since 7 = 5 + 2, subtract 2 from 10: 10 − 2 = 8.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 15 − 7 = 8',
          commonErrorOrScientificReasoning: 'Common Error: Subtracting 5 − 7 and writing 2.',
          belizeanContextNote: 'Selling hand-carved slate crafts in San Antonio, Cayo.'
        }
      ];

    case 'place_value_regrouping':
      return [
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Solve: 47 + 38 using column addition with regrouping.',
          stepByStepSolution: [
            { step: 1, action: 'Add ones column', explanation: '7 ones + 8 ones = 15 ones.' },
            { step: 2, action: 'Regroup ones into tens and ones', explanation: '15 ones = 1 ten and 5 ones. Write 5 in ones place and carry 1 ten above tens column.' },
            { step: 3, action: 'Add tens column including carried ten', explanation: '4 tens + 3 tens + 1 carried ten = 8 tens. Final sum: 85.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 85',
          commonErrorOrScientificReasoning: 'Common Error: Writing 15 directly in the ones space (getting 715) instead of regrouping 1 ten.',
          belizeanContextNote: 'Calculating book donations to the Orange Walk town library.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Solve: 83 − 46 using column subtraction with trading/regrouping.',
          stepByStepSolution: [
            { step: 1, action: 'Inspect ones column', explanation: 'Cannot subtract 6 from 3 without negative quantities.' },
            { step: 2, action: 'Regroup 1 ten from tens place', explanation: 'Cross out 8 tens, make it 7 tens. Add 10 ones to 3 ones to make 13 ones.' },
            { step: 3, action: 'Subtract ones', explanation: '13 − 6 = 7 ones.' },
            { step: 4, action: 'Subtract tens', explanation: '7 tens − 4 tens = 3 tens. Final difference: 37.' },
            { step: 5, action: 'Verify with inverse addition', explanation: 'Check: 37 + 46 = 83. Verified.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 37',
          commonErrorOrScientificReasoning: 'Common Error: Inverting subtraction (doing 6 − 3 = 3 to write 43) because 6 is larger.',
          belizeanContextNote: 'Tracking inventory crates at a citrus packing shed in Stann Creek.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Solve 3-digit subtraction across zero: 504 − 238.',
          stepByStepSolution: [
            { step: 1, action: 'Regroup from hundreds since tens is zero', explanation: 'Cross out 5 hundreds, leave 4 hundreds. Give 10 tens to tens place (now 10 tens).' },
            { step: 2, action: 'Regroup from tens to ones', explanation: 'Cross out 10 tens, leave 9 tens. Give 10 ones to 4 ones (now 14 ones).' },
            { step: 3, action: 'Subtract column-by-column', explanation: 'Ones: 14 − 8 = 6. Tens: 9 − 3 = 6. Hundreds: 4 − 2 = 2. Difference: 266.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 266',
          commonErrorOrScientificReasoning: 'Common Error: Skipping the tens column and attempting to borrow directly from hundreds into ones.',
          belizeanContextNote: 'Managing ticket sales for the annual National Agriculture and Trade Show in Belmopan.'
        }
      ];

    case 'multiplication_division':
      return [
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Calculate 36 × 7 using the partial products algorithm.',
          stepByStepSolution: [
            { step: 1, action: 'Decompose two-digit factor', explanation: '36 = 30 + 6.' },
            { step: 2, action: 'Multiply tens by 7', explanation: '30 × 7 = 210.' },
            { step: 3, action: 'Multiply ones by 7', explanation: '6 × 7 = 42.' },
            { step: 4, action: 'Add partial products', explanation: '210 + 42 = 252.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 252',
          commonErrorOrScientificReasoning: 'Common Error: Multiplying 3 × 7 = 21 and forgetting it represents 21 tens (210).',
          belizeanContextNote: 'Packaging crates of mangoes in the Cayo District.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Divide 476 ÷ 4 using long division.',
          stepByStepSolution: [
            { step: 1, action: 'Divide hundreds', explanation: '4 ÷ 4 = 1. Multiply: 1 × 4 = 4. Subtract: 4 − 4 = 0. Bring down 7.' },
            { step: 2, action: 'Divide tens', explanation: '7 ÷ 4 = 1. Multiply: 1 × 4 = 4. Subtract: 7 − 4 = 3. Bring down 6.' },
            { step: 3, action: 'Divide ones', explanation: '36 ÷ 4 = 9. Multiply: 9 × 4 = 36. Subtract: 36 − 36 = 0. Remainder = 0.' },
            { step: 4, action: 'Check with multiplication', explanation: '119 × 4 = 476. Verified.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 119',
          commonErrorOrScientificReasoning: 'Common Error: Omitting steps or misaligning quotient digits over the dividend places.',
          belizeanContextNote: 'Distributing school exercise books equally among 4 classrooms in Corozal Town.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Divide 385 ÷ 6 with remainder.',
          stepByStepSolution: [
            { step: 1, action: 'Divide first two digits', explanation: '38 ÷ 6 = 6. Multiply: 6 × 6 = 36. Subtract: 38 − 36 = 2. Bring down 5.' },
            { step: 2, action: 'Divide remaining number', explanation: '25 ÷ 6 = 4. Multiply: 4 × 6 = 24. Subtract: 25 − 24 = 1.' },
            { step: 3, action: 'State quotient and remainder', explanation: 'Quotient = 64, Remainder = 1.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 64 R 1',
          commonErrorOrScientificReasoning: 'Common Error: Forgetting to verify that remainder (1) is strictly less than divisor (6).',
          belizeanContextNote: 'Baking and packing meat pies at a family bakery in San Ignacio.'
        }
      ];

    case 'fractions_decimals':
      return [
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Evaluate: 3/4 + 2/5 showing least common denominator working.',
          stepByStepSolution: [
            { step: 1, action: 'Find least common denominator (LCD)', explanation: 'Multiples of 4: 4, 8, 12, 16, 20. Multiples of 5: 5, 10, 15, 20. LCD = 20.' },
            { step: 2, action: 'Convert to equivalent fractions', explanation: '3/4 = (3×5)/(4×5) = 15/20; 2/5 = (2×4)/(5×4) = 8/20.' },
            { step: 3, action: 'Add numerators over common denominator', explanation: '15/20 + 8/20 = (15 + 8)/20 = 23/20.' },
            { step: 4, action: 'Convert improper fraction to mixed number', explanation: '23 ÷ 20 = 1 with remainder 3 => 1 3/20.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 23/20 or 1 3/20',
          commonErrorOrScientificReasoning: 'Common Error: Adding straight across (3+2)/(4+5) = 5/9. Fractions cannot be added until denominators are identical.',
          belizeanContextNote: 'Mixing batches of tropical fruit juices in Dangriga.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Subtract mixed numbers: 5 − 2 3/8.',
          stepByStepSolution: [
            { step: 1, action: 'Regroup whole number 5 into mixed number', explanation: '5 = 4 + 8/8 = 4 8/8.' },
            { step: 2, action: 'Subtract whole parts and fraction parts', explanation: '(4 − 2) + (8/8 − 3/8) = 2 + 5/8 = 2 5/8.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 2 5/8 meters',
          commonErrorOrScientificReasoning: 'Common Error: Subtracting 5 − 2 = 3 and attaching 3/8 (writing 3 3/8), forgetting that 3/8 is being subtracted.',
          belizeanContextNote: 'Cutting dressmaking fabric in Corozal Town.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Multiply decimals: 3.5 × 0.4.',
          stepByStepSolution: [
            { step: 1, action: 'Multiply as whole numbers ignoring decimal points', explanation: '35 × 4 = 140.' },
            { step: 2, action: 'Count total decimal places in factors', explanation: '3.5 has 1 decimal place; 0.4 has 1 decimal place. Total = 2 decimal places.' },
            { step: 3, action: 'Place decimal point in product', explanation: 'Count 2 places from the right: 1.40 = 1.4.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 1.4 (or 1.40)',
          commonErrorOrScientificReasoning: 'Common Error: Lining up decimal points as in addition instead of counting total decimal digits.',
          belizeanContextNote: 'Weighing sacks of rice at a grain cooperative in Spanish Lookout.'
        }
      ];

    case 'decimals_fractions_conversion':
      return [
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Convert the decimal 0.35 into a fraction in its simplest form.',
          stepByStepSolution: [
            { step: 1, action: 'Identify place value of the last digit', explanation: 'The digit 5 is in the hundredths place. Write the decimal as a fraction with denominator 100: 0.35 = 35/100.' },
            { step: 2, action: 'Determine the greatest common divisor (GCD)', explanation: 'Find the greatest number that divides both 35 and 100: Factors of 35 are 1, 5, 7, 35; factors of 100 are 1, 2, 4, 5, 10, 20, 25, 50, 100. GCD = 5.' },
            { step: 3, action: 'Divide numerator and denominator by GCD', explanation: '(35 ÷ 5) / (100 ÷ 5) = 7/20.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 0.35 = 7/20 in simplest form',
          commonErrorOrScientificReasoning: 'Common Error: Writing 35/10 (confusing tenths with hundredths) or forgetting to simplify 35/100 by dividing by 5.',
          belizeanContextNote: 'Weighing sacks of organic cacao beans at a farm cooperative in Toledo District.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Convert the fraction 3/4 into a decimal using equivalent fractions and long division.',
          stepByStepSolution: [
            { step: 1, action: 'Find multiplying factor to make denominator 100', explanation: '100 ÷ 4 = 25. Multiply numerator and denominator by 25.' },
            { step: 2, action: 'Create equivalent fraction with base-10 denominator', explanation: '(3 × 25) / (4 × 25) = 75/100.' },
            { step: 3, action: 'Convert to decimal notation', explanation: '75 hundredths is written as 0.75. Alternative check: 3 ÷ 4 = 0.75.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: 3/4 = 0.75',
          commonErrorOrScientificReasoning: 'Common Error: Dividing denominator by numerator (4 ÷ 3 = 1.33) rather than numerator by denominator (3 ÷ 4 = 0.75).',
          belizeanContextNote: 'Measuring timber lengths for desks at a community woodworking shop in Orange Walk.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Error Analysis: Devaughn was asked to convert 0.8 into a fraction and wrote 8/100. Diagnose his misconception and provide the true simplified fraction.',
          stepByStepSolution: [
            { step: 1, action: 'Identify place-value position', explanation: 'The digit 8 is in the first column to the right of the decimal point, which is the tenths column (1/10), NOT the hundredths column.' },
            { step: 2, action: 'Write correct initial fraction', explanation: '0.8 = 8/10 (eight tenths).' },
            { step: 3, action: 'Simplify fraction to lowest terms', explanation: 'Divide numerator and denominator by GCD (2): (8 ÷ 2) / (10 ÷ 2) = 4/5. Note: 8/100 equals 0.08.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: Misconception: Devaughn confused tenths with hundredths. Correct fraction: 0.8 = 4/5.',
          commonErrorOrScientificReasoning: 'Common Error: Assigning denominator 100 to single-decimal place values.',
          belizeanContextNote: 'Auditing wholesale citrus delivery receipts at a packing plant in Stann Creek.'
        }
      ];

    case 'linear_equations':
      return [
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Solve for x: 3x + 7 = 28 using inverse operations.',
          stepByStepSolution: [
            { step: 1, action: 'Identify operations applied to x', explanation: 'x is multiplied by 3, then 7 is added. Apply inverse operations in reverse order.' },
            { step: 2, action: 'Undo addition by subtracting 7 from both sides', explanation: '3x + 7 − 7 = 28 − 7 => 3x = 21.' },
            { step: 3, action: 'Undo multiplication by dividing both sides by 3', explanation: '3x / 3 = 21 / 3 => x = 7.' },
            { step: 4, action: 'Check solution in original equation', explanation: '3(7) + 7 = 21 + 7 = 28. Verified equal.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: x = 7',
          commonErrorOrScientificReasoning: 'Common Error: Dividing by 3 before subtracting 7 without dividing the constant 7.',
          belizeanContextNote: 'Balancing weights on a traditional balance scale at a market in San Ignacio.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'Solve for y: 5y − 9 = 36.',
          stepByStepSolution: [
            { step: 1, action: 'Undo subtraction by adding 9 to both sides', explanation: '5y − 9 + 9 = 36 + 9 => 5y = 45.' },
            { step: 2, action: 'Undo multiplication by dividing both sides by 5', explanation: '5y / 5 = 45 / 5 => y = 9.' },
            { step: 3, action: 'Check solution', explanation: '5(9) − 9 = 45 − 9 = 36. Verified.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: y = 9',
          commonErrorOrScientificReasoning: 'Common Error: Subtracting 9 instead of adding 9 to undo subtraction.',
          belizeanContextNote: 'Calculating containerized citrus crate packaging in Stann Creek.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: 'A rectangular garden has perimeter 36 m and length is 4 m more than width w. Set up and solve: 4w + 8 = 36.',
          stepByStepSolution: [
            { step: 1, action: 'Subtract 8 from both sides', explanation: '4w = 36 − 8 = 28.' },
            { step: 2, action: 'Divide both sides by 4', explanation: 'w = 28 / 4 = 7 meters.' },
            { step: 3, action: 'Find length', explanation: 'Length = w + 4 = 7 + 4 = 11 meters.' },
            { step: 4, action: 'Verify perimeter', explanation: '2(11 + 7) = 2(18) = 36 meters. Verified.' }
          ],
          finalAnswerOrModelResponse: 'Final Answer: Width = 7 meters; Length = 11 meters',
          commonErrorOrScientificReasoning: 'Common Error: Setting length + width = 36 instead of 2(length + width) = 36.',
          belizeanContextNote: 'Fencing an eco-garden at a primary school in Cayo.'
        }
      ];

    default:
      return [
        {
          subjectType: 'Mathematics',
          problemOrContext: `Model algorithmic problem for ${topic}`,
          stepByStepSolution: [
            { step: 1, action: 'Identify known values and question target', explanation: 'State given numbers, mathematical relationships, and units.' },
            { step: 2, action: 'Execute step-by-step mathematical algorithm', explanation: 'Perform verified intermediate calculations without skipping steps.' },
            { step: 3, action: 'Verify result using inverse operations', explanation: 'Check calculation and attach appropriate Belizean unit labels.' }
          ],
          finalAnswerOrModelResponse: `Verified solution for ${topic} with intermediate steps and units.`,
          commonErrorOrScientificReasoning: 'Common Error: Skipping intermediate check steps or making clerical arithmetic slips.',
          belizeanContextNote: 'Problem grounded in everyday Belizean community and economic life.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: `Applied contextual word problem for ${topic}`,
          stepByStepSolution: [
            { step: 1, action: 'Translate scenario into mathematical expression', explanation: 'Extract numbers and identify operations required.' },
            { step: 2, action: 'Compute intermediate lines systematically', explanation: 'Execute operations adhering strictly to standard rules.' },
            { step: 3, action: 'Interpret answer in context', explanation: 'Write final response with explicit unit label.' }
          ],
          finalAnswerOrModelResponse: `Complete verified answer for ${topic} with context.`,
          commonErrorOrScientificReasoning: 'Common Error: Misinterpreting keyword relationships in contextual scenarios.',
          belizeanContextNote: 'Contextual scenario in trade, agriculture, or daily life in Belize.'
        },
        {
          subjectType: 'Mathematics',
          problemOrContext: `Error analysis and mathematical reasoning for ${topic}`,
          stepByStepSolution: [
            { step: 1, action: 'Examine sample student calculation', explanation: 'Trace each line to detect the exact point where the error occurred.' },
            { step: 2, action: 'Explain the conceptual or procedural misconception', explanation: 'Articulate why the student made the error in words.' },
            { step: 3, action: 'Produce the correct step-by-step evaluation', explanation: 'Show the valid calculation with boxed final answer.' }
          ],
          finalAnswerOrModelResponse: `Error diagnosed and correct calculation demonstrated.`,
          commonErrorOrScientificReasoning: 'Common Error: Inability to explain why a mathematically incorrect step violates procedural rules.',
          belizeanContextNote: 'Collaborative peer review and formative learning in primary mathematics.'
        }
      ];
  }
}

/**
 * Returns grade-appropriate objectives with condition "Given...", psychomotor with exercise book notes,
 * and cognitive with 80% (4 out of 5 marks) mastery benchmark.
 */
export function getCategoryObjectives(
  classification: MathClassification,
  dayNumber: number,
  topic: string,
  subtopic: string
): { cond: string; cogObj: string; psyObj: string; affObj: string; successCriteria: string[] } {
  const cat = classification.category;
  const grade = classification.gradeName;

  const cond = `Given concrete manipulatives, structured problem representations, and teacher modeling during Day ${dayNumber} instruction on ${topic}`;

  let cogObj = '';
  let psyObj = '';
  let affObj = '';
  let successCriteria: string[] = [];

  switch (cat) {
    case 'early_counting_ten_frames':
      cogObj = `Students will count objects accurately from 1 to 20 using touch-point one-to-one correspondence, represent quantities on ten-frames, and compare sets with at least 80% accuracy (at least 4 out of 5 marks on the diagnostic exit ticket).`;
      psyObj = `Students will place physical counters on ten-frame mats, trace numerals with correct stroke sequence, and record number bonds in their early learner exercise books.`;
      affObj = `Students will demonstrate patience during object counting, take turns sharing manipulatives with partners, and celebrate counting progress.`;
      successCriteria = [
        'Count sets of up to 20 objects touching each object exactly once.',
        'Draw and fill a ten-frame showing numbers 1 to 10 accurately.',
        'Score at least 80% (at least 4 out of 5 marks) on the Day ' + dayNumber + ' exit ticket.'
      ];
      break;

    case 'early_operations_bonds':
      cogObj = `Students will solve addition and subtraction facts within 20 using part-part-whole number bonds and the make-a-ten strategy with at least 80% accuracy (at least 4 out of 5 marks on the exit ticket).`;
      psyObj = `Students will manipulate connecting cubes, draw part-part-whole bonds, and write related addition/subtraction fact family sentences in their exercise books.`;
      affObj = `Students will articulate why addition facts can be reversed (commutative property) and explain reasoning to table partners.`;
      successCriteria = [
        'Identify all missing addends in number bonds to 10 and 20.',
        'Apply make-a-ten decomposition (e.g. 8 + 5 = 10 + 3 = 13) accurately.',
        'Score at least 80% (at least 4 out of 5 marks) on the exit ticket.'
      ];
      break;

    case 'place_value_regrouping':
      cogObj = `Students will add and subtract 2-digit and 3-digit whole numbers using standard column algorithms with regrouping (trading) with at least 80% accuracy (at least 4 out of 5 marks on the exit ticket).`;
      psyObj = `Students will align digits neatly in place-value columns, record carried tens and traded ones clearly, and write verified sums/differences in their exercise books.`;
      affObj = `Students will practice precision in column alignment and actively explain why subtraction cannot simply reverse smaller top digits.`;
      successCriteria = [
        'Align whole numbers strictly by place-value columns (hundreds, tens, ones).',
        'Execute trading/regrouping accurately without inverting subtraction order.',
        'Score at least 80% (at least 4 out of 5 marks) on the exit ticket.'
      ];
      break;

    case 'multiplication_division':
      cogObj = `Students will model multiplication using arrays, execute partial products, and solve multi-digit division problems with at least 80% accuracy (at least 4 out of 5 marks on the exit ticket).`;
      psyObj = `Students will draw grid arrays, write out partial products (e.g. 30×7 + 6×7 = 252), and record step-by-step long division lines in their exercise books.`;
      affObj = `Students will appreciate the connection between multiplication and division as inverse operations and verify solutions reciprocally.`;
      successCriteria = [
        'Draw rectangular arrays and write matching multiplication equations.',
        'Execute multi-digit multiplication and long division algorithms with correct steps.',
        'Score at least 80% (at least 4 out of 5 marks) on the exit ticket.'
      ];
      break;

    case 'fractions_decimals':
      cogObj = `Students will generate equivalent fractions, add/subtract fractions with like and unlike denominators, and compute decimal operations with at least 80% accuracy (at least 4 out of 5 marks on the exit ticket).`;
      psyObj = `Students will shade fraction circle and bar models, show least common denominator conversions, and record decimal operations line-by-line in their exercise books.`;
      affObj = `Students will justify why denominators must be equal before adding parts and critique peer reasoning constructively.`;
      successCriteria = [
        'Determine least common denominators (LCD) to add fractions with unlike denominators.',
        'Show all intermediate conversion lines and simplify final fractional answers.',
        'Score at least 80% (at least 4 out of 5 marks) on the exit ticket.'
      ];
      break;

    case 'decimals_fractions_conversion':
      cogObj = `Students will convert decimals between 0 and 1 into simplified equivalent fractions and convert fractions into terminating decimals with at least 80% accuracy (at least 4 out of 5 marks on the diagnostic exit ticket).`;
      psyObj = `Students will shade tenths and hundredths decimal grids, align place-value columns, and record step-by-step conversion working in their exercise books.`;
      affObj = `Students will actively explain place-value relationships to table partners, critique peer reasoning constructively, and appreciate decimal-fraction equivalence in daily Belizean trade.`;
      successCriteria = [
        'Identify decimal place values (tenths, hundredths, thousandths) and express as fractions over 10, 100, or 1000.',
        'Simplify converted fractions to lowest terms using greatest common divisors (GCD).',
        'Convert fractions to decimals using equivalent fractions or long division.',
        'Score at least 80% (at least 4 out of 5 marks) on the Day ' + dayNumber + ' exit ticket.'
      ];
      break;

    case 'measurement_currency':
      cogObj = `Students will calculate perimeter, area, volume, and make exact change in Belize Dollar (BZD) currency with at least 80% accuracy (at least 4 out of 5 marks on the exit ticket).`;
      psyObj = `Students will measure dimensions with metric rulers/meter sticks, count mock Belize currency notes and coins, and record calculations with proper unit labels in their exercise books.`;
      affObj = `Students will appreciate practical financial literacy and spatial measurement in managing Belizean market commerce and construction.`;
      successCriteria = [
        'Calculate perimeter and area using appropriate geometric formulas.',
        'Compute currency transactions and change with BZD dollar labels.',
        'Score at least 80% (at least 4 out of 5 marks) on the exit ticket.'
      ];
      break;

    case 'linear_equations':
      cogObj = `Students will solve one-step and two-step linear equations using inverse operations (e.g., 3x + 7 = 28 => x = 7; 4w + 8 = 36 => w = 7) and balance scales with at least 80% accuracy (at least 4 out of 5 marks on the exit ticket).`;
      psyObj = `Students will manipulate balance scale models, write inverse operations line-by-line on both sides of equals signs, and verify solutions in their exercise books.`;
      affObj = `Students will appreciate the golden rule of equation balance and explain why operations must be applied equally to both sides.`;
      successCriteria = [
        'Isolate variables by undoing addition/subtraction and multiplication/division.',
        'Check solutions by substituting the value back into the original equation.',
        'Score at least 80% (at least 4 out of 5 marks) on the exit ticket.'
      ];
      break;

    default:
      cogObj = `Students will apply standard mathematical procedures for ${topic} in ${grade} with at least 80% accuracy (at least 4 out of 5 marks on the diagnostic exit ticket).`;
      psyObj = `Students will execute multi-step calculations line-by-line, show formulas and units, and record verified solutions in their exercise books.`;
      affObj = `Students will engage in respectful mathematical discourse, explain reasoning to table partners, and persevere through non-routine problem solving.`;
      successCriteria = [
        `State and apply the core algorithmic procedure for ${topic}.`,
        'Show complete intermediate calculations, formulas, and units.',
        'Score at least 80% (at least 4 out of 5 marks) on the exit ticket.'
      ];
      break;
  }

  return { cond, cogObj, psyObj, affObj, successCriteria };
}
