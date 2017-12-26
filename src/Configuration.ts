import { ObjectMap, Injectable, Singleton, Token, Type } from 'tsioc';
import { symbols } from './util';
import { RequestMethod } from './core';
import { ServerOptions } from 'https';
// import { ServerOptions as Http2Options } from 'http2';


export interface ISessionConfig {
    /** (string) cookie key (default is koa:sess) */
    key: string;
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: number;
    /** (boolean) can overwrite or not (default true) */
    overwrite: boolean;
    /** (boolean) httpOnly or not (default true) */
    httpOnly: boolean;
    /** (boolean) signed or not (default true) */
    signed: boolean;
    /**
     *
     * @type {false}
     * @memberof ISessionConfig
     */
    rolling: boolean;
}

export interface IViewOptions {
    extension: string,
    map?: ObjectMap<any>;
}

/**
 * model options
 *
 * @export
 * @interface ModelOptions
 */
export interface ModelOptions {
    classMetaname: string;
    fieldMetaname: string;
}

export interface IConfiguration {

    routeUrlRegExp?: RegExp;
    isRouteUrl?(ctxUrl: string): boolean;

    /**
     * https server options.
     *
     * @type {ServerOptions}
     * @memberof IConfiguration
     */
    httpsOptions?: ServerOptions;

    /**
     * server hostname
     *
     * @type {string}
     * @memberof IConfiguration
     */
    hostname?: string;
    /**
     * server port.
     *
     * @type {number}
     * @memberof IConfiguration
     */
    port?: number;
    /**
     * system file root directory.
     */
    rootdir?: string;

    session?: ISessionConfig;

    /**
     * contents path of files, static files. default in 'public'
     *
     * @type {(string | string[])}
     * @memberof Configuration
     */
    contents?: string[];
    /**
     * web site base url path. route prefix.
     *
     * @type {string}
     * @memberOf Configuration
     */
    routePrefix?: string;
    /**
     * custom config key value setting.
     *
     * @type {IMap<any>}
     * @memberOf Configuration
     */
    setting?: ObjectMap<any>;

    /**
     * custom config connections.
     *
     * @type {ObjectMap<any>}
     * @memberof Configuration
     */
    connections?: ObjectMap<any>;

    /**
     * some middleware befor custom middleware to deal with http request.
     *
     * @type {Token<any>[]}
     * @memberof Configuration
     */
    beforeMiddlewares?: Token<any>[];

    /**
     * the router middleware.
     *
     * @type {Token<any>}
     * @memberof Configuration
     */
    routerMiddlewate?: Token<any>;

    /**
     * custom middleware match path, './middlewares/\*\*\/*{.js,.ts}' in your project.
     */
    middlewares?: string | string[];

    /**
     * some middleware after custom, router middleware to deal with http request.
     *
     * @type {Token<any>[]}
     * @memberof Configuration
     */
    afterMiddlewares?: Token<any>[];

    /**
     * exclude some middlewares
     *
     * @type {Token<any>[]}
     * @memberof Configuration
     */
    excludeMiddlewares?: Token<any>[];

    /**
     * use middlewars. if not config will load all.
     *
     * @type {Token<any>[]}
     * @memberof Configuration
     */
    useMiddlewares?: Token<any>[];


    /**
     * controllers match. default `./controllers/\*\*\/*{.js,.ts}` in your project..
     *
     * @type {(string | string[])}
     * @memberOf Configuration
     */
    controllers?: string | string[];

    /**
     * use controllers. if not config will load all.
     *
     * @type {Token<any>[]}
     * @memberof Configuration
     */
    useControllers?: Token<any>[];


    aop?: string | string[];

    usedAops?: Token<any>[];
    /**
     * views folder, default `./views` in your project.
     *
     * @memberof Configuration
     */
    views?: string;

    /**
     * render view options.
     *
     * @memberof Configuration
     */
    viewsOptions?: IViewOptions;


    modelOptions?: ModelOptions;

    /**
     * log config extentsion.
     *
     * @type {*}
     * @memberof Configuration
     */
    logConfig?: any;
}

export interface CorsOptions {
    credentials?: boolean;
    exposeHeaders?: string;
    keepHeadersOnError?: boolean;
    allowMethods?: string | (string | RequestMethod)[];

    allowHeaders?: string | string[];

    /**
     * for global default.
     *
     * @type {number}
     * @memberof CorsOptions
     */
    maxAge?: number;
}

/**
 * mvc configuration
 *
 * @export
 * @interface Configuration
 */
@Singleton
export class Configuration implements IConfiguration {
    constructor() {

    }

    routeUrlRegExp = /\/((\w|%|\.))+.\w+$/;
    isRouteUrl?(ctxUrl: string): boolean {
        return !this.routeUrlRegExp.test(ctxUrl);
    }
    port?= 3000;
    /**
     * system file root directory.
     */
    rootdir?= '';

    session?= {
        key: 'typemvc:sess', /** (string) cookie key (default is koa:sess) */
        /** (number || 'session') maxAge in ms (default is 1 days) */
        /** 'session' will result in a cookie that expires when session/browser is closed */
        /** Warning: If a session cookie is stolen, this cookie will never expire */
        maxAge: 86400000,
        overwrite: true, /** (boolean) can overwrite or not (default true) */
        httpOnly: true, /** (boolean) httpOnly or not (default true) */
        signed: true, /** (boolean) signed or not (default true) */
        rolling: false/** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
    };

    /**
     * contents path of files, static files. default in 'public'
     *
     * @type {(string | string[])}
     * @memberof Configuration
     */
    contents?: string[] = ['./public'];
    /**
     * web site base url path. route prefix.
     *
     * @type {string}
     * @memberOf Configuration
     */
    routePrefix?= '';
    /**
     * custom config key value setting.
     *
     * @type {IMap<any>}
     * @memberOf Configuration
     */
    setting?: ObjectMap<any> = {};

    /**
     * custom config connections.
     *
     * @type {ObjectMap<any>}
     * @memberof Configuration
     */
    connections?: ObjectMap<any> = {};

    /**
     * some middleware befor router middleware to deal with http request.
     *
     * @type {Token<any>[]}
     * @memberof Configuration
     */
    beforeMiddlewares?: Token<any>[] = [
        symbols.BodyParserMiddleware,
        symbols.JsonMiddleware,
        symbols.LogMiddleware,
        symbols.SessionMiddleware,
        symbols.ContentMiddleware,
        symbols.ContextMiddleware,
        symbols.CorsMiddleware,
        symbols.ViewsMiddleware

    ];

    /**
     * the router middleware.
     *
     * @type {Token<any>}
     * @memberof Configuration
     */
    routerMiddlewate?: Token<any> = symbols.RouterMiddleware;

    /**
     * custom middleware match path, './middlewares/\*\*\/*{.js,.ts}' in your project.
     */
    middlewares?: string | string[] = ['./middlewares/**/*{.js,.ts}'];

    /**
     * some middleware after router middleware to deal with http request.
     *
     * @type {Token<any>[]}
     * @memberof Configuration
     */
    afterMiddlewares?: Token<any>[] = [
    ];

    /**
     * exclude some middlewares
     *
     * @type {Token<any>[]}
     * @memberof Configuration
     */
    excludeMiddlewares?: Token<any>[] = [];

    /**
     * use middlewars. if not config will load all.
     *
     * @type {Token<any>[]}
     * @memberof Configuration
     */
    useMiddlewares?: Token<any>[] = [];


    /**
     * controllers match. default `./controllers/\*\*\/*{.js,.ts}` in your project..
     *
     * @type {(string | string[])}
     * @memberOf Configuration
     */
    controllers?: string | string[] = ['./controllers/**/*{.js,.ts}'];

    /**
     * use controllers. if not config will load all.
     *
     * @type {Token<any>[]}
     * @memberof Configuration
     */
    useControllers?: Token<any>[] = [];


    /**
     * custom aop services. default './aop/\*\*\/*{.js,.ts}'
     *
     * @type {(string | string[])}
     * @memberof Configuration
     */
    aop?: string | string[] = ['./aop/**/*{.js,.ts}'];

    /**
     * used aop
     *
     * @type {Token<any>[]}
     * @memberof Configuration
     */
    usedAops?: Token<any>[] = [];

    /**
     * views folder, default `./views` in your project.
     *
     * @memberof Configuration
     */
    views?= './views';

    /**
     * render view options.
     *
     * @memberof Configuration
     */
    viewsOptions?= {
        extension: 'ejs',
        map: { html: 'nunjucks' }
    };


    modelOptions?: ModelOptions = null;

    /**
     * log config extentsion.
     *
     * @type {*}
     * @memberof Configuration
     */
    logConfig?: any;

    /**
     * global cors default options.
     *
     * @type {CorsOptions}
     * @memberof Configuration
     */
    corsOptions?: CorsOptions;
}
