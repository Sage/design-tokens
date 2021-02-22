/*
Copyright 2021
The Sage Group plc.
 */
function pick (input, allowedList = []) {
  return Object.assign(
    {},
    ...allowedList.map((key) => ({ [key]: input[key] }))
  )
}

module.exports = pick
