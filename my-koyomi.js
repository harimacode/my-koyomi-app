function MyKoyomiView(id, x, y, size, myKoyomi) {
    this.elt = document.getElementById(id);
    this.x = x;
    this.y = y;
    this.size = size;
    this.mine = myKoyomi;
    this.others = [];

    this.elt.width  = size * 2;
    this.elt.height = size * 2;
    this.elt.style.width  = size + 'px';
    this.elt.style.height = size + 'px';

    var ctx = this.elt.getContext('2d');
    // for retina
    ctx.scale(2, 2);
}
MyKoyomiView.prototype = {
    setBirthMonth: function (aMonth) {
        this.mine = aMonth;
        this.draw();
    },
    add: function (aOther) {
        this.others.push(aOther);
    },
    removeAt: function (aIndex) {
        this.others.splice(aIndex, 1);
    },
    draw: function () {
        var ctx = this.elt.getContext('2d');
        // for retina

        ctx.clearRect(this.x, this.y, this.size, this.size);

        var alphaUnit = 1 / (2 + this.others.length);
        this.drawOnesKoyomi(ctx, this.mine, alphaUnit * 2);
        for (var other of this.others) {
            this.drawOnesKoyomi(ctx, other, alphaUnit);
        }

        for (var i = 0; i < 12; ++i) {
            this.putLabel(ctx, i * 360 / 12, (i + this.mine - 1) % 12 + 1);
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
    drawOnesKoyomi: function (ctx, k, alpha) {
        ctx.beginPath();
        ctx.arc(
            this.x + this.size / 2,
            this.y + this.size / 2,
            this.size / 3,
            0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();

        var adjustment = k - this.mine;
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
    // localStorage.clear();
    var settings = new BirthdaySettings('settings',
        localStorage.birthday);

    var view = new MyKoyomiView('koyomi', 0, 0, 300,
        settings.month());
    view.draw();

    settings.elt.addEventListener('month', function (e) {
        view.setBirthMonth(e.detail);
        localStorage.birthday = settings.yearMonth();
    }, false);

    settings.elt.addEventListener('add', function (e) {
        view.add(e.detail);
        var s = JSON.stringify(settings.birthdays());
        localStorage.birthdays = s;
        view.draw();
    }, false);
    settings.elt.addEventListener('remove', function (e) {
        view.removeAt(e.detail);
        var s = JSON.stringify(settings.birthdays());
        localStorage.birthdays = s;
        view.draw();
    }, false);

    settings.load(localStorage.birthdays ? JSON.parse(localStorage.birthdays) : null);
}
