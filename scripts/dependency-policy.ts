import { execFileSync } from "node:child_process";

export type DependencyPolicy = {
  range: string;
  installed: string;
  supported: string;
};

export function checkDependencyPolicies(policies: DependencyPolicy[]): boolean[] {
  // Bun is the repository toolchain; use its semver parser without another dependency.
  const result = execFileSync("bun", ["-e", `
    const policies = JSON.parse(process.argv.at(-1));
    console.log(JSON.stringify(policies.map(({ range, installed, supported }) => {
      const match = /^(\\d+)\\.(\\d+)\\.(\\d+)$/.exec(installed);
      if (!match || typeof range !== "string") return false;
      const [, major, minor, patch] = match.map(Number);
      const allows = version => Bun.semver.satisfies(version, range);
      return Bun.semver.satisfies(installed, supported) && allows(installed)
        && allows(major + "." + minor + "." + (patch + 1))
        && allows(major + "." + (minor + 1) + ".0")
        && !allows((major + 1) + ".0.0");
    })));
  `, JSON.stringify(policies)], { encoding: "utf8", timeout: 5_000, windowsHide: true });
  return JSON.parse(result) as boolean[];
}
