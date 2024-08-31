import CleanCSS from 'clean-css'

export function calcSum(a: number[]) {
    let ret = 0
    for (const v of a) ret += v
    return ret
}

export function minifyStyle(style: string) {
    return new CleanCSS({}).minify(style).styles
}
