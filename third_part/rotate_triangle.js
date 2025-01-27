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

let selectedTriangle = false; // Flag to check if triangle is selected
let lastMouseX, lastMouseY; // Store last mouse position

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);    
    if (!gl) { alert("WebGL isn't available"); }       

    // Three Vertices
    var vertices = [
        vec3(-1, -1, 0),
        vec3(0, 1, 0),
        vec3(1, -1, 0)
    ];   

    // Configure WebGL   
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);  
    
    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);        

    // Load the data into the GPU        
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW); 

    // Associate shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    fcolor = gl.getUniformLocation(program, "fcolor");
    thetaLoc = gl.getUniformLocation(program, "theta");
    xTranslateLoc = gl.getUniformLocation(program, "xTranslate");
    yTranslateLoc = gl.getUniformLocation(program, "yTranslate");
    xScaleLoc = gl.getUniformLocation(program, "xScale");
    yScaleLoc = gl.getUniformLocation(program, "yScale");

    // Add event listeners for mouse interactions
    
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
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
        } else if (event.target.id === "eButton") {
            isScalePressed = true;
            getValuesScale();
        }
    });
        
    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Set color for the triangle that will be Red if selected, green if not
    const triangleColor = selectedTriangle ? [1.0, 0.0, 0.0] : [0.0, 1.0, 0.0]; 
    gl.uniform4f(fcolor, ...triangleColor, 1.0); 

    // Set transformation uniforms
    gl.uniform1f(thetaLoc, theta); 
    gl.uniform1f(xTranslateLoc, xtranslation); 
    gl.uniform1f(yTranslateLoc, ytranslation); 
    gl.uniform1f(xScaleLoc, xScale); 
    gl.uniform1f(yScaleLoc, yScale); 

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    requestAnimFrame(render);
}

function handleMouseDown(event) {
    const canvas = document.getElementById("gl-canvas");
    
    // Get mouse coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1; // Convert to NDC
    const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1; // Convert to NDC

    // Check if click is within triangle bounds using color picking technique
    if (isPointInTriangle(x, y)) {
        selectedTriangle = !selectedTriangle; // Toggle selection state
        console.log("Triangle selected:", selectedTriangle);
        
        // Store last mouse position for translation
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        
        if (selectedTriangle) {
            document.addEventListener('mouseup', handleMouseUp);
        }
        
        return; // Exit if clicked inside triangle
    }
}

function handleMouseMove(event) {
   if (!selectedTriangle) return; // Only move if the triangle is selected
   
   const canvas = document.getElementById("gl-canvas");
   const rect = canvas.getBoundingClientRect();

   // Calculate translation based on mouse movement
   const deltaX = ((event.clientX - rect.left) / canvas.width) * 2 - 1 - ((lastMouseX - rect.left) / canvas.width) * 2 + 1; 
   const deltaY = -((event.clientY - rect.top) / canvas.height) * 2 + 1 - (-((lastMouseY - rect.top) / canvas.height) * 2 + 1); 

   xtranslation += deltaX; 
   ytranslation += deltaY;

   // Update last mouse position
   lastMouseX = event.clientX;
   lastMouseY = event.clientY;
}

function handleMouseUp(event) {
   selectedTriangle = false; // Deselect when mouse is released
   document.removeEventListener('mouseup', handleMouseUp);
}

function isPointInTriangle(x, y) {
   const verticesNDC = [
       vec3(-1,-1), 
       vec3(0,1), 
       vec3(1,-1)
   ];

   let areaOrig = Math.abs((verticesNDC[0][0] * (verticesNDC[1][1] - verticesNDC[2][1]) +
                             verticesNDC[1][0] * (verticesNDC[2][1] - verticesNDC[0][1]) +
                             verticesNDC[2][0] * (verticesNDC[0][1] - verticesNDC[1][1])));

   let areaA = Math.abs((x * (verticesNDC[1][1] - verticesNDC[2][1]) +
                             verticesNDC[1][0] * (verticesNDC[2][1] - y) +
                             verticesNDC[2][0] * (y - verticesNDC[1][1])));

   let areaB = Math.abs((verticesNDC[0][0] * (y - verticesNDC[2][1]) +
                             x * (verticesNDC[2][1] - verticesNDC[0][1]) +
                             verticesNDC[2][0] * (verticesNDC[0][1] - y)));

   let areaC = Math.abs((verticesNDC[0][0] * (verticesNDC[1][1] - y) +
                             verticesNDC[1][0] * (y - verticesNDC[0][1]) +
                             x * (verticesNDC[0][1] - verticesNDC[1][1])));

   return areaA + areaB + areaC <= areaOrig; // Check if point is inside triangle
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

