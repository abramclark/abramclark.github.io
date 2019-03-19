var d, t, pi = Math.PI, palette = [], palette_index = 0,
    sin = Math.sin, cos = Math.cos, pow = Math.pow, canvas

var range = (start, end)=>{
    if(typeof(end) == "undefined") { end=start; start=0; }
    var l = [];
    for (var i = start; i < end; i++){
        l.push(i)
    }
    return l
}

var zip = (list1, list2)=>{
    var ret = [];
    for(var i = 0; i < list1.length; i++) ret.push([list1[i], list2[i]]);
    return ret;
};

var cury = function(func){
    var partial_args = Array.prototype.slice.call(arguments, 1);
    return ()=> func.apply(null, partial_args.concat(arguments))
}

var interp = (p, start, end)=> (end - start) * p + start
var vector_interp = (p, start, end)=>{
    return zip(start, end).map(v => interp(p, v[0], v[1]))
};
var css_color = l =>('rgba(' +
    l.slice(0,3).forEach(v => v >> 0).concat(l[3]).join(',') + ')')

var next_index = (list, i) => (i + 1) % list.length
var get_color = i =>{
    var index = i >> 0, fraction = i % 1
    return vector_interp(fraction, palette[index],
        palette[next_index(palette, index)])
}
var palette_next = ()=>{
        var color = get_color(palette_index);
        palette_index = next_index(palette, palette_index);
        return css_color(color);
    }
var palette_fill = ()=>{ d.fillStyle = palette_next() }
var palette_stroke = ()=>{ d.strokeStyle = palette_next() }

var init = ()=>{
    canvas = document.getElementsByTagName('canvas')[0]
    d = canvas.getContext('2d')
    window.onresize = ()=> resize(canvas)
    window.onresize()

    palette = [
        [5  , 180, 20 , 0.2],
        [40 , 10 , 240, 0.2]
    ]

    palette = [
        [255, 0  , 0  , .2],
        [0  , 0  , 255, .2],
        [255, 255, 0  , .2],
        [255, 0  , 255, .2],
        [0  , 255, 255, .2]
    ]

    palette = [
         [100,20 ,40 ,0.1]
        ,[255,80 ,0  ,0.1]
        ,[220,220,70 ,0.1]
        ,[0  ,100,20 ,0.1]
        ,[0  ,100,220,0.1]
    ]

    //squares_in_sixes.start()
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

var shape = n =>{
    var seg = a =>{
        d.rotate(pi*2/a)
        d.lineTo(100,0)
    }

    d.save()
    d.beginPath()
    d.moveTo(100,0)
    range(n-1).forEach(()=> seg(n))
    d.closePath()
    palette_fill()
    d.stroke()
    d.fill()
    d.restore()
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

var wobble = function(freq, amp, phase, radius_center){
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
};

var spirate = function(bump, twist){
    range(80).reverse().forEach(function(i){
        wobble(7, sin(i * pi/50) * bump, twist * i * pi/50, 10 + i * 5)
    })
}
var bump = 40, new_bump = 40, twist = 0, spiration = function(){
    spirate(bump, twist)
    twist += .2
    setTimeout(spiration, 20)
    if(bump != new_bump){
        var diff = new_bump - bump
        bump += 1 * diff / Math.abs(diff)
    }
}

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

animate = function(draw){
    animate.animations.push(draw)
    animate.frame()
    animate.t0 = + new Date()
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

//var squares_in_sixes = function(){
//    a += 1;
//    if(a % 2) return
//    palette_index = palette_index % 1;
//    swing(()=> swing(()=> swing(()=> rotate(()=> shape(4), a / 500), 6, 100), 6, 100), 6, 100)
//}
var Squares = ()=>{ var o = {
    a: 0,
    spin: ()=> rotate(()=> shape(4), o.a),

    f: 0, in_sixes: ()=>{
        o.f += 1
        if(o.f % 2) return

        o.a = t / 10
        palette_index = o.a % palette.length
        swing_rec(o.spin, .5, 8, 300, 3)
        swing(()=> swing(()=> swing(o.spin, 6, 100), 6, 100), 6, 100)
    },

    start: ()=> animate(o.in_sixes)
}; return o }
squares = Squares()

var square_bang = ()=>{
    rotate(cury(swing, ()=> swing(cury(tri, 8, 1000), 8, 0), pi/8, 0, 2), pi/8)
    swing(cury(lseg, 1000, 0), 8, 0);

    spar4 = ()=> spar(2, 10, 4)
    spar4()
    swing(spar4, 4, 200);
};

swing_bang = (n, a) =>{
    rays(n)
    sparn = ()=> spar(a, 10, n)
    sparn()
    swing(sparn, n, 200)
}

var spar = (p, n, s) =>{
    range(n).forEach(i =>{
        rotate(()=> shape(s), pi / p ** i)
        rotate(()=> shape(s), -pi / p ** i)
    })
}

var rays = n =>{
    rotate(()=> swing(()=> tri(n, 1000), n, 0, 30), pi/n)
    swing(()=> lseg(1000, 0), n, 0)
}

var swing_rec = function(draw, scale, n, r, l){
    if(l == 0) return
    rotate(()=> swing(()=>{
        d.save()
        draw()
        d.restore()
        d.scale(scale, scale)
        swing_rec(draw, scale, n, r, l - 1)
    }, n, r), 0)
}

var clamp = (v, min, max) => Math.min(Math.max(v, min), max)

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
