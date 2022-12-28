

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 250,   
    scene: [Scene,FinalScene],
    scale: { 
        zoom: 2,
        mode:Phaser.Scale.FIT} ,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 0},
        },
    },
};
var game = new Phaser.Game(config);


