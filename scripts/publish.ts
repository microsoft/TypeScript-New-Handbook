import path = require('path');
import fs = require('fs-extra');
import * as site from "./site";

const home = path.join(__dirname, "..");
const staging = path.join(home, "docs-staging");
const prod = path.join(home, "docs");

async function go() {
    const instance = await site.create();

    await fs.mkdirp(staging);
    await fs.mkdirp(prod);

    console.log(`Clearing staging area ${staging}`);
    await fs.remove(staging);
    console.log(`Writing to staging ${staging}`);
    const { errors, warnings } = await instance.publish(staging);

    if (errors.length + warnings.length === 0) {
        console.log(`Succeeded, deleting ${prod}`);
        await fs.remove(prod);
        console.log(`${staging} -> ${prod}`);
        await fs.rename(staging, prod);
    } else {
        for (const w of warnings) {
            console.warn(`${w.serverPath}: ${w.message}`);
        }
        for (const e of errors) {
            console.error(`${e.serverPath}: ${e.message}`);
        }
    }
}

go().then(() => {
    console.log("Done!");
    process.exit(0);
});
