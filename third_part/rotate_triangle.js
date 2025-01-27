let gl; // Global WebGL context
let offscreenFramebuffer;
let offscreenTexture; // Texture to render into
let fcolor;
let thetaLoc;
let xTranslateLoc;
let yTranslateLoc;
let xScaleLoc;
let yScaleLoc;
let theta = 0.0;
let xtranslation = 0.0;
let ytranslation = 0.0;
let xScale = 0.3;
let yScale = 0.3;

function init() {
    gl = document.getElementById("gl-canvas").getContext('webgl2');
    if (!gl) {
        alert("WebGL isn't available");
        return; // Exit if WebGL isn't available
    }

    // Configure WebGL
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and create a program
    const program = initShaders(gl, "vertex-shader", "fragment-shader");
    if (!program) {
        console.error("Failed to initialize shaders.");
        return; // Exit if shader initialization fails
    }
    gl.useProgram(program);

    // Define the triangle vertices
    const vertices = new Float32Array([
        0.0,  0.5,  // Top vertex
        -0.5, -0.5,  // Bottom-left vertex
        0.5, -0.5   // Bottom-right vertex
    ]);

    // Create a buffer for triangle vertices
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Link vertex data to the shader attribute
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Create framebuffer and texture for offscreen rendering
    offscreenFramebuffer = gl.createFramebuffer();
    if (!offscreenFramebuffer) {
        console.error("Failed to create framebuffer!");
        return; // Handle the error appropriately
    }

    offscreenTexture = gl.createTexture();
    if (!offscreenTexture) {
        console.error("Failed to create texture!");
        return; // Handle the error appropriately
    }

    gl.bindTexture(gl.TEXTURE_2D, offscreenTexture);
    
    const width = 512;
    const height = 512;
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    // Attach the texture to the framebuffer's color attachment point.
    gl.bindFramebuffer(gl.FRAMEBUFFER, offscreenFramebuffer);
    
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        console.error("Framebuffer is not complete:", status);
        return; // Handle framebuffer errors appropriately
    }

    // Create a renderbuffer for depth buffer
    const depthBuffer = gl.createRenderbuffer();
    if (!depthBuffer) {
        console.error("Failed to create renderbuffer!");
        return; 
    }
    
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    
    // Attach renderbuffer to framebuffer
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

     // Create quad vertices for onscreen rendering
     const quadVertices = new Float32Array([
         -1, -1,
          1, -1,
         -1,  1,
          1,  1
     ]);
     
     // Create a buffer for the quad
     const quadBuffer = gl.createBuffer();
     if (!quadBuffer) {
         console.error("Failed to create quad buffer!");
         return; 
     }
     
     gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
     gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
     
     const screenProgram = initShaders(gl,"screen-vertex-shader", "screen-fragment-shader");
     if (!screenProgram) {
         console.error("Failed to initialize screen shaders.");
         return; 
     }
     
     // Setup screen program attributes and uniforms
     setupScreenProgram(screenProgram);

     render(program); // Start rendering loop after initialization.
}

function setupScreenProgram(screenProgram) {
     const aPosition = gl.getAttribLocation(screenProgram,"aPosition");
     const uTexture = gl.getUniformLocation(screenProgram,"uTexture");

     if (aPosition < 0 || uTexture < 0) {
         console.error("Failed to get attribute or uniform location.");
         return;
     }

     // Set up texture unit for screen rendering
     const textureUnitIndex = 0; 
     gl.activeTexture(gl.TEXTURE0 + textureUnitIndex);
     gl.bindTexture(gl.TEXTURE_2D , offscreenTexture);
     gl.uniform1i(uTexture , textureUnitIndex); 

     // Enable vertex attribute array for quad position
     if (aPosition >= 0) { 
         // Set up attribute pointer for position 
         gl.vertexAttribPointer(aPosition ,2 ,gl.FLOAT ,false ,0 ,0); 
         // Enable vertex attribute array for position 
         gl.enableVertexAttribArray(aPosition); 
      } else { 
          console.error("Invalid position attribute location."); 
      }
}

function render(program) {
   // Render to the offscreen framebuffer
   gl.bindFramebuffer(gl.FRAMEBUFFER ,offscreenFramebuffer);
   if (gl.checkFramebufferStatus(gl.FRAMEBUFFER ) !==gl.FRAMEBUFFER_COMPLETE ) { 
       console.error("Incomplete framebuffer!"); 
       return; 
   } 

   // Clear buffers before rendering 
   clearBuffers(); 

   // Set uniforms for triangle rendering program   
   setTriangleUniforms(program ); 

   try {   
       // Draw triangle using triangle method on current context   
       let mode=gl.TRIANGLES ;   
       let offset=0 ;   
       let count=3 ;   

       let drawArraysResult=gl.drawArrays(mode ,offset,count );   
       console.log(`Draw Arrays Result: ${drawArraysResult}`);   

   } catch (error) {   
       console.error(`Error while drawing triangle: ${error.message}`);   
   } 

   // Render to the default framebuffer (onscreen rendering)
   renderToScreen(); 

   requestAnimFrame(() => render(program)); // Loop the render function correctly
}

function clearBuffers() {
   try {   
       let clearMask=gl.COLOR_BUFFER_BIT |gl.DEPTH_BUFFER_BIT ;   
       let clearResult=gl.clear(clearMask );   
       console.log(`Clear Result: ${clearResult}`);   
   } catch (error) {   
       console.error(`Error while clearing buffers: ${error.message}`);   
   }   
}

function setTriangleUniforms(program ) {
   try {   
       fcolor=gl.getUniformLocation(program ,"fColor");   
       thetaLoc=gl.getUniformLocation(program ,"theta");   
       xTranslateLoc=gl.getUniformLocation(program ,"xTranslate");   
       yTranslateLoc=gl.getUniformLocation(program ,"yTranslate");   
       xScaleLoc=gl.getUniformLocation(program ,"xScale");   
       yScaleLoc=gl.getUniformLocation(program ,"yScale");   

      if(fcolor && thetaLoc && xTranslateLoc && yTranslateLoc && xScaleLoc && yScaleLoc){    
          setTriangleUniformValues();    
      }else{    
          throw new Error("Some uniform locations are invalid.");    
      }   

   } catch (error) {    
      console.error(`Error while setting triangle uniforms: ${error.message}`);    
   }    
}

function setTriangleUniformValues() {    
      try{    
          let colorValues=[0.0 ,1.0 ,0.0 ,1.0 ];    
          let thetaValue=theta ;    
          let translateValues=[xtranslation,ytranslation];    
          let scaleValues=[xScale,yScale];    

          if(fcolor){    
              let uniformResult=gl.uniform4f(fcolor,...colorValues );    
              console.log(`Set fColor Uniform Result: ${uniformResult}`);    
          }    

          if(thetaLoc){    
              let uniformResult=gl.uniform1f(thetaLoc ,thetaValue );    
              console.log(`Set theta Uniform Result: ${uniformResult}`);    
          }    

          if(xTranslateLoc){    
              let uniformResult=gl.uniform1f(xTranslateLoc ,translateValues[0]);    
              console.log(`Set xTranslate Uniform Result: ${uniformResult}`);    
          }    

          if(yTranslateLoc){    
              let uniformResult=gl.uniform1f(yTranslateLoc ,translateValues[1]);    
              console.log(`Set yTranslate Uniform Result: ${uniformResult}`);    
          }    

          if(xScaleLoc){    
              let uniformResult=gl.uniform1f(xScaleLoc ,scaleValues[0]);    
              console.log(`Set xScale Uniform Result: ${uniformResult}`);    
          }    

          if(yScaleLoc){    
              let uniformResult=gl.uniform1f(yScaleLoc ,scaleValues[1]);    
              console.log(`Set yScale Uniform Result: ${uniformResult}`);     
          }

      }catch(error){     
          throw new Error(`Error while setting uniform values: ${error.message}`);
      }
}

function renderToScreen() {
      try{     
          bindDefaultFramebuffer();     
          clearBuffers();     
          activateAndBindOffscreenTexture();     
          drawQuad();     
      }catch(error){     
          throw new Error(`Error while rendering to screen: ${error.message}`);
      }
}

function bindDefaultFramebuffer() {     
      try{     
          let framebuffer=null ;     
          let bindResult=gl.bindFramebuffer(gl.FRAMEBUFFER ,framebuffer );     
          console.log(`Bind Default Framebuffer Result: ${bindResult}`);
      }catch(error){     
         throw new Error(`Error while binding default framebuffer: ${error.message}`);
      }
}

function activateAndBindOffscreenTexture() {     
      try{     
          const textureUnitIndex=0 ;     
          
          if(textureUnitIndex >=0 ){     
              const targetTextureUnitIndex=textureUnitIndex ;
              const bindResult=gl.bindTexture(gl.TEXTURE_2D,targetTextureUnitIndex );  
              console.log(`Bind Off-screen Texture Result:${bindResult}`);
              
              setScreenProgramUniforms();      
              
              enableQuadAttributes();      
              
              drawQuad();      
              
              deactivateTextures();      
              
              unbindBuffers();
              
              logRenderingResults();
              
            }
      }catch(error){
            throw new Error(`Error while activating and binding offscreen texture:${error.message}`);
      }
}

window.onload = function () {
  init();
}

/* function renderForPicking(triangles, offscreenFramebuffer, uColorLocation) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, offscreenFramebuffer);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Example: Set vec3 uniform
    const color = new Float32Array([0.0, 0.1, 0.0, 1.0]); // A valid vec3
    gl.uniform4fv(uColorLocation, color);
    // Render each triangle with its unique picking color
    for (const triangle of triangles) {
        gl.uniform3fv(uColorLocation, triangle.color); // Use unique color
        drawTriangle(triangle); // Draw the triangle
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Unbind framebuffer after rendering
} */

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
    let isDragging = false;
    let selectedTriangle = null;

    canvas.addEventListener("mousedown", function (event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left; // Mouse X within canvas
        const mouseY = event.clientY - rect.top;  // Mouse Y within canvas

        // Convert mouse position to normalized device coordinates (NDC)
        const ndcX = (2 * mouseX) / canvas.width - 1; // Normalize to [-1, 1]
        const ndcY = 1 - (2 * mouseY) / canvas.height; // Normalize to [-1, 1]

        // Step 1: Perform color picking
        const pickedColor = pickColorAt(mouseX, mouseY);
        selectedTriangle = getTriangleByColor(pickedColor);

        if (selectedTriangle) {
            isDragging = true;
        }
    });

    canvas.addEventListener("mousemove", function (event) {
        if (!isDragging || !selectedTriangle) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left; // Mouse X within canvas
        const mouseY = event.clientY - rect.top;  // Mouse Y within canvas

        // Convert mouse position to normalized device coordinates (NDC)
        const ndcX = (2 * mouseX) / canvas.width - 1; // Normalize to [-1, 1]
        const ndcY = 1 - (2 * mouseY) / canvas.height; // Normalize to [-1, 1]

        // Step 2: Update translation values for the selected triangle
        selectedTriangle.xTranslation = ndcX;
        selectedTriangle.yTranslation = ndcY;

        // Pass updated translation to shaders
        gl.uniform1f(selectedTriangle.xTranslateLoc, selectedTriangle.xTranslation);
        gl.uniform1f(selectedTriangle.yTranslateLoc, selectedTriangle.yTranslation);

        // Render the scene with the updated translation
        render();
    });

    canvas.addEventListener("mouseup", function () {
        isDragging = false;
        selectedTriangle = null;
    });

    /**
     * Render the scene to an offscreen framebuffer for color picking.
     * @param {number} mouseX - The X position of the mouse in canvas space.
     * @param {number} mouseY - The Y position of the mouse in canvas space.
     * @returns {Array} - The [R, G, B] color of the pixel under the mouse.
     */
    function pickColorAt(mouseX, mouseY) {
        const pixels = new Uint8Array(4); // RGBA
        gl.bindFramebuffer(gl.FRAMEBUFFER, offscreenFramebuffer); // Bind the framebuffer used for color picking
        gl.readPixels(
            mouseX,
            canvas.height - mouseY, // Invert Y for WebGL coordinates
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Unbind the framebuffer
        return pixels.slice(0, 3); // Return RGB values
    }

    /**
     * Get the triangle corresponding to a given color.
     * @param {Array} color - The [R, G, B] color to match.
     * @returns {Object|null} - The triangle object or null if not found.
     */
    function getTriangleByColor(color) {
        for (const triangle of triangles) {
            if (
                triangle.color[0] === color[0] &&
                triangle.color[1] === color[1] &&
                triangle.color[2] === color[2]
            ) {
                return triangle;
            }
        }
        return null;
    }
}



