import { BrandTokens } from "../../brand-tokens";
import { Decorator } from "../decorator";

interface IPartConditions {
  isLeft: boolean
  isMath: boolean
  isMiddle: boolean
  isRight: boolean
  part: string
}

export class MathsCalc extends Decorator {
  private readonly mathChars = ['+', '-', '*', '/'];
  /**
   *
   * @param tokens Tokens to format.
   * @returns Formatted tokens.
   */
  public override formatTokens(tokens: BrandTokens) {

    tokens.screenSizes.forEach((screenSize) => {

      screenSize.global.forEach((token) => token.value = this.formatTokenValue(token.value));
      screenSize.light.forEach((token) => token.value = this.formatTokenValue(token.value));
      screenSize.dark.forEach((token) => token.value = this.formatTokenValue(token.value));

      Object.keys(screenSize.components).forEach((component) => {
        if (screenSize.components[component]) {
          screenSize.components[component].forEach((token) => token.value = this.formatTokenValue(token.value));
        }
      });
    })

    return super.formatTokens(tokens);
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
      const left = i > 0 ? valueParts[i - 1] : '';
      const right = valueParts[i + 1] ?? '';

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