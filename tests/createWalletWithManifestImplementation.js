require("../../../psknode/bundles/testsRuntime");
const tir = require("../../../psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;
const constants = require("../moduleConstants").CSB;
let edfs;

const fileName = "testFile";
const fileContent = "lorem ipsum";

function getTemplateDossierSeed(callback) {
    edfs.createRawDossier((err, dossierHandler) => {
        if (err) {
            return callback(err);
        }
        dossierHandler.writeFile(constants.CONSTITUTION_FOLDER + "/" + fileName, fileContent, 0, (err => callback(err, dossierHandler.getSeed())));
    });
}

assert.callback("Create wallet with manifest implementation", (finishTest) => {
    dc.createTestFolder("mount", (err, folder) => {
        if (err) {
            throw err;
        }

        tir.launchVirtualMQNode(10, folder, (err, port) => {
            if (err) {
                throw err;
            }


            edfs = require("../index").attachToEndpoint(`http://localhost:${port}`);
            getTemplateDossierSeed((err, seed) => {
                if (err) {
                    throw err;
                }

                edfs.createWallet(seed, undefined, false, (err, walletSeed) => {
                    if (err) {
                        throw err;
                    }

                    edfs.loadWallet(walletSeed, undefined, false, (err, walletHandler) => {
                        if (err) {
                            throw err;
                        }

                        walletHandler.readFile(constants.MANIFEST_FILE, (err, manifestContent) => {
                            if (err) {
                                throw err;
                            }
                            const manifest = JSON.parse(manifestContent.toString());
                            assert.true(manifest.mounts.length !== 0);

                            walletHandler.readFile("/" + constants.CONSTITUTION_FOLDER + "/" + fileName, (err, content) => {
                                if (err) {
                                    throw err;
                                }

                                assert.true(content.toString() === fileContent);

                                finishTest();
                            });
                        });
                    })
                });
            });
        });
    })
}, 5000);
