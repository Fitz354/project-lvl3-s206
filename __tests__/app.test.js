import rssForm from '../src/js/rssForm';

test('not crashed', () => {
  document.body.innerHTML = `<div class="jumbotron jumbotron-fluid">
        <div class="container">
          <h1 class="display-3">RSS Reader</h1>
          <form class="rss-get-form">
            <div class="alert"></div>
            <div class="form-group">
              <label for="rss">Add RSS feed</label>
              <input type="text" class="form-control" id="rss" aria-describedby="emailHelp" placeholder="add here">
            </div>
            <button type="submit" class="btn btn-primary" disabled>Add</button>
          </form>
        </div>
      </div>`;
  rssForm();
});
