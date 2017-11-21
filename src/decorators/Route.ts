import { createMethodDecorator, IMethodDecorator, MethodMetadata } from 'type-autofac';
import { RequestMethod } from '../RequestMethod';
import { RouteMetadata } from './metadata/RouteMetadata';
import { Request } from 'express';


export interface IRouteDecorator<T extends RouteMetadata> {
    (metadata: T | string, method?: RequestMethod): MethodDecorator;
    (target: Function, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>): void;
}

/**
 * create route decorator.
 *
 * @export
 * @template T
 * @param {string} name
 * @param {RequestMethod} [method]
 */
export function createRouteDecorator<T extends RouteMetadata>(name: string, method?: RequestMethod) {
    let routeAdapter = (...args: any[]) => {
        let metadata;
        if (args.length > 0 && args[0]) {
            if (typeof args[0] === 'string') {
                metadata = {
                    route: args[0],
                    method: method ? method : (typeof args[1] === 'number' ? args[1] : RequestMethod.Get)
                } as T;
            }
        }
        return metadata;
    }
    return createMethodDecorator<RouteMetadata>('Route', routeAdapter);
}

export const Route: IRouteDecorator<RouteMetadata> = createRouteDecorator<RouteMetadata>('Route');
