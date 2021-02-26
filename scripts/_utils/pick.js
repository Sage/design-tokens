/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

/**
 * Strips all properties from an object except those that are in the allowdList
 * not recursive
 *
 * @param {Object} input - The input object to "pick from"
 * @param {String[]} allowedList - The list of allowed properties
 *
 * @returns {Object}
 */
function pick (input, allowedList = []) {
  return Object.assign(
    {},
    ...allowedList.map((key) => ({ [key]: input[key] }))
  )
}

module.exports = pick
