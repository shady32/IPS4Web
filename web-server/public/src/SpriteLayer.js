var playSprite = cc.Layer.extend({
    sprite: null,
    lable: null,
    buf: null,
    pid: null,
    area: null,
    seq: null,
    type: null,
    infoMenu: null,
    tooltips: null,
    tooltipsitem: null,
    tooltipslable: null,
    point: null,
    image: null,
    sex: null,
    ctor: function (_PID, _Area, _Sex, _Action, _type, _image, _tooltips, _right, _call) {
        //Sprite
        this._super();
        this.init();
        this.pid = _PID;
        this.area = _Area;
        this.type = _type;
        this.tooltips = _tooltips;
        this.image = _image;
        this.sex = _Sex;
        var num = currentareasprite;
        try {
            this.point = GetPoint(this.area, num);
        } catch (Error) {
            alert(Error)
        }

        var texture = cc.TextureCache.getInstance().addImage(_image);
        var defult = cc.SpriteFrame.createWithTexture(texture, cc.rect(32 * _Sex.x, 32 * _Sex.y, 32, 32));
        this.sprite = cc.Sprite.createWithSpriteFrame(defult);
        this.sprite.setPosition(this.point);
        this.addChild(this.sprite);
        //buff
        if (_type != null) {
            var texture_buf = cc.TextureCache.getInstance().addImage(Sprite_Buf);
            var buff = cc.SpriteFrame.createWithTexture(texture_buf, cc.rect(18 * _type.x, 18 * _type.y, 18, 18));
            this.buf = cc.Sprite.createWithSpriteFrame(buff);
            this.buf.setPosition(cc.p(this.point.x - 4, this.point.y + 5));
            this.addChild(this.buf);
        }
        //Lable
        this.lable = cc.LabelTTF.create(_right, "Arial", 12);
        this.lable.setColor(cc.red());
        this.lable.setPosition(cc.p(this.point.x + 10, this.point.y + 15));
        this.addChild(this.lable);

        //button
        var button = cc.MenuItemImage.create(Empty, Empty, this.showtooltips, this);
        this.infoMenu = cc.Menu.create(button);
        this.infoMenu.setPosition(this.point);
        this.addChild(this.infoMenu);

        //Animation
        this.seq = GetAnimation(_Sex, _Action, _image);
        this.sprite.runAction(this.seq);
    },
    onAction: function (_area, _action) {
        var reinit = this.area;
        this.area = _area == null ? this.area : _area;
        if (_action == "Stop" || _action == "FinishCallStuff" || _action == "StopAlarm") {
            this.sprite.stopAction(this.seq);
            var _ppppp = new Array();
            _ppppp.push(this.sex);
            _ppppp.push(null);
            cc.log("                     ");
            this.sprite.runAction(GetAnimation(this.sex, _ppppp, this.image));
        }
        else {
            this.sprite.stopAction(this.seq);
            this.sprite.runAction(GetAnimation(this.sex, [this.sex, null], this.image));
            this.seq = GetAnimation(this.sex, _action, this.image);
            this.sprite.runAction(this.seq);
        }

        if (reinit != _area) {
            var num = currentareasprite;
            this.point = GetPoint(this.area, num);
            this.sprite.setPosition(this.point);
            this.infoMenu.setPosition(this.point);
            this.lable.setPosition(cc.p(this.point.x + 10, this.point.y + 15));
            if (this.buf != null) {
                this.buf.setPosition(cc.p(this.point.x - 4, this.point.y + 5));
            }
            if (this.tooltipsitem != null || this.tooltipslable != null) {
                this.tooltipslable.setAnchorPoint(cc.p(0, 0));
                this.tooltipsitem.setPosition(cc.p(this.point.x + 65, this.point.y + 45));
                this.tooltipslable.setPosition(cc.p(this.point.x + 10, this.point.y + 32));
            }

            ReInit(reinit);
        }
    },
    showtooltips: function () {
        if (this.tooltipsitem == null) {
            var button = cc.MenuItemImage.create(Tips1, Tips2, this.hidetooltips, this);
            this.tooltipsitem = cc.Menu.create(button);
            this.tooltipslable = cc.LabelTTF.create(this.tooltips, "Arial", 12);
            this.tooltipslable.setColor(cc.black());
            var winsize = cc.Director.getInstance().getWinSize();
            var toolpoint;
            cc.log(this.point);
            this.tooltipslable.setAnchorPoint(cc.p(0, 1));
            if (this.point.x < 670 && this.point.y < 510) {
                toolpoint = new cc.p(this.point.x + 65, this.point.y + 45);
            }
            if (this.point.x > 670 && this.point.y < 510) {
                toolpoint = new cc.p(this.point.x - 75, this.point.y + 45);
            }
            if (this.point.x < 670 && this.point.y > 510) {
                toolpoint = new cc.p(this.point.x + 65, this.point.y - 50);
            }
            if (this.point.x > 670 && this.point.y > 510) {
                toolpoint = new cc.p(this.point.x - 75, this.point.y - 50);
            }
            cc.log(toolpoint);
            this.tooltipsitem.setPosition(toolpoint);
            this.tooltipslable.setPosition(cc.p(toolpoint.x - 60, toolpoint.y + 40));
            this.addChild(this.tooltipsitem);
            this.addChild(this.tooltipslable);
        }
    },
    hidetooltips: function () {
        this.removeChild(this.tooltipslable);
        this.removeChild(this.tooltipsitem);
        this.tooltipsitem = null;
    }
});


function ReInit(_Area) {
    var reinit = new Array();
    for (var _s in spriteLayer._children) {
        if (spriteLayer._children[_s].area == _Area) {
            reinit.push(spriteLayer._children[_s]);
        }
    }
    for (var _r in reinit) {
        var _sprite = reinit[_r];
        var point = GetPoint(_sprite.area, _r);
        _sprite.sprite.setPosition(point);
        _sprite.lable.setPosition(cc.p(point.x + 10, point.y + 15));
        _sprite.infoMenu.setPosition(point);
        if (_sprite.buf != null) {
            _sprite.buf.setPosition(cc.p(point.x - 4, point.y + 5));
        }
    }
}

function GetPoint(_Area, num) {
    for (var _o in Obj) {
        if (Obj[_o].name() == _Area) {
            var xpos = Obj[_o].width() / 32;
            var ypos = Obj[_o].height() / 32;
            var objpoint = Obj[_o].point();
            if (Number(num) + 1 > Math.floor(xpos) * Math.floor(ypos)) {
                cc.log("out of space");
            }
            else {
                var ynum = Math.floor(num / Math.floor(xpos));
                var xnum = num - ynum * Math.floor(xpos);
                var xpoint = objpoint.x + (xpos - xnum) * 32;
                var ypoint = objpoint.y + (ypos - ynum) * 32;
                return (new cc.p(xpoint - 16, ypoint - 16));
            }
        }
    }
}
function GetSex(sex) {
    for (var i in sexres) {
        if (i == sex) {
            return sexres[i];
        }
    }
}
function GetPersonAct(action) {
    for (var i in peractionres) {
        if (i == action) {
            return peractionres[i];
        }
    }
}

function GetEquipmentAct(action) {
    for (var i in Equactionres) {
        if (i == action) {
            return Equactionres[i];
        }
    }
}

function GetType(type) {
    for (var i in Typeres) {
        if (i == type) {
            return Typeres[i];
        }
    }
}

