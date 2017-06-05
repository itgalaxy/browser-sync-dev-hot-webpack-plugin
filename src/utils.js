'use strict';

module.exports.desire = (dependency, fallback) => {
    try {
        require.resolve(dependency);
        // eslint-disable-next-line no-unused-vars
    } catch (error) {
        return fallback;
    }

    return require(dependency); // eslint-disable-line global-require, import/no-dynamic-require
};
