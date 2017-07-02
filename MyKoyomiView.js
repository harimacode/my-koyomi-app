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

        var alphaUnit = 1 / this.model.visibleCount();
        var all = this.model.all();
        for (var i = 0; i < all.length; ++i) {
            this.drawItem(ctx, all[i], i, alphaUnit);
        }
        ctx.beginPath();
        ctx.arc(
            this.x + this.size / 2,
            this.y + this.size / 2,
            this.size / 3,
            0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();

        var month = this.model.myself().getMonth();
        for (var i = 0; i < 12; ++i) {
            this.putLabel(ctx, i * 360 / 12, (i + month - 1) % 12 + 1);
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
    drawItem: function (ctx, k, i, alpha) {
        if (!k.isVisible()) {
            return;
        }

        var adjustment = k.getMonth() - this.model.myself().getMonth();
        var from = (7 - 12 + adjustment) % 12;
        var to   = adjustment;
        this.temp(ctx, function () {
            ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            this.pie(ctx, from * 360 / 12, to * 360 / 12);
            ctx.fill()
        });
        
        this.temp(ctx, function () {
            ctx.beginPath();
            this.arc(ctx,
                to * 360 / 12,
                from * 360 / 12,
                this.size / 3 + this.ukeLineWidth() * (i + 0.5));
            ctx.lineWidth = this.ukeLineWidth();
            ctx.lineCap = 'round';
            ctx.strokeStyle = this.hslAt(i);
            ctx.stroke();
       });
    },
    temp: function (c, fn) {
        c.save();
        fn.call(this);
        c.restore();
    },
    pie: function (ctx, start, end) {
        ctx.beginPath();
        ctx.moveTo(
            this.x + this.size / 2,
            this.y + this.size / 2);
        this.arc(ctx, start, end, this.size / 3);
    },
    arc: function (ctx, start, end, r) {
        ctx.arc(
            this.x + this.size / 2,
            this.y + this.size / 2,
            r,
            (-.25 + start / 360) * 2 * Math.PI,
            (-.25 + end   / 360) * 2 * Math.PI);
    },
    ukeLineWidth: function () {
        var dia = this.size / 3 * 2;
        var remainder = this.size - dia;
        var width = (remainder / 2) / this.model.visibleCount();
        var maxWidth = (remainder / 2) / 3;
        return Math.min(width, maxWidth);
    },
    hslAt: function (aIndex) {
        var COLORS = 7;
        var hue = 360 * (aIndex % COLORS) / COLORS;
        return 'hsl(' + hue + ', 100%, 93%)';
    },
    onChange: function (aAdded, aRemovedIndex) {
        this.draw();
    },
};
