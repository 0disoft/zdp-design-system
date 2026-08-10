import type { ZdpCommandFieldType } from '../../src/lib/command';
import type { ZdpInputType } from '../../src/lib/input';

type Assert<T extends true> = T;
type AssertFalse<T extends false> = T;
type IsAssignable<Value, Target> = Value extends Target ? true : false;

export type InputAcceptsValueBasedTypes = Assert<
  IsAssignable<'text' | 'email' | 'number' | 'datetime-local', ZdpInputType>
>;
export type InputRejectsCheckedStateTypes = AssertFalse<
  IsAssignable<'checkbox' | 'radio', ZdpInputType>
>;
export type InputRejectsBrowserOwnedValueTypes = AssertFalse<
  IsAssignable<'file' | 'hidden' | 'range' | 'color', ZdpInputType>
>;
export type CommandFieldAcceptsTextSearchTypes = Assert<
  IsAssignable<'search' | 'text', ZdpCommandFieldType>
>;
export type CommandFieldRejectsNonSearchTypes = AssertFalse<
  IsAssignable<'checkbox' | 'file' | 'number' | 'password', ZdpCommandFieldType>
>;
