import axios from 'axios';
import isUrl from 'validator/lib/isURL';
import querystring from 'querystring';
import { uniqueId } from 'lodash';
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
  const feedsListContainer = document.querySelector('.feeds-list');
  const postDescription = document.querySelector('.post-description');

  const renderAlert = (type) => {
    alertContainer.innerHTML = type ? alerts[type] : '';
  };

  const onPostItemClick = (description) => {
    postDescription.innerText = description;
  };

  const renderPostsList = (feedId, items) => {
    const feedContainer = feedsListContainer.querySelector(`[data-id="${feedId}"]>.posts-list`);
    const list = items.map(({ title, link, description }) => {
      const item = document.createElement('li');
      item.classList.add('posts-item', 'list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
      item.innerHTML = `<a href=${link}>${title}</a>`;
      const button = document.createElement('button');
      button.classList.add('btn', 'btn-primary');
      button.dataset.toggle = 'modal';
      button.dataset.target = '#post-description-modal';
      button.innerText = 'more';
      button.addEventListener('click', onPostItemClick.bind(null, description));
      item.append(button);

      return item;
    });
    feedContainer.prepend(...list);
  };

  const renderFeed = ({ feed, items }) => {
    const item = document.createElement('li');
    item.classList.add('feeds-item', 'list-group-item');
    item.innerHTML = `<h2 class="feeds-title">${feed.title}</h2><p>${feed.description}</p><ul class="posts-list list-group"></ul>`;
    item.dataset.id = feed.id;
    feedsListContainer.append(item);
    renderPostsList(feed.id, items);
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

  const executeDate = (data, link) => { // eslint-disable-line
    try {
      const { title, description, item: items } = data.query.results.rss.channel;

      return { feed: { title, description, url: link }, items };
    } catch (err) {
      renderAlert('error');
      submitButton.disabled = false;
    }
  };

  const onRssFormSubmit = (evt) => {
    evt.preventDefault();
    submitButton.disabled = true;
    const requestUrl = createYQLRequest(state.rssLink);
    axios.get(requestUrl)
      .then(
        (response) => {
          const rssFeed = executeDate(response.data, state.rssLink);
          rssFeed.feed.id = uniqueId();
          state.feedsList.push(rssFeed);
          rssGetForm.reset();
          renderFeed(rssFeed);
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
    state.feedsList.forEach((rssFeed) => {
      const lastDate = new Date(rssFeed.items[0].pubDate);
      axios.get(createYQLRequest(rssFeed.feed.url))
        .then((response) => {
          const data = executeDate(response.data, rssFeed.feed.url);
          const lastPosts = data.items.filter(({ pubDate }) => new Date(pubDate) > lastDate);

          if (lastPosts.length === 0) {
            return;
          }
          rssFeed.items.unshift(...lastPosts);
          renderPostsList(rssFeed.feed.id, lastPosts);
        });
    });
  }, 5000);

  rssGetForm.addEventListener('submit', onRssFormSubmit);
  rssInputField.addEventListener('input', onRssFieldInput);
};
