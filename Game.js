var columns = 3,
        rows = 6,
        pieceSize = 70, //px
        colors = ['red', 'orange', 'pink', 'purple'],
        minimumMatch = 3;

var Q = Quintus()
    .include("Sprites, Scenes")
    .setup({ width: columns * pieceSize, height: rows * pieceSize });

Q.Sprite.extend("Piece", {
    init: function (p) {
        this._super(p, {
            w: pieceSize,
            h: pieceSize
        });
    },

    draw: function (ctx) {
        ctx.fillStyle = this.p.color;
        //ctx.fillRect(-this.p.cx, -this.p.cy, this.p.w, this.p.h);
        ctx.beginPath();
        ctx.arc(0, 0, this.p.w / 2, 0, 2 * Math.PI);
        ctx.fillStyle = this.p.color;
        ctx.fill();
    }
});

Q.scene("gameboard", function (stage) {
    Q.gravity = 0;
    stage.insert(new Q.Sprite({ asset: "Tree.png", x: Q.el.width / 2, y: Q.el.height / 2, type: Q.SPRITE_NONE }));

    var c, r, column, piece;
    for (c = 0; c <= columns - 1; c++) {
        for (r = 0; r <= rows - 1; r++) {
            stage.insert(new Q.Piece({ color: randomColor(), x: pieceSize * c + pieceSize / 2, y: pieceSize * r + pieceSize / 2}));
        }
    }
    
});

Q.load(["Tree.png", "red.png"], function () {
    Q.stageScene("gameboard");
});


var randomColor = function () {
    return colors[Math.floor(Math.random() * (colors.length - 0.9))];
};
