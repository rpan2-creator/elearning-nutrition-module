import type { Macro } from "./kcs";

/**
 * Typical values per common portion, rounded (USDA FoodData Central, generic items).
 * Brands vary — the module always says "typical" and points learners to the label.
 */
export interface Food {
  id: string;
  name: string;
  img: string;
  portion: string;
  hand?: string;
  kcal: number;
  carb: number;
  protein: number;
  fat: number;
  fiber: number;
  roles: Macro[];
  note?: string;
}

const f = (x: Food) => x;

export const FOODS = {
  rice: f({ id: "rice", name: "White rice, cooked", img: "/illus/rice.svg", portion: "1 cup", hand: "1 fist", kcal: 205, carb: 45, protein: 4, fat: 0.4, fiber: 0.6, roles: ["carb"] }),
  bread: f({ id: "bread", name: "Whole-wheat bread", img: "/illus/bread.svg", portion: "1 slice", kcal: 80, carb: 14, protein: 4, fat: 1, fiber: 2, roles: ["carb", "fiber"] }),
  banana: f({ id: "banana", name: "Banana", img: "/illus/banana.svg", portion: "1 medium", kcal: 105, carb: 27, protein: 1, fat: 0.4, fiber: 3, roles: ["carb", "fiber"] }),
  oatmeal: f({ id: "oatmeal", name: "Oatmeal, cooked", img: "/illus/oatmeal.svg", portion: "1 cup", hand: "1 fist", kcal: 150, carb: 27, protein: 5, fat: 3, fiber: 4, roles: ["carb", "fiber"] }),
  pasta: f({ id: "pasta", name: "Pasta, cooked", img: "/illus/pasta.svg", portion: "1 cup", hand: "1 fist", kcal: 220, carb: 43, protein: 8, fat: 1, fiber: 2.5, roles: ["carb"] }),
  potato: f({ id: "potato", name: "Baked potato", img: "/illus/potato.svg", portion: "1 medium", kcal: 160, carb: 37, protein: 4, fat: 0.2, fiber: 4, roles: ["carb", "fiber"] }),
  beans: f({ id: "beans", name: "Black beans, cooked", img: "/illus/black-beans.svg", portion: "½ cup", hand: "1 cupped palm", kcal: 115, carb: 20, protein: 8, fat: 0.5, fiber: 7.5, roles: ["carb", "protein", "fiber"], note: "Beans count as both a protein food and a carbohydrate food." }),
  soda: f({ id: "soda", name: "Regular soda", img: "/illus/soda.svg", portion: "12 oz can", kcal: 140, carb: 39, protein: 0, fat: 0, fiber: 0, roles: ["carb"], note: "All of it is added sugar." }),
  apple: f({ id: "apple", name: "Apple", img: "/illus/apple.svg", portion: "1 medium", kcal: 95, carb: 25, protein: 0.5, fat: 0.3, fiber: 4, roles: ["carb", "fiber"] }),
  quinoa: f({ id: "quinoa", name: "Quinoa, cooked", img: "/illus/quinoa.svg", portion: "1 cup", hand: "1 fist", kcal: 220, carb: 39, protein: 8, fat: 3.5, fiber: 5, roles: ["carb", "protein", "fiber"] }),

  chicken: f({ id: "chicken", name: "Chicken breast, cooked", img: "/illus/chicken.svg", portion: "3 oz", hand: "1 palm", kcal: 140, carb: 0, protein: 26, fat: 3, fiber: 0, roles: ["protein"] }),
  salmon: f({ id: "salmon", name: "Salmon, cooked", img: "/illus/salmon.svg", portion: "3 oz", hand: "1 palm", kcal: 175, carb: 0, protein: 22, fat: 10, fiber: 0, roles: ["protein", "fat"] }),
  egg: f({ id: "egg", name: "Egg", img: "/illus/egg.svg", portion: "1 large", kcal: 72, carb: 0.4, protein: 6, fat: 5, fiber: 0, roles: ["protein", "fat"] }),
  greek: f({ id: "greek", name: "Plain Greek yogurt", img: "/illus/yogurt.svg", portion: "170 g cup", kcal: 100, carb: 6, protein: 17, fat: 0.7, fiber: 0, roles: ["protein"], note: "Strained, so the protein is concentrated." }),
  regular: f({ id: "regular", name: "Plain regular yogurt", img: "/illus/yogurt.svg", portion: "170 g cup", kcal: 107, carb: 12, protein: 9, fat: 2.6, fiber: 0, roles: ["protein", "carb"] }),
  tofu: f({ id: "tofu", name: "Firm tofu", img: "/illus/tofu.svg", portion: "3 oz", hand: "1 palm", kcal: 120, carb: 2, protein: 13, fat: 7, fiber: 2, roles: ["protein", "fat"] }),
  milk: f({ id: "milk", name: "Dairy milk (2%)", img: "/illus/milk.svg", portion: "1 cup", hand: "1 fist", kcal: 122, carb: 12, protein: 8, fat: 5, fiber: 0, roles: ["protein", "carb"] }),
  almondmilk: f({ id: "almondmilk", name: "Almond milk, unsweetened", img: "/illus/almond-milk.svg", portion: "1 cup", hand: "1 fist", kcal: 35, carb: 1, protein: 1, fat: 2.5, fiber: 0.5, roles: [], note: "Mostly water — not a meaningful protein source." }),
  pb: f({ id: "pb", name: "Peanut butter", img: "/illus/peanut-butter.svg", portion: "2 tbsp", hand: "1 thumb", kcal: 190, carb: 7, protein: 7, fat: 16, fiber: 2, roles: ["fat", "protein"], note: "Grouped with protein foods, but most of its energy comes from fat." }),
  cheese: f({ id: "cheese", name: "String cheese", img: "/illus/cheese-stick.svg", portion: "1 stick", kcal: 80, carb: 1, protein: 7, fat: 6, fiber: 0, roles: ["protein", "fat"] }),
  jerky: f({ id: "jerky", name: "Beef jerky", img: "/illus/jerky.svg", portion: "1 oz", kcal: 115, carb: 3, protein: 9, fat: 7, fiber: 0.5, roles: ["protein"] }),
  edamame: f({ id: "edamame", name: "Edamame, shelled", img: "/illus/edamame.svg", portion: "½ cup", hand: "1 cupped palm", kcal: 95, carb: 7, protein: 9, fat: 4, fiber: 4, roles: ["protein", "fiber"] }),

  oil: f({ id: "oil", name: "Olive oil", img: "/illus/olive-oil.svg", portion: "1 tbsp", kcal: 120, carb: 0, protein: 0, fat: 14, fiber: 0, roles: ["fat"] }),
  almonds: f({ id: "almonds", name: "Almonds", img: "/illus/almonds.svg", portion: "1 oz (about 23)", hand: "1 small handful", kcal: 165, carb: 6, protein: 6, fat: 14, fiber: 3.5, roles: ["fat", "protein", "fiber"] }),
  avocado: f({ id: "avocado", name: "Avocado", img: "/illus/avocado.svg", portion: "½ medium", kcal: 120, carb: 6, protein: 1.5, fat: 11, fiber: 5, roles: ["fat", "fiber"] }),

  broccoli: f({ id: "broccoli", name: "Broccoli, cooked", img: "/illus/broccoli.svg", portion: "1 cup", hand: "1 fist", kcal: 55, carb: 11, protein: 4, fat: 0.6, fiber: 5, roles: ["fiber"] }),
  spinach: f({ id: "spinach", name: "Spinach, raw", img: "/illus/spinach.svg", portion: "2 cups", hand: "2 fists", kcal: 14, carb: 2, protein: 2, fat: 0.2, fiber: 1.3, roles: ["fiber"] }),
  carrot: f({ id: "carrot", name: "Carrots", img: "/illus/carrot.svg", portion: "1 cup", hand: "1 fist", kcal: 50, carb: 12, protein: 1, fat: 0.3, fiber: 3.5, roles: ["fiber"] }),
  tomato: f({ id: "tomato", name: "Cherry tomatoes", img: "/illus/tomato.svg", portion: "1 cup", hand: "1 fist", kcal: 27, carb: 6, protein: 1, fat: 0.3, fiber: 2, roles: ["fiber"] }),
  raspberries: f({ id: "raspberries", name: "Raspberries", img: "/illus/raspberries.svg", portion: "1 cup", hand: "1 fist", kcal: 64, carb: 15, protein: 1.5, fat: 0.8, fiber: 8, roles: ["fiber", "carb"] }),

  crackers: f({ id: "crackers", name: "Whole-wheat crackers", img: "/illus/crackers.svg", portion: "6 crackers", kcal: 120, carb: 20, protein: 3, fat: 4, fiber: 3, roles: ["carb"] }),
  granola: f({ id: "granola", name: "Granola bar", img: "/illus/granola-bar.svg", portion: "1 bar", kcal: 190, carb: 29, protein: 4, fat: 7, fiber: 2, roles: ["carb"] }),
};

export type FoodId = keyof typeof FOODS;
export const food = (id: FoodId) => FOODS[id];
