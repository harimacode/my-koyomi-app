function MyKoyomiModel(aMyself) {
    this._myself = aMyself;
    aMyself.listener = this;
    this._groups = [];
    this._listeners = [];
}
MyKoyomiModel.fromJSON = function (aJSON) {
    var myself = MyKoyomiItem.fromJSON(aJSON.myself);
    var model = new MyKoyomiModel(myself);
    aJSON.groups.forEach(function (aGroup) {
        model.add(MyKoyomiGroup.fromJSON(aGroup));
    });
    return model;
};
MyKoyomiModel.prototype = {
    toJSON: function () {
        var groups = [];
        this._groups.forEach(function (aGroup) {
            groups.push(aGroup.toJSON())
        });
        return {
            'myself': this._myself.toJSON(),
            'groups': groups,
        };
    },
    myself: function () {
        return this._myself;
    },
    defaultGroup: function () {
        if (this._groups.length < 1) {
            var group = new MyKoyomiGroup();
            this._groups.push(group);
            group.listener = this;
        }
        return this._groups[0];
    },
    others: function () {
        return this.defaultGroup().others();
    },
    all: function () {
        return [this._myself].concat(this.defaultGroup().others());
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
        return this.defaultGroup().visibleCount();
    },
    hslAt: function (aIndex) {
        var COLORS = 7;
        var hue = 360 * (aIndex % COLORS) / COLORS;
        return 'hsl(' + hue + ', 100%, 85%)';
    },
    add: function (aItem) {
        this.defaultGroup().add(aItem);
    },
    removeAt: function (aIndex) {
        this.defaultGroup().removeAt(aIndex);
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
    onGroupChange: function (aAdded, aRemovedIndex) {
        this._changed(aAdded, aRemovedIndex);
    },
    _changed: function (aAdded, aRemovedIndex) {
        this._listeners.forEach(function (aListener) {
            aListener.onChange(aAdded, aRemovedIndex);
        });
    },
};
