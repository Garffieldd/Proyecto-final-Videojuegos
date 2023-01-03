
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
        this.UP = 0;
        this.DOWN = 1;
        this.LEFT = 2;
        this.RIGHT = 3;
        this.initial = this.RIGHT;
        this.randomMoveTime = 2000;   
        this.health = 3;
    }
    
    // Carga de los assets
 preload ()
    {

        this.load.setBaseURL('http://localhost/Proyecto-final-Videojuegos');
        //Imagenes
        this.load.spritesheet('player','assets/img/knight_spritesheet.png', {frameWidth: 16, frameHeight:23});
        this.load.spritesheet('ogre','assets/img/ogre_spritesheet.png', {frameWidth: 21, frameHeight:27});
        this.load.image('tiles', 'assets/img/Tiles/0x72_DungeonTilesetII_v1.4.png')
        this.load.tilemapTiledJSON('dungeon', 'assets/img/Tiles/dungeon.json')
        this.load.image('katana','assets/img/weapon_katana.png' )
        this.load.image('fullHeart','assets/img/fulled heart.png')
        this.load.image('semifulledHeart','assets/img/semifulled heart.png')
        this.load.image('emptyHeart','assets/img/empty heart.png')

        //Plugin para tiles animados
        this.load.scenePlugin('AnimatedTiles', 'https://raw.githubusercontent.com/nkholski/phaser-animated-tiles/master/dist/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        //Musica
        

        // Fuente
        
  
    };
// Creacion de los elementos del videojuego
 create ()
    {
        
        //Generar Dungeon
        const map = this.make.tilemap({key: 'dungeon', tileWidth: 16, tileHeight: 16});
        const tileset = map.addTilesetImage('dungeon', 'tiles')
        map.createLayer('Ground', tileset)
        const wallsLayer = map.createLayer('Walls', tileset)
        
        wallsLayer.setCollisionByProperty({collide: true})
        this.animatedTiles.init(map)


        
        
        /*
        const debugGraphics = this.add.graphics().setAlpha(0.7)
        wallsLayer.renderDebug(debugGraphics, {
            titleColor: null,
            collidingTileColor: new Phaser.Display.Color(243,234,48,255),
            faceColor: new Phaser.Display.Color(40,39,37,255)
        })
        */
       
       //Generar Jugador
        this.player = this.physics.add.sprite(170,80,'player');
        this.player.setScale(1); 
        this.player.setSize(11,15,true);
        this.player.setOffset(3,9);
        this.physics.add.collider(this.player, wallsLayer);
        this.cameras.main.startFollow(this.player, true);

        this.KeyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.KeyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.KeyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.KeyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        //Generar Katana
        this.katana = this.physics.add.sprite(170,80,'katana');
        this.katana.setScale(0.5);
        this.katana.setSize(5,8);

        //Contenedor
        /*
       this.contenedor = this.add.container(170,80)
       this.contenedor.add(this.player);
       this.contenedor.add(this.katana);
       this.cameras.main.startFollow(this.contenedor, true);
    */
       //console.log(this.contenedor);
      
       
            
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
        
        const randomDirection = (exclude) => {
            let newDirection = Phaser.Math.Between(0,3)
            while (newDirection === exclude){
                newDirection = Phaser.Math.Between(0,3)
            }
            return newDirection
        }
        this.newOgre();
        this.physics.add.collider(this.ogre, wallsLayer, () => {
            this.initial = randomDirection(this.initial);
            //console.log('estoy funcionando')
        });

        this.physics.add.collider(this.ogre, this.player, this.collideWithOgre, undefined, this);
        
        this.UIlife();
        

        this.time.addEvent({
            delay: this.randomMoveTime,
            callback:() => {
                this.initial = randomDirection(this.initial);
            },
            loop:true
        })
        
    };

    
    
    collideWithOgre(ogre,player){
         //console.log(ogre)
         //console.log(player)

        const xDirection = player.x - ogre.x;
        const yDirection = player.y - ogre.y;

        const newDirection = new Phaser.Math.Vector2(xDirection,yDirection).normalize().scale(250);

        this.health--;

        if (this.health === 0){
            this.scene.start('GameOver')
            console.log('Game Over')
        }

        if(this.healthState === this.takingDamage){
            return
        }

        
        player.setVelocity(newDirection.x,newDirection.y);
        player.setTint(0xff0000);
        this.damagedTime = 0
        this.healthState = this.takingDamage;
        this.healthHandler();
        console.log(this.health);
        
        
    }



    newOgre(){
         //Generar enemigo
         this.ogre = this.physics.add.sprite(180,140,'ogre');
         
         
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


    }

    UIlife(){
        this.hearts = this.add.group()

        this.hearts.createMultiple({
            key: 'fullHeart',
            setXY: {
                x: -10,
                y: -30,
                stepX: 16
            },
            quantity: 3
        })
        //this.healthHandler();
    }

    
    healthHandler(){
        this.hearts.children.each((gameObject,index) => {
            const heart = gameObject
            if (index < this.health){
                console.log(index);
                console.log(this.health);
                heart.setTexture('fullHeart')
            }else{
                heart.setTexture('emptyHeart')
            }
        })
        
    }

   

    
// Actualizacion de los elementos del videojuego
 update(time,deltatime)
    {

         //Animacion de daño
         
    switch (this.healthState){
        case this.chill:
            //console.log('tamos de chill')
            break
        
        case this.takingDamage:
            
            this.damagedTime += deltatime
            if (this.damagedTime >= 300){
                this.healthState = this.chill;
                this.player.clearTint();
                this.damagedTime = 0;
                //console.log('ay mi piernita')
            }
            break
    }

    if (this.healthState === this.takingDamage){
        return
    }

        
        
        //Controlador del Jugador
       // const velocityVector = new Phaser.Math.Vector2(this.dirX,this.dirY).normalize() * this.playerVelocity;
       const velocityVector = new Phaser.Math.Vector2(this.playerVelocity * this.dirX,this.playerVelocity * this.dirY).normalize().scale(200);

    if(!this.KeyW.isDown && !this.KeyA.isDown && !this.KeyS.isDown && !this.KeyD.isDown){    
        this.player.setVelocity(0,0);
        this.player.play('stopped',true);
    }
    if(this.KeyW.isDown) {
        //console.log('W key pressed')
        this.dirY = -1;
        this.player.setVelocity(0,velocityVector.y);
        
        this.player.play('walk',true);
        
    } 

    if(this.KeyA.isDown) {
        //console.log('A key pressed')
        this.dirX = -1;
        this.player.flipX = true;
        this.player.setVelocity(velocityVector.x,0);
        this.player.play('walk',true);
        
    } 
    if(this.KeyS.isDown) {
        //console.log('S key pressed')
        this.dirY = 1;
        this.player.setVelocity(0,velocityVector.y);
        this.player.play('walk',true);
        
    } 
    if(this.KeyD.isDown) {
        //console.log('D key pressed')
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
    
    //console.log('AW PRESSED')
}

    // Up and right
    if (this.KeyD.isDown && this.KeyW.isDown)
    {
        this.dirX = 1
        this.dirY = -1
        this.player.body.setVelocity(velocityDiagVector.x,velocityDiagVector.y);
        this.player.play('walk',true);
        //console.log('DW PRESSED')
    }

    // Down and right
    if (this.KeyD.isDown && this.KeyS.isDown)
    {

        this.dirX = 1
        this.dirY = 1
        this.player.body.setVelocity(velocityDiagVector.x,velocityDiagVector.y);
        this.player.play('walk',true);
        //console.log('DS PRESSED')
    }

    // Down and left
    
    if (this.KeyA.isDown && this.KeyS.isDown)
    {
        this.dirX = -1
        this.dirY = 1
        this.player.body.setVelocity(velocityDiagVector.x,velocityDiagVector.y);
        this.player.play('walk',true);
        //console.log('AS PRESSED')
    }
    
    

    // IA del ogro


        switch (this.initial){
            case this.UP:
                this.ogre.setVelocity(0,-this.ogreSpeed)
                break
            
            case this.DOWN:
                this.ogre.setVelocity(0,this.ogreSpeed)
                break

            case this.LEFT:
                this.ogre.setVelocity(-this.ogreSpeed,0)
                break
            case this.RIGHT:
                this.ogre.setVelocity(this.ogreSpeed,0)
                break
        }




       
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



