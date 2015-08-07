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
var TAG_TILE_MAP = 1;
var mapS = cc.Layer.extend({
    ctor: function (_map) {
        this._super();
        map = cc.TMXTiledMap.create(_map);
        this.addChild(map, 0, TAG_TILE_MAP);
        map.setPosition(cc.p(0, 0));
        map.setAnchorPoint(cc.p(0, 0));
       // ObjectLayerReader(_map);
    }
});


function ObjectLayerReader(_map) {
    var _mapres;
    for (var i in mapobjres) {
        if (i == _map) {
            _mapres = mapobjres[i];
        }
    }

    for (var iLayer in _mapres) {
        var ObjGroup = map.getObjectGroup(iLayer)._objects[0];
        var _objlayer = new ObjLayer(_mapres[iLayer], new cc.p(ObjGroup.x, ObjGroup.y), ObjGroup.width, ObjGroup.height);
        Obj.push(_objlayer);
    }
}
