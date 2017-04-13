'use strict';

module.exports.desire = (dependency, fallback) => {
    try {
        require.resolve(dependency);
    } catch (error) { // eslint-disable-line no-unused-vars
        return fallback;
    }

    return require(dependency); // eslint-disable-line global-require, import/no-dynamic-require
};
