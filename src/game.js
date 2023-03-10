

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 250,   
    scene: [Scene, GameUI, Score, WinningScene,FinalScene],
    scale: { 
        zoom: 2,
        mode:Phaser.Scale.FIT
    } ,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0},
        },
    },
};
var game = new Phaser.Game(config);


