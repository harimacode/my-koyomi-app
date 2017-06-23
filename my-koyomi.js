function main() {
    var monthForms = document.querySelectorAll('.month');
    Array.prototype.forEach.call(monthForms, function (aSelect) {
        setupMonthForm(aSelect);
    });
    // localStorage.clear();
    var model = null;
    if (localStorage.saved) {
        model = MyKoyomiModel.fromJSON(JSON.parse(localStorage.saved));
    }
    if (!model) {
        var myKoyomi = new MyKoyomiItem(null, new Date().getMonth() + 1);
        model = new MyKoyomiModel(myKoyomi);
    }
    var settings = new MyKoyomiSettings('settings',
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
