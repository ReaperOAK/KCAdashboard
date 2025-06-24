import { makeSquare, opposite } from 'chessops';
import translator from './translation.js';
import { uciToMove } from 'chessground/util';
import { Path } from './path.js';
import { isMoveData } from './game.js';
import { makeGame } from './pgn.js';
export default class PgnViewer {
    constructor(opts, redraw) {
        this.opts = opts;
        this.redraw = redraw;
        this.flipped = false;
        this.pane = 'board';
        this.autoScrollRequested = false;
        this.curNode = () => this.game.nodeAt(this.path) || this.game.moves;
        this.curData = () => this.game.dataAt(this.path) || this.game.initial;
        this.goTo = (to, focus = true) => {
            const path = to == 'first'
                ? Path.root
                : to == 'prev'
                    ? this.path.init()
                    : to == 'next'
                        ? this.game.nodeAt(this.path)?.children[0]?.data.path
                        : this.game.pathAtMainlinePly('last');
            this.toPath(path || this.path, focus);
        };
        this.canGoTo = (to) => (to == 'prev' || to == 'first' ? !this.path.empty() : !!this.curNode().children[0]);
        this.toPath = (path, focus = true) => {
            this.path = path;
            this.pane = 'board';
            this.autoScrollRequested = true;
            this.redrawGround();
            this.redraw();
            if (focus)
                this.focus();
        };
        this.focus = () => this.div?.focus();
        this.toggleMenu = () => {
            this.pane = this.pane == 'board' ? 'menu' : 'board';
            this.redraw();
        };
        this.togglePgn = () => {
            this.pane = this.pane == 'pgn' ? 'board' : 'pgn';
            this.redraw();
        };
        this.orientation = () => {
            const base = this.opts.orientation || 'white';
            return this.flipped ? opposite(base) : base;
        };
        this.flip = () => {
            this.flipped = !this.flipped;
            this.pane = 'board';
            this.redrawGround();
            this.redraw();
        };
        this.cgState = () => {
            const data = this.curData();
            const lastMove = isMoveData(data) ? uciToMove(data.uci) : this.opts.chessground?.lastMove;
            return {
                fen: data.fen,
                orientation: this.orientation(),
                check: data.check,
                lastMove,
                turnColor: data.turn,
            };
        };
        this.analysisUrl = () => (this.game.metadata.isLichess && this.game.metadata.externalLink) ||
            `https://lichess.org/analysis/${this.curData().fen.replace(' ', '_')}?color=${this.orientation()}`;
        this.practiceUrl = () => `${this.analysisUrl()}#practice`;
        this.setGround = (cg) => {
            this.ground = cg;
            this.redrawGround();
        };
        this.redrawGround = () => this.withGround(g => {
            g.set(this.cgState());
            g.setShapes(this.curData().shapes.map(s => ({
                orig: makeSquare(s.from),
                dest: makeSquare(s.to),
                brush: s.color,
            })));
        });
        this.withGround = (f) => this.ground && f(this.ground);
        this.game = makeGame(opts.pgn, opts.lichess);
        opts.orientation = opts.orientation || this.game.metadata.orientation;
        this.translate = translator(opts.translate);
        this.path = this.game.pathAtMainlinePly(opts.initialPly);
    }
}
//# sourceMappingURL=pgnViewer.js.map