# Change Log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

# 0.2.1 - 2018-03-26

-   Fix: overwrite `middlewar`e if proxy is `String`.
-   Fix: callback call.

# 0.2.0 - 2017-06-20

-   Changed: minimum required `webpack` version is now `2.0.0`
-   Chore: support `webpack` version 3.

# 0.1.1 - 2017-06-07

-   Fixed: problems v4.

# 0.1.0 - 2017-04-13

-   Added: allow use plugin if `webpack-dev-middleware` or `webpack-hot-middleware` not installed.
-   Changed: rename `browserSyncOptions` to `browserSync`.
-   Changed: rename `devMiddlewareOptions` to `devMiddleware`.
-   Changed: rename `hotMiddlewareOptions` to `hotMiddleware`.
-   Changed: by default `ignoreInitial` is now `true`. 
-   Fixed: problem with resolve port when `browser-sync` and `webpack-dev-middleware` works together.

# 0.0.3 - 2017-03-13

-   Fixed: don't crush if `urls.local`, or `urls.external`, or `urls.ui`, or `urls.ui-external` 
    in `browser-sync` options are disabled.

# 0.0.2 - 2017-02-14

-   Fixed: exported `src` directory in `package.json`.

# 0.0.1 - 2017-02-14

-   Chore: initial public release.
