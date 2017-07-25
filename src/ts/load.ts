/// <reference path="./config.ts" />

namespace WebAmdLoader {

    export class ScriptLoader implements Loader{

        private scriptTags:{[src:string]:HTMLElement};

        constructor(){
            this.scriptTags = {};
        }

        public load(context:string, successCallback:(Event)=>void, errorCallback:(Event)=>void):void{
            
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
                this.scriptTags[context] = scriptTag;
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