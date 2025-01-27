var gl;
var points;
var theta = 0;
var fcolor;
var thetaLoc;
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
    
    document.getElementById("zButton").onclick = rotateZ;
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
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    fcolor = gl.getUniformLocation(program, "fcolor");
    thetaLoc = gl.getUniformLocation(program, "theta");
    render();

};

function render() {
   gl.clear( gl.COLOR_BUFFER_BIT );
   gl.uniform4f(fcolor, 0.0, 1.0, 0.0, 1.0); 
   gl.uniform1f(thetaLoc, theta); 
   gl.drawArrays( gl.TRIANGLES, 0, 3);
   requestAnimFrame(render);
}

function rotateZ() {
    theta += 3;
};
