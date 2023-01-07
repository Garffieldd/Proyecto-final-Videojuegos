    class State {
        enter() {
    
        }
    
        execute() {
    
        }
    }

  class StateMachine {
    constructor(initialState, possibleStates, stateArgs=[]) {
       this.initialState = initialState;
       this.possibleStates = possibleStates;
      this.stateArgs = stateArgs;
       this.state = null;
   
       // State instances get access to the state machine via this.stateMachine.
       for (const state of Object.values(this.possibleStates)) {
         state.stateMachine = this;
       }
     }
   
     step() {
       // On the first step, the state is null and we need to initialize the first state.
       if (this.state === null) {
         this.state = this.initialState;
         this.possibleStates[this.state].enter(...this.stateArgs);
       }
   
       // Run the current state's execute
       this.possibleStates[this.state].execute(...this.stateArgs);
     }
   
     transition(newState, ...enterArgs) {
       this.state = newState;
       this.possibleStates[this.state].enter(...this.stateArgs, ...enterArgs);
     }
   }

   

class Scene extends Phaser.Scene {

    constructor(){
        super('theGame')

        // Variables del juego
        
       //player vars
        this.playerVelocity = 100;
        this.playerDiagVelocity = 69.4;
        this.jumps = 0;  
        this.dirX = 1;
        this.dirY = 1; 
        this.chill = 0;
        this.takingDamage = 1;
        this.healthState = this.chill;
        this.damagedTime = 0;
        //ogre vars
        this.ogreSpeed = 50;
        this.randomMoveTime = 2000;   
        //this.health = 3;
        this.random = Math.floor(Math.random() * 2);
        this.rebound = false;
        
        
        
        
        
        
    }
    
    // Carga de los assets
 preload ()
    {

        this.load.setBaseURL('http://localhost/Proyecto-final-Videojuegos');
        //Imagenes
        this.load.spritesheet('player','assets/img/knight_spritesheet.png', {frameWidth: 16, frameHeight:23});
        this.load.spritesheet('ogre','assets/img/ogre_spritesheet.png', {frameWidth: 21, frameHeight:27});
        this.load.image('tiles', 'assets/img/Tiles/0x72_DungeonTilesetII_v1.4.png')
        this.load.tilemapTiledJSON('dungeon', `assets/img/Tiles/mapa${this.random}.json`)
        this.load.tilemapTiledJSON('map0', "assets/img/Tiles/mapa0.json")
        this.load.tilemapTiledJSON('map1', "assets/img/Tiles/mapa1.json")
        if (this.random == 1){
            console.log("mapa 1")
        }else if(this.random == 0){
            console.log("mapa 0")
        }else{
            return
        }
        this.load.image('fullHeart','assets/img/fulled heart.png')
        this.load.image('halfHeart','assets/img/semifulled heart.png')
        this.load.image('emptyHeart','assets/img/empty heart.png')

        //Plugin para tiles animados
        this.load.scenePlugin('AnimatedTiles', 'https://raw.githubusercontent.com/nkholski/phaser-animated-tiles/master/dist/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        //Musica
        

        // Fuente
        
  
    };
// Creacion de los elementos del videojuego
 create ()
    {
        this.scene.run('GameUI')
        
        //Generar Dungeon
        this.map = this.make.tilemap({key: 'dungeon', tileWidth: 16, tileHeight: 16});
        this.tileset = this.map.addTilesetImage('dungeon', 'tiles')
        //const config = 
        this.map.createLayer('Ground', this.tileset)
        this.map.createLayer('Furnitures', this.tileset)
        //const hitbox = map.createFromObjects('Hitbox');
        const wallsLayer = this.map.createLayer('Walls', this.tileset)
        const newInstances = this.map.createLayer('NewInstance', this.tileset)
        const spikesLayer = this.map.createLayer('Spikes', this.tileset)
        this.anim = this.animatedTiles.init(this.map)
        

        
        newInstances.setCollisionByProperty({newInstance:true})
        spikesLayer.setCollisionByProperty({harmful:true})

        
        spikesLayer.renderDebug(this.add.graphics());
        
        /*
        this.KeyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.KeyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.KeyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.KeyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.KeySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        */
 
        /*
        const debugGraphics = this.add.graphics().setAlpha(0.7)
        wallsLayer.renderDebug(debugGraphics, {
            titleColor: null,
            collidingTileColor: new Phaser.Display.Color(243,234,48,255),
            faceColor: new Phaser.Display.Color(40,39,37,255)
        })
        */
       
       //Generar Jugador
       if (this.random == 0) {
        this.player = this.physics.add.sprite(170,80,'player');
       }else if (this.random == 1){
        this.player = this.physics.add.sprite(230,150,'player');
       }
        
        this.player.setScale(1); 
        this.player.setSize(11,15,true);
        this.player.setOffset(3,9);
        //this.physics.add.collider(this.player, wallsLayer);
        this.cameras.main.startFollow(this.player, true);

        this.stateMachine = new StateMachine('stopped', {
            stopped: new StoppedState(),
           walk: new WalkState(),
            attack: new AttackState(),
            bound: new BoundState(),
          }, [this, this.player]);

        this.KeyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.KeyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.KeyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.KeyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.KeySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player',{start: 4, end:7}),
            frameRate:10,
            repeat: -1,
        });
        
        this.anims.create({
            key: 'stopped',
            frames: this.anims.generateFrameNumbers('player',{start: 0, end:3}),
            frameRate:10,
            repeat:-1, 
        });

        this.player.play('stopped');


        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('player',{start: 0, end:3}),
            frameRate:20,
            repeat: 0,
        });

        
       

        
        this.randomDirection = (exclude) => {
            let newDirection = Phaser.Math.Between(0,3)
            while (newDirection === exclude){
                newDirection = Phaser.Math.Between(0,3)
            }
            return newDirection
        }
        
        this.Ogros = this.newOgre();
        
        this.physics.add.collider(this.Ogros, this.player, this.collideWithOgre, undefined, this);

        //console.log(this.Ogros)


        //Hitboxes
        
        const gids = {}
        const group = this.add.group()
        const layer = this.map.getObjectLayer('Hitbox')
        layer.objects.forEach(object => {
        const {gid, id} = object
        //I do this check because createFromObjects will
        //have already created objects once I use the same gid.
        if (!gids[gid]) { 
            const objects = this.map.createFromObjects('Hitbox', gid)
            objects.reduce((group, sprite) => {
            group.add(sprite)
            this.physics.world.enable(sprite)
            this.physics.add.collider(this.player,sprite)
            this.physics.add.collider(this.Ogros, sprite, () => {
                this.Ogros.children.each(ogreObj =>{
                    ogreObj["initial"] = this.randomDirection(ogreObj["initial"])
                })
                

            });
            sprite.setVisible(false)
            sprite.body.setImmovable()
            return group
            }, group)
        }
        })
        
        this.physics.add.collider(this.player,newInstances,this.changeInstance,undefined,this);
        this.physics.add.collider(this.player, spikesLayer, this.collideWithSpikes, undefined, this);

        /*
        this.input.on('pointerdown', () => this.attack(),this);

    
        this.input.keyboard.on('keydown', (event) => {
                if (event.keyCode === 32) {
                    this.attack();
                }
            });
        
        this.player.on('animationComplete', this.animationComplete, this) ;
       */
          
    };

/*
    attack(){
        this.player.play('attack',true)
        console.log('ok')
    }

    animationComplete(animation, frame, sprite){
        if(animation.key === 'attack') {
            this.player.play('stopped');
        }
    }
*/
    collideWithSpikes(player , spikesLayer){
        var lives = this.scene.get('GameUI');
        

        const xDirection = player.x - spikesLayer.x*17;
        const yDirection = player.y - spikesLayer.y*17;
        //console.log(spikesLayer.x)
        //console.log(spikesLayer.y)
        //console.log(player.x)

        const newDirection = new Phaser.Math.Vector2(xDirection,yDirection).normalize().scale(200);
        
        //lives.health--;

        if (lives.health === 0){
            this.scene.start('GameOver')
            console.log('Game Over')
        }

        if(this.healthState === this.takingDamage){
            return
        }

        player.setVelocity(newDirection.x,newDirection.y)
        player.setTint(0xff0000);
        this.damagedTime = 0
        this.healthState = this.takingDamage;
        lives.healthHandler();

        //console.log(lives.health);
        
    }

    changeInstance(player,instance){
        this.player.x = 500
        this.player.y = 300
            
        
    }

    collideWithOgre(ogre,player){
         
        var lives = this.scene.get('GameUI');
        const xDirection = player.x - ogre.x;
        const yDirection = player.y - ogre.y;
       
        this.newDirection = new Phaser.Math.Vector2(xDirection,yDirection).normalize().scale(200);

        //lives.health--;

        if (lives.health === 0){
            this.scene.start('GameOver')
            console.log('Game Over')
        }

        if(this.healthState === this.takingDamage){
            return
        }

        
        this.rebound = true;
        player.setTint(0xff0000);
        this.damagedTime = 0
        this.healthState = this.takingDamage;
        lives.healthHandler();
        //console.log(lives.health);
        //player.setVelocity(newDirection.x,newDirection.y);
        
    }



    newOgre(){
         //Generar enemigo
        
        this.ogreGen = this.map.getObjectLayer('ogre')
        this.ogres = this.add.group()
        this.ogreGen.objects.forEach(ogreObj =>{
            this.ogre = this.physics.add.sprite(ogreObj.x + ogreObj.width*0.5 ,ogreObj.y - ogreObj.height*0.5,'ogre')
            this.ogres.add(this.ogre)
        
        })

        this.ogres.children.each(ogreObj =>{
            Object.defineProperty(ogreObj, "UP", {
                value: 0,
                enumerable: true,
                configurable: true,
                writable: true
            });
            Object.defineProperty(ogreObj, "DOWN", {
                value: 1,
                enumerable: true,
                configurable: true,
                writable: true
            });
            Object.defineProperty(ogreObj, "LEFT", {
                value: 2,
                enumerable: true,
                configurable: true,
                writable: true
            });
            Object.defineProperty(ogreObj, "RIGHT", {
                value: 3,
                enumerable: true,
                configurable: true,
                writable: true
            });
            Object.defineProperty(ogreObj, "initial", {
                value: ogreObj["RIGHT"],
                enumerable: true,
                configurable: true,
                writable: true
            });
    
            this.time.addEvent({
                delay: this.randomMoveTime,
                callback:() => {
                    ogreObj["initial"] = this.randomDirection(ogreObj["initial"]);
                },
                loop:true
            })
        })

        
        

        //console.log(ogres)

         
         this.anims.create({
            key: 'walkingOgre',
            frames: this.anims.generateFrameNumbers('ogre',{start: 4, end:7}),
            frameRate:10,
            repeat:-1,
        });
        
        this.anims.create({
            key: 'stoppedOgre',
            frames: this.anims.generateFrameNumbers('ogre',{start: 0, end:3}),
            frameRate:10,
            repeat:-1,
        });

        this.ogre.play('stoppedOgre'); 

        return this.ogres

    }

    
// Actualizacion de los elementos del videojuego
 update(time,deltatime)
    {   
        
        this.stateMachine.step()
        
        //this.random3 = Math.floor(Math.random() * 2);
         //Animacion de daño
         
    switch (this.healthState){
        case this.chill:
            
            break
        
        case this.takingDamage:
            var lives = this.scene.get('GameUI');
            this.damagedTime += deltatime
            if (this.damagedTime >= 300){
                    
                lives.health--;
                this.healthState = this.chill;
                this.player.setVelocity(0);
                this.player.clearTint();
                this.damagedTime = 0;
                
                
            }
            break
    }

    if (this.healthState === this.takingDamage){
        return
    }

        
        
        //Controlador del Jugador
       // const velocityVector = new Phaser.Math.Vector2(this.dirX,this.dirY).normalize() * this.playerVelocity;
       /*
       const velocityVector = new Phaser.Math.Vector2(this.playerVelocity * this.dirX,this.playerVelocity * this.dirY).normalize().scale(200);
    

    if (this.KeySpace.isDown)
    {
        this.player.stop('stopped',true)
        this.player.stop('walk',true)
        this.player.play('attack',true)
        console.log("Space pressed")
    }
    if(!this.KeyW.isDown && !this.KeyA.isDown && !this.KeyS.isDown && !this.KeyD.isDown){    
        this.player.setVelocity(0,0);
        this.player.play('stopped',true);
    }
    if(this.KeyW.isDown) {
        
        this.dirY = -1;
        this.player.setVelocity(0,velocityVector.y);
        
        this.player.play('walk',true);
        
    } 

    if(this.KeyA.isDown) {
        
        this.dirX = -1;
        this.player.flipX = true;
        this.player.setVelocity(velocityVector.x,0);
        this.player.play('walk',true);
        
    } 
    if(this.KeyS.isDown) {
        
        this.dirY = 1;
        this.player.setVelocity(0,velocityVector.y);
        this.player.play('walk',true);
        
    } 
    if(this.KeyD.isDown) {
        
        this.dirX = 1;
        this.player.flipX = false;
        this.player.setVelocity(velocityVector.x,0);
        this.player.play('walk',true);
        
    }

    
    // Diagonal movement
    // Up and left

    const velocityDiagVector = new Phaser.Math.Vector2(this.playerDiagVelocity * this.dirX,this.playerDiagVelocity * this.dirY).normalize().scale(100);
    
    if (this.KeyA.isDown && this.KeyW.isDown)
{
    this.dirX = -1
    this.dirY = -1
    this.player.body.setVelocity(velocityDiagVector.x,velocityDiagVector.y);
    this.player.play('walk',true);
    
   
}

    // Up and right

    if (this.KeyD.isDown && this.KeyW.isDown)
    {
        this.dirX = 1
        this.dirY = -1
        this.player.body.setVelocity(velocityDiagVector.x,velocityDiagVector.y);
        this.player.play('walk',true);
        
    }

    // Down and right
    if (this.KeyD.isDown && this.KeyS.isDown)
    {

        this.dirX = 1
        this.dirY = 1
        this.player.body.setVelocity(velocityDiagVector.x,velocityDiagVector.y);
        this.player.play('walk',true);
        
    }

    // Down and left
    
    if (this.KeyA.isDown && this.KeyS.isDown)
    {
        this.dirX = -1
        this.dirY = 1
        this.player.body.setVelocity(velocityDiagVector.x,velocityDiagVector.y);
        this.player.play('walk',true);
        
    }
    
    */
    
    
    

    // IA del ogro

    this.Ogros.children.each((gameObject,index) => {
        const ogres = gameObject
        switch (ogres["initial"]){
            
            case ogres["UP"]:
                    ogres.setVelocity(0,-this.ogreSpeed)
                break
            
            case ogres["DOWN"]:
                
                    ogres.setVelocity(0,this.ogreSpeed)
    
                break

            case ogres["LEFT"]:
                    ogres.setVelocity(-this.ogreSpeed,0)
                break
            case ogres["RIGHT"]:
                
                    ogres.setVelocity(this.ogreSpeed,0)
           
                break
        }
    })
        
        
    
    }

}

class GameUI extends Phaser.Scene{
    constructor(){
        super('GameUI')
    }
    

    create(){

        this.health = 2;
        ;

        this.hearts = this.add.group()

        this.hearts.createMultiple({
            key: 'fullHeart',
            setXY: {
                x: 15,
                y: 15,
                stepX: 16
            },
            quantity: 3
        })
    }

    healthHandler(){
        
        this.hearts.children.each((gameObject,index) => {
            const heart = gameObject
            
                if (index < this.health){
                    heart.setTexture('fullHeart')
                }else{
                    heart.setTexture('emptyHeart')   
                    
                }
        })
        
    }

}



class FinalScene extends Phaser.Scene {
    constructor(){
        super('GameOver');
    };
    
    // Carga de los assets del Game over
    preload()
    {
        this.load.setBaseURL('http://localhost/Proyecto-final-Videojuegos');
        
    };

    //Creacion de la pantalla del Game Over
    create()
    {
        
    };

    

    //metodo que se activa si el jugador da click a la pantalla (se reinicia el juego)
    playAgain(){
        this.scene.start('theGame');
    };
}



class StoppedState extends State {
     enter(scene, player) {
        player.setVelocity(0);
        player.anims.play("walk");
        player.anims.stop();
      }
    
      execute(scene, player) {
        //const {left, right, up, down, space} = scene.keys;
        this.KeyW = scene.KeyW;
        this.KeyA = scene.KeyA;
        this.KeyS = scene.KeyS;
        this.KeyD = scene.KeyD;
        this.KeySpace = scene.KeySpace;
        // Transition to swing if pressing space
        if (this.KeySpace.isDown) {
          scene.stateMachine.transition('attack');
          return;
        }
    
        // Transition to move if pressing a movement key
        if (this.KeyA.isDown || this.KeyD.isDown || this.KeyW.isDown || this.KeyS.isDown) {
          scene.stateMachine.transition('walk');
          return;
        }

        //Transition to Bound if a Ogre hit you

        if (scene.rebound == true) {
            scene.stateMachine.transition('bound');
            return;
          }
      }
    }
    
    class WalkState extends State {
      execute(scene, player) {
        //const {left, right, up, down, space} = scene.keys;
        this.KeyW = scene.KeyW;
        this.KeyA = scene.KeyA;
        this.KeyS = scene.KeyS;
        this.KeyD = scene.KeyD;
        this.KeySpace = scene.KeySpace;
        this.playerVelocity = 100
        this.playerDiagVelocity = 69.4;
        
        //var mainScene = this.scene.get('theGame')
        // Transition to swing if pressing space
        if (this.KeySpace.isDown) {
          scene.stateMachine.transition('attack');
          return;
        }

        if (scene.rebound == true) {
            scene.stateMachine.transition('bound');
            return;
          }
      
        const velocityVector = new Phaser.Math.Vector2(this.playerVelocity,this.playerVelocity).normalize().scale(200);
        // Transition to idle if not pressing movement keys
        if (!(this.KeyA.isDown || this.KeyD.isDown || this.KeyW.isDown || this.KeyS.isDown)) {
            scene.stateMachine.transition('stopped');
            
          return;
        }
    
        player.setVelocity(0);
        if (this.KeyW.isDown) {
          player.setVelocityY(-velocityVector.y);
          
          //player.direction = 'up';
        }  if (this.KeyS.isDown) {
          player.setVelocityY(velocityVector.y);
          
          //player.direction = 'down';
        }
        if (this.KeyA.isDown) {
          player.setVelocityX(-velocityVector.x);
          player.flipX = true;
          //player.direction = 'left';
        }  if (this.KeyD.isDown) {
          player.setVelocityX(velocityVector.x);
          player.flipX = false;
          //player.direction = 'right';
        }

        // Diagonal movement
    // Up and left

    const velocityDiagVector = new Phaser.Math.Vector2(this.playerDiagVelocity,this.playerDiagVelocity).normalize().scale(120);
    
    if (this.KeyA.isDown && this.KeyW.isDown)
    {
        player.setVelocity(-velocityDiagVector.x,-velocityDiagVector.y);
        
        
    }

    // Up and right

    if (this.KeyD.isDown && this.KeyW.isDown)
    {
        player.body.setVelocity(velocityDiagVector.x,-velocityDiagVector.y);
        
    }

    // Down and right
    if (this.KeyD.isDown && this.KeyS.isDown)
    {
        player.body.setVelocity(velocityDiagVector.x,velocityDiagVector.y);
    }

    // Down and left
    
    if (this.KeyA.isDown && this.KeyS.isDown)
    {
        player.body.setVelocity(-velocityDiagVector.x,velocityDiagVector.y);
        
    }
    
        player.anims.play('walk', true);
      }
    }
    
    class AttackState extends State {
      enter(scene, player) {
        player.setVelocity(0);
        player.anims.play('attack');
        player.once('animationcomplete', () => {
          scene.stateMachine.transition('walk');
        });
    }
}

class BoundState extends State {
    enter(scene, player) {
        console.log("ahh me corro")
        player.setVelocity(scene.newDirection.x,scene.newDirection.y);
        scene.rebound = false;

      
  }

  execute (scene,player){
    if (scene.damagedTime == 0){
        scene.stateMachine.transition('walk');
    }
    
  }
  
}


