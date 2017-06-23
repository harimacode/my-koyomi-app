function Model(aMyself) {
    this._myself = aMyself;
    aMyself.listener = this;
    this._others = [];
}
Model.prototype = {
    myself: function () {
        return this._myself;
    },
    others: function () {
        return this._others;
    },
    add: function (aItem) {
        this._others.push(aItem);
        aItem.listener = this;
        this._changed();
    },
    removeAt: function (aIndex) {
        this._others.splice(aIndex, 1);
        this._changed();
    },
    onChange: function () {
        this._changed();
    },
    _changed: function () {
        if (this.listener) {
            this.listener.onChange(this);
        }
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
    var k = new Item(null , 0);
    k._json = aJSON;
};
Item.prototype = {
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
    toJSON: function () {
        return this._json;
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
    onChange: function () {
        this.draw();
    },
};

function defaultMonth() {
    var now = new Date();
    return [now.getFullYear(), now.getMonth() + 1].join('-');
}
function savedMonth() {
    return localStorage.birthday
        ? localStorage.birthday
        : defaultMonth();
}

// TODO: make event target with babel
function BirthdaySettings(id, value, others) {
    this.elt = document.getElementById(id);
    this.setYearMonth(value);
    this.setup();
}
BirthdaySettings.prototype = {
    load: function (others) {
        if (!others) {
            return;
        }
        var that = this;
        others.forEach(function (aOther) {
            that.addBirthday(aOther);
        });
    },
    setup: function () {
        var that = this;
        
        var birthday = this.elt.querySelector('.birthday');
        birthday.addEventListener('change', function (e) {
            that.elt.dispatchEvent(new CustomEvent('month', {
                'detail': that.month()
            }));
            e.preventDefault();
        }, false);

        var addButton = this.elt.querySelector('.add');
        addButton.addEventListener('click', function (e) {
            var newName = that.elt.querySelector('.newName').value;
            var newBirthday = that.elt.querySelector('.newBirthday').value;
            that.addBirthday({
                'name': newName,
                'birthMonth': newBirthday,
            });
            e.preventDefault();
        }, false);
    },
    setYearMonth: function (aYearMonth) {
        var birthday = this.elt.querySelector('.birthday');
        var yearMonth = aYearMonth
            ? aYearMonth
            : defaultMonth();
        birthday.value = yearMonth.split('-')[1];
    },
    yearMonth: function () {
        var birthday = this.elt.querySelector('.birthday').value;
        return birthday
            ? '0000-' + birthday
            : defaultMonth();
    },
    month: function () {
        return parseInt(this.yearMonth().split('-')[1]);
    },
    birthdays: function () {
        var result = [];
        var items = this.elt.querySelectorAll('.birthdaysItem');
        Array.prototype.forEach.call(items, function (aItem) {
            var name = aItem.querySelector('.name').innerText;
            var birthMonth = aItem.querySelector('.birthMonth').innerText;
            result.push({
                'name': name,
                'birthMonth': birthMonth,
            });
        });
        return result;
    },
    addBirthday: function (aParams) {
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'birthday1';
        checkbox.checked = true;

        var text = document.createElement('div');
        text.className = 'birthdaysItem';
        var nameSpan = document.createElement('span');
        nameSpan.className = 'name';
        nameSpan.innerText = aParams.name;
        var separator = document.createElement('span');
        separator.innerText = ': ';
        var birthdaySpan = document.createElement('span');
        birthdaySpan.className = 'birthMonth';
        birthdaySpan.innerText = aParams.birthMonth;
        [nameSpan, separator, birthdaySpan].forEach(function (elt) {
            text.appendChild(elt);
        });

        var button = document.createElement('button');
        button.className = 'remove';
        button.innerText = '×';
        var that = this;
        button.addEventListener('click', function (e) {
            that.removeBirthday(e);
            e.preventDefault();
        }, false);

        var table = this.elt.querySelector('.birthdays');
        var tr = document.createElement('tr');
        var contents = [checkbox, text, button];
        contents.forEach(function (subElt) {
            var td = document.createElement('td');
            td.appendChild(subElt);
            tr.appendChild(td);
        });
        table.appendChild(tr);

        // dispatch add event to the settings elt
        this.elt.dispatchEvent(new CustomEvent('add', {
            'detail': this.birthMonthOf(tr)
        }));
    },
    removeBirthday: function (e) {
        var tr = e.target.parentNode.parentNode;
        var i = 0;
        for (i = 0; i < tr.parentNode.children.length; ++i) {
            if (tr == tr.parentNode.children[i]) {
                break;
            }
        }
        tr.parentNode.removeChild(tr);

        this.elt.dispatchEvent(new CustomEvent('remove', {
            'detail': i
        }));
    },
    birthMonthOf: function (tr) {
        var birthMonth = tr.querySelector('.birthMonth');
        var month = birthMonth.innerText;//.split('-')[1];
        return parseInt(month);
    },
};

function main() {
    var monthForms = document.querySelectorAll('.month');
    Array.prototype.forEach.call(monthForms, function (aSelect) {
        setupMonthForm(aSelect);
    });
    // localStorage.clear();
    var settings = new BirthdaySettings('settings',
        localStorage.birthday);

    var myKoyomi = new Item(null, settings.month());
    var model = new Model(myKoyomi);
    var view = new MyKoyomiView('koyomi', 0, 0, 300,
        model);
    model.listener = view;
    view.draw();

    settings.elt.addEventListener('month', function (e) {
        model.myself().setMonth(e.detail);
        localStorage.birthday = settings.yearMonth();
    }, false);

    settings.elt.addEventListener('add', function (e) {
        var koyomi = new Item(null, e.detail);
        model.add(koyomi);
        var s = JSON.stringify(settings.birthdays());
        localStorage.birthdays = s;
    }, false);
    settings.elt.addEventListener('remove', function (e) {
        model.removeAt(e.detail);
        var s = JSON.stringify(settings.birthdays());
        localStorage.birthdays = s;
    }, false);

    settings.load(localStorage.birthdays ? JSON.parse(localStorage.birthdays) : null);
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
