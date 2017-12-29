import axios from 'axios';
import isUrl from 'validator/lib/isURL';
import querystring from 'querystring';
import 'bootstrap';

export default () => {
  const state = {
    rssLink: '',
    feedsList: [],
  };

  const alerts = {
    success: '<div class="alert alert-success" role="alert">Rss feed added!</div>',
    error: '<div class="alert alert-warning" role="alert">Rss feed is not found</div>',
    alreadyAdded: '<div class="alert alert-info" role="alert">Rss already added</div>',
  };

  const createYQLRequest = (url) => {
    const yql = new URL('https://query.yahooapis.com/v1/public/yql');
    const randomSearch = Math.random();
    const searchParams = {
      q: `select * from feednormalizer where url='${url}?key=${randomSearch}'`,
      env: 'store://datatables.org/alltableswithkeys',
      format: 'json',
      diagnostic: false,
      maxage: 300,
    };
    yql.search = querystring.stringify(searchParams);
    return yql;
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
    `<li class="posts-item list-group-item d-flex justify-content-between align-items-center" data-index=${index}>
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
    state.rssLink = value;
    submitButton.disabled = false;
  };

  const executeDate = (data, link) => {
    const { title, description, item: items } = data.query.results.rss.channel;

    return { feed: { title, description, url: link }, items };
  };

  const onRssFormSubmit = (evt) => {
    evt.preventDefault();
    submitButton.disabled = true;
    const requestUrl = createYQLRequest(state.rssLink);
    axios.get(requestUrl)
      .then(
        (response) => {
          const feed = executeDate(response.data, state.rssLink);
          state.feedsList.push(feed);
          rssGetForm.reset();
          renderFeedsList(state.feedsList);
          renderAlert('success');
          submitButton.disabled = false;
        },
        () => {
          renderAlert('error');
          submitButton.disabled = false;
        },
      );
  };

  setInterval(() => {
    state.feedsList.forEach(({ items, feed }) => {
      const lastDate = new Date(items[0].pubDate);
      axios.get(createYQLRequest(feed.url))
        .then((response) => {
          const data = executeDate(response.data, feed.url);
          const lastPosts = data.items.filter(({ pubDate }) => new Date(pubDate) > lastDate);

          if (lastPosts.length === 0) {
            return;
          }
          items.unshift(...lastPosts);
          renderFeedsList(state.feedsList);
        });
    });
  }, 5000);

  rssGetForm.addEventListener('submit', onRssFormSubmit);
  rssInputField.addEventListener('input', onRssFieldInput);
  feedsListContainer.addEventListener('click', onFeedsListClick);
};
