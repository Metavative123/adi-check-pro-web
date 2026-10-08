// Whether a test's result agrees with its faults, under the DVSA marking rules.
// Mirrors the API's src/services/testRules.js, which has the final say; this
// copy lets the instructor see the problem before saving.
//   - one serious or dangerous fault is a fail
//   - more than 15 driving faults is a fail
export const MAX_DRIVING_FAULTS_FOR_PASS = 15;

type Faults = { driving: number; serious: number; dangerous: number };

export function resultProblem(result: "pass" | "fail" | "" | undefined, faults: Faults) {
  const failLevel = faults.serious + faults.dangerous;

  if (result === "fail" && failLevel === 0 && faults.driving <= MAX_DRIVING_FAULTS_FOR_PASS) {
    return (
      "A fail needs at least one serious or dangerous fault " +
      `(or more than ${MAX_DRIVING_FAULTS_FOR_PASS} driving faults). Add the fault that caused the fail.`
    );
  }
  if (result === "pass" && failLevel > 0) {
    return "A pass cannot have serious or dangerous faults. Check the result or the faults.";
  }
  if (result === "pass" && faults.driving > MAX_DRIVING_FAULTS_FOR_PASS) {
    return `A pass allows at most ${MAX_DRIVING_FAULTS_FOR_PASS} driving faults. Check the result or the faults.`;
  }
  return "";
}

// Not an error, but worth a second look: examiner action is normally recorded
// together with a serious or dangerous fault.
export function interventionWarning(
  physical: boolean,
  verbal: boolean,
  faults: Faults
) {
  if ((physical || verbal) && faults.serious + faults.dangerous === 0) {
    return "The examiner took action but no serious or dangerous fault is recorded. Check this is right.";
  }
  return "";
}
