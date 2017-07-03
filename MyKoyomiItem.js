function MyKoyomiItem(aName, aMonth) {
    this._json = {
        'name': aName,
        'month': aMonth,
        'visible': true,
    }
}
MyKoyomiItem.fromJSON = function (aJSON) {
    var item = new MyKoyomiItem(null , 0);
    item._json = aJSON;
    return item;
};
MyKoyomiItem.prototype = {
    toJSON: function () {
        return this._json;
    },
    setName: function (aName) {
        this._json.name = aName;
        this._changed();
    },
    getName: function () {
        return this._json.name;
    },
    setMonth: function (aMonth) {
        this._json.month = aMonth;
        this._changed();
    },
    getMonth: function () {
        return this._json.month;
    },
    mukeFrom: function (aBase) {
        var adjustment = this.getMonth() - aBase.getMonth();
        var from = (7 - 12 + adjustment) % 12;
        var to   = adjustment;
        return {
            from: from,
            to:   to,
        };        
    },
    setVisible: function (aVisible) {
        this._json.visible = aVisible;
        this._changed();
    },
    isVisible: function () {
        return this._json.visible;
    },
    _changed: function () {
        if (this.listener) {
            this.listener.onChange();
        }
    },
};
