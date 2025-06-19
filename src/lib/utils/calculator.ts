import Big from "big.js";

export class Calculator {
  static toBig(value: string | number): Big {
    return new Big(value);
  }

  static abs(value: string | number): string {
    return Calculator.toBig(value).abs().toString();
  }

  static equals(a: string | number, b: string | number): boolean {
    return Calculator.toBig(a).eq(Calculator.toBig(b));
  }

  static plus(a: string | number, b: string | number): string {
    return Calculator.toBig(a).plus(Calculator.toBig(b)).toString();
  }

  static minus(a: string | number, b: string | number): string {
    return Calculator.toBig(a).minus(Calculator.toBig(b)).toString();
  }

  static times(a: string | number, b: string | number): string {
    return Calculator.toBig(a).times(Calculator.toBig(b)).toString();
  }
}
