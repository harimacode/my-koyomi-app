function MyKoyomiGroup(aName) {
   this._name = aName;
   this._others = [];
}
MyKoyomiGroup.fromJSON = function (aJSON) {
    var model = new MyKoyomiGroup(aJSON.name);
    aJSON.others.forEach(function (aOther) {
        model.add(MyKoyomiItem.fromJSON(aOther));
    });
    return model;
};
MyKoyomiGroup.prototype = {
    toJSON: function () {
        var others = [];
        this._others.forEach(function (aOther) {
            others.push(aOther.toJSON())
        });
        return {
            'name':   this._name,
            'others': others,
        };
    },
    name: function () {
        return this._name;
    },
    others: function () {
        return this._others;
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
    onChange: function () {
        this._changed(null, -1);
    },
    _changed: function (aAdded, aRemovedIndex) {
        if (this.listener) {
            this.listener.onGroupChange(aAdded, aRemovedIndex);
        }
    },
};
