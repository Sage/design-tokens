# Contribution Guidelines

Welcome to our contribution guidelines

We're happy you want to contribute to the project, this guide will aim to give you the necessary information to do so adhering to the process and making the task as simple as possible.

## Please no editing the data files directly

Please note that while we welcome any suggestions for making a change to the design tokens themselves, we will not be accepting any pull requests that alter the contents of the data folder. The contents of data is automatically generated from the design files that act as the source of truth for this library.

Please open an issue if you would like to suggest a change to these values so that we can review it and pass it on to the design system team.

## Development 

Instructions for developing with this package locally

### Prerequisites

You will need to have node and npm installed on your system.

It is recommended that you also install these npm libraries globally:
```bash
npm install --global style-dictionary less sass
```

### Build

To build this package, run this command:

```bash
npm run build
```

To run the individual builds, such as the web bundle, run this command:
```bash
npm run build:web
```

## Publishing

This library is published via github actions. After approval has been given an admin can trigger a publish process

## Contributions from outside of Sage

If you're from outside of Sage then you are welcome to contribute to this package. Please make pull requests using the [Fork & Pull Request Workflow](https://gist.github.com/Chaser324/ce0505fbed06b947d962). 

Please be aware that Sage Group Plc. retains the intellectual property rights of this library. If Sage Group decides to change the licence of this library, or make any change that would otherwise infringe on contributors rights, we will make efforts to contact all contributors to inform them of this change three weeks prior to it coming into effect.