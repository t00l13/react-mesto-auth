import React from "react";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import EditAvatarPopup from "./EditAvatarPopup";
import EditProfilePopup from "./EditProfilePopup";
import AddPhotoPopup from "./AddPhotoPopup";
import ImagePopup from "./ImagePopup";
import ConfirmPopup from "./ConfirmPopup";
import InfoTooltip from './InfoTooltip';
import Register from "./Register";
import Login from "./Login"
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";
import api from "../utils/api.js";

import * as auth from '../utils/auth.js';

function App() {
  const history = useHistory();
  const [currentUser, setCurrentUser] = React.useState({});

  const [isEditProfilePopupOpen, setEditProfileClick] = React.useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarClick] = React.useState(false);
  const [isAddPhotoPopupOpen, setAddPhotoClick] = React.useState(false);
  const [isInfoTooltip, setInfoTooltip] = React.useState({isOpen:false, successful: false});

  const [cards, setCards] = React.useState([]);
  const [selectedCard, setSelectedCard] = React.useState({});
  const [selectedCardDeleteConfirm, setSelectedCardDeleteConfirm] =
    React.useState({ isOpen: false, card: {} });

  const [renderSave, setRenderSave] = React.useState(false);

  const [loggedIn, setLoggedIn] = React.useState(false);
  const [email, setEmail] = React.useState('');

  //Выводим информацию профиля
  React.useEffect(() => {
    api
      .getUserData()
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  //Выводим карточки
  React.useEffect(() => {
    api
      .getInitialCards()
      .then((data) => {
        setCards(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if(token){
      auth.checkToken(token)
        .then(data => {
          if(data){
            setEmail(data.data.email);
            handleLoggedIn();
            history.push('/');
          }
        })
    }
  }, [history]);

  //ОБРАБОТЧИКИ
  function handleLoggedIn() {
    setLoggedIn(true);
  }

  function handleInfoTooltip(result) {
    setInfoTooltip({...isInfoTooltip, isOpen:true, successful:result});
  }

  //ОБРАБОТЧИКИ ПОПАПОВ
  function handleEditAvatarClick() {
    setEditAvatarClick(true);
  }

  function handleEditProfileClick() {
    setEditProfileClick(true);
  }

  function handleAddPhotoClick() {
    setAddPhotoClick(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleOverlayPopupClick(evt){
    if(evt.target.classList.contains('popup'))closeAllPopups();
  }

  function handleCardDeleteClick(card) {
    setSelectedCardDeleteConfirm({
      ...selectedCardDeleteConfirm,
      isOpen: true,
      card: card,
    });
  }

  function handleCardDelete(card) {
    setRenderSave(true);
    api
      .deleteCard(card._id)
      .then(() => {
        const newCards = cards.filter((c) =>
          c._id === card._id ? false : true
        );
        setCards(newCards);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setRenderSave(false);
      });
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        const newCards = cards.map((c) => (c._id === card._id ? newCard : c));
        setCards(newCards);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleUpdateUser(newUserData) {
    setRenderSave(true);
    api
      .saveUserChanges(newUserData)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setRenderSave(false);
      });
  }

  function handleUpdateAvatar(newAvatarLink) {
    setRenderSave(true);
    api
      .changeAvatar(newAvatarLink)
      .then((data) => {
        setCurrentUser({ ...currentUser, avatar: data.avatar });
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setRenderSave(false);
      });
  }

  function handleAddPhotoSubmit(cardData) {
    setRenderSave(true);
    api
      .postNewCard(cardData)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setRenderSave(false);
      });
  }

  function handleRegister(password, email){
    auth.register(password, email)
      .then(data => {
        if(data){
          handleInfoTooltip(true);
          history.push('/sign-in');
        }
      })
      .catch(err => {
        console.log(err);
        handleInfoTooltip(false);
      })
  }
  function handleLogin(password, email){
    auth.login(password, email) 
      .then(data => {
        if(data.token) {
          setEmail(email);
          handleLoggedIn();
          localStorage.setItem('token', data.token);
          history.push('/')
        }
      })
      .catch(err => {
        handleInfoTooltip(false);
        console.log(err);
      })
  }

  function handleSignOut() {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setEmail('');
    history.push('/sign-in');
  }

  
  function closeAllPopups() {
    setAddPhotoClick(false);
    setEditAvatarClick(false);
    setEditProfileClick(false);
    setSelectedCard({});
    setSelectedCardDeleteConfirm({
      ...selectedCardDeleteConfirm,
      isOpen: false,
    });
    setInfoTooltip({isOpen: false})
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <div className="container">

          <Header email={email} onSignOut={handleSignOut} />

          <Switch>

          <ProtectedRoute
            exact path="/"
            loggedIn={loggedIn}
            component={Main}
            cards={cards}
            onAddPhoto={handleAddPhotoClick}
            onEditAvatar={handleEditAvatarClick}
            onEditProfile={handleEditProfileClick}
            onCardClick={handleCardClick}
            onLikeCard={handleCardLike}
            onDeleteCard={handleCardDeleteClick}
          />

          <Route path="/sign-in">
          <Login onLogin={handleLogin}/>
          </Route>

          <Route path="/sign-up">
            <Register onRegister={handleRegister}/>
          </Route>

          <Route path="*">
            {loggedIn ? (
              <Redirect to="/" />
            ) : (
              <Redirect to="/sign-in" />
            )}
          </Route>

          </Switch>

          <Footer />
          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
            isRender={renderSave}
            isOverlayPopupClose={handleOverlayPopupClick}
          />
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
            isRender={renderSave}
            isOverlayPopupClose={handleOverlayPopupClick}
          />
          <AddPhotoPopup
            isOpen={isAddPhotoPopupOpen}
            onClose={closeAllPopups}
            onAddPhoto={handleAddPhotoSubmit}
            isRender={renderSave}
            isOverlayPopupClose={handleOverlayPopupClick}
          />
          <ImagePopup
            onClose={closeAllPopups}
            card={selectedCard}
            isRender={renderSave}
            isOverlayPopupClose={handleOverlayPopupClick}
          />
          <ConfirmPopup
            deleteCard={selectedCardDeleteConfirm}
            onClose={closeAllPopups}
            onCardDelete={handleCardDelete}
            isRender={renderSave}
            isOverlayPopupClose={handleOverlayPopupClick}
          />
          <InfoTooltip 
          onClose={closeAllPopups}
          result={isInfoTooltip}
          isOverlayPopupClose={handleOverlayPopupClick}
          />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;

