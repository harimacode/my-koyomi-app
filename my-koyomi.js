function Model(aMyself) {
    this._myself = aMyself;
    aMyself.listener = this;
    this._others = [];
    this._listeners = [];
}
Model.fromJSON = function (aJSON) {
    var myself = Item.fromJSON(aJSON.myself);
    var model = new Model(myself);
    aJSON.others.forEach(function (aOther) {
        model.add(Item.fromJSON(aOther));
    });
    return model;
};
Model.prototype = {
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
function Item(aName, aMonth) {
    this._json = {
        'name': aName,
        'month': aMonth,
        'visible': true,
    }
}
Item.fromJSON = function (aJSON) {
    var item = new Item(null , 0);
    item._json = aJSON;
    return item;
};
Item.prototype = {
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
function MyKoyomiView(id, x, y, size, aModel) {
    this.elt = document.getElementById(id);
    this.x = x;
    this.y = y;
    this.size = size;
    this.model = aModel;
    this.model.addListener(this);
 
    this.elt.width  = size * 2;
    this.elt.height = size * 2;
    this.elt.style.width  = size + 'px';
    this.elt.style.height = size + 'px';

    var ctx = this.elt.getContext('2d');
    // for retina
    ctx.scale(2, 2);
}
MyKoyomiView.prototype = {
    draw: function () {
        var ctx = this.elt.getContext('2d');
        // for retina

        ctx.clearRect(this.x, this.y, this.size, this.size);

        var alphaUnit = 1 / (2 + this.model.others().length);
        this.drawItem(ctx, this.model.myself(), alphaUnit * 2);
        for (var other of this.model.others()) {
            this.drawItem(ctx, other, alphaUnit);
        }

        for (var i = 0; i < 12; ++i) {
            this.putLabel(ctx, i * 360 / 12, (i + this.model.myself().getMonth() - 1) % 12 + 1);
        }
    },
    putLabel: function (ctx, degree, label) {
        var rad = 2 * Math.PI * (-.25 + degree / 360);
        var fontSize = Math.ceil(20 / 300 * this.size);
        ctx.font = fontSize + 'px serif';
        var textSize = ctx.measureText(label);
        var len = this.size / 3 + fontSize;
        var x = this.x + this.size / 2 + len * Math.cos(rad) - textSize.width / 2;
        var y = this.y + this.size / 2 + len * Math.sin(rad) + fontSize / 2;
        ctx.fillStyle = 'black';
        ctx.fillText(label, x, y);
    },
    drawItem: function (ctx, k, alpha) {
        if (!k.isVisible()) {
            return;
        }
        ctx.beginPath();
        ctx.arc(
            this.x + this.size / 2,
            this.y + this.size / 2,
            this.size / 3,
            0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();

        var adjustment = k.getMonth() - this.model.myself().getMonth();
        var from = (7 - 12 + adjustment) % 12;
        var to   = adjustment;
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
        this.pie(ctx, from * 360 / 12, to * 360 / 12, true);
    },
    pie: function (ctx, start, end, fill) {
        ctx.beginPath();
        ctx.moveTo(
            this.x + this.size / 2,
            this.y + this.size / 2);
        ctx.arc(
            this.x + this.size / 2,
            this.y + this.size / 2,
            this.size / 3,
            (-.25 + start / 360) * 2 * Math.PI,
            (-.25 + end   / 360) * 2 * Math.PI);
        ctx.fill();
    },
    onChange: function (aAdded, aRemovedIndex) {
        this.draw();
    },
};

// TODO: make event target with babel
function BirthdaySettings(id, aModel) {
    this.elt = document.getElementById(id);
    this.model = aModel;
    this.model.addListener(this);
    this.updateMyself();
    this.setup();
}
BirthdaySettings.prototype = {
    setup: function () {
        var that = this;
        
        var birthday = this.elt.querySelector('.birthday');
        birthday.addEventListener('change', function (e) {
            that.model.myself().setMonth(e.target.value);
            e.preventDefault();
        }, false);

        var addButton = this.elt.querySelector('.add');
        addButton.addEventListener('click', function (e) {
            var newName = that.elt.querySelector('.newName').value;
            var newBirthday = that.elt.querySelector('.newBirthday').value;
            var newItem = new Item(newName, newBirthday);
            that.model.add(newItem);
            e.preventDefault();
        }, false);

        this.model.others().forEach(function (aOther) {
            that.addSettingItem(aOther);
        });
    },
    updateMyself: function () {
        var birthday = this.elt.querySelector('.birthday');
        birthday.value = this.model.myself().getMonth();
    },
    addSettingItem: function (aItem) {
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'birthday1';
        checkbox.checked = true;

        var text = document.createElement('div');
        text.className = 'birthdaysItem';
        var nameSpan = document.createElement('span');
        nameSpan.className = 'name';
        nameSpan.innerText = aItem.getName();
        var separator = document.createElement('span');
        separator.innerText = ': ';
        var birthdaySpan = document.createElement('span');
        birthdaySpan.className = 'birthMonth';
        birthdaySpan.innerText = aItem.getMonth();
        [nameSpan, separator, birthdaySpan].forEach(function (aElt) {
            text.appendChild(aElt);
        });

        var button = document.createElement('button');
        button.className = 'remove';
        button.innerText = '×';
        var that = this;
        button.addEventListener('click', function (e) {
            var index = that.indexOf(e.target);
            that.model.removeAt(index);
            e.preventDefault();
        }, false);

        var table = this.elt.querySelector('.birthdays');
        var tr = document.createElement('tr');
        [checkbox, text, button].forEach(function (aElt) {
            var td = document.createElement('td');
            td.appendChild(aElt);
            tr.appendChild(td);
        });
        table.appendChild(tr);
    },
    indexOf: function (button) {
        var tr = this.ancestorOf(button, 'tr');
        var trs = tr.parentNode.children;
        var count = trs.length;
        for (var i = 0; i < count; ++i) {
            if (trs[i] == tr) {
                return i;
            }
        }
        return -1;
    },
    ancestorOf: function (aElt, aTag) {
        var elt = aElt;
        while (elt) {
            if (elt.tagName.toLowerCase() == aTag.toLowerCase()) {
                return elt;
            }
            elt = elt.parentNode;
        }
        return null;
    },
    removeSettingItemAt: function (aIndex) {
        var table = this.elt.querySelector('.birthdays');
        var tr = table.querySelectorAll('tr')[aIndex];
        tr.parentNode.removeChild(tr);
    },
    onChange: function (aAdded, aRemovedIndex) {
        if (aAdded) {
            this.addSettingItem(aAdded);
        }
        if (aRemovedIndex > -1) {
            this.removeSettingItemAt(aRemovedIndex);
        }

        localStorage.saved = JSON.stringify(this.model.toJSON());
    },
};

function main() {
    var monthForms = document.querySelectorAll('.month');
    Array.prototype.forEach.call(monthForms, function (aSelect) {
        setupMonthForm(aSelect);
    });
    // localStorage.clear();
    var model = null;
    if (localStorage.saved) {
        model = Model.fromJSON(JSON.parse(localStorage.saved));
    }
    if (!model) {
        var myKoyomi = new Item(null, new Date().getMonth() + 1);
        model = new Model(myKoyomi);
    }
    var settings = new BirthdaySettings('settings',
        model);
    var view = new MyKoyomiView('koyomi', 0, 0, 300,
        model);
    view.draw();
}
function setupMonthForm(aSelect) {
    for (var i = 0; i < 12; ++i) {
        var month = i + 1;
        var option = document.createElement('option');
        option.value = month;
        option.innerText = month + '月';
        aSelect.appendChild(option);
    }
}
window.addEventListener('load', function () {
    main();
}, false);
