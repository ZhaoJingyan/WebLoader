/// <reference path="Config.ts" />

namespace WebAmdLoader {

    export class ModuleManager {

        private modules:{[name:string] : Module};

        constructor(){
            this.modules = {};
        }

        public defineModuleWithoutDependencies(name : string, factory:()=>void):void{
            let module : Module = new ScriptModule(name, factory, this);
            this.modules[module.getName()] = module;
        }

        public defineModuleWithDependencies(name : string, dependencies : Array<string>, factory:()=>void):void{
            if(isBlankArray(dependencies) && factory != null)
                this.defineModuleWithoutDependencies(name, factory);


        }

        public getModules(): {[name:string] : Module}{
            return this.modules;
        }

    }

}