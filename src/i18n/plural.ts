export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string;
};

export type PluralFn = (n: number, forms: PluralForms) => string;

export function makePlural(locale: string): PluralFn {
  const rules = new Intl.PluralRules(locale);
  return (n: number, forms: PluralForms): string => {
    const category = rules.select(n);
    return forms[category] ?? forms.other;
  };
}
