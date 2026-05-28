import { fetchAuthedJson } from "./api";

export type WellbeingEntryFormValues = {
  mood_score: number;
  sleep_hours: number;
  academic_load: number;
  energy_fatigue: number;
};

export type WellbeingEntryResponse = {
  id?: number;
  entry_id?: number;
  created_at?: string;
  user_id?: number;
};

export async function createWellbeingEntry(values: WellbeingEntryFormValues) {
  return fetchAuthedJson<WellbeingEntryResponse>("/api/wellbeing/entries", {
    method: "POST",
    body: JSON.stringify(values),
  });
}
