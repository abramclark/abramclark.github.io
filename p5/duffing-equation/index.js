var A = .35, duffing = 1, drive = .3, damping = .02, freq = 1,
    dt = .01, iters = 200, range = 1.5, size, yF = 0, tF = 0

fn = (y0, t0)=>{
    var y2 = y0, x2 = 0, dy = 0, x1, y1, ddy
    for(var t = t0; t < t0 + iters; t += dt){
        //x1 = x2; y1 = y2
        //ddy = (
        //    cos(freq * t) * drive
        //    - duffing * y2**3
        //    - damping * dy
        //    - A * y2
        //) * dt
        //dy += ddy
        //y2 += dy
        //x1 = abs(t % 2 - 1) - .5
        x1 = x2
        y1 = y2
        y2 += (x1 - A * y1 - duffing * x1**3 + drive * cos(freq * t)) * damping * dt
        x2 += y1*dt
        line(x2scr(x1), x2scr(y1), x2scr(x2), x2scr(y2))
    }
    return [y2, t]
}

x2scr = x => map(x, -range, range, 0, size),
scr2x = xs => map(xs, 0, size, -range, range)

setup = ()=>{
    document.body.style.background = '#222'
    dims = [windowWidth, windowHeight]
    size = min(dims[0], dims[1])
    createCanvas(dims[0], dims[1])
    background(0, 0)
    stroke(255, 50)
    yF = fn(0)
    noLoop()
}

var pi = 0, params = ['A', 'freq', 'drive', 'duffing', 'damping']

draw = ()=>{
    var [x, y] = [['valX', mouseX], ['valY', mouseY]].map(([id, x])=>{
        var val = scr2x(x)
        set_label(id, val)
        return val
    })
    window[params[pi]] = x
    [yF, tF] = fn(y, 0)
}

rotate_param = ()=>{
    set_label(params[pi], window[params[pi]])
    pi = (pi + 1) % params.length
    $('#param').innerHTML = params[pi]
}

continue_drawing = ()=>{
    [yF, tF] = fn(y, tF)
    if(mouseIsPressed) setTimeout(continue_drawing, 100)
}

mouseMoved = ()=> draw()
doubleClicked = ()=> rotate_param()
keyPressed = ()=>{ if(key == ' ') rotate_param() }

set_label = (id, v)=> $('#' + id).innerHTML = v.toPrecision(4)
$ = q => document.querySelector(q) || document.createElement('div')
