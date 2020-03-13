

import Loadable from 'react-loadable';


const LoginPage = Loadable({
    loader: () => import('./LoginPage'),
    loading: () => null
  });

export default LoginPage;

