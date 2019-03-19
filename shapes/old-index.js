var d, pi = Math.PI, palette = [], palette_index = 0, canvas,
    sin = Math.sin, cos = Math.cos, pow = Math.pow,
    sqrt = function(v){ return pow(v, .5) },
    square = function(v){ return pow(v, 2) },
    abs = Math.abs

var range = function(start, end) {
    if (typeof(end) == "undefined"){
        end=start
        start=0
    }
    var l = []
    for (var i = start; i < end; i++){
        l.push(i)
    }
    return l
}

var zip = function(list1, list2) {
    var ret = []
    for(var i = 0; i < list1.length; i++) ret.push([list1[i], list2[i]])
    return ret
}

var p, partial = p = function(func){
    var partial_args = Array.prototype.slice.call(arguments, 1)
    return function(){
        func.apply(null, partial_args.concat($.makeArray(arguments)))
    }
}
var sequence = function(){
    for(var n in arguments) arguments[n]()
}

var interp = function(p, start, end){ return (end - start) * p + start }
var vector_interp = function(p, start, end){
    return zip(start, end).map(function(v){ return interp(p, v[0], v[1]) })
}
var css_color = function(l){
    return 'rgba(' + 
        l.slice(0,3).map(function(v){ return v >> 0 }).concat(l[3]).join(',')
        + ')'
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
        d.fillStyle = palette_next(); },
    palette_stroke = function(){
        d.strokeStyle = palette_next(); }

var resize = function(){
    var pixels = [canvas.width(), canvas.height()]
        ,s = Math.max.apply(null, pixels) / 1000
    canvas.attr('width', pixels[0]).attr('height', pixels[1])
    d.translate(pixels[0] / 2, pixels[1] / 2)
    d.scale(s, s)
    d.save()
}

var clear = function(){
    d.restore()
    d.save()
    d.clearRect(-500,-500,1000,1000)
}

var swing = function(draw, n, r, steps){
    if(!steps) steps = n
    d.save()
    range(steps).map(function(i){
        d.save()
        d.translate(r, 0)
        draw(i)
        d.restore()
        d.rotate(2*pi/n)
    })
    d.restore()
}

var swing_rec = function(draw, scale, n, r, l){
    if(l == 0) return
    swing(function(){
        d.save()
        draw()
        d.restore()
        d.scale(scale, scale)
        swing_rec(draw, scale, n, r, l - 1)
    }, n, r)
}

var shape = function(n, r){
    if(!r) r = 100

    var seg = function(a){
        d.rotate( pi *  2 / a )
        d.lineTo(r, 0)
    }

    d.save()
    d.beginPath()
    d.moveTo(r, 0)
    range(n - 1).map(function(){ seg(n) })
    d.closePath()
    palette_fill()
    d.stroke()
    d.fill()
    d.restore()
    d.moveTo(0,0)
}

var init = function(no_canvas){
    palette = [
        [255, 0  , 0  , .1],
        [0  , 0  , 255, .1],
        [255, 255, 0  , .1],
        [255, 0  , 255, .1],
        [0  , 255, 255, .1]
    ]

    palette = [
         [20,180,255,0.3]
        ,[240,0,50,0.3]
        ,[255,255,0,0.3]
        ,[55,230,10,0.3]
        ,[0,255,255,0.3]
    ]

    palette = [
         [100,20 ,40 ,0.1]
        ,[255,80 ,0  ,0.1]
        ,[220,220,0  ,0.1]
        ,[0  ,100,20 ,0.1]
        ,[0  ,100,220,0.1]
    ]

    if(!no_canvas){
        canvas = $('canvas')
        d = canvas[0].getContext('2d')

        $(window).on('resize', resize)
        resize()
    }
}

in_sixes = function(){
    var a = 0, angs = [], pulse = [], square_spin = function(a){
        d.rotate(a)
        shape(3)
    }

    palette_index = palette_index % 1
  
    pulse = [
        Math.sin((new Date()).getTime() / 100)
        ,Math.sin((new Date()).getTime() / 300)
        ,Math.sin(pi + (new Date()).getTime() / 1000)
    ]
    
    swing(function(a){
        swing(function(b){
            var i = a * 10 + b
            if(!angs[i]) angs[i] = 0
            angs[i] += .0021*a + .002*b + pulse[0] / 500
            square_spin(angs[i])
        }, 4, (pulse[1]+1) * 10)  
    }, 5, (pulse[2] + 1) * 50)
}

var gfx = function(draw){ return function(){
    d.save()
    draw.apply(null, arguments)
    d.restore()
} }

var move = gfx(function(draw, x, y){
    d.translate(x,y)
    draw()
})

var rotate = gfx(function(draw, a){
    d.rotate(a)
    draw()
})

var scale = gfx(function(draw, a){
    d.scale(a, a)
    draw()
})

var wobble = function(freq, amp, phase, radius_center){
    var n = 0, r = function(){
        return radius_center + Math.sin(n * freq + phase) * amp }
    d.save()
    d.beginPath()
    var step = 2*pi / (radius_center*5)
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

var lsegr = function(l, a){
    d.beginPath()
    d.moveTo(0,0)
    d.rotate(a)
    d.translate(l,0)
    d.lineTo(0,0)
    // palette_stroke()
    d.stroke()
}, lseg = gfx(lsegr)

var tri = function(slice, r){
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
}

var jewel = function(){
    var hex = partial(shape, 5), square = partial(shape, 4)
    var jewel_1 = function(){
        var hex = partial(shape, 5)
        swing(hex, 9, 189)
        swing(hex, 9, 195)
        swing(hex, 9, 183)

        swing(square, 6, 85)
        swing(square, 6, 91)
        swing(square, 6, 79)
    }

    range(22).map(function(){ swing(partial(tri, 9, 800), 18, 0) })

    jewel_1()

    swing(function(){
        d.scale(.2,.2)
        d.rotate(pi/9)
        jewel_1()
    }, 9, 354)
}

var penta_splay = function(a){
    var splay = function(){
        swing(function(){ shape(5) }, 18, 202)
        swing(function(){ shape(5) }, 18, -402)
    }

    d.strokeStyle = 'rgb(255,255,255)'
    var dir = 1
    range(5).map(function(i){
        dir *= -1
        d.save()
        d.rotate(dir * a)
        var scale = Math.pow(.25, i)
        d.scale(scale, scale)
        splay()
        d.restore()
    })

    d.restore()
    d.save()
}

var penta_mosaic = function(){
    swing(function(){ swing(function(){ swing(function(){ swing(function(){ swing(function(){ shape(5) }, 5, 100) }, 5, 100) }, 5, 100) }, 5, 100) }, 5, 100)
}

var wild_ride = function(){
    swing(function(){ swing(function(){ swing(function(){ shape(4) }, 6, 100) }, 4, 200) }, 6, 400)
}

var spirate = function(bump, phase){
    range(40).reverse().map(function(i){
        wobble(7, sin(i * pi/50) * bump, phase * i * pi/50, 10 + i * 5)
    })
}, spiration = function(){
    var n = 0
    setInterval(function(){
        spirate(10 + sin(n) * 5, sin(n) * 2)
        n += .01
    }, 200)
}

var tri_hexa = function(){
    var triseg = function(){
        swing(function(){
            swing(function(){ shape(6) }, 60, 100, 11)
            d.rotate(pi)
            swing(function(){ shape(6) }, 60, 100, 11)
        }, 3, 200)
    }

    triseg()
    swing(function(){
        d.translate(200,0)
        d.rotate(-pi/3)
        d.translate(400,0)
        triseg()
    }, 3, 0)
}

var _animate = false, _frame = false, animate = function(f){
    _animate = true
    _frame = function(){
        f()
        if(_animate) requestAnimationFrame(_frame)
    }
    _frame()
}
var stop = function(){ _animate = false }

var to_image = function(){
    var img = new Image()
    img.src = canvas[0].toDataURL('image/png')
    return img
}

var draw_image = function(im){
    d.save()
    var a = 1000 * im.height / im.width
    d.drawImage(im, -500, -a/2, 1000, a)
    d.restore()
}

var squares_in_sixes = function(){
    var a = 0, square_spin = function(){ d.rotate(a); shape(4) }
    var in_sixes = function(){
        a += .01
        palette_index = (a/Math.PI) % palette.length
        swing_rec(square_spin, .5, 8, 300, 3)
        swing(function(){
            swing(function(){
                swing(square_spin, 6, 100)
            }, 6, 100)
        }, 6, 100)
    }
    animate(in_sixes)
}

// var frames = [], frm = function(){
//     a += .01
//     var frn = Math.round(a*100 % 156);
//     if(frames[frn]){
//         d.putImageData(frames[frn],0,0)
//         // in_sixes()
//     }
//     else{
//         clear()
//         palette_index = Math.abs((frn / 155) - .5) * 2
//         nest()
//         frames[frn] = d.getImageData(0,0,1000,1000)
//     }
// }

var square_bang = function(){
    var spar = function(){
        range(6).map(function(i){
            rotate(partial(shape, 4), pi/pow(2,i+2))
            rotate(partial(shape, 4), -pi/pow(2,i+2))
        })
    }

    rotate(partial(swing, function(){
        swing(partial(tri, 8, 1000), 8, 0)
    }, pi/8, 0, 2), pi/8)
    swing(partial(lseg, 1000, 0), 8, 0)

    spar()
    swing(partial(rotate, spar, pi/4), 4, 200)
}

var spar = function(p, n, s){
    range(n).map(function(i){
        rotate(partial(shape, s), pi/pow(p,i+2))
        rotate(partial(shape, s), -pi/pow(p,i+2))
    })
}

var nested_squares = function(){
    [300, 200, 100, 50].map(function(r){
        swing_rec(partial(shape, 4), .5, 8, r, 4)
    })
}

var nested_triangles = function(){
    [300, 200, 100, 50].map(function(r){
        swing_rec(partial(shape, 3), .5, 6, r, 4)
    })
}

var sides = 3, a = 0, r = 0, animate, expand = 1, go = 1
var shape_spin = function(){
    d.save()
    d.rotate(a)
    shape(sides)
    d.restore()
}

var next_frame = function(){
    r += Math.max(abs(r) / 200, .5) * expand
    a += .01
    palette_index = 0
    clear()
    animate()
    if(go) requestAnimationFrame(next_frame)
}, pause = function(){ go = 0 }, play = function(){
    go = 1
    next_frame()
}

var step1 = function(){
    swing_rec(shape_spin, .5, 3, r, 6)
    if(r > 950){
        r = 1400
        expand = -1
        animate = step2
    }
}, step2 = function(){
    swing_rec(shape_spin, .5, 7, r, 3)
    if(r < -1400){
        r = 0
        expand = 1
        sides = 6
        animate = step3
    }
}, step3 = function(){
    swing_rec(shape_spin, .5, 5, r, 4)
    if(r > 1800){
        r = 0
        sides = 5
        animate = step4
    }
}, step4 = function(){
    swing_rec(shape_spin, .5, 6, r, 3)
    if(r > 2200){
        expand = -1
        animate = step5
    }
}, step5 = function(){
    swing_rec(shape_spin, .5, 5, r, 4)
    if(r < -3000){
        sides = 3
        r = 0
        expand = 1
        animate = step1
    }
}

var begin_story = function(){
    animate = step1
    next_frame()
}

var hex_gear = function(){
    next_frame = function(){
        r = sin(a) * 100
        a += .01
        palette_index = 0
        clear()
        animate()
        if(go) requestAnimationFrame(next_frame)
    },
    animate = function(){
        swing(function(i){
            d.rotate(a / 5)
            swing(function(){
                d.scale(.5, .5)
                d.rotate(a)
                swing(function(){
                    d.rotate(a/10)
                    shape(6)
                }, 3, r)
            }, 12, 100)
        }, 3, 100)
    }

    $('body').css('background-color', 'black')
    d.strokeStyle = 'rgba(255,255,255,.2)'
    d.save()
    next_frame()
}

var boring_tree = function(){
    d.translate(0, -150)

    rec_line = function(x, y, f, f2){
        d.save()
        d.beginPath()
        d.moveTo(0,0)
        f2()
        d.translate(x, y)
        d.lineTo(0, 0)
        d.stroke()
        f()
        d.restore()
    }

    draw = function(w, l, history){
        var w_factor
        if(l>0){
            w_factor = (l == 1) ? 1 : .5
            rec_line(-w, 20, p(draw, w * w_factor, l-1, history.concat(1)),
                p(shape, 50, w/2))
            rec_line( w, 20, p(draw, w * w_factor, l-1, history.slice(1).concat(-1)),
                p(shape, 50, w/2))
        }else{
            w_factor = 2
            if(!history.length) return
            rec_line(history.pop() * w, 20, p(draw, w * w_factor, l, history),
                p(shape, 50, w/2))
        }
    }
    var w_factor = .5
    draw_simple = function(w, l){
        if(!l) return
        rec_line(-w, 20, p(draw_simple, w * w_factor, l-1))
        rec_line( w, 20, p(draw_simple, w * w_factor, l-1))
    }
}

var open_editor = function(){
    var w = window.open('.')
        ,editor
        ,change = function(cm){
            eval(cm.getValue())
        }
        
    setTimeout(function(){
        editor = CodeMirror(w.document.body, {})
        editor.on('change', change)
        editor.focus()
    }, 500)
    window.editor = editor
}
