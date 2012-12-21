var camera;
var cssScene, cssRenderer;
var canvasScene, canvasRenderer;
var webglScene, webglRenderer;

var cardFront, cardFrontContainer; // Container is for rotating around card edge

var particle;
var particles = [];
var particleImage = new Image();

var loader;

var robot = {};

var FOV = 50;
var NEAR = 1;
var FAR = 10000;

var RAD_30 = Math.PI / 6;
var RAD_45 = Math.PI / 4;
var RAD_180 = Math.PI;
var RAD_360 = Math.PI * 2;

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

        var model = collada.scene;
        model.position.set(0, 0, -500);
        model.rotation.y = Math.PI / 4;

        console.log( 'robot model', model );

        // Walk through model looking for known named parts
        /*
        model.traverse( function(child) {
            switch (child.name) {
                case 'jambe_G' :
                    robot.left_leg = child;
                    break;
                case 'jambe_D' :
                    robot.right_leg = child;
                    break;
                case 'head_container' :
                    robot.head = child;
                    break;
                case 'clef' :
                    robot.key = child;
                    break;
            }
        });
        */

        robot.model = model;

        var tweenTurn = new TWEEN.Tween( model.rotation )
                .to( { y: model.rotation.y - (RAD_45) }, 3000 )
                .easing( TWEEN.Easing.Quadratic.InOut );

        var tweenTurnBack = new TWEEN.Tween( model.rotation )
                .to( { y: model.rotation.y + (RAD_45) }, 3000 )
                .easing( TWEEN.Easing.Quadratic.InOut );

        robot.key = model.getChildByName('ID65', true);

        console.log('Robot key:', robot.key);

        var tweenKeyTurn = new TWEEN.Tween( robot.key.rotation )
                .to( { x: robot.key.rotation.x - (RAD_360) }, 5000 )
                .easing( TWEEN.Easing.Quadratic.InOut );


        robot.head = model.getChildByName('ID139', true);

        robot.head.visible = false;

        // To allow us to change rotation
        robot.head.useQuaternion = false;

        //robot.head.scale.set(0.1, 0.1, 0.1);
        //robot.head.rotation.set(0, Math.PI * 0.6, 0);

        console.log('Robot head:', robot.head);

        var tweenHeadTurn = new TWEEN.Tween( robot.head.rotation )
                .to( { y: robot.head.rotation.y + (RAD_30) }, 3000 )
                .easing( TWEEN.Easing.Quadratic.InOut );

        var tweenHeadTurnBack = new TWEEN.Tween( robot.head.rotation )
                .to( { y: robot.head.rotation.y - (RAD_30) }, 3000 )
                .easing( TWEEN.Easing.Quadratic.InOut );

        tweenTurn.chain( tweenTurnBack );
        tweenTurnBack.chain( tweenTurn );

        //tweenKeyTurn.chain( tweenKeyTurn );
        tweenHeadTurn.chain( tweenHeadTurnBack );
        tweenHeadTurnBack.chain( tweenHeadTurn );

        tweenTurn.start();
        tweenKeyTurn.start();

        tweenHeadTurn.start();

        webglScene.add( model );


    });

    //

    initSnow();

    window.addEventListener( 'resize', onWindowResize, false );

    document.addEventListener('keydown', onKeyDown, false);

}

function animate() {

    requestAnimationFrame( animate );

    TWEEN.update();

    //animateRobot();

    animateSnow();

    // XXX Testing
    //robot.model.matrixAutoUpdate = false;
    if( robot.model != undefined ) {
        robot.model.updateMatrix();
        robot.model.matrixWorldNeedsUpdate = true;
    }

    cssRenderer.render( cssScene, camera );
    canvasRenderer.render( canvasScene, camera );
    webglRenderer.render( webglScene, camera );

}

function animateRobot() {

    var frameTime = ( timestamp - lastTimestamp ) * 0.001; // seconds

    if ( progress >= 0 && progress < 48 ) {

        for ( var i = 0; i < kfAnimationsLength; ++i ) {

            kfAnimations[ i ].update( frameTime );

        }

    } else if ( progress >= 48 ) {

        for ( var i = 0; i < kfAnimationsLength; ++i ) {

            kfAnimations[ i ].stop();

        }

        progress = 0;
        start();

    }

    progress += frameTime;
    lastTimestamp = timestamp;

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

robotHeadRotationKeys = [0, .25, .5, .75, 1];
robotHeadRotationValues = [ { z: 0 },
    { z: -Math.PI / 96 },
    { z: 0 },
    { z: Math.PI / 96 },
    { z: 0 }
];

robotBodyRotationKeys = [0, .25, .5, .75, 1];
robotBodyRotationValues = [ { x: 0 },
    { x: -Math.PI / 48 },
    { x: 0 },
    { x: Math.PI / 48 },
    { x: 0 }
];

robotKeyRotationKeys = [0, .25, .5, .75, 1];
robotKeyRotationValues = [ { x: 0 },
    { x: Math.PI / 4 },
    { x: Math.PI / 2 },
    { x: Math.PI * 3 / 4 },
    { x: Math.PI }
];

robotLeftLegRotationKeys = [0, .25, .5, .75, 1];
robotLeftLegRotationValues = [ { z: 0 },
    { z: Math.PI / 6},
    { z: 0 },
    { z: 0 },
    { z: 0 }
];

robotRightLegRotationKeys = [0, .25, .5, .75, 1];
robotRightLegRotationValues = [ { z: 0 },
    { z: 0 },
    { z: 0 },
    { z: Math.PI / 6},
    { z: 0 }
];


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
