// TODO: make event target with babel
function MyKoyomiSettings(id, aModel) {
    this.elt = document.getElementById(id);
    this.index = 0;
    this.model = aModel;
    this.model.addListener(this);
    this.updateMyself();
    this.setup();
}
MyKoyomiSettings.prototype = {
    setup: function () {
        var that = this;
        
        var birthday = this.elt.querySelector('.birthday');
        birthday.addEventListener('change', function (e) {
            var month = parseInt(e.target.value);
            that.model.myself().setMonth(month);
            e.preventDefault();
        }, false);

        var addButton = this.elt.querySelector('.add');
        addButton.addEventListener('click', function (e) {
            var newName = that.elt.querySelector('.newName').value;
            var newBirthday = that.elt.querySelector('.newBirthday').value;
            var newItem = new MyKoyomiItem(newName, newBirthday);
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
        var that = this;

        var id = this.newId();

        var name = document.createElement('label');
        name.innerText = aItem.getName();
        name.setAttribute('for', id);
        var month = document.createElement('label');
        month.innerText = aItem.getMonth() + '月';
        month.setAttribute('for', id);

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.className = 'birthday1';
        checkbox.checked = aItem.isVisible();
        checkbox.addEventListener('change', function (e) {
            var visible = e.target.checked;
            var index = that.indexOf(e.target);
            that.model.others()[index].setVisible(visible);
        }, false);

        var button = document.createElement('button');
        button.className = 'remove';
        button.innerText = '×';
        button.addEventListener('click', function (e) {
            var index = that.indexOf(e.target);
            that.model.removeAt(index);
            e.preventDefault();
        }, false);

        var table = this.elt.querySelector('.birthdays');
        var tr = document.createElement('tr');
        [
            [name, 'half'],
            [month, 'right'],
            [checkbox, 'shrink'],
            [button, 'shrink']
        ].forEach(function (aPair) {
            var elt = aPair[0];
            var className = aPair[1];
            var td = document.createElement('td');
            td.appendChild(elt);
            td.className = className;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    },
    newId: function () {
        return 'input' + this.index++;
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
