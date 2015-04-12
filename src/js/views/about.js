(function () {
  var state = {aboutIsOpen: false};
  var view = document.querySelector('#about-view');
  var aboutTrigger = document.querySelector('[data-name="about-trigger"]');
  var close = $("button#close");

  function attachEvents() {
    aboutTrigger.addEventListener('click', showAbout);
    document.body.addEventListener('keyup', handleDocumentKeyup);
    close.on('click', hideAbout);
  }

  function showAbout() {
    state.aboutIsOpen = true;
    view.classList.toggle('show-about', true);
  }

  function hideAbout() {
    view.classList.remove('show-about');
    state.aboutIsOpen = false;
  }

  function handleDocumentKeyup(event) {
    if (state.aboutIsOpen && event.keyCode === 27) {
      hideAbout();
    }
  }

  attachEvents();
})();
