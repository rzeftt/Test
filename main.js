let totalResults = 0; 
const resultsPerPage = 10;
const initialResults = 40; 
let isLoading = false; 
let favorites = []; 


const counterDisplay = document.createElement('div');
counterDisplay.id = 'favorites-counter';
document.body.insertBefore(counterDisplay, document.getElementById("user-container")); 

function makeDraggable(card) {
    card.setAttribute('draggable', true);

    card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.dataset.uuid);
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
    });
}


function updateLocalStorage() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}


function restoreFavorites() {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites'));
    if (savedFavorites) {
        favorites = savedFavorites;
        updateCounter(); 
        const container = document.getElementById("user-container");

     
        favorites.forEach(userInfo => {
            const card = document.createElement("div");
            card.className = "user-card";
            card.dataset.uuid = userInfo.uuid; 
            card.innerHTML = `
                <label class="switch">
                    <input type="checkbox" class="userCheckbox" checked>
                    <span class="slider round"></span>
                </label>
                <img src="${userInfo.picture}" alt="img  ${userInfo.name}">
                <div class="user-info">
                    <div>${userInfo.name}</div>
                    <div>${userInfo.gender}</div>
                    <div>גיל: ${userInfo.age}</div>
                    <div>${userInfo.email}</div>
                </div>
            `;
            container.appendChild(card);

            makeDraggable(card); 

           
            card.querySelector('.userCheckbox').addEventListener('change', function() {
                if (!this.checked) {
                    favorites = favorites.filter(fav => fav.uuid !== userInfo.uuid); 
                    console.log('הכרטיס הוסר מהמערך - לא פעיל:', userInfo.name);
                    updateCounter();
                    updateLocalStorage(); 
                }
            });
        });

       
        fetchData(initialResults);
    } else {
    
        fetchData(initialResults);
    }
}

function fetchData(results) {
    if (isLoading) return; 
    isLoading = true; 

    return fetch(`https://randomuser.me/api/?results=${results}`)
        .then(response => response.json())
        .then(data => {
            displayUsers(data);
            totalResults += results;
            isLoading = false;
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
            isLoading = false;
        });
}

function displayUsers(json) {
    const container = document.getElementById("user-container");

    for (let i = 0; i < json.results.length; i++) {
        const user = json.results[i];
        const userInfo = {
            uuid: user.login.uuid,
            name: `${user.name.title} ${user.name.first} ${user.name.last}`,
            gender: user.gender,
            age: user.registered.age,
            email: user.email,
            picture: user.picture.thumbnail
        };
        
        const card = document.createElement("div");
        card.className = "user-card";
        card.dataset.uuid = userInfo.uuid; 
        card.innerHTML = `
            <label class="switch">
                <input type="checkbox" class="userCheckbox">
                <span class="slider round"></span>
            </label>
            <img src="${userInfo.picture}" alt="img של ${userInfo.name}">
            <div class="user-info">
                <div>${userInfo.name}</div>
                <div>${userInfo.gender}</div>
                <div>גיל: ${userInfo.age}</div>
                <div>${userInfo.email}</div>
            </div>
        `;

        container.appendChild(card);

        makeDraggable(card); 

        
        if (favorites.some(fav => fav.uuid === userInfo.uuid)) {
            card.querySelector('.userCheckbox').checked = true;
        }

     
        card.querySelector('.userCheckbox').addEventListener('change', function() {
            if (this.checked) {
                favorites.push(userInfo); 
                console.log('הכרטיס נוסף למערך:', favorites);
            } else {
                favorites = favorites.filter(fav => fav.uuid !== userInfo.uuid);
                console.log('הכרטיס הוסר מהמערך - לא פעיל:', userInfo.name);
            }
            updateCounter(); 
            updateLocalStorage(); 
        });
    }
}

function updateCounter() {
    if (favorites.length > 0) {
        counterDisplay.innerHTML = `Preferred users:  ${favorites.length}`;
        counterDisplay.style.display = 'block';
    } else {
        counterDisplay.style.display = 'none';
    }
}


function checkScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        fetchData(resultsPerPage);
    }
}


window.addEventListener('scroll', checkScroll);


window.addEventListener('load', restoreFavorites);


$(document).ready(function() {
    $("#user-container").sortable({
        placeholder: "sortable-placeholder", 
        cursor: "move", 
        update: function(event, ui) {
            console.log("The order has been updated.");
        }
    });


    $("#user-container").disableSelection();
});
