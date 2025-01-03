/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

import Figma from 'figma-js'

/**
 * Callback function for collect util.
 */

/**
 * Recursively selects nodes of object. It preserves node if callback returns true and rejects if callback returns false.
 */

interface ICollect {
  object: Figma.Node
  callback: (node: Figma.Node) => boolean
}

export const Collect = ({object, callback}: ICollect): Figma.Node[] => {
  const output: Figma.Node[] = []

  const walk = (walkObject: Figma.Node) => {
    if (callback(walkObject)) {
      output.push(walkObject)
      return
    }

    if (Array.isArray(walkObject)) {
      walkObject.forEach((childObj: Figma.Node) => walk(childObj))
      return
    }

    if (walkObject instanceof Object) {
      Object.values(walkObject).forEach((childObj) => walk(childObj))
    }
  }

  walk(object)
  return output
}
