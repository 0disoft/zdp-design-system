export const publicApiSchemaVersion = 'zdp.public-api/v1' as const;

export interface SourceReader {
  readonly label: string;
  readText(path: string): Promise<string>;
}

export interface PackageExportLeaf {
  readonly exportPath: string;
  readonly conditions: readonly string[];
  readonly target: string;
}

export interface RootExportContract {
  readonly name: string;
  readonly importedName: string;
  readonly kind: 'type' | 'value';
  readonly source: string;
  readonly signature: string | null;
}

export interface ComponentPropContract {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly bindable: boolean;
  readonly defaultValue?: string;
}

export interface ComponentTypeDeclarationContract {
  readonly name: string;
  readonly declaration: string;
}

export interface ComponentContract {
  readonly name: string;
  readonly source: string;
  readonly props: readonly ComponentPropContract[];
  readonly slots: readonly string[];
  readonly typeDeclarations: readonly ComponentTypeDeclarationContract[];
}

export interface PublicApiContract {
  readonly schemaVersion: typeof publicApiSchemaVersion;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packageExports: readonly PackageExportLeaf[];
  readonly rootExports: readonly RootExportContract[];
  readonly components: readonly ComponentContract[];
  readonly tokens: readonly string[];
}

export type PublicApiChangeLevel = 'additive' | 'breaking';
export type ReleaseBump = 'patch' | 'minor' | 'major';

export interface PublicApiChange {
  readonly level: PublicApiChangeLevel;
  readonly area: 'component' | 'package-export' | 'root-export' | 'token';
  readonly message: string;
}

export interface PublicApiComparison {
  readonly level: 'none' | PublicApiChangeLevel;
  readonly changes: readonly PublicApiChange[];
}

export interface ReleaseIntent {
  readonly bump: ReleaseBump;
  readonly files: readonly string[];
}
