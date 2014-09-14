
var columns = 3,
        rows = 6,
        pieceSize = 70, //px
        colors = ['red', 'orange', 'pink', 'purple'],
        minimumMatch = 3;

var Q = Quintus()
    .include("Sprites, Scenes, Touch, 2D")
    .setup({
        width: columns * pieceSize,
        height: rows * pieceSize
    });

Q.SPRITE_PIECE = 21;
Q.SPRITE_BOUND = 22;

Q.touch(Q.SPRITE_PIECE);
Q.gravityY = 5000;
Q.Sprite.extend("Bound", {
    init: function (p) {
        this._super(p, {
            type: Q.SPRITE_PIECE,
            color: 'white',
            w: pieceSize * columns,
            h: 20
        });
    },

    draw: function (ctx) {
        ctx.fillStyle = this.p.color;
        // Draw a filled rectangle centered at 0,0 (i.e. from -w/2,-h2 to w/2, h/2)
        ctx.fillRect(-this.p.cx, -this.p.cy, this.p.w, this.p.h);
    }
});

Q.Sprite.extend("Piece", {
    init: function (p) {
        this._super(p, {
            type: Q.SPRITE_PIECE,
            w: pieceSize,
            h: pieceSize
        });
        this.on('touch');
        this.add("2d");
    },
    
    draw: function (ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, this.p.w / 2, 0, 2 * Math.PI);
        ctx.fillStyle = this.p.color;
        ctx.fill();
    },
    
    touch: function () {
        this.p.onTouch(this);
    }
    
});

Q.scene("gameboard", function (stage) {
    stage.insert(new Q.Sprite({
        asset: "Tree.png",
        x: Q.el.width / 2,
        y: Q.el.height / 2,
        type: Q.SPRITE_NONE
    }));

    var pieces = {
        _p: [],

        exists: function (c, r) {
            return this.piece(c, r) !== null;
        },

        piece: function (c, r) {
            for (var i = 0; i < this._p.length; i++) {
                if (this._p[i].p.column == c && this._p[i].p.row == r) {
                    return this._p[i];
                }
            }
            return null;
        },

        add: function (piece) {
            this._p.push(piece);
        },

        remove: function (piece) {
            var index = this._p.indexOf(piece);
            if (index > -1) {
                this._p.splice(index, 1);
            }
        }
    };

    var destroyPiece = function (piece) {
        var match = [], m;
        adjacentMatch(piece, match);
        if (match.length >= minimumMatch) {
            for (m = match.length - 1; m >= 0; m--) {
                pieces.remove(match[m]);
                match[m].destroy();
            }
        }
            
        dropColumns();
    };
    
    var adjacentMatch = function (piece, match, color) {
        var column = piece.p.column,
            row = piece.p.row;
            color = color || piece.p.color;
    
        if (piece && piece.p.color === color) {
            if (match.indexOf(piece) < 0) {
                match.push(piece);
                if (pieces.exists(column, row - 1)) {adjacentMatch(pieces.piece(column, row - 1), match, color);}
                if (pieces.exists(column, row + 1)) {adjacentMatch(pieces.piece(column, row + 1), match, color);}
                if (pieces.exists(column - 1, row)) {adjacentMatch(pieces.piece(column - 1, row), match, color);}
                if (pieces.exists(column + 1, row)) {adjacentMatch(pieces.piece(column + 1, row), match, color);}
            }
        }
        
       return match;
    };

    var dropColumns = function() {
        var c, r;
        for (c = 0; c < columns; c++) { //each colun
            for (r = rows - 1; r >= 0; r--) { //start from the bottom up
                if (!pieces.exists(c, r)) {
                    var piece = pieceAbove(c, r);
                    if (piece) {
                        piece.p.row = r;
                    } else {
                        piece = stage.insert(
                            new Q.Piece({
                                color: randomColor(),
                                onTouch: destroyPiece,
                                column: c,
                                row: r,
                                x: pieceSize * (c + 1/2),
                                y: pieceSize * (r - 1/2 - rows)
                            })
                        );
                        pieces.add(piece);
                    }
                }
            }
        }
    };

    var pieceAbove = function(column, row) {
        var r, p;
        for (r = row; r >= 0; r--) {
            if (pieces.exists(column, r)) {
                return pieces.piece(column, r);
            }
        }
        return null;
    };

    var c, r, piece;
    for (c = 0; c < columns; c++) {
        for (r = 0; r < rows; r++) {
            piece = stage.insert(new Q.Piece({
                    color: randomColor(),
                    onTouch: destroyPiece,
                    column: c,
                    row: r,
                    x: pieceSize * (c + 1 / 2),
                    y: pieceSize * (r - 1)
                }));
            //piece.p.gravity = 10;
            pieces.add(piece);
        }
    }
 
    stage.insert(new Q.Bound({
        x: (pieceSize * columns) / 2,
        y: (pieceSize * rows) + 10
    }));
    
});

Q.load(["Tree.png", "red.png"], function () {
    Q.stageScene("gameboard");
});

var randomColor = function () {
    return colors[Math.floor(Math.random() * (colors.length - 0.9))];
};
