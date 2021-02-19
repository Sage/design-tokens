
function pick (input, allowedList) {
  // Taken from: https://gist.github.com/bisubus/2da8af7e801ffd813fab7ac221aa7afc
  return Object.keys(input)
    .filter((key) => allowedList.indexOf(key) >= 0)
    .reduce((newObj, key) => Object.assign(newObj, { [key]: input[key] }), {})
}

module.exports = pick
