const { MedusaApp } = require("@medusajs/framework/modules-sdk");
const fs = require('fs');

async function test() {
  try {
    const cwd = "c:/Users/kundai/Desktop/projects/my-medusa-store/apps/backend";
    process.chdir(cwd);
    const { ContainerRegistrationKeys, remoteQueryObjectFromString } = require("@medusajs/framework/utils");
    
    // Let's test using http request if backend is started, or we can check with fetch
    console.log("Testing...");
  } catch (err) {
    console.error(err);
  }
}
test();

