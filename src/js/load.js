//noinspection ThisExpressionReferencesGlobalObjectJS
/**
 * 功能描述:
 *  - JSLoader 加载script tag
 *  - define (defineModel) 定义模块
 *  - require (requireModel) 载入model
 *  - ModelManager model管理器
 *  - AutoModelLoader 自动加载Model，自动载入load.config.js
 *  - Plugin 插件
 * Created by Zhao Jinyan on 2017/7/17.
 */
//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global){

    "use strict";

    /* Util ****************************************/

    /**
     * 自动生成Model name
     * @type {{_index: number, _prefix: string, getNewName: getNewName}}
     * @class
     */
    var ModelNameCreator = {

        _index: 0,
        _prefix: '_model_' + new Date().getTime() + '$',

        getNewName: function(){
            return this._prefix + this._index++;
        }

    };

    /* Javascript Load ****************************************/

    /**
     * @description 加载script tag
     * @class
     * @private
     */
    var Loader = (function(){

        /**
         * @type {object}
         */
        var Loader = {

            /**
             * @description 记录已经加载的script标签
             * @type {[]}
             * @private
             */
            _loadedScripts:[],

            /**
             * @description 判断script标签是否被加载
             * @param path
             * @returns {boolean}
             * @private
             */
            _isLoaded: function(path){
                if(this._loadedScripts.length === 0)
                    return false;
                for(var i = 0; i < this._loadedScripts.length; i++){
                    if(this._loadedScripts[i] === path){
                        return true;
                    }
                }
                return false;
            }
        };

        /**
         * @description 加载JavaScript tag
         * @param path {String} javascript file path
         * @param successCallBack {function} script tag load success
         * @param errorCallBack {function} script tag load error
         * @public
         */
        Loader.load = function(path, successCallBack, errorCallBack){

            if(this._isLoaded(path)){
                successCallBack(null);
                return;
            }

            /**
             * Create A Script Tag.
             * @type {Element}
             */
            var scriptTag = document.createElement('script');
            scriptTag.setAttribute('src', path);
            scriptTag.setAttribute('type', 'text/javascript');
            scriptTag.setAttribute('async','async');

            var _this = this;

            var loadEventListener = function(event){
                //unbind();
                _this._loadedScripts.push(path);
                successCallBack(event);
            };

            var errorEventListener = function(event){
                unbind();
                errorCallBack(event);
            };

            var unbind = function(){
                scriptTag.removeEventListener('load', loadEventListener);
                scriptTag.removeEventListener('error', errorEventListener);
            };

            scriptTag.addEventListener('load', loadEventListener);
            scriptTag.addEventListener('error', errorEventListener);

            document.getElementsByTagName('head')[0].appendChild(scriptTag);

        };

        return Loader;

    })();

    /**
     * 加载javascript tag
     * @function
     * @param path javascript path
     * @param successCallBack 成功后回掉
     * @param errorCallBack 失败后回掉
     * @public
     */
    var loadFunc = function(path, successCallBack, errorCallBack){
        Loader.load(path, successCallBack, errorCallBack);
    };

    loadFunc.__proto__.Loader = Loader;

    global['load'] = loadFunc;

    /* define ****************************************/

    /**
     * @function
     * @pubic
     */
    var defineFunc = function () {
        if (arguments.length === 0 || arguments.length > 3)
            return;

        var modelName = null, dependencies = null, modelFactory = null;
        for(var i = 0; i < arguments.length; i++){
            var argumentType = typeof arguments[i];
            if(argumentType === 'string')
                modelName = arguments[i];
            if(argumentType === 'function' || (argumentType === 'object' && arguments[i].constructor !== Array) )
                modelFactory = arguments[i];
            if(argumentType === 'object' && arguments[i].constructor === Array )
                dependencies = arguments[i];
        }

        // 如果没有依赖，同步载入model
        if((dependencies === null ||dependencies.length === 0) && modelFactory !== null){
            ModelManager.defineWithoutDependencies(modelName, modelFactory);
        }

        // 如果有依赖，异步载入model
        if( dependencies!== null && dependencies.length > 0 ){
            ModelManager.defineWithDependencies(modelName, dependencies, modelFactory);
        }

    };

    defineFunc.allModels = function(){
        return ModelManager.getModels();
    };

    defineFunc.amd = true;

    global['define'] = defineFunc;

    /* ModelManager ****************************************/

    /**
     * @class
     */
    var ModelManager = (function(){

        var ModelManager = {
            /**
             * @type {object}
             * @private
             */
            _models: {},

            /**
             * @type {string|null}
             * @private
             */
            _newModelName: null,

            /**
             * @type {object}
             * @public
             */
            modelPaths: {
                jquery: '/js/jquery-3.2.1.min.js',
                form: '/js/form.js',
                bootstrap: '/js/bootstrap.min.js',
                bootbox: '/js/bootbox.js'
            }

        };

        /**
         * @public
         * @returns {Object}
         */
        ModelManager.getModels = function(){
            return this._models;
        };

        /**
         * @param {string} name
         * @public
         * @return {Model}
         */
        ModelManager.getModel = function(name){
            return this._models[name];
        };

        /**
         * @param {Model} model
         * @public
         */
        ModelManager.addNewModel = function(model){
            this._newModelName = model.name;
            this._models[model.name] = model;
        };

        /**
         * @public
         * @return {string|null}
         */
        ModelManager.getNewModelName = function(){
            return this._newModelName;
        };

        /**
         * @public
         */
        ModelManager.setNewModelName = function(){
            this._newModelName = null;
        };

        /**
         * 构建没有依赖的model
         * @param name 模块名
         * @param factory
         * @public
         */
        ModelManager.defineWithoutDependencies = function(name, factory){
            var model = new Model(name, null, typeof factory === 'function' ? factory() : factory);
            ModelManager.addNewModel(model);
        };

        /**
         * @description 依赖包加载器
         * @class
         * @constructor
         * @param {Array} dependencies 依赖模块
         */
        var DependencyLoader = function(dependencies){

            var _this = this;

            /**
             * @description 依赖模块计数游标，指向被加载的模块
             * @type {number}
             * @private
             */
            this._index = -1;

            /**
             * @description 依赖模块的数量
             * @type {Number}
             * @private
             */
            this._length = dependencies.length;

            /**
             * @description 当全部依赖模块被加载完毕后调用此方法
             * @type {function}
             * @private
             */
            this._successCallBack = null;

            /**
             * @description 回掉函数{@link _successCallBack}的参数
             * @type {Array}
             * @private
             */
            this._successCallBackArguments = [];

            /**
             * @description 通过递归加载下一个模块
             * @private
             */
            this._loadNext = function(){

                this._index++; // 游标向后移动

                // 当游标等于依赖模块的数量时，说明依赖包加载完毕
                if(this._index >= this._length){
                    this._successCallBack.apply(ModelManager.getModels(), this._successCallBackArguments);
                    return;
                }

                var name = dependencies[this._index];
                var model = ModelManager.getModel(name);

                if(model === null || typeof model === 'undefined'){
                    // 如果找不到model 从config表中找到
                    var modelPath = ModelManager.modelPaths[name];
                    if(modelPath === null || typeof modelPath === 'undefined'){
                        this._successCallBackArguments.push(null);
                        console.log('找不到模块:' + name);
                        this._loadNext();
                    } else {
                        // 异步加载
                        ModelManager.setNewModelName(null);
                        Loader.load(modelPath, function (){
                            model =  ModelManager.getModel(name);
                            if(model === null || typeof model === 'undefined'){

                                var newModelName = ModelManager.getNewModelName();

                                if(newModelName === null){
                                    model = new Model(name, null, null);
                                    console.log('找不到模块:' + name);
                                } else {
                                    var newModel = ModelManager.getModel(newModelName);
                                    model = new Model(name, newModel.dependencies, newModel.context);
                                }


                                ModelManager.addNewModel(model);
                                _this._successCallBackArguments.push(model.context);
                                _this._loadNext();
                            } else {
                                _this._successCallBackArguments.push(model.context);
                                _this._loadNext();
                            }

                        }, function(){

                            console.log('加载模块时发生错误:' + name);
                            _this._successCallBackArguments.push(model.context);
                            _this._loadNext();

                        });
                    }
                } else {
                    // 如果找到model 将model放入_successCallBackArguments中
                    this._successCallBackArguments.push(model.context);
                    this._loadNext();
                }

            };

            /**
             * @description 加载依赖模块，之后调用successCallBack
             * @param successCallBack
             * @public
             */
            this.load = function(successCallBack){
                this._successCallBack = successCallBack;
                this._loadNext();
            };

        };

        /**
         * @description 载入带有依赖的模块
         * @param {string} [name] 模块名
         * @param {Array} dependencies 依赖包
         * @param {function|object} factory 模块工厂方法
         * @public
         */
        ModelManager.defineWithDependencies = function(name, dependencies, factory){
            var loader = new DependencyLoader(dependencies);
            loader.load(function(){

                var context;
                if(typeof factory === 'function')
                    context = factory.apply(factory, arguments);
                else
                    context = factory;

                var model = new Model(name, dependencies, context);
                ModelManager.addNewModel(model);
            })
        };

        return ModelManager;

    })();

    /* Model ****************************************/

    /**
     * @description Model
     * @param name {string}
     * @param {Array} dependencies
     * @param context {object}
     * @constructor
     * @class
     */
    var Model = function(name, dependencies, context){

        /**
         * @description model name
         * @type {string}
         * @public
         */
        this.name = name === null ? ModelNameCreator.getNewName() : name;

        /**
         *
         * @type {Array}
         * @public
         */
        this.dependencies = dependencies;

        /**
         * @description model context
         * @type {*}
         * @public
         */
        this.context = context;

    };



})(this);