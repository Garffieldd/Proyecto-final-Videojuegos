

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 250,   
    scene: [Scene, GameUI, Score, FinalScene],
    scale: { 
        zoom: 2,
        mode:Phaser.Scale.FIT
    } ,
    physics: {
        default: 'arcade',
        arcade: {
            debug: TextTrackCueList,
            gravity: { y: 0},
        },
    },
};
var game = new Phaser.Game(config);


