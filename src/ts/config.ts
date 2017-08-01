namespace WebAmdLoader {

    export function isFunction(func : any) : boolean{
        return func === null ? false : ( typeof func === 'function' ? true : false);
    }

    export function isString(string : any) : boolean{
        return string === null ? false : (typeof string === 'string' ? true : false);
    }

    export function isArray(array : any) : boolean {
        return array === null ? false : (array instanceof Array ? true : false);
    }

    export function isBlankArray(array : Array<any>) : boolean {
        return array === null ? true : (  array instanceof Array ? (array.length === 0 ? true : false) :  false);
    }

    export interface Loader {
        load(context:any, successCallback:(any)=>void, errorCallback:(any)=>void) : void;
    }

}