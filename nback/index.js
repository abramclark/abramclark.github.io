game = opts =>{
var o = {}, opts = opts || {},
    $ = q => document.querySelector(q),
    $$ = (q, fn)=> document.querySelectorAll(q).forEach(fn)

o.delay = (opts.delay || 3) * 1000
o.nback = opts.nback || 2
o.evilness = opts.evilness || 0
o.x = []; o.frames = []; o.frame = {}; o.bframe = {}

o.select = {
    x:opts.x || true, symbol:opts.symbol, color:opts.color, sound:opts.sound }
o.symbol = 'ABCDEFGHI'.split('') // ABCDEFGHIJKLMNOPQRSTUVXYZ' 
o.color = ['#000', '#009', '#900', '#960', '#430', '#A3D', '#555',
    '#099', '#990'] 
o.color_names = ['black', 'blue', 'red', 'orange', 'brown', 'pink', 'grey',
    'cyan', 'yellow']
o.sound = ['duck', 'star', 'pie', 'drop', 'ball', 'keys', 'wave', 'gear',
    'tree'] // 🦆 ⭐️ 🍰 💧 ⚽️ 🎹 🌊 ⚙️  🌳
o.size = 3

o.match = key => o.frame[key] == o.bframe[key]

o.draw_frame = ()=>{
    var el = o.x[o.frame.x != null ? o.frame.x : 4]
    if(o.frame.symbol != null) el.innerText = o.symbol[o.frame.symbol]
    el.style.backgroundColor = o.color[
        o.frame.color != null ? o.frame.color : 1]
    if(o.frame.sound != null) o.say(o.sound[o.frame.sound])

    setTimeout(()=>{
        el.innerText = ''
        el.style.backgroundColor = o.color[0]
        $$('.yes, .no', e => e.classList.remove('yes', 'no'))
    }, o.delay * .9)
}

o.next_frame = ()=>{
    // var prev_frame = o.frame
    var frame = {}

    if(!o.evilness) for(var k in o.select) if(o.select[k])
        frame[k] = (o.bframe[k] && Math.random() < .333 ? o.bframe[k] :
            Math.floor(Math.random() * o[k].length))
    // TODO: more evil

    o.frames.push(o.frame)
    o.bframe = o.frames.length >= o.nback ? o.frames.slice(-o.nback)[0] : {}
    o.frame = frame
    if(o.frames.length > 10) o.frames.unshift()
}

o.render_board = size =>{
    var board = $('#board').cloneNode(false)
    o.x = Array(size**2).fill(0).map(()=>{
        var square = document.createElement('div')
        board.append(square)
        return square
    })
    $('#board').replaceWith(board)
}

o.button_down = key =>{
    var el = o.buttons[key]
    if(o.select[key]) el.classList.add(o.match(key) ? 'yes' : 'no')
    else {
        o.select[key] = true
        o.render_state()
    }
}

o.nback_plus = ()=>{ o.nback && o.nback--; o.render_state() }
o.nback_minus = ()=>{ o.nback < 10 && o.nback++; o.render_state() }

o.init = ()=>{
    o.buttons = {}
    Object.keys(o.select).forEach(k =>{
        var el = $('#' + k); o.buttons[k] = el
        el.onmousedown = el.ontouchstart = ()=> o.button_down(k)
    })
    $('#go').onclick = ()=> o.go_toggle()
    $('#nback_minus').onclick = ()=> o.nback_plus()
    $('#nback_plus').onclick = ()=> o.nback_minus()
    window.onkeypress = ev =>{
        var k = {'1':'position', '2':'symbol', '3':'color', '4':'sound'}[ev.key]
        if(k) o.button_down(k)
        if(ev.key == 'Enter') o.go_toggle()
    }

    o.render_board(o.size)
    o.render_state()
    return o
}

o.render_state = ()=>{
    $('#nback').innerText = o.nback
    $$('.go', e => e.classList.add('hide'))
    $('.' + (o.go ? 'stop' : 'start')).classList.remove('hide')
    Object.entries(o.buttons).forEach(([k, e])=>
        e.className = o.select[k] ? '' : 'disable')
}    

o.say = s => window.speechSynthesis.speak(new SpeechSynthesisUtterance(s))

o.step = ()=>{
    o.next_frame()
    o.draw_frame()
    if(o.go) setTimeout(o.step, o.delay)
}
o.start = ()=>{ o.go = true; o.step(); o.render_state(); return o; }
o.stop = ()=>{ o.go = false; o.render_state(); return o; }
o.go_toggle = ()=> (o.go ? o.stop : o.start)()

return o
}
