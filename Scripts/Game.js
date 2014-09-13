
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
    },
    
    moveTo: function(column, row) {
        this.p.column = column;
        this.p.row = row;
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

        exists: function (c, r) {
            return this._p[c] && this._p[c][r];
        },

        piece: function (c, r) {
            if (this.exists(c, r)) {
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
        var match = [], m;
        adjacentMatch(piece.p.column, piece.p.row, match);
        if (match.length >= minimumMatch) {
            for (m = match.length - 1; m >= 0; m--) {
                match[m].destroy();
                pieces.clear(match[m].p.column, match[m].p.row);
            }
        }
            
        dropColumns();
    };
    
    var adjacentMatch = function (column, row, match, color) {
                    
        if (pieces.exists(column, row)) {
            var piece = pieces.piece(column, row);
            color = color || piece.p.color;
        
            if (piece && piece.p.color === color) {
                if (match.indexOf(piece) < 0) {
                    match.push(piece);
                    adjacentMatch(column, row - 1, match, color);
                    adjacentMatch(column, row + 1, match, color);
                    adjacentMatch(column - 1, row, match, color);
                    adjacentMatch(column + 1, row, match, color);
                }
            }
        }
       return match;
    };

    var dropColumns = function() {
        var c, r;
        for (c = 0; c < columns; c++) { //each colun
            for (r = rows - 1; r >= 0; r--) { //start from the bottom up
                if (!pieces.exists(c, r)) {
                    pieces.insert(c, r, pieceAbove(c, r).moveTo(c, r));
                }
            }
        }
    };

    var pieceAbove = function(column, row) {
        var r, p;
        for (r = row; r >= 0; r--) {
            if (pieces.exists(column, r)) {
                p = pieces.piece(column, r);
                pieces.clear(column, r);
                return p;
            }
        }
        return stage.insert(
            new Q.Piece({
                color: randomColor(),
                onTouch: destroyPiece,
                column: column,
                row: row,
                x: pieceSize * c + pieceSize / 2,
                y: -pieceSize * row
            })
        );
    };

    var c, r;
    for (c = 0; c < columns; c++) {
        for (r = 0; r < rows; r++) {
            pieces.insert(c, r,
                stage.insert(new Q.Piece({
                    color: randomColor(),
                    onTouch: destroyPiece,
                    column: c,
                    row: r,
                    x: pieceSize * c + pieceSize / 2,
                    y: pieceSize * r + pieceSize / 2
                }))
            );
        }
    }
    stage.insert(new Q.Bound({
        y: (pieceSize * rows) + 10,
        x: (pieceSize * columns) / 2
    }));
    
});

Q.load(["Tree.png", "red.png"], function () {
    Q.stageScene("gameboard");
});

var randomColor = function () {
    return colors[Math.floor(Math.random() * (colors.length - 0.9))];
};
