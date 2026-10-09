// A cycle is derived, not stored (spec section 6): it runs from one period's
// startDate to the day before the next period's startDate.
export interface Cycle {
  startDate: string;            // YYYY-MM-DD, start of the period that begins the cycle
  periodEndDate: string | null; // end of that period's bleeding, if it has ended
  periodLength: number | null;  // inclusive days of bleeding; null while ongoing
  cycleLength: number | null;   // days to the next period start; null for the ongoing (most recent) cycle
}
