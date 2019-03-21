import path = require('path');
import fs = require('fs-extra');
import * as site from "./site";

const home = path.join(__dirname, "..");
const staging = path.join(home, "docs-staging");
const prod = path.join(home, "docs");

async function go() {
    const instance = site.create();

    await fs.mkdirp(staging);
    await fs.mkdirp(prod);

    console.log(`Clearing staging area ${staging}`);
    await fs.rmdir(staging);
    console.log(`Writing to staging ${staging}`);
    await instance.publish(staging);
    console.log(`Succeeded, deleting ${prod}`);
    await fs.rmdir(prod);
    console.log(`${staging} -> ${prod}`);
    await fs.rename(staging, prod);
}

go().then(() => {
    console.log("Done!");
});
