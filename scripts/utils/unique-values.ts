/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

import { IGlyphData, IIcon } from "../icons.js"

/**
 * Function that selectsunique values of a given fild in whole collection.
 */

interface IUniqueValues {
  array: IIcon[] | IGlyphData[]
  mapFn: (item: IIcon | IGlyphData) => string | undefined
}

export const UniqueValues = ({array, mapFn}: IUniqueValues): (string | undefined)[] => array.map(mapFn).filter((value, index, self) => self.indexOf(value) === index)
