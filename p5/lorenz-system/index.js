var A = 10, B = 28, C = 8, delta = .001, x0 = 1, y0 = 1, z0 = 1,
    iters = 10000, range = 50, p_range = 50, delta = .001

fn = ([x, y, z])=> [
    x + A*(y - x)*delta,
    y + (x*(B - z) - y)*delta,
    z + (x*y - C*z)*delta
]

x2scr = x => map(x, -range, range, 0, size),
scr2x = xs => map(xs, 0, size, -range, range)
x2col = x => map(x, -range, range, 0, 255)

var Pi = 0, params = ['y0', 'A', 'B', 'C', 'z0']

draw = ()=>{
    x0 = scr2x(mouseX)
    var p2 = window[params[Pi]] = scr2x(mouseY)
    set_label('#x0 .v', x0.toPrecision(4))
    set_label('#' + params[Pi] + ' .v', p2.toPrecision(4))

    var v0 = fn([x0, y0, z0]), v1
    for(var i = 0; i < iters; i++){
        v1 = fn(v0)
        var c = x2col(v1[2])
        stroke(0, c, 255 - c, 20)
        line(x2scr(v0[0]), x2scr(v0[1]), x2scr(v1[0]), x2scr(v1[1]))
        v0 = v1
    }
}

setup = ()=>{
    document.body.style.background = '#222'
    dims = [windowWidth, windowHeight]
    size = min(dims[0], dims[1])
    createCanvas(dims[0], dims[1])
    background(0, 0)

    params.forEach((name, i)=>{
        $('#' + name).onclick = ()=>{ Pi = i; refresh_ui() }
    })
    refresh_ui()

    draw()
    noLoop()
}

rotate_param = ()=>{
    Pi = (Pi + 1) % params.length
    refresh_ui()
}
refresh_ui = ()=>{
    $$('.label').forEach(el => el.classList.remove('sel'))
    $('#' + params[Pi]).classList.add('sel')
} 

mouseMoved = ()=>{ if(!mouseIsPressed) draw() }
doubleClicked = ()=> rotate_param()
keyPressed = ()=>{
    if(key == ' ') rotate_param()
    if(key == 'Enter') clear()
}

set_label = (q, val)=>{
    el = $(q)
    if(el) el.innerHTML = val
}
$ = q => document.querySelector(q)
$$ = q => document.querySelectorAll(q)
