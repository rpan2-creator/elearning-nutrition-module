import type { KC } from "./kcs";

/**
 * Two parallel forms. Item n in form A and item n in form B test the same KC
 * with different foods or numbers. Half of participants take A first, half B.
 * Values used are general reference values (4/4/9 kcal per gram; Mifflin-St Jeor;
 * adult BMI categories; HPRC hand-portion guide).
 */

export interface Option {
  id: string;
  text: string;
}

interface BaseItem {
  id: string;
  kc: KC;
  prompt: string;
  image?: string;
  /** Shown after the test, on the results page only. Tests give no feedback. */
  explanation: string;
}

export interface ChoiceItem extends BaseItem {
  type: "choice";
  options: Option[];
  correct: string;
}

export interface MultiItem extends BaseItem {
  type: "multi";
  options: Option[];
  correct: string[];
}

export interface TextItem extends BaseItem {
  type: "text";
  placeholder: string;
  /** Not auto-scored; coded by the team from the admin export. */
  rubric: string;
}

export type TestItem = ChoiceItem | MultiItem | TextItem;

const o = (...texts: string[]): Option[] => texts.map((text, i) => ({ id: "abcde"[i], text }));

export const FORM_A: TestItem[] = [
  {
    id: "A1",
    kc: "macro_roles",
    type: "choice",
    prompt: "During a hard workout, which macronutrient is your body's main quick source of energy?",
    options: o("Protein", "Carbohydrate", "Fat", "Fiber"),
    correct: "b",
    explanation: "Carbohydrate is the body's main quick energy source, especially during intense activity.",
  },
  {
    id: "A2",
    kc: "multi_roles",
    type: "multi",
    prompt: "Black beans are a meaningful source of which of these? Select all that apply.",
    image: "/food/black-beans.webp",
    options: o("Carbohydrate", "Protein", "Fiber", "Fat"),
    correct: ["a", "b", "c"],
    explanation: "Beans count as both a protein food and a carbohydrate food, and they are high in fiber. They contain very little fat.",
  },
  {
    id: "A3",
    kc: "product_diff",
    type: "choice",
    prompt: "Two cups of the same size: plain Greek yogurt and plain regular yogurt. Which usually has more protein?",
    image: "/food/yogurt.webp",
    options: o("Plain regular yogurt", "Plain Greek yogurt", "About the same", "It depends only on the brand's fat level"),
    correct: "b",
    explanation: "Greek yogurt is strained, which removes liquid and concentrates protein. It often has around twice the protein per serving.",
  },
  {
    id: "A4",
    kc: "energy_density",
    type: "choice",
    prompt: "Which provides more energy: 10 g of fat or 10 g of protein?",
    options: o("10 g of protein", "10 g of fat", "They are the same", "It depends on the food"),
    correct: "b",
    explanation: "Fat provides about 9 kcal per gram; protein and carbohydrate about 4. So 10 g fat ≈ 90 kcal and 10 g protein ≈ 40 kcal.",
  },
  {
    id: "A5",
    kc: "energy_calc",
    type: "choice",
    prompt: "A snack bar has 10 g carbohydrate, 5 g protein, and 5 g fat. About how much energy is that?",
    options: o("About 60 kcal", "About 105 kcal", "About 150 kcal", "About 200 kcal"),
    correct: "b",
    explanation: "10 × 4 + 5 × 4 + 5 × 9 = 40 + 20 + 45 = 105 kcal.",
  },
  {
    id: "A6",
    kc: "energy_use",
    type: "choice",
    prompt: "For most people, which part makes up the largest share of the energy they use in a day?",
    options: o("Digesting food", "Exercise", "Basal metabolism (keeping the body running at rest)", "Thinking and studying"),
    correct: "c",
    explanation: "Basal metabolic rate (BMR) is usually the largest part, often more than half of daily energy use.",
  },
  {
    id: "A7",
    kc: "tdee_calc",
    type: "choice",
    prompt: "A student's estimated BMR is 1,600 kcal per day. Using a 'lightly active' factor of 1.375, about how much energy do they use in a day?",
    options: o("About 1,600 kcal", "About 1,975 kcal", "About 2,200 kcal", "About 2,750 kcal"),
    correct: "c",
    explanation: "1,600 × 1.375 = 2,200 kcal. This is an estimate; real needs vary from person to person.",
  },
  {
    id: "A8",
    kc: "bmi_limits",
    type: "choice",
    prompt: "A muscular college athlete has a BMI of 27. What is the best interpretation?",
    options: o(
      "They definitely have too much body fat",
      "BMI cannot tell muscle from fat, so it is only a rough screening number",
      "BMI is not affected by height",
      "They should eat less right away",
    ),
    correct: "b",
    explanation: "BMI is weight relative to height. It does not separate muscle from fat, so it can misclassify muscular people.",
  },
  {
    id: "A9",
    kc: "portion_estimation",
    type: "choice",
    prompt: "Using the hand guide, a mound of cooked rice about the size of your fist is roughly…",
    image: "/food/rice.webp",
    options: o("¼ cup", "½ cup", "1 cup", "2 cups"),
    correct: "c",
    explanation: "A fist is about 1 cup. A cupped palm is about ½ cup. Hand sizes vary, so check your fist against a measuring cup once.",
  },
  {
    id: "A10",
    kc: "plate_adjust",
    type: "choice",
    prompt: "Lunch is a large plate of pasta with a little tomato sauce. Which one change most likely makes it more balanced?",
    options: o(
      "Remove the pasta completely",
      "Add more tomato sauce",
      "Add a palm-sized portion of chicken or beans and a fist of vegetables",
      "Add a glass of juice",
    ),
    correct: "c",
    explanation: "The plate is missing a protein source and vegetables. Adding them, rather than removing the carbohydrate, improves balance.",
  },
  {
    id: "A11",
    kc: "snack_pairing",
    type: "choice",
    prompt: "You have an apple before a 3-hour lab. Which addition pairs a protein source with it?",
    image: "/food/apple.webp",
    options: o("A second apple", "A glass of orange juice", "A cup of plain Greek yogurt", "A handful of pretzels"),
    correct: "c",
    explanation: "The apple supplies carbohydrate and fiber. Greek yogurt adds protein, which in general makes the snack more balanced.",
  },
  {
    id: "A12",
    kc: "causal_justification",
    type: "text",
    prompt: "In one sentence, explain why your choice in the last question helps. Try: food → its nutritional role → why that helps here.",
    placeholder: "Greek yogurt adds … which …",
    rubric: "2 = names the food, its role (protein), and why it helps (balance/keeps you full/steady energy). 1 = role or benefit only. 0 = 'it's healthy' or no reason.",
    explanation: "Example: Greek yogurt adds protein, and pairing protein with the apple's carbohydrate generally keeps the snack more satisfying.",
  },
];

export const FORM_B: TestItem[] = [
  {
    id: "B1",
    kc: "macro_roles",
    type: "choice",
    prompt: "Which macronutrient's main job includes building and repairing body tissues such as muscle?",
    options: o("Carbohydrate", "Fat", "Protein", "Fiber"),
    correct: "c",
    explanation: "Protein supplies the building blocks (amino acids) for building and repairing tissues.",
  },
  {
    id: "B2",
    kc: "multi_roles",
    type: "multi",
    prompt: "Cooked lentils are a meaningful source of which of these? Select all that apply.",
    image: "/food/edamame.webp",
    options: o("Carbohydrate", "Protein", "Fiber", "Fat"),
    correct: ["a", "b", "c"],
    explanation: "Like other beans and peas, lentils provide carbohydrate, protein, and fiber, with very little fat.",
  },
  {
    id: "B3",
    kc: "product_diff",
    type: "choice",
    prompt: "One cup of dairy milk and one cup of unsweetened almond milk. Which usually has more protein?",
    options: o("Almond milk", "Dairy milk", "About the same", "Neither has any protein"),
    correct: "b",
    explanation: "Dairy milk has about 8 g protein per cup. Almond milk usually has only about 1 g. Soy milk is the plant milk closest to dairy.",
  },
  {
    id: "B4",
    kc: "energy_density",
    type: "choice",
    prompt: "Which provides more energy: 14 g of olive oil or 14 g of table sugar?",
    options: o("Table sugar", "Olive oil", "They are the same", "Neither provides energy"),
    correct: "b",
    explanation: "Oil is fat (≈9 kcal/g → ~126 kcal). Sugar is carbohydrate (≈4 kcal/g → ~56 kcal).",
  },
  {
    id: "B5",
    kc: "energy_calc",
    type: "choice",
    prompt: "A yogurt cup has 20 g carbohydrate, 10 g protein, and 2 g fat. About how much energy is that?",
    options: o("About 100 kcal", "About 138 kcal", "About 170 kcal", "About 320 kcal"),
    correct: "b",
    explanation: "20 × 4 + 10 × 4 + 2 × 9 = 80 + 40 + 18 = 138 kcal.",
  },
  {
    id: "B6",
    kc: "energy_use",
    type: "choice",
    prompt: "Which part of daily energy use changes the most from one day to the next?",
    options: o("Basal metabolism", "Physical activity", "Digesting food", "Body temperature"),
    correct: "b",
    explanation: "BMR stays fairly steady. Physical activity is the part that changes most with how active your day is.",
  },
  {
    id: "B7",
    kc: "tdee_calc",
    type: "choice",
    prompt: "A student's estimated BMR is 1,500 kcal per day. Using a 'moderately active' factor of 1.55, about how much energy do they use in a day?",
    options: o("About 1,550 kcal", "About 1,800 kcal", "About 2,325 kcal", "About 3,050 kcal"),
    correct: "c",
    explanation: "1,500 × 1.55 = 2,325 kcal. This is an estimate; real needs vary from person to person.",
  },
  {
    id: "B8",
    kc: "bmi_limits",
    type: "choice",
    prompt: "Two students both have a BMI of 24. What can you conclude?",
    options: o(
      "They have the same body fat percentage",
      "They are equally healthy",
      "Their weight relative to height is similar — not much more",
      "They should eat the same amount",
    ),
    correct: "c",
    explanation: "BMI only describes weight relative to height. It says nothing direct about body composition, fitness, or what someone should eat.",
  },
  {
    id: "B9",
    kc: "portion_estimation",
    type: "choice",
    prompt: "Using the hand guide, a piece of cooked chicken about the size of your open palm is roughly…",
    image: "/food/chicken.webp",
    options: o("1 oz", "3 oz", "8 oz", "12 oz"),
    correct: "b",
    explanation: "An open palm (no fingers) is about 3 oz of cooked meat, fish, or poultry.",
  },
  {
    id: "B10",
    kc: "plate_adjust",
    type: "choice",
    prompt: "A dining-hall plate has a burger patty and a big pile of fries, and no vegetables. Which one change most likely makes it more balanced?",
    options: o(
      "Remove the burger patty",
      "Swap about half of the fries for a fist of vegetables or salad",
      "Add a second side of fries",
      "Add a soda",
    ),
    correct: "b",
    explanation: "The plate already has protein and carbohydrate but no vegetables. Swapping part of the fries keeps the plate filling while adding fiber.",
  },
  {
    id: "B11",
    kc: "snack_pairing",
    type: "choice",
    prompt: "You have a handful of whole-wheat crackers between classes. Which addition pairs a protein source with them?",
    image: "/food/crackers.webp",
    options: o("More crackers", "A cheese stick", "A juice box", "A handful of grapes"),
    correct: "b",
    explanation: "Crackers supply carbohydrate. A cheese stick adds protein, which in general makes the snack more balanced.",
  },
  {
    id: "B12",
    kc: "causal_justification",
    type: "text",
    prompt: "In one sentence, explain why your choice in the last question helps. Try: food → its nutritional role → why that helps here.",
    placeholder: "A cheese stick adds … which …",
    rubric: "2 = names the food, its role (protein), and why it helps (balance/keeps you full/steady energy). 1 = role or benefit only. 0 = 'it's healthy' or no reason.",
    explanation: "Example: A cheese stick adds protein, and pairing protein with the crackers' carbohydrate generally keeps the snack more satisfying.",
  },
];

export function formFor(order: "AB" | "BA", which: "pre" | "post") {
  const first = order === "AB" ? FORM_A : FORM_B;
  const second = order === "AB" ? FORM_B : FORM_A;
  return which === "pre" ? { form: first, name: order[0] } : { form: second, name: order[1] };
}

export function isCorrect(item: TestItem, answer: unknown): boolean | null {
  if (item.type === "text") return null;
  if (item.type === "choice") return answer === item.correct;
  const a = Array.isArray(answer) ? [...answer].sort() : [];
  return a.length === item.correct.length && [...item.correct].sort().every((v, i) => v === a[i]);
}
