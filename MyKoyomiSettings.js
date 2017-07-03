// TODO: make event target with babel
function MyKoyomiSettings(id, aModel) {
    this.elt = document.getElementById(id);
    this.index = 0;
    this.model = aModel;
    this.model.addListener(this);
    this.editMode = false;
    this.updateMyself();
    this.setup();
}
MyKoyomiSettings.prototype = {
    setup: function () {
        var that = this;
        
        var edit = document.getElementById('edit');
        edit.addEventListener('click', function (e) {
            that.toggleEditMode(e.target);
            e.preventDefault();
        }, false);
        
        var birthday = this.elt.querySelector('.birthday');
        birthday.addEventListener('change', function (e) {
            var month = parseInt(e.target.value);
            that.model.myself().setMonth(month);
            e.preventDefault();
        }, false);

        var addButton = this.elt.querySelector('.add');
        addButton.addEventListener('click', function (e) {
            var newName = that.elt.querySelector('.newName');
            var newBirthday = that.elt.querySelector('.newBirthday');
            var newItem = new MyKoyomiItem(newName.value,
                newBirthday.value);
            that.model.add(newItem);
            newName.value = '';
            e.preventDefault();
        }, false);

        this.model.others().forEach(function (aOther) {
            that.addSettingItem(aOther);
        });
    },
    toggleEditMode: function () {
        this.editMode = !this.editMode;
        this.updateHiddenState();
    },
    updateMyself: function () {
        var birthday = this.elt.querySelector('.birthday');
        birthday.value = this.model.myself().getMonth();
    },
    updateHiddenState: function () {
        var edit = document.getElementById('edit');
        edit.innerText = this.editMode ? '完了' : '編集';
    
        var show = function (aElt) {
            aElt.classList.remove('hidden');
        };
        var hide = function (aElt) {
            aElt.classList.add('hidden');
        };
        var inEditMode = document.querySelectorAll('.inEditMode');
        Array.prototype.forEach.call(inEditMode,
            this.editMode ? show : hide);
        var notInEditMode = document.querySelectorAll('.notInEditMode');
        Array.prototype.forEach.call(notInEditMode,
            this.editMode ? hide : show);
    },
    addSettingItem: function (aItem) {
        var that = this;

        var id = this.newId();

        var button = document.createElement('button');
        button.className = 'remove inEditMode';
        button.innerText = '×';
        button.addEventListener('click', function (e) {
            var index = that.indexOf(e.target);
            that.model.removeAt(index);
            e.preventDefault();
        }, false);

        var color = document.createElement('span');
        color.className = 'color';
        var name = document.createElement('span');
        name.innerText = aItem.getName();
        var month = document.createElement('span');
        month.innerText = aItem.getMonth() + '月';

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.className = 'birthday1 notInEditMode';
        checkbox.checked = aItem.isVisible();
        checkbox.addEventListener('change', function (e) {
            var visible = e.target.checked;
            var index = that.indexOf(e.target);
            that.model.others()[index].setVisible(visible);
        }, false);

        var table = this.elt.querySelector('.birthdays');
        var tr = document.createElement('label');
        tr.className = 'tr';
        tr.setAttribute('for', id);
        [
            [button, 'shrink'],
            [color, 'shrink'],
            [name, 'half'],
            [month, 'half right'],
            [checkbox, 'shrink'],
        ].forEach(function (aPair) {
            var elt = aPair[0];
            var className = aPair[1];
            var td = document.createElement('span');
            td.className = ['td', className].join(' ');
            td.appendChild(elt);
            tr.appendChild(td);
        });
        table.appendChild(tr);
        
        this.updateHiddenState();
        this.updateColors();
    },
    newId: function () {
        return 'input' + this.index++;
    },
    indexOf: function (button) {
        var tr = this.ancestorOf(button, 'label');
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
        var tr = table.querySelectorAll('label')[aIndex];
        tr.parentNode.removeChild(tr);
        
        this.updateColors();
    },
    updateColors: function () {
        var colors = document.querySelectorAll('.color');
        for (var i = 0; i < colors.length; ++i) {
            colors[i].style.backgroundColor = this.model.hslAt(i + 1);
        }
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
