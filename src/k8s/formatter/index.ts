/**
 * @see https://kubernetes.io/ja/docs/concepts/overview/working-with-objects/names/#dns-label-names
 */
export const cutStringTo63CharactersOrLess = (text: string, throwError?: true): string => {
  if (throwError && text.length > 63) {
    throw new Error(`63文字を超えているため、正しくデプロイされない可能性があります。\nValue: "${text}"`);
  }
  return text.slice(0, 63);
};
