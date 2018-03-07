import { Aspect, Singleton, Inject, IContainer, symbols, Around, Joinpoint, JoinpointState, ILoggerManger, ILogger, LoggerAspect  } from 'tsioc';
import { mvcSymbols } from '../util/index';
import { IConfiguration } from '../IConfiguration';

@Singleton
@Aspect
export class DebugLogAspect extends LoggerAspect {

    constructor( @Inject(symbols.IContainer) container: IContainer) {
        super(container);
    }

    @Around('execution(*.*)')
    logging(joinPoint: Joinpoint) {
        this.processLog(joinPoint);
    }
}
