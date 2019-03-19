var d, pi = Math.PI, palette = [], palette_index = 0,
    sin = Math.sin, cos = Math.cos, pow = Math.pow

var sqrt = function(v){ return pow(v, .5) }
var square = function(v){ return pow(v, 2) }

var range = function(start, end) {
    if(typeof(end) == "undefined") { end=start; start=0 }
    var l = []
    for (var i = start; i < end; i++){
        l.push(i)
    }
    return l
}

var zip = function(list1, list2) {
    var ret = []
    for(var i = 0; i < list1.length; i++)
        ret.push([list1[i], list2[i]])
    return ret
}

var partial = function(func){
    var partial_args = Array.prototype.slice.call(arguments, 1)
    return function(){
        func.apply(null, partial_args.concat(arguments))
    }
}

var interp = function(p, start, end){ return (end - start) * p + start }
var vector_interp = function(p, start, end){
    return zip(start, end).map(function(v){ return interp(p, v[0], v[1]) })
}
var css_color = function(l){
    return (
        'rgba(' + 
        l.slice(0,3).map(function(v){ return v >> 0 }).concat(l[3]).join(',')
        + ')'
    )
}
var next_index = function(list, i){ return (i + 1) % list.length }
var get_color = function(i){
    var index = i >> 0, fraction = i % 1
    return vector_interp(fraction, palette[index],
        palette[next_index(palette, index)])
}
var palette_next = function(){
        var color = get_color(palette_index)
        palette_index = next_index(palette, palette_index)
        return css_color(color)
    },
    palette_fill = function(){
        d.fillStyle = palette_next()
    },
    palette_stroke = function(){
        d.strokeStyle = palette_next()
    }

self.run = function(){
    var canvas = $('canvas').eq(0)
    d = canvas[0].getContext('2d')
    $(window).on('resize', function(){ resize(canvas, 0) }) 
    resize(canvas, 0)

    palette = [
        [255, 0  , 0  , .2],
        [0  , 0  , 255, .2],
        [255, 255, 0  , .2],
        [255, 0  , 255, .2],
        [0  , 255, 255, .2]
    ]

    spiration()
}
self.stop = function(){
    go = false
}

function resize(canvas, scale_coord){
    var height = 1024 * (canvas.height() / canvas.width())
    canvas.attr('height', height)
    d.translate(512, height / 2)
    d.scale(.8, .8)
    d.save()

    // var pixels = [canvas.width(), canvas.height()]
    //     ,s = pixels[scale_coord] / 1000
    // canvas.attr('width', pixels[0]).attr('height', pixels[1])
    // d.translate(pixels[0] / 2, pixels[1] / 2)
    // d.scale(s, s)
    // d.save()
}

var clear = function(){
    d.restore(); d.save()
    d.clearRect(-1280,-720,2560,1440)
}

var gfx = function(draw){ return function(){
    d.save()
    draw.apply(null, arguments)
    d.restore()
} }

var rotate = gfx(function(draw, a){ d.rotate(a); draw() })

var shape = function(n){
    var seg = function(a){
        d.rotate(pi*2/a)
        d.lineTo(100,0)
    }

    d.save()
    d.beginPath()
    d.moveTo(100,0)
    range(n-1).map(function(){seg(n)})
    d.closePath()
    palette_fill()
    d.stroke()
    d.fill()
    d.restore()
}

var swing = function(draw, slice, r, steps){
    if(!steps) steps = slice
    d.save()
    range(steps).map(function(){
        d.save()
        d.translate(r, 0)
        draw()
        d.restore()
        d.rotate(2*pi/slice)
    })
    d.restore()
}

var lsegr = function(l, a){
    d.beginPath()
    d.moveTo(0,0)
    d.rotate(a)
    d.translate(l,0)
    d.lineTo(0,0)
    // palette_stroke()
    d.stroke()
}, lseg = gfx(lsegr)

var wobble = function(freq, amp, phase, radius_center){
    var n = 0, r = function(){
        return radius_center + Math.sin(n * freq + phase) * amp
    }
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
}

var spirate = function(bump, twist){
    range(80).reverse().map(function(i){
        wobble(7, sin(i * pi/50) * bump, twist * i * pi/50, 10 + i * 5)
    })
}
var go = true, bump = 40, bump_delta = 1, twist = 0, spiration = function(){
    spirate(bump, twist)
    twist += .2
    if(go) setTimeout(spiration, 20)
    bump += bump_delta
    if(bump == 110 || bump == 0)
      bump_delta *= -1
}
