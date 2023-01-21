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
   
       
       for (const state of Object.values(this.possibleStates)) {
         state.stateMachine = this;
       }
     }
   
     step() {
       
       if (this.state === null) {
         this.state = this.initialState;
         this.possibleStates[this.state].enter(...this.stateArgs);
       }
   
       
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
        this.load.image('fullHeart','assets/img/fulled heart.png')
        this.load.image('halfHeart','assets/img/semifulled heart.png')
        this.load.image('emptyHeart','assets/img/empty heart.png')

        //Plugin para tiles animados
        this.load.scenePlugin('AnimatedTiles', 'https://raw.githubusercontent.com/nkholski/phaser-animated-tiles/master/dist/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        //Musica
        this.load.audio('music', 'assets/music/Musica_pro.mp3')
        this.load.audio('soundEarnPoint', 'assets/music/earn_points_sound.wav' )
        this.load.audio('soundGetHit', 'assets/music/getting_hit_sound.wav' )
        this.load.audio('soundLose', 'assets/music/lose-sound.wav' )
        this.load.audio('soundWin', 'assets/music/win-sound.wav' )
        this.load.audio('soundBow', 'assets/music/bow_shot_sound.mp3' )
        this.load.audio('soundOgreDamaged', 'assets/music/ogreDamaged.mp3')
        this.load.audio('soundCollideNewInstance', 'assets/music/soundCollideNewInstance.mp3' )
        this.load.audio('soundCollideWall', 'assets/music/soundCollideWall.mp3' )

        // Fuente
        
        this.load.bitmapFont('fire', 'assets/img/Font/azo-fire.png', 'assets/img/Font/azo-fire.xml');
  
    };
// Creacion de los elementos del videojuego
 create ()
    {

        this.music = this.sound.add('music');
        this.music.loop = true;
        this.music.play();

        this.soundEarnPoint = this.sound.add('soundEarnPoint')
        this.soundGetHit = this.sound.add('soundGetHit')
        this.soundLose = this.sound.add('soundLose')
        this.SoundWin = this.sound.add('soundWin') 
        this.soundBow = this.sound.add('soundBow')
        this.soundOgreDamaged = this.sound.add('soundOgreDamaged')
        this.soundCollideNewInstance = this.sound.add('soundCollideNewInstance')
        this.soundCollideWall = this.sound.add('soundCollideWall')

        this.scene.run('GameUI');
        this.scene.run('Score');
        //Generar Dungeon
        this.map = this.make.tilemap({key: 'dungeon', tileWidth: 16, tileHeight: 16});
        this.tileset = this.map.addTilesetImage('dungeon', 'tiles')
        
        this.map.createLayer('Ground', this.tileset)
        this.map.createLayer('Furnitures', this.tileset)
        
        const wallsLayer = this.map.createLayer('Walls', this.tileset)
        const newInstances = this.map.createLayer('NewInstance', this.tileset)
        const spikesLayer = this.map.createLayer('Spikes', this.tileset)
        this.anim = this.animatedTiles.init(this.map)
        

        
        newInstances.setCollisionByProperty({newInstance:true})
        spikesLayer.setCollisionByProperty({harmful:true})

        
        //spikesLayer.renderDebug(this.add.graphics());
        
       
       //Generar Jugador
       if (this.random == 0) {
        this.player = this.physics.add.sprite(170,80,'player');
       }else if (this.random == 1){
        this.player = this.physics.add.sprite(230,150,'player');
       }
        
        this.player.setScale(1); 
        this.player.setSize(11,15,true);
        this.player.setOffset(3,9);
        
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
        
        if (!gids[gid]) { 
            const objects = this.map.createFromObjects('Hitbox', gid)
            objects.reduce((group, sprite) => {
            group.add(sprite)
            this.physics.world.enable(sprite)
            this.physics.add.collider(this.player,sprite,this.wallSound,undefined,this);
            this.physics.add.collider(this.Ogros, sprite, () => {
                this.Ogros.children.each(ogreObj =>{
                    ogreObj["initial"] = this.randomDirection(ogreObj["initial"])
                    
                })
            
                

            });

            //this.physics.add.collider(this.createArrows, sprite)
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

    wallSound(){
        this.soundCollideWall.play();
    }

    collideWithSpikes(player , spikesLayer){
        var lives = this.scene.get('GameUI');
        

        const xDirection = player.x - spikesLayer.x*17;
        const yDirection = player.y - spikesLayer.y*17;
        

        this.newDirectionPCS = new Phaser.Math.Vector2(xDirection,yDirection).normalize().scale(200);
        
        if(this.healthState === this.takingDamage){
            return
        }
        if (lives.health == 0){
            this.healthState = this.chill;
            this.music.stop()
            this.soundLose.play();
            this.scene.start('GameOver')
        }else{
            this.healthState = this.takingDamage;
        }

        

        this.reboundS = true;
        player.setVelocity(this.newDirectionPCS.x,this.newDirectionPCS.y)
        player.setTint(0xff0000);
        this.damagedTime = 0
        lives.healthHandler();
        this.soundGetHit.play();
        
    }

    changeInstance(player,instance){
        let someInstancesMap0 = [[768,1039] , [190,575], [1359,63]]
        let someInstancesMap1 = [[230,150] , [1100,656], [767,480]]
        this.randomInstance = Math.floor(Math.random() * 3)

        if (this.random == 0){
            this.player.x = someInstancesMap0[this.randomInstance][0]
            this.player.y = someInstancesMap0[this.randomInstance][1]
        }else if (this.random == 1){
            this.player.x = someInstancesMap1[this.randomInstance][0]
            this.player.y = someInstancesMap1[this.randomInstance][1]
        }else{

        }
        
        this.soundCollideNewInstance.play();
     
    }

    collideWithOgre(ogre,player){
         
        var lives = this.scene.get('GameUI');
        const xDirection = player.x - ogre.x;
        const yDirection = player.y - ogre.y;
       
        this.newDirectionPCO = new Phaser.Math.Vector2(xDirection,yDirection).normalize().scale(200);

        

        if(this.healthState === this.takingDamage){
            return
        }

        if (lives.health == 0){
            this.healthState = this.chill;
            this.music.stop();
            this.soundLose.play();
            this.scene.start('GameOver')
        }else{
            this.healthState = this.takingDamage;
        }

        this.reboundO = true;
        player.setTint(0xff0000);
        this.damagedTime = 0
        lives.healthHandler();
        this.soundGetHit.play();
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
        this.soundEarnPoint.play()

        
        }

        if(ogre["ogreHealthState"] === ogre["ogreTakingDamage"]){
            return
        }
        
        if(this.Ogros.countActive(true)===0){
            this.music.stop()
            this.SoundWin.play()
            this.scene.start('Winner')
        }

        arrow.destroy()
        ogre.setTint(0xff0000);
        this.soundOgreDamaged.play();
        ogre["ogreDamagedTime"] = 0
        ogre["ogreHealthState"] = ogre["ogreTakingDamage"];

  }

        


    throwArrow(){
        
        const arrow = this.arrows.get(this.player.x, this.player.y, 'arrow')
        this.soundBow.play();
        console.log(this.direction)
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

            case undefined:
                arrow.setVelocity(300,0);
                arrow.flipX = false;
                    
                break
        }

        



        
        
    }



    newOgre(){
         //Generar enemigo
        
        this.ogreGen = this.map.getObjectLayer('ogre')
        this.ogres = this.add.group()
        this.ogreGen.objects.forEach(ogreObj =>{
            this.ogre = this.physics.add.sprite(ogreObj.x + ogreObj.width*0.5 ,ogreObj.y - ogreObj.height*0.5,'ogre')
            
            this.anims.create({
                key: 'walkingOgre',
                frames: this.anims.generateFrameNumbers('ogre',{start: 4, end:7}),
                frameRate:10,
                repeat:-1,
            }),
            
            this.anims.create({
                key: 'stoppedOgre',
                frames: this.anims.generateFrameNumbers('ogre',{start: 0, end:3}),
                frameRate:10,
                repeat:-1,
            }),
    
            this.ogre.play('stoppedOgre')
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
        })

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
                    
                this.healthState = this.chill;
                this.player.setVelocity(0);
                this.player.clearTint();
                this.damagedTime = 0;
                lives.health--;      
            }
            break
    }

    if (this.healthState === this.takingDamage){
        return
    }

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
                    ogres.flipX = true
                break
            case ogres["RIGHT"]:
                if (ogres["ogreHealthState"] != ogres["ogreTakingDamage"])
                    ogres.setVelocity(this.ogreSpeed,0)
                    ogres.flipX = false
           
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
        this.text.setDepth(2);

    }

    

}

class WinningScene extends Phaser.Scene{
    constructor(){
        super('Winner');
    }

    preload()
    {
        this.load.setBaseURL('http://localhost/Proyecto-final-Videojuegos');
        this.load.image('fondo', 'assets/img/Win/fondo.jpg' )
        this.load.image('button' ,'assets/img/GameOver/button_try_again.png');
        this.load.audio('soundTryAgain', 'assets/music/try-again-sound.wav' )
    }
    
    create()
    {
        this.add.sprite(config.width/2,config.height/2,'fondo')
        this.soundTryAgain = this.sound.add('soundTryAgain')
        const button = this.add.image(200,200,"button")
        button.setDepth(2)

        button.setInteractive()
              
        button.on('pointerdown', () =>
        this.soundTryAgain.play() )
        button.on('pointerdown', () => 
        this.playAgain() )  
        
        button.on('pointerover', () =>
        button.setTint(0x000000) )

        button.on('pointerout', () =>
        button.clearTint() )
    }

    playAgain(){
        this.scene.start('theGame');
    };
}

class FinalScene extends Phaser.Scene {
    constructor(){
        super('GameOver');
    };

   
    
    // Carga de los assets del Game over
    preload()
    {
        this.load.setBaseURL('http://localhost/Proyecto-final-Videojuegos');
        this.load.image('fond', 'assets/img/GameOver/fondo.jpg')
        this.load.image('button' ,'assets/img/GameOver/button_try_again.png');
        this.load.audio('soundTryAgain', 'assets/music/try-again-sound.wav' )
    };

    //Creacion de la pantalla del Game Over
    create()
    {
        
        this.add.sprite(config.width/2,config.height/2,'fond')
        this.soundTryAgain = this.sound.add('soundTryAgain')
        const button = this.add.image(200,200,"button")
        button.setDepth(2)

        button.setInteractive()
              
        button.on('pointerdown', () =>
        this.soundTryAgain.play() )
        button.on('pointerdown', () => 
        this.playAgain() )  
        
        button.on('pointerover', () =>
        button.setTint(0x000000) )

        button.on('pointerout', () =>
        button.clearTint() )
        
    };

    

    //metodo que se activa si el jugador da click a la pantalla (se reinicia el juego)
    playAgain(){
        this.scene.start('theGame');
    };

    update(){

        
    }
}



class StoppedState extends State {
     enter(scene, player) {
        player.setVelocity(0);
        player.anims.stop();
        player.anims.play("stopped",true);
      }
    
      execute(scene, player) {
        
        this.KeyW = scene.KeyW;
        this.KeyA = scene.KeyA;
        this.KeyS = scene.KeyS;
        this.KeyD = scene.KeyD;
        this.KeySpace = scene.KeySpace;
        // Transition to attack if pressing space
        if (this.KeySpace.isDown) {
          scene.stateMachine.transition('attack');
          return;
        }
    
        // Transition to move if pressing a movement key
        if (this.KeyA.isDown || this.KeyD.isDown || this.KeyW.isDown || this.KeyS.isDown) {
          scene.stateMachine.transition('walk');
          return;
        }

        //Transition to Bound if a Ogre is hitting you

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
        
        this.KeyW = scene.KeyW;
        this.KeyA = scene.KeyA;
        this.KeyS = scene.KeyS;
        this.KeyD = scene.KeyD;
        this.KeySpace = scene.KeySpace;
        this.playerVelocity = 100
        this.playerDiagVelocity = 69.4;
        
        
        // Transition to attack if pressing space
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
        // Transition to stop if not pressing movement keys
        if (!(this.KeyA.isDown || this.KeyD.isDown || this.KeyW.isDown || this.KeyS.isDown)) {
            scene.stateMachine.transition('stopped');
            
          return;
        }
    
        player.setVelocity(0);
        if (this.KeyW.isDown) {
          player.setVelocityY(-velocityVector.y);
          player.flipY = false;
          scene.direction = scene.directionUP;
          
          
        }  if (this.KeyS.isDown) {
          player.setVelocityY(velocityVector.y);
          player.flipY = false;
          scene.direction = scene.directionDOWN;
          
          
        }
        if (this.KeyA.isDown) {
          player.setVelocityX(-velocityVector.x);
          player.flipX = true;
          scene.direction = scene.directionLEFT;
          
        }  if (this.KeyD.isDown) {
          player.setVelocityX(velocityVector.x);
          player.flipX = false;
          scene.direction = scene.directionRIGHT;
          
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
        player.setVelocity(scene.newDirectionPCS.x,scene.newDirectionPCS.y);
        scene.reboundS = false;

      
  }

  execute (scene,player){
    if (scene.damagedTime == 0){
        scene.stateMachine.transition('walk');
    }
    
  }
  
}



