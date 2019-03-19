var A = 50, B = 2, C = -.1, r = 800, iters = 500, size

sign = x =>{
   if(x === 0) return 0
   else if(x > 0) return 1
   else return -1
}

x2scr = x => map(x, -r, r, 0, size)
scr2x = x => map(x, 0, size, -r, r)

fn = (x0, y0)=>{
    var x = x0, y = y0
    for(i = 0; i < iters; i++){
        var xt = x
  
        x = y - sign(x) * sqrt(abs(A * x + C))
        y = B - xt
  
        stroke(255, map(i, 0, iters, 40, 20))
        point(x2scr(x), x2scr(y))
    }
    return [x, y]
}

setup = ()=>{
    document.body.style.background = '#222'
    dims = [windowWidth, windowHeight]
    size = min(dims[0], dims[1])
    createCanvas(dims[0], dims[1])
    background(0, 0)
    fn_line(40, 40, 120, 400)
    noLoop()
}

fn_line = (x0, y0, x1, y1)=>{
    var d = sqrt((x1 - x0)**2 + (y1 - y0)**2)
    for(n = 0; n < d; n += .5)
        fn(map(n, 0, d, x0, x1), map(n, 0, d, y0, y1))
}

scr = ()=> [scr2x(mouseX), scr2x(mouseY)]

mouseMoved = ()=>{
    if(!mouseIsPressed)
        fn(...scr())
}

var x0, y0
mousePressed = ()=>{ [x0, y0] = scr() }
mouseReleased = ()=>{
    pts = [x0, y0, ...scr()]
    fn_line(...pts)
    console.log(pts)
}

keyPressed = ()=>{
    if(key == ' '){
        A = (A + 3) % 60
        $('#A').innerHTML = A
    }
    if(key == 'Enter') clear()
    if(key == 'Escape'){
        var el = $('.txt')
        el.style.display = el.style.display == 'none' ? 'block' : 'none'
    }
}

$ = q => document.querySelector(q) || document.createElement('div')
