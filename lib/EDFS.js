function EDFS(brickTransportStrategyName) {
    const RawCSB = require("./RawCSB");
    const barModule = require("bar");
    const fsAdapter = require("bar-fs-adapter");

    this.createCSB = (callback) => {
        const rawCSB = new RawCSB(brickTransportStrategyName);
        rawCSB.start(err => callback(err, rawCSB));
    };

    this.createBar = () => {
        return barModule.createArchive(createArchiveConfig());
    };

    this.loadCSB = (seed, callback) => {

    };

    this.loadBar = (seed) => {
        return barModule.createArchive(createArchiveConfig(seed));
    };

    function createArchiveConfig(seed) {
        const ArchiveConfigurator = barModule.ArchiveConfigurator;
        const brickTransportStrategy = $$.brickTransportStrategiesRegistry.get(brickTransportStrategyName);
        ArchiveConfigurator.prototype.registerFsAdapter("FsAdapter", fsAdapter.createFsAdapter);
        ArchiveConfigurator.prototype.registerStorageProvider("EDFSBrickStorage", require("edfs-brick-storage").create);
        const archiveConfigurator = new ArchiveConfigurator();
        archiveConfigurator.setFsAdapter("FsAdapter");
        archiveConfigurator.setStorageProvider("EDFSBrickStorage", brickTransportStrategyName);
        archiveConfigurator.setBufferSize(65535);
        archiveConfigurator.setEncryptionAlgorithm("aes-256-gcm");

        if (seed) {
            archiveConfigurator.setSeed(seed);
        }else{
            archiveConfigurator.setSeedEndpoint(brickTransportStrategy.getLocator())
        }

        return archiveConfigurator;
    }
}

module.exports = EDFS;