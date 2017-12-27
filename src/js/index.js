import 'babel-polyfill';
import isUrl from 'validator/lib/isURL';
import axios from 'axios';
import '../scss/style.scss';

const state = {
  rssLink: '',
  feedList: [],
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
const feedListContainer = document.querySelector('.feed-list');
const rssToJsonApiLink = 'https://api.rss2json.com/v1/api.json?rss_url=';

const renderAlert = (type) => {
  alertContainer.innerHTML = type ? alerts[type] : '';
};

const renderFeedList = (list) => {
  feedListContainer.innerHTML =
`<ul class="list-group">
  ${list.map(({ feed, items }) =>
    `<li class="list-group-item">
      <h2>${feed.title}</h2>
      <p>${feed.description}</p>
      <ul class="list-group">
        ${items.map(({ title, link }) => `<li class="list-group-item"><a href=${link}>${title}</a></li>`).join('')}
      </ul>
    </li>`).join('')}
</ul>`;
};

const onRssFieldInput = ({ target: { value } }) => {
  state.rssLink = isUrl(value) ? value : '';
  submitButton.disabled = !isUrl(value);
};

const render = (status, data) => {
  switch (status) {
    case ('ok'):
      state.feedList.push(data);
      rssGetForm.reset();
      break;
    case ('error'):
      break;
    case ('alreadyAdded'):
      rssGetForm.reset();
      break;
    default:
  }

  renderFeedList(state.feedList);
  renderAlert(status);
};

const onRssFormSubmit = async (evt) => {
  evt.preventDefault();
  submitButton.disabled = true;
  const response = await axios.get(`${rssToJsonApiLink}${state.rssLink}`);
  const { status, feed, items } = response.data;
  const loadStatus = state.feedList.find(item => feed && item.feed.url === feed.url) ? 'alreadyAdded' : status;
  render(loadStatus, { feed, items });
  submitButton.disabled = false;
};

rssGetForm.addEventListener('submit', onRssFormSubmit);
rssInputField.addEventListener('input', onRssFieldInput);
