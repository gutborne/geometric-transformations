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
var colorIndexLocation;
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
    
    document.getElementById("container").addEventListener("click", 
        function(event){
            var translate_data;
            if(event.target && event.target.id === "rButton"){
                rotateZ();
            }else if(event.target && event.target.id === "tButton"){
                translation();
            }else if(event.target && event.target.id === "eButton"){
                translate_data = document.getElementById("exy-section");
                if(translate_data.style.display === "none"){
                    translate_data.style.display = "block";
                    getValuesScale();
                }else{
                    translate_data.style.display = "none";
                }
            }
        }
    );
    
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
    // Get the uniform location for `i`
    colorIndexLocation = gl.getUniformLocation(program, "i");
    thetaLoc = gl.getUniformLocation(program, "theta");
    xTranslateLoc = gl.getUniformLocation(program, "xTranslate");
    yTranslateLoc = gl.getUniformLocation(program, "yTranslate");
    xScaleLoc = gl.getUniformLocation(program, "xScale");
    yScaleLoc = gl.getUniformLocation(program, "yScale");
    gl.uniform4f(fcolor, 0.0, 1.0, 0.0, 1.0); 
    render();
};

function render(colorIndex) {
    gl.clear( gl.COLOR_BUFFER_BIT ); 
    gl.uniform1f(thetaLoc, theta); 
    gl.uniform1i(colorIndexLocation, colorIndex);
    
    gl.uniform1f(xScaleLoc, xScale); 
    gl.uniform1f(yScaleLoc, yScale); 
    gl.drawArrays( gl.TRIANGLES, 0, 3);
    requestAnimFrame(render);
}
var canvas = document.getElementById("gl-canvas");

function rotateZ() {
    theta += 20.0;
};


function getValuesScale(){
    var tForm = document.getElementById("eForm");
    tForm.addEventListener("submit", function(event) {
        var userImputX = document.getElementById("xScale").value; 
        xScale = parseFloat(userImputX) || 0;
        var userImputY = document.getElementById("yScale").value; 
        yScale = parseFloat(userImputY) || 0;
        event.preventDefault();
    }    
)};    

function translation() {
    const canvas = document.getElementById("gl-canvas");
    let isDragging = false;
    let selectedTriangle = false;
    let startX = 0;
    let startY = 0;
    
    canvas.addEventListener("mousedown", function(event) {
        // Render to texture with base colors
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT);
        // Enable face culling (optional for 2D but kept here for completeness)
        gl.enable(gl.CULL_FACE);
        // Create a texture to use as the color attachment for the framebuffer
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Flip the image vertically (useful for textures)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        
        // Allocate memory for the texture
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        // Generate mipmaps (optional, but helps with texture scaling)
        gl.generateMipmap(gl.TEXTURE_2D);
        
        // Create a framebuffer object (FBO) and bind it
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        
        // Attach the texture as the color attachment for the framebuffer
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        
        
        // Render a single triangle with distinct base colors for detection
        //gl.uniform1i(gl.getUniformLocation(program, "i"), 2); // Assume triangle has index 1
        gl.drawArrays(gl.TRIANGLES, 0, 3); // Adjust to 2D triangle with 3 vertices
    
        // Get mouse position
        var x = event.clientX;
        var y = canvas.height - event.clientY;
        // Create an array to hold the pixel color data
        var color = new Uint8Array(4);
      
        // Get color at mouse location
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
    
        // Define color names for matching
        var colorNames = [
            "background", "red", "green", "blue", "cyan", "magenta", "yellow", "white"
        ];
    
        // Determine the color based on the pixel values
        var nameIndex = 0;
        if (color[0] === 255) nameIndex += (1 << 2); // Red component
        if (color[1] === 255) nameIndex += (1 << 1); // Green component
        if (color[2] === 255) nameIndex += (1 << 0); // Blue component
    
        console.log("Detected color:", colorNames[nameIndex]);
    
        // Normal render
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3); // Render 2D triangle again
    });
    
    // Add event listener for mouse move (dragging)
    canvas.addEventListener("mousemove", function (event) {
        if (isDragging && selectedTriangle) {
            // Get current mouse position
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            // Convert to normalized device coordinates (NDC)
            const currentX = (2 * mouseX) / canvas.width - 1;
            const currentY = 1 - (2 * mouseY) / canvas.height;

            // Update translation based on mouse movement
            xtranslation += currentX - startX;
            ytranslation += currentY - startY;

            // Update the start position
            startX = currentX;
            startY = currentY;
            
            // Pass updated translation to shaders
            gl.uniform1f(xTranslateLoc, xtranslation);
            gl.uniform1f(yTranslateLoc, ytranslation);
            
            // Re-render the scene
            render();
        }
    });
    
    // Add event listener for mouse up (stop dragging)
    canvas.addEventListener("mouseup", function () {
        isDragging = false;
        selectedTriangle = false;
    });
}

