//     КЛАСС ДЛЯ ОТПРАВКИ ЗАПРОСОВ НА СЕРВЕР
 class Api {
    constructor({ baseUrl, headers}) {
        this._baseUrl = baseUrl;
        this._userUrl = `${this._baseUrl}/users/me`;
        this._cardsUrl = `${this._baseUrl}/cards`;
        this._likesUrl = `${this._baseUrl}/cards/likes`;
        this._token = headers['authorization'];
    }

    _handleResponse (res) {
        if(res.ok) {
            return res.json();
        }
        return Promise.reject(`Что-то не так, ошибка: ${res.status}`);
    }
    //--- МЕТОД ПОЛУЧЕНИЯ ИНФОРМАЦИИ ПОЛЬЗОВАТЕЛЯ
    getUserData(){
        return fetch(this._userUrl, {
            headers: {
                authorization: this._token,
            }
        })
        .then( this._handleResponse)
    }
    //--- МЕТОД СОХРАНЕНИЯ ИНФОРМАЦИИ ИНФОРМАЦИИ ПОЛЬЗОВАТЕЛЯ
    saveUserChanges({ name, about }) {
        return fetch(this._userUrl, {
            method: 'PATCH',
            headers: {
                authorization: this._token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                about: about,
            })
        })
        .then(this._handleResponse)
    }
    //--- МЕТОД СМЕНЫ АВАТАРА ПОЛЬЗОВАТЕЛЯ
    changeAvatar(src) {
        return fetch(`${this._userUrl}/avatar`, {
            method: 'PATCH',
            headers: {
                authorization: this._token,
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                avatar: src,
            })
        })
        .then(this._handleResponse)
    }
    //--- МЕТОД ПОЛУЧЕНИЯ КАРТОЧЕК С СЕРВЕРА
    getInitialCards() {
        return fetch(this._cardsUrl, {
            headers: {
                authorization:this._token,
            }
        })
        .then(this._handleResponse)
    }
    //--- МЕТОД ПУБЛИКАЦИИ НОВОЙ КАРТОЧКИ 
    postNewCard({ name, link }) {
        return fetch(this._cardsUrl, {
            method: 'POST',
            headers: {
                authorization: this._token,
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                name: name,
                link: link
            }) 
        })
        .then(this._handleResponse)
    }
    //--- МЕТОД УДАЛЕНИЕ КАРТОЧКИ
    deleteCard(cardId){
        return fetch(`${this._cardsUrl}/${cardId}`, {
            method:'DELETE',
            headers: {
                authorization: this._token,
            }
        })
        .then(this._handleResponse)
    }
    //--- МЕТОД ЛАЙКА КАРТОЧКИ
    changeLikeCardStatus(cardId, isNotLiked) {
        return fetch(`${this._likesUrl}/${cardId}`, {
            method: isNotLiked ? 'PUT' : 'DELETE',
            headers: {
                authorization:this._token,
            }
        })
        .then(this._handleResponse)
    }
 }

const api = new Api({
    baseUrl: 'https://mesto.nomoreparties.co/v1/cohort-45',
    headers: {
      authorization: 'fcd67938-a1e9-408c-8c74-faa990c9d125',
      'Content-Type': 'application/json'
    }
  });
  
  export default api;