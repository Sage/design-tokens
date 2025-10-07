import { CssProperty } from "../../css-parser/css-parser.types.js";

interface IPartConditions {
  isLeft: boolean
  isMath: boolean
  isMiddle: boolean
  isRight: boolean
  part: string
}

export class MathsCalc {
  private readonly mathChars = ['+', '-', '*', '/'];
  /**
   *
   * @param tokens Tokens to format.
   * @returns Formatted tokens.
   */
  public formatTokens(tokens: CssProperty[]) {

    tokens.forEach((token) => {
      token.value = this.formatTokenValue(token.value);
    })

    return tokens;
  }

  private formatTokenValue(value: string): string {
    const hasClamp = /clamp\s*\(.*\)/

    if (hasClamp.test(value)) return value

    const valueParts = value.split(' ');

    const valueConditions = this.checkConditions(valueParts)

    valueConditions.forEach((item, i) => {
      if (item.isLeft && !item.isMiddle) valueParts[i] = `calc(${item.part}`
      if (item.isRight && !item.isMiddle) valueParts[i] = `${item.part})`
    })

    return valueParts.join(' ')
  }

  private checkConditions(valueParts: string[]): IPartConditions[] {
    const partConditions: IPartConditions[] = []

    valueParts.forEach((part, i) => {
      const left: string = i ? valueParts[i - 1] ?? '' : '';
      const right: string = valueParts[i + 1] ?? '';

      const conditions = {
        part,
        isMath: this.mathChars.includes(part),
        isLeft: this.mathChars.includes(right),
        isRight: this.mathChars.includes(left),
        isMiddle: this.mathChars.includes(right) && this.mathChars.includes(left),
      }

      partConditions.push(conditions)
    });

    return partConditions
  }
}