let args = [1], rules = {
  "identity": (a, b, c) => b,
  "drips": (a, b, c) => (1.01 * (a + b + c) / 3) % 1,
  "mountains": (a, b, c) => (1.001 * Math.max( a + b, b + c ) / 2) % 1,
  "houses": (a, b, c) => (Math.min( a + b, b + c ) / 1.8) % 1,
  "sierpinski": (a, b, c) =>{
    let avg = (a + b + c) / 3
    return [a-b, a-c, b-c].findIndex(x => Math.abs(x) > .05) == -1 ? 1.01 : .8
  },
  "triangles": (a, b, c) =>{
    let avg = (a + b + c) / 3
    return [a-b, a-c, b-c].findIndex(x => Math.abs(x) > .2) == -1 ?
        ( avg + Math.exp(avg) / 500 ) :
        Math.min(a + b, a + c, b + c) * .49
  },
  "triangle waves": (a, b, c) =>{
    let avg = (a + b + c) / 3
    return [a-b, a-c, b-c].findIndex(x => Math.abs(x) > .2) == -1 ?
        avg + .02 + Math.abs(Math.sin(t) + 1) / 30 :
        Math.min(a + b, a + c, b + c) * .49
  },
  "magic pi": (a, b, c) =>{
    let avg = (a + b + c) / 3
    return avg + Math.sin(avg) / args[0]
  }
},

rule = rules.triangles, width, cells,
neighbors = i => [ cells[i > 0 ? i - 1 : width - 1], cells[i],
  cells[(i + 1) % width] ]
cellulate = ()=> cells.map( (x, i) => rule(...neighbors(i)) )

draw, tiles, tileSize = 100, tileMargin = 0, tileOffset = 0, go = 1,
t = 0, render = ()=>{
  tiles.forEach( (x, i) => draw.putImageData(
    x.getImageData(0,0,width,tileSize), 0, i * tileSize - tileOffset ) )
  tileOffset += 1
  if(go) setTimeout(()=> requestAnimationFrame(render), 25)
  if(tileOffset > tileSize - tileMargin){
    renderTile(tiles[0])
    tiles.push(tiles.shift())
    tileOffset = 0
  }
  t += .01
},

renderTile = tile => range(tileSize).forEach(x =>{
  let cells2 = cellulate()
  tile.putImageData(cells2Img(cells), 0, x)
  cells = cells2
}),
 
ruleName = 'triangles', rule_set = ()=>{
  ruleName = $('#rules').val()
  rule = rules[ruleName]
  $('#rule').val(rule.toString())
},
cell_reset = [
  ()=> range(0, 1, 1/width),
  ()=> range(0, 1, 2/width).concat(range(0, 1, 2/width).reverse()),
  ()=> range(width).map(Math.random),
  ()=> {
      let l = Array(95).fill(0), out = []
      l = l.concat([1,1,1,1,1])
      while(out.length < width) out = out.concat(l)
      return out
  }
].map(f => ()=> cells = new Float32Array(f())),
play_pause = ()=>{
  let buttons = $('.button').removeClass('on')
  buttons.eq(go).addClass('on')
  go = Math.abs(1 - go)
  if(go) render()
},
initUI = ()=>{
  Object.keys(rules).forEach(v => {
    let el = document.createElement('option')
    el.value = v; el.innerText = v
    if(v == ruleName) el.selected = true;
    $(el).appendTo('#rules')
  })
  rule_set()
  $('#rules').on('change', rule_set)
  $('#reset').on( 'change', ()=> cell_reset[$('#reset').val()]() )
  $('.button').on('click', play_pause)
  $('#rule').on('keyup', ()=>{
    let f = 0
    try {
      f = eval($('#rule').val())
      f(0, 1, 2)
    } catch( ex ){
      $('#error').text(ex.message)
    }
    if(f){
      rule = f
      $('#error').text('')
    }
  })
},

height, init = ()=>{
  let canvas = $('canvas')[0]
  draw = canvas.getContext('2d')
  width = canvas.width
  height = canvas.height
  cell_reset[0]()
  tiles = range( Math.ceil(height / (tileSize - tileMargin)) + 1
    ).map( x => buff(width, tileSize) )
  tiles.forEach(renderTile)

  initUI()
  render()
},

cellColor = x => Math.floor( Math.abs(
  (x+1) / 2 % 1 + .5 * (x+1 < 0 ? 1 : -1) ) * 510 ),

cells2Img = cells =>{
  let img = new ImageData(width, 1)
  cells.forEach( (x, i) =>{
    [0,1,2].forEach(o => img.data[i*4+o] = cellColor(x) )
    img.data[i*4+3] = 255
  })
  return img
},

range = (start, end, step=1) =>{
  if( end === undefined ){ end = start; start = 0 }
  for(var l = []; start < end; start += step) l.push(start)
  return l
},

rgb = (r,g,b) => 'rgb(' + [r,g,b].slice(0,3).map(v => v*255 >> 0).join(',') + ')',

buff = (width, height) =>{
  let canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  return canvas.getContext('2d')
}

