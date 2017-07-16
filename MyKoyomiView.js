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
    ctx.globalCompositeOperation = 'darker';
}
MyKoyomiView.prototype = {
    draw: function () {
        var ctx = this.elt.getContext('2d');
        // for retina

        ctx.clearRect(this.x, this.y, this.size, this.size);

        var alphaUnit = 1 / (this.model.visibleCount() + 1);
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

        var that = this;
        [
            // 野巫
            [1, 1],
            // 盆
            [8.3, 0.3],
            // 冬
            [(this.model.myself().getMonth() + 12 - 1) % 12, 1],
        ].forEach(function (aBadPeriod) {
            var from = aBadPeriod[0];
            var to   = from + aBadPeriod[1];
            that.drawMuke(ctx, from, to,
                that.size / 3 + that.ukeLineWidth() * that.model.visibleCount(),
                alphaUnit);
        });
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

        var m = k.getMuke();
        this.drawMuke(ctx, m.from, m.to, this.size / 3, alpha);
        
        this.temp(ctx, function () {
            ctx.beginPath();
            this.arc(ctx, m.to, m.from,
                this.size / 3 + this.ukeLineWidth() * (this.model.visibleIndexOf(k) + 0.5));
            ctx.lineWidth = this.ukeLineWidth();
            ctx.strokeStyle = this.model.hslAt(i);
            ctx.stroke();
       });
    },
    drawMuke: function (ctx, from, to, r, alpha) {
        this.temp(ctx, function () {
            ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            this.pie(ctx, from, to, r);
            ctx.fill()
        });
    },
    temp: function (c, fn) {
        c.save();
        fn.call(this);
        c.restore();
    },
    pie: function (ctx, from, to, r) {
        ctx.beginPath();
        ctx.moveTo(
            this.x + this.size / 2,
            this.y + this.size / 2);
        this.arc(ctx, from, to, r);
    },
    monthToDegree: function (aMonth) {
        var relMonth = (aMonth - this.model.myself().getMonth() + 12) % 12;
        return 360 * relMonth / 12;
    },
    arc: function (ctx, from, to, r) {
        var start = this.monthToDegree(from);
        var end   = this.monthToDegree(to);
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
    onChange: function (aAdded, aRemovedIndex) {
        this.draw();
    },
};
