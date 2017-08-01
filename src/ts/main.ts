/// <reference path="./ModuleManager.ts" />

namespace WebAmdLoader {

    let manager : ModuleManager = new ModuleManager;

    class DefineFunc {

        constructor(){
            switch(arguments.length){
                case 0:
                    throw new Error('Define function must have a argument.');
                case 1:
                    if(isFunction(arguments[0]))
                        manager.defineModuleWithoutDependencies(null, arguments[0]);
                    else if(isArray(arguments[0]))
                        manager.defineModuleWithDependencies(null, arguments[0], null);
                    else
                        DefineFunc.throwArgumentError();
                    break;
                case 2:
                    if(isString(arguments[0]))
                        if(isArray(arguments[1]))
                            manager.defineModuleWithDependencies(arguments[0], arguments[1], null);
                        else if (isFunction(arguments[1]))
                            manager.defineModuleWithoutDependencies(arguments[0], arguments[1]);
                        else
                            DefineFunc.throwArgumentError();
                    else if (isArray(arguments[0]))
                        if(isFunction(arguments[1]))
                            manager.defineModuleWithDependencies(null, arguments[0], arguments[1]);
                        else
                            DefineFunc.throwArgumentError();
                    break;
                case 3:
                    (isString(arguments[0]) && isArray(arguments[1]) && isFunction(arguments[2])) ?
                            manager.defineModuleWithDependencies(arguments[0], arguments[1], arguments[2]) : DefineFunc.throwArgumentError();
                    break;
                default:
                    DefineFunc.throwArgumentError();
            }

        }

        static throwArgumentError() : void{
            throw new Error('Define function argument error!');
        }

        public static amd : boolean = true;

        public static manager : ModuleManager = manager;

    }

    export let define = DefineFunc;

}