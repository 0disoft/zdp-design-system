import { readComponents } from './component';
import { parsePackageJson, parseTokenNames } from './package';
import { parseRootExports, resolveRootSignatures } from './root';
import { publicApiSchemaVersion, type PublicApiContract, type SourceReader } from './types';

export async function createPublicApiContract(reader: SourceReader): Promise<PublicApiContract> {
  const packageJson = parsePackageJson(
    await reader.readText('package.json'),
    `${reader.label}:package.json`
  );
  const unresolvedRootExports = parseRootExports(
    await reader.readText('src/lib/index.ts'),
    `${reader.label}:src/lib/index.ts`
  );
  const rootExports = await resolveRootSignatures(reader, unresolvedRootExports);
  const components = await readComponents(reader, rootExports);
  const tokens = parseTokenNames(
    await reader.readText('src/lib/tokens.ts'),
    `${reader.label}:src/lib/tokens.ts`
  );

  return {
    schemaVersion: publicApiSchemaVersion,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
    packageExports: packageJson.exports,
    rootExports,
    components,
    tokens
  };
}

export {
  comparePublicApiContracts,
  formatPublicApiComparison,
  validateVersionForApiChange
} from './compare';
export { readChangedReleaseIntent } from './release-intent';
export { createGitRefReader, createWorkingTreeReader } from './source';
export type {
  ComponentContract,
  ComponentPropContract,
  ComponentTypeDeclarationContract,
  PackageExportLeaf,
  PublicApiChange,
  PublicApiComparison,
  PublicApiContract,
  ReleaseBump,
  ReleaseIntent,
  RootExportContract,
  SourceReader
} from './types';
