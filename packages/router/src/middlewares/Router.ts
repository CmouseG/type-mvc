import {
    ApplicationToken, IApplication, IConfiguration,
    Middleware, IMiddleware, ConfigurationToken
} from '@mvx/core';
import { Token, Inject, InjectToken } from '@ts-ioc/core';
import { IRoute, RootRoute, RouteBuilder, IRouter } from '../route';


/**
 * Router middleware token.
 */
export const RouterMiddlewareToken = new InjectToken<IRouter>('__MVC_Middleware_Router');

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