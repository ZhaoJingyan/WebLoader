namespace WebAmdLoader {

    export interface Loader {

        load(context:any, successCallback:(any)=>void, errorCallback:(any)=>void) : void;

    }

}