"use strict";

/* eslint-disable no-sync */
const EventEmitter = require("events");
const browserSync = require("browser-sync");
const merge = require("deepmerge");
// eslint-disable-next-line prefer-destructuring
const desire = require("./utils").desire;

const webpackDevMiddleware = desire("webpack-dev-middleware");
const webpackHotMiddleware = desire("webpack-hot-middleware");

class BrowserSyncDevHotWebpackPlugin extends EventEmitter {
    constructor(options) {
        super();

        this.compiler = null;
        this.middleware = [];
        this.watcher = browserSync.create();
        this.options = merge.all([
            {
                browserSync: {},
                callback() {}, // eslint-disable-line no-empty-function
                devMiddleware: {
                    noInfo: true,
                    stats: false
                },
                hotMiddleware: {}
            },
            options
        ]);
    }

    registerEvents() {
        this.on("webpack.compilation", () =>
            this.watcher.notify("Rebuilding...")
        );
        this.once("webpack.done", this.start.bind(this));
    }

    apply(compiler) {
        if (this.options.disable) {
            return;
        }

        this.registerEvents();
        this.compiler = compiler;

        compiler.plugin(
            "compilation",
            this.emit.bind(this, "webpack.compilation")
        );
        compiler.plugin("done", this.emit.bind(this, "webpack.done"));
    }

    setupWebpackDevMiddleware() {
        this.webpackDevMiddleware = webpackDevMiddleware(
            this.compiler,
            merge.all([
                {
                    publicPath:
                        this.options.publicPath ||
                        this.compiler.options.output.publicPath
                },
                this.compiler.options.devServer || {},
                this.options.devMiddleware
            ])
        );

        this.middleware.push(this.webpackDevMiddleware);
    }

    setupWebpackHotMiddleware() {
        this.webpackHotMiddleware = webpackHotMiddleware(
            this.compiler,
            merge.all([
                {
                    log: this.watcher.notify.bind(this.watcher)
                },
                this.options.hotMiddleware
            ])
        );

        this.middleware.push(this.webpackHotMiddleware);
    }

    config() {
        this.browserSyncURLLocal = null;
        this.browserSyncURLExternal = null;
        this.browserSyncURLUI = null;
        this.browserSyncURLUIExternal = null;

        if (
            this.options.browserSync &&
            typeof this.options.browserSync.proxy === "string"
        ) {
            const target = this.options.browserSync.proxy;

            this.options.browserSync.proxy = { target };
        }

        this.options.browserSync = merge.all([
            {
                proxy: {
                    middleware: this.middleware,
                    proxyReq: [
                        proxyReq => {
                            if (this.browserSyncURLLocal) {
                                proxyReq.setHeader(
                                    "X-Browser-Sync-URL-Local",
                                    this.browserSyncURLLocal
                                );
                            }

                            if (this.browserSyncURLExternal) {
                                proxyReq.setHeader(
                                    "X-Browser-Sync-URL-External",
                                    this.browserSyncURLExternal
                                );
                            }

                            if (this.browserSyncURLUI) {
                                proxyReq.setHeader(
                                    "X-Browser-Sync-URL-UI",
                                    this.browserSyncURLUI
                                );
                            }

                            if (this.browserSyncURLUIExternal) {
                                proxyReq.setHeader(
                                    "X-Browser-Sync-URL-UI-External",
                                    this.browserSyncURLUIExternal
                                );
                            }

                            if (webpackDevMiddleware) {
                                proxyReq.setHeader("X-Dev-Middleware", "On");
                            }

                            if (webpackHotMiddleware) {
                                proxyReq.setHeader("X-Hot-Middleware", "On");
                            }
                        }
                    ]
                },
                watchOptions: {
                    ignoreInitial: true
                }
            },
            this.options.browserSync
        ]);
    }

    setup() {
        if (webpackDevMiddleware) {
            this.setupWebpackDevMiddleware();
        }

        if (webpackHotMiddleware) {
            this.setupWebpackHotMiddleware();
        }

        this.config();
    }

    start() {
        this.setup();

        process.nextTick(() => {
            this.watcher.init(this.options.browserSync, (error, bs) => {
                if (error) {
                    throw error;
                }

                const URLs = bs.getOption("urls");

                this.browserSyncURLLocal = URLs.get("local");
                this.browserSyncURLExternal = URLs.get("external");
                this.browserSyncURLUI = URLs.get("ui");
                this.browserSyncURLUIExternal = URLs.get("ui-external");

                this.options.callback.call(this);
            });
        });
    }
}

module.exports = BrowserSyncDevHotWebpackPlugin;
