export const COLORS = [
  "#7C3AED", "#3B82F6", "#06B6D4", "#10B981",
  "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6",
  "#6366F1", "#14B8A6",
];

export const CATEGORY_LABELS = {
  FOOD: "Food & Dining",
  TRANSPORT: "Transportation",
  HOUSING: "Housing & Rent",
  ENTERTAINMENT: "Entertainment",
  TRAVEL: "Travel",
  HEALTH: "Healthcare",
  SHOPPING: "Shopping",
  MISCELLANEOUS: "Miscellaneous",
  SALARY: "Salary",
  INVESTMENTS: "Investments",
};

export const CATEGORIES = [
  "SALARY", "INVESTMENTS", "FOOD", "TRANSPORT",
  "HOUSING", "ENTERTAINMENT", "TRAVEL", "HEALTH",
  "SHOPPING", "MISCELLANEOUS",
];

export const INTERVALS = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
