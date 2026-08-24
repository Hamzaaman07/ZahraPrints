/** Minimal pass/fail reporter shared by the girih verifiers. */
export function checker() {
  let failures = 0;
  return {
    check(ok: boolean, pass: string, failMsg: string) {
      if (ok) console.log("  " + pass);
      else { console.log("  FAIL " + failMsg); failures += 1; }
    },
    fail(msg: string) { console.log("  FAIL " + msg); failures += 1; },
    done(label: string): never {
      console.log(failures === 0 ? `\nALL ${label} CHECKS PASSED` : `\n${failures} FAILURES`);
      process.exit(failures === 0 ? 0 : 1);
    },
  };
}
