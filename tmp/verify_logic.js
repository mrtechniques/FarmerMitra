
function mockCheck(raw) {
  raw = raw.trim().toUpperCase();
  if (raw.includes('VALID') && !raw.includes('INVALID') && !raw.includes('NO')) {
    return true;
  }
  return false;
}

const tests = [
  { input: "VALID", expected: true },
  { input: "INVALID", expected: false },
  { input: "VALID BUT INVALID", expected: false },
  { input: "NO, IT IS INVALID", expected: false },
  { input: "YES, IT IS VALID", expected: true },
  { input: "This is a person, INVALID", expected: false },
  { input: "The plant is VALID", expected: true },
  { input: "PERSON IN FIELD. INVALID", expected: false },
  { input: "NO", expected: false },
  { input: "NOT VALID", expected: false }, // "NOT VALID" doesn't have "INVALID" but has "NO" in "NOT"? No, "NOT" doesn't contain "NO". Wait.
];

tests.forEach(t => {
  const result = mockCheck(t.input);
  console.log(`Input: "${t.input}" | Result: ${result} | Expected: ${t.expected} | ${result === t.expected ? 'PASS' : 'FAIL'}`);
});
