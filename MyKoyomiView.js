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
