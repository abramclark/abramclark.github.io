var d, t, pi = Math.PI, palette = [], palette_index = 0,
    sin = Math.sin, cos = Math.cos, pow = Math.pow, canvas


// func tools

var zip = (list1, list2)=>{
    var ret = [];
    for(var i = 0; i < list1.length; i++) ret.push([list1[i], list2[i]]);
    return ret;
};

var cury = function(func){
    var partial_args = Array.prototype.slice.call(arguments, 1);
    return ()=> func.apply(null, partial_args.concat(arguments))
}


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

var gfx = draw =>{ return function(){
    d.save()
    draw.apply(null, arguments)
    d.restore()
} }

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

animate = function(draw){
    animate.animations.push(draw)
    animate.t0 = + new Date()
    if(animate.animations.length == 1) animate.frame()
}
animate.frame = function(){
    t = (+ new Date() - animate.t0) / 1000
    for(i in animate.animations) animate.animations[i]()
    if(animate.animations.length) window.requestAnimationFrame(animate.frame)
}
animate.stop = function(draw){
    if(draw) animate.animations.splice(animate.animations.indexOf(draw), 1)
    else animate.animations = []
}
animate.animations = []

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

var init = ()=>{
    canvas = document.getElementsByTagName('canvas')[0]
    d = canvas.getContext('2d')
    window.onresize = ()=> resize(canvas)
    window.onresize()

    palette = [
        [5  , 180, 20 , 0.2],
        [40 , 10 , 240, 0.2],
    ]
    color = rgb8

    palette = [
        [255, 0  , 0  , .2],
        [0  , 0  , 255, .2],
        [255, 255, 0  , .2],
        [255, 0  , 255, .2],
        [0  , 255, 255, .2],
    ]
    color = rgb8

    palette = [
        [0.807843137254902, 0.3607843137254902, 0.0, 0.06],
        [0.12549019607843137, 0.2901960784313726, 0.5294117647058824, 0.06],
        [0.3607843137254902, 0.20784313725490197, 0.4, 0.06],
        [0.5607843137254902, 0.34901960784313724, 0.00784313725490196, 0.06],
        [0.6431372549019608, 0.0, 0.0, 0.06],
    ]
    color = rgb

    //palette = [
    //    [0.0744336569579288, 1.0, 0.403921568627451, 0.1],
    //    [0.598705501618123, 0.6167664670658682, 0.32745098039215687, 0.1],
    //    [0.7993197278911565, 0.3161290322580645, 0.303921568627451, 0.1],
    //    [0.10283687943262411, 0.9724137931034483, 0.28431372549019607, 0.1],
    //    [0.0, 1.0, 0.3215686274509804, 0.1],
    //]
    //color = hsl
}


// draw combinators

var spar = (p, n, s) =>{
    range(n).forEach(i =>{
        rotate(()=> shape(s), pi / p ** i)
        rotate(()=> shape(s), -pi / p ** i)
    })
}

var square_spread = ()=>{
    rotate(cury(swing, ()=> swing(cury(tri, 8, 1000), 8, 0), pi/8, 0, 2), pi/8)
    swing(cury(lseg, 1000, 0), 8, 0);

    spar4 = ()=> spar(2, 10, 4)
    spar4()
    swing(spar4, 4, 200);
};

swing_spread = (n, a) =>{
    //rays(n)
    sparn = ()=> spar(a, 10, n)
    sparn()
    swing(sparn, n, 200)
}

var rays = n =>{
    rotate(()=> swing(()=> tri(n, 1000), n, 0, 30), pi/n)
    swing(()=> lseg(1000, 0), n, 0)
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

var swing_rec = (draw, scale, slice, r, l)=>{
    if(l == 0) return
    swing(()=>{
        d.save()
        draw()
        d.scale(scale, scale)
        swing_rec(draw, scale, slice, r, l - 1)
        d.restore()
    }, slice, r)
}
var swings_rec = (draw, scale, slice, r, steps, l)=>{
    if(l == 0) return
    swing(()=>{
        d.save()
        draw()
        d.scale(scale, scale)
        swings_rec(draw, scale, slice, r, steps, l - 1)
        d.restore()
    }, slice, r, steps)
}

// sketches

var plaidish = ()=>{
    swing(cury(swing_spread, 4, 30), 4, 400)
    scale(cury(swing_spread, 4, 30), 2)
    scale(cury(swing_spread, 4, 30), .5)
}
var hex_tri_spread_swing = ()=>{
    scale(cury(swing_spread, 6, 30), 2)
    swing_spread(3, 30)
    swing(()=> scale(cury(swing_spread, 3, 30), .66), 6, 400)
}

var jewel = ()=>{
    var jewel_1 = function(){
        swing(function(){ shape(6) }, 9, 189);
        swing(function(){ shape(6) }, 9, 195);
        swing(function(){ shape(6) }, 9, 183);

        swing(function(){ shape(4) }, 6, 85);
        swing(function(){ shape(4) }, 6, 91);
        swing(function(){ shape(4) }, 6, 79);
    };

    range(22).forEach(function(){ swing(function(){ tri(9, 800) }, 18, 0) });

    jewel_1();

    swing(function(){
        d.save(); d.scale(.2,.2); d.rotate(pi/9); jewel_1(); d.restore();
    }, 9, 354);
}

var penta_splay = a =>{
    var splay = function(){
        swing(function(){ shape(5) }, 18, 202)
        swing(function(){ shape(5) }, 18, -402)
    }

    d.strokeStyle = 'rgb(255,255,255)'
    var dir = 1
    range(5).forEach(i =>{
        dir *= -1
        d.save()
        d.rotate(dir * a)
        var scale = .25 ** i
        d.scale(scale, scale)
        splay()
        d.restore()
    })

    d.restore()
    d.save()
};

var penta_mosaic = ()=> swing(()=> swing(()=> swing(()=> swing(()=> swing(()=>
    shape(5), 5, 100), 5, 100), 5, 100), 5, 100), 5, 100)

var wild_ride = ()=> swing(()=> swing(()=> swing(()=>
    shape(4), 6, 100), 4, 200), 6, 400)

var tri_hexa = function(){
    var triseg = function(){
        swing(function(){
            swing(function(){ shape(6) }, 60, 100, 11);
            d.rotate(pi);
            swing(function(){ shape(6) }, 60, 100, 11)
        }, 3, 200);
    };

    triseg();
    swing(function(){
        d.translate(200,0);
        d.rotate(-pi/3);
        d.translate(400,0);
        triseg();
    }, 3, 0);
};

var btree = ()=>{
    d.lineWidth = 3
    d.save()
    d.rotate(-pi/4)
    swings_rec(()=>{
        hline(30)
        d.translate(30, 0)
        d.rotate(-pi/4)
    }, .75, 4, 0, 2, 5)
    d.restore()
}

var btree_circle = ()=>{
    d.lineWidth = 3
    circle(40)
    swing(()=> hline(40), 6, 40)
    swing(()=> btree(), 6)
}

tritree = ()=>{ swings_rec(()=>{
    d.rotate(-pi/2 + pi/10)
    hline(30)
    d.translate(30, 0)
}, .75, 5, 0, 3, 4) }

tritree_wheel = ()=>{
    circle(24)
    circle(26)
}


// animations

var Sixes = ()=>{ var o = {
    a: 0,
    spin: ()=> rotate(()=> shape(3), o.a),

    f: 0, in_sixes: ()=>{
        o.f += 1
        if(o.f % 2) return

        o.a = t / 10
        palette_index = (t / 20) % palette.length
        swing_rec(o.spin, .5, 8, 300, 3)
        swing_rec(o.spin, 1, 6, 100, 3)
    },

    start: ()=>{
        palette_index = 1
        palette_fill()
        range(10).map(()=>{ d.fillRect(-500, -500, 1000, 1000) })
        animate(o.in_sixes); return o
    }
}; return o }

var Spiration = ()=>{ var o = {
    wobble: (freq, amp, phase, radius_center)=>{
        var n = 0, r = function(){
            return radius_center + Math.sin(n * freq + phase) * amp; };
        d.save();
        d.beginPath();
        var step = 2*pi / ((radius_center * 2) + 50)
        d.moveTo(r(), 0);
        for(; n <= 2*pi; n += step){
            d.lineTo(r(), 0);
            d.rotate(step);
        }
        d.closePath();
        d.stroke();
        palette_fill();
        d.fill();
        d.restore();
    },

    spirate: (bump, twist)=>{
        range(80).reverse().forEach(function(i){
            o.wobble(7, sin(i * pi/50) * bump, twist * i * pi/50, 10 + i * 5)
        })
    },

    bump: 40, new_bump: 40, twist: 0, rate: .2,
    spiration: ()=>{
        o.spirate(o.bump, o.twist)
        o.twist += o.rate
        if(o.bump != o.new_bump){
            var diff = o.new_bump - o.bump
            o.bump += 1 * diff / Math.abs(diff)
        }
    },

    start: ()=>{ animate(o.spiration); return o }
}; return o }
