
var columns = 3,
        rows = 6,
        pieceSize = 70, //px
        colors = ['#D8608C',
                  '#A5E164',
                  '#F8EA6E',
                  '#9D81C8'],
        minimumMatch = 3;

var Q = Quintus()
    .include("Sprites, Scenes, Touch, 2D")
    .setup({
        width: columns * pieceSize,
        height: rows * pieceSize
    });

Q.touch(Q.SPRITE_DEFAULT);
Q.gravityY = 5000;

Q.Sprite.extend("LowerBound", {
    init: function (p) {
        this._super(p, {
            type: Q.SPRITE_DEFAULT,
            color: 'white',
            x: (pieceSize * columns) / 2,
            y: (pieceSize * rows) + 10,
            w: pieceSize * columns,
            h: 20
        });
    },

    draw: function (ctx) {
        ctx.fillStyle = this.p.color;
        ctx.fillRect(-this.p.cx, -this.p.cy, this.p.w, this.p.h);
    }
});

Q.Sprite.extend('Background', {
    init: function (p) {
        this._super(p, {
            type: Q.SPRITE_NONE,
            w: Q.el.width,
            h: Q.el.height,
            x: Q.el.width / 2,
            y: Q.el.height / 2,
            color: '#111'            
        });
    },
    
    draw: function (ctx) {
        ctx.fillStyle = this.p.color;
        ctx.fillRect(-this.p.cx, -this.p.cy, this.p.w, this.p.h);
    }
});

Q.Sprite.extend("Piece", {
    init: function (p) {
        this._super(p, {
            type: Q.SPRITE_DEFAULT,
            w: pieceSize,
            h: pieceSize,
            color: colors[Math.floor(Math.random() * (colors.length - 0.9))]
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

Q.Class.extend("PieceCollection", {
    _p: [],

    exists: function (c, r) {
        return this.piece(c, r) !== null;
    },

    piece: function (c, r) {
        for (var i = 0; i < this._p.length; i++) {
            if (this._p[i].p.column === c && this._p[i].p.row === r) {
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
            piece.destroy();
        }
    },
                
    adjacentMatch: function (piece, match, color) {
        var column = piece.p.column,
            row = piece.p.row;
        color = color || piece.p.color;
       
        if (piece && piece.p.color === color) {
            if (match.indexOf(piece) < 0) {
                match.push(piece);
                if (this.exists(column, row - 1)) { this.adjacentMatch(this.piece(column, row - 1), match, color); }
                if (this.exists(column, row + 1)) { this.adjacentMatch(this.piece(column, row + 1), match, color); }
                if (this.exists(column - 1, row)) { this.adjacentMatch(this.piece(column - 1, row), match, color); }
                if (this.exists(column + 1, row)) { this.adjacentMatch(this.piece(column + 1, row), match, color); }
            }
        }
    },
        
    pieceAbove: function(column, row) {
        for (var r = row; r >= 0; r--) {
            if (this.exists(column, r)) {
                return this.piece(column, r);
            }
        }
        return null;
    }

});

Q.scene("gameboard", function (stage) {
    
    stage.insert(new Q.Background());
    stage.insert(new Q.LowerBound());
    
    var pieces = new Q.PieceCollection();
    var fillFromAbove = function (column, row) {
        if (row >= 0) {
            var piece = pieces.pieceAbove(column, row);
            if (piece) {
                piece.p.row = row;
                fillFromAbove(column, row - 1);
            } else {
                stage.insert(newPiece(c, row));
            }
        }
    };

    var refillColumns = function () {
        var c, r;
        for (c = 0; c < columns; c++) { //each colun
            for (r = rows - 1; r >= 0; r--) { //start from the bottom up
                if (!pieces.exists(c, r)) {
                    var piece = pieces.pieceAbove(c, r);
                    if (piece) {
                        piece.p.row = r;
                    } else {
                        stage.insert(newPiece(c, r));
                    }
                }
            }
        }
    };

    var destroyPiece = function (piece) {
        var matches = [];
        pieces.adjacentMatch(piece, matches);
        if (matches.length >= minimumMatch) {
            for (var m = matches.length - 1; m >= 0; m--) {
                var c = matches[m].p.column, r = matches[m].p.row;
                pieces.remove(matches[m]);
                //fillFromAbove(c, r);
            }
        }
        refillColumns();
    };

    var newPiece = function (column, row) {
        var piece = new Q.Piece({
            onTouch: destroyPiece,
            column: column,
            row: row,
            x: pieceSize * (column + 1 / 2),
            y: pieceSize * (row - 1 / 2 - rows)
        });
        pieces.add(piece);
        return piece;
    };

    var c, r;
    for (c = 0; c < columns; c++) {
        for (r = 0; r < rows; r++) {
            stage.insert(newPiece(c, r));
        }
    }

});

Q.load(["red.png"], function () {
    Q.stageScene("gameboard");
});
