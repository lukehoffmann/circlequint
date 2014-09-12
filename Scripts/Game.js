var columns = 3,
        rows = 6,
        pieceSize = 25, //px
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
    
    touch: function () {
        this.p.destroyPiece(this);
    },
    
    moveTo: function(column, row) {
        this.p.column = column;
        this.p.row = row;
        this.p.x = pieceSize * column + pieceSize / 2;
        this.p.y = pieceSize * row + pieceSize / 2;
        return this;
    }
});

Q.scene("gameboard", function (stage) {
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
            c;
        piece.destroy();
        pieces[column][row] = null;

        dropColumns();
    };
    
    var dropColumns = function() {
        var c, r;
        for (c = 0; c < columns; c++) { //each colun
            for (r = rows - 1; r >= 0; r--) { //start from the bottom up
                if (!pieces[c][r]) {
                    console.log('movePieceDownTo ' + c + ' ' + r);
                    movePieceDownTo(c, r);
                }
            }
        }
    };

    var movePieceDownTo = function(column, row) {
        var r;
        for (r = row; r >= 0; r--) {
            if (pieces[column][r]) {
                console.log('getting from ' + column + ' ' + r);
                pieces[column][row] = pieces[column][r].moveTo(column, row);
                pieces[column][r] = null;
                return;
            }
        }
        pieces[column][row] = newPiece().moveTo(column, row);
    };

    var newPiece = function () {
        return stage.insert(new Q.Piece({
                color: randomColor(),
                destroyPiece: destroyPiece,
                type: Q.SPRITE_FRIENDLY
            }));
    };

    var c, r;
    for (c = 0; c < columns; c++) {
        pieces[c] = [];
        for (r = 0; r < rows; r++) {
            pieces[c][r] = newPiece().moveTo(c, r);
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
