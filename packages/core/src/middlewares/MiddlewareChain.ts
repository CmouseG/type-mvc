import { Singleton, InjectToken, Token, IContainer, Inject, ContainerToken, Providers, MapSet, isClass, isToken, getTypeMetadata, lang } from '@ts-ioc/core';
import { IConfiguration } from '../IConfiguration';
import { OrderMiddleware, MiddlewareType, InjectMiddlewareToken, IMiddleware, Middlewares, DefaultMiddlewawres } from './IMiddleware';
import { MiddlewareMetadata } from '../metadata';
import { isFunction, isString } from 'util';
import { Middleware } from '../decorators';



export interface IMiddlewareChain {

    container: IContainer;

    /**
     * get middleware chain.
     *
     * @returns {Token<IMiddleware>[]}
     * @memberof IMiddlewareChain
     */
    getChain(): Token<IMiddleware>[];

    /**
     * get middleware instance.
     *
     * @param {string} name middleware name.
     * @param {...Providers[]} providers
     * @returns {IMiddleware}
     * @memberof IMiddlewareChain
     */
    resolve(name: string, ...providers: Providers[]): IMiddleware;

    /**
     * use middleware
     *
     * @param {...MiddlewareType[]} middleware
     * @returns {this}
     * @memberof IMiddlewareChain
     */
    use(...middleware: MiddlewareType[]): this;

    /**
     * use middleware setup before one middleware.
     *
     * @param {MiddlewareType} middleware
     * @param {MiddlewareType} [match]
     * @returns {this}
     * @memberof IMiddlewareChain
     */
    useBefore(middleware: MiddlewareType, match?: MiddlewareType): this;

    /**
     * use middleware setup after one middleware.
     *
     * @param {MiddlewareType} middleware
     * @param {MiddlewareType} [match]
     * @returns {this}
     * @memberof IMiddlewareChain
     */
    useAfter(middleware: MiddlewareType, match?: MiddlewareType): this;
}

export const MiddlewareChainToken = new InjectToken<IMiddlewareChain>('middleware_chain')



@Singleton(MiddlewareChainToken)
export class MiddlewareChain implements IMiddlewareChain {

    @Inject(ContainerToken)
    container: IContainer;

    protected orders: OrderMiddleware[];
    constructor() {
        this.orders = this.getDefault();
    }

    getChain(): Token<IMiddleware>[] {
        return this.orders.map(mdl => mdl.middleware);
    }

    resolve(name: string, ...providers: Providers[]): IMiddleware {
        return this.container.resolve(new InjectMiddlewareToken(name), ...providers);
    }

    protected useLast: string;

    use(...middleware: MiddlewareType[]) {
        middleware.forEach(mdl => {
            if (isToken(mdl)) {
                this.insert(mdl);
            } else if (isFunction(mdl)) {
                this.orders.push({ middleware: mdl });

            }
        });
        return this;
    }

    insert(middleware: Token<IMiddleware>, chain?: OrderMiddleware[]) {
        if (isClass(middleware) && !this.container.has(middleware)) {
            this.container.register(middleware);
        }

        let meta = this.getMiddlewareMeta(Middleware);
        if (meta) {
            this.insertByMeta(meta, middleware, chain);
        }
    }

    getMiddlewareMeta(middleware: Token<IMiddleware>): MiddlewareMetadata {
        let type = isClass(middleware) ? middleware : this.container.getTokenImpl(middleware);
        if (isClass(type)) {
            return lang.first(getTypeMetadata(Middleware, type));
        } else if (isString(middleware)) {
            return { name: middleware };
        } else {
            return null;
        }
    }

    insertByMeta(meta: MiddlewareMetadata, middleware: Token<IMiddleware>, chain?: OrderMiddleware[]) {
        chain = chain || this.orders;
        let ordMidd = { name: meta.name, middleware: middleware };
        if (chain.length < 1) {
            chain.push(ordMidd);
            return;
        }

        let idx = chain.length;
        if (meta.before) {
            idx = chain.findIndex(v => v.name && v.name === meta.before);
        }
        if (meta.after) {
            idx = chain.findIndex(v => v.name && v.name === meta.after) + 1;
        }
        if (idx < 0 || idx >= chain.length) {
            chain.push(ordMidd)
        } else {
            chain.splice(idx, 0, ordMidd);
        }
    }

    useBefore(middleware: MiddlewareType, match?: MiddlewareType): this {
        if (match) {
            let bmeta = this.getMiddlewareMeta(match);
            let curMeta = this.getMiddlewareMeta(middleware);
            this.insertByMeta({name: curMeta.name, before: bmeta.name}, middleware);
        } else {
            this.insert(middleware);
        }
        return this;
    }

    useAfter(middleware: MiddlewareType, match?: MiddlewareType): this {
        if (match) {
            let afmeta = this.getMiddlewareMeta(match);
            let curMeta = this.getMiddlewareMeta(middleware);
            this.insertByMeta({name: curMeta.name, after: afmeta.name}, middleware);
        } else {
            this.insert(middleware);
        }
        return this;
    }

    protected getDefault() {
        let chain = [];

        DefaultMiddlewawres.forEach(m => {
            this.insert(m, chain);
        });

        return chain;
    }

}

