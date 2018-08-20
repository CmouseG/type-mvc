import { Bootstrap, AppModule, Application, DebugLogAspect } from '@mvx/mvc';
// import { PlatformServer } from '@ts-ioc/platform-server';

@AppModule({
    // imports: [DebugLogAspect],
    debug: false,
    bootstrap: Application
})
class MvcApi {

}


Bootstrap.create(__dirname)
    .useConfiguration()
    .bootstrap(MvcApi);
