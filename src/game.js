

const config = {
    type: Phaser.WEBGL,
    width: 1920,
    height: 1080,   
    scene: [Scene,FinalScene],
    scale: { 
        mode:Phaser.Scale.FIT} ,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 500},
        },
    },
};
var game = new Phaser.Game(config);


