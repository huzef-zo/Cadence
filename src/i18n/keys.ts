// Language-independent key arrays (spec 2.1).
// These are stored ids in the database and must never be translated.

export const moodTagKeys = ['calm', 'anxious', 'irritable', 'sad', 'energetic', 'tired'] as const;
export const painTagKeys = ['cramps', 'lower-back', 'headache', 'breast-tenderness', 'other'] as const;
export const symptomKeys = ['bloating', 'acne', 'nausea', 'cravings', 'poor-sleep', 'low-energy', 'dizziness'] as const;
