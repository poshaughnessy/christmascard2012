var camera;
var cssScene, cssRenderer;
var canvasScene, canvasRenderer;
var webglScene, webglRenderer;

var cardFront, cardFrontContainer; // Container is for rotating around card edge

var particle;
var particles = [];
var particleImage = new Image();

var loader;

var robot;

var FOV = 50;
var NEAR = 1;
var FAR = 10000;
var RAD_180 = Math.PI;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( FOV, window.innerWidth / window.innerHeight, NEAR, FAR );
    camera.position.set( 0, 500, 1000 );
    camera.lookAt( new THREE.Vector3(0, 100, -500) );

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

    webglRenderer = new THREE.WebGLRenderer({ antialias: true });
    webglRenderer.setSize( window.innerWidth, window.innerHeight );
    webglRenderer.domElement.style.position = 'absolute';
    webglRenderer.domElement.style.top = 0;
    document.body.appendChild( webglRenderer.domElement );


    //

    var texture = new THREE.Texture();

    /*
    var loader = new THREE.ImageLoader();
    loader.addEventListener( 'load', function ( event ) {

        texture.image = event.content;
        texture.needsUpdate = true;

    } );
    loader.load( 'models/jack/Gift-Wrapping-Paper.jpg' );
    */

    //

    /* This is loading in the model but not the textures... */
    /*
    loader = new THREE.OBJLoader();

    loader.addEventListener( 'load', function ( event ) {

        var object = event.content;

        for ( var i = 0, l = object.children.length; i < l; i ++ ) {
            //object.children[ i ].material.map = texture;
            console.log( object.children[i].material );
        }

        object.position.set( 0, 50, 0 );
        object.scale.set(20, 20, 20);

        webglScene.add( object );

        webglRenderer.render( webglScene, camera )

    });
    loader.load( 'models/jack/jackinabox.obj' );
    */

    //

    var ambientLight = new THREE.AmbientLight( 0x101010 );
    webglScene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xeeeeff, 0.5 );
    directionalLight.position.set(0, 0, 1);
    webglScene.add( directionalLight );

    var spotlight1 = new THREE.SpotLight(0xFFFFFF, 0.8, 3000);
    spotlight1.position.set( 0, 500, 1500 );
    spotlight1.target.position.set( 0, 0, 0 );
    spotlight1.castShadow = true;
    //webglScene.add( spotlight1 );

    //

    /*
    loader = new THREE.JSONLoader();

    loader.load( 'models/jack/jackinabox.js', function ( geometry, materials ) {

        console.log('xxx geometry:', geometry);
        console.log('xxx materials: ', materials);

        var model = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        model.geometry.computeFaceNormals();
        model.geometry.computeVertexNormals();

        var modelScale = 20;
        model.scale.set(modelScale, modelScale, modelScale);

        model.position.set(0, 50, 0);

        webglScene.add( model );

    });
    */

    loader = new THREE.ColladaLoader();

    /* Robot from 'WebGL: Up & Running Book' - licence applies, but it no longer appears */
    /* to be up at the URL referenced in the book (turbosquid.com/FullPreview/Index.cfm/ID/475463) */
    /* (It now redirects to another robot). If you're the creator of the model, */
    /* please get in touch with me and I'll happily pay to use it. Thanks! */
    loader.load( 'models/robot_cartoon_02/robot_cartoon_02.dae', function( collada ) {

        robot = collada.scene;
        robot.position.set(0, 0, -500);
        robot.rotation.y = Math.PI / 4;

        console.log( 'robot', robot );

        webglScene.add( robot );

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
    webglRenderer.render( webglScene, camera );

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