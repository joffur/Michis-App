const spanError = document.getElementById('error');
const randomMichisContainer = document.getElementById('randomMichis__container');
const favoritesMichisContainer = document.getElementById('favoritesMichis__container');
const btnReload = document.getElementById('btnReload');
const btnUpload = document.getElementById('btnUpload');
const fileToUpload = document.getElementById('file');
const previewImage = document.getElementById('previewImage');
const selectCtrl = document.getElementById('listSelector');

const API_KEY = 'live_adELSagZbGX3SlM51So8MQT7jqdLFAqvMhJagyOdjxkPXa5BpHul6BjaFNeaupZf'
const endpoints = {
  API_URL: 'https://api.thecatapi.com/v1/images/search',
  API_URL_LIMIT: (limit = 3) => `https://api.thecatapi.com/v1/images/search?limit=${limit}`,
  API_URL_KEY: (key, limit = 3) => `https://api.thecatapi.com/v1/images/search?limit=${limit}&api_key=${key}`,
  API_URL_FAVORITES: (limit = 3) => `https://api.thecatapi.com/v1/favourites?limit=${limit}`,
  API_URL_SAVE_FAVOURITES: `https://api.thecatapi.com/v1/favourites`,
  API_URL_UPLOAD_FAVOURITES: `https://api.thecatapi.com/v1/images/upload`,
  API_URL_DELETE_FAVOURITES: (id) => `https://api.thecatapi.com/v1/favourites/${id}`,
};

// window.addEventListener('DOMContentLoaded', loadRandomMichis.bind(null, selectCtrl.value));
window.addEventListener('DOMContentLoaded', loadFavouritesImages);
btnReload.addEventListener('click', loadRandomMichis.bind(null, selectCtrl.value));
btnUpload.addEventListener('click', uploadMichiPhoto);
fileToUpload.addEventListener('change', loadPreviewImage);
selectCtrl.addEventListener('change', setQuantityRandomImages);

function setQuantityRandomImages() {
  loadRandomMichis(selectCtrl.value);
}

async function loadRandomMichis(qty) {
  try {
    if (selectCtrl.value == 0) {
      return;
    } else {
      const response = await fetch(endpoints.API_URL_KEY(API_KEY, selectCtrl.value));
      const data = await response.json();
  
      randomMichisContainer.innerText = "";
  
      if (response.status !== 200) {
        spanError.innerText = `Hubo un error: ${response.status}`;
      } else {
        randomMichisContainer.appendChild(createCardContainer(data, 'random'));
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function loadFavouritesImages() {
  try {
    const response = await fetch (endpoints.API_URL_FAVORITES(100), {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    favoritesMichisContainer.innerText = "";

    if (response.status !== 200) {
      spanError.innerText = `Hubo un error: ${data.message}`;
    } else {
      favoritesMichisContainer.appendChild(createCardContainer(data, 'favourites'));
    }
    // console.log('Favoritos', data);
  } catch (error) {
    console.log(error);
  }
}

function loadPreviewImage() {
  const file = this.files[0];
  // console.log(file);

  previewImage.file = file;
  previewImage.width = 150;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
  btnUpload.removeAttribute('disabled', '')
}

async function saveFavouriteImage(imageId) {
  try {
    const response = await fetch(endpoints.API_URL_SAVE_FAVOURITES, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_id: imageId,
      })
    });
    const data = await response.json();
  
    if (response.status !== 200) {
      spanError.innerText = `Hubo un error: ${data.message}`;
    } else {
      console.log('Michi guardado en favoritos');
      loadFavouritesImages();
    }
    // console.log(data.message);
    // console.log(evt.currentTarget.imageId);
  } catch (error) {
    console.log(error);
  }
}

async function deleteFavouriteImages(imageId) {
  try {
    const response = await fetch(endpoints.API_URL_DELETE_FAVOURITES(imageId), {
      method: 'DELETE',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
  
    if (response.status !== 200) {
      spanError.innerText = `Hubo un error: ${data.message}`;
    } else {
      console.log('Michi borrado de favoritos');
      loadFavouritesImages();
    }
    // console.log(data.message);
    // console.log(evt.currentTarget.imageId);
  } catch (error) {
    console.log(error);
  }
}

async function uploadMichiPhoto() {
  const form = document.getElementById('uploadingForm');
  const formData = new FormData(form);
  
  const response = await fetch(endpoints.API_URL_UPLOAD_FAVOURITES, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      // 'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (response.status !== 201) {
    spanError.innerText = `Hubo un error: ${data.message}`;
  } else {
    console.log("Foto de michi cargada :)");
    saveFavouriteImage(data.id); //para agregar el michi cargado a favoritos.
  }
}

function createCardContainer(data, section) {
  const fragment = new DocumentFragment();
  data.map((item) => {
    const div = document.createElement('div');
    const img = document.createElement('img');
    const figure = document.createElement('figure');
    let btn;
    div.classList = 'card__container';
    if (section === 'random' ) {
      btn = createButton('guardarFavoritos');
      img.alt = 'Foto gatito aleatorio';
      img.src = item.url;
      btn.addEventListener('click', saveFavouriteImage.bind(null, item.id));
    } else {
      btn = createButton('borrarFavoritos');
      img.alt = 'Foto gatito favorito';
      img.src = item.image.url;
      btn.addEventListener('click', deleteFavouriteImages.bind(null, item.id));
    }

    figure.appendChild(img);
    div.appendChild(figure);
    div.appendChild(btn);
    fragment.appendChild(div);
  });

  return fragment;
}

function createButton(type) {
  let btn = document.createElement('button');
  let span = document.createElement('span');
  // let svg = document.createElement('svg');
  let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  let path = document.createElementNS('http://www.w3.org/2000/svg','path');
  if (type === 'guardarFavoritos') {
    btn.classList = 'like-button';
    span.innerText = "LIKE"
    btn.appendChild(span);
  }
  if (type === 'borrarFavoritos') {
    btn.classList = 'delete-button';
    svg.setAttribute('viewBox', '0 0 448 512');
    path.setAttribute('d', 'M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z');
    svg.appendChild(path);
    btn.appendChild(svg);
  }
  return btn;
}