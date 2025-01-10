var d, t, pi = Math.PI, palette = [], palette_index = 0,
    sin = Math.sin, cos = Math.cos, pow = Math.pow, canvas


// func tools

var zip = (list1, list2)=>{
    var ret = [];
    for(var i = 0; i < list1.length; i++) ret.push([list1[i], list2[i]]);
    return ret;
};

var cury = (func, ...partial_args)=> (...args)=> func.apply(null, partial_args.concat(args))


// num tools

var range = (start, end)=>{
    if(typeof(end) == "undefined") { end=start; start=0; }
    var l = [];
    for (var i = start; i < end; i++){
        l.push(i)
    }
    return l
}

var clamp = (v, min, max) => Math.min(Math.max(v, min), max)
var interp = (p, start, end)=> (end - start) * p + start
var vector_interp = (p, start, end)=>{
    return zip(start, end).map(v => interp(p, v[0], v[1]))
};


// draw primitives

var rgb = l =>('rgba(' +
    l.slice(0,3).map(v => v * 255).concat(l[3]).join(',') + ')')
var rgb8 = l =>('rgba(' + l.slice(0,3).concat(l[3]).join(',') + ')')
var hsl = c => `hsla(${c[0] * 360},${c[1] * 100}%,${c[2] * 100}%,${c[3]})`
var color = rgb8

var next_index = (list, i) => (i + 1) % list.length
var get_color = i =>{
    var index = i >> 0, fraction = i % 1
    return vector_interp(fraction, palette[index],
        palette[next_index(palette, index)])
}
var palette_next = ()=>{
    var c = get_color(palette_index);
    palette_index = next_index(palette, palette_index);
    return color(c);
}
var palette_fill = ()=>{ d.fillStyle = palette_next() }
var palette_stroke = ()=>{ d.strokeStyle = palette_next() }
var palette0 = ()=>{
    d.fillStyle = palette[0]
    d.strokeStyle = palette[0]
    palette_index = 0
}

var shape = (n, r)=>{
    if(!r) r = 100;
    var seg = a =>{
        d.rotate(2*pi/a)
        d.lineTo(r, 0)
    }

    d.save()
    d.beginPath()
    d.moveTo(r, 0)
    range(n-1).forEach(()=> seg(n))
    d.closePath()
    palette_stroke()
    d.stroke()
    palette_fill()
    d.fill()
    d.restore()
}

var circle = r =>{ d.beginPath(); d.arc(0, 0, r, 0, pi*2); d.stroke(); d.moveTo(0, 0) }

var clear = ()=>{
    d.restore(); d.save()
    d.clearRect(-500,-500,1000,1000)
}

var gfx = draw => (...args)=>{
    d.save()
    draw.apply(null, args)
    d.restore()
}

var rotate = gfx((draw, a)=>{ d.rotate(a); draw() })
var trans = gfx((draw, x, y)=>{ d.translate(x, y); draw() })
var scale = gfx((draw, s)=>{ d.scale(s, s); draw() })

var lsegr = (l, a)=>{
    d.beginPath()
    d.moveTo(0, 0)
    d.rotate(a)
    d.translate(l, 0)
    d.lineTo(0, 0)
    // palette_stroke()
    d.stroke()
}, lseg = gfx(lsegr)

var tri = (slice, r)=>{
    var a = 2*pi/slice
    d.save()
    d.beginPath()
    d.moveTo(0,0)
    d.rotate(-a/2)
    d.lineTo(r, 0)
    d.rotate(a)
    d.lineTo(r, 0)
    d.closePath()
    palette_fill()
    d.fill()
    d.restore()
};

var vline = w =>{
  d.beginPath()
  d.moveTo(0, -w/2)
  d.lineTo(0, w/2)
  d.stroke()
}

var hline = l =>{
  d.beginPath()
  d.moveTo(0, 0)
  d.lineTo(l, 0)
  palette_stroke()
  d.stroke()
}

var slide = (draw, n, width)=>{
  d.save()
  d.translate(-width / 2, 0)
  var ow = width / n
  range(n).forEach(()=>{
    draw()
    d.translate(ow, 0)
  })
  d.restore()
}


// animate tools

function animate(draw){
    animate.animations.push(draw)
    animate.t0 = + new Date()
    if(animate.animations.length == 1) animate.frame()
}
animate.frame = ()=>{
    t = (+ new Date() - animate.t0) / 1000
    for(i in animate.animations) animate.animations[i]()
    if(animate.animations.length) animate.frame_id = window.requestAnimationFrame(animate.frame)
}
animate.stop = draw =>{
    if(draw) animate.animations.splice(animate.animations.indexOf(draw), 1)
    else animate.animations = []
    // prevent parallel animation loops
    if(!animate.animations.length && animate.frame_id) cancelAnimationFrame(animate.frame_id)
}
animate.animations = []
animate.frame_id = 0

var graph = fn =>{
    var width = 10, height = width * (h / w),
        w = canvas.width, h = canvas.height,
        px = width * 2 / w,
        xo = w / 2, yo = h / 2,
        img = d.createImageData(w, h)

    for(x = 0; x < w; x++){
        for(y = 0; y < h; y++){
            var a = (x - xo) * px, b = (y - yo) * px,
                v = clamp((fn(a, b) + 10) / 20, 0, 1),
                c = vector_interp(v, [0, 255, 0], [0, 0, 255]),
                ix = (y * w + x) * 4
            img.data[ix  ] = c[0]
            img.data[ix+1] = c[1]
            img.data[ix+2] = c[2]
            img.data[ix+3] = 255
        }
    }

    d.putImageData(img, 0, 0)
}


var resize = canvas =>{
    var pixels = [canvas.clientWidth, canvas.clientHeight],
        s = canvas.clientWidth / 1000
    canvas.setAttribute('width', pixels[0])
    canvas.setAttribute('height', pixels[1])
    d.translate(pixels[0] / 2, pixels[1] / 2)
    d.scale(s, s)
    d.save()
}

var palette_set_bright = ()=>{
    palette = [
        [255, 0  , 0  , .2],
        [0  , 0  , 255, .2],
        [255, 255, 0  , .2],
        [255, 0  , 255, .2],
        [0  , 255, 255, .2],
    ]
    color = rgb8
}, palette_set_2tone = ()=>{
    palette = [
        [5  , 180, 20 , 0.2],
        [40 , 10 , 240, 0.2],
    ]
    color = rgb8
}, palette_set_sunset = ()=> {
    palette = [
        [0.807843137254902, 0.3607843137254902, 0.0, 0.2],
        [0.12549019607843137, 0.2901960784313726, 0.5294117647058824, 0.2],
        [0.3607843137254902, 0.20784313725490197, 0.4, 0.2],
        [0.5607843137254902, 0.34901960784313724, 0.00784313725490196, 0.2],
        [0.6431372549019608, 0.0, 0.0, 0.2],
    ]
    color = rgb
}

var init = ()=>{
    canvas = document.getElementsByTagName('canvas')[0]
    d = canvas.getContext('2d')
    window.onresize = ()=> resize(canvas)
    window.onresize()

    palette_set_bright()
    palette0()

    init_ui()
}

var $ = q => document.querySelector(q)

var build_select = (src, target, sel_fn)=>{
    target.innerHTML = ''
    Object.keys(src).forEach(v =>{
        let el = document.createElement('option')
        el.value = v; el.innerText = v
        if(sel_fn(v)) el.selected = true;
        target.appendChild(el)
    })
}

var set_example = ()=>{
    key = $('#examples').value
    code = examples[key].trimStart()
    $('#code').value = code
    palette_set_bright()
    clear()
    run_code()
}

var run_code = ()=>{
    animate.stop()
    code = $('#code').value
    $('#error').innerText = ''
    try {
        eval(code)
    } catch(ex){
        $('#error').innerText = ex.message
    }
}

var init_ui = ()=>{
    build_select(examples, $('#examples'), name => name == 'intro')
    $('#examples').onchange = set_example
    set_example()

    $('#stop').onclick = ()=> animate.stop()    
    $('#clear').onclick = ()=> clear()    
    $('#run').onclick = run_code
}


// draw combinators

var star = (sides, slice, n) =>{
    if(!n) n = slice
    var a_step = 2 * pi / slice
    range(n).forEach(i => rotate(()=> shape(sides), a_step * i))
}

var swing = (draw, slice, r, steps)=>{
    if(!steps) steps = slice
    d.save()
    range(steps).forEach(()=>{
        trans(draw, r, 0)
        d.rotate(2*pi/slice)
    })
    d.restore()
}

var swing_rec = (draw, scale, slice, r, l, steps)=>{
    if(l == 0) return
    swing(()=>{
        d.save()
        draw()
        d.scale(scale, scale)
        swing_rec(draw, scale, slice, r, l - 1, steps)
        d.restore()
    }, slice, r, steps)
}

var examples = {
    intro: `
// demo of a simple graphics library leveraging function composition
shape(6)`,

    swing: `
// swing(draw_function, n_fold_symetry, radius, count)
swing(cury(shape, 4), 6, 100)`,

    squares_in_sixes: `
// draw functions can of course be nested
swing(()=> swing(()=> swing(()=> shape(4), 6, 100), 4, 200), 6, 400)`,

    animation: `
animate(()=>{
  palette0()
  clear()
  swing(()=> rotate(()=> shape(4), t / 10), 6, 110)
})`,

    pentagon_mosaic: `
// swing_rec(draw_function, scale, n_fold_symetry, radius, recursions, count_per_recursion)
swing_rec(cury(shape, 5), 1, 5, 100, 5)`,

    pentagon_circle: `
var pentagon_circle = ()=>{
  swing(cury(shape, 5), 21, 202)
  swing(cury(shape, 5), 21, -402)
}
range(3).forEach(i => scale(pentagon_circle, 0.25 ** i))`,

    tri_hex: `
var trihex = ()=>{
  swing(()=>{
    swing(cury(shape, 6), 60, 100, 11)
    d.rotate(pi)
    swing(cury(shape, 6), 60, 100, 11)
  }, 3, 200)
}
range(5).forEach(i => scale(cury(swing, trihex, 3, 400), 0.5 ** i))`,

    jewels: `
var n = 9

var jewel = ()=>{
  swing(cury(shape, 6), n, 189)
  swing(cury(shape, 6), n, 195)
  swing(cury(shape, 6), n, 183)

  swing(cury(shape, 4), n, 85)
  swing(cury(shape, 4), n, 91)
  swing(cury(shape, 4), n, 79)
}

range(22).forEach(cury(swing, cury(tri, n, 800), 18, 0))

jewel()

swing(cury(scale, cury(rotate, jewel, pi / (n % 2)), .2), n, 354)`,

    btree: `
palette_set_sunset()

trans(()=>{
  d.lineWidth = 5
  rotate(cury(hline, 100), pi/2)
  d.rotate(-2*pi/3)
  swing_rec(()=>{
    hline(150)
    d.translate(150, 0)
    d.rotate(-pi/6)
  }, .75, 6, 0, 12, 2)
}, 0, 250)`,

    btree_flexing: `
palette_set_sunset()

animate(()=>{
  clear()
  palette0()
  a = 2 + Math.abs(Math.tan(t/10))

  trans(()=>{
    d.lineWidth = 5
    rotate(cury(hline, 100), pi/2)
    d.rotate(-pi/2 - pi / a)
    swing_rec(()=>{
      hline(150)
      d.translate(150, 0)
      d.rotate(-pi/a)
    }, .75, a, 0, 12, 2)
  }, 0, 100)
})`,

    triangle_spin: `
palette_set_sunset()

var triangle_spin = o = {
  a: 0,
  spin: ()=> rotate(()=> shape(3), o.a),

  draw: ()=>{
    clear()
    palette_index = 0
    o.a = t / 10
    swing_rec(o.spin, .5, 8, 300, 3)
    swing_rec(o.spin, 1, 6, 100, 3)
  },
}

animate(triangle_spin.draw)`,

    wavy_spiral: `
var wavy_spiral = o = {
    wavy_circle: (freq, amp, phase, radius_center)=>{
        var n = 0, r = ()=> radius_center + Math.sin(n * freq + phase) * amp
        d.save()
        d.beginPath()
        var step = 2*pi / ((radius_center * 2) + 50)
        d.moveTo(r(), 0)
        for(; n <= 2*pi; n += step){
            d.lineTo(r(), 0)
            d.rotate(step)
        }
        d.closePath()
        d.stroke()
        palette_fill()
        d.fill()
        d.restore()
    },

    concentric_waves: (bump, twist)=>{
        range(80).reverse().forEach(i => o.wavy_circle(7, sin(i * pi/50) * bump, twist * i * pi/50, 10 + i * 5))
    },

    bump: 40, new_bump: 40, twist: 0, rate: .2,
    draw: ()=>{
        clear()
        o.concentric_waves(o.bump, o.twist)
        o.twist += o.rate
        if(o.bump != o.new_bump){
            var diff = o.new_bump - o.bump
            o.bump += 1 * diff / Math.abs(diff)
        }
    },
}

animate(wavy_spiral.draw)`,
}

// sketches

var square_spread = ()=>{
    rotate(cury(swing, cury(swing, cury(tri, 8, 1000), 8, 0), pi/8, 0, 2), pi/8)
    swing(cury(lseg, 1000, 0), 8, 0);

    star4 = ()=>{
        star(4, 60, 4)
        star(4, -60, 4)
    }
    star4()
    swing(star4, 4, 200);
};

var tritree = ()=>{ swing_rec(()=>{
    d.rotate(-pi/2 + pi/10)
    hline(30)
    d.translate(30, 0)
}, .75, 5, 0, 4, 3) }
