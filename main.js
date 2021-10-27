/**
 * **********This piece of code is initial state code of Three.js , global variables , background color , light etc.***************
 */

//Initial code to start three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Provide the background color in three.js
renderer.setClearColor( 0xb7c3f3 , 1 );

//Ambient light it is common in three.js
const light = new THREE.AmbientLight( 0xffffff );
scene.add( light );

//global variable
const start_position = 3;
const end_position = -start_position;
const text = document.querySelector(".text");
const timeLimit = 10;
let gameStat = "loading";
let isLookingBackward = true;
const bgMusic = new Audio('../music/music_bg.mp3');
bgMusic.loop = true;
const winMusic = new Audio('../music/music_win.mp3');
const lostMusic = new Audio('../music/music_lose.mp3');

//GLTFLoader this thing help to load 3d Doll on page
const loader = new THREE.GLTFLoader();

//initial camera position fix
camera.position.z = 5.5;


/**
 * *******************************************All classes present in this piece of code*******************************
 */

//create Doll class
class Doll
{
    constructor()
    {
        loader.load('../models/scene.gltf' , (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(.4 , .4 , .4);
            gltf.scene.position.set(0 , -1 , 0);
            this.doll = gltf.scene;
        });
    }

    lookBackward()
    {   
        //gsap that is a animation script in javascript.
        gsap.to(this.doll.rotation , {y : -3.15 , duration : 0.45});
        setTimeout(() => isLookingBackward = true , 150);
    }

    lookForward()
    {
        gsap.to(this.doll.rotation , {y : 0 , duration : 0.45});
        setTimeout(() => isLookingBackward = false , 450);
    }

    //this start function help to the movement for forward backward
    async start()
    {
        this.lookBackward();
        await delay((Math.random() * 1000) + 1000);
        this.lookForward();
        await delay((Math.random() * 750) + 750);
        this.start();
    }
}

//create class player
class Player
{
    constructor()
    {
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0x32CD32 } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = 1;
        sphere.position.x = start_position;
        scene.add( sphere );
        this.player = sphere;
        this.playerInfo = 
        {
            positionX : start_position,
            velocity : 0
        }
    }
 
    //run function help to run the player.
    run()
    {
       this.playerInfo.velocity = 0.03;
    }

    //stop function help to stop the player
    stop()
    {
        gsap.to(this.playerInfo , {velocity : 0 , duration : .1})
    }

    //check player is wining or not
    check()
    {
       if(this.playerInfo.velocity > 0 && !isLookingBackward)
       {
           text.innerText = "You Lost!!";
           lostMusic.play();
           bgMusic.pause();
           gameStat = "over";
       }

       if(this.playerInfo.positionX < end_position + .4)
       {
           text.innerText = "You Won!!";
           winMusic.play();
           bgMusic.pause();
           gameStat = "over";
       }
    }

    //update function help to update the player info.
    update()
    {
        this.check();
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.player.position.x = this.playerInfo.positionX;
    }
}


/**
 * **************************************All object present in this piece of code****************************************
 */

//create player object
const player = new Player();

//create doll object
let doll = new Doll();


/**
 * *****************************************All function add in this piece of code*********************************
 */
//


//Game logic
async function init()
{
    await delay(500);
    text.innerText = "Starting in 3";
    await delay(500);
    text.innerText = "Starting in 2";
    await delay(500);
    text.innerText = "Starting in 1";
    await delay(500);
    text.innerText = "Lets Go!!";
    bgMusic.play();
    startGame();
}

function startGame()
{
    gameStat = "started";
    //progress bar is like hide when timeline is over.
    let progressBar = createCube({w : 5 , h : .1 , d : 1} , 0);
    progressBar.position.y = 3.75;
    gsap.to(progressBar.scale , {x : 0 , duration : timeLimit , ease : "none"});
    doll.start();
    setTimeout(() => {
        if(gameStat != "over")
        {
            text.innerText = "You ran out of time!!";
            lostMusic.play();
            bgMusic.pause();
            gameStat = "over";
        }
    }, timeLimit * 1000);
}
init();

//delay function helps to take the delay in time for the doll movement
function delay(ms)
{
    return new Promise( (resolve) => setTimeout(resolve , ms));
}

//create cube i.e is use for creating track
function createCube(size , positionX , rotY = 0 , color = 0xfbc851)
{
    const geometry = new THREE.BoxGeometry(size.w , size.h , size.d);
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotY;
    scene.add( cube );
    return cube;
}

//create Track4
function createTrack()
{
    createCube({w : start_position * 2 + .2 , h : 1.5 , d : 1} , 0 , 0 , 0xe5a716).position.z = -1;
    createCube({w : .2 , h : 1.5 , d : 1} , start_position , -.35);
    createCube({w : .2 , h : 1.5 , d : 1} , end_position , .35);
}
createTrack();

//rotation or any other animation occur using this function
function animate() {
    if(gameStat == "over")
    {
        return;
    }

	renderer.render( scene, camera );
    requestAnimationFrame( animate );
    player.update();
}
animate();

//Window resize function like if you doing a small size this function work like for responsive.
window.addEventListener( 'resize', onWindowResize, false )
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight )
}

//Add eventListener with the help of listener player will be move
window.addEventListener('keydown' , (e) => {
      if(gameStat != "started")
      {
          return;
      }

      if(e.key == "ArrowUp")
      {
          player.run();
      }
});

window.addEventListener('keyup' , (e) => {
      if(e.key == 'ArrowUp')
      {
          player.stop();
      }
});











