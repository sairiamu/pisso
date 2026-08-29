declare module 'intel-hex' {
    export function parse(data: string | Buffer): {
        data: Uint8Array;
        startOffset: number;
    };
}
