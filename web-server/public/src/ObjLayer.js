var Obj = new Array();

function ObjLayer(s_name, s_point, s_width, s_height) {
    var _name = s_name;
    var _point = s_point;
    var _width = s_width;
    var _height = s_height;
    this.name = function () {
        return _name;
    };
    this.point = function () {
        return _point;
    };
    this.width = function () {
        return _width;
    };
    this.height = function () {
        return _height;
    };
}