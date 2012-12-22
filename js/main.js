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

var RAD_20 = Math.PI / 9;
var RAD_30 = Math.PI / 6;
var RAD_45 = Math.PI / 4;
var RAD_90 = Math.PI / 2;
var RAD_180 = Math.PI;
var RAD_360 = Math.PI * 2;

var robotMessage = new buzz.sound('media/robotmessage', {
        formats: ['ogg', 'mp3', 'acc']
    });

var backgroundMusic = new buzz.sound('media/Jingle_Bells_Jazzy', {
        formats: ['ogg', 'mp3', 'acc'],
        loop: true
    });

init();

function init() {

    if( !Detector.webgl ) {
        document.getElementById('noWebGL').style.display = 'block';
        return;
    }

    console.log('passed test!');

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
    webglRenderer.shadowMapEnabled = true;
    document.body.appendChild( webglRenderer.domElement );

    // Ground

    var planeGeometry = new THREE.PlaneGeometry(1024, 1024);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.scale.set(10, 10, 10);
    plane.rotation.x = -RAD_90;
    plane.receiveShadow = true;

    webglScene.add( plane );

    loader = new THREE.JSONLoader();

    // Christmas tree

    loader.load( 'models/christmastree/cartoon_pine_tree.js', function(geometry, materials) {

        var model = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

        model.position.set( -650, 0, -1200 );
        model.scale.set(3, 3, 3);

        model.castShadow = true;

        webglScene.add( model );

    });

    // Lighting

    var ambientLight = new THREE.AmbientLight( 0x101010 );
    //webglScene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xeeeeff, 0.2 );
    directionalLight.position.set(0, 0, 1);
    webglScene.add( directionalLight );

    var downLight = new THREE.DirectionalLight( 0xeeeeff, 0.2 );
    downLight.position.set(0, 1, 0);
    webglScene.add( downLight );

    var spotlight1 = new THREE.SpotLight(0xFFFFFF, 1.0, 5000);
    spotlight1.position.set( 0, 3500, 500 );
    spotlight1.target.position.set( 0, 0, 0 );
    spotlight1.castShadow = true;
    spotlight1.shadowCameraNear = 1; // keep near and far planes as tight as possible
    spotlight1.shadowCameraFar = 5000; // shadows not cast past the far plane
    //spotlight1.shadowCameraVisible = true;
    webglScene.add( spotlight1 );


    // Robot

    loader = new THREE.ColladaLoader();

    /* Robot from 'WebGL: Up & Running Book' - licence applies, but it no longer appears */
    /* to be up at the URL referenced in the book (turbosquid.com/FullPreview/Index.cfm/ID/475463) */
    /* (It now redirects to another robot). If you're the creator of the model, */
    /* please get in touch with me and I'll happily pay to use it. Thanks! */

    loader.load( 'models/robot_cartoon_02/robot_cartoon_02.dae', function( collada ) {

        var model = collada.scene;
        model.position.set(1000, 0, -500);
        model.rotation.y = Math.PI / 4;

        // Apply castShadow to child meshes (needs to be set on Mesh, not Object3D)
        model.traverse(function( child ) {
            child.castShadow = true;
        });

        robot.model = model;

        robot.key = model.getChildByName('ID65', true);
        robot.head = model.getChildByName('ID139', true);
        robot.leftLeg = model.getChildByName('ID93', true);
        robot.rightLeg = model.getChildByName('ID75', true);
        robot.leftArm = model.getChildByName('ID376', true);
        robot.rightArm = model.getChildByName('ID294', true);

        // Right arm is not quite in the right place for some reason
        robot.rightArm.position.z -= 20;

        setUpRobotAnimations();

        webglScene.add( model );


    });

    // Music

    backgroundMusic.play().fadeIn().loop();

    //

    initSnow();

    window.addEventListener( 'resize', onWindowResize, false );

    document.addEventListener('keydown', onKeyDown, false);

    animate();

}

function setUpRobotAnimations() {

    // Need to set this to allow us to change rotation of child elements
    robot.key.useQuaternion = false;
    robot.head.useQuaternion = false;
    robot.leftLeg.useQuaternion = false;
    robot.rightLeg.useQuaternion = false;
    robot.leftArm.useQuaternion = false;
    robot.rightArm.useQuaternion = false;


    var tweenKeyTurn = new TWEEN.Tween( robot.key.rotation )
            .to( { x: robot.key.rotation.x - (RAD_360) }, 3000)
            .onComplete(function() {
                robot.key.rotation.x = 0;
            });

    var tweenHeadTurn = new TWEEN.Tween( robot.head.rotation )
            .to( { y: robot.head.rotation.y + (RAD_30) }, 3000 )
            .easing( TWEEN.Easing.Quadratic.InOut );

    var tweenHeadTurnBack = new TWEEN.Tween( robot.head.rotation )
            .to( { y: robot.head.rotation.y - (RAD_30) }, 3000 )
            .easing( TWEEN.Easing.Quadratic.InOut );

    var tweenLeftLegForwards = new TWEEN.Tween( robot.leftLeg.rotation )
            .to( { z: robot.leftLeg.rotation.z - (RAD_20) }, 1000 )
            .easing( TWEEN.Easing.Quadratic.InOut );

    var tweenLeftLegBackwards = new TWEEN.Tween( robot.leftLeg.rotation )
            .to( { z: robot.leftLeg.rotation.z + (RAD_20) }, 1000 )
            .easing( TWEEN.Easing.Quadratic.InOut );

    var tweenRightLegForwards = new TWEEN.Tween( robot.rightLeg.rotation )
            .to( { z: robot.rightLeg.rotation.z - (RAD_20) }, 1000 )
            .easing( TWEEN.Easing.Quadratic.InOut );

    var tweenRightLegBackwards = new TWEEN.Tween( robot.rightLeg.rotation )
            .to( { z: robot.rightLeg.rotation.z + (RAD_20) }, 1000 )
            .easing( TWEEN.Easing.Quadratic.InOut );

    var tweenLeftArmForwards = new TWEEN.Tween( robot.leftArm.rotation )
            .to( { z: robot.leftArm.rotation.z - (RAD_20) }, 1000 )
            .easing( TWEEN.Easing.Quadratic.InOut );

    var tweenLeftArmBackwards = new TWEEN.Tween( robot.leftArm.rotation )
            .to( { z: robot.leftArm.rotation.z + (RAD_20) }, 1000 )
            .easing( TWEEN.Easing.Quadratic.InOut );

    var tweenRightArmForwards = new TWEEN.Tween( robot.rightArm.rotation )
            .to( { z: robot.rightArm.rotation.z - (RAD_20) }, 1000 )
            .easing( TWEEN.Easing.Quadratic.InOut );

    var tweenRightArmBackwards = new TWEEN.Tween( robot.rightArm.rotation )
            .to( { z: robot.rightArm.rotation.z + (RAD_20) }, 1000 )
            .easing( TWEEN.Easing.Quadratic.InOut );


    var tweenTurnBack = new TWEEN.Tween( robot.model.rotation )
            .to( { y: robot.model.rotation.y + (RAD_45) }, 3000 )
            .easing( TWEEN.Easing.Quadratic.InOut );

    var tweenWalkToCentre = new TWEEN.Tween( robot.model.position )
            .to( { x: 0, z: 300 }, 10000 )
            .onComplete(function() {
                tweenTurnBack.start();
                playMessage();
            });


    tweenKeyTurn.chain( tweenKeyTurn );

    tweenHeadTurn.chain( tweenHeadTurnBack );
    tweenHeadTurnBack.chain( tweenHeadTurn );

    tweenLeftLegForwards.chain( tweenLeftLegBackwards );
    tweenLeftLegBackwards.chain( tweenLeftLegForwards );

    tweenRightLegForwards.chain( tweenRightLegBackwards );
    tweenRightLegBackwards.chain( tweenRightLegForwards );

    tweenLeftArmForwards.chain( tweenLeftArmBackwards );
    tweenLeftArmBackwards.chain( tweenLeftArmForwards );

    tweenRightArmForwards.chain( tweenRightArmBackwards );
    tweenRightArmBackwards.chain( tweenRightArmForwards );

    tweenKeyTurn.start();
    tweenHeadTurn.start();
    tweenLeftLegForwards.start();
    tweenRightLegBackwards.start();
    tweenLeftArmForwards.start();
    tweenRightArmBackwards.start();

    tweenWalkToCentre.start();

}

function playMessage() {

    backgroundMusic.fadeOut(function() {
        backgroundMusic.pause();

        document.getElementById('speechBubble').style.display = 'block';

        robotMessage.play().bind( 'ended.buzzloop', function() {
            backgroundMusic.play().fadeIn();
        });
    });

}

function animate() {

    requestAnimationFrame( animate );

    TWEEN.update();

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

function openCard() {

    //console.log('Open card');

    new TWEEN.Tween( cardFrontContainer.rotation )
            .to( { y: cardFrontContainer.rotation.y - (RAD_180) }, 1000 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .start();

}

function closeCard() {

    //console.log('Close card');

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
