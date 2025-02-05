//Initialize global variables.
let targetColor = undefined, score = 0;

//Instantiate color options array.
const colorOptions = Array(6);

//Global DOM elements.
const root = document.documentElement;
const DOMColorOptions = document.querySelectorAll(".color-option");
const gameOverlay = document.getElementById("game-overlay");
const gameStatus = document.getElementById("game-status");
const winsCounter = document.getElementById("wins-counter");
const svgPath = document.getElementById('svg-path')


/* GAME FUNCTIONS */
//Fetches a random base colour.
const getColour = () =>{
//Leveraging the bounds of the 'hue' and 'saturation' colour properties to select a random base colour. This way, the totality of the colour wheel serves as a predefined set for the selection.
    const hue = Math.floor(Math.random() * 359),
          saturation = Math.floor(Math.random() * 100);

    return  [hue,saturation,10]
}

//Begins a new round of the game.
const roundInitializer = () =>{
//Populate the color options array. For each option pushed into the array, the lightness/shade is incremented by 15.
let shade = 0;
for(let i = 0; i < colorOptions.length; i++){
    const color = getColour();
    colorOptions[i] = [color[0], color[1], color[2] + shade];
    shade += 15
};

//Randomize the order of the color options to keep each round fresh and distinct for the player.
colorOptions.sort(() => Math.random() - 0.5);

//A target colour is randomly selected.
targetColor =  colorOptions[Math.floor(Math.random() * 5)];

//Update target color displayed in the DOM.
const colorCode = `hsl(${targetColor[0]},${targetColor[1]}%,${targetColor[2]}%)`;
root.style.setProperty("--target-color--", colorCode);


DOMColorOptions.forEach((option, index)=>{
    option.style.backgroundColor = `hsl(${colorOptions[index][0]},${colorOptions[index][1]}%,${colorOptions[index][2]}%)`;
    option.setAttribute("data-colorOption", JSON.stringify(colorOptions[index]));

    option.animate({
      transform: "scale(1)"
    },{duration: 400, delay: 50 * index, easing: "cubic-bezier(0,-0.01,.63,1.47)", fill:"forwards"});

    //Reset box shadows
    option.style.boxShadow = "9px 9px 5px black"
    //Ensures that all color boxes are now interactable.
    option.classList.remove("uninteractable");
});
}


//Updates the games status based on the player selection.
const playerSelectionHandler = (e) =>{
if(!e.target.classList.contains("uninteractable")){
    const selectionColor = e.target.getAttribute("data-colorOption");
    e.target.classList.add("uninteractable"); //An 'uniteractable' class is added to clicked color box to ensure player does not spam the same box multiple times to get a higer score.

    DOMColorOptions.forEach(option => {
      option.getAnimations().forEach(anim => anim.cancel());  // Cancel existing animations
      option.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0)" }],
        { duration: 700, easing: "cubic-bezier(.28, -0.82, .52, 1.12)", fill: "forwards" }
      );
    });
  

   //Correct guess state
    if(selectionColor === JSON.stringify(targetColor)){
       score += 1;
       winsCounter.classList.add("bump");
       winsCounter.textContent = score;
       root.style.setProperty("--anim-duration--", ".4s");
       root.style.setProperty("--msg-color--", "green");
       gameStatus.textContent = "YOU GUESSED RIGHT!!!";
       gameStatus.classList.add("reveal");

       setTimeout(()=>{winsCounter.classList.remove("bump")},100)
       setTimeout(()=>{
           gameStatus.classList.remove("reveal")
           roundInitializer();
       },1500);

    //Wrong guess state
    }else{
          root.style.setProperty("--anim-duration--", "1s");
          root.style.setProperty("--msg-color--", "red");
          gameStatus.classList.add("reveal");
          gameStatus.textContent = "YOU GUESSED WRONG";
          gameOverlay.style.display = "grid";
          gameOverlay.style.placeItems = "center";
          document.getElementById("score").textContent = score;
          svgPath.style.fillOpacity = 0;
          
          setTimeout(()=>{
                const dashLength = svgPath.getTotalLength();
                svgPath.style.strokeDasharray = dashLength;
                svgPath.style.strokeDashoffset = dashLength;
                
                svgPath.animate(
                    [{ strokeDashoffset: dashLength }, { strokeDashoffset: 0 }],
                    { duration: 700, fill: 'forwards' }
                );
                svgPath.animate([{fillOpacity: 0}, {fillOpacity: 1}],
                    { duration: 700, delay:500, fill: 'forwards' }
                )
          },3000)
    };

}
}

//Resets the game to a 'New Game' state.
const newGameHandler = () =>{
    //Reset variables and displays to base state.
    score = 0;
    gameOverlay.style.display = "none";
    gameStatus.classList.remove("reveal");
    winsCounter.textContent = 0;

    //Reset animated game components to base state.
    svgPath.animate(
        {
          fillOpacity: 0,
          strokeDashoffset: svgPath.getTotalLength()
        },
        { duration: 0, delay:0, fill: 'forwards' }
    );

    DOMColorOptions.forEach(option =>{
        option.getAnimations().forEach(anim => anim.cancel());
        option.animate(
          [{ transform: "scale(1)" }, { transform: "scale(0)" }]
         ,{duration: 0, delay:0, fill:"forwards"})
      });

    roundInitializer()
}

//Append Event Listeners
DOMColorOptions.forEach((option,index) =>{
    option.addEventListener("mouseover", (e)=>{
        const colorCode = `hsl(${colorOptions[index][0]},${colorOptions[index][1]}%,${colorOptions[index][2]}%)`; 
        e.target.style.boxShadow = `2px 2px 5px ${colorCode},-2px -2px 5px ${colorCode}`
      });

    option.addEventListener("mouseout", (e)=>{
        e.target.style.boxShadow = "9px 9px 5px black"
      });
    
    option.addEventListener("click", playerSelectionHandler);
})


//Game begins!
document.addEventListener("DOMContentLoaded", ()=>{
    roundInitializer();
})


