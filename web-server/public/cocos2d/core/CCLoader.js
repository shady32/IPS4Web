/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * resource type
 * @constant
 * @type Object
 */
cc.RESOURCE_TYPE = {
    "IMAGE": ["png", "jpg", "bmp", "jpeg", "gif"],
    "SOUND": ["mp3", "ogg", "wav", "mp4", "m4a"],
    "XML": ["plist", "xml", "fnt", "tmx", "tsx"],
    "BINARY": ["ccbi"],
    "FONT": "FONT",
    "TEXT": ["txt", "vsh", "fsh", "json", "ExportJson"],
    "UNKNOW": []
};

/**
 * resource structure
 * @param resList
 * @param selector
 * @param target
 * @constructor
 */
cc.ResData = function (resList, selector, target) {
    this.resList = resList || [];
    this.selector = selector;
    this.target = target;
    this.curNumber = 0;
    this.loadedNumber = 0;
    this.totalNumber = this.resList.length;
};

/**
 * A class to preload resources async
 * @class
 * @extends cc.Class
 */
cc.Loader = cc.Class.extend(/** @lends cc.Loader# */{
    _curData: null,
    _resQueue: null,
    _isAsync: false,
    _scheduler: null,
    _running: false,
    _regisiterLoader: false,

    /**
     * Constructor
     */
    ctor: function () {
        this._scheduler = cc.Director.getInstance().getScheduler();
        this._resQueue = [];
    },

    /**
     * init with resources
     * @param {Array} resources
     * @param {Function|String} selector
     * @param {Object} target
     */
    initWithResources: function (resources, selector, target) {
        if (!resources) {
            cc.log("cocos2d:resources should not null");
            return;
        }
        var res = resources.concat([]);
        var data = new cc.ResData(res, selector, target);
        this._resQueue.push(data);

        if (!this._running) {
            this._running = true;
            this._curData = this._resQueue.shift();
            this._scheduler.scheduleUpdateForTarget(this);
        }
    },

    setAsync: function (isAsync) {
        this._isAsync = isAsync;
    },

    /**
     * Callback when a resource file loaded.
     */
    onResLoaded: function (err) {
        if(err != null){
            cc.log("cocos2d:Failed loading resource: " + err);
        }

        this._curData.loadedNumber++;
    },

    /**
     * Get loading percentage
     * @return {Number}
     * @example
     * //example
     * cc.log(cc.Loader.getInstance().getPercentage() + "%");
     */
    getPercentage: function () {
        var percent = 0, curData = this._curData;
        if (curData.totalNumber == 0) {
            percent = 100;
        }
        else {
            percent = (0 | (curData.loadedNumber / curData.totalNumber * 100));
        }
        return percent;
    },

    /**
     * release resources from a list
     * @param resources
     */
    releaseResources: function (resources) {
        if (resources && resources.length > 0) {
            var sharedTextureCache = cc.TextureCache.getInstance(),
                sharedEngine = cc.AudioEngine ? cc.AudioEngine.getInstance() : null,
                sharedParser = cc.SAXParser.getInstance(),
                sharedFileUtils = cc.FileUtils.getInstance();

            var resInfo, path, type;
            for (var i = 0; i < resources.length; i++) {
                resInfo = resources[i];
                path = typeof resInfo == "string" ? resInfo : resInfo.src;
                type = this._getResType(resInfo, path);

                switch (type) {
                    case "IMAGE":
                        sharedTextureCache.removeTextureForKey(path);
                        break;
                    case "SOUND":
                        if (!sharedEngine) throw "Can not find AudioEngine! Install it, please.";
                        sharedEngine.unloadEffect(path);
                        break;
                    case "XML":
                        sharedParser.unloadPlist(path);
                        break;
                    case "BINARY":
                        sharedFileUtils.unloadBinaryFileData(path);
                        break;
                    case "TEXT":
                        sharedFileUtils.unloadTextFileData(path);
                        break;
                    case "FONT":
                        this._unregisterFaceFont(resInfo);
                        break;
                    default:
                        throw "cocos2d:unknown filename extension: " + type;
                        break;
                }
            }
        }
    },

    update: function () {
        if (this._isAsync) {
            var frameRate = cc.Director.getInstance()._frameRate;
            if (frameRate != null && frameRate < 20) {
                cc.log("cocos2d: frame rate less than 20 fps, skip frame.");
                return;
            }
        }

        var curData = this._curData;
        if (curData && curData.curNumber < curData.totalNumber) {
            this._loadRes();
            curData.curNumber++;
        }

        var percent = this.getPercentage();
        if(percent >= 100){
            this._complete();
            if (this._resQueue.length > 0) {
                this._running = true;
                this._curData = this._resQueue.shift();
            }
            else{
                this._running = false;
                this._scheduler.unscheduleUpdateForTarget(this);
            }
        }
    },

    _loadRes: function () {
        var sharedTextureCache = cc.TextureCache.getInstance(),
            sharedEngine = cc.AudioEngine ? cc.AudioEngine.getInstance() : null,
            sharedParser = cc.SAXParser.getInstance(),
            sharedFileUtils = cc.FileUtils.getInstance();

        var resInfo = this._curData.resList.shift(),
            path = this._getResPath(resInfo),
            type = this._getResType(resInfo, path);

        switch (type) {
            case "IMAGE":
                sharedTextureCache.addImageAsync(path, this.onResLoaded, this);
                break;
            case "SOUND":
                if (!sharedEngine) throw "Can not find AudioEngine! Install it, please.";
                sharedEngine.preloadSound(path, this.onResLoaded, this);
                break;
            case "XML":
                sharedParser.preloadPlist(path, this.onResLoaded, this);
                break;
            case "BINARY":
                sharedFileUtils.preloadBinaryFileData(path, this.onResLoaded, this);
                break;
            case "TEXT" :
                sharedFileUtils.preloadTextFileData(path, this.onResLoaded, this);
                break;
            case "FONT":
                this._registerFaceFont(resInfo, this.onResLoaded, this);
                break;
            default:
                throw "cocos2d:unknown filename extension: " + type;
                break;
        }
    },

    _getResPath: function (resInfo) {
        return typeof resInfo == "string" ? resInfo : resInfo.src;
    },

    _getResType: function (resInfo, path) {
        var isFont = resInfo.fontName;
        if (isFont != null) {
            return cc.RESOURCE_TYPE["FONT"];
        }
        else {
            var ext = path.substring(path.lastIndexOf(".") + 1, path.length);
            var index = ext.indexOf("?");
            if (index > 0) ext = ext.substring(0, index);

            for (var resType in cc.RESOURCE_TYPE) {
                if (cc.RESOURCE_TYPE[resType].indexOf(ext) != -1) {
                    return resType;
                }
            }
            return ext;
        }
    },

    _complete: function () {
        cc.doCallback(this._curData.selector,this._curData.target);
    },

    _registerFaceFont: function (fontRes,seletor,target) {
        var srcArr = fontRes.src;
        var fileUtils = cc.FileUtils.getInstance();
        if (srcArr && srcArr.length > 0) {
            var fontStyle = document.createElement("style");
            fontStyle.type = "text/css";
            document.body.appendChild(fontStyle);

            var fontStr = "@font-face { font-family:" + fontRes.fontName + "; src:";
            for (var i = 0; i < srcArr.length; i++) {
                fontStr += "url('" + fileUtils.fullPathForFilename(encodeURI(srcArr[i].src)) + "') format('" + srcArr[i].type + "')";
                fontStr += (i == (srcArr.length - 1)) ? ";" : ",";
            }
            fontStyle.textContent += fontStr + "};";

            //preload
            //<div style="font-family: PressStart;">.</div>
            var preloadDiv = document.createElement("div");
            preloadDiv.style.fontFamily = fontRes.fontName;
            preloadDiv.innerHTML = ".";
            preloadDiv.style.position = "absolute";
            preloadDiv.style.left = "-100px";
            preloadDiv.style.top = "-100px";
            document.body.appendChild(preloadDiv);
        }
        cc.doCallback(seletor,target);
    },

    _unregisterFaceFont: function (fontRes) {
        //todo remove style
    }
});

/**
 * Preload resources in the background
 * @param {Array} resources
 * @param {Function|String} selector
 * @param {Object} target
 * @return {cc.Loader}
 * @example
 * //example
 * var g_mainmenu = [
 *    {src:"res/hello.png"},
 *    {src:"res/hello.plist"},
 *
 *    {src:"res/logo.png"},
 *    {src:"res/btn.png"},
 *
 *    {src:"res/boom.mp3"},
 * ]
 *
 * var g_level = [
 *    {src:"res/level01.png"},
 *    {src:"res/level02.png"},
 *    {src:"res/level03.png"}
 * ]
 *
 * //load a list of resources
 * cc.Loader.preload(g_mainmenu, this.startGame, this);
 *
 * //load multi lists of resources
 * cc.Loader.preload([g_mainmenu,g_level], this.startGame, this);
 */
cc.Loader.preload = function (resources, selector, target) {
    if (!this._instance) {
        this._instance = new cc.Loader();
    }
    this._instance.initWithResources(resources, selector, target);
    return this._instance;
};

/**
 * Preload resources async
 * @param {Array} resources
 * @param {Function|String} selector
 * @param {Object} target
 * @return {cc.Loader}
 */
cc.Loader.preloadAsync = function (resources, selector, target) {
    if (!this._instance) {
        this._instance = new cc.Loader();
    }
    this._instance.setAsync(true);
    this._instance.initWithResources(resources, selector, target);
    return this._instance;
};

/**
 * Release the resources from a list
 * @param {Array} resources
 */
cc.Loader.purgeCachedData = function (resources) {
    if (this._instance) {
        this._instance.releaseResources(resources);
    }
};

/**
 * Returns a shared instance of the loader
 * @function
 * @return {cc.Loader}
 */
cc.Loader.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.Loader();
    }
    return this._instance;
};

cc.Loader._instance = null;


/**
 * Used to display the loading screen
 * @class
 * @extends cc.Scene
 */
cc.LoaderScene = cc.Scene.extend(/** @lends cc.LoaderScene# */{
_logo: null,
_logoTexture: null,
_texture2d: null,
_bgLayer: null,
_label: null,
_winSize: null,

/**
* Constructor
*/
ctor: function () {
    cc.Scene.prototype.ctor.call(this);
    this._winSize = cc.Director.getInstance().getWinSize();
},
init: function () {
    cc.Scene.prototype.init.call(this);

    //logo
    var logoWidth = 480;
    var logoHeight = 320;
    var centerPos = cc.p(this._winSize.width / 2, this._winSize.height / 2);

    this._logoTexture = new Image();
    var _this = this, handler;
    this._logoTexture.addEventListener("load", handler = function () {
        _this._initStage(centerPos);
        this.removeEventListener('load', handler, false);
    });
    this._logoTexture.src = "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABQAAD/4QNvaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6M0U2NzRDRTNGNzJDRTQxMTkwRUFGODE0MkNCMDcwNjEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NjIwRjBCOUM3MEEzMTFFNDg2OENGQTdBQkExMTVFOUEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjIwRjBCOUI3MEEzMTFFNDg2OENGQTdBQkExMTVFOUEiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1OTNDQTlCRkI1MzFFNDExOENDMUMzMERCRkIxMUNBNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozRTY3NENFM0Y3MkNFNDExOTBFQUY4MTQyQ0IwNzA2MSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6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";
    this._logoTexture.width = logoWidth;
    this._logoTexture.height = logoHeight;

    // bg
    this._bgLayer = cc.LayerColor.create(cc.c4(32, 32, 32, 255));
    this._bgLayer.setPosition(0, 0);
    this.addChild(this._bgLayer, 0);

    //loading percent
    this._label = cc.LabelTTF.create("Loading... 0%", "Arial", 14);
    this._label.setColor(cc.c3(180, 180, 180));
    this._label.setPosition(cc.pAdd(centerPos, cc.p(0, -logoHeight / 2 - 10)));
    this._bgLayer.addChild(this._label, 10);
},

_initStage: function (centerPos) {
    this._texture2d = new cc.Texture2D();
    this._texture2d.initWithElement(this._logoTexture);
    this._texture2d.handleLoadedTexture();
    this._logo = cc.Sprite.createWithTexture(this._texture2d);
    this._logo.setScale(cc.CONTENT_SCALE_FACTOR());
    this._logo.setPosition(centerPos);
    this._bgLayer.addChild(this._logo, 10);
},

onEnter: function () {
    cc.Node.prototype.onEnter.call(this);
    this.schedule(this._startLoading, 0.3);
},

onExit: function () {
    cc.Node.prototype.onExit.call(this);
    var tmpStr = "Loading... 0%";
    this._label.setString(tmpStr);
},

/**
* init with resources
* @param {Array} resources
* @param {Function|String} selector
* @param {Object} target
*/
initWithResources: function (resources, selector, target) {
    this.resources = resources;
    this.selector = selector;
    this.target = target;
},

_startLoading: function () {
    this.unschedule(this._startLoading);
    cc.Loader.preload(this.resources, this.selector, this.target);
    this.schedule(this._updatePercent);
},

_updatePercent: function () {
    var percent = cc.Loader.getInstance().getPercentage();
    var tmpStr = "Loading... " + percent + "%";
    this._label.setString(tmpStr);

    if (percent >= 100)
        this.unschedule(this._updatePercent);
}
});

/**
 * Preload multi scene resources.
 * @param {Array} resources
 * @param {Function|String} selector
 * @param {Object} target
 * @return {cc.LoaderScene}
 * @example
 * //example
 * var g_mainmenu = [
 *    {src:"res/hello.png"},
 *    {src:"res/hello.plist"},
 *
 *    {src:"res/logo.png"},
 *    {src:"res/btn.png"},
 *
 *    {src:"res/boom.mp3"},
 * ]
 *
 * var g_level = [
 *    {src:"res/level01.png"},
 *    {src:"res/level02.png"},
 *    {src:"res/level03.png"}
 * ]
 *
 * //load a list of resources
 * cc.LoaderScene.preload(g_mainmenu, this.startGame, this);
 *
 * //load multi lists of resources
 * cc.LoaderScene.preload([g_mainmenu,g_level], this.startGame, this);
 */
cc.LoaderScene.preload = function (resources, selector, target) {
    if (!this._instance) {
        this._instance = new cc.LoaderScene();
        this._instance.init();
    }

    this._instance.initWithResources(resources, selector, target);

    var director = cc.Director.getInstance();
    if (director.getRunningScene()) {
        director.replaceScene(this._instance);
    } else {
        director.runWithScene(this._instance);
    }

    return this._instance;
};
