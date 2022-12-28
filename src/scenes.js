
class Scene extends Phaser.Scene {

    constructor(){
        super('theGame')

        // Variables del juego
        
       
        this.playerVelocity = 100;
        this.ogreSpeed = 50;
        //this.initial = 3;
        this.UP = 0;
        this.DOWN = 1;
        this.LEFT = 2;
        this.RIGHT = 3;
        this.initial = this.RIGHT;
        
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
        this.player = this.physics.add.sprite(170,80,'player')
        this.player.setScale(1); 
        this.player.setSize(11,15,true);
        this.player.setOffset(3,9);
        this.physics.add.collider(this.player, wallsLayer)
        this.cameras.main.startFollow(this.player,true)

        this.KeyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.KeyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.KeyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.KeyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        //Contenedor
        /*
       this.container = this.add.container(this.player)
       this.container.setSize(11,15)
       this.physics.world.enable(this.container)
       this.container.add(this.player)
        */
        //Generar enemigo
        this.ogre = this.physics.add.sprite(180,90,'ogre');
        //this.ogre.onCollide = true;
        this.physics.add.collider(this.ogre, wallsLayer);

        this.physics.world.on('handleTileCollision', this.handleTileCollision);

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

    };

    

    handleTileCollision(gameObject, tile){
        if (gameObject !== this)
        {
            return
        }

        const newDirection = Phaser.Math.Between(0,3)
        this.initial = newDirection;
        console.log(this.initial)
    }

    
// Actualizacion de los elementos del videojuego
 update(time,deltatime)
    {
        //Controlador del Jugador
    if(!this.KeyW.isDown && !this.KeyA.isDown && !this.KeyS.isDown && !this.KeyD.isDown){    
    this.player.setVelocityX(0);
    this.player.setVelocityY(0);
    this.player.play('stopped',true);
    }
    if(this.KeyW.isDown) {
        console.log('W key pressed')
        this.player.setVelocityY(-this.playerVelocity);
        this.player.play('walk',true);
    } 

    if(this.KeyA.isDown) {
        console.log('A key pressed')
        this.player.flipX = true;
        this.player.setVelocityX(-this.playerVelocity);
        this.player.play('walk',true);
    } 
    if(this.KeyS.isDown) {
        console.log('S key pressed')
        this.player.setVelocityY(this.playerVelocity);
        this.player.play('walk',true);
    } 
    if(this.KeyD.isDown) {
        console.log('D key pressed')
        this.player.flipX = false;
        this.player.setVelocityX(this.playerVelocity);
        this.player.play('walk',true);
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



