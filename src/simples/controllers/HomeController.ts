import { Controller, Get, Post, IContext, symbols, BaseController, ViewResult, ResultValue } from '../../index';
import { Inject } from 'tsioc';
import { Mywork } from '../bi/Mywork';

@Controller('/')
export class HomeController extends BaseController {

    @Inject(symbols.IContext)
    context: IContext;
    constructor() {
        super();
    }

    @Get('')
    index(): ResultValue {
        return this.view('index.html');
    }
}