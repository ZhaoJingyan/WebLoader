/// <reference path="./Config.ts" />

namespace WebAmdLoader {

    /**
     * @description <script>加载器
     * @export
     * @class ScriptLoader
     * @implements {Loader}
     */
    export class ScriptLoader implements Loader{

        private scriptTags:{[src:string]:HTMLElement};

        /**
         * 
         * 
         * @returns {{[src:string]:HTMLElement}} 
         * @memberof ScriptLoader
         */
        public getScriptTags() : {[src:string]:HTMLElement}{
            return this.scriptTags;
        }

        /**
         * @constructor
         * @memberof ScriptLoader
         */
        constructor(){
            this.scriptTags = {};
        }

        /**
         * @description 通过context生成script tag，并将其将在到hea中
         * @param {string} context 
         * @param {(Event)=>void} successCallback 
         * @param {(Event)=>void} errorCallback 
         * @returns {void} 
         * @memberof ScriptLoader
         */
        public load(context:string, successCallback:(Event)=>void, errorCallback:(Event)=>void):void{
            
            let _self:ScriptLoader = this;

            if(this.scriptTags.hasOwnProperty(context)){
                successCallback(null);
                return;
            }

            let scriptTag:HTMLElement = this.createScriptTag(context);

            let unbind = function(){
                scriptTag.removeEventListener('load', loadEventListener);
                scriptTag.removeEventListener('error', loadEventListener);
            }

            let loadEventListener = function(event : Event){
                unbind();
                _self.scriptTags[context] = scriptTag;
                successCallback(event);
            };

            let errorEventListener = function(event : Event){
                unbind();
                errorCallback(event);
            };

            scriptTag.addEventListener('load', loadEventListener);
            scriptTag.addEventListener('error', errorEventListener);

            document.getElementsByTagName('head')[0].appendChild(scriptTag);

        }

        private createScriptTag(src : string) : HTMLElement{
            let scriptTag:HTMLElement = document.createElement('script');
            scriptTag.setAttribute('src', src);
            scriptTag.setAttribute('async', 'async');
            scriptTag.setAttribute('type', 'text/javascript');
            return scriptTag;
        }

    }

}