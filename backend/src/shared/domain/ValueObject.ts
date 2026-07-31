export abstract class ValueObject {
  protected abstract equals(other: this): boolean;
}
