var map_zt = "res/Maps/zt.tmx";
var map_zt_res = "res/Maps/zt.png";

var map_ward = "res/Maps/ward.tmx";
var map_ward_res = "res/Maps/ward.png";

var map_operating = "res/Maps/operating.tmx";
var map_operating_res = "res/Maps/operating.png";

var map_Nephrology = "res/Maps/Nephrology.tmx";
var map_Nephrology_res = "res/Maps/Nephrology.png";

var Sprite_animation = "res/Sprite/Sprite.png";
var Sprite_Buf = "res/Sprite/SpriteBuf.png";
var Empty = "res/Sprite/empty.png";
var Tips1 = "res/Sprite/tips1.png";
var Tips2 = "res/Sprite/tips2.png";
var g_resources = [
//image
	{ src: map_zt_res },
	{ src: map_ward_res },
    { src: map_operating_res },
    { src: map_Nephrology_res },
    { src: Sprite_animation },
    { src: Sprite_Buf },
    { src: Empty },
//plist

//fnt

//tmx
	{ src: map_zt },
	{ src: map_ward },
    { src: map_operating },
    { src: map_Nephrology }
//bgm

//effect
];
//var zt_obj = {
//    "Home": "258", "Pension": "Pension", "Community": "Community",
//    "Platform": "Platform", "VIP": "VIP", "ICU": "ICU",
//    "NurseStation": "NurseStation", "Baby": "Baby",
//    "Reservation": "Reservation", "Mix": "487", "Reception": "Reception",
//    "SandBox": "SandBox", "Emergency": "Emergency", "Outpatient": "Outpatient",
//    "Infusion": "Infusion", "Storage": "Storage", "Endoscopic": "Endoscopic",
//    "Operating": "Operating"
//};

//var ward_obj = {
//    "DocOffice": "271", "fs": "315"
//};

//var op_obj = {
//    "storehouse": "271", "WFR": "315"
//};

//var ne_obj = {
//    "emergency": "271", "nursestation": "315"
//};
var mapres = { "1040133": map_ward, "1010301": map_zt };
//var mapobjres = { "res/Maps/zt.tmx": zt_obj, "res/Maps/ward.tmx": ward_obj, "res/Maps/operating.tmx": op_obj, "res/Maps/Nephrology.tmx": ne_obj };

var sexres = { "Man": cc.p(3, 0), "Female": cc.p(4, 0), "NULL": null, "None": null };

var peractionres = { "Slide": [cc.p(2, 0), null], "Call": [cc.p(1, 0), cc.p(2, 0)], "Stop": "Stop", "Remove": "Remove", "Alarm": [cc.p(1, 0), cc.p(2, 0)], "FinishCallStuff": "Stop", "StopAlarm": "Stop" };
var Equactionres = { "Slide": [cc.p(2, 0), null], "Call": [cc.p(1, 0), cc.p(2, 0)], "Stop": "Stop", "Remove": "Remove", "Alarm": [cc.p(1, 0), cc.p(2, 0)] };

var Typeres = { "Doc": cc.p(0, 0), "Pat": cc.p(1, 0), "Baby": cc.p(2, 0), "Equipment": null, "Nurse": cc.p(0, 0), "Guest": cc.p(1, 0) };

function GetAnimation(_Sex, Action, Image) {   //please make sure the last animframes is the defult pic
    //cc.log(Action);
    var texture = cc.TextureCache.getInstance().addImage(Image);
    var frams1 = cc.SpriteFrame.createWithTexture(texture, cc.rect(32 * Action[0].x, 32 * Action[0].y, 32, 32));
    var frams2 = Action[1] == null ? cc.SpriteFrame.createWithTexture(texture, cc.rect(32 * _Sex.x, 32 * _Sex.y, 32, 32)) : cc.SpriteFrame.createWithTexture(texture, cc.rect(32 * Action[1].x, 32 * Action[1].y, 32, 32));
    //Animation
    var animFrames = [];
    animFrames.push(frams1);
    animFrames.push(frams2);
    var animation = cc.Animation.create(animFrames, 0.2);
    var seq = cc.Animate.create(animation);
    return Action[1] == null ? cc.Repeat.create(seq, 3) : cc.RepeatForever.create(seq);
}