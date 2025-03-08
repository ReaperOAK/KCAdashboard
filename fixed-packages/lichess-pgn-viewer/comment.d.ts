import { DrawShape } from 'chessground/draw';
declare type CommentAndShapes = [string, DrawShape[]];
declare type CommentsAndShapes = [string[], DrawShape[]];
export declare const parseComments: (comments: string[]) => CommentsAndShapes;
export declare const parseComment: (comment: string) => CommentAndShapes;
export {};
