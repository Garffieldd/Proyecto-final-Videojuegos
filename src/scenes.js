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
        this.ogreSpeed = 75;
        this.randomMoveTime = 2000;   
        //this.health = 3;
        this.random = Math.floor(Math.random() * 2);
        this.reboundO = false;
        this.reboundS = false;
        this.direction = this.directionRIGHT
        this.directionRIGHT = 1
        this.directionLEFT = 0
        this.directionUP = 2
        this.directionDOWN = 3

        this.defaultScore = 100;
        
       
        
    }
    
    // Carga de los assets
 preload ()
    {

        this.load.setBaseURL('http://localhost/Proyecto-final-Videojuegos');
        //Imagenes
        this.load.spritesheet('player','assets/img/knight_spritesheet.png', {frameWidth: 16, frameHeight:23});
        this.load.spritesheet('ogre','assets/img/ogre_spritesheet.png', {frameWidth: 21, frameHeight:27});
        this.load.spritesheet('playerAttack','assets/img/attack_knight_spritesheet.png', {frameWidth: 15, frameHeight:23});
        this.load.image('arrow', 'assets/img/weapon_arrow.png')
        this.load.image('arrowUp', 'assets/img/weapon_arrowUp.png')
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
        this.load.audio('music', 'assets/music/Musica_pro.mp3')

        // Fuente
        
        this.load.bitmapFont('fire', 'assets/img/Font/azo-fire.png', 'assets/img/Font/azo-fire.xml');
  
    };
// Creacion de los elementos del videojuego
 create ()
    {

        this.music = this.sound.add('music');
        this.music.loop = true;
        this.music.play();

        this.scene.run('GameUI');
        this.scene.run('Score');
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
            boundO: new BoundStateOgre(),
            boundS: new BoundStateSpike(),
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
            frames: this.anims.generateFrameNumbers('playerAttack',{start: 0, end:3}),
            frameRate:7,
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

        this.createArrows = this.newArrow();

        
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
            /*
            this.physics.add.collider(this.createArrows,sprite, () => {
                this.createArrows.children.each(arrowObj =>{
                    arrowObj.destroy()
                })
            });
          */
            sprite.setVisible(false)
            sprite.body.setImmovable()
            return group
            }, group)
        }
        })
        
        this.physics.add.collider(this.player,newInstances,this.changeInstance,undefined,this);
        this.physics.add.collider(this.player, spikesLayer, this.collideWithSpikes, undefined, this);
        this.physics.add.collider(this.createArrows,this.Ogros, this.arrowCollideWithOgre,undefined, this);
        
        
          
    };


    collideWithSpikes(player , spikesLayer){
        var lives = this.scene.get('GameUI');
        

        const xDirection = player.x - spikesLayer.x*17;
        const yDirection = player.y - spikesLayer.y*17;
        

        this.newDirectionPCS = new Phaser.Math.Vector2(xDirection,yDirection).normalize().scale(200);
        

        if (lives.health === 0){
            this.scene.start('GameOver')
            console.log('Game Over')
        }

        if(this.healthState === this.takingDamage){
            return
        }

        this.reboundS = true;
        player.setVelocity(this.newDirectionPCS.x,this.newDirectionPCS.y)
        player.setTint(0xff0000);
        this.damagedTime = 0
        this.healthState = this.takingDamage;
        lives.healthHandler();
        
    }

    changeInstance(player,instance){
        this.player.x = 230
        this.player.y = 150
            
        
    }

    collideWithOgre(ogre,player){
         
        var lives = this.scene.get('GameUI');
        const xDirection = player.x - ogre.x;
        const yDirection = player.y - ogre.y;
       
        this.newDirectionPCO = new Phaser.Math.Vector2(xDirection,yDirection).normalize().scale(200);

        //lives.health--;

        if (lives.health === 0){
            this.music.stop();
            this.scene.start('GameOver')
            console.log('Game Over')
        }

        if(this.healthState === this.takingDamage){
            return
        }

        
        this.reboundO = true;
        player.setTint(0xff0000);
        this.damagedTime = 0
        this.healthState = this.takingDamage;
        lives.healthHandler();
       
    }

    newArrow(){
        this.arrows = this.physics.add.group()

            return this.arrows
  
    }

    arrowCollideWithOgre(ogre,arrow){

        const scoreNumber = this.scene.get('Score');
        const xDirection = ogre.x - arrow.x;
        const yDirection = ogre.y - arrow.y;
        const message = "Score: "
       
        
        this.newDirectionACO = new Phaser.Math.Vector2(xDirection,yDirection).normalize().scale(100);

        if(ogre["ogreHealth"] == 0){

        arrow.destroy()
        this.Ogros.killAndHide(ogre)
        this.Ogros.remove(ogre)
        scoreNumber.score = scoreNumber.score + this.defaultScore
        scoreNumber.scoreMessage = message.concat(scoreNumber.score.toString());
        scoreNumber.text = scoreNumber.text.setText(scoreNumber.scoreMessage);
        
        }

        if(ogre["ogreHealthState"] === ogre["this.takingDamage"]){
            return
        }
    
        arrow.destroy()
        ogre.setTint(0xff0000);
        
        ogre["ogreDamagedTime"] = 0
        ogre["ogreHealthState"] = ogre["ogreTakingDamage"];

        console.log(scoreNumber.score)

  }

        


    throwArrow(){
        
        const arrow = this.arrows.get(this.player.x, this.player.y, 'arrow')
        //const arrowUP = this.arrows.get(this.player.x, this.player.y, 'arrowUp')
        
        
        if (this.KeyA.isDown) {
            arrow.setVelocity(-300,0);
            arrow.flipX = true;
            this.direction = this.directionLEFT;
          }  if (this.KeyD.isDown) {
            arrow.setVelocity(300,0);
            arrow.flipX = false;
            this.direction = this.directionRIGHT;
          } if (this.KeyW.isDown) {
            arrow.setVelocity(0,-300);
            arrow.flipX = false;
            this.direction = this.directionUP;
          } if (this.KeyS.isDown) {
            arrow.setVelocity(0,300);
            arrow.flipX = true;
            this.direction = this.directionDOWN;

          }

          switch (this.direction){
            case this.directionLEFT:
                arrow.setVelocity(-300,0);
                arrow.flipX = true;

                break
            
            case this.directionRIGHT:
                arrow.setVelocity(300,0);
                arrow.flipX = false;
                    
                break

            case this.directionUP:
                arrow.setVelocity(0,-300);
                arrow.flipX = false;
                arrow.angle += 270 
                break

            case this.directionDOWN:
                arrow.setVelocity(0,300);
                arrow.flipX = true;
                arrow.angle += 270    
                break
        }

        
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

            Object.defineProperty(ogreObj, "ogreChill", {
                value: 0,
                enumerable: true,
                configurable: true,
                writable: true
            });

            Object.defineProperty(ogreObj, "ogreTakingDamage", {
                value: 1,
                enumerable: true,
                configurable: true,
                writable: true
            });

            Object.defineProperty(ogreObj, "ogreHealthState", {
                value: ogreObj["ogreChill"],
                enumerable: true,
                configurable: true,
                writable: true
            });

            Object.defineProperty(ogreObj, "ogreDamagedTime", {
                value: 0,
                enumerable: true,
                configurable: true,
                writable: true
            });

            Object.defineProperty(ogreObj, "ogreHealth", {
                value: 3,
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

            //this.physics.add.collider(this.createArrows, ogreObj, undefined, this);
        })

        
        

        

         
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

    // this.ogreChill = 0;
    // this.ogretakingDamage = 1;
    // this.ogreHealthState = this.ogreChill
    // this.ogreDamagedTime = 0;

    this.Ogros.children.each((gameObject,index) => {
        const og = gameObject
        switch (og["ogreHealthState"]){
            case og["ogreChill"]:
                
                break
            
            case og["ogreTakingDamage"]:
                og.setVelocity(this.newDirectionACO.x,this.newDirectionACO.y)
                og["ogreDamagedTime"] += deltatime
                if (og["ogreDamagedTime"] >= 300){
                    og["ogreHealth"]--;
                    og["ogreHealthState"] = og["ogreChill"];
                    og.setVelocity(0);
                    og.clearTint();
                    og["ogreDamagedTime"] = 0;
                    
                    
                }
                break
        }
    
        if (og["ogreHealthState"] === og["ogreTakingDamage"]){
            return
        }
    })
    

    // IA del ogro

    this.Ogros.children.each((gameObject,index) => {
        const ogres = gameObject
        switch (ogres["initial"]){
            
            case ogres["UP"]:
                if (ogres["ogreHealthState"] != ogres["ogreTakingDamage"])
                    ogres.setVelocity(0,-this.ogreSpeed)
                break
            
            case ogres["DOWN"]:
                if (ogres["ogreHealthState"] != ogres["ogreTakingDamage"])
                    ogres.setVelocity(0,this.ogreSpeed)
    
                break

            case ogres["LEFT"]:
                if (ogres["ogreHealthState"] != ogres["ogreTakingDamage"])
                    ogres.setVelocity(-this.ogreSpeed,0)
                break
            case ogres["RIGHT"]:
                if (ogres["ogreHealthState"] != ogres["ogreTakingDamage"])
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

class Score extends Phaser.Scene{
    constructor(){
        super('Score');
    };
    

    create(){

        this.score = 0;
        this.message = "Score: ";
        this.scoreMessage = this.message.concat(this.score.toString());
        this.text = this.add.bitmapText(300, 225, 'fire' , this.scoreMessage, 15);
        //this.text.setTint(0xff00ff, 0xffff00, 0x00ff00, 0xff0000);
        this.text.setDepth(2);

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
        this.input.on('pointerdown',() => this.playAgain())
    };

    

    //metodo que se activa si el jugador da click a la pantalla (se reinicia el juego)
    playAgain(){
        this.scene.start('theGame');
    };
}



class StoppedState extends State {
     enter(scene, player) {
        player.setVelocity(0);
        player.anims.stop();
        player.anims.play("stopped",true);
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

        if (scene.reboundO == true) {
            scene.stateMachine.transition('boundO');
            return;
          }

          if (scene.reboundS == true) {
            scene.stateMachine.transition('boundS');
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

        if (scene.reboundO == true) {
            scene.stateMachine.transition('boundO');
            return;
          }

        if (scene.reboundS ==true) {
            scene.stateMachine.transition('boundS')
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
          player.flipY = false;
          scene.direction = scene.directionUP;
          
          //player.direction = 'up';
        }  if (this.KeyS.isDown) {
          player.setVelocityY(velocityVector.y);
          player.flipY = false;
          scene.direction = scene.directionDOWN;
          
          //player.direction = 'down';
        }
        if (this.KeyA.isDown) {
          player.setVelocityX(-velocityVector.x);
          player.flipX = true;
          scene.direction = scene.directionLEFT;
          //player.direction = 'left';
        }  if (this.KeyD.isDown) {
          player.setVelocityX(velocityVector.x);
          player.flipX = false;
          scene.direction = scene.directionRIGHT;
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
        player.anims.play('attack',true);
        
        player.once('animationcomplete', () => {
          scene.throwArrow();
          scene.stateMachine.transition('walk');
        });
    }
}

class BoundStateOgre extends State {
    enter(scene, player) {
        console.log("ahh me corro")
        player.setVelocity(scene.newDirectionPCO.x,scene.newDirectionPCO.y);
        scene.reboundO = false;

      
  }

  execute (scene,player){
    if (scene.damagedTime == 0){
        scene.stateMachine.transition('walk');
    }
    
  }
  
}

class BoundStateSpike extends State {
    enter(scene, player) {
        console.log("ahh me corro x2")
        player.setVelocity(scene.newDirectionPCS.x,scene.newDirectionPCS.y);
        scene.reboundS = false;

      
  }

  execute (scene,player){
    if (scene.damagedTime == 0){
        scene.stateMachine.transition('walk');
    }
    
  }
  
}


