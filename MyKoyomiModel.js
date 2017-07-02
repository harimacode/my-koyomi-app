function MyKoyomiModel(aMyself) {
    this._myself = aMyself;
    aMyself.listener = this;
    this._others = [];
    this._listeners = [];
}
MyKoyomiModel.fromJSON = function (aJSON) {
    var myself = MyKoyomiItem.fromJSON(aJSON.myself);
    var model = new MyKoyomiModel(myself);
    aJSON.others.forEach(function (aOther) {
        model.add(MyKoyomiItem.fromJSON(aOther));
    });
    return model;
};
MyKoyomiModel.prototype = {
    toJSON: function () {
        var others = [];
        this._others.forEach(function (aOther) {
            others.push(aOther.toJSON())
        });
        return {
            'myself': this._myself.toJSON(),
            'others': others,
        };
    },
    myself: function () {
        return this._myself;
    },
    others: function () {
        return this._others;
    },
    all: function () {
        return [this._myself].concat(this._others);
    },
    visibleIndexOf: function (aItem) {
        var i = 0;
        var found = -1;
        this.all().forEach(function (theItem) {
            if (aItem == theItem) {
                found = i;
            }
            if (theItem.isVisible()) {
                i++;
            }
        });
        return found;
    },
    visibleCount: function () {
        var i = 1;
        this._others.forEach(function (aOther) {
            if (aOther.isVisible()) {
                i++;
            }
        });
        return i;
    },
    add: function (aItem) {
        this._others.push(aItem);
        aItem.listener = this;
        this._changed(aItem, -1);
    },
    removeAt: function (aIndex) {
        this._others.splice(aIndex, 1);
        this._changed(null, aIndex);
    },
    addListener: function (aListener) {
        this._listeners.push(aListener);
    },
    removeListener: function (aListner) {
        var found = this._listeners.indexOf(aListner);
        if (found > -1) {
            this._listeners.splice(found, 1);
        }
    },
    onChange: function () {
        this._changed(null, -1);
    },
    _changed: function (aAdded, aRemovedIndex) {
        this._listeners.forEach(function (aListener) {
            aListener.onChange(aAdded, aRemovedIndex);
        });
    },
};
