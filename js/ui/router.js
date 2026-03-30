import {HomeScreen} from './screens/HomeScreen.js';
import {LearnScreen} from './screens/LearnScreen.js';
import {PracticeScreen} from './screens/PracticeScreen.js';
import {TimeLabScreen} from './screens/TimeLabScreen.js';
import {ReviewScreen} from './screens/ReviewScreen.js';

export function initRouter(app) {
  const root = app.root;
  const screens = {
    home: new HomeScreen(app),
    learn: new LearnScreen(app),
    practice: new PracticeScreen(app),
    lab: new TimeLabScreen(app),
    review: new ReviewScreen(app)
  };

  let current = null;

  const render = () => {
    let route = window.location.hash.slice(1) || '/';
    if (route === '') route = '/';
    const cleanRoute = route.split('?')[0];
    const key = cleanRoute.replace('/', '') || 'home';

    if (current && current.destroy) {
      current.destroy();
    }

    current = screens[key] || screens.home;
    current.render(root);

    document.querySelectorAll('.tab-item').forEach((link) => {
      const linkRoute = link.getAttribute('href').slice(1);
      if (linkRoute === cleanRoute || (cleanRoute === '/' && linkRoute === '')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  window.addEventListener('hashchange', render);
  render();

  return {render};
}
