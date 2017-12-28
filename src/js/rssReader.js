import axios from 'axios';
import isUrl from 'validator/lib/isURL';
import 'bootstrap';

export default () => {
  const state = {
    rssLink: new URL('https://api.rss2json.com/v1/api.json'),
    feedsList: [],
  };

  const alerts = {
    ok: '<div class="alert alert-success" role="alert">Rss feed added!</div>',
    error: '<div class="alert alert-warning" role="alert">Rss feed is not found</div>',
    alreadyAdded: '<div class="alert alert-info" role="alert">Rss already added</div>',
  };

  const rssGetForm = document.querySelector('.rss-get-form');
  const rssInputField = rssGetForm.querySelector('#rss');
  const submitButton = rssGetForm.querySelector('[type="submit"]');
  const alertContainer = rssGetForm.querySelector('.alert');
  const feedsListContainer = document.querySelector('.feeds-list-container');
  const postDescription = document.querySelector('.post-description');

  const renderAlert = (type) => {
    alertContainer.innerHTML = type ? alerts[type] : '';
  };


  const onFeedsListClick = ({ target }) => {
    if (target.dataset.target !== '#post-description-modal') {
      return;
    }
    const feedIndex = target.closest('.feeds-item').dataset.index;
    const postIndex = target.closest('.posts-item').dataset.index;
    const { description } = state.feedsList[feedIndex].items[postIndex];

    postDescription.innerText = description;
  };

  const renderPostsList = items =>
    `<ul class="posts-list list-group">
    ${items.map(({ title, link }, index) =>
    `<li class="posts-item list-group-item" data-index=${index}>
      <a href=${link}>${title}</a>
      <button class="btn btn-primary" data-toggle="modal" data-target="#post-description-modal">more</button>
    </li>`).join('')}
    </ul>`;

  const renderFeedsList = (list) => {
    feedsListContainer.innerHTML =
  `<ul class="feeds-list list-group">
    ${list.map(({ feed, items }, index) =>
    `<li class="feeds-item list-group-item" data-index=${index}>
      <h2 class="feeds-title">${feed.title}</h2>
      <p>${feed.description}</p>
      ${renderPostsList(items)}
    </li>`).join('')}
  </ul>`;
  };

  const onRssFieldInput = ({ target: { value } }) => {
    if (!isUrl(value)) {
      submitButton.disabled = true;
      return;
    }
    if (state.feedsList.find(item => item.feed.url === value)) {
      submitButton.disabled = true;
      renderAlert('alreadyAdded');
      return;
    }
    state.rssLink.search = `rss_url=${value}`;
    submitButton.disabled = false;
  };

  const onRssFormSubmit = (evt) => {
    evt.preventDefault();
    submitButton.disabled = true;
    axios.get(state.rssLink)
      .then((response) => {
        const { status, feed, items } = response.data;

        switch (status) {
          case ('ok'):
            state.feedsList.push({ feed, items });
            rssGetForm.reset();
            break;
          case ('error'):
            break;
          default:
        }

        renderFeedsList(state.feedsList);
        renderAlert(status);
        submitButton.disabled = false;
      });
  };

  rssGetForm.addEventListener('submit', onRssFormSubmit);
  rssInputField.addEventListener('input', onRssFieldInput);
  feedsListContainer.addEventListener('click', onFeedsListClick);
};
