const path = require('path');
const fs = require('fs-extra');
const pick = require('./_utils/pick');

async function copyAssets() {
    try {
        await fs.copy(
            path.resolve(__dirname, '../assets'),
            path.resolve(__dirname, '../dist/assets')
        );
    } catch (err) {
        console.log(`Error copying assets to dist`);
        console.log(err);
    };
}

async function copyCommon() {
    try {
        await fs.copy(
            path.resolve(__dirname, '../common'),
            path.resolve(__dirname, '../dist/common')
        )
    } catch (err) {
        console.log(`Error copying common to dist`);
        console.log(err);
    }
}
        
async function copyPackageJSON() {
    try {
        const packageDef = await fs.readJson(path.resolve(__dirname, '../package.json'));
        const filteredPackageDef = pick(
            packageDef,
            ['name', 'dependencies', 'repository', 'private', 'description', 'author', 'version', 'peerDependencies']
        );
        await fs.writeJson(
            path.resolve(__dirname, '../dist/package.json'),
            filteredPackageDef,
            {
                spaces: 4 
            }
        );
    } catch (err) {
        console.log(`Error copying package.json`);
        console.log(err);
    }
}

async function main() {
    await Promise.all([
        copyAssets(),
        copyCommon(),
        copyPackageJSON()
    ]);
}

main();