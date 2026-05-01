// simple AI mock (replace with OpenAI later)

export async function validateSubmission(bug, code, explanation) {

  let score = 0;

  // basic checks
  if (code && code.length > 20) score += 1;
  if (explanation && explanation.length > 15) score += 1;

  // keyword relevance check
  const keyword = bug.toLowerCase().split(" ")[0];

  if (
    code.toLowerCase().includes(keyword) ||
    explanation.toLowerCase().includes(keyword)
  ) {
    score += 1;
  }

  const approved = score >= 2;

  return {
    approved,
    score,
    confidence: score / 3
  };
}
