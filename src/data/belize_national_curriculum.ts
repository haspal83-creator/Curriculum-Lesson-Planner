import { CurriculumEntry, GradeLevel, Subject } from '../types';

/**
 * Official Belize National Primary Curriculum Database
 * Covers Infant 1 through Standard 6 across Cycles 1 to 4 and key academic years.
 * Aligned with the Ministry of Education, Culture, Science & Technology (MoECST) Belize Curriculum Framework.
 */
export const BELIZE_NATIONAL_CURRICULUM: CurriculumEntry[] = [
  // ==========================================
  // INFANT 1 (2025-2026)
  // ==========================================
  // Infant 1 - Mathematics
  {
    id: 'bzc-inf1-m-c1-1',
    grade: 'Infant 1',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Number and Operations',
    topic: 'Counting and Number Recognition 1 to 5',
    subtopic: 'Object Counting and One-to-One Correspondence',
    learning_outcomes: [
      'Count concrete objects accurately from 1 to 5 using touch-point one-to-one correspondence.',
      'Match spoken number words with corresponding numerals and sets of objects up to 5.',
      'Recognize and write numerals 1 to 5 with correct pencil grip and stroke sequence.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf1-m-c1-2',
    grade: 'Infant 1',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Algebra and Patterns',
    topic: 'Basic Repeating Patterns (AB)',
    subtopic: 'Color and Shape Sequences',
    learning_outcomes: [
      'Identify and copy simple 2-color and 2-shape repeating patterns (AB).',
      'Extend an AB pattern using counters, blocks, or drawings.',
      'Create an original AB pattern using classroom manipulatives.'
    ],
    suggestedLessons: 6,
    suggestedWeeks: 2,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf1-m-c2-1',
    grade: 'Infant 1',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Geometry',
    topic: '2D Shapes Recognition',
    subtopic: 'Circles, Squares, and Triangles',
    learning_outcomes: [
      'Identify and name circles, squares, and triangles in classroom and environmental objects.',
      'Sort shape cut-outs by attributes such as straight and curved sides.',
      'Construct basic 2D shapes using playdough, sticks, or dot paper.'
    ],
    suggestedLessons: 7,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf1-m-c2-2',
    grade: 'Infant 1',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Number and Operations',
    topic: 'Numbers 6 to 10 and Comparing Sets',
    subtopic: 'More, Less, and Equal Quantities',
    learning_outcomes: [
      'Count collections of objects up to 10 accurately.',
      'Compare two groups of items using terms "more than", "fewer than", and "same as".',
      'Identify the number that comes immediately before or after a given number up to 10.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf1-m-c3-1',
    grade: 'Infant 1',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Measurement',
    topic: 'Comparative Length and Height',
    subtopic: 'Direct Comparison of Objects',
    learning_outcomes: [
      'Compare the lengths of two ribbons, pencils, or sticks placed side-by-side using "longer" and "shorter".',
      'Compare heights of classroom peers and objects using "taller" and "shorter".',
      'Order three objects from shortest to longest.'
    ],
    suggestedLessons: 6,
    suggestedWeeks: 2,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf1-m-c4-1',
    grade: 'Infant 1',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Operations',
    topic: 'Early Addition Concepts to 5',
    subtopic: 'Combining Sets and Story Problems',
    learning_outcomes: [
      'Model joining two small sets of concrete objects to make a whole up to 5.',
      'Solve simple verbal story problems involving adding one more object.',
      'Use drawings or counters to show combinations that make 5.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // Infant 1 - Language Arts
  {
    id: 'bzc-inf1-la-c1-1',
    grade: 'Infant 1',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Phonological Awareness & Phonics',
    topic: 'Letter Sound Recognition (s, a, t, p)',
    subtopic: 'Initial Sounds and Auditory Discrimination',
    learning_outcomes: [
      'Isolate and pronounce initial consonant and short vowel sounds for s, a, t, p.',
      'Match letter flashcards to pictures beginning with the corresponding target sound.',
      'Form lowercase letters s, a, t, p with correct top-to-bottom stroke direction.'
    ],
    suggestedLessons: 10,
    suggestedWeeks: 4,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf1-la-c2-1',
    grade: 'Infant 1',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Reading & Phonics',
    topic: 'CVC Blending and High-Frequency Words',
    subtopic: 'Short A and Short I Word Families',
    learning_outcomes: [
      'Blend 3 sounds to read simple CVC words (e.g., cat, sat, pit, tap).',
      'Recognize high-frequency sight words: I, a, the, see, my.',
      'Read short emergent reader sentences pointing accurately to each word.'
    ],
    suggestedLessons: 10,
    suggestedWeeks: 4,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf1-la-c3-1',
    grade: 'Infant 1',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Oral Language & Comprehension',
    topic: 'Belizean Story Comprehension & Character Identification',
    subtopic: 'Retelling Key Events from Read-Alouds',
    learning_outcomes: [
      'Recall who, what, and where in a read-aloud story with Belizean cultural characters.',
      'Sequence three story pictures showing beginning, middle, and end.',
      'Express personal thoughts about characters and their actions.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf1-la-c4-1',
    grade: 'Infant 1',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Emergent Writing',
    topic: 'Guided Sentence Writing and Labeling',
    subtopic: 'Writing Simple Captions for Drawings',
    learning_outcomes: [
      'Label personal drawings using beginning and ending sounds.',
      'Write a simple 3-word patterned sentence with capitalization and period.',
      'Read back own written work to peers and teacher.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // ==========================================
  // INFANT 2 (2025-2026)
  // ==========================================
  // Infant 2 - Mathematics
  {
    id: 'bzc-inf2-m-c1-1',
    grade: 'Infant 2',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Number Sense',
    topic: 'Numbers 1 to 20 and Ten-Frames',
    subtopic: 'Decomposing Numbers with Ten-Frames',
    learning_outcomes: [
      'Represent teen numbers (11 to 19) as a group of ten and additional ones using ten-frames.',
      'Write numbers 1 to 20 in sequence and fill in missing numerals.',
      'Compare quantities up to 20 using symbols <, >, =.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf2-m-c2-1',
    grade: 'Infant 2',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Operations',
    topic: 'Addition and Subtraction Facts to 10',
    subtopic: 'Part-Part-Whole Number Bonds',
    learning_outcomes: [
      'Solve addition equations with sums up to 10 using number bond diagrams.',
      'Demonstrate subtraction as "taking away" or "finding the difference" within 10.',
      'Write math equations using +, -, and = signs to represent word scenarios.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf2-m-c3-1',
    grade: 'Infant 2',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Measurement',
    topic: 'Time and Non-Standard Measurement',
    subtopic: 'Days of the Week and Measuring with Paperclips',
    learning_outcomes: [
      'Recite and sequence the seven days of the week in chronological order.',
      'Measure length of classroom items using non-standard units (cubes, paperclips).',
      'Tell time to the hour on an analog clock face.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf2-m-c4-1',
    grade: 'Infant 2',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Data Handling',
    topic: 'Simple Pictographs and Tally Marks',
    subtopic: 'Collecting and Sorting Classroom Preferences',
    learning_outcomes: [
      'Collect data on favorite fruits or games using tally marks.',
      'Construct a simple pictograph where 1 symbol represents 1 item.',
      'Answer questions interpreting the most and least frequent categories on a pictograph.'
    ],
    suggestedLessons: 6,
    suggestedWeeks: 2,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // ==========================================
  // INFANT 3 (2025-2026)
  // ==========================================
  // Infant 3 - Mathematics
  {
    id: 'bzc-inf3-m-c1-1',
    grade: 'Infant 3',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Number Sense',
    topic: 'Place Value Foundations up to 50',
    subtopic: 'Grouping into Tens and Ones',
    learning_outcomes: [
      'Bundle objects into groups of ten and identify residual ones up to 50.',
      'Write 2-digit numbers in standard and expanded form (e.g., 34 = 30 + 4).',
      'Locate numbers 1 to 50 on a hundred chart and identify 10 more or 10 less.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf3-m-c2-1',
    grade: 'Infant 3',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Operations',
    topic: 'Addition and Subtraction within 20',
    subtopic: 'Make-a-Ten Strategy and Fact Families',
    learning_outcomes: [
      'Apply the "make-a-ten" mental strategy to add single-digit numbers with sums over 10.',
      'Demonstrate inverse relationship between addition and subtraction within fact families.',
      'Solve 1-step word problems involving joining and separating actions.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf3-m-c3-1',
    grade: 'Infant 3',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Measurement',
    topic: 'Belizean Currency Coins and Values',
    subtopic: 'Recognizing and Adding Coins (1c, 5c, 10c, 25c)',
    learning_outcomes: [
      'Identify Belizean circulation coins: 1 cent, 5 cents, 10 cents, and 25 cents.',
      'Count collections of like coins to determine total monetary value up to 50 cents.',
      'Simulate small store purchases by making exact change using coins.'
    ],
    suggestedLessons: 7,
    suggestedWeeks: 2,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-inf3-m-c4-1',
    grade: 'Infant 3',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Geometry & Measurement',
    topic: 'Perimeter Exploration and 3D Shapes',
    subtopic: 'Prisms, Spheres, and Counting Boundary Units',
    learning_outcomes: [
      'Identify 3D solid figures: cube, sphere, cylinder, and rectangular prism in the real world.',
      'Find the boundary length of simple planar figures using unit grid steps.',
      'Describe faces, edges, and corners of everyday solid objects.'
    ],
    suggestedLessons: 7,
    suggestedWeeks: 2,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // ==========================================
  // STANDARD 1 (2025-2026)
  // ==========================================
  // Standard 1 - Mathematics
  {
    id: 'bzc-std1-m-c1-1',
    grade: 'Standard 1',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Number Sense',
    topic: 'Place Value to 100',
    subtopic: 'Tens and Ones, Expanded Notation and Comparing',
    learning_outcomes: [
      'Determine the value of digits in 2-digit numbers up to 100 using base-ten blocks.',
      'Express numbers up to 100 in standard, expanded, and word forms.',
      'Compare and order pairs of 2-digit numbers using comparison symbols (<, >, =).'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std1-m-c2-1',
    grade: 'Standard 1',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Operations',
    topic: '2-Digit Addition and Subtraction with Regrouping',
    subtopic: 'Column Addition and Trading Tens for Ones',
    learning_outcomes: [
      'Add two 2-digit numbers with regrouping using place value columns.',
      'Subtract 2-digit numbers with decomposing/borrowing from the tens column.',
      'Solve multi-step real-world word problems involving classroom inventory.'
    ],
    suggestedLessons: 10,
    suggestedWeeks: 4,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std1-m-c3-1',
    grade: 'Standard 1',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Fractions',
    topic: 'Introduction to Halves and Quarters',
    subtopic: 'Equal Shares of Shapes and Sets',
    learning_outcomes: [
      'Partition regular 2D shapes (circles, squares, rectangles) into equal halves (1/2) and fourths (1/4).',
      'Explain that equal shares of identical wholes do not have to have the same shape.',
      'Calculate one-half and one-fourth of a set of up to 12 concrete counters.'
    ],
    suggestedLessons: 7,
    suggestedWeeks: 2,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std1-m-c4-1',
    grade: 'Standard 1',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Measurement',
    topic: 'Linear Measurement with Metric Units (cm, m)',
    subtopic: 'Using Centimeter Rulers and Meter Sticks',
    learning_outcomes: [
      'Measure objects to the nearest centimeter using a standard metric ruler.',
      'Estimate lengths of desks, books, and doors before verifying with a meter stick.',
      'Compare metric measurements and find how much longer one object is than another.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // Standard 1 - Language Arts
  {
    id: 'bzc-std1-la-c1-1',
    grade: 'Standard 1',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Reading & Phonics',
    topic: 'Short Vowels and Consonant Blends',
    subtopic: 'L-Blends and R-Blends (bl, cl, fl, br, cr, dr)',
    learning_outcomes: [
      'Decode words containing initial consonant blends (e.g., flag, crab, drum).',
      'Spell target blend words correctly in weekly dictation.',
      'Read decodable narrative texts with 90% accuracy and appropriate phrasing.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std1-la-c2-1',
    grade: 'Standard 1',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Grammar and Writing',
    topic: 'Nouns (Common & Proper) and Simple Sentences',
    subtopic: 'Capitalization of Names, Days, and Months',
    learning_outcomes: [
      'Distinguish between common nouns (boy, school) and proper nouns (Belize, Carlos, San Pedro).',
      'Construct a complete sentence starting with a capital letter and terminating with a period or question mark.',
      'Identify and fix sentence fragments in peer writing exercises.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std1-la-c3-1',
    grade: 'Standard 1',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Comprehension',
    topic: 'Main Idea and Supporting Details in Folktales',
    subtopic: 'Anansi and Traditional Caribbean Tales',
    learning_outcomes: [
      'Identify the central message or moral in traditional Belizean/Caribbean Anansi folktales.',
      'Cite two specific text details that support the main lesson of the narrative.',
      'Dramatize character dialogue with appropriate vocal expression.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std1-la-c4-1',
    grade: 'Standard 1',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Writing Process',
    topic: 'Descriptive Paragraph Writing',
    subtopic: 'Using Sensory Words (Sight, Sound, Touch)',
    learning_outcomes: [
      'Draft a 4-to-5 sentence descriptive paragraph about a Belizean animal or place.',
      'Incorporate sensory adjectives to enhance visual and auditory descriptions.',
      'Revise written sentences for subject-verb agreement and punctuation.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // ==========================================
  // STANDARD 2 (2025-2026)
  // ==========================================
  // Standard 2 - Mathematics
  {
    id: 'bzc-std2-m-c1-1',
    grade: 'Standard 2',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Number Sense',
    topic: 'Place Value up to 1,000',
    subtopic: 'Hundreds, Tens, and Ones; Skip Counting by 5s and 10s',
    learning_outcomes: [
      'Read and write 3-digit numbers up to 1,000 in numeral and expanded notation.',
      'Model 3-digit numbers using hundreds flats, tens rods, and unit cubes.',
      'Skip count forwards and backwards by 5s, 10s, and 100s from any starting number.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std2-m-c2-1',
    grade: 'Standard 2',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Operations',
    topic: 'Multiplication Foundations and Equal Groups',
    subtopic: 'Arrays and Repeated Addition (2, 5, and 10 Times Tables)',
    learning_outcomes: [
      'Represent multiplication as repeated addition and rectangular arrays.',
      'Memorize and recite the multiplication facts for 2, 5, and 10.',
      'Solve practical word problems calculating total items in equal packaging.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std2-m-c3-1',
    grade: 'Standard 2',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Fractions',
    topic: 'Fractional Parts of Wholes and Sets',
    subtopic: 'Unit Fractions (1/2, 1/3, 1/4, 1/8)',
    learning_outcomes: [
      'Identify unit fractions 1/2, 1/3, 1/4, and 1/8 with correct numerator and denominator terms.',
      'Represent fractions on number lines between 0 and 1.',
      'Compare unit fractions by reasoning about the size of equal parts.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std2-m-c4-1',
    grade: 'Standard 2',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Measurement',
    topic: 'Belizean Currency and Making Change',
    subtopic: 'Adding Dollars and Cents up to $20.00',
    learning_outcomes: [
      'Recognize all Belizean currency denominations (coins and $2, $5, $10, $20 notes).',
      'Compute the total cost of two market items and calculate change from a given bill.',
      'Write money values using decimal notation with the dollar symbol ($).'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // ==========================================
  // STANDARD 3 (2025-2026)
  // ==========================================
  // Standard 3 - Mathematics
  {
    id: 'bzc-std3-m-c1-1',
    grade: 'Standard 3',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Number Sense',
    topic: 'Place Value to 10,000 and Rounding',
    subtopic: 'Rounding to Nearest 10 and 100',
    learning_outcomes: [
      'Read, write, and identify place values of digits up to 10,000.',
      'Round 4-digit whole numbers to the nearest 10 and nearest 100 on open number lines.',
      'Order sets of numbers up to 10,000 in ascending and descending order.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std3-m-c2-1',
    grade: 'Standard 3',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Operations',
    topic: 'Multi-Digit Multiplication and Division Concepts',
    subtopic: 'Multiplying 2-Digit by 1-Digit and Equal Sharing',
    learning_outcomes: [
      'Multiply a 2-digit number by a 1-digit number using the partial products method.',
      'Demonstrate division as sharing equally and repeated subtraction with remainders.',
      'Solve multi-step word problems involving Belize agricultural harvests (citrus, sugar cane).'
    ],
    suggestedLessons: 10,
    suggestedWeeks: 4,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std3-m-c3-1',
    grade: 'Standard 3',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Fractions and Decimals',
    topic: 'Fractions with Like Denominators and Tenths',
    subtopic: 'Adding and Subtracting Fractions with Same Denominator',
    learning_outcomes: [
      'Add and subtract fractions with like denominators within one whole (e.g., 3/8 + 2/8 = 5/8).',
      'Model tenths on a base-ten grid and relate 1/10 to 0.1 in decimal notation.',
      'Solve word problems involving shares of traditional Belizean baked goods.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std3-m-c4-1',
    grade: 'Standard 3',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Geometry & Measurement',
    topic: 'Perimeter, Area of Rectangles, and Right Angles',
    subtopic: 'Calculating Square Units on Grids',
    learning_outcomes: [
      'Calculate the perimeter of polygons by summing the lengths of all boundary sides.',
      'Determine the area of rectangles and squares by counting unit squares or using L x W.',
      'Identify right angles, acute angles, and obtuse angles in classroom geometric models.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // Standard 3 - Science and Technology
  {
    id: 'bzc-std3-sci-c1-1',
    grade: 'Standard 3',
    subject: 'Science and Technology',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Living Things and Life Cycles',
    topic: 'Plant Parts and Their Functions',
    subtopic: 'Roots, Stems, Leaves, Flowers, and Photosynthesis Basics',
    learning_outcomes: [
      'Label and explain the function of roots, stems, leaves, flowers, and seeds in tropical plants.',
      'Conduct a simple classroom investigation observing water absorption through plant stems.',
      'Describe how green plants in Belize utilize sunlight, water, and air to produce food.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std3-sci-c2-1',
    grade: 'Standard 3',
    subject: 'Science and Technology',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Ecosystems & Habitats',
    topic: 'Belizean Ecosystems: Pine Ridge and Mangroves',
    subtopic: 'Animal Adaptations to Wetland and Forest Habitats',
    learning_outcomes: [
      'Identify key flora and fauna native to Belizean mangrove swamps and Mountain Pine Ridge.',
      'Explain how mangrove root systems protect the Belize coastline from hurricane storm surges.',
      'Classify animals into herbivores, carnivores, and omnivores within a Belizean food chain.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std3-sci-c3-1',
    grade: 'Standard 3',
    subject: 'Science and Technology',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Matter and Energy',
    topic: 'States of Matter and the Water Cycle',
    subtopic: 'Evaporation, Condensation, Precipitation, and Runoff in Belize',
    learning_outcomes: [
      'Differentiate between solids, liquids, and gases based on observable physical properties.',
      'Diagram the complete water cycle highlighting evaporation from the Caribbean Sea.',
      'Demonstrate changes of state through safe classroom boiling and freezing experiments.'
    ],
    suggestedLessons: 7,
    suggestedWeeks: 2,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std3-sci-c4-1',
    grade: 'Standard 3',
    subject: 'Science and Technology',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Earth & Space',
    topic: 'Weather Observation and Hurricane Preparedness',
    subtopic: 'Using Weather Instruments (Thermometer, Rain Gauge, Anemometer)',
    learning_outcomes: [
      'Measure and record daily temperature, rainfall, and wind direction using simple instruments.',
      'Interpret national weather advisories issued by the Belize National Meteorological Service.',
      'Formulate a family emergency kit checklist for hurricane preparedness in Belize.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // ==========================================
  // STANDARD 4 (2025-2026)
  // ==========================================
  // Standard 4 - Mathematics
  {
    id: 'bzc-std4-m-c1-1',
    grade: 'Standard 4',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Number Sense',
    topic: 'Place Value up to 100,000',
    subtopic: 'Writing in Standard, Expanded, and Word Form',
    learning_outcomes: [
      'Read and write 5-digit numbers up to 100,000 in standard, word, and expanded forms.',
      'Determine the place and value of any specified digit in numbers up to 100,000.',
      'Compare and order numbers up to 100,000 using mathematical symbols (<, >, =).'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std4-m-c1-2',
    grade: 'Standard 4',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Operations',
    topic: 'Addition and Subtraction of 5-Digit Numbers',
    subtopic: 'Multi-Step Word Problems and Estimation',
    learning_outcomes: [
      'Add and subtract 5-digit whole numbers with multiple regroupings across zeros.',
      'Estimate sums and differences using front-end estimation and rounding to the nearest 1,000.',
      'Formulate and solve real-world word problems referencing Belize district census populations.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std4-m-c2-1',
    grade: 'Standard 4',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Operations',
    topic: 'Multi-Digit Operations: Long Division and Factors',
    subtopic: 'Dividing 3-Digit Numbers by 1-Digit Divisors',
    learning_outcomes: [
      'Compute long division quotients with and without remainders using standard algorithmic steps.',
      'Identify factors and multiples of whole numbers up to 50.',
      'Distinguish between prime and composite numbers using factor trees.'
    ],
    suggestedLessons: 10,
    suggestedWeeks: 4,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std4-m-c3-1',
    grade: 'Standard 4',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Fractions and Decimals',
    topic: 'Fractions with Unlike Denominators and Decimals to Hundredths',
    subtopic: 'Equivalent Fractions and Adding Decimals',
    learning_outcomes: [
      'Generate equivalent fractions using multiplication and division of numerator and denominator.',
      'Add and subtract simple fractions with unlike denominators by finding common multiples.',
      'Read, write, and compare decimal numbers up to two decimal places (hundredths).'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std4-m-c4-1',
    grade: 'Standard 4',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Measurement and Data',
    topic: 'Metric Conversions and Line Plots',
    subtopic: 'Converting Units (km to m, kg to g, L to mL)',
    learning_outcomes: [
      'Convert metric units of length, mass, and capacity within the metric system.',
      'Construct line plots to display fractional measurement data to the nearest quarter unit.',
      'Calculate mean and mode for small datasets from science class investigations.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // Standard 4 - Language Arts
  {
    id: 'bzc-std4-la-c1-1',
    grade: 'Standard 4',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Writing and Text Types',
    topic: 'Narrative Story Structure and Dialogue',
    subtopic: 'Plot Mountain (Exposition, Rising Action, Climax, Resolution)',
    learning_outcomes: [
      'Analyze narrative text structure identifying exposition, problem, rising action, climax, and resolution.',
      'Write dialogue correctly punctuated with quotation marks, commas, and speaker tags.',
      'Publish a complete 3-paragraph narrative story featuring Belizean community life.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std4-la-c2-1',
    grade: 'Standard 4',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Grammar and Mechanics',
    topic: 'Parts of Speech: Verbs, Tenses, and Adverbs',
    subtopic: 'Past, Present, Future Tenses and Irregular Verbs',
    learning_outcomes: [
      'Identify and use regular and irregular past tense verbs in written composition.',
      'Distinguish between adverbs of manner, time, and place in mentor texts.',
      'Maintain consistent verb tense throughout a written informative paragraph.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std4-la-c3-1',
    grade: 'Standard 4',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Reading Comprehension',
    topic: 'Cause and Effect in Expository Texts',
    subtopic: 'Signal Words (Because, Since, As a Result, Therefore)',
    learning_outcomes: [
      'Identify explicit and implicit cause-and-effect relationships in informational articles.',
      'Locate and explain cause-and-effect transition words within non-fiction reading.',
      'Synthesize information from two texts about environmental conservation in Belize.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std4-la-c4-1',
    grade: 'Standard 4',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Persuasive Writing & Public Speaking',
    topic: 'Persuasive Letters and Opinion Paragraphs',
    subtopic: 'Developing Claims with Evidence and Reasons',
    learning_outcomes: [
      'State a clear opinion claim on a school or community issue in a formal letter format.',
      'Provide three logical reasons supported by verifiable facts to convince the audience.',
      'Deliver a 2-minute oral presentation persuading classmates with audible voice and good eye contact.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // ==========================================
  // STANDARD 5 (2025-2026)
  // ==========================================
  // Standard 5 - Mathematics
  {
    id: 'bzc-std5-m-c1-1',
    grade: 'Standard 5',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Number Sense',
    topic: 'Whole Numbers to 1,000,000 and Integers',
    subtopic: 'Place Value to Millions and Introduction to Negative Numbers',
    learning_outcomes: [
      'Read, write, and compare numbers up to 1,000,000 using standard and scientific notations.',
      'Explain the concept of negative integers in real-life contexts (temperatures below zero, sea depths).',
      'Apply the Order of Operations (PEMDAS) to evaluate multi-operation arithmetic expressions.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std5-m-c2-1',
    grade: 'Standard 5',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Fractions and Decimals',
    topic: 'Fraction Operations: Multiplication and Division',
    subtopic: 'Multiplying Fractions and Mixed Numbers',
    learning_outcomes: [
      'Multiply proper fractions and mixed numbers using visual area models and standard algorithms.',
      'Divide unit fractions by whole numbers and whole numbers by unit fractions.',
      'Solve multi-step word problems involving recipe scaling for Belizean culinary events.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std5-m-c3-1',
    grade: 'Standard 5',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Proportional Reasoning',
    topic: 'Percentages, Ratios, and Proportions',
    subtopic: 'Calculating Discounts and General Sales Tax (GST) in Belize',
    learning_outcomes: [
      'Convert between fractions, decimals, and percentages interchangeably.',
      'Calculate percentage discounts and 12.5% General Sales Tax (GST) on Belize retail goods.',
      'Express ratios in simplest form and solve equivalent ratio proportions.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std5-m-c4-1',
    grade: 'Standard 5',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Geometry & Volume',
    topic: 'Volume of Rectangular Prisms and Angle Measurement',
    subtopic: 'Cubic Units (V = l x w x h) and Protractor Skills',
    learning_outcomes: [
      'Measure and draw angles up to 180 degrees accurately using a standard protractor.',
      'Derive and use the formula V = l x w x h to find volume of rectangular storage tanks.',
      'Classify 2D polygons based on angle properties and parallel/perpendicular lines.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // ==========================================
  // STANDARD 6 (2025-2026)
  // ==========================================
  // Standard 6 - Mathematics
  {
    id: 'bzc-std6-m-c1-1',
    grade: 'Standard 6',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Real Number System',
    topic: 'Real Number System and Advanced Place Value',
    subtopic: 'Powers of Ten, Exponents, and Scientific Notation',
    learning_outcomes: [
      'Express large and small quantities using exponential powers of 10 and scientific notation.',
      'Evaluate complex expressions with nested parentheses, brackets, and exponents.',
      'Classify numbers as rational, irrational, integer, or whole numbers with concrete justifications.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std6-m-c1-2',
    grade: 'Standard 6',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Algebra',
    topic: 'Algebraic Expressions and Variables',
    subtopic: 'Writing and Evaluating Expressions from Word Scenarios',
    learning_outcomes: [
      'Translate verbal mathematical phrases into algebraic expressions with variables.',
      'Evaluate algebraic expressions when values are assigned to variables.',
      'Combine like terms using distributive and commutative properties.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std6-m-c2-1',
    grade: 'Standard 6',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Algebraic Equations',
    topic: 'Solving Linear Equations and Inequalities',
    subtopic: 'One-Step and Two-Step Equations with Balancing Method',
    learning_outcomes: [
      'Solve one-step and two-step linear equations using inverse operations.',
      'Graph solutions of one-variable inequalities on number lines.',
      'Solve BJAT examination style word problems involving unknown variables.'
    ],
    suggestedLessons: 10,
    suggestedWeeks: 4,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std6-m-c3-1',
    grade: 'Standard 6',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Consumer Mathematics',
    topic: 'Belizean Consumer Math and Financial Literacy',
    subtopic: 'Currency Exchange (BZD to USD), Simple Interest, and Commission',
    learning_outcomes: [
      'Calculate currency conversions between Belize Dollars (BZD) and US Dollars (USD) at fixed 2:1 peg.',
      'Compute simple interest earned or paid using the formula I = P x R x T.',
      'Calculate sales commission and profit margins for small business operations in Belize.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std6-m-c4-1',
    grade: 'Standard 6',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Coordinate Geometry & Statistics',
    topic: 'Coordinate Plane (All 4 Quadrants) and Probability',
    subtopic: 'Graphing Linear Relationships and Theoretical Probability',
    learning_outcomes: [
      'Plot and identify ordered pairs (x, y) across all four quadrants of the Cartesian coordinate plane.',
      'Calculate theoretical and experimental probability of simple and compound events as fractions and percents.',
      'Construct and analyze circle graphs (pie charts) to represent national demographic data.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // Standard 6 - Language Arts
  {
    id: 'bzc-std6-la-c1-1',
    grade: 'Standard 6',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Writing and Composition',
    topic: 'Expository Essay Writing and Thesis Statements',
    subtopic: '5-Paragraph Essay Architecture and Transitions',
    learning_outcomes: [
      'Formulate a clear, defensible thesis statement in an introductory essay paragraph.',
      'Develop three structured body paragraphs each beginning with a strong topic sentence.',
      'Incorporate sophisticated transitional phrases (furthermore, consequently, nevertheless).'
    ],
    suggestedLessons: 10,
    suggestedWeeks: 4,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std6-la-c2-1',
    grade: 'Standard 6',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Reading Comprehension',
    topic: 'Literary Analysis of Caribbean Poetry and Prose',
    subtopic: 'Figurative Language: Metaphor, Simile, Personification, and Alliteration',
    learning_outcomes: [
      'Interpret figurative language devices in celebrated Belizean and Caribbean literary poems.',
      'Explain how authors use imagery and dialect to evoke cultural identity and mood.',
      'Write analytical responses citing specific textual evidence to defend character analysis.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std6-la-c3-1',
    grade: 'Standard 6',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Critical Literacy',
    topic: 'Evaluating Author Bias, Tone, and Point of View',
    subtopic: 'Fact vs. Opinion and Rhetorical Devices in Editorials',
    learning_outcomes: [
      'Distinguish verified empirical facts from subjective opinions and propaganda techniques.',
      'Analyze the perspective and potential bias of authors in Belizean news editorials.',
      'Write a counter-argument paragraph respectfully refuting an opposing viewpoint.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std6-la-c4-1',
    grade: 'Standard 6',
    subject: 'Language Arts',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Standardized Exam Readiness',
    topic: 'BJAT Examination Mastery: Editing and Extended Writing',
    subtopic: 'Proofreading for Grammar, Mechanics, and Timed Essay Writing',
    learning_outcomes: [
      'Detect and correct errors in subject-verb agreement, pronoun antecedent, and run-on sentences under timed conditions.',
      'Produce an organized, engaging personal narrative or persuasive response within exam time constraints.',
      'Synthesize multiple reading passages to answer higher-order analytical prompts.'
    ],
    suggestedLessons: 10,
    suggestedWeeks: 4,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // Standard 6 - Belizean Studies
  {
    id: 'bzc-std6-bs-c1-1',
    grade: 'Standard 6',
    subject: 'Belizean Studies',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 1,
    strand: 'Belizean History',
    topic: 'Ancient Maya Civilization and Settlement Patterns',
    subtopic: 'Social Hierarchy, Agriculture (Milpa), and Major Sites (Altun Ha, Xunantunich, Lamanai)',
    learning_outcomes: [
      'Describe the social structure, religious beliefs, and astronomical advances of the Ancient Maya.',
      'Explain sustainable agricultural practices including the Milpa and terracing systems.',
      'Locate prominent Maya archaeological sites across Belize districts on a national map.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std6-bs-c2-1',
    grade: 'Standard 6',
    subject: 'Belizean Studies',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 2,
    strand: 'Colonial Era and Migration',
    topic: 'The Baymen, Slavery, and the Battle of St. George\'s Caye',
    subtopic: 'Mahogany Extraction, Resistance, and September 10th Heritage',
    learning_outcomes: [
      'Examine the history of the mahogany and logwood industries and enslaved labor in Belize.',
      'Analyze historical accounts and significance of the September 10th, 1798 Battle of St. George\'s Caye.',
      'Discuss the cultural contributions of Garifuna, Maya, Mestizo, Creole, East Indian, and Mennonite migrations.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std6-bs-c3-1',
    grade: 'Standard 6',
    subject: 'Belizean Studies',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 3,
    strand: 'Civics and Governance',
    topic: 'The Road to Independence and Belize\'s Constitution',
    subtopic: 'Right Hon. George Price, Constitutional Monarchy, and Parliamentary Democracy',
    learning_outcomes: [
      'Trace the nationalist movement from the 1950s leading to Belize Independence on September 21, 1981.',
      'Explain the three branches of the Belize Government: Executive, Legislative, and Judiciary.',
      'Describe the rights and responsibilities of Belizean citizens as outlined in the Constitution.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-std6-bs-c4-1',
    grade: 'Standard 6',
    subject: 'Belizean Studies',
    academicYear: '2025-2026',
    schoolYear: '2025-2026',
    cycle: 4,
    strand: 'Geography & Economy',
    topic: 'Belize\'s Economy, Natural Resources, and Conservation',
    subtopic: 'Belize Barrier Reef UNESCO Heritage, Ecotourism, and Agriculture',
    learning_outcomes: [
      'Evaluate the economic significance of tourism, agriculture (sugar, citrus, bananas), and fisheries.',
      'Assess conservation policies protecting the Belize Barrier Reef Reserve System.',
      'Propose community solutions for balancing economic development with environmental sustainability.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2025-08-15T00:00:00.000Z'
  },

  // =========================================================================
  // ACADEMIC YEAR 2026-2027 (Distinct topics ensuring strict year isolation)
  // =========================================================================
  {
    id: 'bzc-2627-std5-m-c1-1',
    grade: 'Standard 5',
    subject: 'Mathematics',
    academicYear: '2026-2027',
    schoolYear: '2026-2027',
    cycle: 1,
    strand: 'Number and Advanced Operations',
    topic: '2026-2027 Modular Arithmetic and Expanded Notation to Billions',
    subtopic: 'Base Systems and Large Scale Population Data',
    learning_outcomes: [
      'Represent and analyze world demographic figures up to billions in standard and expanded notation.',
      'Explain modular patterns in repeating sequences and leap year cycles.',
      'Estimate large scale sums using order of magnitude rounding.'
    ],
    suggestedLessons: 8,
    suggestedWeeks: 3,
    createdAt: '2026-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-2627-std6-m-c1-1',
    grade: 'Standard 6',
    subject: 'Mathematics',
    academicYear: '2026-2027',
    schoolYear: '2026-2027',
    cycle: 1,
    strand: 'Real Number System',
    topic: '2026-2027 Exponent Rules and Prime Factorization Systems',
    subtopic: 'Product of Powers and Greatest Common Divisor Matrices',
    learning_outcomes: [
      'Apply exponent rules (product of powers, quotient of powers) with integer bases.',
      'Compute GCD and LCM using prime factorization trees and Venn diagram intersection.',
      'Formulate algebraic expressions modeling exponential growth patterns.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2026-08-15T00:00:00.000Z'
  },
  {
    id: 'bzc-2627-std6-m-c2-1',
    grade: 'Standard 6',
    subject: 'Mathematics',
    academicYear: '2026-2027',
    schoolYear: '2026-2027',
    cycle: 2,
    strand: 'Algebra',
    topic: '2026-2027 Simultaneous Equations and Coordinate Functions',
    subtopic: 'Graphing Intersection Points on Coordinate Grids',
    learning_outcomes: [
      'Solve pairs of simultaneous linear equations graphically and algebraically.',
      'Determine the slope and y-intercept of linear relations in real-world pricing models.',
      'Graph functional tables on coordinate grids with labeled axes and intervals.'
    ],
    suggestedLessons: 9,
    suggestedWeeks: 3,
    createdAt: '2026-08-15T00:00:00.000Z'
  }
];
