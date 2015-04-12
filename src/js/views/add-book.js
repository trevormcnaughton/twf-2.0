'use strict';

(function () {
  var state = {formIsOpen: false};
  var view = document.querySelector('#add-book-view');
  var logTrigger = document.querySelector('[data-name="form-trigger"]');
  var form = view.querySelector('form');
  var close = document.getElementById('close');

  function attachEvents() {
    logTrigger.addEventListener('click', showForm);
    document.body.addEventListener('keyup', handleDocumentKeyup);
    form.addEventListener('submit', handleFormSubmit);
    close.addEventListener('click', hideForm);
  }

  function showForm() {
    state.formIsOpen = true;
    view.classList.toggle('show-form', true);
  }

  function clearForm() {
    form['book-id'].value = '';
    form.address.value = '';
  }

  function hideForm() {
    view.classList.remove('show-form');
    clearForm();
    state.formIsOpen = false;
  }

  function handleDocumentKeyup(event) {
    if (state.formIsOpen && event.keyCode === 27) {
      hideForm();
    }
  }

  function formIsValid(fields) {
    return _.every(fields, function (field) {
      return field.value !== '';
    });
  }

  function extractFormValues() {
    return [
      {name: 'bookId', value: form['book-id'].value},
      {name: 'address', value: form.address.value}
    ];
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    if (!state.formIsOpen) { return; }

    var fields = extractFormValues();

    if (!formIsValid(fields)) {
      console.log('form is invalid');
      return;
    }

    hideForm();

    Backbone.trigger('book:add', _.reduce(fields, function (accum, field) {
      accum[field.name] = field.value;
      return accum;
    }, {}));
  }

  attachEvents();
})();
