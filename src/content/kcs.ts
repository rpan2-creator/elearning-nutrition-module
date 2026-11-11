/** Knowledge components. Every test item and module activity is tagged with one. */
export const KCS = {
  macro_roles: "Macronutrient roles",
  multi_roles: "Foods with several roles",
  product_diff: "Similar foods, different nutrition",
  carb_amounts: "Carbohydrate in common portions",
  energy_density: "Energy per gram",
  energy_calc: "Energy from a label",
  energy_use: "Daily energy use (BMR, activity)",
  tdee_calc: "Estimating daily energy use",
  bmi_limits: "What BMI can and cannot tell you",
  portion_estimation: "Estimating portions by hand",
  plate_adjust: "Adjusting a plate",
  snack_pairing: "Pairing a snack",
  causal_justification: "Explaining a choice",
} as const;

export type KC = keyof typeof KCS;

export const MACRO = {
  protein: { label: "Protein", color: "var(--protein)" },
  carb: { label: "Carbohydrate", color: "var(--carb)" },
  fat: { label: "Fat", color: "var(--fat)" },
  fiber: { label: "Fiber", color: "var(--fiber)" },
} as const;

export type Macro = keyof typeof MACRO;
