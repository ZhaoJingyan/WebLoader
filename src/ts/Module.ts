namespace WebAmdLoader {

    export interface Module {

        getName(): string;

        getModuleContent(): any;

        isError():boolean;

    }

    class ModuleNameFactory {

        private static index: number = 0;

        private static code: number = new Date().getTime();

        public static getName(): string {
            return '__module' + ModuleNameFactory.index++ + '_' + ModuleNameFactory.code + '__';
        }

    }

    export class ScriptModule implements Module {

        private name: string;

        private factory: () => any;

        private content:any;

        private error:boolean = false;

        constructor(name: string, factory: () => any, manager: ModuleManager) {
            this.name = (name === null) ? ModuleNameFactory.getName() : null;
            this.factory = factory;
            this.runFactory(manager);
        }

        private runFactory(context : any) : void {
            try{
                this.content = this.factory.apply(context);
            } catch(e){
                this.content = e;
                this.error = true;
            }
        }

        public getModuleContent(): any {
            return this.content;
        }

        public getName(): string{
            return this.name;
        }

        public isError() : boolean{
            return this.error;
        }

    }

}