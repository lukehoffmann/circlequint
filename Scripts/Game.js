var columns = 3,
        rows = 6,
        pieceSize = 70, //px
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
        type: Q.SPRITE_NONE,
    }));

    var pieces = {
        _p: [],

        piece: function (c, r) {
            if (this._p[c] && this._p[c][r]) {
                return this._p[c][r];
            } else {
                return null;
            }
        },

        insert: function (c, r, piece) {
            if (!this._p[c]) {
                this._p[c] = [];
            }
            this._p[c][r] = piece;
        },

        clear: function (c, r) {
            this._p[c][r] = null;
        }
    };

    var destroyPiece = function (piece) {
        destroyColor(piece);
        dropColumns();
    };
    
    var destroyColor = function (piece, color) {
        color = color || piece.p.color;

        if (piece && piece.p.color === color) {
            var c = piece.p.column,
                r = piece.p.row,
                score = 1;
            piece.destroy();
            pieces.clear(piece.p.column, piece.p.row);
            
            if (pieces.piece(c, r - 1)) {score += destroyColor(pieces.piece(c, r - 1), color);}
            if (pieces.piece(c, r + 1)) {score += destroyColor(pieces.piece(c, r + 1), color);}
            if (pieces.piece(c - 1, r)) {score += destroyColor(pieces.piece(c - 1, r), color);}
            if (pieces.piece(c + 1, r)) {score += destroyColor(pieces.piece(c + 1, r), color);}
    
            return score;
        } else {
            return 0;
        }
    };

    var dropColumns = function() {
        var c, r;
        for (c = 0; c < columns; c++) { //each colun
            for (r = rows - 1; r >= 0; r--) { //start from the bottom up
                if (!pieces.piece(c, r)) {
                    pieces.insert(c, r, pieceAbove(c, r).moveTo(c, r));
                }
            }
        }
    };

    var pieceAbove = function(column, row) {
        var r, p;
        for (r = row; r >= 0; r--) {
            if (pieces.piece(column, r)) {
                p = pieces.piece(column, r);
                pieces.clear(column, r);
                return p;
            }
        }
        return newPiece();
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
        for (r = 0; r < rows; r++) {
            pieces.insert(c, r, newPiece().moveTo(c, r));
        }
    }
    
});

Q.load(["Tree.png", "red.png"], function () {
    Q.stageScene("gameboard");
});

var randomColor = function () {
    return colors[Math.floor(Math.random() * (colors.length - 0.9))];
};
