import { ResultValue } from './ResultValue';
import { IContext } from '../IContext';
import { IContainer } from '@ts-ioc/core';


/**
 * controller method return result type of json.
 * context type 'application/json'
 *
 * @export
 * @class JsonResult
 */
export class JsonResult extends ResultValue {
    constructor(private data: object) {
        super('application/json');
    }
    async sendValue(ctx: IContext, container: IContainer) {
        ctx.type = this.contentType;
        ctx.body = this.data || {};
    }
}
