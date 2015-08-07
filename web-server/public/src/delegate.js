var currentareasprite;
var audioEngine;
//_pid 显示在图标上的tile,_area 定位器编号,_type 定位对象类型,_action 加载类型（移动,呼叫,报警等）,_img 加载图片,_tooltip 显示类容
//病人：Pat，医生：Doc，护士：Nurse，婴儿：Baby，嘉宾：Guest，设备：Equipment
var a;
function delegate(_pid, _area, _sex, _action, _type, _img, _tooltip, _right, _call) {
    //隐藏病区信息
    _tooltip =_tooltip.substring(0,_tooltip.lastIndexOf("病区："));
    var _Sprite = null;
    var s_sex = GetSex(_sex);
    var s_action = s_sex != null ? GetPersonAct(_action) : GetEquipmentAct(_action);
    var s_type = GetType(_type)
    var s_img = s_sex != null ? Sprite_animation : "res/Sprite/" + _img + ".png";
    if (s_sex == null) {
        s_sex = cc.p(0, 0);
    }
    audioEngine = cc.AudioEngine.getInstance();
    if (_action == "Call") {
        audioEngine.playMusic("res/voice/" + _call, true);
    }
    if (_action == "Stop") {
        audioEngine.stopMusic();
        try {
            var targetOrigin = '*';
            window.top.postMessage('Stop$' + _type + '$' + _pid, targetOrigin);
        }
        catch (e) { }
    }
    if (_action == "Alarm") {
        try {
            var targetOrigin = '*';
            window.top.postMessage('Alarm$' + _type + '$' + _pid, targetOrigin);
        }
        catch (e) { }
    }
    if (_action == "FinishCallStuff") {
        try {
            var targetOrigin = '*';
            window.top.postMessage('FinishCallStuff$' + _type + '$' + _pid, targetOrigin);
        }
        catch (e) { }
    }

    if (_action == "StopAlarm") {
        try {
            var targetOrigin = '*';
            window.top.postMessage('StopAlarm$' + _type + '$' + _pid, targetOrigin);
        }
        catch (e) { }
    }
    currentareasprite = 0;
    var iscreated = false;
    for (var _s in spriteLayer._children) {
        cc.log(spriteLayer._children[_s].pid + ",,," + _pid);
        if (spriteLayer._children[_s].pid == _pid) {
            _Sprite = spriteLayer._children[_s];
            iscreated = true;
        }
        if (spriteLayer._children[_s].area == _area) {
            currentareasprite++;
        }
    };
    cc.log(iscreated);
    if (!iscreated) {
        var _sprite = new playSprite(_pid, _area, s_sex, s_action, s_type, s_img, _tooltip, _right, _call);
        spriteLayer.addChild(_sprite);

        try {
            var targetOrigin = '*';
            window.top.postMessage('Add$' + _type + '$' + _pid, targetOrigin);
        }
        catch (e) { }
    }
    else {
        if (s_action == "Remove") {
            var _reinit = _Sprite.area;
            spriteLayer.removeChild(_Sprite, false);
            ReInit(_reinit);
            try {
                var targetOrigin = '*';
                window.top.postMessage('Remove$' + _type + '$' + _pid, targetOrigin);
            }
            catch (e) { }
        }
        else {
            _Sprite.onAction(_area, s_action);
        }
    }
}

window.addEventListener('message', function (event) {
    var _text = event.data.split("$");
    try {
        delegate(_text[0], _text[1], _text[2], _text[4], _text[3], _text[5], _text[6], _text[7], _text[8]);
    }
    catch (e) { }
}, false);