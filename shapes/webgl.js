<!DOCTYPE HTML>
<html>
<head>
<script src='jquery-2.0.2.js'></script>
<script src='shapes.js'></script>
<script src='three.js'></script>

<!--
<link rel="stylesheet" href="codemirror/lib/codemirror.css">
<script src="codemirror/lib/codemirror.js"></script>
<script src="codemirror/mode/javascript/javascript.js"></script>
-->
<style>

body { margin: 0; height: 100%; }
img, canvas {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
}
img { z-index: 0 }
canvas { z-index: 1 }

.CodeMirror {
    z-index: 2;
    position: absolute;
    bottom:0; right:0;
    width: 100%; height: 100%;
}
.cell { background-color: red; border:solid 1px black; width:23px; height:23px;}

</style>
</head>
<body>
<!-- <img src='sky.jpg'> -->
<canvas width='2560' height='1440'></canvas>
<script>

var scene, camera, renderer

function init_gl(){
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75,
        window.innerWidth/window.innerHeight, 0.1, 1000 )
    camera.position.set(0, 0, 150)
    camera.lookAt(scene.position)
    scene.add(camera)

    renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setSize( window.innerWidth, window.innerHeight )
    renderer.setClearColor(0xffffff, 1)
    document.body.appendChild( renderer.domElement )
}
// init_gl()

function gl_color(){
    var c = palette[palette_index]
    palette_index = next_index(palette, palette_index)
    return { color:
        new THREE.Color(c[0] / 255, c[1] / 255, c[2] / 255),
        opacity: c[3]
    }
}

function wobble_gl(freq, amp, phase, radius_center, depth){
    var angle = 0, radius = function(){
        return radius_center + Math.sin(angle * freq + phase) * amp }
    var step = 2*pi / (radius_center*5)

    var fill_shape = new THREE.Shape()
    var border_geom = new THREE.Geometry()
    fill_shape.moveTo(radius(), 0)
    border_geom.vertices.push(new THREE.Vector3(radius(), 0, 0))
    var line_to = function(x, y){
        fill_shape.lineTo(x, y)
        border_geom.vertices.push(new THREE.Vector3(x, y, 0))
    }

    for(; angle <= 2*pi; angle += step){
        var r = radius()
        line_to(Math.cos(angle) * r, Math.sin(angle) * r)
    }
    border_geom.vertices.push(border_geom.vertices[0])

    var fill_color = new THREE.MeshBasicMaterial(gl_color())
    var fill = new THREE.Mesh(new THREE.ShapeGeometry(fill_shape), fill_color)
    fill.position.set(0, 0, -depth / 100)
    scene.add(fill)

    var border_style = new THREE.LineBasicMaterial({ color: 0x000000,
        linewidth: 3 })
    var border = new THREE.Line( border_geom, border_style )
    border.position.set(0, 0, -depth / 100)
    scene.add(border)
}

var spirate = function(bump, phase){
    range(20).reverse().map(function(i){
        wobble_gl(7, sin(i * pi/50) * bump, phase * i * pi/50, 10 + i * 5, i)
    })
}, spiration = function(){
// wobble(7, 40, 0, 60, 0)

renderer.render(scene, camera)

</script>
</body>
</html>