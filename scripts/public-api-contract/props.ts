import {
  NodeFlags,
  SyntaxKind,
  getModifiers,
  isArrayLiteralExpression,
  isBindingElement,
  isCallExpression,
  isIdentifier,
  isInterfaceDeclaration,
  isIntersectionTypeNode,
  isMethodSignature,
  isObjectBindingPattern,
  isParenthesizedTypeNode,
  isPropertySignature,
  isStringLiteral,
  isTypeAliasDeclaration,
  isTypeLiteralNode,
  isTypeReferenceNode,
  isVariableStatement,
  type BindingElement,
  type Expression,
  type InterfaceDeclaration,
  type PropertyName,
  type SourceFile,
  type TypeAliasDeclaration,
  type TypeNode
} from 'typescript';
import { containsIdentifier, parseTs, printExpression, printNode, printType, unwrapExpression } from './ast';
import type { ComponentPropContract, ComponentTypeDeclarationContract } from './types';

interface Declarations {
  readonly interfaces: ReadonlyMap<string, InterfaceDeclaration>;
  readonly aliases: ReadonlyMap<string, TypeAliasDeclaration>;
}

interface BaseProp {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
}

export function parseComponentProps(script: string, label: string): {
  readonly props: readonly ComponentPropContract[];
  readonly typeDeclarations: readonly ComponentTypeDeclarationContract[];
} {
  const file = parseTs(`${label}.ts`, script);
  const declarations = collectDeclarations(file);
  const props = new Map<string, ComponentPropContract>();

  for (const statement of file.statements) {
    if (!isVariableStatement(statement)) continue;
    const exported = (getModifiers(statement) ?? []).some((item) => item.kind === SyntaxKind.ExportKeyword);
    const mutable = (statement.declarationList.flags & NodeFlags.Let) !== 0;

    if (exported && mutable) {
      for (const declaration of statement.declarationList.declarations) {
        if (!isIdentifier(declaration.name)) throw new Error(`${label} exported props must use identifiers.`);
        const initializer = declaration.initializer;
        addProp(props, {
          name: declaration.name.text,
          type: declaration.type ? printType(declaration.type, file) : initializer ? inferType(initializer, file) : 'unknown',
          required: initializer === undefined,
          bindable: false,
          ...(initializer ? { defaultValue: printExpression(initializer, file) } : {})
        }, label);
      }
    }

    for (const declaration of statement.declarationList.declarations) {
      if (!isObjectBindingPattern(declaration.name)) continue;
      const call = propsCall(declaration.initializer);
      if (!call) continue;
      const type = declaration.type ?? call.typeArguments?.[0];
      if (!type) throw new Error(`${label} $props() destructuring needs an explicit props type.`);
      const defaults = bindingDefaults(declaration.name.elements, file, label);
      for (const prop of resolveType(type, file, declarations, new Set())) {
        const value = defaults.get(prop.name);
        addProp(props, {
          ...prop,
          bindable: value?.bindable ?? false,
          ...(value ? { defaultValue: value.value } : {})
        }, label);
      }
      for (const name of defaults.keys()) {
        if (!props.has(name)) throw new Error(`${label} destructures ${name}, but its props type does not declare it.`);
      }
    }
  }

  const sorted = [...props.values()].sort(byName);
  return { props: sorted, typeDeclarations: supportingTypes(sorted, declarations, file) };
}

function collectDeclarations(file: SourceFile): Declarations {
  const interfaces = new Map<string, InterfaceDeclaration>();
  const aliases = new Map<string, TypeAliasDeclaration>();
  for (const statement of file.statements) {
    if (isInterfaceDeclaration(statement)) interfaces.set(statement.name.text, statement);
    else if (isTypeAliasDeclaration(statement)) aliases.set(statement.name.text, statement);
  }
  return { interfaces, aliases };
}

function resolveType(
  node: TypeNode,
  file: SourceFile,
  declarations: Declarations,
  resolving: Set<string>
): readonly BaseProp[] {
  if (isParenthesizedTypeNode(node)) return resolveType(node.type, file, declarations, resolving);
  if (isIntersectionTypeNode(node)) {
    return mergeProps(node.types.flatMap((item) => resolveType(item, file, declarations, resolving)), file.fileName);
  }
  if (isTypeLiteralNode(node)) return membersToProps(node.members, file);
  if (!isTypeReferenceNode(node) || !isIdentifier(node.typeName)) {
    throw new Error(`${file.fileName} $props() type must be a local interface, alias, or object type.`);
  }
  return resolveName(node.typeName.text, file, declarations, resolving);
}

function resolveName(
  name: string,
  file: SourceFile,
  declarations: Declarations,
  resolving: Set<string>
): readonly BaseProp[] {
  if (resolving.has(name)) throw new Error(`${file.fileName} has a circular props type through ${name}.`);
  resolving.add(name);
  try {
    const declaration = declarations.interfaces.get(name);
    if (declaration) {
      const inherited = declaration.heritageClauses?.flatMap((clause) => clause.types.flatMap((item) => {
        if (!isIdentifier(item.expression)) throw new Error(`${file.fileName} props may only extend local named interfaces.`);
        return resolveName(item.expression.text, file, declarations, resolving);
      })) ?? [];
      return mergeProps([...inherited, ...membersToProps(declaration.members, file)], file.fileName);
    }
    const alias = declarations.aliases.get(name);
    if (alias) return resolveType(alias.type, file, declarations, resolving);
    throw new Error(`${file.fileName} cannot resolve local props type ${name}.`);
  } finally {
    resolving.delete(name);
  }
}

function membersToProps(members: readonly import('typescript').TypeElement[], file: SourceFile): readonly BaseProp[] {
  const props: BaseProp[] = [];
  for (const member of members) {
    if (isPropertySignature(member)) {
      props.push({
        name: propertyName(member.name, file),
        type: member.type ? printType(member.type, file) : 'unknown',
        required: member.questionToken === undefined
      });
      continue;
    }
    if (isMethodSignature(member)) {
      const generics = member.typeParameters?.map((item) => printNode(item, file)).join(', ');
      const parameters = member.parameters.map((item) => printNode(item, file)).join(', ');
      props.push({
        name: propertyName(member.name, file),
        type: `${generics ? `<${generics}>` : ''}(${parameters})=>${member.type ? printType(member.type, file) : 'void'}`,
        required: member.questionToken === undefined
      });
      continue;
    }
    throw new Error(`${file.fileName} props contain unsupported ${SyntaxKind[member.kind]}.`);
  }
  return props;
}

function bindingDefaults(
  elements: readonly BindingElement[],
  file: SourceFile,
  label: string
): ReadonlyMap<string, { readonly value: string; readonly bindable: boolean }> {
  const result = new Map<string, { readonly value: string; readonly bindable: boolean }>();
  for (const element of elements) {
    if (!isBindingElement(element) || element.dotDotDotToken || !isIdentifier(element.name)) {
      throw new Error(`${label} $props() destructuring must use identifier bindings without rest.`);
    }
    const name = element.propertyName ? propertyName(element.propertyName, file) : element.name.text;
    if (element.initializer) {
      const expression = unwrapExpression(element.initializer);
      result.set(name, {
        value: printExpression(element.initializer, file),
        bindable: isCallExpression(expression) && isIdentifier(expression.expression) && expression.expression.text === '$bindable'
      });
    }
  }
  return result;
}

function propsCall(expression: Expression | undefined): import('typescript').CallExpression | null {
  if (!expression) return null;
  const value = unwrapExpression(expression);
  return isCallExpression(value) && isIdentifier(value.expression) && value.expression.text === '$props' ? value : null;
}

function supportingTypes(
  props: readonly ComponentPropContract[],
  declarations: Declarations,
  file: SourceFile
): readonly ComponentTypeDeclarationContract[] {
  const texts = new Map<string, string>();
  for (const [name, declaration] of declarations.interfaces) {
    if (name !== 'Props') texts.set(name, printNode(declaration, file));
  }
  for (const [name, declaration] of declarations.aliases) {
    if (name !== 'Props') texts.set(name, printNode(declaration, file));
  }
  const selected = new Set<string>();
  const pending: string[] = [];
  for (const prop of props) {
    for (const name of texts.keys()) {
      if (containsIdentifier(prop.type, name) && !selected.has(name)) {
        selected.add(name);
        pending.push(name);
      }
    }
  }
  while (pending.length) {
    const declaration = texts.get(pending.pop() ?? '');
    if (!declaration) continue;
    for (const name of texts.keys()) {
      if (!selected.has(name) && containsIdentifier(declaration, name)) {
        selected.add(name);
        pending.push(name);
      }
    }
  }
  return [...selected].sort().map((name) => ({ name, declaration: texts.get(name) ?? '' }));
}

function inferType(initializer: Expression, file: SourceFile): string {
  const value = unwrapExpression(initializer);
  if (isStringLiteral(value)) return 'string';
  if (value.kind === SyntaxKind.TrueKeyword || value.kind === SyntaxKind.FalseKeyword) return 'boolean';
  if (value.kind === SyntaxKind.NullKeyword) return 'null';
  if (value.kind === SyntaxKind.NumericLiteral) return 'number';
  if (isArrayLiteralExpression(value)) return 'readonly unknown[]';
  return `typeof ${printExpression(value, file)}`;
}

function propertyName(name: PropertyName, file: SourceFile): string {
  if (isIdentifier(name) || isStringLiteral(name)) return name.text;
  throw new Error(`${file.fileName} props need identifier or string-literal property names.`);
}

function addProp(map: Map<string, ComponentPropContract>, prop: ComponentPropContract, label: string): void {
  if (map.has(prop.name)) throw new Error(`${label} declares prop ${prop.name} more than once.`);
  map.set(prop.name, prop);
}

function mergeProps(props: readonly BaseProp[], label: string): readonly BaseProp[] {
  const map = new Map<string, BaseProp>();
  for (const prop of props) {
    const previous = map.get(prop.name);
    if (previous && (previous.type !== prop.type || previous.required !== prop.required)) {
      throw new Error(`${label} inherits incompatible definitions for prop ${prop.name}.`);
    }
    map.set(prop.name, prop);
  }
  return [...map.values()];
}

function byName(a: { readonly name: string }, b: { readonly name: string }): number {
  return a.name.localeCompare(b.name);
}
