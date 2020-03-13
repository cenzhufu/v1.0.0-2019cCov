

import Loadable from 'react-loadable';


const HomePageContainer = Loadable({
    loader: () => import('./HomePageContainer'),
    loading: () => null
  });

export default HomePageContainer;

