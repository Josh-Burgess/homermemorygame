const cardChoices = () => ({
  matches: [],
  flipped: [],
  cards: [
    {
      name: "Cow",
      id: 0,
      indicator: "0"
    },
    {
      name: "Hen",
      id: 1,
      indicator: "0"
    },
    {
      name: "Horse",
      id: 2,
      indicator: "0"
    },
    {
      name: "Pig",
      id: 3,
      indicator: "0"
    },
    {
      name: "Bat",
      id: 4,
      indicator: "1"
    },
    {
      name: "Cat",
      id: 5,
      indicator: "1"
    },
    {
      name: "GhostDog",
      id: 6,
      indicator: "1"
    },
    {
      name: "Spider",
      id: 7,
      indicator: "1"
    },
    {
      name: "Josh",
      id: 8,
      indicator: "0"
    },
    {
      name: "Molly",
      id: 9,
      indicator: "0"
    }
  ]
});

const lobby = document.getElementById("lobby");
const game = document.getElementById("game");
const back = document.getElementById("btn_back");
const victory = document.getElementById("victory");

const gameEls = document.getElementsByClassName("game");
const gameArr = Array.from(gameEls);

back.addEventListener("click", () => {
  back.classList.remove("shown");
  victory.classList.remove("shown");
  lobby.classList.remove("hidden");
  game.innerHTML = "";
});

gameArr.forEach(game => {
  game.addEventListener("click", e => {
    //use the unary operator to convert the string to a number
    const gamesize = e.target
      .getAttribute("data-gamesize")
      .split("x")
      .map(num => +num);

    startGame(gamesize);
  });
});

// Uses Fisher-Yates to randomize a card array
function shuffleCards(cards) {
  for (let i = cards.length - 1; i > 0; i--) {
    // finds a random card position
    let cardPos = Math.floor(Math.random() * (i + 1));
    // card we move
    let fromPos = cards[i];
    // Position to which we send the card
    cards[i] = cards[cardPos];
    // Replace the original
    cards[cardPos] = fromPos;
  }

  return cards;
}

function startGame(gamesize) {
  let is_flipping = false;

  function flipCard(e) {
    // Kill execution if the card is already revealed or we're waiting for an unmatched flip
    if (e.currentTarget.classList.contains("flipped") || is_flipping)
      return false;

    const id = e.currentTarget.getAttribute("data-card-id");

    localCards.flipped.push(id);
    e.currentTarget.classList.add("flipped");

    if (localCards.flipped.length === 2) {
      if (localCards.flipped[0] === localCards.flipped[1]) {
        document
          .querySelectorAll(`[data-card-id='${id}']`)
          .forEach(match => match.classList.add("matched"));
        localCards.matches.push(id);

        if (localCards.matches.length === gameElementsSize / 2) {
          victory.classList.add("shown");
        }
      } else {
        is_flipping = true;
        setTimeout(() => {
          is_flipping = false;

          document
            .querySelectorAll(".flipped:not(.matched)")
            .forEach(flipped => flipped.classList.remove("flipped"));
        }, 1000);
      }
      localCards.flipped = [];
    }
  }

  document.querySelector("#btn_back").classList.add("shown");

  // Initialize a list to contain game elements
  const gameElementList = [];

  // Use reduce to multiply all elements in the array, we start with 1 instead of zero
  // as the initializer, otherwise all products would be 0
  const gameElementsSize = gamesize.reduce((agg, current) => agg * current, 1);

  // Get the cardChoices object for this game
  const localCards = cardChoices();
  // Pull the list of available cards from the local card object
  const availableCards = [...localCards.cards];

  // Define the card back since this won't change
  const gameElementBack = document.createElement("div");
  gameElementBack.classList.add("card-back");

  // Define a flip container and flipper since this won't change
  const flipContainer = document.createElement("div");
  flipContainer.classList.add("flip-container");
  const flipper = document.createElement("div");
  flipper.classList.add("flipper");

  /**
   * We halve the game element size since we need to include matches
   * This number is always going to be even so it will divide nicely, but
   * even if we created one that didn't divide nicely this function would still
   * work just with one unmatchable card.
   */
  for (let i = 0; i < gameElementsSize / 2; i++) {
    let gameElementFront = document.createElement("div");

    // Select a random card from the available list
    let cardIndex = Math.floor(Math.random() * availableCards.length);
    let card = availableCards[cardIndex];

    // Remove the card from available choices
    availableCards.splice(cardIndex, 1);

    gameElementFront.classList.add("card-front");

    gameElementFront.style.backgroundImage = `url(img/${card.indicator}-Memory${
      card.name
    }image@2x.png)`;

    // create a flip container for both original and match cards
    let localFlip = flipContainer.cloneNode();
    let localFlipper = flipper.cloneNode();
    let localMatchFlip = flipContainer.cloneNode();
    let localMatchFlipper = flipper.cloneNode();

    localFlip.setAttribute("data-card-id", card.id);
    localMatchFlip.setAttribute("data-card-id", card.id);

    // Add the card to the flipContainer
    localFlipper.appendChild(gameElementBack.cloneNode());
    localFlipper.appendChild(gameElementFront);

    // Add the match to another flipContainer
    localMatchFlipper.appendChild(gameElementBack.cloneNode());
    localMatchFlipper.appendChild(gameElementFront.cloneNode());

    // Put the flippers into their containers
    localFlip.appendChild(localFlipper);
    localMatchFlip.appendChild(localMatchFlipper);

    localFlip.addEventListener("click", flipCard);
    localMatchFlip.addEventListener("click", flipCard);

    // Push both the original and match to what we'll put in the game container
    gameElementList.push(localFlip);
    gameElementList.push(localMatchFlip);
  }

  const shuffledCards = shuffleCards(gameElementList);

  shuffledCards.forEach(card => game.appendChild(card));

  game.style.gridTemplateColumns = `repeat(${gamesize[0]}, 1fr)`;
  game.style.gridTemplateRows = `repeat(${gamesize[1]}, 1fr)`;

  lobby.classList.add("hidden");
}
