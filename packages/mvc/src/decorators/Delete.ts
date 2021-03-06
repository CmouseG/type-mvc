import { createRouteDecorator } from './Route';
import { RequestMethod } from '../RequestMethod';
import { DeleteMetadata } from '../metadata';
import { IMethodDecorator } from '@ts-ioc/core';


/**
 * Delete decorator. define the route method as delete.
 *
 * @Delete
 *
 * @export
 * @interface IDeleteDecorator
 * @template T
 */
export interface IDeleteDecorator<T extends DeleteMetadata> extends IMethodDecorator<T> {
    /**
     * Delete decorator. define the route method as delete.
     *
     * @Delete
     *
     * @param {string} route route sub path.
     * @param {string} [contentType] set request contentType.
     */
    (route: string, contentType?: string): MethodDecorator;
}

/**
 * Delete decorator. define the route method as delete.
 *
 * @Delete
 */
export const Delete: IDeleteDecorator<DeleteMetadata> = createRouteDecorator<DeleteMetadata>(RequestMethod.Delete);
