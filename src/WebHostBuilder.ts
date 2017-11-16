import * as Koa from 'koa';
import * as chalk from 'chalk';
import { existsSync } from 'fs';
import { Middleware, Request, Response, Context } from 'koa';
import { MvcContext } from './MvcContext';
import { Configuration } from './Configuration';
import { Defer, createDefer, MvcMiddleware, AsyncMiddleware, MiddlewareFactory, Type } from './util';
import { IContainer } from 'type-autofac';
import * as path from 'path';
import * as _ from 'lodash';

const serveStatic = require('koa-static');
const convert = require('koa-convert');


/**
 * WebHostBuilder
 *
 * @export
 * @class WebHostBuilder
 */
export class WebHostBuilder {
    private startup: Defer<Koa>;
    private container: Defer<IContainer>;
    private middlewares: MvcMiddleware[];
    private configuration: Defer<Configuration>;

    /**
     * Creates an instance of WebHostBuilder.
     * @param rootdir
     * @param [app]
     */
    constructor(private rootdir: string, protected app?: Koa) {
        this.middlewares = [this.createMvcMiddleware()];
        this.configuration = createDefer<Configuration>();
        this.app = this.app || new Koa();
    }

    /**
     * user custom IContainer.
     *
     * @param {(IContainer | Promise<IContainer>)} [injector]
     * @returns
     *
     * @memberOf WebHostBuilder
     */
    useContainer(injector?: IContainer | Promise<IContainer>) {
        if (this.container) {
            this.container = createDefer<IContainer>();
        }
        this.container.resolve(injector || IContainer.instance);
        return this;
    }


    /**
     * use custom configuration.
     *
     * @param {(string | Configuration)} [config]
     * @returns {WebHostBuilder}
     *
     * @memberOf WebHostBuilder
     */
    useConfiguration(config?: string | Configuration): WebHostBuilder {
        let excfg: Configuration;
        if (typeof config === 'string') {
            if (existsSync(config)) {
                excfg = require(config) as Configuration;
            } else {
                console.log(`config file: ${config} not exists.`)
            }
        } else if (config) {
            excfg = config;
        } else {
            let cfgpath = path.join(this.rootdir, './config');
            let config: Configuration;
            ['.js', '.json'].forEach(ext => {
                if (config) {
                    return false;
                }
                if (existsSync(cfgpath + ext)) {
                    config = require(cfgpath + ext) as Configuration;
                    return false;
                }
                return true;
            });
            if (!config) {
                config = {};
                console.log(chalk.yellow('your app has not config file.'));
            }
            this.configuration.resolve(_.extend(new Configuration(), config));
        }

        if (excfg) {
            this.configuration.promise = this.configuration.promise
                .then(cfg => {
                    cfg = _.extend({}, cfg || {}, excfg || {});
                    return cfg;
                });
        }

        return this;
    }

    get config(): Promise<Configuration> {
        return this.configuration.promise;
    }

    /**
     * use middleware `fn` or  `MiddlewareFactory`.
     * @param {MvcMiddleware} middleware
     * @returns {WebHostBuilder}
     * @memberOf WebHostBuilder
     */
    use(middleware: MvcMiddleware): WebHostBuilder {
        this.middlewares.push(middleware);
        return this;
    }

    /**
     * user static files.
     *
     * @param {(string | string[])} paths
     * @returns {WebHostBuilder}
     *
     * @memberOf WebHostBuilder
     */
    useStatic(paths: string | string[]): WebHostBuilder {
        let ps = (typeof paths === 'string') ? [paths] : paths;
        ps.forEach(p => {
            let mid = convert(serveStatic(path.join(this.rootdir, p))) as Middleware;
            this.middlewares.push(mid);
        });

        return this;
    }

    /**
     * build application.
     * @returns {WebHostBuilder}
     * @memberOf WebHostBuilder
     */
    build(): WebHostBuilder {
        this.startup = createDefer<Koa>();
        this.useConfiguration();
        if (!this.container) {
            this.useContainer();
        }
        let cfg: Configuration;
        let injector: IContainer;
        Promise.all([this.config, this.container.promise])
            .then(data => {
                cfg = data[0];
                injector = data[1];
                return this.initIContainer(cfg, injector);
            })
            .then(() => this.setupMiddwares(cfg, injector))
            .then(() => this.loadController(cfg, injector))
            .then(this.startup.resolve)
            .catch(this.startup.reject);

        return this;
    }

    /**
     * run service.
     * @returns {Koa}
     * @memberOf WebHostBuilder
     */
    async run() {
        if (!this.startup) {
            this.build();
        }
        let app = await this.startup.promise;
        let config = await this.configuration.promise;
        app.listen(config.port || this.app.env['port']);
        return app;
    }

    /**
     * create mvc middleware.
     */
    protected createMvcMiddleware() {
        return async (ctx: MvcContext, next) => {
            ctx.injector = await this.container.promise;
            await next();
        }
    }

    protected async initIContainer(config: Configuration, injector: IContainer): Promise<IContainer> {
        injector.registerSingleton(Configuration, config);
        return injector;
    }

    protected async loadController(config: Configuration, injector: IContainer): Promise<Koa> {
        return this.app;
    }

    protected async setupMiddwares(config: Configuration, injector: IContainer): Promise<Koa> {
        let middlewares = await Promise.all(this.middlewares.map(m => {
            if (m && _.isFunction(m['createMiddleware'])) {
                return Promise.resolve(m['createMiddleware'](config, injector) as AsyncMiddleware)
            } else {
                return Promise.resolve(m as AsyncMiddleware)
            }
        }));
        middlewares.forEach(m => {
            this.app.use(m);
        });
        return this.app;
    }
}