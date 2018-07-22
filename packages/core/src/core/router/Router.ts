import { ApplicationToken, IApplication } from '../IApplication';
import { IConfiguration } from '../../IConfiguration';
import { Middleware } from '../decorators/index';
import { IMiddleware } from '../middlewares/index';
import { Token, Inject, InjectToken } from '@ts-ioc/core';
import { IRoute } from './IRoute';
import { RootRoute } from './RootRoute';
import { RouteBuilder } from './RouteBuilder';
import { ConfigurationToken } from '../../IConfiguration';

/**
 * router
 *
 * @export
 * @interface IRouter
 * @extends {IMiddleware}
 */
export interface IRouter extends IMiddleware {
    routes(map: IRoute);

    register(...controllers: Token<any>[]);

    getRoot(): IRoute;
}

/**
 * Router middleware token.
 */
export const RouterMiddlewareToken = new InjectToken<IRouter>('MVX_Middleware_Router');

@Middleware(RouterMiddlewareToken)
export class Router implements IRouter, IMiddleware {

    private root: IRoute;

    @Inject(ApplicationToken)
    private app: IApplication;

    constructor(private builder: RouteBuilder, @Inject(ConfigurationToken) private config: IConfiguration) {
        this.root = new RootRoute(config.routePrefix);
    }

    routes(map: IRoute) {
        this.root.add(map);
    }

    register(...controllers: Token<any>[]) {
        this.builder.build(this, ...controllers);
    }

    setup() {
        this.app.use(async (ctx, next) => {
            if ((!ctx.status || ctx.status === 404) && this.config.isRouteUrl(ctx.url)) {
                return this.root.navigating(this.app.container, ctx, next);
            }
        });
    }

    getRoot(): IRoute {
        return this.root;
    }

}