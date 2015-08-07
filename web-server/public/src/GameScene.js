var spriteLayer;
var GameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        a + 1;
        var _map = GetMap();
        if (_map == null) {
            alert(Err);
            history.go(-1);
        }
        var mapLayer = new mapS(_map);
        mapLayer.init();
        this.addChild(mapLayer, 1);
        spriteLayer = cc.Layer.create();
        this.addChild(spriteLayer, 2);
        for (var iLayer in _mapres) {
            var ObjGroup = map.getObjectGroup(iLayer)._objects[0];
            var _objlayer = new ObjLayer(_mapres[iLayer], new cc.p(ObjGroup.x, ObjGroup.y), ObjGroup.width,
ObjGroup.height);
            Obj.push(_objlayer);
        }
        for (var i = 0; i < lists.length; i++) {
            var _text = lists[i];
            try {
                delegate(_text[0], _text[1], _text[2], _text[4], _text[3], _text[5], _text[6], _text[7], _text[8]);
            }
            catch (e) {
                cc.log(e);
            }
        }
    }
});

//return current map from param
function GetMap() {
    for (var i in mapres) {
        if (i == map) {
            return mapres[i];
        }
    }
}

