import { Path } from './path.js';
// immutable
export class Game {
    constructor(initial, moves, players, metadata) {
        this.initial = initial;
        this.moves = moves;
        this.players = players;
        this.metadata = metadata;
        this.nodeAt = (path) => nodeAtPathFrom(this.moves, path);
        this.dataAt = (path) => {
            const node = this.nodeAt(path);
            return node ? (isMoveNode(node) ? node.data : this.initial) : undefined;
        };
        this.title = () => this.players.white.name
            ? [
                this.players.white.title,
                this.players.white.name,
                'vs',
                this.players.black.title,
                this.players.black.name,
            ]
                .filter(x => x && !!x.trim())
                .join('_')
                .replace(' ', '-')
            : 'lichess-pgn-viewer';
        this.pathAtMainlinePly = (ply) => ply == 0
            ? Path.root
            : this.mainline[Math.max(0, Math.min(this.mainline.length - 1, ply == 'last' ? 9999 : ply - 1))]
                ?.path || Path.root;
        this.hasPlayerName = () => !!(this.players.white?.name || this.players.black?.name);
        this.mainline = Array.from(this.moves.mainline());
    }
}
const childById = (node, id) => node.children.find(c => c.data.path.last() == id);
const nodeAtPathFrom = (node, path) => {
    if (path.empty())
        return node;
    const child = childById(node, path.head());
    return child ? nodeAtPathFrom(child, path.tail()) : undefined;
};
export const isMoveNode = (n) => 'data' in n;
export const isMoveData = (d) => 'uci' in d;
//# sourceMappingURL=game.js.map