import { Box } from 'box-di';

class BoxDiAutoLoader {
  /**
   * @param {object} serviceConfig
   * @param {object=} box
   * @param {object=} logger
   */
  constructor(serviceConfig, box = Box, logger = console) {
    this._serviceConfig = serviceConfig;
    this._box = box;
    this._logger = logger;
    this._box.setLogger(this._logger);
  }

  /**
   * Loads all the services
   */
  load() {
    Object.entries(this._serviceConfig).forEach(([name, config]) => {
      try {
        this._logger.debug(`Auto loading ${name}`);
        // eslint-disable-next-line import/no-dynamic-require,global-require
        let service = require(config.path);
        service = service.default || service;

        if (service instanceof Function) {
          // check for a class
          if (service.name && service.prototype) {
            this._box.registerInvokable(name, service, config.dependencies);
          } else {
            // otherwise it is just a function, so ensure it loads in
            this._box.register(name, service, config.dependencies);
          }
        } else {
          // this is just a plain object/dependency that should be loaded
          this._box.register(name, () => service, config.dependencies);
        }
      } catch (error) {
        this._logger.error(`Failed to load ${name}`);
      }
    });
  }

  /**
   * @param {String} name
   * @returns {Object}
   * @public
   */
  get(name) {
    return this._box.get(name);
  }
}

export default BoxDiAutoLoader;
