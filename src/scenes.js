


class Scene extends Phaser.Scene {

    constructor(){
        super('theGame')

        // Variables del juego
        
        
    }
    
    // Carga de los assets
 preload ()
    {

        this.load.setBaseURL('http://localhost/Proyecto-final-Videojuegos');
        //Imagenes
        

        //Musica
        

        // Fuente
        
  
    };
// Creacion de los elementos del videojuego
 create ()
    {
        
        

    };

// Actualizacion de los elementos del videojuego
 update(time)
    {
       
       
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



