export default function extractJson(str: string) {
  const results = [];
  let firstOpen = 0;
  let lastClose = str.length - 1;

  while (true) {
    firstOpen = str.indexOf("[", firstOpen);
    if (firstOpen === -1) break; // No more opening brackets

    lastClose = str.indexOf("]", firstOpen);
    if (lastClose === -1) break; // No more closing brackets

    const candidate = str.substring(firstOpen, lastClose + 1); // Include the closing bracket
    console.log("candidate: " + candidate);
    try {
      const res = JSON.parse(candidate);
      results.push(res);
      console.log("...found");
    } catch (e) {
      if (e instanceof Error) console.log("...failed");
    }

    // Move the firstOpen pointer past the current opening bracket for the next iteration
    firstOpen = lastClose + 1;
  }

  return results.length > 0 ? results : null; // Return the results or null if empty
}
