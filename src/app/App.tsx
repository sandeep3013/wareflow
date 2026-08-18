import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Providers } from './providers';
import { SplashScreen } from '../components/common/SplashScreen';

export function App() {
  return (
    <Providers>
      <SplashScreen>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </SplashScreen>
    </Providers>
  );
}

export default App;
