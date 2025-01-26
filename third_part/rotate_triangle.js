var gl;
var points;
var theta = 0;
var fcolor;
var thetaLoc;
var xTranslateLoc;
var yTranslateLoc;
var xtranslation = 0;
var ytranslation = 0;
var xScaleLoc;
var yScaleLoc;
var xScale = 0.3;
var yScale = 0.3;
let isScalePressed = false;
let isRotationPressed = false;
let isTranslationPressed = false;
window.onload = function init(){
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);    
    if ( !gl ) { alert( "WebGL isn't available"); }       
    // Three Vertices
    var vertices = [
        vec3(-1, -1, 0),
        vec3(0, 1, 0),
        vec3(1, -1, 0)
    ];   
    console.log("rotation before the click: ", isRotationPressed);
    console.log("scale before the click: ", isScalePressed);
    console.log("translation before the click: ", isTranslationPressed);
    document.getElementById("container").addEventListener("click", function(event) {
        let translate_data;
    
        // Reset all flags when clicking a button
        isRotationPressed = false;
        isTranslationPressed = false;
        isScalePressed = false;
    
        if (event.target.id === "rButton") {
            isRotationPressed = true;
            rotateZ();
        } else if (event.target.id === "tButton") {
            isTranslationPressed = true;
            getValuesTranslation();
        } else if (event.target.id === "eButton") {
            isScalePressed = true;
            getValuesScale();
        }
    
        console.log("scale after the click: ", isScalePressed);
        console.log("translation after the click: ", isTranslationPressed);
        console.log("rotation after the click: ", isRotationPressed);
    });
    
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
    xTranslateLoc = gl.getUniformLocation(program, "xTranslate");
    yTranslateLoc = gl.getUniformLocation(program, "yTranslate");
    xScaleLoc = gl.getUniformLocation(program, "xScale");
    yScaleLoc = gl.getUniformLocation(program, "yScale");
    render();
    
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform4f(fcolor, 0.0, 1.0, 0.0, 1.0); 
    gl.uniform1f(thetaLoc, theta); 
    gl.uniform1f(xTranslateLoc, xtranslation); 
    gl.uniform1f(yTranslateLoc, ytranslation); 
    gl.uniform1f(xScaleLoc, xScale); 
    gl.uniform1f(yScaleLoc, yScale); 
    gl.drawArrays( gl.TRIANGLES, 0, 3);
    requestAnimFrame(render);
}
function rotateZ() {
    // Clear previous event listeners to avoid multiple bindings
    window.removeEventListener("keydown", handleRotation);
    window.removeEventListener("keydown", handleScaling);
    window.addEventListener("keydown", handleRotation);
    
    window.addEventListener("keyup", () => {
        isRotationPressed = false;
        console.log("Rotation key released. Resetting flags.");
    });
}
function handleRotation(event) {
    if (event.key === "ArrowLeft") {
        theta += 30;
    } else if (event.key === "ArrowRight") {
        theta -= 30;
    }
    console.log("Theta: ", theta);
}
function getValuesScale() {
    // Clear previous event listeners to avoid multiple bindings
    window.removeEventListener("keydown", handleRotation);
    window.removeEventListener("keydown", handleScaling);
    window.addEventListener("keydown", handleScaling);
    
    window.addEventListener("keyup", () => {
        isScalePressed = false;
        console.log("Scaling key released. Resetting flags.");
    });
}
function handleScaling(event) {
    if (event.key === "ArrowUp") {
        yScale += 0.2;
    } else if (event.key === "ArrowDown") {
        yScale -= 0.2;
    } else if (event.key === "ArrowRight") {
        xScale += 0.2;
    } else if (event.key === "ArrowLeft") {
        xScale -= 0.2;
    }
    console.log(`xScale: ${xScale}, yScale: ${yScale}`);
}
function getValuesTranslation() {
    const canvas = document.getElementById("gl-canvas");

    // Add event listener for mouse clicks
    canvas.addEventListener("mousedown", function (event) {
        // Get mouse position relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left; // Mouse X within canvas
        const mouseY = event.clientY - rect.top;  // Mouse Y within canvas

        // Convert mouse position to normalized device coordinates (NDC)
        const ndcX = (2 * mouseX) / canvas.width - 1; // Normalize to [-1, 1]
        const ndcY = 1 - (2 * mouseY) / canvas.height; // Normalize to [-1, 1]

        // Update translation values
        xtranslation = ndcX;
        ytranslation = ndcY;

        // Pass updated translation to shaders
        gl.uniform1f(xTranslateLoc, xtranslation);
        gl.uniform1f(yTranslateLoc, ytranslation);

        // Render the scene with the new translation
        render();
    });
}



