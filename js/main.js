var camera;
var cssScene, cssRenderer;
var canvasScene, canvasRenderer;
var webglScene, webglRenderer;

var cardFront, cardFrontContainer; // Container is for rotating around card edge

var particle;
var particles = [];
var particleImage = new Image();

var loader;

var RAD_180 = Math.PI;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 0, 400 );

    var cardFrontEl = document.createElement( 'div' );
    cardFrontEl.style.width = '300px';
    cardFrontEl.style.height = '450px';
    cardFrontEl.style.background = new THREE.Color( 0xeeeeee );//.getContextStyle();

    cardFront = new THREE.CSS3DObject( cardFrontEl );
    cardFront.position.x = 150;
    cardFront.position.y = 0;
    cardFront.position.z = 0;

    cardFrontContainer = new THREE.Object3D();
    cardFrontContainer.x = -150;

    cardFrontContainer.add( cardFront );

    // XXX Remove for now...
    //cssScene.add( cardFrontContainer );

    //

    cssScene = new THREE.Scene();

    cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.setSize( window.innerWidth, window.innerHeight );
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = 0;
    document.body.appendChild( cssRenderer.domElement );

    //

    webglScene = new THREE.Scene();

    webglRenderer = new THREE.WebGLRenderer();
    webglRenderer.setSize( window.innerWidth, window.innerHeight );
    webglRenderer.domElement.style.position = 'absolute';
    webglRenderer.domElement.style.top = 0;
    document.body.appendChild( webglRenderer.domElement );

    loader = new THREE.JSONLoader();

    loader.load( 'models/jack/jackinabox.js', function ( geometry ) {

        console.log('xxx geometry:', geometry);

        var materials = [];
        materials.push( new THREE.MeshBasicMaterial({color: 0xffffff}) );

        //console.log('xxx materials: ', materials);

        var model = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        model.geometry.computeFaceNormals();
        model.geometry.computeVertexNormals();

        // XXX may need to change this - otherwise remove
        var modelScale = 1;

        model.scale.set(modelScale, modelScale, modelScale);

        model.position.set(0, 0, 0);

        webglScene.add( model );

        webglRenderer.render( webglScene, camera )

    });

    //

    initSnow();

    window.addEventListener( 'resize', onWindowResize, false );

    document.addEventListener('keydown', onKeyDown, false);

}

function animate() {

    requestAnimationFrame( animate );

    TWEEN.update();

    animateSnow();

    cssRenderer.render( cssScene, camera );
    canvasRenderer.render( canvasScene, camera );
    //webglRenderer.render( webglScene, camera ); // XXX Put back when I can get it working

}

function openCard() {

    console.log('Open card');

    new TWEEN.Tween( cardFrontContainer.rotation )
            .to( { y: cardFrontContainer.rotation.y - (RAD_180) }, 1000 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .start();

}

function closeCard() {

    console.log('Close card');

    new TWEEN.Tween( cardFrontContainer.rotation )
            .to( { y: cardFrontContainer.rotation.y + (RAD_180) }, 1000 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .start();

}

/* Thanks to the JavaScript PixelPounding demos from github.com/sebleedelisle */
function initSnow() {

    var container = document.createElement('div');

    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';

    document.body.appendChild(container);

    canvasScene = new THREE.Scene();

    canvasRenderer = new THREE.CanvasRenderer();
    canvasRenderer.setSize(window.innerWidth, window.innerHeight);

    particleImage.src = 'images/ParticleSmoke.png';
    var material = new THREE.ParticleBasicMaterial( { map: new THREE.Texture(particleImage) } );

    for (var i = 0; i < 100; i++) {

        particle = new Particle3D(material);
        particle.position.x = Math.random() * 2000 - 1000;
        particle.position.y = Math.random() * 2000 - 1000;
        particle.position.z = Math.random() * 2000 - 1000;
        particle.scale.x = particle.scale.y =  1;
        canvasScene.add( particle );

        particles.push(particle);
    }

    canvasRenderer.domElement.style.position = 'absolute';

    container.appendChild( canvasRenderer.domElement );

}

function animateSnow() {

    for(var i = 0; i < particles.length; i++)  {

        var particle = particles[i];
        particle.updatePhysics();

        if(particle.position.y < -1000) {
            particle.position.y += 2000;
        }
        if(particle.position.x > 1000) {
            particle.position.x -= 2000;
        } else if(particle.position.x < -1000) {
            particle.position.x += 2000;
        }
        if(particle.position.z > 1000) {
            particle.position.z -= 2000;
        } else if(particle.position.z<-1000) {
            particle.position.z+=2000;
        }

    }

}

function onWindowResize() {

    cssRenderer.setSize( window.innerWidth, window.innerHeight );
    canvasRenderer.setSize( window.innerWidth, window.innerHeight );
    webglRenderer.setSize( window.innerWidth, window.innerHeight );

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}

function onKeyDown(event) {

    if (/^(input|textarea)$/i.test(event.target.nodeName)) return;

    switch (event.keyCode) {
        case 37: // left arrow
        case 38: // up arrow
            closeCard();
            break;
        case 39: // right arrow
        case 40: // down arrow
        case 32: // space
            openCard();
            break;
    }

}