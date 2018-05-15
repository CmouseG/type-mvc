import { Singleton, Inject, IContainer, symbols  } from '@ts-ioc/core';
import { LoggerAspect, Level } from '@ts-ioc/logs'
import { Aspect, Around, Joinpoint, JoinpointState } from '@ts-ioc/aop';
import { MvcSymbols } from '../util/index';
import { IConfiguration } from '../IConfiguration';

/**
 * debug lod aspect.
 *
 * @export
 * @class DebugLogAspect
 * @extends {LoggerAspect}
 */
@Singleton
@Aspect
export class DebugLogAspect extends LoggerAspect {

    constructor( @Inject(symbols.IContainer) container: IContainer) {
        super(container);
    }

    @Around('execution(*.*)')
    logging(joinPoint: Joinpoint) {
        let level: Level;
        switch (joinPoint.state) {
            case JoinpointState.AfterThrowing:
                level = Level.error;
                break;
            case JoinpointState.AfterReturning:
                level = Level.debug;
                break;

            case JoinpointState.After:
            case JoinpointState.Before:
                level = Level.trace;
                break;
        }
        this.processLog(joinPoint, null, null, level);
    }
}
