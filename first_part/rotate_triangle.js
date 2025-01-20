var gl;
var points;
var theta = 0;
var thetaLoc;
var zAxis = 0;
var axis = 0;

window.onload = function init(){
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL( canvas );    
    if ( !gl ) { alert( "WebGL isn't available"); }       
    // Three Vertices
    var vertices = [
        vec3(-1, -1, 0),
        vec3(0, 1, 0),
        vec3(1, -1, 0)
    ];
    var colors = [
        vec3(1, 0, 0),
        vec3(0, 1, 0),
        vec3(0, 0, 1)
    ]    
    
    //  Configure WebGL   
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );  
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );        
    // Load the data into the GPU        
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW); 
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    //repeat the same process for the colors of the vertexes
    var cBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW); 
    
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    //event listeners for buttons
    thetaLoc = gl.getUniformLocation(program, "theta"); 
    document.getElementById("zButton").onclick = rotateZ;
    render();
};

function render() {
   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.uniform1f(thetaLoc, theta);
   gl.drawArrays( gl.TRIANGLES, 0, 3);
   requestAnimFrame(render);
}

function rotateZ() {
    theta += 1;
};
