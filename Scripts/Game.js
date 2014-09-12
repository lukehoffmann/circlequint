var columns = 3,
        rows = 6,
        pieceSize = 100, //px
        colors = ['red', 'orange', 'pink', 'purple'],
        minimumMatch = 3;

var Q = Quintus()
    .include("Sprites, Scenes, Touch")
    .setup({
        width: columns * pieceSize,
        height: rows * pieceSize
    });

Q.touch(Q.SPRITE_FRIENDLY);

Q.Sprite.extend("Piece", {
    init: function (p) {
        this._super(p, {
            w: pieceSize,
            h: pieceSize
        });
        this.on('touch');
    },
    
    draw: function (ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, this.p.w / 2, 0, 2 * Math.PI);
        ctx.fillStyle = this.p.color;
        ctx.fill();
    },
    
    touch: function () { this.p.destroyPiece(this); },

    drop: function () {
        console.log(this.p.y);
        this.p.y += pieceSize;
        console.log(this.p.y);
    }
});

Q.scene("gameboard", function (stage) {
    Q.gravity = 1;
    stage.insert(new Q.Sprite({
        asset: "Tree.png",
        x: Q.el.width / 2,
        y: Q.el.height / 2,
        type: Q.SPRITE_NONE
    }));

    var pieces = [];

    var destroyPiece = function (piece) {
        var column = piece.p.column,
            row = piece.p.row, 
            r;
        //pieces[column][row] = null;
        piece.destroy();

        for (r = row; r > 0; r--) {
            pieces[column][r - 1].drop();
        }
    };

    var c, r;
    for (c = 0; c <= columns - 1; c++) {
        pieces[c] = [];
        for (r = 0; r <= rows - 1; r++) {
            pieces[c][r] = stage.insert(new Q.Piece({
                color: randomColor(),
                column: c,
                row: r,
                x: pieceSize * c + pieceSize / 2,
                y: pieceSize * r + pieceSize / 2,
                destroyPiece: destroyPiece,
                type: Q.SPRITE_FRIENDLY
            }));
        }
    }
    
});

Q.load(["Tree.png", "red.png"], function () {
    Q.stageScene("gameboard");
});

var randomColor = function () {
    return colors[Math.floor(Math.random() * (colors.length - 0.9))];
};

//var addClassToAdjacentPieces = function (div, newClass, color) {
//    color = color || div.data('color');

//    if (div && div.data('color') === color && !div.hasClass(newClass)) {
//        var c = +piecePos(div).column,
//            r = +piecePos(div).row;

//        div.addClass(newClass);
//        return 1
//        + addClassToAdjacentPieces(getPiece(c, r - 1), newClass, color)
//        + addClassToAdjacentPieces(getPiece(c, r + 1), newClass, color)
//        + addClassToAdjacentPieces(getPiece(c - 1, r), newClass, color)
//        + addClassToAdjacentPieces(getPiece(c + 1, r), newClass, color);
//    } else {
//        return 0;
//    }
//};
