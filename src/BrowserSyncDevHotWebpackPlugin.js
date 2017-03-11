'use strict';

/* eslint-disable node/no-missing-require */
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const browserSync = require('browser-sync');
/* eslint-enable node/no-missing-require */
const merge = require('deepmerge');

class BrowserSyncDevHotWebpackPlugin {
    constructor(options) {
        this.watcher = null;
        this.compiler = null;
        this.options = merge.all([
            {
                browserSyncOptions: {},
                callback() {}, // eslint-disable-line no-empty-function
                devMiddlewareOptions: {
                    noInfo: true,
                    stats: false
                },
                hotMiddlewareOptions: {}
            },
            options
        ]);
    }

    apply(compiler) {
        if (this.options.disable) {
            return;
        }

        this.compiler = compiler;

        compiler.plugin('done', () => {
            if (!this.watcher) {
                this.watcher = browserSync.create();
                compiler.plugin('compilation', () => this.watcher.notify('Rebuilding...'));
                this.start();
            }
        });
    }

    start() {
        let browserSyncURLLocal = 'initialization';
        let browserSyncURLExternal = 'initialization';
        let browserSyncURLUI = 'initialization';
        let browserSyncURLUIExternal = 'initialization';
        const watcherConfig = merge.all([
            {
                proxy: {
                    middleware: this.middleware(),
                    proxyReq: [
                        (proxyReq) => {
                            if (browserSyncURLLocal) {
                                proxyReq.setHeader('X-Browser-Sync-URL-Local', browserSyncURLLocal);
                            }

                            if (browserSyncURLExternal) {
                                proxyReq.setHeader('X-Browser-Sync-URL-External', browserSyncURLExternal);
                            }

                            if (browserSyncURLUI) {
                                proxyReq.setHeader('X-Browser-Sync-URL-UI', browserSyncURLUI);
                            }

                            if (browserSyncURLUIExternal) {
                                proxyReq.setHeader('X-Browser-Sync-URL-UI-External', browserSyncURLUIExternal);
                            }

                            proxyReq.setHeader('X-Dev-Middleware', 'On');
                            proxyReq.setHeader('X-Hot-Middleware', 'On');
                        }
                    ]
                }
            },
            this.options.browserSyncOptions
        ]);

        this.watcher.init(watcherConfig, (error, bs) => {
            if (error) {
                throw error;
            }

            const URLs = bs.getOption('urls');

            browserSyncURLLocal = URLs.get('local');
            browserSyncURLExternal = URLs.get('external');
            browserSyncURLUI = URLs.get('ui');
            browserSyncURLUIExternal = URLs.get('ui-external');

            this.options.callback.bind(this);
        });
    }

    middleware() {
        const hotMiddlewareOptions = merge.all([
            {
                log: this.watcher.notify.bind(this.watcher)
            },
            this.options.hotMiddlewareOptions
        ]);

        this.webpackDevMiddleware = webpackDevMiddleware(this.compiler, this.options.devMiddlewareOptions);
        this.webpackHotMiddleware = webpackHotMiddleware(this.compiler, hotMiddlewareOptions);

        return [this.webpackDevMiddleware, this.webpackHotMiddleware];
    }
}

module.exports = BrowserSyncDevHotWebpackPlugin;
