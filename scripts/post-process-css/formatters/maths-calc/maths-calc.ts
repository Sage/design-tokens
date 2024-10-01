import { BrandTokens } from "../../brand-tokens";
import { CssProperty } from "../../css-parser/css-parser.types";
import { getSymetricalDifference } from "../../helpers";
import { ScreenSizeTokens } from "../../screen-size-tokens";
import { Decorator } from "../decorator";

interface IPartConditions {
  hasClose?: boolean
  hasOpen?: boolean
  isLeft?: boolean
  isMath?: boolean
  isMiddle?: boolean
  isRight?: boolean
  part: string
}

interface IParIndices {
  close: number[]
  open: number[]
}

interface IValueSplit {
  parIndices: IParIndices,
  valueParts: string[]
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

      screenSize.global.forEach((token) => token.value = this.formatTokenValue(this.splitTokenValue(token.value)));
      screenSize.light.forEach((token) => token.value = this.formatTokenValue(this.splitTokenValue(token.value)));
      screenSize.dark.forEach((token) => token.value = this.formatTokenValue(this.splitTokenValue(token.value)));

      Object.keys(screenSize.components).forEach((component) => {
        if (screenSize.components[component]) {
          screenSize.components[component].forEach((token) => token.value = this.formatTokenValue(this.splitTokenValue(token.value)));
        }
      });
    })

    
    return super.formatTokens(tokens);
  }

  private formatTokenValue(valueSplit: IValueSplit): string {
    const {parIndices: { close, open }, valueParts} = valueSplit

    open.reverse().forEach((ind, i) => {
      const partArray: string[] = []

      const inner = valueParts.splice(ind, close[i])

      const conditions = this.checkConditions(inner)

      conditions.forEach((item) => {
        if (item.isLeft && !item.isMiddle) item.part = `calc(${item.part}`
        if (item.isRight && !item.isMiddle) item.part = `${item.part})`
        partArray.push(item.part)
      })

      if (ind) valueParts.splice(ind, 0, partArray.join(' '))
    })

    const valueConditions = this.checkConditions(valueParts)

    valueConditions.forEach((item, i) => {
      if (item.isLeft && !item.isMiddle) valueParts[i] = `calc(${item.part}`
      if (item.isRight && !item.isMiddle) valueParts[i] = `${item.part})`
    })

    return valueParts.join(' ')

  }

  private splitTokenValue(value: string): IValueSplit {
    const valueParts = value.split(' ');
    const parIndices: { close: number[], open: number[] } = {close: [], open: []}

    valueParts.forEach((part, i) => {
      if (part.indexOf('(') > -1) parIndices.open.push(i)
      if (part.indexOf(')') > -1) parIndices.close.push(i)
    });

    if (parIndices.close.length !== parIndices.open.length) {
      throw new Error(
        `The parenthesis in the token are not equal and the maths cannot be resolved`
      );
    }

    return {
      parIndices,
      valueParts
    }
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
        hasOpen: part.indexOf('(') > -1,
        hasClose: part.indexOf(')') > -1
      }

      partConditions.push(conditions)
    });

    return partConditions
  }

  
}