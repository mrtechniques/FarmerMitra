const texts = [
  "VALID",
  "VALID.",
  "**VALID**",
  "\nVALID\n",
  "INVALID",
  "NOT VALID",
  "IT IS NOT A PLANT"
];

for(const t of texts) {
  const raw = t.toUpperCase().replace(/[^A-Z]/g, '');
  console.log(`Input: "${t.replace(/\n/g, '\\n')}" -> Cleaned: "${raw}" -> isValid: ${raw === 'VALID'}`);
}
