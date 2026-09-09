export const localeTemplate = (name, isView) => isView ? `{
  "title": "${name.capitalized}",
  "default": "${name.pascal} works !"
}
` : `{
  "default": "${name.pascal} works !"
}
`;
